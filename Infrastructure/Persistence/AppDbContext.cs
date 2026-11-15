using Domain.Common;
using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using System;

namespace Infrastructure.Persistence;  // ← sin llaves {}

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<TestPlan> TestPlans => Set<TestPlan>();
    public DbSet<TestTask> TestTasks => Set<TestTask>();
    public DbSet<ModeratorScript> ModeratorScripts => Set<ModeratorScript>();
    public DbSet<Participant> Participants => Set<Participant>();
    public DbSet<TestSession> TestSessions => Set<TestSession>();
    public DbSet<ObservationLog> ObservationLogs => Set<ObservationLog>();
    public DbSet<Finding> Findings => Set<Finding>();
    public DbSet<ImprovementAction> ImprovementActions => Set<ImprovementAction>();
    public DbSet<SprintBacklog> SprintBacklogs => Set<SprintBacklog>();
    public DbSet<UserStory> UserStories => Set<UserStory>();
    public DbSet<Sprint> Sprints => Set<Sprint>();
    public DbSet<SprintTask> SprintTasks => Set<SprintTask>();
    public DbSet<UnplannedTask> UnplannedTasks => Set<UnplannedTask>();
    public DbSet<DailyLog> DailyLogs => Set<DailyLog>();
    public DbSet<SprintRetrospective> SprintRetrospectives => Set<SprintRetrospective>();

    public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        foreach (var entry in ChangeTracker.Entries<BaseEntity>())
        {
            if (entry.State == EntityState.Added)
            {
                var now = DateTime.UtcNow;
                entry.Property(nameof(BaseEntity.CreatedAt)).CurrentValue = now;
                Console.WriteLine($"=== CurrentValue CreatedAt: {entry.Property(nameof(BaseEntity.CreatedAt)).CurrentValue} ===");
            }

            if (entry.State == EntityState.Modified)
            {
                entry.Property(nameof(BaseEntity.UpdatedAt)).CurrentValue = DateTime.UtcNow;
            }
        }

        var result = await base.SaveChangesAsync(cancellationToken);
        Console.WriteLine($"=== Filas afectadas: {result} ===");
        return result;
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);

        // PostgreSQL 'timestamp with time zone' rechaza DateTime Kind=Unspecified.
        // Cualquier DateTime (y nullable) se normaliza a Utc antes de enviarse a la BD.
        var dateTimeConverter = new ValueConverter<DateTime, DateTime>(
            v => v.Kind == DateTimeKind.Unspecified ? DateTime.SpecifyKind(v, DateTimeKind.Utc) : v,
            v => v);

        var nullableDateTimeConverter = new ValueConverter<DateTime?, DateTime?>(
            v => v.HasValue && v.Value.Kind == DateTimeKind.Unspecified
                ? DateTime.SpecifyKind(v.Value, DateTimeKind.Utc)
                : v,
            v => v);

        foreach (var entityType in modelBuilder.Model.GetEntityTypes())
        {
            foreach (var property in entityType.GetProperties())
            {
                if (property.ClrType == typeof(DateTime))
                {
                    property.SetValueConverter(dateTimeConverter);
                }
                else if (property.ClrType == typeof(DateTime?))
                {
                    property.SetValueConverter(nullableDateTimeConverter);
                }
            }
        }
    }
}