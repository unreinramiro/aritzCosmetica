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

        [HttpGet("getCategories")]
        public async Task<IActionResult> GetCategories()
        {
            var categories = await _context.Categories
                                           .ToListAsync();
            if (categories == null) return NotFound("No se pudo traer las categorias");

            return Ok(categories);
        }

        [HttpPost("updCategory")]
        public async Task<IActionResult> UpdateCategory([FromBody] DtoCategory categoryDto)
        {
            var category = await _context.Categories.FindAsync(categoryDto.catId);

            if (category == null) return NotFound("Categoría no encontrada");

            category.CAT_NAME = categoryDto.catName;
            category.CAT_DESCRIPTION = categoryDto.catDescription;

            await _context.SaveChangesAsync();
            return Ok(new { Message = "Categoría actualizada correctamente" });
        }

        [HttpPost("insertCategory")]
        public async Task<IActionResult> InsertCategory([FromBody] DtoCategory dtoCategory)
        {
            try
            {
                _context.Categories.Add(new Category
                {
                    CAT_NAME = dtoCategory.catName,
                    CAT_DESCRIPTION = dtoCategory.catDescription
                });
                await _context.SaveChangesAsync();

                return Ok($"Se agrego la categoria {dtoCategory.catName} con ID {dtoCategory.catId} correctamente ");
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Error = ex.Message });
            }
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
            public string catDescription { get; set; }
        }
    }
}
