namespace CardioSense.API.Services;

using CardioSense.API.DTOs.Health;

public interface IHealthService
{
    Task<HealthSubmissionResponseDto> SubmitAsync(int userId, SubmitHealthDto dto);
    Task<List<HealthSubmissionResponseDto>> GetMySubmissionsAsync(int userId);
}