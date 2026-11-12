using Aritz.Server.Data;
using Aritz.Server.Models;
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

        public class ValidateCouponRequest
        {
            public required string Code { get; set; }
            public decimal Subtotal { get; set; }
        }
    }
}
