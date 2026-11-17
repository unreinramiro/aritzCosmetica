using Aritz.Server.Models;
using static Aritz.Server.Controllers.DiscountController;

namespace Aritz.Server.Services
{
    public record CouponResult(bool Valid, decimal Discount, string? Error, Discount? Coupon);
    public interface ICouponService
    {
        Task<CouponResult> CheckCouponAsync(string? code, decimal subtotal);
    }
}
