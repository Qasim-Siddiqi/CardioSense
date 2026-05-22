using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using CardioSense.API.Data;
using CardioSense.API.DTOs.Auth;
using CardioSense.API.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace CardioSense.API.Services;

public class AuthService : IAuthService
{
    private readonly AppDbContext _db;
    private readonly IConfiguration _config;

    public AuthService(AppDbContext db, IConfiguration config)
    {
        _db = db;
        _config = config;
    }

    public async Task<AuthResponseDto?> RegisterAsync(RegisterDto dto)
    {
        // Reject if email already exists
        bool emailTaken = await _db.Users.AnyAsync(u => u.Email == dto.Email);
        if (emailTaken) return null;

        var user = new User
        {
            FullName = dto.FullName,
            Email = dto.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            Role = "Patient",
            CreatedAt = DateTime.UtcNow
        };

        _db.Users.Add(user);
        await _db.SaveChangesAsync();

        return BuildAuthResponse(user);
    }

    public async Task<AuthResponseDto?> LoginAsync(LoginDto dto)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);

        // Return null if user not found or password wrong
        if (user == null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
            return null;

        return BuildAuthResponse(user);
    }

    // Builds the JWT and wraps it in the response DTO
    private AuthResponseDto BuildAuthResponse(User user)
    {
        var token = GenerateJwt(user);
        return new AuthResponseDto
        {
            Token = token,
            Role = user.Role,
            FullName = user.FullName
        };
    }

    private string GenerateJwt(User user)
    {
        // Claims are pieces of info embedded inside the token
        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Role, user.Role)
        };

        // Sign the token using the secret key from appsettings
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]!));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: _config["Jwt:Issuer"],
            audience: _config["Jwt:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddHours(double.Parse(_config["Jwt:ExpiryHours"]!)),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}