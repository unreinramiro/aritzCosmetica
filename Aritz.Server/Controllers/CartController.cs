using Aritz.Server.Data;
using Aritz.Server.Models;
using Azure.Core;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Aritz.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CartController : ControllerBase
    {
        private readonly AritzDbContext _context;

        public CartController(AritzDbContext context)
        {
            _context = context;
        }

        // POST: api/cart/add-to-cart
        [HttpPost("add-to-cart")]
        public async Task<IActionResult> AddToCart([FromBody] AddToCartRequest request)
        {
            Console.WriteLine($"Verificando si el usuario existe: UserId={request.userId}");


            // Alternativa: Buscar el usuario con FirstOrDefaultAsync
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.USR_ID == request.userId);
            if (user == null)
            {
                Console.WriteLine($"Usuario con ID {request.userId} no encontrado usando FirstOrDefaultAsync.");
                return NotFound("El usuario no existe.");
            }

            var product = await _context.Products.FindAsync(request.productId);
            if (product == null)
            {
                return NotFound("Producto no encontrado.");
            }

            // Verifica si ya existe un carrito para el usuario
            var cart = await _context.Carts
                .Include(c => c.Items)
                .FirstOrDefaultAsync(c => c.CAR_USR_ID == request.userId);

            if (cart == null)
            {
                // Si no hay carrito, crea uno
                cart = new Cart { CAR_USR_ID = request.userId };
                _context.Carts.Add(cart);
                await _context.SaveChangesAsync();
            }

            // Verifica si el producto ya existe en el carrito
            var cartItem = cart.Items?.FirstOrDefault(i => i.CAI_PRD_ID == request.productId);

            int cantidadEnCarrito = cartItem?.CAI_QUANTITY ?? 0;

            int cantidadTotalDeseada = cantidadEnCarrito + request.quantity;

            if (cantidadTotalDeseada > product.PRD_QUANTITY)
            {
                // Usamos BadRequest (400) porque es un error de lógica de negocio, no un 404
                return BadRequest($"Stock insuficiente. Stock disponible: {product.PRD_QUANTITY}. Ya tienes {cantidadEnCarrito} en el carrito.");
            }

            if (cartItem != null)
            {
                // Ya existe: actualiza la cantidad
                cartItem.CAI_QUANTITY += request.quantity;
            }
            else
            {
                // Nuevo producto: agrégalo como un nuevo ítem
                
                if (product == null)
                {
                    return NotFound("Producto no encontrado.");
                }

                cartItem = new CartItems
                {
                    CAI_CAR_ID = cart.CAR_ID,
                    CAI_PRD_ID = request.productId,
                    CAI_QUANTITY = request.quantity,
                    CAI_TOTAL_PRICE = product.PRD_PRICE * request.quantity
                };
                _context.CartItems.Add(cartItem);
            }

            await _context.SaveChangesAsync();

            return Ok("Producto agregado al carrito.");
        }

        // GET: api/cart/user/{userId}
        [HttpGet("user/{userId}")]
        public async Task<IActionResult> GetCart(int userId)
        {
            Console.WriteLine(userId);
            var cart = await _context.Carts
                .Include(c => c.Items)
                .ThenInclude(i => i.Product)
                .ThenInclude(p => p.Category)
                .FirstOrDefaultAsync(c => c.CAR_USR_ID == userId);

            if (cart == null || cart.Items == null || !cart.Items.Any())
            {
                // Devuelve un array vacío si no hay ítems en el carrito
                return Ok(new List<object>());
            }

            return Ok(cart.Items.Select(i => new
            {
                i.CAI_ID,
                i.CAI_PRD_ID,
                i.Product.PRD_ID,
                i.Product.PRD_NAME,
                i.Product.PRD_PRICE,
                i.Product.PRD_IMAGE,
                i.CAI_QUANTITY,
                i.CAI_TOTAL_PRICE,
                i.Product.Category.CAT_NAME
            }));
        }

        [HttpGet("user/{userId}/total-quantity")]
        public async Task<IActionResult> GetTotalQuantity(int userId)
        {
            try
            {
                Console.WriteLine($"Calculando la cantidad total para el usuario con ID: {userId}");

                // Verifica si el carrito del usuario existe
                var cart = await _context.Carts.FirstOrDefaultAsync(c => c.CAR_USR_ID == userId);

                if (cart == null)
                {
                    Console.WriteLine("Carrito no encontrado para el usuario.");
                    return NotFound("El carrito no existe para este usuario.");
                }

                // Sumar las cantidades de los ítems
                var totalQuantity = await _context.CartItems
                    .Where(ci => ci.CAI_CAR_ID == cart.CAR_ID)
                    .SumAsync(ci => ci.CAI_QUANTITY);

                Console.WriteLine($"Cantidad total obtenida: {totalQuantity}");

                return Ok(totalQuantity); // Devuelve el total de cantidad como JSON
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error durante el cálculo: {ex.Message}");
                return StatusCode(500, "Hubo un error al calcular la cantidad total en el carrito.");
            }
        }

        [HttpGet("user/{userId}/total-cart")]
        public async Task<IActionResult> GetTotalCart(int userId)
        {
            // Verifica si el carrito del usuario existe
            var cart = await _context.Carts.FirstOrDefaultAsync(c => c.CAR_USR_ID == userId);

            if (cart == null)
            {
                Console.WriteLine("Carrito no encontrado para el usuario.");
                return NotFound("El carrito no existe para este usuario.");
            }

            var totalSum = await _context.CartItems
                .Where(ci => ci.CAI_CAR_ID == cart.CAR_ID)
                .SumAsync(ci => ci.CAI_TOTAL_PRICE * ci.CAI_QUANTITY);

            Console.WriteLine($"Cantidad total obtenida: {totalSum}");
            return Ok(totalSum);
        }

        //DEL: api/cart/user/{productId}
        [HttpDelete("user/{userId}/product/{productId}")]
        public async Task<IActionResult> DelCartItem(int productId, int userId)
        {
            try
            {
                Console.WriteLine($"Intentando eliminar producto con ID {productId} para el usuario con ID {userId}");

                // Busca el carrito del usuario
                var cart = await _context.Carts
                    .Include(c => c.Items) // Incluye los ítems en el carrito
                    .FirstOrDefaultAsync(c => c.CAR_USR_ID == userId);

                if (cart == null)
                {
                    Console.WriteLine("Carrito no encontrado.");
                    return NotFound("El carrito no existe.");
                }

                // Busca el ítem en el carrito
                var cartItem = await _context.CartItems
                    .FirstOrDefaultAsync(ci => ci.CAI_CAR_ID == cart.CAR_ID && ci.CAI_PRD_ID == productId);

                if (cartItem == null)
                {
                    Console.WriteLine("Producto no encontrado en el carrito.");
                    return NotFound("El producto no se encuentra en el carrito.");
                }

                // Elimina el ítem del carrito
                _context.CartItems.Remove(cartItem);
                await _context.SaveChangesAsync(); // Guarda los cambios en la base de datos
                Console.WriteLine("Producto eliminado del carrito.");

                return Ok("Producto eliminado del carrito.");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error al intentar eliminar el producto: {ex.Message}");
                return StatusCode(500, "Ocurrió un error al intentar eliminar el producto del carrito.");
            }
        }

        //DEL: api/cart/user/
        [HttpDelete("user/{userId}")]
        public async Task<IActionResult> DelAllCartItem(int userId)
        {
            try
            {
                Console.WriteLine($"Intentando eliminar todos los productos del carrito para el usuario: {userId}");

                // Busca el carrito del usuario
                var cart = await _context.Carts
                    .Include(c => c.Items) // Incluye los ítems en el carrito
                    .FirstOrDefaultAsync(c => c.CAR_USR_ID == userId);

                if (cart == null)
                {
                    Console.WriteLine("Carrito no encontrado.");
                    return NotFound("El carrito no existe.");
                }

                // Elimina el ítem del carrito
                _context.CartItems.RemoveRange(cart.Items);
                await _context.SaveChangesAsync(); // Guarda los cambios en la base de datos
                Console.WriteLine("Se vacio el carrito correctamente");

                return Ok("Se vacio el carrito correctamente");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error al intentar vaciar el carrito: {ex.Message}");
                return StatusCode(500, "Ocurrió un error al intentar vaciar el carrito");
            }
        }
    }
}