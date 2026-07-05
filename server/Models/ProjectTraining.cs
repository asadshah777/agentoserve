// Id
// ProjectId
// Status
// Progress (int 0–100)
// CreatedAt
// StartedAt
// CompletedAt
// ErrorMessage

using System.ComponentModel.DataAnnotations.Schema;

public class ProjectTraining
{
    public int Id { get; set; }
    public int ProjectId { get; set; }
    public string Status { get; set; } = "Pending"; // Pending, InProgress, Completed, Failed
    public int Progress { get; set; } = 0; // 0 to 100
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? StartedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
    public string? ErrorMessage { get; set; }

    // Navigation property
    [ForeignKey(nameof(ProjectId))]
    public Project? Project { get; set; }
}   