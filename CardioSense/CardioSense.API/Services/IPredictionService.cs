using CardioSense.API.DTOs.Health;

namespace CardioSense.API.Services;

public interface IPredictionService
{
    Task<(float riskScore, string riskLevel)> PredictAsync(SubmitHealthDto dto);
}