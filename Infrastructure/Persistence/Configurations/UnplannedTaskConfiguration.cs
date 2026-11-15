using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Persistence.Configurations
{
    public class UnplannedTaskConfiguration : IEntityTypeConfiguration<UnplannedTask>
    {
        public void Configure(EntityTypeBuilder<UnplannedTask> builder)
        {
            builder.HasKey(x => x.Id);

            builder.Property(x => x.Developer).IsRequired().HasMaxLength(150);
            builder.Property(x => x.TaskDescription).IsRequired().HasMaxLength(1000);
            builder.Property(x => x.DurationHours).HasPrecision(10, 2);

            builder.HasOne(x => x.Sprint)
                .WithMany(x => x.UnplannedTasks)
                .HasForeignKey(x => x.SprintId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
