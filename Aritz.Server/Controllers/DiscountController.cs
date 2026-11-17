using Aritz.Server.Data;
using Aritz.Server.Models;
using MercadoPago.Resource.User;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Aritz.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DiscountController : ControllerBase
    {
        private readonly AritzDbContext _context;

        public DiscountController(AritzDbContext context)
        {
            _context = context;
        }

        [HttpPost("validate")]
        public async Task<IActionResult> ValidateCoupon([FromBody] ValidateCouponRequest req)
        {
            var code = req.Code?.Trim();
            if (string.IsNullOrEmpty(code)) return BadRequest("Ingresá un código.");

            var cup = await _context.Discounts
                .AsNoTracking()
                .FirstOrDefaultAsync(d => d.DIS_CODE == code);

            var now = DateTime.UtcNow;

            if (cup == null || !cup.DIS_IS_ACTIVE
                || cup.DIS_START_DATE > now
                || (cup.DIS_END_DATE != null && cup.DIS_END_DATE < now)
                || (cup.DIS_MAX_USES != null && cup.DIS_USED_COUNT >= cup.DIS_MAX_USES))
                return BadRequest("El cupón no existe o no está vigente.");

            if (cup.DIS_MIN_AMOUNT != null && req.Subtotal < cup.DIS_MIN_AMOUNT)
                return BadRequest($"El monto mínimo para este cupón es ${cup.DIS_MIN_AMOUNT:N0}.");

            var discount = cup.DIS_TYPE == "PERCENTAGE"
                ? req.Subtotal * cup.DIS_DISCOUNT / 100
                : cup.DIS_DISCOUNT;
            discount = Math.Round(Math.Min(discount, req.Subtotal), 2);

            return Ok(new { code = cup.DIS_CODE, type = cup.DIS_TYPE, value = cup.DIS_DISCOUNT, discount });
        }

        [Authorize(Policy = "Admin")]
        [HttpGet("getAllCoupons")]
        public async Task<IActionResult> GetAllDiscounts()
        {
            var discounts = await _context.Discounts.ToListAsync();
            if (discounts == null) return NotFound("Error al traer los descuentos");

            return Ok(discounts);
        }

        [Authorize(Policy = "Admin")]
        [HttpPost("addDiscount")]
        public async Task<IActionResult> AddDiscount([FromBody] DiscountDto dto)
        {
            try
            {
                var newDiscount = new Discount
                {
                    DIS_CODE = dto.Code,
                    DIS_NAME = dto.Name,
                    DIS_TYPE = dto.Type,
                    DIS_DISCOUNT = dto.Discount.Value,
                    DIS_MIN_AMOUNT = dto.MinAmount,
                    DIS_START_DATE = dto.StartDate.Value,
                    DIS_END_DATE = dto.EndDate,
                    DIS_MAX_USES = dto.MaxUses,
                    DIS_USED_COUNT = dto.UsesCount.Value,
                    DIS_IS_ACTIVE = dto.IsActive.Value
                };

                _context.Discounts.Add(newDiscount);
                await _context.SaveChangesAsync();

                return Ok(new { Message = "Descuento creado exitosamente" });

            }
            catch(Exception ex)
            {
                return StatusCode(500, new { Error = ex.Message });
            }
        }

        [Authorize(Policy = "Admin")]
        [HttpPost("updDiscount")]
        public async Task<IActionResult> UpdDiscount([FromBody] DiscountDto dto)
        {
            var dis = await _context.Discounts.FirstOrDefaultAsync(d => d.DIS_ID == dto.Id);
            if (dis == null) return NotFound("No se encontró el cupón de descuento");

            if (dto.Code != null)
            {
                var exists = await _context.Discounts
                    .AnyAsync(d => d.DIS_CODE == dto.Code && d.DIS_ID != dto.Id);
                if (exists) return Conflict("Ya existe un cupón con ese código");
                dis.DIS_CODE = dto.Code;
            }
            if (!string.IsNullOrWhiteSpace(dto.Name)) dis.DIS_NAME = dto.Name;
            if (!string.IsNullOrWhiteSpace(dto.Type)) dis.DIS_TYPE = dto.Type;
            if (dto.Discount.HasValue) dis.DIS_DISCOUNT = dto.Discount.Value;
            if (dto.MinAmount.HasValue) dis.DIS_MIN_AMOUNT = dto.MinAmount;
            if (dto.StartDate.HasValue) dis.DIS_START_DATE = dto.StartDate.Value;
            if (dto.EndDate.HasValue) dis.DIS_END_DATE = dto.EndDate.Value;
            if (dto.MaxUses.HasValue) dis.DIS_MAX_USES = dto.MaxUses;
            if (dto.UsesCount.HasValue) dis.DIS_USED_COUNT = dto.UsesCount.Value;
            if (dto.IsActive.HasValue) dis.DIS_IS_ACTIVE = dto.IsActive.Value;

            await _context.SaveChangesAsync();
            return Ok(dis);
        }

        [Authorize(Policy = "Admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DelDiscount(int id)
        {
            try
            {
                var dis = await _context.Discounts.FirstOrDefaultAsync(d => d.DIS_ID == id);
                if (dis == null) return NotFound("No se encontró el cupón de descuento");

                _context.Remove(dis);
                await _context.SaveChangesAsync();
                return NoContent();
            }
            catch(Exception ex)
            {
                return StatusCode(500, new { Error = ex.Message });
            }
        }

        public class ValidateCouponRequest
        {
            public required string Code { get; set; }
            public decimal Subtotal { get; set; }
        }

        public class DiscountDto
        {
            public int? Id { get; set; }
            public string? Code { get; set; }
            public string? Name { get; set; }
            public string? Type { get; set; }
            public decimal? Discount { get; set; }
            public decimal? MinAmount { get; set; }
            public DateTime? StartDate { get; set; }
            public DateTime? EndDate { get; set; }
            public int? MaxUses { get; set; }
            public int? UsesCount { get; set; }
            public bool? IsActive { get; set; }
        }
    }
}
