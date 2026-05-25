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

    // Patient
    [HttpGet("my-submissions")]
    [Authorize(Roles = "Patient")]
    public async Task<IActionResult> GetMySubmissions()
    {
        var result = await _healthService.GetMySubmissionsAsync(GetUserId());
        return Ok(result);
    }

    // Doctor

    [HttpGet("all")]
    [Authorize(Roles = "Doctor")]
    public async Task<IActionResult> GetAllSubmissions(
        [FromQuery] string? riskLevel,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10)
    {
        if (page < 1) page = 1;
        if (pageSize < 1 || pageSize > 100) pageSize = 10;

        var result = await _healthService.GetAllSubmissionsAsync(riskLevel, page, pageSize);
        return Ok(result);
    }

    [HttpGet("{id:int}")]
    [Authorize(Roles = "Doctor")]
    public async Task<IActionResult> GetSubmissionById(int id)
    {
        var result = await _healthService.GetSubmissionByIdAsync(id);
        return result is null ? NotFound() : Ok(result);
    }

    [HttpPut("{id:int}/notes")]
    [Authorize(Roles = "Doctor")]
    public async Task<IActionResult> AddNotes(int id, [FromBody] AddNotesDto dto)
    {
        var success = await _healthService.AddDoctorNotesAsync(id, dto.Notes);
        return success ? Ok() : NotFound();
    }

    [HttpGet("my-submissions/{id:int}")]
    [Authorize(Roles = "Patient")]
    public async Task<IActionResult> GetMySubmissionById(int id)
    {
        var result = await _healthService.GetMySubmissionByIdAsync(GetUserId(), id);
        return result is null ? NotFound() : Ok(result);
    }
}