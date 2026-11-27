
namespace PharmacyOrderingAPI.Models
{
    public class OrderItem
    {
        public int OrderItemId { get; set; }

        public int OrderId { get; set; }

        public int MedicineId { get; set; }

        public int Quantity { get; set; }

        public decimal UnitPrice { get; set; }

        public decimal SubTotal { get; set; }

        // Navigation properties
        public Order? Order { get; set; }

        public Medicine? Medicine { get; set; }
    }
}
