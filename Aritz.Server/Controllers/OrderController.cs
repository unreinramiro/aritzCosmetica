using Aritz.Server.Data;
using Aritz.Server.Models;
using Aritz.Server.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Internal;
using Microsoft.Extensions.Configuration;
using Org.BouncyCastle.Asn1.X500;

namespace Aritz.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class OrderController : ControllerBase
    {
        private readonly AritzDbContext _context;
        private readonly IEmailService _emailService;
        private readonly IConfiguration _configuration;

        public OrderController(AritzDbContext context, IEmailService emailService, IConfiguration configuration)
        {
            _context = context;
            _emailService = emailService;
            _configuration = configuration;
        }

        [HttpPost("confirmOrder")]
        public async Task<IActionResult> Order([FromBody] OrderDto dto)
        {

            var paymentMethod = await _context.PaymentMethods.FindAsync(dto.paymentMethod);
            if (paymentMethod == null) return NotFound(new { Message = "El método de pago no existe." });

            var client = await _context.Users.FindAsync(dto.userId);
            if (client == null) return BadRequest("Usuario no encontrado");


                try
                {

                    var newOrder = new Orders
                    {
                        ORD_USR_ID = dto.userId,
                        ORD_ORDER_DATE = DateTime.UtcNow,
                        ORD_TOTAL_AMOUNT = dto.totalSumCart,
                        ORD_STATUS = "Pendiente",
                        ORD_PMT_ID = dto.paymentMethod
                    };


                    foreach (var carItem in dto.CartItems)
                    {
                        // Buscamos el producto
                        var product = await _context.Products.FindAsync(carItem.CAI_PRD_ID);

                        if (product == null)
                        {
                            // Rollback manual no es necesario si lanzamos excepción o return, 
                            // pero por limpieza retornamos error.
                            return BadRequest($"El producto con ID {carItem.CAI_PRD_ID} no existe.");
                        }

                        // VALIDAR STOCK DISPONIBLE
                        if (product.PRD_QUANTITY < carItem.CAI_QUANTITY)
                        {
                            // CORRECCIÓN IMPORTANTE: Agregamos 'return'
                            return BadRequest($"Stock insuficiente para el producto: {product.PRD_NAME}. Stock actual: {product.PRD_QUANTITY}");
                        }

                        // Restamos
                        product.PRD_QUANTITY -= carItem.CAI_QUANTITY;
                        _context.Products.Update(product);
                    }

                    // 5. Guardar Orden y Cambios de Stock
                    _context.Add(newOrder);

                    // Guardamos todo junto (Orden + Updates de Productos)
                    await _context.SaveChangesAsync();

                    // 6. Enviar Email (Fuera de la transacción critica)
                    var emailBodyBuilder = new System.Text.StringBuilder();
                    emailBodyBuilder.AppendLine($"<h2>Nueva Orden de Compra #{newOrder.ORD_ID}</h2>");
                    emailBodyBuilder.AppendLine($"<p><strong>Cliente:</strong> {client.USR_NAME} {client.USR_SURNAME} ({client.USR_EMAIL})</p>");
                    emailBodyBuilder.AppendLine($"<p>Clickea <strong><a href='https://localhost:50833/user/my-requests/my-order/{newOrder.ORD_ID}'>acá</a></strong> para ir al pedido</p>");
                    emailBodyBuilder.AppendLine($"<h3>Total: ${dto.totalSumCart}</h3>");

                    var adminEmail = _configuration["EmailSettings:SenderEmail"];

                    _ = _emailService.SendEmailAsync(
                        adminEmail,
                        $"Te hicieron una Nueva Orden de Compra #{newOrder.ORD_ID}",
                        emailBodyBuilder.ToString()
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

            try
            {
                var orderDetails = cart.Items.Select(i => new OrderDetails
                {
                    ODD_ORD_ID = dto.OrderId,
                    ODD_PRD_ID = i.CAI_PRD_ID,
                    ODD_QUANTITY = i.CAI_QUANTITY,
                    ODD_TOTAL_PRICE = i.CAI_TOTAL_PRICE
                }).ToList();

                _context.OrderDetails.AddRange(orderDetails);
                _context.CartItems.RemoveRange(cart.Items); // Limpiar el carrito
                await _context.SaveChangesAsync();

                return Ok("Se inserto en la Order Details correctamente");
            }
            catch (Exception)
            {
                return NotFound(new { Message = "No se pudo insertar la orden." });
            }

        }

        [HttpGet("{userId}")]
        public async Task<IActionResult> GetOrders(int userId)
        {

            // Verificar si el usuario existe
            var user = await _context.Users.FindAsync(userId);
            if (user == null)
            {
                Console.WriteLine($"Usuario con ID {userId} no encontrado.");
                return NotFound(new { Message = "El usuario no existe." });
            }

            var orders = await _context.Orders
                    .Where(o => o.ORD_USR_ID == userId)
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

            var orderDetail = await _context.OrderDetails
                .Where(o => o.ODD_ORD_ID == orderId)
                .Include(o => o.Products)
                .Include(o => o.Orders)
                .ThenInclude(o => o.Receipt)
                .Select(od => new
                {
                    IdOrder = od.ODD_ORD_ID,
                    IdOrderDetail = od.ODD_ID,
                    Quantity = od.ODD_QUANTITY,
                    TotalPrice = od.ODD_TOTAL_PRICE,
                    ProductName = od.Products.PRD_NAME,
                    ProductImage = od.Products.PRD_IMAGE,
                    ReceiptPath = od.Orders.Receipt.RCP_PATH,
                    OrderTotalAmount = od.Orders.ORD_TOTAL_AMOUNT,
                    OrderStatus = od.Orders.ORD_STATUS
                })
                .ToListAsync();

            Console.WriteLine(orderDetail);
            return Ok(orderDetail);
        }

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
                return NotFound(new
                {
                    Message = "La orden no existe." });
                }
        
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

        [HttpPut("{orderId}/updOrdStatus")]
        public async Task<IActionResult> UpdOrdStatus([FromBody] OrderStatusDto dto)
        {
            var order = await _context.Orders.FirstOrDefaultAsync(o => o.ORD_ID == dto.OrderId);
            if (order == null)
            {
                return BadRequest(new { Message = "No se encontro la Orden de compra" });
            }

            order.ORD_STATUS = dto.OrderStatus; // Aca actualizo el estado de la orden de compra

            try
            {
                await _context.SaveChangesAsync();
            }
            catch(Exception ex)
            {
                return StatusCode(500, new { Message = "Error al actualizar", Error = ex.Message });
            }

            var user = await _context.Users.FirstOrDefaultAsync(u => u.USR_ID == order.ORD_USR_ID); //Busco el usuario por la orden de compra

            if (dto.CancelOrderByUser)
            {
                var emailBodyBuilder = new System.Text.StringBuilder();
                emailBodyBuilder.AppendLine($"<h3>Cancelaron la compra #{order.ORD_ID}</h3>");
                emailBodyBuilder.AppendLine($"<p>El cliente {user.USR_NAME} {user.USR_SURNAME} cancelo la compra.</p>");
                emailBodyBuilder.AppendLine($"<footer><strong><span>©</span> Aritz. All Rights Reserved.</strong></footer>");

                var adminEmail = _configuration["EmailSettings:SenderEmail"];

                _ = _emailService.SendEmailAsync(
                    adminEmail,
                    $"Cancelaron la orden #{order.ORD_ID}",
                    emailBodyBuilder.ToString()
                );
            }
            else
            {
                var userMail = user.USR_EMAIL;

                var emailBodyBuilder = new System.Text.StringBuilder();
                emailBodyBuilder.AppendLine($"<h3>Estado de tu orden #{order.ORD_ID}</h3>");
                emailBodyBuilder.AppendLine($"<p><strong>Estado:</strong>El estado de tu pedido paso a {dto.OrderStatus}</p>");
                emailBodyBuilder.AppendLine($"<footer><strong><span>©</span> Aritz. All Rights Reserved.</strong></footer>");

                var usuarioEmail = userMail;

                _ = _emailService.SendEmailAsync(
                    usuarioEmail,
                    $"Avances en tu pedido #{order.ORD_ID}",
                    emailBodyBuilder.ToString()
                );
            }

            return Ok(new { Message = "Estado actualizado correctamente" });

        }
        public class OrderDto
        {
            public int userId { get; set; }
            public decimal totalSumCart { get; set; }
            public string? Status { get; set; }
            public int paymentMethod { get; set; }
            public List<CartItems> CartItems { get;set; }
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
