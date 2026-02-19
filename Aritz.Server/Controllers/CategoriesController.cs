using Microsoft.AspNetCore.Mvc;
using Aritz.Server.Data; // Tu namespace del DbContext
using Aritz.Server.Models;
using Microsoft.EntityFrameworkCore;

namespace Aritz.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CategoriesController : ControllerBase
    {
        private readonly AritzDbContext _context;

        public CategoriesController(AritzDbContext context)
        {
            _context = context;
        }

        [HttpPost("updCategory")]
        public async Task<IActionResult> UpdateCategory([FromBody] DtoCategory categoryDto)
        {
            var category = await _context.Categories.FindAsync(categoryDto.catId);

            if (category == null) return NotFound("Categoría no encontrada");

            category.CAT_NAME = categoryDto.catName;

            await _context.SaveChangesAsync();
            return Ok(new { Message = "Categoría actualizada correctamente" });
        }

        public class DtoCategory 
        {             
            public int catId { get; set; }
            public string catName { get; set; }
        }
    }
}
