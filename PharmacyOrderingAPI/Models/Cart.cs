
namespace PharmacyOrderingAPI.Models
{
    public class Cart
    {
        public int CartId { get; set; }

        // Each cart belongs to one registered customer
        public string UserId { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // One cart can contain multiple cart items
        public ICollection<CartItem> CartItems { get; set; }
            = new List<CartItem>();
    }
}
