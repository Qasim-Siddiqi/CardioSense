namespace CardioSense.API.Services;

using CardioSense.API.DTOs.Health;

public interface ILLMService
{
    Task<string> GetAdvisoryAsync(SubmitHealthDto dto, string riskLevel, float riskScore);
}