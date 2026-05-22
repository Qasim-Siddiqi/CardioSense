using CardioSense.API.Models;

namespace CardioSense.API.Models;

public class HealthSubmission
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public User User { get; set; } = null!;

    // Health profile inputs
    public int Age { get; set; }
    public int Gender { get; set; }       // 1=female, 2=male
    public int ApHi { get; set; }         // Systolic BP
    public int ApLo { get; set; }         // Diastolic BP
    public int Cholesterol { get; set; }  // 1/2/3
    public int Glucose { get; set; }      // 1/2/3
    public int Smoke { get; set; }        // 0/1
    public int Alco { get; set; }         // 0/1
    public int Active { get; set; }       // 0/1
    public float BMI { get; set; }

    // ML output
    public float RiskScore { get; set; }
    public string RiskLevel { get; set; } = string.Empty;  // Low/Medium/High

    // LLM output
    public string LLMAdvice { get; set; } = string.Empty;

    // Doctor
    public string? DoctorNotes { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}