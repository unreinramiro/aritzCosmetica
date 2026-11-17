using Aritz.Server.Data;
using Aritz.Server.Models;
using Aritz.Server.Services;
using MercadoPago.Resource.Order;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System.ComponentModel.DataAnnotations;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace Aritz.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]

    [AllowAnonymous]
    public class AuthController : ControllerBase
    {
        private readonly AritzDbContext _context;
        private readonly IEmailService _emailService;
        private readonly IConfiguration _configuration;

        public AuthController(AritzDbContext context, IEmailService emailService, IConfiguration configuration)
        {
            _context = context;
            _emailService = emailService;
            _configuration = configuration;
        }

        // Registro: POST /api/auth/register
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            if (_context.Users.Any(u => u.USR_EMAIL == dto.Email))
                return BadRequest("Email ya registrado.");

            var user = new Users
            {
                USR_NAME = dto.Name,
                USR_SURNAME = dto.Surname,
                USR_EMAIL = dto.Email,
                USR_PASSWORD_HASH = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                USR_PHONE_NUMBER = dto.PhoneNumber ?? string.Empty,
                USR_CREATED_DATE = DateTime.UtcNow,
                USR_IS_ADMIN = false,
                USR_IS_VERIFIED = false,
                USR_VERIFICATION_CODE = GenerateVerificationCode(), // Función abajo
                USR_VERIFICATION_EXPIRATION = DateTime.UtcNow.AddMinutes(15)
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            try
            {
                await _emailService.SendVerificationEmailAsync(user.USR_EMAIL, user.USR_VERIFICATION_CODE);
            }
            catch (Exception ex)
            {
                // Log del error para depuración
                Console.WriteLine($"Error enviando email: {ex.Message}");
                // Continúa con el registro aunque el email falle
                return Ok("Registro exitoso, pero no se pudo enviar el email de verificación. Contacta al soporte.");
            }

            return Ok("Registro exitoso. Verifica tu email.");
        }

        // Verificación: POST /api/auth/verify
        [HttpPost("verify")]
        public async Task<IActionResult> Verify([FromBody] VerifyDto dto)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.USR_EMAIL == dto.Email);
            if (user == null || user.USR_VERIFICATION_CODE != dto.Code || user.USR_VERIFICATION_EXPIRATION < DateTime.UtcNow)
                return BadRequest("Código inválido o expirado.");

            user.USR_IS_VERIFIED = true;
            user.USR_VERIFICATION_CODE = null;
            user.USR_VERIFICATION_EXPIRATION = null;
            await _context.SaveChangesAsync();
            try
            {
                var body = new System.Text.StringBuilder();
                body.AppendLine($"<h3>Te registraste correctamente en Aritz Cosmetica Natural</h3>");
                body.AppendLine($"<h3>Clickea aca para ver el catalogo de nuestros productos: </h3>");
                body.AppendLine("<footer><strong><span>©</span> Aritz. All Rights Reserved.</strong></footer>");

                await _emailService.SendEmailAsync(
                    user.USR_EMAIL,
                    $"Registro Exitoso!",
                    body.ToString());
            }
            catch (Exception ex)
            {
                BadRequest("No se pudo enviar el mail: {ex}");
            }
            return Ok("Cuenta verificada.");

            
        }

        // Login: POST /api/auth/login
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto dto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var user = await _context.Users.FirstOrDefaultAsync(u => u.USR_EMAIL == dto.Email);
                if (user == null)
                {
                    Console.WriteLine($"Usuario no encontrado para email: {dto.Email}");
                    return Unauthorized("Credenciales inválidas.");
                }

                bool isPasswordValid = BCrypt.Net.BCrypt.Verify(dto.Password, user.USR_PASSWORD_HASH);

                if (string.IsNullOrEmpty(user.USR_PASSWORD_HASH) || !isPasswordValid)
                    return Unauthorized("Credenciales inválidas.");

                if (user.USR_IS_VERIFIED == null || !user.USR_IS_VERIFIED)
                    return Unauthorized("Cuenta no verificada. Revisa tu email.");

                // Generar JWT
                var claims = new List<Claim>
                {
                    new Claim(ClaimTypes.NameIdentifier, user.USR_ID.ToString()),
                    new Claim(ClaimTypes.Email, user.USR_EMAIL),
                    new Claim(ClaimTypes.Name, user.USR_NAME)
                };
                if (user.USR_IS_ADMIN == true)
                    claims.Add(new Claim(ClaimTypes.Role, "Admin"));


                var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]));
                var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
                var token = new JwtSecurityToken(
                    issuer: _configuration["Jwt:Issuer"],
                    audience: _configuration["Jwt:Audience"],
                    claims: claims,
                    expires: DateTime.Now.AddHours(1),
                    signingCredentials: creds
                );

                var tokenString = new JwtSecurityTokenHandler().WriteToken(token);

                return Ok(new
                {
                    Token = tokenString,
                    UserId = user.USR_ID,
                    UserName = user.USR_NAME,
                    UserIsAdmin = user.USR_IS_ADMIN,
                    Message = "Login exitoso."
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error en login: {ex.ToString()}");
                return StatusCode(500, "Error interno del servidor durante el login.");
            }
        }

        private string GenerateVerificationCode()
        {
            var random = new Random();
            return random.Next(100000, 999999).ToString(); // Código de 6 dígitos
        }
    }

    // DTOs para inputs
    public class RegisterDto
    {
        [Required(ErrorMessage = "El nombre es obligatorio")]
        public string Name { get; set; }

        [Required(ErrorMessage = "El apellido es obligatorio")]
        public string Surname { get; set; }

        [Required, EmailAddress(ErrorMessage = "Email inválido")]
        public string Email { get; set; }

        [Required, MinLength(6, ErrorMessage = "La contraseña debe tener al menos 6 caracteres")]
        public string Password { get; set; }
        public string PhoneNumber { get; set; }
        public string Address { get; set; }
    }

    public class VerifyDto
    {
        public string Email { get; set; }
        public string Code { get; set; }
    }

    public class LoginDto
    {
        public string Email { get; set; }
        public string Password { get; set; }
    }
}
