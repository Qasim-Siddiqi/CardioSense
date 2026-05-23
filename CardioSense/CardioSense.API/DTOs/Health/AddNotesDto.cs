using System.ComponentModel.DataAnnotations;

namespace CardioSense.API.DTOs.Health;

public class AddNotesDto
{
    [MaxLength(2000)]
    public string Notes { get; set; } = string.Empty;
}