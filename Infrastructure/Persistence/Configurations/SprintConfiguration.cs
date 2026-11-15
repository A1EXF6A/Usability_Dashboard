using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Persistence.Configurations
{
    public class SprintConfiguration : IEntityTypeConfiguration<Sprint>
    {
        public void Configure(EntityTypeBuilder<Sprint> builder)
        {
            builder.HasKey(x => x.Id);

            builder.Property(x => x.Name).IsRequired().HasMaxLength(150);
            builder.Property(x => x.Goal).HasMaxLength(1000);
            builder.Property(x => x.Weeks).HasMaxLength(100);
            builder.Property(x => x.ProductOwner).HasMaxLength(150);
            builder.Property(x => x.ScrumMaster).HasMaxLength(150);
            builder.Property(x => x.Status).HasMaxLength(50);
            builder.Property(x => x.TeamMembersJson).HasMaxLength(4000);

            builder.Property(x => x.DailyHoursPerMember).HasPrecision(10, 2);
            builder.Property(x => x.WeeklyHoursPerMember).HasPrecision(10, 2);
            builder.Property(x => x.TotalCapacityHours).HasPrecision(10, 2);

            builder.HasOne(x => x.TestPlan)
                .WithMany(x => x.Sprints)
                .HasForeignKey(x => x.TestPlanId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasMany(x => x.Tasks)
                .WithOne(x => x.Sprint)
                .HasForeignKey(x => x.SprintId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasMany(x => x.UnplannedTasks)
                .WithOne(x => x.Sprint)
                .HasForeignKey(x => x.SprintId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasMany(x => x.DailyLogs)
                .WithOne(x => x.Sprint)
                .HasForeignKey(x => x.SprintId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(x => x.Retrospective)
                .WithOne(x => x.Sprint)
                .HasForeignKey<SprintRetrospective>(x => x.SprintId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
