
using PharmacyOrderingAPI.DTOs.Cart;

namespace PharmacyOrderingAPI.Services.Interfaces
{
    public interface ICartService
    {
        Task<CartResponseDto> AddToCartAsync(
            string userId,
            AddToCartDto dto);

        Task<CartResponseDto> GetCartAsync(
            string userId);

        Task<CartResponseDto> UpdateCartItemAsync(
            string userId,
            int cartItemId,
            UpdateCartItemDto dto);

        Task<CartResponseDto> RemoveCartItemAsync(
            string userId,
            int cartItemId);

        Task<CartResponseDto> ClearCartAsync(
            string userId);
    }
}
