using EFPractice.Domain.Entities;

namespace EFPractice.Application.Common.Interfaces;

public interface IApplicationDbContext
{
    DbSet<TaskList> TaskLists { get; }

    DbSet<UserTask> UserTasks { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken);
}
