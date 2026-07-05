using Microsoft.AspNetCore.Identity;

public class Project
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string AIModel {get; set;} = string.Empty;
    public string SystemPrompt { get; set; } = string.Empty;
    public bool hasFileUploads { get; set; } = false;
}