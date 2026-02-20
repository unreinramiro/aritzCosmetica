using Aritz.Server.Data;
using Aritz.Server.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Internal;
using static Aritz.Server.Controllers.ProductsController;

namespace Aritz.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProductsController : ControllerBase
    {
        private readonly AritzDbContext _context;

        // Inyección de dependencia del DbContext
        public ProductsController(AritzDbContext context)
        {
            _context = context;
        }

        // GET: api/products
        [HttpGet]
        public async Task<ActionResult<List<Product>>> GetProducts()
        {
            var products = await _context.Products
                                .Include(p => p.Category)
                                .Select(p => new ProductDto
                                {
                                    PRD_ID = p.PRD_ID,
                                    PRD_NAME = p.PRD_NAME,
                                    PRD_DESCRIPTION = p.PRD_DESCRIPTION,
                                    PRD_IMAGE = p.PRD_IMAGE,
                                    PRD_PRICE = p.PRD_PRICE,
                                    PRD_QUANTITY = p.PRD_QUANTITY,
                                    PRD_IS_ACTIVE = p.PRD_IS_ACTIVE,
                                    Category = new CategoryDto
                                    {
                                        CAT_ID = p.Category.CAT_ID,
                                        CAT_NAME = p.Category.CAT_NAME,
                                        CAT_DESCRIPTION = p.Category.CAT_DESCRIPTION
                                    },
                                    Gallery = p.ProductImages.Select(img => new ProductImgDto
                                    {
                                        IMG_ID = img.IMG_ID,
                                        IMG_URL = img.IMG_URL
                                    }).ToList()
                                    
                                })
                                .ToListAsync(); // Consulta la tabla "Products" y join con "Categories"
            Console.WriteLine(products);
            return Ok(products); // Retorna los productos
        }

        // GET: api/products/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<Product>> GetProduct(int id)
        {
            var product = await _context.Products
                                .Include(p => p.Category)
                                .Where(p => p.PRD_ID == id)
                                .Select(p => new ProductDto
                                {
                                    PRD_ID = p.PRD_ID,
                                    PRD_NAME = p.PRD_NAME,
                                    PRD_DESCRIPTION = p.PRD_DESCRIPTION,
                                    PRD_IMAGE = p.PRD_IMAGE,
                                    PRD_PRICE = p.PRD_PRICE,
                                    PRD_QUANTITY = p.PRD_QUANTITY,
                                    Category = new CategoryDto
                                    {
                                        CAT_ID = p.Category.CAT_ID,
                                        CAT_NAME = p.Category.CAT_NAME
                                    },
                                    Gallery = p.ProductImages.Select(img => new ProductImgDto
                                    {
                                        IMG_ID = img.IMG_ID,
                                        IMG_URL = img.IMG_URL
                                    }).ToList()
                                })
                                .FirstOrDefaultAsync();
            if (product == null)
            {
                return NotFound();
            }

            return Ok(product);
        }

        [HttpGet("by-category")]
        public async Task<ActionResult<List<Category>>> GetProductsByCategory()
        {
            var categories = await _context.Categories
                    .Include(c => c.Products) // Carga los productos relacionados con cada categoría
                    .Select(c => new CategoryWithProductsDto
                    {
                        CAT_ID = c.CAT_ID,
                        CAT_NAME = c.CAT_NAME,
                        Products = c.Products.Select(p => new ProductDto
                        {
                            PRD_ID = p.PRD_ID,
                            PRD_NAME = p.PRD_NAME,
                            PRD_DESCRIPTION = p.PRD_DESCRIPTION,
                            PRD_IMAGE = p.PRD_IMAGE,
                            PRD_PRICE = p.PRD_PRICE,
                            PRD_QUANTITY = p.PRD_QUANTITY
                        }).ToList()
                    })
                    .ToListAsync();

            return Ok(categories);
        }

        [HttpPost("updPrd")]
        public async Task<IActionResult> UpdProduct([FromForm] UpdateProductDto prdDto)
        {
            var products = await _context.Products.FirstOrDefaultAsync(p => p.PRD_ID == prdDto.PRD_ID);
            bool updated = false; // Variable para modificar solo los campos que sufrieron cambios
            
            string currentDir = Directory.GetCurrentDirectory(); // Directorio Actual

            // Si se modifico la imagen PRINCIPAL
            if (prdDto.MainImageFile != null)
            {
                string fileName = $"updMainImg_{Guid.NewGuid()}{Path.GetExtension(prdDto.MainImageFile.FileName)}";
                string filePath = Path.Combine(currentDir, "wwwroot", "images", fileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await prdDto.MainImageFile.CopyToAsync(stream);
                }

                products.PRD_IMAGE = fileName;
                updated = true;
            }

            // Si se agrego una imagen NUEVA, se inserta en el servidor y en la base
            if (prdDto.NewGalleryImages != null && prdDto.NewGalleryImages.Count > 0)
            {
                foreach(var file in prdDto.NewGalleryImages)
                {
                    string NewGalleryImagesFileName = $"NewGalleryImg_{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
                    string NewGalleryImagesFilePath = Path.Combine(currentDir, "wwwroot", "images", NewGalleryImagesFileName);

                    using (var stream = new FileStream(NewGalleryImagesFilePath, FileMode.Create))
                    {
                        await file.CopyToAsync(stream);
                    }

                    products.ProductImages.Add(new ProductImage
                    {
                        IMG_URL = NewGalleryImagesFileName
                    });
                }
                updated = true;
            }

            if (prdDto.UpdatedGalleryFiles != null && prdDto.UpdatedGalleryFiles.Count > 0
                && prdDto.UpdatedGalleryIds != null && prdDto.UpdatedGalleryIds.Count == prdDto.UpdatedGalleryFiles.Count)
            {
                // Usamos un FOR normal para ir posición por posición (Paralelo)
                for (int i = 0; i < prdDto.UpdatedGalleryFiles.Count; i++)
                {
                    // 1. Obtenemos el par: El ID y su Archivo correspondiente
                    int id = prdDto.UpdatedGalleryIds[i];
                    IFormFile file = prdDto.UpdatedGalleryFiles[i];

                    // 2. Buscamos la imagen en BD
                    var existingImage = await _context.ProductImages.FirstOrDefaultAsync(pi => pi.IMG_ID == id);

                    if (existingImage != null)
                    {
                        // 3. Guardar en Servidor
                        string UpdGalleryFileName = $"UpdGalleryImg_{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
                        string UpdGalleryFilePath = Path.Combine(currentDir, "wwwroot", "images", UpdGalleryFileName);

                        using (var stream = new FileStream(UpdGalleryFilePath, FileMode.Create))
                        {
                            await file.CopyToAsync(stream);
                        }

                        // 4. Actualizar BD (CORREGIDO: Guardar solo el nombre, no la ruta completa)
                        existingImage.IMG_URL = UpdGalleryFileName;

                        updated = true;
                    }
                }
            }

            if (products.PRD_NAME != prdDto.PRD_NAME)
            {
                products.PRD_NAME = prdDto.PRD_NAME;
                updated = true;
            }
            if (products.PRD_PRICE != prdDto.PRD_PRICE)
            {
                products.PRD_PRICE = prdDto.PRD_PRICE;
                updated = true;
            }
            if (products.PRD_QUANTITY != prdDto.PRD_QUANTITY)
            {
                products.PRD_QUANTITY = prdDto.PRD_QUANTITY;
                updated = true;
            }
            if (products.PRD_DESCRIPTION != prdDto.PRD_DESCRIPTION)
            {
                products.PRD_DESCRIPTION = prdDto.PRD_DESCRIPTION;
                updated = true;
            }
            if (products.PRD_IS_ACTIVE != prdDto.PRD_IS_ACTIVE)
            {
                products.PRD_IS_ACTIVE = prdDto.PRD_IS_ACTIVE;
                updated = true;
            }

            if (updated)
            {
                await _context.SaveChangesAsync();
                return Ok(new { Message = "Datos actualizados correctamente." });
            }
            else
            {
                return Ok(new { Message = "No hubo cambios en los datos." });
            }
        }

        [HttpPost("addPrd")]
        public async Task<IActionResult> AddProduct([FromForm] AddProductDto prdDto)
        {
            try
            {
                // 1. Validar que llegue imagen
                if (prdDto.PRD_IMAGE == null || prdDto.PRD_IMAGE.Length == 0)
                {
                    return BadRequest(new { Message = "Debes subir una imagen." });
                }

                // 2. Definir rutas (Usando la lógica segura que te funcionó)
                string currentDir = Directory.GetCurrentDirectory();
                string fileName = $"prod_{Guid.NewGuid()}{Path.GetExtension(prdDto.PRD_IMAGE.FileName)}";
                string filePath = Path.Combine(currentDir, "wwwroot", "images", fileName);

                // 3. Crear carpeta si no existe
                string directoryPath = Path.GetDirectoryName(filePath);
                if (!Directory.Exists(directoryPath))
                {
                    Directory.CreateDirectory(directoryPath);
                }

                // 4. Guardar archivo en disco
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await prdDto.PRD_IMAGE.CopyToAsync(stream);
                }

                // 5. Crear Entidad y Guardar en BD
                var product = new Product
                {
                    PRD_NAME = prdDto.PRD_NAME,
                    PRD_PRICE = prdDto.PRD_PRICE,
                    PRD_QUANTITY = prdDto.PRD_QUANTITY,
                    PRD_DESCRIPTION = prdDto.PRD_DESCRIPTION,
                    PRD_CAT_ID = prdDto.PRD_CAT_ID,
                    PRD_IS_ACTIVE = prdDto.PRD_IS_ACTIVE,
                    PRD_IMAGE = fileName, // Guardamos la URL relativa
                };

                if (prdDto.GalleryImages != null && prdDto.GalleryImages.Count > 0)
                {
                    foreach (var file in prdDto.GalleryImages)
                    {

                        string galleryFileName = $"gallery_{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
                        string galleryFilePath = Path.Combine(currentDir, "wwwroot", "images", galleryFileName);

                        using (var stream = new FileStream(galleryFilePath, FileMode.Create))
                        {
                            await file.CopyToAsync(stream);
                        }

                        // Agregar a la lista de imágenes del producto
                        product.ProductImages.Add(new ProductImage
                        {
                            IMG_URL = galleryFileName
                        });
                    }
                }

                _context.Products.Add(product);
                await _context.SaveChangesAsync();

                return Ok(new { Message = "Producto creado exitosamente" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Error = ex.Message });
            }
        }

        [HttpDelete("delPrd/{prdDelId}")]
        public async Task<IActionResult> DelPrd(int prdDelId)
        {
            try
            {
                var product = await _context.Products
                    .FirstOrDefaultAsync(p => p.PRD_ID == prdDelId);

                if (product == null)
                {
                    return NotFound($"No se encontró el producto con ID {prdDelId}");
                }

                _context.Products.Remove(product);
                await _context.SaveChangesAsync();

                return Ok($"Se elimino el producto con el ID: {prdDelId} correctamente");
            }
            catch (Exception)
            {
                Console.WriteLine($"Error al intentar eliminar el producto");
                return StatusCode(500, "Ocurrió un error al intentar eliminar el producto.");
            }
        }

        [HttpDelete("delImg/{id}")]
        public async Task<IActionResult> delImg(int id)
        {
            try
            {
                var image = await _context.ProductImages.FirstOrDefaultAsync(i => i.IMG_ID == id);

                if (image == null)
                {
                    return NotFound($"No se contro la imagen con el ID {id}");
                }

                _context.ProductImages.Remove(image);
                await _context.SaveChangesAsync();

                return Ok($"Se elimino correctamente la imagen con ID: ${id}");

            }
            catch (Exception)
            {
                Console.WriteLine($"Error al intentar eliminar la imagen");
                return StatusCode(500, "Ocurrió un error al intentar eliminar la imagen.");
            }
        }
        public class AddProductDto
        {
            public string PRD_NAME { get; set; }
            public decimal PRD_PRICE { get; set; }
            public int PRD_QUANTITY { get; set; }
            public string? PRD_DESCRIPTION { get; set; }
            public bool PRD_IS_ACTIVE { get; set; }
            public IFormFile PRD_IMAGE { get; set; } // <--- Aquí llega el archivo
            public List<IFormFile>? GalleryImages { get; set; }
            public int PRD_CAT_ID { get; set; } 
        }

        public class UpdateProductDto
        {
            public int PRD_ID { get; set; }
            public string? PRD_NAME { get; set; }
            public string? PRD_DESCRIPTION { get; set; }
            public decimal PRD_PRICE { get; set; }
            public int PRD_QUANTITY { get; set; }
            public bool PRD_IS_ACTIVE { get; set; }
            public IFormFile? MainImageFile { get; set; }
            public List<IFormFile>? NewGalleryImages { get; set; }
            public List<IFormFile>? UpdatedGalleryFiles { get; set; }
            public List<int>? UpdatedGalleryIds { get; set; }
        }

        public class ProductDto
        {
            public int PRD_ID { get; set; }
            public string? PRD_NAME { get; set; }
            public string? PRD_DESCRIPTION { get; set; }
            public decimal PRD_PRICE { get; set; } // Mapea con Price
            public int PRD_QUANTITY { get; set; }     // Mapea con Stock
            public bool? PRD_IS_ACTIVE { get; set; }
            public string? PRD_IMAGE { get; set; } // Mapea con ImageUrl (puede ser nulo)
            public CategoryDto Category { get; set; }
            public List<ProductImgDto>? Gallery { get; set; } = new List<ProductImgDto>();
        }

        public class ProductImgDto
        {
            public int IMG_ID { get; set; }
            public string IMG_URL { get; set; }
        }

        public class CategoryDto
        {
            public int CAT_ID { get; set; }
            public string CAT_NAME { get; set; }
            public string CAT_DESCRIPTION { get; set; }
            // No incluimos la lista de Products
        }

        public class CategoryWithProductsDto
        {
            public int CAT_ID { get; set; }
            public string CAT_NAME { get; set; }
            public List<ProductDto> Products { get; set; } = new List<ProductDto>();
        }
    }
}