using EFPractice.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EFPractice.Infrastructure.Data.Configurations;

public class TaskListConfiguration : IEntityTypeConfiguration<TaskList>
{
    public void Configure(EntityTypeBuilder<TaskList> builder)
    {
        builder.Property(t => t.UserID)
            .HasMaxLength(450)
            .IsRequired();

        builder.HasIndex(t => t.UserID);

        builder.Property(t => t.Title)
            .HasMaxLength(200)
            .IsRequired();

        builder.HasMany(tl => tl.Items)
            .WithOne(t => t.TaskList)
            .HasForeignKey(t => t.ListID)
            .IsRequired(false);
    }
}
