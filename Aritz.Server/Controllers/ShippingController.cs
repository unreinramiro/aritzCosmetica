using Aritz.Server.Data; // Tu namespace del DbContext
using Aritz.Server.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Aritz.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ShippingController : ControllerBase
    {
        private readonly AritzDbContext _context;

        public ShippingController(AritzDbContext context)
        {
            _context = context;
        }

        [HttpGet("calculate")]
        public async Task<IActionResult> Calculate([FromQuery] string zipCode)
        {
            
            if (string.IsNullOrEmpty(zipCode) || !int.TryParse(zipCode, out int cp))
            {
                return BadRequest(new { Message = "Código postal inválido" });
            }

            var zone = await _context.ShippingZones
                .FirstOrDefaultAsync(z => cp >= z.MinZipCode && cp <= z.MaxZipCode);

            decimal finalPrice;

            if (zone != null)
            {
                finalPrice = zone.Price;
            }
            else
            {
                finalPrice = 10000;
            }

            return Ok(new
            {
                ZipCode = zipCode,
                ZoneName = zone?.Name ?? "Estándar",
                Price = finalPrice
            });
        }

        
        [HttpPost("update")]
        public async Task<IActionResult> UpdatePostalCode([FromBody] ShippingZone zoneDto)
        {
            var zone = await _context.ShippingZones.FindAsync(zoneDto.Id);
            if (zone == null) return NotFound("Zona no encontrada");

            zone.Name = zoneDto.Name;
            zone.Price = zoneDto.Price;
            zone.MinZipCode = zoneDto.MinZipCode;
            zone.MaxZipCode = zoneDto.MaxZipCode;

            await _context.SaveChangesAsync();
            return Ok("Precio actualizado correctamente");
        }

        [HttpPost("addPostalCode")]
        public async Task<IActionResult> InsertPostalCode([FromBody] ShippingZone zoneDto)
        {
            var zone = await _context.ShippingZones.FindAsync(zoneDto.Id);
            if (zone != null) return NotFound("Ya existe una zona igual");

            var newZone = new ShippingZone
            {
                Name = zoneDto.Name,
                MinZipCode = zoneDto.MinZipCode,
                MaxZipCode = zoneDto.MaxZipCode,
                Price = zoneDto.Price
            };

            _context.ShippingZones.Add(newZone);
            await _context.SaveChangesAsync();

            return Ok("Codigo postal agregado correctamente");
        }

        [HttpGet("getPostalCodes")]
        public async Task<IActionResult> GetPostalCodes()
        {
            var postalCodes = await _context.ShippingZones
                                            .ToListAsync(); // Obtengo todos los codigos postales

            if (postalCodes == null)
            {
                return BadRequest(new { Message = "No se encontraron los codigos postales" });
            }

            return Ok(postalCodes);
        }

    }
}