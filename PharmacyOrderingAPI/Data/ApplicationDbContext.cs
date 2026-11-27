
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

        // Medicine Management
        public DbSet<Medicine> Medicines => Set<Medicine>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Identity configuration
            base.OnModelCreating(modelBuilder);

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
        }
    }
}
