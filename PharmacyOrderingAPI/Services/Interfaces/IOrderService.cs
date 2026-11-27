
using PharmacyOrderingAPI.DTOs.Order;

namespace PharmacyOrderingAPI.Services.Interfaces
{
    public interface IOrderService
    {
        // Customer places an order using the cart
        Task<OrderResponseDto> PlaceOrderAsync(string userId);

        // Get logged-in customer's orders
        Task<List<OrderResponseDto>> GetMyOrdersAsync(string userId);

        // Get a particular order
        Task<OrderResponseDto?> GetOrderByIdAsync(int orderId, string userId);

        // Customer cancels an eligible order
        Task<OrderResponseDto> CancelOrderAsync(int orderId, string userId);

        // Admin gets all orders
        Task<List<OrderResponseDto>> GetAllOrdersAsync();

        // Admin updates order status
        Task<OrderResponseDto> UpdateOrderStatusAsync(
            int orderId,
            UpdateOrderStatusDto dto);
    }
}
