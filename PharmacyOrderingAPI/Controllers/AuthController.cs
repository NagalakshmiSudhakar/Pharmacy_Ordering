
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using PharmacyOrderingAPI.DTOs;
using PharmacyOrderingAPI.Helpers;
using PharmacyOrderingAPI.Models;

namespace PharmacyOrderingAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly SignInManager<ApplicationUser> _signInManager;
        private readonly JwtHelper _jwtHelper;

        public AuthController(
            UserManager<ApplicationUser> userManager,
            SignInManager<ApplicationUser> signInManager,
            JwtHelper jwtHelper)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _jwtHelper = jwtHelper;
        }

        // POST: api/auth/register
        [HttpPost("register")]
        public async Task<IActionResult> Register(RegisterDto dto)
        {
            // Normalize email
            var email = dto.Email.Trim().ToLowerInvariant();

            // Check whether email already exists
            var existingUser = await _userManager.FindByEmailAsync(email);

            if (existingUser != null)
            {
                return BadRequest(new
                {
                    message = "Email is already registered."
                });
            }

            // Create new customer
            var user = new ApplicationUser
            {
                UserName = email,
                Email = email,
                FullName = dto.FullName.Trim(),
                PhoneNumber = dto.PhoneNumber.Trim(),
                IsActive = true,
                EmailConfirmed = false,
                CreatedAt = DateTime.UtcNow
            };

            // Create user with hashed password
            var result = await _userManager.CreateAsync(
                user,
                dto.Password
            );

            if (!result.Succeeded)
            {
                return BadRequest(new
                {
                    message = "Registration failed.",
                    errors = result.Errors.Select(e => e.Description)
                });
            }

            // Assign Customer role
            var roleResult = await _userManager.AddToRoleAsync(
                user,
                "Customer"
            );

            if (!roleResult.Succeeded)
            {
                await _userManager.DeleteAsync(user);

                return StatusCode(500, new
                {
                    message = "Unable to assign Customer role."
                });
            }

            return Ok(new
            {
                message = "Customer registered successfully.",
                userId = user.Id,
                fullName = user.FullName,
                email = user.Email,
                phoneNumber = user.PhoneNumber,
                role = "Customer"
            });
        }

        // POST: api/auth/login
        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginDto dto)
        {
            // Normalize email
            var email = dto.Email.Trim().ToLowerInvariant();

            // Find user
            var user = await _userManager.FindByEmailAsync(email);

            if (user == null)
            {
                return Unauthorized(new
                {
                    message = "Invalid email or password."
                });
            }

            // Check account status
            if (!user.IsActive)
            {
                return Unauthorized(new
                {
                    message = "Your account is inactive. Contact the administrator."
                });
            }

            // Validate password
            var passwordValid =
                await _signInManager.CheckPasswordSignInAsync(
                    user,
                    dto.Password,
                    lockoutOnFailure: true
                );

            if (!passwordValid.Succeeded)
            {
                return Unauthorized(new
                {
                    message = "Invalid email or password."
                });
            }

            // Get assigned roles
            var roles = await _userManager.GetRolesAsync(user);

            if (roles.Count == 0)
            {
                return Unauthorized(new
                {
                    message = "User has no assigned role."
                });
            }

            // Generate JWT token
            var tokenResult = _jwtHelper.GenerateToken(
                user,
                roles
            );

            // Prepare response — mark Expiration as UTC so it serialises with 'Z'
            var response = new AuthResponseDto
            {
                UserId = user.Id,
                FullName = user.FullName,
                Email = user.Email!,
                Role = roles[0],
                Token = tokenResult.Token,
                Expiration = DateTime.SpecifyKind(tokenResult.Expiration, DateTimeKind.Utc)
            };

            return Ok(response);
        }
    }
}
