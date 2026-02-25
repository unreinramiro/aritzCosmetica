using Aritz.Server.Data; // Tu namespace del DbContext
using Aritz.Server.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Aritz.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        private readonly AritzDbContext _context;

        public UsersController(AritzDbContext context)
        {
            _context = context;
        }

        [HttpDelete("deleteUser/{userId}")]
        public async Task<IActionResult> DeleteUser(int userId)
        {
            var user = await _context.Users.FindAsync(userId);

            if (user == null) { return NotFound("No se encontro el usuario"); }

            if (user.USR_IS_ADMIN == true) { return Conflict("No se puede eliminar un usuario administrador"); }

            _context.Remove(user);
            await _context.SaveChangesAsync();

            return Ok($"Se elimino correctamente al usuario con el ID {userId}");
        }

        [HttpPut("updUserAdmin")]
        public async Task<IActionResult> UpdateUserAdmin([FromBody] UserAdminDTO userAdminDto)
        {
            var user = await _context.Users.FindAsync(userAdminDto.userId);

            if (user == null) { return NotFound("No se encontro el usuario"); }

            if(userAdminDto.newStatus == "No")
            {
                user.USR_IS_ADMIN = false;
                await _context.SaveChangesAsync();

                return Ok($"Se cambio correctamente el estado administrador a {false} al usuario con el ID {userAdminDto.userId}");
            }

            user.USR_IS_ADMIN = true;
            await _context.SaveChangesAsync();

            return Ok($"Se cambio correctamente el estado administrador a {true} al usuario con el ID {userAdminDto.userId}");

        }

        public class UserAdminDTO
        {
            public int userId { get; set; }
            public string newStatus { get; set; }
        }
    }
}
