using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Persistence.Configurations
{
    public class UserStoryConfiguration : IEntityTypeConfiguration<UserStory>
    {
        public void Configure(EntityTypeBuilder<UserStory> builder)
        {
            builder.HasKey(x => x.Id);

            builder.Property(x => x.Code).IsRequired().HasMaxLength(50);
            builder.Property(x => x.Title).IsRequired().HasMaxLength(250);
            builder.Property(x => x.Description).IsRequired().HasMaxLength(2000);
            builder.Property(x => x.Module).HasMaxLength(100);
            builder.Property(x => x.Priority).HasMaxLength(50);
            builder.Property(x => x.Status).HasMaxLength(50);
            builder.Property(x => x.AcceptanceCriteria).HasMaxLength(4000);

            builder.Property(x => x.BusinessValue).HasPrecision(10, 2);
            builder.Property(x => x.StoryPoints).HasPrecision(10, 2);
            builder.Property(x => x.DecisionQuotient).HasPrecision(10, 2);

            builder.HasOne(x => x.TestPlan)
                .WithMany(x => x.UserStories)
                .HasForeignKey(x => x.TestPlanId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(x => x.Finding)
                .WithMany(x => x.UserStories)
                .HasForeignKey(x => x.FindingId)
                .OnDelete(DeleteBehavior.SetNull);

            builder.HasOne(x => x.Sprint)
                .WithMany(x => x.UserStories)
                .HasForeignKey(x => x.SprintId)
                .OnDelete(DeleteBehavior.SetNull);

            builder.HasMany(x => x.Tasks)
                .WithOne(x => x.UserStory)
                .HasForeignKey(x => x.UserStoryId)
                .OnDelete(DeleteBehavior.SetNull);
        }
    }
}
