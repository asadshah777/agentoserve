using Microsoft.EntityFrameworkCore;
using SemanticSlicer;
using SemanticSlicer.Models;

public class TrainingWorker : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<TrainingWorker> _logger;
    private readonly EmbeddingService _embeddingService;
    private readonly Slicer _slicer;

    public TrainingWorker(
        IServiceScopeFactory scopeFactory,
        ILogger<TrainingWorker> logger,
        EmbeddingService embeddingService
        )
    {
        _scopeFactory = scopeFactory;
        _logger = logger;
        _embeddingService = embeddingService;

        _slicer = new Slicer(new SlicerOptions
        {
            MaxChunkTokenCount = 600,
            Separators = Separators.Text
        });
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("Training Worker started.");

        while (!stoppingToken.IsCancellationRequested)
        {
            using var scope = _scopeFactory.CreateScope();

            var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            var fileService = scope.ServiceProvider.GetRequiredService<IFileService>();
            var chatService = scope.ServiceProvider.GetRequiredService<ChatCompletionService>();

            var job = await db.ProjectTrainings
                .Where(x => x.Status == "Queued")
                .OrderBy(x => x.CreatedAt)
                .FirstOrDefaultAsync(stoppingToken);

            if (job == null)
            {
                await Task.Delay(15000, stoppingToken);
                continue;
            }

            try
            {
                job.Status = "Running";
                job.StartedAt = DateTime.UtcNow;
                await db.SaveChangesAsync(stoppingToken);

                var projectFiles = await db.UserUploads
                    .Where(up => up.ProjectId == job.ProjectId)
                    .ToListAsync(stoppingToken);

                // Only process files that haven't been embedded yet
                var unprocessedFiles = new List<UserUploads>();
                foreach (var f in projectFiles)
                {
                    bool hasEmbeddings = await db.DocumentEmbeddings.AnyAsync(e => e.FileId == f.Id, stoppingToken);
                    if (!hasEmbeddings)
                    {
                        unprocessedFiles.Add(f);
                    }
                }

                _logger.LogWarning(
                    "Processing {FileCount} unprocessed files for project {ProjectId} out of {TotalFiles} total files",
                    unprocessedFiles.Count,
                    job.ProjectId,
                    projectFiles.Count);

                foreach (var file in unprocessedFiles)
                {
                    var txt = await fileService.ExtractTextFromPdfAsync(file.FilePath);

                    try
                    {
                        _logger.LogInformation("Generating summary for file {FileId}", file.Id);

                        var safeTxtForSummary = txt.Length > 20000 ? txt.Substring(0, 20000) : txt;
                        var summaryPrompt = "Provide a comprehensive summary of the following document. Extract and include key metadata such as the author, title, main topics, and overall themes.";
                        var summaryResult = await chatService.GetChatCompletionAsync(summaryPrompt, safeTxtForSummary);

                        var summaryEmbeddings = await _embeddingService.GenerateEmbeddingAsync(summaryResult);
                        await db.DocumentEmbeddings.AddAsync(new DocumentEmbedding
                        {
                            ProjectId = job.ProjectId,
                            FileId = file.Id, // Set FileId
                            Content = "DOCUMENT SUMMARY:\n" + summaryResult,
                            IsSummary = true,
                            Embedding = new Pgvector.Vector(summaryEmbeddings)
                        }, stoppingToken);
                        
                        _logger.LogInformation("Saved summary embedding for file {FileId}", file.Id);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogWarning(ex, "Failed to generate summary for file {FileId}", file.Id);
                    }

                    List<DocumentChunk> chunks = _slicer.GetDocumentChunks(txt);

                    _logger.LogInformation(
                        "File {FileId} split into {ChunkCount} chunks",
                        file.Id,
                        chunks.Count);

     
                    foreach (var chunk in chunks)
                    {
                        var embeddings = await _embeddingService.GenerateEmbeddingAsync(chunk.Content);

                        _logger.LogInformation(
                            "Generated embedding for file {FileId}, chunk {ChunkIndex} ({TokenCount} tokens)",
                            file.Id,
                            chunk.Index,
                            chunk.TokenCount);

                        var saveEmbedding = await db.DocumentEmbeddings.AddAsync(new DocumentEmbedding
                        {
                            ProjectId = job.ProjectId,
                            FileId = file.Id, // Set FileId
                            Content = chunk.Content,
                            Embedding = new Pgvector.Vector(embeddings)
                        }, stoppingToken);

                        await db.SaveChangesAsync(stoppingToken);

                        _logger.LogInformation(
                            "Saved embedding for file {FileId}, chunk {ChunkIndex} with id {EmbeddingId}",
                            file.Id,
                            chunk.Index,
                            saveEmbedding.Entity.Id);
                    }
                }

                job.Status = "Completed";
                job.CompletedAt = DateTime.UtcNow;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Training failed for job {JobId}", job.Id);

                job.Status = "Failed";
                job.ErrorMessage = ex.Message;
            }

            await db.SaveChangesAsync(stoppingToken);
        }

        _logger.LogInformation("Training Worker stopped.");
    }
}