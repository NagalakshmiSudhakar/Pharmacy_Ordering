
using PharmacyOrderingAPI.Enums;

namespace PharmacyOrderingAPI.DTOs.Order
{
	public class OrderResponseDto
	{
		public int OrderId { get; set; }

		public string UserId { get; set; } = string.Empty;

		public DateTime OrderDate { get; set; }

		public decimal TotalAmount { get; set; }

		public OrderStatus OrderStatus { get; set; }

		public List<OrderItemResponseDto> OrderItems { get; set; }
			= new List<OrderItemResponseDto>();
	}
}
