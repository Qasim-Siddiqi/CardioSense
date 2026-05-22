using CardioSense.API.Models;
using Microsoft.EntityFrameworkCore;

namespace CardioSense.API.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<HealthSubmission> HealthSubmissions => Set<HealthSubmission>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Unique email
        modelBuilder.Entity<User>()
            .HasIndex(u => u.Email)
            .IsUnique();

        // Column types
        modelBuilder.Entity<User>()
            .Property(u => u.FullName).HasMaxLength(100);
        modelBuilder.Entity<User>()
            .Property(u => u.Email).HasMaxLength(150);
        modelBuilder.Entity<User>()
            .Property(u => u.Role).HasMaxLength(20);

        modelBuilder.Entity<HealthSubmission>()
            .Property(h => h.RiskLevel).HasMaxLength(10);

        // FK relationship
        modelBuilder.Entity<HealthSubmission>()
            .HasOne(h => h.User)
            .WithMany(u => u.HealthSubmissions)
            .HasForeignKey(h => h.UserId)
            .OnDelete(DeleteBehavior.Cascade);

       
    }
}
