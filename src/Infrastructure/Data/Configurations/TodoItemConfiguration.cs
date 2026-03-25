using EFPractice.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EFPractice.Infrastructure.Data.Configurations;

public class userTaskConfiguration : IEntityTypeConfiguration<userTask>
{
    public void Configure(EntityTypeBuilder<userTask> builder)
    {
        builder.Property(t => t.Title)
            .HasMaxLength(200)
            .IsRequired();
    }
}
