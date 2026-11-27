
namespace PharmacyOrderingAPI.DTOs.Cart
{
    public class CartResponseDto
    {
        public int CartId { get; set; }

        public string UserId { get; set; } = string.Empty;

        public List<CartItemResponseDto> Items { get; set; }
            = new List<CartItemResponseDto>();

        public decimal TotalAmount { get; set; }
    }
}
