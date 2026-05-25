using CardioSense.API.DTOs.Health;

namespace CardioSense.API.Services;

public interface IHealthService
{
    Task<HealthSubmissionResponseDto> SubmitAsync(int userId, SubmitHealthDto dto);

    Task<List<HealthSubmissionResponseDto>> GetMySubmissionsAsync(int userId);

    Task<PagedResultDto<HealthSubmissionResponseDto>> GetAllSubmissionsAsync(
        string? riskLevel, int page, int pageSize);

    Task<HealthSubmissionResponseDto?> GetSubmissionByIdAsync(int id);

    Task<bool> AddDoctorNotesAsync(int id, string? notes);

    Task<HealthSubmissionResponseDto?> GetMySubmissionByIdAsync(int userId, int submissionId);
}