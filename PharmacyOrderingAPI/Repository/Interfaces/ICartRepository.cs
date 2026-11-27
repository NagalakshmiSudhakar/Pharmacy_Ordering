
using PharmacyOrderingAPI.Models;

namespace PharmacyOrderingAPI.Repository.Interfaces
{
    public interface ICartRepository
    {
        Task<Cart?> GetCartByUserIdAsync(string userId);

        Task<CartItem?> GetCartItemByIdAsync(
            int cartItemId,
            int cartId);

        Task AddAsync(Cart cart);

        Task AddCartItemAsync(CartItem cartItem);

        Task UpdateAsync(Cart cart);

        Task RemoveAsync(CartItem cartItem);

        Task ClearCartAsync(int cartId);

        Task SaveChangesAsync();
    }
}
