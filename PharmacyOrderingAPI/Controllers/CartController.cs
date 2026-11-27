
using System.Security.Claims;
//using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

using PharmacyOrderingAPI.DTOs.Cart;
using PharmacyOrderingAPI.Services.Interfaces;

namespace PharmacyOrderingAPI.Controllers
{
    [Route("api/cart")]
    [ApiController]
    //[Authorize(Roles = "Customer")]
    public class CartController : ControllerBase
    {
        private readonly ICartService _cartService;

        public CartController(ICartService cartService)
        {
            _cartService = cartService;
        }

        // Get logged-in customer's UserId from JWT claims
        private string? GetUserId()
        {
            return User.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? User.FindFirstValue("sub");
        }
        //private string? GetUserId()
        //{
        //    return "TEST-CUSTOMER-001";
        //}

        // POST: api/cart/items
        [HttpPost("items")]
        public async Task<IActionResult> AddToCart(AddToCartDto dto)
        {
            var userId = GetUserId();

            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            try
            {
                var result = await _cartService.AddToCartAsync(userId, dto);
                return Ok(result);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { message = ex.Message });
            }
        }

        // GET: api/cart
        [HttpGet]
        public async Task<IActionResult> GetCart()
        {
            var userId = GetUserId();

            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            var result = await _cartService.GetCartAsync(userId);
            return Ok(result);
        }

        // PUT: api/cart/items/{id}
        [HttpPut("items/{id:int}")]
        public async Task<IActionResult> UpdateCartItem(
            int id,
            UpdateCartItemDto dto)
        {
            var userId = GetUserId();

            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            try
            {
                var result = await _cartService.UpdateCartItemAsync(
                    userId, id, dto);

                return Ok(result);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { message = ex.Message });
            }
        }

        // DELETE: api/cart/items/{id}
        [HttpDelete("items/{id:int}")]
        public async Task<IActionResult> RemoveCartItem(int id)
        {
            var userId = GetUserId();

            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            try
            {
                var result = await _cartService.RemoveCartItemAsync(
                    userId, id);

                return Ok(result);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        // DELETE: api/cart/clear
        [HttpDelete("clear")]
        public async Task<IActionResult> ClearCart()
        {
            var userId = GetUserId();

            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            var result = await _cartService.ClearCartAsync(userId);
            return Ok(result);
        }
    }
}
