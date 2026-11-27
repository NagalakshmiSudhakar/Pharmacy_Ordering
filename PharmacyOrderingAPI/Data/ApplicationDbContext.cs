
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using PharmacyOrderingAPI.Models;

namespace PharmacyOrderingAPI.Data
{
    public class ApplicationDbContext : IdentityDbContext<ApplicationUser>
    {
        public ApplicationDbContext(
            DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        // Medicine Module
        public DbSet<Medicine> Medicines => Set<Medicine>();

        // Cart Module
        public DbSet<Cart> Carts => Set<Cart>();
        public DbSet<CartItem> CartItems => Set<CartItem>();

        // Order Module
        public DbSet<Order> Orders => Set<Order>();
        public DbSet<OrderItem> OrderItems => Set<OrderItem>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Identity configuration
            base.OnModelCreating(modelBuilder);

            // ApplicationUser configuration
            modelBuilder.Entity<ApplicationUser>(entity =>
            {
                entity.Property(u => u.FullName)
                    .IsRequired()
                    .HasMaxLength(100);

                entity.Property(u => u.IsActive)
                    .IsRequired()
                    .HasDefaultValue(true);
            });

            // Medicine configuration
            modelBuilder.Entity<Medicine>(entity =>
            {
                entity.HasKey(m => m.MedicineId);

                entity.Property(m => m.Name)
                    .IsRequired()
                    .HasMaxLength(100);

                entity.Property(m => m.Description)
                    .IsRequired()
                    .HasMaxLength(500);

                entity.Property(m => m.Category)
                    .IsRequired()
                    .HasMaxLength(50);

                entity.Property(m => m.Price)
                    .HasColumnType("decimal(10,2)");
            });

            // Cart configuration
            modelBuilder.Entity<Cart>(entity =>
            {
                entity.HasIndex(c => c.UserId)
                    .IsUnique();

                entity.HasOne<ApplicationUser>()
                    .WithMany()
                    .HasForeignKey(c => c.UserId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // Cart - CartItem relationship
            modelBuilder.Entity<CartItem>()
                .HasOne(ci => ci.Cart)
                .WithMany(c => c.CartItems)
                .HasForeignKey(ci => ci.CartId)
                .OnDelete(DeleteBehavior.Cascade);

            // CartItem - Medicine relationship
            modelBuilder.Entity<CartItem>()
                .HasOne(ci => ci.Medicine)
                .WithMany()
                .HasForeignKey(ci => ci.MedicineId)
                .OnDelete(DeleteBehavior.Restrict);

            // Prevent duplicate medicines in the same cart
            modelBuilder.Entity<CartItem>()
                .HasIndex(ci => new { ci.CartId, ci.MedicineId })
                .IsUnique();

            // Order configuration
            modelBuilder.Entity<Order>(entity =>
            {
                entity.Property(o => o.TotalAmount)
                    .HasPrecision(18, 2);

                entity.HasOne<ApplicationUser>()
                    .WithMany()
                    .HasForeignKey(o => o.UserId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // Order - OrderItem relationship
            modelBuilder.Entity<OrderItem>()
                .HasOne(oi => oi.Order)
                .WithMany(o => o.OrderItems)
                .HasForeignKey(oi => oi.OrderId)
                .OnDelete(DeleteBehavior.Cascade);

            // OrderItem - Medicine relationship
            modelBuilder.Entity<OrderItem>()
                .HasOne(oi => oi.Medicine)
                .WithMany()
                .HasForeignKey(oi => oi.MedicineId)
                .OnDelete(DeleteBehavior.Restrict);

            // OrderItem decimal precision
            modelBuilder.Entity<OrderItem>(entity =>
            {
                entity.Property(oi => oi.UnitPrice)
                    .HasPrecision(10, 2);

                entity.Property(oi => oi.SubTotal)
                    .HasPrecision(18, 2);
            });
        }
    }
}
