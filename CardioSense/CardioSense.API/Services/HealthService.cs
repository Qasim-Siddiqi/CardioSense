namespace CardioSense.API.Services;

using CardioSense.API.Data;
using CardioSense.API.DTOs.Health;
using CardioSense.API.Models;
using Microsoft.EntityFrameworkCore;

public class HealthService : IHealthService
{
    private readonly AppDbContext _db;

    public HealthService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<HealthSubmissionResponseDto> SubmitAsync(int userId, SubmitHealthDto dto)
    {
        var submission = new HealthSubmission
        {
            UserId = userId,
            Age = dto.Age,
            Gender = dto.Gender,
            ApHi = dto.ApHi,
            ApLo = dto.ApLo,
            Cholesterol = dto.Cholesterol,
            Glucose = dto.Glucose,
            Smoke = dto.Smoke,
            Alco = dto.Alco,
            Active = dto.Active,
            BMI = dto.BMI,
            RiskScore = 0.0f,   // replaced in Commit 6
            RiskLevel = "Low",  // replaced in Commit 6
            LLMAdvice = "",     // replaced in Commit 7
            DoctorNotes = null,
            CreatedAt = DateTime.UtcNow,
            PatientNotes = dto.PatientNotes ?? string.Empty
        };

        _db.HealthSubmissions.Add(submission);
        await _db.SaveChangesAsync();

        return MapToDto(submission);
    }

    public async Task<List<HealthSubmissionResponseDto>> GetMySubmissionsAsync(int userId)
    {
        var submissions = await _db.HealthSubmissions
            .Where(s => s.UserId == userId)
            .OrderByDescending(s => s.CreatedAt)
            .ToListAsync();

        return submissions.Select(MapToDto).ToList();
    }

    private static HealthSubmissionResponseDto MapToDto(HealthSubmission s) => new()
    {
        Id = s.Id,
        UserId = s.UserId,
        Age = s.Age,
        Gender = s.Gender,
        ApHi = s.ApHi,
        ApLo = s.ApLo,
        Cholesterol = s.Cholesterol,
        Glucose = s.Glucose,
        Smoke = s.Smoke,
        Alco = s.Alco,
        Active = s.Active,
        BMI = s.BMI,
        RiskScore = s.RiskScore,
        RiskLevel = s.RiskLevel,
        LLMAdvice = s.LLMAdvice,
        DoctorNotes = s.DoctorNotes,
        CreatedAt = s.CreatedAt,
        PatientNotes = s.PatientNotes ?? string.Empty
    };
}