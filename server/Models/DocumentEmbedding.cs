using System.ComponentModel.DataAnnotations.Schema;
using Pgvector;

public class DocumentEmbedding
{
    public int Id { get; set; }

    public int ProjectId { get; set; }
    [ForeignKey(nameof(ProjectId))]
    public Project? Project { get; set; }

    public int? FileId { get; set; }
    [ForeignKey(nameof(FileId))]
    public UserUploads? UserUpload { get; set; }

    public string Content { get; set; }

    public bool IsSummary { get; set; } = false;

    public Vector Embedding { get; set; } 
}