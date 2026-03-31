using EFPractice.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EFPractice.Infrastructure.Data.Configurations;

public class UserTaskConfiguration : IEntityTypeConfiguration<UserTask>
{
    public void Configure(EntityTypeBuilder<UserTask> builder)
    {
        builder.Property(t => t.Title)
            .HasMaxLength(200)
            .IsRequired();
        builder.Property(t => t.Description)
            .HasMaxLength(1000);
        builder.Property(t => t.Priority)
            .HasConversion<string>()
            .IsRequired();
    }
}
