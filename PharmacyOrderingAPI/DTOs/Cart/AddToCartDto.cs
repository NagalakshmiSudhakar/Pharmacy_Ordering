
using System.ComponentModel.DataAnnotations;

namespace PharmacyOrderingAPI.DTOs.Cart
{
    public class AddToCartDto
    {
        [Required]
        [Range(1, int.MaxValue, ErrorMessage = "Please select a valid medicine.")]
        public int MedicineId { get; set; }

        [Required]
        [Range(1, 100, ErrorMessage = "Quantity must be between 1 and 100.")]
        public int Quantity { get; set; }
    }
}
