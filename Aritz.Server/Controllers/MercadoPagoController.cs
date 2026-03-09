using Aritz.Server.Data;
using Aritz.Server.Models;
using MercadoPago.Client.Payment;
using MercadoPago.Client.Preference;
using MercadoPago.Config;
using MercadoPago.Error;
using MercadoPago.Resource.Preference;
using Microsoft.AspNetCore.Mvc;

namespace Aritz.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MercadoPagoController : ControllerBase
    {
        private readonly AritzDbContext _context;

        public MercadoPagoController(AritzDbContext context)
        {
            _context = context;
        }

        [HttpPost("create_preference")]
        public async Task<IActionResult> CreatePreference([FromBody] OrderDto orderData)
        {
            if (orderData.totalSumCart <= 0)
                return BadRequest("El monto total debe ser mayor a 0.");

            if (orderData.userId <= 0)
                return BadRequest("Usuario inválido.");

            try
            {
                //// Logica para obtener el mail del usuario con userId
                var user = await _context.Users.FindAsync(orderData.userId);
                if (user == null)
                {
                    return BadRequest("Usuario no encontrado");
                }

                var newOrder = new Orders
                {
                    ORD_USR_ID = orderData.userId,
                    ORD_ORDER_DATE = DateTime.UtcNow,
                    ORD_TOTAL_AMOUNT = orderData.totalSumCart + orderData.zipPrice, // Total con envío
                    ORD_STATUS = "Iniciada",
                    ORD_PMT_ID = orderData.paymentMethod,
                    ORD_ZIP_CODE = orderData.ZipCode
                };

                _context.Orders.Add(newOrder);
                await _context.SaveChangesAsync();

                foreach (var item in orderData.Items)
                {

                    var detail = new OrderDetails {
                        ODD_ORD_ID = newOrder.ORD_ID,
                        ODD_PRD_ID = item.ProductId, 
                        ODD_QUANTITY = item.Quantity,
                        ODD_TOTAL_PRICE = item.UnitPrice * item.Quantity
                    };
                    _context.OrderDetails.Add(detail);

                }
                await _context.SaveChangesAsync();

                var payerEmail = user.USR_EMAIL;

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
                };

                decimal finalPrice = orderData.totalSumCart + orderData.zipPrice;

                request.Items.Add(new PreferenceItemRequest
                {
                    Title = "Compra en Aritz - Orden #" + newOrder.ORD_ID,
                    Quantity = 1,
                    CurrencyId = "ARS",
                    UnitPrice = finalPrice
                });


                // 3. Generar la preferencia
                var client = new PreferenceClient();
                Preference preference = await client.CreateAsync(request);

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

        public class OrderDto
        {
            public int userId { get; set; }
            public decimal totalSumCart { get; set; }
            public string? Status { get; set; }
            public int paymentMethod { get; set; }
            public List<OrderItemDto> Items { get; set; } = new();
            public decimal zipPrice { get; set; }
            public string ZipCode { get; set; }
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