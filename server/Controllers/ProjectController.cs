using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Pgvector;
using Pgvector.EntityFrameworkCore;


[Authorize]
[ApiController]
[Route("api/[controller]")]
public class ProjectController: ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly UserManager<IdentityUser> _userManager;
    private readonly IFileService _fileService;
    private readonly EmbeddingService _embeddingService;
    private readonly ChatCompletionService _chatCompletionService;

    public ProjectController(ApplicationDbContext context,
        UserManager<IdentityUser> userManager,
        IFileService fileService,
        EmbeddingService embeddingService,
        ChatCompletionService chatCompletionService
    )
    {
        _context = context;
        _userManager = userManager;
        _fileService = fileService;
        _embeddingService = embeddingService;
        _chatCompletionService = chatCompletionService;
    }


    [HttpGet("GetProject/{id}", Name = "GetProject")]
    public async Task<ActionResult> GetProject([FromRoute] int id)
    {
        if(id == 0)
        {
            return BadRequest(new { Message = "Project ID is required." });
        }

        var project = await _context.Projects.FindAsync(id);
        if(project == null)
        {
            return NotFound(new { Message = "Project not found." });
        }

        if(project.hasFileUploads == true)
        {
            var uploads = await _context.UserUploads
                .Where(u => u.ProjectId == id)
                .Select(u => new { 
                    u.Id, 
                    u.FileName, 
                    u.FilePath,
                    IsTrained = _context.DocumentEmbeddings.Any(e => e.FileId == u.Id)
                })
                .ToListAsync();

            return Ok(new
            {
                Message = "Project retrieved successfully",
                Data = project,
                UploadedFiles = uploads
            });
        }
        return Ok(project);
    }

    [HttpGet("GetAll", Name = "GetAllProjects")]
    public async Task<ActionResult> GetAllProjects()
    {
        var userId = _userManager.GetUserId(User);

        var projects = await _context.UserProjects
            .Where(up => up.UserId == userId)
            .Select(up => up.Project) // assuming navigation property exists
            .ToListAsync();

        if (!projects.Any())
        {
            return NotFound(new { Message = "No Projects found." });
        }

        return Ok(new
        {
            Message = "Projects retrieved successfully",
            Data = projects
        });
    }
    [HttpPost("CreateProject", Name = "CreateProject")]
    public async Task<ActionResult> CreateProject([FromForm] ProjectViewModel project)
    {
        if(project == null || string.IsNullOrEmpty(project.Title))
            return BadRequest(new { Message = "Project title is required." });

        var newProject = new Project
        {
            Title = project.Title,
            AIModel = project.AIModel,
            SystemPrompt = project.SystemPrompt,
            hasFileUploads = project.hasFileUploads
        };

        await _context.Projects.AddAsync(newProject);
        await _context.SaveChangesAsync(); // get project Id

        if(project.hasFileUploads && project.UploadedFiles != null && project.UploadedFiles.Any())
        {
            var uploadedPaths = new List<UserUploads>();
            foreach(var file in project.UploadedFiles)
            {
                var path = await _fileService.UploadFileAsync(file);
                uploadedPaths.Add(new UserUploads
                {
                    FileName = Path.GetFileName(path),
                    FilePath = path,
                    ProjectId = newProject.Id
                });
            }
            await _context.UserUploads.AddRangeAsync(uploadedPaths);
            await _context.SaveChangesAsync();
        }

        await _context.UserProjects.AddAsync(new UserProjects
        {
            UserId = _userManager.GetUserId(User),
            ProjectId = newProject.Id
        });
        await _context.SaveChangesAsync();

        return CreatedAtRoute(
            "GetProject",
            new { id = newProject.Id },
            new { Message = "Project created successfully", data = newProject });
    }

    [HttpPost("UpdateProject/{id}", Name = "UpdateProject")]
    public async Task<ActionResult> UpdateProject(int id, [FromForm] ProjectViewModel project)
    {
        var existingProject = await _context.Projects.FindAsync(id);
        if(existingProject == null) return NotFound(new { Message = "Project not found." });

        if(!string.IsNullOrEmpty(project.Title)) existingProject.Title = project.Title;
        if(!string.IsNullOrEmpty(project.AIModel)) existingProject.AIModel = project.AIModel;
        if(project.SystemPrompt != null) existingProject.SystemPrompt = project.SystemPrompt; // allow empty to clear
        
        if(project.hasFileUploads && project.UploadedFiles != null && project.UploadedFiles.Any())
        {
            existingProject.hasFileUploads = true;
            var uploadedPaths = new List<UserUploads>();
            foreach(var file in project.UploadedFiles)
            {
                var path = await _fileService.UploadFileAsync(file);
                uploadedPaths.Add(new UserUploads
                {
                    FileName = Path.GetFileName(path),
                    FilePath = path,
                    ProjectId = existingProject.Id
                });
            }
            await _context.UserUploads.AddRangeAsync(uploadedPaths);
            
            // Delete existing trainings so the user can hit "Start Training" again for the new files
            var existingTrainings = _context.ProjectTrainings.Where(t => t.ProjectId == existingProject.Id);
            _context.ProjectTrainings.RemoveRange(existingTrainings);
        }

        await _context.SaveChangesAsync();
        return Ok(new { Message = "Project updated successfully", data = existingProject });
    }

    [HttpDelete("DeleteFile/{projectId}/{fileId}", Name = "DeleteFile")]
    public async Task<ActionResult> DeleteFile(int projectId, int fileId)
    {
        var existingProject = await _context.Projects.FindAsync(projectId);
        if (existingProject == null) return NotFound(new { Message = "Project not found." });

        var file = await _context.UserUploads.FirstOrDefaultAsync(u => u.Id == fileId && u.ProjectId == projectId);
        if (file == null) return NotFound(new { Message = "File not found." });

        _context.UserUploads.Remove(file);
        await _fileService.DeleteFileAsync(file.FilePath);

        var existingEmbeddings = _context.DocumentEmbeddings.Where(e => e.FileId == fileId);
        _context.DocumentEmbeddings.RemoveRange(existingEmbeddings);

        var remainingFiles = await _context.UserUploads.AnyAsync(u => u.ProjectId == projectId && u.Id != fileId);
        if (!remainingFiles)
        {
            existingProject.hasFileUploads = false;
        }

        await _context.SaveChangesAsync();

        return Ok(new { Message = "File deleted successfully and training reset." });
    }

    [HttpDelete("DeleteProject/{id}", Name = "DeleteProject")]
    public async Task<ActionResult> DeleteProject(int id)
    {
        var existingProject = await _context.Projects.FindAsync(id);
        if (existingProject == null) return NotFound(new { Message = "Project not found." });

        var userId = _userManager.GetUserId(User);
        var userProject = await _context.UserProjects.FirstOrDefaultAsync(up => up.ProjectId == id && up.UserId == userId);
        
        if (userProject == null) return StatusCode(403, new { Message = "You do not have access to delete this project." });

        var uploads = await _context.UserUploads.Where(u => u.ProjectId == id).ToListAsync();
        foreach (var file in uploads)
        {
            await _fileService.DeleteFileAsync(file.FilePath);
        }

        _context.Projects.Remove(existingProject);
   
        _context.UserProjects.RemoveRange(_context.UserProjects.Where(up => up.ProjectId == id));
        _context.UserUploads.RemoveRange(uploads);
        _context.DocumentEmbeddings.RemoveRange(_context.DocumentEmbeddings.Where(e => e.ProjectId == id));
        _context.ProjectTrainings.RemoveRange(_context.ProjectTrainings.Where(t => t.ProjectId == id));

        await _context.SaveChangesAsync();

        return Ok(new { Message = "Project deleted successfully." });
    }

    [HttpGet("StartTraining/{projectId}", Name = "StartProjectContextTraining")]
    public async Task<IActionResult> StartProjectContextTraining(int projectId)
    {
        var alreadyRunning = await _context.ProjectTrainings
            .AnyAsync(x => x.ProjectId == projectId &&
                        (x.Status == "Queued" || x.Status == "Running"));

        if (alreadyRunning)
            return Conflict("Training already running.");

        var training = new ProjectTraining
        {
            ProjectId = projectId,
            Status = "Queued",
            CreatedAt = DateTime.UtcNow
        };

        _context.ProjectTrainings.Add(training);
        await _context.SaveChangesAsync();

        return Accepted(new { training.Id });
    }

    [HttpGet("GetTrainingStatus/{projectId}", Name = "GetProjectTrainingStatus")]
    public ActionResult GetTrainingStatusForProject(int projectId)
    {
        //get just the training status for the project

        var training = _context.ProjectTrainings
            .Where(x => x.ProjectId == projectId)
            .OrderByDescending(x => x.CreatedAt)
            .FirstOrDefault();

        if (training == null)
        {
            return NotFound(new { Message = "NOT-RUNNING" });
        }

        return Ok(new
        {
            Id = training.Id,
            Status = training.Status,
            CreatedAt = training.CreatedAt,
            StartedAt = training.StartedAt,
            CompletedAt = training.CompletedAt,
            ErrorMessage = training.ErrorMessage
        });
    }

    [HttpGet("GetActiveTrainings", Name = "GetActiveProjectTrainings")]
    public ActionResult GetActiveTrainings(int projectId)
    {
        if(projectId == 0)
        {
            return BadRequest(new { Message = "Project ID is required." });
        }
        return Ok(new { Message = "Active trainings retrieved successfully" });
    }

    [AllowAnonymous]
    [HttpPost("{projectId}/Chat", Name = "ChatWithAgentOfProject")]
    public async Task<ActionResult> ChatWithAgentOfProject(int projectId, [FromBody] ChatRequest request)
    {
        if(projectId == 0) return BadRequest(new { Message = "Project ID is required." });
        if(request == null) return BadRequest(new { Message = "Bad request" });

        var providedKey = Request.Headers["x-api-key"].ToString();
        if (string.IsNullOrEmpty(providedKey))
        {
            return Unauthorized(new { Message = "Missing x-api-key header. Please provide your API key." });
        }

        var apiKeyRecord = await _context.UserApiKeys.FirstOrDefaultAsync(k => k.KeyValue == providedKey);
        if (apiKeyRecord == null) return Unauthorized(new { Message = "Invalid API Key." });

        var userHasAccess = await _context.UserProjects.AnyAsync(up => up.UserId == apiKeyRecord.UserId && up.ProjectId == projectId);
        if (!userHasAccess) return StatusCode(403, new { Message = "The provided API key does not have access to this project." });

        return await ProcessChatQuery(projectId, request.Query);
    }

    [Authorize]
    [HttpPost("{projectId}/Chat/Internal", Name = "ChatWithAgentInternal")]
    public async Task<ActionResult> ChatWithAgentInternal(int projectId, [FromBody] ChatRequest request)
    {
        if(projectId == 0) return BadRequest(new { Message = "Project ID is required." });
        if(request == null) return BadRequest(new { Message = "Bad request" });

        var userId = _userManager.GetUserId(User);
        var userHasAccess = await _context.UserProjects.AnyAsync(up => up.UserId == userId && up.ProjectId == projectId);
        if (!userHasAccess) return StatusCode(403, new { Message = "You do not have access to this project." });

        return await ProcessChatQuery(projectId, request.Query);
    }

    private async Task<ActionResult> ProcessChatQuery(int projectId, string query)
    {
        // 1. Intent Detection
        var intentPrompt = "Determine if the following user query is asking for a summary, main themes, overall metadata (like author, date), or a broad overview of a document. If yes, respond strictly with the word 'SUMMARY'. Otherwise, respond strictly with 'SPECIFIC'.";
        var intentResponse = await _chatCompletionService.GetChatCompletionAsync(intentPrompt, query);
        bool isSummaryIntent = intentResponse.Trim().ToUpper().Contains("SUMMARY");

        // 2. Generate Embedding for Search
        var queryEmbeddings = await _embeddingService.GenerateEmbeddingAsync(query);
        var embeddingToVector = new Vector(queryEmbeddings);

        if(queryEmbeddings != null && queryEmbeddings.Length > 0)
        {
            List<string> matches;

            if (isSummaryIntent)
            {
                // Fetch only summary chunks
                matches = await _context.DocumentEmbeddings
                  .Where(x => x.ProjectId == projectId && x.IsSummary == true)
                  .OrderBy(x => x.Embedding.CosineDistance(embeddingToVector))
                  .Select(x => x.Content)
                  .Take(3)
                  .ToListAsync();

                if (!matches.Any())
                {
                    matches = await _context.DocumentEmbeddings
                      .Where(x => x.ProjectId == projectId)
                      .OrderBy(x => x.Embedding.CosineDistance(embeddingToVector))
                      .Select(x => x.Content)
                      .Take(3)
                      .ToListAsync();
                }
            }
            else
            {
                // Fetch normal chunks
                matches = await _context.DocumentEmbeddings
                  .Where(x => x.ProjectId == projectId && x.IsSummary == false)
                  .OrderBy(x => x.Embedding.CosineDistance(embeddingToVector))
                  .Select(x => x.Content)
                  .Take(3)
                  .ToListAsync();
            }

            var project = await _context.Projects.FindAsync(projectId);
            var customSystemPrompt = project?.SystemPrompt ?? "";

            var sysPrmpt = $"""
            {customSystemPrompt}

            Use the following context as your learned knowledge, enclosed within <context></context> XML tags.
            <context>
            {string.Join("\n", matches)}
            </context>
            When answering the user:
            - If you don't know the answer, simply state that you don't know.
            - If you're unsure, seek clarification.
            - Avoid mentioning that the information was sourced from the context.
            - Respond in accordance with the language of the user's question.
            Given the context information, address the query.
            Query: {query}
            """;

            var sendToAi = await _chatCompletionService.GetChatCompletionAsync(sysPrmpt, query);

            return Ok(new
            {
                Matches = matches,
                Response = sendToAi ?? "No response"
            });
        }

        return Ok(new { Message = "Chat response from agent" });
    }
}