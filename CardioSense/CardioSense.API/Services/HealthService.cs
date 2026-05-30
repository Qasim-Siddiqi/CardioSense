namespace CardioSense.API.Services;

using CardioSense.API.Data;
using CardioSense.API.DTOs.Health;
using CardioSense.API.Models;
using Microsoft.EntityFrameworkCore;

public class HealthService : IHealthService
{
    private readonly AppDbContext _db;
    private readonly IPredictionService _prediction;
    private readonly ILLMService _llm;
    private readonly IEmailService _emailService;


    public HealthService(AppDbContext db, IPredictionService prediction, ILLMService llm, IEmailService emailService)
    {
        _db = db;
        _prediction = prediction;
        _llm = llm;
        _emailService = emailService; 
    }

    public async Task<HealthSubmissionResponseDto> SubmitAsync(int userId, SubmitHealthDto dto)
    {
        var (riskScore, riskLevel) = await _prediction.PredictAsync(dto);

        var advice = await _llm.GetAdvisoryAsync(dto, riskLevel, riskScore);

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
            RiskScore = riskScore,  
            RiskLevel = riskLevel,
            LLMAdvice = advice,
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

    public async Task<PagedResultDto<HealthSubmissionResponseDto>> GetAllSubmissionsAsync(
        string? riskLevel, int page, int pageSize)
    {
        var query = _db.HealthSubmissions.AsQueryable();

        if (!string.IsNullOrWhiteSpace(riskLevel))
            query = query.Where(s => s.RiskLevel == riskLevel);

        var totalCount = await query.CountAsync();

        var items = await query
            .OrderByDescending(s => s.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return new PagedResultDto<HealthSubmissionResponseDto>
        {
            Items = items.Select(MapToDto).ToList(),
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize
        };
    }

    public async Task<HealthSubmissionResponseDto?> GetSubmissionByIdAsync(int id)
    {
        var submission = await _db.HealthSubmissions.FindAsync(id);
        return submission is null ? null : MapToDto(submission);
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

    public async Task<HealthSubmissionResponseDto?> GetMySubmissionByIdAsync(int userId, int submissionId)
    {
        var submission = await _db.HealthSubmissions
            .FirstOrDefaultAsync(s => s.Id == submissionId && s.UserId == userId);

        return submission is null ? null : MapToDto(submission);
    }

    public async Task<bool> AddDoctorNotesAsync(int id, string? notes)
    {
        var submission = await _db.HealthSubmissions
            .Include(s => s.User)
            .FirstOrDefaultAsync(s => s.Id == id);

        if (submission is null) return false;

        submission.DoctorNotes = notes;
        await _db.SaveChangesAsync();

        // Fire and forget — don't let email delay the response
        _ = Task.Run(async () =>
        {
            try
            {
                await _emailService.SendAsync(
                    to: submission.User.Email,
                    subject: "Your CardioSense submission has been reviewed",
                    body: $"Hello {submission.User.FullName},\n\nYour doctor has reviewed your health submission and added notes.\n\nPlease log in to CardioSense to view them.\n\nCardioSense Team"
                );
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[EMAIL ERROR] {ex.Message}");
            }
        });

        return true;
    }
}
