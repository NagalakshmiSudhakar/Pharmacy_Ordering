
namespace PharmacyOrderingAPI.DTOs.Order
{
	public class OrderItemResponseDto
	{
		public int MedicineId { get; set; }

		public string MedicineName { get; set; } = string.Empty;

		public int Quantity { get; set; }

		public decimal UnitPrice { get; set; }

		public decimal SubTotal { get; set; }
	}
}
