namespace CardioSense.API.Services;

using System.Text.Json.Serialization;
using System.Text;
using System.Text.Json;
using CardioSense.API.DTOs.Health;

public class LLMService : ILLMService
{
    private readonly HttpClient _http;
    private readonly string _model;

    private static readonly JsonSerializerOptions _jsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase, 
        PropertyNameCaseInsensitive = true
    };

    private const string FallbackAdvice =
        "Unable to generate a personalized advisory at this time. " +
        "Please consult your doctor to discuss your cardiovascular risk results.";

    public LLMService(IHttpClientFactory factory, IConfiguration config)
    {
        _http = factory.CreateClient("LLMClient");

        _model = config["LLM:Model"]
            ?? "openrouter/free";
    }

    public async Task<string> GetAdvisoryAsync(
        SubmitHealthDto dto,
        string riskLevel,
        float riskScore)
    {
        var request = new LLMRequest
        {
            Model = _model,
            MaxTokens = 400,
            Messages =
            [
                new LLMMessage
                {
                    Role = "system",
                    Content = SystemPrompt
                },

                new LLMMessage
                {
                    Role = "user",
                    Content = BuildUserMessage(dto, riskLevel, riskScore)
                }
            ]
        };

        var json = JsonSerializer.Serialize(request, _jsonOptions);

        var content = new StringContent(
            json,
            Encoding.UTF8,
            "application/json");

        try
        {
            var response = await _http.PostAsync(
                "chat/completions",
                content);

            var body = await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode)
            {
                Console.Error.WriteLine(
                    $"[LLMService] OpenRouter {(int)response.StatusCode}: {body}");

                return FallbackAdvice;
            }

            var result = JsonSerializer.Deserialize<LLMResponse>(
                body,
                _jsonOptions);

            var advice = result?
                .Choices?
                .FirstOrDefault()?
                .Message?
                .Content?
                .Trim();

            return string.IsNullOrWhiteSpace(advice)
                ? FallbackAdvice
                : advice;
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine(
                $"[LLMService] Exception: {ex.GetType().Name}: {ex.Message}");

            if (ex.InnerException != null)
            {
                Console.Error.WriteLine(
                    $"[LLMService] Inner: {ex.InnerException.Message}");
            }

            return FallbackAdvice;
        }
    }

    // PROMPTS

    private const string SystemPrompt =
        "You are a cardiologist assistant. " +
        "Given a patient's health profile and cardiovascular risk prediction, " +
        "provide a short, friendly, personalized health advisory in 3-4 bullet points. " +
        "Cover top risk factors, lifestyle changes, and when to see a doctor. " +
        "Keep it simple and supportive, not alarming. " +
        "Respond with bullet points only.";

    private static string BuildUserMessage(
        SubmitHealthDto dto,
        string riskLevel,
        float riskScore)
    {
        var gender = dto.Gender == 1
            ? "Female"
            : "Male";

        var cholesterol = dto.Cholesterol switch
        {
            2 => "Above normal",
            3 => "Well above normal",
            _ => "Normal"
        };

        var glucose = dto.Glucose switch
        {
            2 => "Above normal",
            3 => "Well above normal",
            _ => "Normal"
        };

        return $"""
            Patient profile:
            - Age: {dto.Age} years
            - Gender: {gender}
            - Blood pressure: {dto.ApHi}/{dto.ApLo} mmHg
            - Cholesterol: {cholesterol}
            - Glucose: {glucose}
            - BMI: {dto.BMI:F1}
            - Smoker: {(dto.Smoke == 1 ? "Yes" : "No")}
            - Alcohol use: {(dto.Alco == 1 ? "Yes" : "No")}
            - Physically active: {(dto.Active == 1 ? "Yes" : "No")}

            Cardiovascular risk:
            {riskLevel}
            (model score: {riskScore:F2})

            Please provide a personalized advisory.
            """;
    }

    // REQUEST / RESPONSE DTOs

    private sealed class LLMRequest
    {
        public string Model { get; set; } = string.Empty;

        [JsonPropertyName("max_tokens")]
        public int MaxTokens { get; set; }

        public List<LLMMessage> Messages { get; set; } = [];
    }
    private sealed class LLMMessage
    {
        public string Role { get; set; } = string.Empty;

        public string Content { get; set; } = string.Empty;
    }

    private sealed class LLMResponse
    {
        public List<LLMChoice> Choices { get; set; } = [];
    }

    private sealed class LLMChoice
    {
        public LLMMessage Message { get; set; } = new();
    }
}