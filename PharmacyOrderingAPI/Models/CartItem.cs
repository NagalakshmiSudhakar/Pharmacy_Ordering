
namespace PharmacyOrderingAPI.Models
{
    public class CartItem
    {
        public int CartItemId { get; set; }

        public int CartId { get; set; }

        public int MedicineId { get; set; }

        public int Quantity { get; set; }

        // Navigation properties
        public Cart? Cart { get; set; }

        public Medicine? Medicine { get; set; }
    }
}
