
using PharmacyOrderingAPI.Enums;
namespace PharmacyOrderingAPI.Models
{
    public class Order
    {
        public int OrderId { get; set; }

        public string UserId { get; set; } = string.Empty;

        public DateTime OrderDate { get; set; } = DateTime.UtcNow;

        public decimal TotalAmount { get; set; }

        public OrderStatus OrderStatus { get; set; }
            = OrderStatus.Pending;

        // One order can contain multiple order items
        public ICollection<OrderItem> OrderItems { get; set; }
            = new List<OrderItem>();
    }
}
