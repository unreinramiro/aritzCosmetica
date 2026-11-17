using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;

namespace Aritz.Server.Controllers
{
    public static class ControllerExtensions
    {
        public static int? CurrentUserId(this ControllerBase c) =>
            int.TryParse(c.User.FindFirstValue(ClaimTypes.NameIdentifier), out var id) ? id : null;

        // Solo el dueño
        public static bool IsOwner(this ControllerBase c, int userId) =>
            c.CurrentUserId() == userId;

        // El dueño o un admin
        public static bool IsOwnerOrAdmin(this ControllerBase c, int userId) =>
            c.User.IsInRole("Admin") || c.CurrentUserId() == userId;
    }
}