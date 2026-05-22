namespace CardioSense.API.DTOs.Health;

public class HealthSubmissionResponseDto
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public int Age { get; set; }
    public int Gender { get; set; }
    public int ApHi { get; set; }
    public int ApLo { get; set; }
    public int Cholesterol { get; set; }
    public int Glucose { get; set; }
    public int Smoke { get; set; }
    public int Alco { get; set; }
    public int Active { get; set; }
    public float BMI { get; set; }
    public float RiskScore { get; set; }
    public string RiskLevel { get; set; } = string.Empty;
    public string LLMAdvice { get; set; } = string.Empty;
    public string? DoctorNotes { get; set; }
    public DateTime CreatedAt { get; set; }
}