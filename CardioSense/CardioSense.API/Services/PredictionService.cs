namespace CardioSense.API.Services;

using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using CardioSense.API.DTOs.Health;

public class PredictionService : IPredictionService
{
    private readonly HttpClient _http;

    public PredictionService(IHttpClientFactory factory)
    {
        _http = factory.CreateClient("PredictionClient");
    }

    private static readonly JsonSerializerOptions _snakeCase = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower
    };

    public async Task<(float riskScore, string riskLevel)> PredictAsync(SubmitHealthDto dto)
    {
        var payload = new PredictRequest
        {
            Age = dto.Age,
            Gender = dto.Gender,
            ApHi = dto.ApHi,
            ApLo = dto.ApLo,
            Cholest = dto.Cholesterol,
            Gluc = dto.Glucose,
            Smoke = dto.Smoke,
            Alco = dto.Alco,
            Active = dto.Active,
            BMI = dto.BMI,
            Notes = dto.PatientNotes ?? string.Empty
        };

        // SnakeCaseLower turns ApHi → ap_hi, Cholest → cholest, etc.
        var json = JsonSerializer.Serialize(payload, _snakeCase);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        var response = await _http.PostAsync("/predict", content);

        if (!response.IsSuccessStatusCode)
        {
            var error = await response.Content.ReadAsStringAsync();
            throw new InvalidOperationException(
                $"ML service returned {(int)response.StatusCode}: {error}");
        }

        var body = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<PredictResponse>(body, _snakeCase)
                     ?? throw new InvalidOperationException("Empty response from ML service.");

        return (result.RiskScore, result.RiskLevel);
    }

    // internal shapes, only used here

    private sealed class PredictRequest
    {
        public int Age { get; set; }
        public int Gender { get; set; }
        public int ApHi { get; set; }
        public int ApLo { get; set; }
        public int Cholest { get; set; }
        public int Gluc { get; set; }
        public int Smoke { get; set; }
        public int Alco { get; set; }
        public int Active { get; set; }

        [JsonPropertyName("bmi")]
        public float BMI { get; set; }
        public string Notes { get; set; } = string.Empty;
    }

    private sealed class PredictResponse
    {
        public float RiskScore { get; set; }
        public string RiskLevel { get; set; } = string.Empty;
    }
}