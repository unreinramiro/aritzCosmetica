using Aritz.Server.Data;
using Aritz.Server.Models;
using Aritz.Server.Services;
using MercadoPago.Client.Payment;
using MercadoPago.Client.Preference;
using MercadoPago.Config;
using MercadoPago.Error;
using MercadoPago.Resource.Preference;
using MercadoPago.Resource.User;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Aritz.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MercadoPagoController : ControllerBase
    {
        private readonly AritzDbContext _context;

        private readonly ICouponService _coupons;

        private readonly IEmailService _emailService;

        public MercadoPagoController(AritzDbContext context, ICouponService coupons, IEmailService emailService)
        {
            _context = context;
            _coupons = coupons;
            _emailService = emailService;
        }

        [HttpPost("create_preference")]
        public async Task<IActionResult> CreatePreference([FromBody] OrderDto orderData)
        {
            if (!this.IsOwner(orderData.userId)) return Forbid();

            var client = await _context.Users.FindAsync(orderData.userId);
            if (client == null) return BadRequest("Usuario invalido");

            var cart = await _context.Carts
                .Include(c => c.Items)
                .FirstOrDefaultAsync(c => c.CAR_USR_ID == orderData.userId);
            if (cart == null) return BadRequest("Carrito vacio");

            if (!int.TryParse(client.USR_POSTAL_CODE, out int postalCode)) return BadRequest("Completá un código postal válido en tu cuenta."); // Primero parseo a entero para poder buscar en la base
            var zone = await _context.ShippingZones
                .FirstOrDefaultAsync(z => postalCode >= z.MinZipCode && postalCode <= z.MaxZipCode);
            decimal shippingPrice = zone?.Price ?? 10000; // Si encuentra zona le asigna el precio establecido, sino le pone el por default (10000) 

            try
            {
                decimal subtotal = 0;

                if (cart.Items == null || !cart.Items.Any()) return BadRequest("Carrito vacío");

                var newOrder = new Orders
                {
                    ORD_USR_ID = orderData.userId,
                    ORD_ORDER_DATE = DateTime.UtcNow,
                    ORD_STATUS = "Iniciada",
                    ORD_PMT_ID = orderData.paymentMethod,
                    ORD_ZIP_CODE = client.USR_POSTAL_CODE,
                    ORD_SHIPPING_AMOUNT = shippingPrice
                };

                foreach (var carItem in cart.Items)
                {
                    if (carItem.CAI_QUANTITY <= 0)
                        return BadRequest("Cantidad inválida en el carrito.");

                    // Buscamos el producto
                    var product = await _context.Products.FindAsync(carItem.CAI_PRD_ID);

                    if (product == null)
                    {
                        // Rollback manual no es necesario si lanzamos excepción o return, 
                        return BadRequest($"El producto con ID {carItem.CAI_PRD_ID} no existe.");
                    }

                    // VALIDAR STOCK DISPONIBLE
                    if (product.PRD_QUANTITY < carItem.CAI_QUANTITY)
                    {
                        return BadRequest($"Stock insuficiente para el producto: {product.PRD_NAME}. Stock actual: {product.PRD_QUANTITY}");
                    }

                    var lineTotal = product.PRD_PRICE * carItem.CAI_QUANTITY;
                    subtotal += lineTotal;

                    newOrder.OrderDetails.Add(new OrderDetails
                    {
                        ODD_PRD_ID = product.PRD_ID,
                        ODD_QUANTITY = carItem.CAI_QUANTITY,
                        ODD_TOTAL_PRICE = lineTotal
                    });

                    // Restamos el stock en Products
                    product.PRD_QUANTITY -= carItem.CAI_QUANTITY;
                    if (product.PRD_QUANTITY <= 0) product.PRD_IS_ACTIVE = false; //Si no hay del producto que ponga que el mismo no esta disponible en la bd

                    _context.Products.Update(product);

                }

                // Validamos si tiene cupon
                var res = await _coupons.CheckCouponAsync(orderData.code, subtotal);
                if (!res.Valid) return BadRequest(res.Error); // Si el cupon no es valido devuelve el error
                if (res.Coupon != null) res.Coupon.DIS_USED_COUNT++; // Si el cupon es valido se suma al uso

                var total = subtotal - res.Discount + shippingPrice;

                newOrder.ORD_TOTAL_AMOUNT = total;
                newOrder.ORD_DISCOUNT_AMOUNT = res.Discount;
                newOrder.ORD_DIS_ID = res.Coupon.DIS_ID;

                _context.Orders.Add(newOrder);
                await _context.SaveChangesAsync();

                var payerEmail = client.USR_EMAIL;

                if (string.IsNullOrEmpty(payerEmail))
                {
                    payerEmail = "customer_test@generic.com";
                }

                // 1. Crear el cliente de preferencias
                var request = new PreferenceRequest
                {
                    ExternalReference = newOrder.ORD_ID.ToString(),

                    Items = new List<PreferenceItemRequest>(),
                    Payer = new PreferencePayerRequest
                    {
                        Email = payerEmail   // Puedes pasar el email real del usuario si lo tienes
                    },
                    BackUrls = new PreferenceBackUrlsRequest
                    {
                        Success = "https://www.aritz.com.ar/checkout/pay-success", // Ajusta a tu URL real
                        Failure = "https://www.aritz.com.ar/checkout/pay-failure",
                        Pending = "https://www.aritz.com.ar/checkout/pay-pending"
                    },
                    AutoReturn = "approved",

                    NotificationUrl = "https://api.aritz.com.ar/api/MercadoPago/webhook"
                };

                request.Items.Add(new PreferenceItemRequest
                {
                    Title = "Compra en Aritz - Orden #" + newOrder.ORD_ID,
                    Quantity = 1,
                    CurrencyId = "ARS",
                    UnitPrice = total
                });


                // 3. Generar la preferencia
                var prefClient = new PreferenceClient();
                Preference preference = await prefClient.CreateAsync(request);

                // 4. Devolver el ID al frontend
                return Ok(new { preferenceId = preference.Id });
            }
            catch (MercadoPagoApiException mpEx)
            {
                // Aquí está la verdad de la milanesa
                Console.WriteLine($"Error de MercadoPago: {mpEx.Message}");
                Console.WriteLine($"Status Code: {mpEx.StatusCode}");

                if (mpEx.ApiError != null)
                {
                    Console.WriteLine($"Error Detallado: {mpEx.ApiError.Message}");
                }

                return BadRequest(new { Error = mpEx.ApiError?.Message ?? "Error desconocido de MP" });
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
                return StatusCode(500, "Error al crear preferencia de MP");
            }
        }

        [AllowAnonymous]
        [HttpPost("webhook")]
        public async Task<IActionResult> Webhook(
            [FromQuery(Name = "data.id")] string? dataId,
            [FromQuery] string? type)
        {
            if (type != "payment" || !long.TryParse(dataId, out var paymentId))
                return Ok();

            try
            {
                // Se consulta el pago a MercadoPago con tu Access Token:
                // lo que mande el request no se usa como dato confiable
                var payment = await new PaymentClient().GetAsync(paymentId);

                if (payment.Status != "approved" ||
                    !int.TryParse(payment.ExternalReference, out var orderId))
                    return Ok();

                var order = await _context.Orders.FindAsync(orderId);
                if (order == null || order.ORD_STATUS != "Iniciada") return Ok(); // idempotente

                if (payment.TransactionAmount is null || order.ORD_TOTAL_AMOUNT is null ||
                    payment.TransactionAmount != order.ORD_TOTAL_AMOUNT)
                {
                    Console.WriteLine($"Monto no coincide en la orden {orderId}");
                    return Ok();
                }

                var client = await _context.Users.FindAsync(order.ORD_USR_ID);

                order.ORD_STATUS = "Pendiente";
                await _context.SaveChangesAsync();

                try
                {
                    var body = new System.Text.StringBuilder();
                    body.AppendLine($"<h2>¡Su orden NRO #{order.ORD_ID} se generó correctamente!</h2>");
                    body.AppendLine($"<h3>Clickea <strong><a href='https://www.aritz.com.ar/user/my-requests/my-order/{order.ORD_ID}'>acá</a></strong> para ver el estado del pedido</h3>");
                    body.AppendLine("<footer><strong><span>©</span> Aritz. All Rights Reserved.</strong></footer>");

                    await _emailService.SendEmailAsync(client.USR_EMAIL, "¡Muchas gracias por su Compra!", body.ToString());
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Error enviando mail de la orden {orderId}: {ex.Message}");
                }

                return Ok();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error en webhook MP: {ex.Message}");
                return StatusCode(500); // MercadoPago reintenta
            }
        }

        public class OrderDto
        {
            public int userId { get; set; }
            public int paymentMethod { get; set; }
            public string? code { get; set; }
        }

        public class OrderItemDto
        {
            public int ProductId { get; set; }
            public string ProductName { get; set; } = string.Empty;
            public int Quantity { get; set; }
            public decimal UnitPrice { get; set; }
        }
    }
}