
using System.ComponentModel.DataAnnotations;
using PharmacyOrderingAPI.Enums;

namespace PharmacyOrderingAPI.DTOs.Order
{
	public class UpdateOrderStatusDto
	{
		[Required]
		[EnumDataType(typeof(OrderStatus),
			ErrorMessage = "Please provide a valid order status.")]
		public OrderStatus OrderStatus { get; set; }
	}
}
