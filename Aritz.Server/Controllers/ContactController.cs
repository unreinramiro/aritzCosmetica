using Aritz.Server.Data;
using Aritz.Server.Models;
using Aritz.Server.Services;
using MercadoPago.Resource.Order;
using MercadoPago.Resource.User;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Net;


namespace Aritz.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    
    [AllowAnonymous]
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

                var adminContent = $@"
                <p><strong>Asunto:</strong> {WebUtility.HtmlEncode(dto.affair)}<br>
                <strong>Cliente:</strong> {WebUtility.HtmlEncode(dto.name)} {WebUtility.HtmlEncode(dto.surname)}<br>
                <strong>Telefono:</strong> {WebUtility.HtmlEncode(dto.cellphone)}<br>
                <strong>Email:</strong> {WebUtility.HtmlEncode(user.USR_EMAIL)}<br>
                <strong>Mensaje:</strong> {dto.comments}.</p>";

                var adminEmail = _configuration["EmailSettings:SenderEmail"];

                _ = _emailService.SendEmailAsync(
                    adminEmail,
                    $"Contacto Aritz Cosmetica Natural",
                    EmailTemplates.Layout($"{dto.name} {dto.surname} se contacto con vos!", adminContent)
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
