using Aritz.Server.Data;
using Aritz.Server.Services;
using MercadoPago.Resource.Order;
using MercadoPago.Resource.User;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Aritz.Server.Models;


namespace Aritz.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ContactController : ControllerBase
    {
        private readonly AritzDbContext _context;
        private readonly IEmailService _emailService;
        private readonly IConfiguration _configuration;

        public ContactController(IEmailService emailService, IConfiguration configuration, AritzDbContext context)
        {
            _context = context;
            _emailService = emailService;
            _configuration = configuration;
        }

        [HttpPost("sendContactForm")]
        public async Task<IActionResult> sendContactForm([FromBody] formDto dto)
        {
            try
            {
                var user = await _context.Users.FirstOrDefaultAsync(u => u.USR_ID == dto.userId);

                if (user == null)
                {
                    return BadRequest("El usuario no se encontro o no inicio sesion");
                }

                var emailBodyBuilder = new System.Text.StringBuilder();
                emailBodyBuilder.AppendLine($"<h3>Asunto: {dto.affair}</h3>");
                emailBodyBuilder.AppendLine($"<p>Cliente: {dto.name} {dto.surname}.</p>");
                emailBodyBuilder.AppendLine($"<p>Telefono: {dto.cellphone}.</p>");
                emailBodyBuilder.AppendLine($"<p>Email: {user.USR_EMAIL}.</p>");
                emailBodyBuilder.AppendLine($"<p>Mensaje: {dto.comments}.</p>");
                emailBodyBuilder.AppendLine($"<footer><strong><span>©</span> Aritz. All Rights Reserved.</strong></footer>");

                var adminEmail = _configuration["EmailSettings:SenderEmail"];

                _ = _emailService.SendEmailAsync(
                    adminEmail,
                    $"Contacto Aritz Cosmetica Natural",
                    emailBodyBuilder.ToString()
                );

                return Ok(new { Message = "Email enviado correctamente." });

            }
            catch (Exception ex)
            {
                return StatusCode(500, "Error al enviar el mail");
            }
        }


        public class formDto 
        {
            public int userId { get; set; }
            public string name { get; set; }
            public string surname { get; set; }
            public string cellphone { get; set; }
            public string comments { get; set; }
            public string affair { get; set; }
        }
    }
}
