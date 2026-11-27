
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
            var email = dto.Email.Trim().ToLowerInvariant();

            var existingUser = await _userManager.FindByEmailAsync(email);

            if (existingUser != null)
            {
                return BadRequest(new
                {
                    message = "Email is already registered."
                });
            }

            var user = new ApplicationUser
            {
                UserName = email,
                Email = email,
                FullName = dto.FullName.Trim(),
                IsActive = true,
                EmailConfirmed = false
            };

            var result = await _userManager.CreateAsync(user, dto.Password);

            if (!result.Succeeded)
            {
                return BadRequest(new
                {
                    message = "Registration failed.",
                    errors = result.Errors.Select(e => e.Description)
                });
            }

            var roleResult = await _userManager.AddToRoleAsync(user, "Customer");

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
                email = user.Email,
                role = "Customer"
            });
        }

        // POST: api/auth/login
        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginDto dto)
        {
            var email = dto.Email.Trim().ToLowerInvariant();

            var user = await _userManager.FindByEmailAsync(email);

            if (user == null)
            {
                return Unauthorized(new
                {
                    message = "Invalid email or password."
                });
            }

            if (!user.IsActive)
            {
                return Unauthorized(new
                {
                    message = "Your account is inactive. Contact the administrator."
                });
            }

            var passwordValid = await _signInManager.CheckPasswordSignInAsync(
                user,
                dto.Password,
                lockoutOnFailure: true);

            if (!passwordValid.Succeeded)
            {
                return Unauthorized(new
                {
                    message = "Invalid email or password."
                });
            }

            var roles = await _userManager.GetRolesAsync(user);

            if (roles.Count == 0)
            {
                return Unauthorized(new
                {
                    message = "User has no assigned role."
                });
            }

            var tokenResult = _jwtHelper.GenerateToken(user, roles);

            var response = new AuthResponseDto
            {
                UserId = user.Id,
                FullName = user.FullName,
                Email = user.Email!,
                Role = roles[0],
                Token = tokenResult.Token,
                Expiration = tokenResult.Expiration
            };

            return Ok(response);
        }
    }
}
