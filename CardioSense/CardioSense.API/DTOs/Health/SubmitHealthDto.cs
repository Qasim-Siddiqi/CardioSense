namespace CardioSense.API.DTOs.Health;

public class SubmitHealthDto
{
    public int Age { get; set; }
    public int Gender { get; set; }       // 0=female, 1=male
    public int ApHi { get; set; }         // systolic BP
    public int ApLo { get; set; }         // diastolic BP
    public int Cholesterol { get; set; }  // 1/2/3
    public int Glucose { get; set; }      // 1/2/3
    public int Smoke { get; set; }        // 0/1
    public int Alco { get; set; }         // 0/1
    public int Active { get; set; }       // 0/1
    public float BMI { get; set; }
    public string? PatientNotes { get; set; }
}