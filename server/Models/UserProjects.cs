using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Identity;

public class UserProjects
{
    public int Id { get; set; }
    public string UserId { get; set; }
   
    [ForeignKey(nameof(UserId))]
    public IdentityUser? User { get; set; }
    public int ProjectId { get; set; }
    
    [ForeignKey(nameof(ProjectId))]
    public Project? Project { get; set; }
}