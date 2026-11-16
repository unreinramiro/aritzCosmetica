using Aritz.Server.Data;
using Aritz.Server.Models;
using Aritz.Server.Services;
using MercadoPago.Resource.User;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Internal;
using Microsoft.Extensions.Configuration;
using Org.BouncyCastle.Asn1.X500;
using Org.BouncyCastle.Ocsp;
using System.Reflection.Emit;
using static Org.BouncyCastle.Crypto.Engines.SM2Engine;

namespace Aritz.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class OrderController : ControllerBase
    {
        private readonly AritzDbContext _context;
        private readonly IEmailService _emailService;
        private readonly IConfiguration _configuration;
        private readonly ICouponService _coupons;

        public OrderController(AritzDbContext context, IEmailService emailService, IConfiguration configuration, ICouponService coupons)
        {
            _context = context;
            _emailService = emailService;
            _configuration = configuration;
            _coupons = coupons;
        }

        [HttpPost("confirmOrder")]
        public async Task<IActionResult> Order([FromBody] OrderDto dto)
        {
            if (!this.IsOwner(dto.userId)) return Forbid();

            var paymentMethod = await _context.PaymentMethods.FindAsync(dto.paymentMethod);
            if (paymentMethod == null) return NotFound(new { Message = "El método de pago no existe." });

            var client = await _context.Users.FindAsync(dto.userId);
            if (client == null) return BadRequest("Usuario no encontrado");

            var cart = await _context.Carts
                .Include(c => c.Items)
                .FirstOrDefaultAsync(c => c.CAR_USR_ID == dto.userId);
            if (cart == null) return BadRequest("Carrito vacio");


            if (!int.TryParse(client.USR_POSTAL_CODE, out int postalCode)) return BadRequest("Completá un código postal válido en tu cuenta."); // Primero parseo a entero para poder buscar en la base
            var zone = await _context.ShippingZones
                .FirstOrDefaultAsync(z => postalCode >= z.MinZipCode && postalCode <= z.MaxZipCode);
            decimal shippingPrice = zone?.Price ?? 10000; // Si encuentra zona le asigna el precio establecido, sino le pone el por default (10000)


            try
            {
                    decimal subtotal = 0;


                    if (cart.Items == null || !cart.Items.Any()) return BadRequest("Carrito vacío");

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

                        subtotal += product.PRD_PRICE * carItem.CAI_QUANTITY;

                        // Restamos el stock en Products
                        product.PRD_QUANTITY -= carItem.CAI_QUANTITY;
                        if (product.PRD_QUANTITY <= 0) product.PRD_IS_ACTIVE = false; //Si no hay del producto que ponga que el mismo no esta disponible en la bd

                        _context.Products.Update(product);
                    }
                
                // Validamos si tiene cupon
                var res = await _coupons.CheckCouponAsync(dto.code, subtotal);
                if (!res.Valid) return BadRequest(res.Error); // Si el cupon no es valido devuelve el error
                if (res.Coupon != null) res.Coupon.DIS_USED_COUNT++; // Si el cupon es valido se suma al uso

                var total = subtotal - res.Discount + shippingPrice;

                var newOrder = new Orders
                {
                    ORD_USR_ID = dto.userId,
                    ORD_ORDER_DATE = DateTime.UtcNow,
                    ORD_TOTAL_AMOUNT = total,
                    ORD_STATUS = "Pendiente",
                    ORD_PMT_ID = dto.paymentMethod,
                    ORD_ZIP_CODE = client.USR_POSTAL_CODE,
                    ORD_DISCOUNT_AMOUNT = res.Discount,
                    ORD_DIS_ID = res.Coupon?.DIS_ID,
                    ORD_SHIPPING_AMOUNT = shippingPrice
                };

                // 5. Guardar Orden y Cambios de Stock
                _context.Add(newOrder);

                // Guardamos todo junto (Orden + Updates de Productos)
                await _context.SaveChangesAsync();

                // 6. Enviar Email al Admin
                var emailBodyBuilder = new System.Text.StringBuilder();
                emailBodyBuilder.AppendLine($"<h2>Nueva Orden de Compra #{newOrder.ORD_ID}</h2>");
                emailBodyBuilder.AppendLine($"<p><strong>Cliente:</strong> {client.USR_NAME} {client.USR_SURNAME} ({client.USR_EMAIL})</p>");
                emailBodyBuilder.AppendLine($"<h3>Total: ${total}</h3>");

                var adminEmail = _configuration["EmailSettings:SenderEmail"];

                _ = _emailService.SendEmailAsync(
                    adminEmail,
                    $"Te hicieron una Nueva Orden de Compra #{newOrder.ORD_ID}",
                    emailBodyBuilder.ToString()
                );

                // 7. Enviar Email al comprador
                var userEmailBodyBuilder = new System.Text.StringBuilder();
                userEmailBodyBuilder.AppendLine($"<h2>¡Su orden NRO #{newOrder.ORD_ID} se generó correctamente!</h2>");
                userEmailBodyBuilder.AppendLine($"<h3>IMPORTANTE: Recordá cargar el comprobante de pago dentro de las próximas 48 hs, de lo contrario se cancelará</h3>");
                userEmailBodyBuilder.AppendLine($"<h3>Clickea <strong><a href='https://www.aritz.com.ar/user/my-requests/my-order/{newOrder.ORD_ID}'>acá</a></strong> para ver el estado del pedido y subir el comprobante</h3>");

                var userEmail = client.USR_EMAIL;

                _ = _emailService.SendEmailAsync(
                    userEmail,
                    $"¡Muchas gracias por su Compra!",
                    userEmailBodyBuilder.ToString()
                );

                return Ok(new { Message = "Pedido creado correctamente.", OrderId = newOrder.ORD_ID });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error al crear la orden: {ex.Message}");
                return StatusCode(500, new { Message = "Error interno al procesar la orden." });
            }
        }

        [HttpPost("confirmOrderDetail")]
        public async Task<IActionResult> OrderDetail([FromBody] OrderDetailDto dto)
        {
            if (!this.IsOwner(dto.userId)) return Forbid();
            var order = await _context.Orders.FindAsync(dto.OrderId);
            if (order == null)
            {
                return NotFound();
            }

            // Obtener el carrito del usuario
            var cart = await _context.Carts
                .Include(c => c.Items)
                .ThenInclude(i => i.Product)
                .FirstOrDefaultAsync(c => c.CAR_USR_ID == dto.userId);
            if (cart == null || !cart.Items.Any())
            {
                Console.WriteLine($"Carrito vacío para el usuario {dto.userId}.");
                return NotFound(new { Message = "El carrito está vacío." });
            }

            if (order == null || order.ORD_USR_ID != dto.userId) return NotFound();

            try
            {
                var orderDetails = cart.Items.Select(i => new OrderDetails
                {
                    ODD_ORD_ID = dto.OrderId,
                    ODD_PRD_ID = i.CAI_PRD_ID,
                    ODD_QUANTITY = i.CAI_QUANTITY,
                    ODD_TOTAL_PRICE = i.Product.PRD_PRICE * i.CAI_QUANTITY,
                    ODD_UNIT_PRICE = i.Product.PRD_PRICE
                }).ToList();

                _context.OrderDetails.AddRange(orderDetails);
                _context.CartItems.RemoveRange(cart.Items); // Limpiar el carrito
                await _context.SaveChangesAsync();

                return Ok("Se inserto en la Order Details correctamente");
            }
            catch (Exception)
            {
                return StatusCode(500, "No se pudo insertar la orden.");
            }

        }

        [HttpGet("{userId}")]
        public async Task<IActionResult> GetOrders(int userId)
        {

            if (!this.IsOwnerOrAdmin(userId)) return Forbid();
            var user = await _context.Users.FindAsync(userId);
            if (user == null)
            {
                Console.WriteLine($"Usuario con ID {userId} no encontrado.");
                return NotFound(new { Message = "El usuario no existe." });
            }

            var orders = await _context.Orders
                    .Where(o => o.ORD_USR_ID == userId)
                    .Where(o => o.ORD_STATUS != "Iniciada")
                    .Include(o => o.PaymentMethod)
                    .Include(o => o.OrderDetails)
                    .ThenInclude(d => d.Products)
                    .GroupJoin(_context.Receipts,
                        o => o.ORD_ID,
                        r => r.RCP_ORD_ID,
                        (o, receipts) => new
                        {
                            o.ORD_ID,
                            o.ORD_ORDER_DATE,
                            o.ORD_TOTAL_AMOUNT,
                            o.ORD_STATUS,
                            PaymentMethod = o.PaymentMethod.PMT_NAME,
                            ReceiptPath = receipts.FirstOrDefault() != null ? receipts.FirstOrDefault().RCP_PATH : null
                        })
                    .ToListAsync();

                return Ok(orders);
        }

        [HttpGet("requestDetail/{orderId}")]
        public async Task<IActionResult> GetOrderById(int orderId)
        {
            var order = await _context.Orders.FindAsync(orderId);
            if (order == null)
            {
                Console.WriteLine($"No existe la orden nro {orderId}");
                return NotFound(new { Message = "La orden no existe." });
            }
            if (!this.IsOwnerOrAdmin(order.ORD_USR_ID)) return Forbid();

            var orderDetail = await _context.OrderDetails
                .Where(o => o.ODD_ORD_ID == orderId)
                .Include(o => o.Products)
                    .ThenInclude(p => p.Category)
                .Include(o => o.Orders)
                    .ThenInclude(o => o.Receipt)
                .Select(od => new
                {
                    IdOrder = od.ODD_ORD_ID,
                    IdOrderDetail = od.ODD_ID,
                    Quantity = od.ODD_QUANTITY,
                    TotalPrice = od.ODD_TOTAL_PRICE,
                    UnitPrice = od.ODD_UNIT_PRICE,
                    ZipCode = od.Orders.ORD_ZIP_CODE,
                    ProductName = od.Products.PRD_NAME,
                    ProductImage = od.Products.PRD_IMAGE,
                    ReceiptPath = od.Orders.Receipt.RCP_PATH,
                    OrderTotalAmount = od.Orders.ORD_TOTAL_AMOUNT,
                    OrderStatus = od.Orders.ORD_STATUS,
                    CategoryName = od.Products.Category.CAT_NAME,
                    DiscountAmount = od.Orders.ORD_DISCOUNT_AMOUNT,
                    ShippingPrice = od.Orders.ORD_SHIPPING_AMOUNT
                })
                .ToListAsync();

            Console.WriteLine(orderDetail);
            return Ok(orderDetail);
        }

        [Authorize(Policy = "Admin")]
        [HttpGet("allOrders")]
        public async Task<IActionResult> GetAllOrders()
        {

            var orders = await _context.Orders
                    .Include(o => o.PaymentMethod)
                    .Include(o => o.OrderDetails)
                    .Include(o => o.Users)
                    .GroupJoin(_context.Receipts,
                        o => o.ORD_ID,
                        r => r.RCP_ORD_ID,
                        (o, receipts) => new
                        {
                            o.ORD_ID,
                            o.ORD_ORDER_DATE,
                            o.ORD_TOTAL_AMOUNT,
                            o.ORD_STATUS,
                            PaymentMethod = o.PaymentMethod.PMT_NAME,
                            ReceiptPath = receipts.FirstOrDefault() != null ? receipts.FirstOrDefault().RCP_PATH : null,
                            ClientFullName = o.Users.USR_NAME + " " + o.Users.USR_SURNAME
                        })
                    .ToListAsync();

            return Ok(orders);
        }

        [HttpPost("{orderId}/upload-receipt")]
        public async Task<IActionResult> UploadReceipt(int orderId, IFormFile file)
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest(new { Message = "No se proporcionó un archivo válido." });
            }

            // Verificar si la orden existe
            var order = await _context.Orders.FindAsync(orderId);
            if (order == null)
            {
                return NotFound(new {Message = "La orden no existe." });
            }
            if (!this.IsOwnerOrAdmin(order.ORD_USR_ID)) return Forbid();
            // Validar tipo de archivo
            var allowedExtensions = new[] { ".pdf", ".jpg", ".jpeg", ".png" };
                var extension = Path.GetExtension(file.FileName).ToLower();
                if (!allowedExtensions.Contains(extension))
                {
                    return BadRequest(new { Message = "Formato de archivo no permitido. Usa PDF, JPG o PNG." });
                }

                // Definir la ruta donde se guardará el archivo
                var fileName = $"receipt_{orderId}_{Guid.NewGuid()}{extension}";
                var filePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot/uploads/receipts", fileName);

                // Crear directorio si no existe
                Directory.CreateDirectory(Path.GetDirectoryName(filePath));

                // Guardar el archivo
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                // Verificar si ya existe un comprobante para esta orden
                var existingReceipt = await _context.Receipts.FirstOrDefaultAsync(r => r.RCP_ORD_ID == orderId);
                if (existingReceipt != null)
                {
                    // Actualizar el comprobante existente
                    existingReceipt.RCP_PATH = $"/uploads/receipts/{fileName}";
                    existingReceipt.RCP_UPLOAD_DATE = DateTime.Now;
                }
                else
                {
                    // Crear un nuevo registro en Receipts
                    var receipt = new Receipts
                    {
                        RCP_ORD_ID = orderId,
                        RCP_PATH = $"/uploads/receipts/{fileName}",
                        RCP_UPLOAD_DATE = DateTime.Now
                    };
                    _context.Receipts.Add(receipt);
                }

                await _context.SaveChangesAsync();

            var user = await _context.Users.FindAsync(order.ORD_USR_ID);

            try
            {
                var baseUrl = $"{Request.Scheme}://{Request.Host}";
                var downloadLink = $"{baseUrl}/api/Order/{orderId}/download-receipt";

                var emailBodyBuilder = new System.Text.StringBuilder();
                emailBodyBuilder.AppendLine($"<h2>{user.USR_NAME} {user.USR_SURNAME} Subio el comprobante de pago para la orden #{order.ORD_ID}!</h2>");
                emailBodyBuilder.AppendLine($"<p><strong>Fecha de subida del comprobante:</strong> {DateTime.Now}</p>");
                emailBodyBuilder.AppendLine($"<p><strong>Nro de orden:</strong> {order.ORD_ID}</p>");
                emailBodyBuilder.AppendLine($"<p>Descargar el comprobante aca: <strong><a href='{downloadLink}'>aca</a></strong></p>");
                emailBodyBuilder.AppendLine("<hr>");
                emailBodyBuilder.AppendLine($"<h3>Monto total de la orden: ${order.ORD_TOTAL_AMOUNT}</h3>");

                var adminEmail = _configuration["EmailSettings:SenderEmail"];

                _ = _emailService.SendEmailAsync(
                    adminEmail,
                    $"Subieron el comprobante de una compra! #{order.ORD_ID}",
                    emailBodyBuilder.ToString()
                );

            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error al crear la orden: {ex.Message}");
                return StatusCode(500, new { Message = "Error al crear la orden." });
            }

            return Ok(new { Message = "Comprobante subido exitosamente.", ReceiptPath = $"/uploads/receipts/{fileName}" });
            }

        [HttpGet("{orderId}/download-receipt")]
        public async Task<IActionResult> DownloadReceipt(int orderId)
        {
            // Buscar el comprobante en la tabla Receipts
            var receipt = await _context.Receipts.FirstOrDefaultAsync(r => r.RCP_ORD_ID == orderId);
            if (receipt == null || string.IsNullOrEmpty(receipt.RCP_PATH))
            {
                return NotFound(new { Message = "No se encontró un comprobante para esta orden." });
            }

            // Obtener la ruta física del archivo
            var filePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", receipt.RCP_PATH.TrimStart('/'));
            if (!System.IO.File.Exists(filePath))
            {
                return NotFound(new { Message = "El archivo no existe en el servidor." });
            }

            // Leer el archivo
            var fileBytes = await System.IO.File.ReadAllBytesAsync(filePath);
            var fileName = Path.GetFileName(filePath);

            // Determinar el tipo MIME del archivo
            var mimeType = Path.GetExtension(fileName).ToLower() switch
            {
                ".pdf" => "application/pdf",
                ".jpg" => "image/jpeg",
                ".jpeg" => "image/jpeg",
                ".png" => "image/png",
                _ => "application/octet-stream"
            };

            // Enviar el archivo con Content-Disposition: attachment
            return File(fileBytes, mimeType, fileName);
        }

        private static readonly string[] ValidStatuses =
            { "Iniciada", "Pendiente", "En curso", "Finalizado", "Cancelado" };

        [HttpPut("{orderId}/updOrdStatus")]
        public async Task<IActionResult> UpdOrdStatus(int orderId, [FromBody] OrderStatusDto dto)
        {
            var order = await _context.Orders
                .Include(o => o.OrderDetails)
                .FirstOrDefaultAsync(o => o.ORD_ID == orderId);
            if (order == null)
                return NotFound(new { Message = "No se encontró la orden de compra." });

            if (!ValidStatuses.Contains(dto.OrderStatus))
                return BadRequest(new { Message = "Estado inválido." });

            if (order.ORD_STATUS == "Cancelado")
                return BadRequest(new { Message = "La orden está cancelada y no puede modificarse." });

            var isAdmin = User.IsInRole("Admin");

            if (!isAdmin)
            {
                // Un cliente solo puede cancelar su propia orden, y solo si está iniciada o pendiente
                if (!this.IsOwner(order.ORD_USR_ID)) return Forbid();
                if (dto.OrderStatus != "Cancelado") return Forbid();
                if (order.ORD_STATUS != "Iniciada" && order.ORD_STATUS != "Pendiente")
                    return BadRequest(new { Message = "Solo podés cancelar pedidos iniciados o pendientes." });
            }

            var cancelledByUser = !isAdmin; // en esta rama el cliente solo puede estar cancelando

            // Al cancelar, devolvemos el stock que se descontó al crear la orden
            if (dto.OrderStatus == "Cancelado")
            {
                var ids = order.OrderDetails.Select(d => d.ODD_PRD_ID).ToList();
                var products = await _context.Products
                    .Where(p => ids.Contains(p.PRD_ID))
                    .ToListAsync();

                foreach (var d in order.OrderDetails)
                {
                    var p = products.FirstOrDefault(x => x.PRD_ID == d.ODD_PRD_ID);
                    if (p == null) continue;
                    if (p.PRD_QUANTITY <= 0) p.PRD_IS_ACTIVE = true; // se había desactivado por falta de stock
                    p.PRD_QUANTITY += d.ODD_QUANTITY;
                }
            }

            order.ORD_STATUS = dto.OrderStatus;

            try
            {
                await _context.SaveChangesAsync(); // estado + stock en una transacción
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error al actualizar la orden {orderId}: {ex.Message}");
                return StatusCode(500, new { Message = "Error al actualizar el estado." });
            }

            var user = await _context.Users.FirstOrDefaultAsync(u => u.USR_ID == order.ORD_USR_ID);
            if (user != null)
            {

                if (cancelledByUser)
                {
                    var body = new System.Text.StringBuilder();
                    body.AppendLine($"<h3>Cancelaron la compra #{order.ORD_ID}</h3>");
                    body.AppendLine($"<p>El cliente {user.USR_NAME} {user.USR_SURNAME} canceló la compra.</p>");
                    body.AppendLine("<footer><strong><span>©</span> Aritz. All Rights Reserved.</strong></footer>");

                    _ = _emailService.SendEmailAsync(
                        _configuration["EmailSettings:SenderEmail"],
                        $"Cancelaron la orden #{order.ORD_ID}",
                        body.ToString());
                }
                else
                {
                    var body = new System.Text.StringBuilder();
                    body.AppendLine($"<h3>Estado de tu orden #{order.ORD_ID}</h3>");
                    body.AppendLine($"<p><strong>Estado:</strong> El estado de tu pedido pasó a {dto.OrderStatus}</p>");
                    body.AppendLine("<footer><strong><span>©</span> Aritz. All Rights Reserved.</strong></footer>");

                    _ = _emailService.SendEmailAsync(
                        user.USR_EMAIL,
                        $"Avances en tu pedido #{order.ORD_ID}",
                        body.ToString());
                }
            }

            return Ok(new { Message = "Estado actualizado correctamente" });
        }
        public class OrderDto
        {
            public int userId { get; set; }
            public int paymentMethod { get; set; }
            public string code { get; set; }
        }

        public class OrderDetailDto
        {
            public int userId { get; set; }
            public int OrderId { get; set; }
        }

        public class OrderStatusDto
        {
            public int OrderId { get; set; }
            public string OrderStatus { get; set; }
            public bool CancelOrderByUser { get; set; }
        }
    }
}
