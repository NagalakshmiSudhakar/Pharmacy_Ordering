
using Microsoft.AspNetCore.Identity;
using PharmacyOrderingAPI.Models;

namespace PharmacyOrderingAPI.Data
{
    public class RoleSeeder
    {
        private readonly RoleManager<IdentityRole> _roleManager;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly IConfiguration _configuration;

        public RoleSeeder(
            RoleManager<IdentityRole> roleManager,
            UserManager<ApplicationUser> userManager,
            IConfiguration configuration)
        {
            _roleManager = roleManager;
            _userManager = userManager;
            _configuration = configuration;
        }

        public async Task SeedAsync()
        {
            // Create roles if they don't exist
            string[] roles = { "Admin", "Customer" };

            foreach (var role in roles)
            {
                if (!await _roleManager.RoleExistsAsync(role))
                {
                    var result = await _roleManager.CreateAsync(
                        new IdentityRole(role));

                    if (!result.Succeeded)
                    {
                        throw new InvalidOperationException(
                            $"Failed to create role {role}: " +
                            string.Join(", ", result.Errors.Select(e => e.Description)));
                    }
                }
            }

            // Read Admin credentials from secure configuration
            var fullName = _configuration["AdminSeed:FullName"];
            var email = _configuration["AdminSeed:Email"]?
                .Trim().ToLowerInvariant();
            var password = _configuration["AdminSeed:Password"];

            if (string.IsNullOrWhiteSpace(fullName) ||
                string.IsNullOrWhiteSpace(email) ||
                string.IsNullOrWhiteSpace(password))
            {
                throw new InvalidOperationException(
                    "Admin seed configuration is missing.");
            }

            // Avoid duplicate Admin creation
            var existingUser = await _userManager.FindByEmailAsync(email);
            

            if (existingUser != null)
            {
                if (!await _userManager.IsInRoleAsync(existingUser, "Admin"))
                {
                    throw new InvalidOperationException(
                        "The configured Admin email already belongs to a non-Admin account. " +
                        "Please configure a different AdminSeed email.");
                }

                Console.WriteLine("Admin account already exists.");
                return;
            }

            var admin = new ApplicationUser
            {
                UserName = email,
                Email = email,
                FullName = fullName,
                EmailConfirmed = true,
                IsActive = true
            };

            var createResult = await _userManager.CreateAsync(admin, password);

            if (!createResult.Succeeded)
            {
                throw new InvalidOperationException(
                    "Admin creation failed: " +
                    string.Join(", ", createResult.Errors.Select(e => e.Description)));
            }

            var addRoleResult = await _userManager.AddToRoleAsync(admin, "Admin");

            if (!addRoleResult.Succeeded)
            {
                throw new InvalidOperationException(
                    "Failed to assign Admin role: " +
                    string.Join(", ", addRoleResult.Errors.Select(e => e.Description)));
            }

            Console.WriteLine("Initial Admin account created successfully.");
        }
    }
}
