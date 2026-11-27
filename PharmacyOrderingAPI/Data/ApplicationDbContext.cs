
using Microsoft.EntityFrameworkCore;
using PharmacyOrderingAPI.Models;

namespace PharmacyOrderingAPI.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<Medicine> Medicines { get; set; }
    }
}
