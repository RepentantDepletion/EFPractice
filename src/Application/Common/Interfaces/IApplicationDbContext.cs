using EFPractice.Domain.Entities;

namespace EFPractice.Application.Common.Interfaces;

public interface IApplicationDbContext
{
    DbSet<TaskList> TaskLists { get; }

    DbSet<userTask> userTasks { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken);
}
