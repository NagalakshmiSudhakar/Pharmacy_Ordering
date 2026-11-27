
using Microsoft.EntityFrameworkCore;

using PharmacyOrderingAPI.Data;
using PharmacyOrderingAPI.Models;
using PharmacyOrderingAPI.Repository.Interfaces;

namespace PharmacyOrderingAPI.Repository
{
    public class OrderRepository : IOrderRepository
    {
        private readonly ApplicationDbContext _context;

        public OrderRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        // Create a new order
        public async Task CreateAsync(Order order)
        {
            await _context.Orders.AddAsync(order);
            await _context.SaveChangesAsync();
        }

        // Get an order by ID
        public async Task<Order?> GetByIdAsync(int orderId)
        {
            return await _context.Orders
                .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.Medicine)
                .FirstOrDefaultAsync(o => o.OrderId == orderId);
        }

        // Get orders belonging to a particular customer
        public async Task<List<Order>> GetByUserIdAsync(string userId)
        {
            return await _context.Orders
                .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.Medicine)
                .Where(o => o.UserId == userId)
                .OrderByDescending(o => o.OrderDate)
                .ToListAsync();
        }

        // Get all orders (Admin)
        public async Task<List<Order>> GetAllAsync()
        {
            return await _context.Orders
                .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.Medicine)
                .OrderByDescending(o => o.OrderDate)
                .ToListAsync();
        }

        // Update an existing order
        public async Task UpdateAsync(Order order)
        {
            _context.Orders.Update(order);
            await _context.SaveChangesAsync();
        }
    }
}
