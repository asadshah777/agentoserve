public class ProjectViewModel
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string AIModel {get; set;} = string.Empty;
    public string SystemPrompt { get; set; } = string.Empty;
    public bool hasFileUploads { get; set; } = false;
    public IEnumerable<IFormFile>? UploadedFiles { get; set; }
}