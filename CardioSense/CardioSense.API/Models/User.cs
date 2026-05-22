namespace CardioSense.API.Models;

public class User
{
    public int Id { get; set; }
    public string FullName { get; set; } = string.Empty; // maps to a NOT NULL column in SQL Server. also, if you dont write it and run a method on it (like user.FullName.ToLower()) before assigning a value, your app will crash with a NullReferenceException.
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string Role { get; set; } = "Patient";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<HealthSubmission> HealthSubmissions { get; set; } = new List<HealthSubmission>();
}