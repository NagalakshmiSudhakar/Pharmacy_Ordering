
using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;

using PharmacyOrderingAPI.DTOs.Order;
using PharmacyOrderingAPI.Services.Interfaces;

namespace PharmacyOrderingAPI.Controllers
{
    [Route("api/orders")]
    [ApiController]
    public class OrdersController : ControllerBase
    {
        private readonly IOrderService _orderService;

        public OrdersController(IOrderService orderService)
        {
            _orderService = orderService;
        }

        // Temporary test user ID.
        // Replace this with JWT claims when authentication is integrated.
        private string GetUserId()
        {
            return User.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? User.FindFirstValue("sub")
                ?? "TEST-CUSTOMER-001";
        }

        // POST: api/orders
        // Customer places an order using their cart
        [HttpPost]
        public async Task<IActionResult> PlaceOrder()
        {
            try
            {
                var userId = GetUserId();

                var result = await _orderService.PlaceOrderAsync(userId);

                return Ok(result);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // GET: api/orders/my-orders
        // Get logged-in customer's orders
        [HttpGet("my-orders")]
        public async Task<IActionResult> GetMyOrders()
        {
            var userId = GetUserId();

            var result = await _orderService.GetMyOrdersAsync(userId);

            return Ok(result);
        }

        // GET: api/orders/{id}
        // Get a particular customer's order
        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetOrderById(int id)
        {
            var userId = GetUserId();

            var result = await _orderService.GetOrderByIdAsync(id, userId);

            if (result == null)
                return NotFound(new { message = "Order not found." });

            return Ok(result);
        }

        // PUT: api/orders/{id}/cancel
        // Customer cancels an eligible order
        [HttpPut("{id:int}/cancel")]
        public async Task<IActionResult> CancelOrder(int id)
        {
            try
            {
                var userId = GetUserId();

                var result = await _orderService.CancelOrderAsync(id, userId);

                return Ok(result);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // GET: api/orders/admin/all
        // Admin gets all orders
        [HttpGet("admin/all")]
        public async Task<IActionResult> GetAllOrders()
        {
            var result = await _orderService.GetAllOrdersAsync();

            return Ok(result);
        }

        // PUT: api/orders/{id}/status
        // Admin updates order status
        [HttpPut("{id:int}/status")]
        public async Task<IActionResult> UpdateOrderStatus(
            int id,
            UpdateOrderStatusDto dto)
        {
            try
            {
                var result = await _orderService.UpdateOrderStatusAsync(id, dto);

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
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
