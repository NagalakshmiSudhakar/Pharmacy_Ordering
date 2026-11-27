
using Microsoft.EntityFrameworkCore;

using PharmacyOrderingAPI.Data;
using PharmacyOrderingAPI.DTOs.Order;
using PharmacyOrderingAPI.Enums;
using PharmacyOrderingAPI.Models;
using PharmacyOrderingAPI.Repository.Interfaces;
using PharmacyOrderingAPI.Services.Interfaces;

namespace PharmacyOrderingAPI.Services
{
    public class OrderService : IOrderService
    {
        private readonly IOrderRepository _orderRepository;
        private readonly ICartRepository _cartRepository;
        private readonly IMedicineRepository _medicineRepository;
        private readonly ApplicationDbContext _context;

        public OrderService(
            IOrderRepository orderRepository,
            ICartRepository cartRepository,
            IMedicineRepository medicineRepository,
            ApplicationDbContext context)
        {
            _orderRepository = orderRepository;
            _cartRepository = cartRepository;
            _medicineRepository = medicineRepository;
            _context = context;
        }

        // 1. Place order using customer's cart
        public async Task<OrderResponseDto> PlaceOrderAsync(string userId)
        {
            using var transaction =
                await _context.Database.BeginTransactionAsync();

            try
            {
                var cart = await _cartRepository.GetCartByUserIdAsync(userId);

                if (cart == null || !cart.CartItems.Any())
                    throw new InvalidOperationException("Your cart is empty.");

                // Validate all medicines before reducing stock
                foreach (var item in cart.CartItems)
                {
                    var medicine = await _medicineRepository
                        .GetByIdAsync(item.MedicineId);

                    if (medicine == null || !medicine.IsActive)
                        throw new InvalidOperationException(
                            "One or more medicines are unavailable.");

                    if (item.Quantity <= 0 ||
                        item.Quantity > medicine.StockQuantity)
                    {
                        throw new InvalidOperationException(
                            $"Insufficient stock for {medicine.Name}.");
                    }
                }

                var order = new Order
                {
                    UserId = userId,
                    OrderDate = DateTime.UtcNow,
                    OrderStatus = OrderStatus.Pending,
                    OrderItems = new List<OrderItem>()
                };

                decimal totalAmount = 0;

                // Create order items and calculate prices from database
                foreach (var item in cart.CartItems)
                {
                    var medicine = await _medicineRepository
                        .GetByIdAsync(item.MedicineId);

                    if (medicine == null || !medicine.IsActive)
                        throw new InvalidOperationException(
                            "Medicine is no longer available.");

                    decimal unitPrice = medicine.Price;
                    decimal subTotal = unitPrice * item.Quantity;

                    order.OrderItems.Add(new OrderItem
                    {
                        MedicineId = medicine.MedicineId,
                        Quantity = item.Quantity,
                        UnitPrice = unitPrice,
                        SubTotal = subTotal,
                        Medicine = medicine
                    });

                    totalAmount += subTotal;

                    // Reduce stock only when placing the order
                    medicine.StockQuantity -= item.Quantity;

                    await _medicineRepository.UpdateAsync(medicine);
                }

                order.TotalAmount = totalAmount;

                // Save order
                await _orderRepository.CreateAsync(order);

                // Clear cart only after successful order creation
                await _cartRepository.ClearCartAsync(cart.CartId);

                await transaction.CommitAsync();

                return MapOrder(order);
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        // 2. Get logged-in customer's orders
        public async Task<List<OrderResponseDto>> GetMyOrdersAsync(string userId)
        {
            var orders = await _orderRepository.GetByUserIdAsync(userId);

            return orders.Select(MapOrder).ToList();
        }

        // 3. Get a particular customer's order
        public async Task<OrderResponseDto?> GetOrderByIdAsync(
            int orderId,
            string userId)
        {
            var order = await _orderRepository.GetByIdAsync(orderId);

            if (order == null || order.UserId != userId)
                return null;

            return MapOrder(order);
        }

        // 4. Cancel an eligible order
        public async Task<OrderResponseDto> CancelOrderAsync(
            int orderId,
            string userId)
        {
            using var transaction =
                await _context.Database.BeginTransactionAsync();

            try
            {
                var order = await _orderRepository.GetByIdAsync(orderId);

                if (order == null || order.UserId != userId)
                    throw new KeyNotFoundException("Order not found.");

                if (order.OrderStatus != OrderStatus.Pending &&
                    order.OrderStatus != OrderStatus.Confirmed)
                {
                    throw new InvalidOperationException(
                        "This order cannot be cancelled.");
                }

                // Restore medicine stock
                foreach (var item in order.OrderItems)
                {
                    var medicine = await _medicineRepository
                        .GetByIdAsync(item.MedicineId);

                    if (medicine == null)
                        throw new InvalidOperationException(
                            "Cannot restore stock because a medicine was not found.");

                    medicine.StockQuantity += item.Quantity;

                    await _medicineRepository.UpdateAsync(medicine);
                }

                order.OrderStatus = OrderStatus.Cancelled;

                await _orderRepository.UpdateAsync(order);

                await transaction.CommitAsync();

                return MapOrder(order);
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        // 5. Admin gets all orders
        public async Task<List<OrderResponseDto>> GetAllOrdersAsync()
        {
            var orders = await _orderRepository.GetAllAsync();

            return orders.Select(MapOrder).ToList();
        }

        // 6. Admin updates order status
        public async Task<OrderResponseDto> UpdateOrderStatusAsync(
            int orderId,
            UpdateOrderStatusDto dto)
        {
            if (!Enum.IsDefined(typeof(OrderStatus), dto.OrderStatus))
                throw new ArgumentException("Invalid order status.");

            if (dto.OrderStatus == OrderStatus.Cancelled)
                throw new InvalidOperationException(
                    "Use the cancellation operation to cancel an order.");

            var order = await _orderRepository.GetByIdAsync(orderId);

            if (order == null)
                throw new KeyNotFoundException("Order not found.");

            if (order.OrderStatus == OrderStatus.Cancelled ||
                order.OrderStatus == OrderStatus.Delivered)
            {
                throw new InvalidOperationException(
                    "This order status cannot be changed.");
            }

            order.OrderStatus = dto.OrderStatus;

            await _orderRepository.UpdateAsync(order);

            return MapOrder(order);
        }

        // Map Order model to response DTO
        private static OrderResponseDto MapOrder(Order order)
        {
            return new OrderResponseDto
            {
                OrderId = order.OrderId,
                UserId = order.UserId,
                OrderDate = order.OrderDate,
                TotalAmount = order.TotalAmount,
                OrderStatus = order.OrderStatus,

                OrderItems = order.OrderItems.Select(item =>
                    new OrderItemResponseDto
                    {
                        MedicineId = item.MedicineId,
                        MedicineName = item.Medicine?.Name ?? string.Empty,
                        Quantity = item.Quantity,
                        UnitPrice = item.UnitPrice,
                        SubTotal = item.SubTotal
                    }).ToList()
            };
        }
    }
}
