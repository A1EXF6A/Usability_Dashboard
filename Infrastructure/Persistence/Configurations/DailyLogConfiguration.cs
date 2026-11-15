using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Persistence.Configurations
{
    public class DailyLogConfiguration : IEntityTypeConfiguration<DailyLog>
    {
        public void Configure(EntityTypeBuilder<DailyLog> builder)
        {
            builder.HasKey(x => x.Id);

            builder.Property(x => x.TeamMember).IsRequired().HasMaxLength(150);
            builder.Property(x => x.Progress).HasMaxLength(2000);
            builder.Property(x => x.NextStep).HasMaxLength(2000);
            builder.Property(x => x.Impediments).HasMaxLength(2000);

            builder.HasOne(x => x.Sprint)
                .WithMany(x => x.DailyLogs)
                .HasForeignKey(x => x.SprintId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
