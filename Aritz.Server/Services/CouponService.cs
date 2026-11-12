using Aritz.Server.Data;
using Microsoft.EntityFrameworkCore;

namespace Aritz.Server.Services
{
    public class CouponService : ICouponService
    {
        private readonly AritzDbContext _context;
        public CouponService(AritzDbContext context) => _context = context;

        public async Task<CouponResult> CheckCouponAsync(string? code, decimal subtotal)
        {
            if (string.IsNullOrWhiteSpace(code))
                return new(true, 0, null, null);

            code = code.Trim();
            var cup = await _context.Discounts.FirstOrDefaultAsync(d => d.DIS_CODE == code);
            var now = DateTime.UtcNow;

            if (cup == null
                || !cup.DIS_IS_ACTIVE
                || cup.DIS_START_DATE > now
                || (cup.DIS_END_DATE != null && cup.DIS_END_DATE < now)
                || (cup.DIS_MAX_USES != null && cup.DIS_USED_COUNT >= cup.DIS_MAX_USES))
                return new(false, 0, "El cupón no existe o no está vigente.", null);

            if (cup.DIS_MIN_AMOUNT != null && subtotal < cup.DIS_MIN_AMOUNT)
                return new(false, 0, $"El monto mínimo para este cupón es ${cup.DIS_MIN_AMOUNT:N0}.", null);

            var discount = cup.DIS_TYPE == "PERCENTAGE"
                ? subtotal * cup.DIS_DISCOUNT / 100
                : cup.DIS_DISCOUNT;

            return new(true, Math.Round(Math.Min(discount, subtotal), 2), null, cup);
        }
    }
}
