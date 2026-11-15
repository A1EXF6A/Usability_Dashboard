using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Persistence.Configurations
{
    public class SprintTaskConfiguration : IEntityTypeConfiguration<SprintTask>
    {
        public void Configure(EntityTypeBuilder<SprintTask> builder)
        {
            builder.HasKey(x => x.Id);

            builder.Property(x => x.Title).IsRequired().HasMaxLength(500);
            builder.Property(x => x.Developer).HasMaxLength(150);
            builder.Property(x => x.Phase).HasMaxLength(50);
            builder.Property(x => x.Type).HasMaxLength(50);
            builder.Property(x => x.Status).HasMaxLength(50);
            builder.Property(x => x.Comment).HasMaxLength(1000);

            builder.Property(x => x.EstimatedHours).HasPrecision(10, 2);
            builder.Property(x => x.RealHours).HasPrecision(10, 2);

            builder.HasOne(x => x.Sprint)
                .WithMany(x => x.Tasks)
                .HasForeignKey(x => x.SprintId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(x => x.UserStory)
                .WithMany(x => x.Tasks)
                .HasForeignKey(x => x.UserStoryId)
                .OnDelete(DeleteBehavior.SetNull);
        }
    }
}
