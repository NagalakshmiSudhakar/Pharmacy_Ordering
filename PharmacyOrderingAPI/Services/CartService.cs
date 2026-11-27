
using PharmacyOrderingAPI.DTOs.Cart;
using PharmacyOrderingAPI.Models;
using PharmacyOrderingAPI.Repository.Interfaces;
using PharmacyOrderingAPI.Services.Interfaces;

namespace PharmacyOrderingAPI.Services
{
    public class CartService : ICartService
    {
        private readonly ICartRepository _cartRepository;
        private readonly IMedicineRepository _medicineRepository;

        public CartService(
            ICartRepository cartRepository,
            IMedicineRepository medicineRepository)
        {
            _cartRepository = cartRepository;
            _medicineRepository = medicineRepository;
        }

        // Add medicine to cart
        public async Task<CartResponseDto> AddToCartAsync(
            string userId,
            AddToCartDto dto)
        {
            if (dto.Quantity <= 0)
                throw new ArgumentException(
                    "Quantity must be greater than zero.");

            // Get medicine from existing Medicine Repository
            var medicine = await _medicineRepository
                .GetByIdAsync(dto.MedicineId);

            if (medicine == null || !medicine.IsActive)
                throw new KeyNotFoundException(
                    "Medicine not found or unavailable.");

            // Check stock availability
            if (dto.Quantity > medicine.StockQuantity)
                throw new InvalidOperationException(
                    "Insufficient medicine stock.");

            // Get customer's cart
            var cart = await _cartRepository
                .GetCartByUserIdAsync(userId);

            // Create cart if it does not exist
            if (cart == null)
            {
                cart = new Cart
                {
                    UserId = userId,
                    CreatedAt = DateTime.UtcNow
                };

                await _cartRepository.AddAsync(cart);
            }

            // Check whether medicine already exists in cart
            var existingItem = cart.CartItems
                .FirstOrDefault(item =>
                    item.MedicineId == dto.MedicineId);

            if (existingItem != null)
            {
                int updatedQuantity =
                    existingItem.Quantity + dto.Quantity;

                if (updatedQuantity > medicine.StockQuantity)
                    throw new InvalidOperationException(
                        "Requested quantity exceeds available stock.");

                existingItem.Quantity = updatedQuantity;

                await _cartRepository.SaveChangesAsync();
            }
            else
            {
                var cartItem = new CartItem
                {
                    CartId = cart.CartId,
                    MedicineId = medicine.MedicineId,
                    Quantity = dto.Quantity
                };

                await _cartRepository.AddCartItemAsync(cartItem);
            }

            var updatedCart = await _cartRepository
                .GetCartByUserIdAsync(userId);

            return MapCart(updatedCart!);
        }

        // Get customer's cart
        public async Task<CartResponseDto> GetCartAsync(
            string userId)
        {
            var cart = await _cartRepository
                .GetCartByUserIdAsync(userId);

            if (cart == null)
            {
                return new CartResponseDto
                {
                    UserId = userId,
                    Items = new List<CartItemResponseDto>(),
                    TotalAmount = 0
                };
            }

            return MapCart(cart);
        }

        // Update cart item quantity
        public async Task<CartResponseDto> UpdateCartItemAsync(
            string userId,
            int cartItemId,
            UpdateCartItemDto dto)
        {
            if (dto.Quantity <= 0)
                throw new ArgumentException(
                    "Quantity must be greater than zero.");

            var cart = await _cartRepository
                .GetCartByUserIdAsync(userId);

            if (cart == null)
                throw new KeyNotFoundException("Cart not found.");

            var cartItem = await _cartRepository
                .GetCartItemByIdAsync(cartItemId, cart.CartId);

            if (cartItem == null)
                throw new KeyNotFoundException(
                    "Cart item not found.");

            var medicine = await _medicineRepository
                .GetByIdAsync(cartItem.MedicineId);

            if (medicine == null || !medicine.IsActive)
                throw new InvalidOperationException(
                    "Medicine is unavailable.");

            if (dto.Quantity > medicine.StockQuantity)
                throw new InvalidOperationException(
                    "Insufficient medicine stock.");

            cartItem.Quantity = dto.Quantity;

            await _cartRepository.SaveChangesAsync();

            var updatedCart = await _cartRepository
                .GetCartByUserIdAsync(userId);

            return MapCart(updatedCart!);
        }

        // Remove one cart item
        public async Task<CartResponseDto> RemoveCartItemAsync(
            string userId,
            int cartItemId)
        {
            var cart = await _cartRepository
                .GetCartByUserIdAsync(userId);

            if (cart == null)
                throw new KeyNotFoundException("Cart not found.");

            var cartItem = await _cartRepository
                .GetCartItemByIdAsync(cartItemId, cart.CartId);

            if (cartItem == null)
                throw new KeyNotFoundException(
                    "Cart item not found.");

            await _cartRepository.RemoveAsync(cartItem);

            var updatedCart = await _cartRepository
                .GetCartByUserIdAsync(userId);

            return MapCart(updatedCart!);
        }

        // Clear all items from cart
        public async Task<CartResponseDto> ClearCartAsync(
            string userId)
        {
            var cart = await _cartRepository
                .GetCartByUserIdAsync(userId);

            if (cart != null)
            {
                await _cartRepository
                    .ClearCartAsync(cart.CartId);
            }

            return new CartResponseDto
            {
                CartId = cart?.CartId ?? 0,
                UserId = userId,
                Items = new List<CartItemResponseDto>(),
                TotalAmount = 0
            };
        }

        // Convert Cart model into CartResponseDto
        private static CartResponseDto MapCart(Cart cart)
        {
            var items = cart.CartItems.Select(item =>
            {
                decimal unitPrice = item.Medicine?.Price ?? 0;

                return new CartItemResponseDto
                {
                    CartItemId = item.CartItemId,
                    MedicineId = item.MedicineId,
                    MedicineName = item.Medicine?.Name
                        ?? string.Empty,
                    Quantity = item.Quantity,
                    UnitPrice = unitPrice,
                    SubTotal = item.Quantity * unitPrice
                };
            }).ToList();

            return new CartResponseDto
            {
                CartId = cart.CartId,
                UserId = cart.UserId,
                Items = items,
                TotalAmount = items.Sum(item => item.SubTotal)
            };
        }
    }
}
