using HabitTracker.DTOs;
using HabitTracker.Services;
using Microsoft.AspNetCore.Mvc;

namespace HabitTracker.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly IConfiguration _configuration;

        public AuthController(IAuthService authService, IConfiguration configuration)
        {
            _authService = authService;
            _configuration = configuration;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register(RegisterRequest request)
        {
            var response = await _authService.RegisterAsync(request);
            if (response == null)
                return BadRequest(new { message = "Email already exists" });
            return Ok(response);
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginRequest request)
        {
            var response = await _authService.LoginAsync(request);
            if (response == null)
                return Unauthorized(new { message = "Invalid email or password" });
            return Ok(response);
        }

       [HttpPost("google")]
public async Task<IActionResult> Google(
    ExternalAuthRequest request)
{
    if (string.IsNullOrWhiteSpace(
        _configuration[
            "ExternalAuth:GoogleClientId"]))
    {
        return StatusCode(
            503,
            new
            {
                message =
                    "Google sign-in is not configured yet."
            }
        );
    }

    if (!Request.Headers.TryGetValue(
            "X-Requested-With",
            out var requestedWith) ||
        !string.Equals(
            requestedWith.ToString(),
            "XmlHttpRequest",
            StringComparison.OrdinalIgnoreCase))
    {
        return BadRequest(
            new
            {
                message =
                    "Invalid Google sign-in request."
            }
        );
    }

    var response =
        await _authService
            .LoginWithGoogleAsync(
                request.Credential);

    if (response == null)
    {
        return Unauthorized(
            new
            {
                message =
                    "Google sign-in failed. If this email already has an account, sign in with its existing method."
            }
        );
    }

    return Ok(response);
}

        [HttpPost("facebook")]
        public async Task<IActionResult> Facebook(ExternalAuthRequest request)
        {
            if (string.IsNullOrWhiteSpace(_configuration["ExternalAuth:FacebookAppId"]) ||
                string.IsNullOrWhiteSpace(_configuration["ExternalAuth:FacebookAppSecret"]))
                return StatusCode(503, new { message = "Facebook sign-in is not configured yet." });

            var response = await _authService.LoginWithFacebookAsync(request.Credential);
            if (response == null)
                return Unauthorized(new
                {
                    message = "Facebook sign-in failed. Make sure Facebook shared your email, or use your existing sign-in method."
                });

            return Ok(response);
        }
    }
}
