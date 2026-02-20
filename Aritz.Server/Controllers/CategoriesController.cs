using Aritz.Server.Data; // Tu namespace del DbContext
using Aritz.Server.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using static Aritz.Server.Controllers.ProductsController;

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

        [HttpPost("insertCategory/{prdDelId}")]
        public async Task<IActionResult> InsertCategory([FromBody] DtoCategory dtoCategory)
        {
            var category = await _context.Categories.FindAsync(dtoCategory.catId);
            if(category != null) { return BadRequest("Ya existe una categoria con ese ID"); }

            _context.Categories.Add(new Category { CAT_NAME = dtoCategory.catName});
            await _context.SaveChangesAsync();

            return Ok($"Se agrego la categoria {dtoCategory.catName} con ID {dtoCategory.catId} correctamente ");
        }

        [HttpDelete("deleteCategory/{catId}")]
        public async Task<IActionResult> DeleteCategory(int catId)
        {
            var category = await _context.Categories.FindAsync(catId);

            if(category == null) { return BadRequest("No se encontro una categoria con ese ID"); }

            _context.Categories.Remove(category);
            await _context.SaveChangesAsync();

            return Ok($"Se elimino correctamente la categoria con el ID {catId}");
        }

        public class DtoCategory 
        {             
            public int catId { get; set; }
            public string catName { get; set; }
        }
    }
}
