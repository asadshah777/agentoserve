using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;

public class ApplicationDbContext : IdentityDbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
    {
    }

    //onModelCreating
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.HasPostgresExtension("vector");

        modelBuilder.Entity<DocumentEmbedding>()
            .Property(e => e.Embedding)
            .HasColumnType("vector(1536)");
    }

    // Define your DbSets here, for example:
    public DbSet<Project> Projects { get; set; }
    public DbSet<UserProjects> UserProjects { get; set; }
    public DbSet<UserUploads> UserUploads { get; set; }
    public DbSet<ProjectTraining> ProjectTrainings { get; set; }
    public DbSet<UserApiKey> UserApiKeys { get; set; }

    public DbSet<DocumentEmbedding> DocumentEmbeddings { get; set; }
}   