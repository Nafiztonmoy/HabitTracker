using HabitTracker.DTOs;

namespace HabitTracker.Services
{
    public interface IAuthService
    {
        Task<AuthResponse?> RegisterAsync(RegisterRequest request);
        Task<AuthResponse?> LoginAsync(LoginRequest request);
        Task<AuthResponse?> LoginWithGoogleAsync(string credential);
        Task<AuthResponse?> LoginWithFacebookAsync(string accessToken);
        string GenerateJwtToken(int userId, string email, string name);
    }
}
