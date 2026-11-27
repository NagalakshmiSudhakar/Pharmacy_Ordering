
using PharmacyOrderingAPI.Models;

namespace PharmacyOrderingAPI.Repository.Interfaces
{
    public interface IOrderRepository
    {
        // Create a new order
        Task CreateAsync(Order order);

        // Get an order by its ID
        Task<Order?> GetByIdAsync(int orderId);

        // Get all orders belonging to a particular customer
        Task<List<Order>> GetByUserIdAsync(string userId);

        // Get all orders (Admin)
        Task<List<Order>> GetAllAsync();

        // Update an existing order
        Task UpdateAsync(Order order);
    }
}
