namespace CardioSense.API.Controllers;

using System.Security.Claims;
using CardioSense.API.DTOs.Health;
using CardioSense.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class HealthController : ControllerBase
{
    private readonly IHealthService _healthService;

    public HealthController(IHealthService healthService)
    {
        _healthService = healthService;
    }

    // Extracts userId from the JWT claim set in AuthService
    private int GetUserId() =>
        int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    // POST /api/health/submit
    [HttpPost("submit")]
    [Authorize(Roles = "Patient")]
    public async Task<IActionResult> Submit([FromBody] SubmitHealthDto dto)
    {
        var result = await _healthService.SubmitAsync(GetUserId(), dto);
        return Ok(result);
    }

    [HttpGet("my-submissions")]
    [Authorize(Roles = "Patient")]
    public async Task<IActionResult> GetMySubmissions()
    {
        var result = await _healthService.GetMySubmissionsAsync(GetUserId());
        return Ok(result);
    }
}