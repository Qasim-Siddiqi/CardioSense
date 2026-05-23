using System.Text;
using CardioSense.API.Data;
using CardioSense.API.Models;
using CardioSense.API.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

// Services
builder.Services.AddControllers();
builder.Services.AddOpenApi();  

// Database
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Named HttpClient , base address pulled from appsettings
builder.Services.AddHttpClient("PredictionClient", client =>
{
    client.BaseAddress = new Uri(builder.Configuration["PredictionServiceUrl"]!);
});

// Our services
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IHealthService, HealthService>();
builder.Services.AddScoped<IPredictionService, PredictionService>();

// JWT Authentication
var jwtKey = builder.Configuration["Jwt:Key"]!;
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
        };
    });

builder.Services.AddAuthorization();

// CORS — allow React dev server
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReact", policy =>
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod());
});

// Build
var app = builder.Build();

// Doctor Seeding
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

    bool doctorExists = await db.Users.AnyAsync(u => u.Email == "doctor@cardiosense.com");
    if (!doctorExists)
    {
        db.Users.Add(new User
        {
            FullName = "Dr. Seed",
            Email = "doctor@cardiosense.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Doctor@123"),
            Role = "Doctor",
            CreatedAt = DateTime.UtcNow
        });
        await db.SaveChangesAsync();
    }
}

// Middleware Pipeline
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();  
}

app.UseHttpsRedirection();
app.UseCors("AllowReact");
app.UseAuthentication();   
app.UseAuthorization();
app.MapControllers();

app.Run();