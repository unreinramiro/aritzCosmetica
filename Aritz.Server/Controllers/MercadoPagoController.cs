using Aritz.Server.Data;
using MercadoPago.Client.Preference;
using MercadoPago.Config;
using MercadoPago.Resource.Preference;
using Microsoft.AspNetCore.Mvc;

namespace Aritz.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MercadoPagoController : ControllerBase
    {
        private readonly IConfiguration _configuration;
        private readonly AritzDbContext _context;

        public MercadoPagoController(IConfiguration configuration, AritzDbContext context)
        {
            _configuration = configuration;
            _context = context;
            // Inicializar MercadoPago con tu Access Token
            MercadoPagoConfig.AccessToken = _configuration["MercadoPago:AccessToken"];
        }

        [HttpPost("create_preference")]
        public async Task<IActionResult> CreatePreference([FromBody] OrderDto orderData)
        {
            try
            {
                //// Logica para obtener el mail del usuario con userId
                var user = await _context.Users.FindAsync(orderData.userId);
                if (user == null)
                {
                    return BadRequest("Usuario no encontrado");
                }

                var payerEmail = user.USR_EMAIL;

                if (string.IsNullOrEmpty(payerEmail))
                {
                    payerEmail = "customer_test@generic.com";
                }

                // 1. Crear el cliente de preferencias
                var request = new PreferenceRequest
                {
                    Items = new List<PreferenceItemRequest>(),
                    Payer = new PreferencePayerRequest
                    {
                        Email = payerEmail   // Puedes pasar el email real del usuario si lo tienes
                    },
                    BackUrls = new PreferenceBackUrlsRequest
                    {
                        Success = "https://localhost:50833/checkout/pay-success", // Ajusta a tu URL real
                        Failure = "https://localhost:50833/checkout/pay-failure",
                        Pending = "https://localhost:50833/checkout/pay-pending"
                    },
                    AutoReturn = "approved",
                };


                request.Items.Add(new PreferenceItemRequest
                {
                    Title = "Compra en Aritz",
                    Quantity = 1,
                    CurrencyId = "ARS",
                    UnitPrice = orderData.totalSumCart + orderData.zipPrice
                });


                // 3. Generar la preferencia
                var client = new PreferenceClient();
                Preference preference = await client.CreateAsync(request);

                // 4. Devolver el ID al frontend
                return Ok(new { preferenceId = preference.Id });
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
        }

        public class OrderItemDto
        {
            public string ProductName { get; set; } = string.Empty;
            public int Quantity { get; set; }
            public decimal UnitPrice { get; set; }
        }
    }
}