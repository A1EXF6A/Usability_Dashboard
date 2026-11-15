using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Persistence.Configurations
{
    public class SprintRetrospectiveConfiguration : IEntityTypeConfiguration<SprintRetrospective>
    {
        public void Configure(EntityTypeBuilder<SprintRetrospective> builder)
        {
            builder.HasKey(x => x.Id);

            builder.Property(x => x.WhatWentWell).HasMaxLength(4000);
            builder.Property(x => x.WhatWentWrong).HasMaxLength(4000);
            builder.Property(x => x.WhatCanBeImproved).HasMaxLength(4000);

            builder.HasOne(x => x.Sprint)
                .WithOne(x => x.Retrospective)
                .HasForeignKey<SprintRetrospective>(x => x.SprintId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
