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

            builder.Property(x => x.StoryCode).IsRequired().HasMaxLength(50);
            builder.Property(x => x.Title).IsRequired().HasMaxLength(300);
            builder.Property(x => x.Description).IsRequired().HasMaxLength(2000);
            builder.Property(x => x.Priority).IsRequired().HasMaxLength(50);
            builder.Property(x => x.Status).IsRequired().HasMaxLength(50);
            builder.Property(x => x.Origin).HasMaxLength(500);

            builder.HasOne(x => x.TestPlan)
                .WithMany(x => x.UserStories)
                .HasForeignKey(x => x.TestPlanId)
                .OnDelete(DeleteBehavior.Cascade);

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
