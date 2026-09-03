using System.IdentityModel.Tokens.Jwt;
using System.Net.Http.Json;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json.Serialization;
using Google.Apis.Auth;
using HabitTracker.Data;
using HabitTracker.DTOs;
using HabitTracker.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace HabitTracker.Services
{
    public class AuthService : IAuthService
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _config;
        private readonly IHttpClientFactory _httpClientFactory;

        public AuthService(
            ApplicationDbContext context,
            IConfiguration config,
            IHttpClientFactory httpClientFactory)
        {
            _context = context;
            _config = config;
            _httpClientFactory = httpClientFactory;
        }

        public async Task<AuthResponse?> RegisterAsync(RegisterRequest request)
        {
            var email = NormalizeEmail(request.Email);

            if (await _context.Users.AnyAsync(u => u.Email.ToLower() == email))
                return null;

            var passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);

            var user = new User
            {
                Name = request.Name.Trim(),
                Email = email,
                PasswordHash = passwordHash
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return BuildAuthResponse(user);
        }

        public async Task<AuthResponse?> LoginAsync(LoginRequest request)
        {
            var email = NormalizeEmail(request.Email);
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Email.ToLower() == email);

            if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
                return null;

            return BuildAuthResponse(user);
        }
        public async Task<AuthResponse?> LoginWithGoogleAsync(string authorizationCode)
{
    var clientId =
        _config["ExternalAuth:GoogleClientId"];

    var clientSecret =
        _config["ExternalAuth:GoogleClientSecret"];

    var redirectUri =
        _config["ExternalAuth:GoogleRedirectUri"]
        ?? "http://localhost:3000";

    if (string.IsNullOrWhiteSpace(clientId) ||
        string.IsNullOrWhiteSpace(clientSecret) ||
        string.IsNullOrWhiteSpace(authorizationCode))
    {
        return null;
    }

    var client =
        _httpClientFactory.CreateClient();

    try
    {
        using var tokenRequest =
            new HttpRequestMessage(
                HttpMethod.Post,
                "https://oauth2.googleapis.com/token"
            );

        tokenRequest.Content =
            new FormUrlEncodedContent(
                new Dictionary<string, string>
                {
                    ["code"] = authorizationCode,
                    ["client_id"] = clientId,
                    ["client_secret"] = clientSecret,
                    ["redirect_uri"] = redirectUri,
                    ["grant_type"] =
                        "authorization_code"
                }
            );

        using var tokenResponse =
            await client.SendAsync(tokenRequest);

        if (!tokenResponse.IsSuccessStatusCode)
        {
            return null;
        }

        var googleTokens =
            await tokenResponse.Content
                .ReadFromJsonAsync<GoogleTokenResponse>();

        if (string.IsNullOrWhiteSpace(
                googleTokens?.IdToken))
        {
            return null;
        }

        var payload =
            await GoogleJsonWebSignature.ValidateAsync(
                googleTokens.IdToken,
                new GoogleJsonWebSignature
                    .ValidationSettings
                {
                    Audience =
                        new[] { clientId }
                }
            );

        if (!payload.EmailVerified ||
            string.IsNullOrWhiteSpace(
                payload.Email) ||
            string.IsNullOrWhiteSpace(
                payload.Subject))
        {
            return null;
        }

        var name =
            string.IsNullOrWhiteSpace(payload.Name)
                ? payload.Email.Split('@')[0]
                : payload.Name;

        return await SignInExternalAsync(
            "Google",
            payload.Subject,
            payload.Email,
            name
        );
    }
    catch (
        InvalidJwtException
    )
    {
        return null;
    }
    catch (
        HttpRequestException
    )
    {
        return null;
    }
}
        public async Task<AuthResponse?> LoginWithFacebookAsync(string accessToken)
        {
            var appId = _config["ExternalAuth:FacebookAppId"];
            var appSecret = _config["ExternalAuth:FacebookAppSecret"];
            var apiVersion = _config["ExternalAuth:FacebookApiVersion"] ?? "v25.0";

            if (string.IsNullOrWhiteSpace(appId) || string.IsNullOrWhiteSpace(appSecret))
                return null;

            var client = _httpClientFactory.CreateClient();

            try
            {
                var appTokenUrl =
                    $"https://graph.facebook.com/oauth/access_token?client_id={Uri.EscapeDataString(appId)}&client_secret={Uri.EscapeDataString(appSecret)}&grant_type=client_credentials";
                var appToken = await client.GetFromJsonAsync<FacebookAppTokenResponse>(appTokenUrl);

                if (string.IsNullOrWhiteSpace(appToken?.AccessToken))
                    return null;

                var debugUrl =
                    $"https://graph.facebook.com/{apiVersion}/debug_token?input_token={Uri.EscapeDataString(accessToken)}&access_token={Uri.EscapeDataString(appToken.AccessToken)}";
                var debug = await client.GetFromJsonAsync<FacebookDebugResponse>(debugUrl);

                if (debug?.Data == null ||
                    !debug.Data.IsValid ||
                    debug.Data.AppId != appId ||
                    string.IsNullOrWhiteSpace(debug.Data.UserId))
                    return null;

                var appSecretProof = CreateAppSecretProof(accessToken, appSecret);
                var profileUrl =
                    $"https://graph.facebook.com/{apiVersion}/me?fields=id,name,email&access_token={Uri.EscapeDataString(accessToken)}&appsecret_proof={appSecretProof}";
                var profile = await client.GetFromJsonAsync<FacebookProfileResponse>(profileUrl);

                if (profile == null ||
                    profile.Id != debug.Data.UserId ||
                    string.IsNullOrWhiteSpace(profile.Email))
                    return null;

                var name = string.IsNullOrWhiteSpace(profile.Name)
                    ? profile.Email.Split('@')[0]
                    : profile.Name;

                return await SignInExternalAsync("Facebook", profile.Id, profile.Email, name);
            }
            catch (HttpRequestException)
            {
                return null;
            }
        }

        private async Task<AuthResponse?> SignInExternalAsync(
            string provider,
            string providerUserId,
            string email,
            string name)
        {
            var externalLogin = await _context.ExternalLogins
                .Include(login => login.User)
                .FirstOrDefaultAsync(login =>
                    login.Provider == provider && login.ProviderUserId == providerUserId);

            if (externalLogin != null)
                return BuildAuthResponse(externalLogin.User);

            var normalizedEmail = NormalizeEmail(email);
            var existingUser = await _context.Users
                .FirstOrDefaultAsync(user => user.Email.ToLower() == normalizedEmail);

            // Do not silently link a social identity to an existing password account by email.
            if (existingUser != null)
                return null;

            var randomPassword = Convert.ToHexString(RandomNumberGenerator.GetBytes(32));
            var user = new User
            {
                Name = name.Trim(),
                Email = normalizedEmail,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(randomPassword)
            };

            user.ExternalLogins.Add(new ExternalLogin
            {
                Provider = provider,
                ProviderUserId = providerUserId
            });

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return BuildAuthResponse(user);
        }

        private AuthResponse BuildAuthResponse(User user) => new()
        {
            Token = GenerateJwtToken(user.Id, user.Email, user.Name),
            Name = user.Name,
            Email = user.Email
        };

        private static string NormalizeEmail(string email) => email.Trim().ToLowerInvariant();

        private static string CreateAppSecretProof(string accessToken, string appSecret)
        {
            using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(appSecret));
            var hash = hmac.ComputeHash(Encoding.UTF8.GetBytes(accessToken));
            return Convert.ToHexString(hash).ToLowerInvariant();
        }

        public string GenerateJwtToken(int userId, string email, string name)
        {
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(
                _config["Jwt:Key"] ?? throw new InvalidOperationException("JWT Key not configured")));

            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, userId.ToString()),
                new Claim(JwtRegisteredClaimNames.Email, email),
                new Claim("name", name),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };

            var token = new JwtSecurityToken(
                issuer: _config["Jwt:Issuer"],
                audience: _config["Jwt:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddDays(7),
                signingCredentials: creds);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        private sealed class FacebookAppTokenResponse
        {
            [JsonPropertyName("access_token")]
            public string AccessToken { get; set; } = string.Empty;
        }

        private sealed class GoogleTokenResponse
{
    [JsonPropertyName("id_token")]
    public string IdToken { get; set; }
        = string.Empty;
}

        private sealed class FacebookDebugResponse
        {
            [JsonPropertyName("data")]
            public FacebookDebugData? Data { get; set; }
        }

        private sealed class FacebookDebugData
        {
            [JsonPropertyName("app_id")]
            public string AppId { get; set; } = string.Empty;

            [JsonPropertyName("is_valid")]
            public bool IsValid { get; set; }

            [JsonPropertyName("user_id")]
            public string UserId { get; set; } = string.Empty;
        }

        private sealed class FacebookProfileResponse
        {
            [JsonPropertyName("id")]
            public string Id { get; set; } = string.Empty;

            [JsonPropertyName("name")]
            public string Name { get; set; } = string.Empty;

            [JsonPropertyName("email")]
            public string Email { get; set; } = string.Empty;
        }
    }
}
