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

            builder.Property(x => x.Name).IsRequired().HasMaxLength(200);
            builder.Property(x => x.Goal).HasMaxLength(1000);
            builder.Property(x => x.Status).IsRequired().HasMaxLength(50);

            builder.HasOne(x => x.TestPlan)
                .WithMany(x => x.Sprints)
                .HasForeignKey(x => x.TestPlanId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasMany(x => x.UserStories)
                .WithOne(x => x.Sprint)
                .HasForeignKey(x => x.SprintId)
                .OnDelete(DeleteBehavior.SetNull);

            builder.HasMany(x => x.Tasks)
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
