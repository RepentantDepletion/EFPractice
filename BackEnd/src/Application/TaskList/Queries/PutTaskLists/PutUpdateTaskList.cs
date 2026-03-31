using EFPractice.Application.Common.Interfaces;
using EFPractice.Application.Common.Models;
using EFPractice.Domain.Entities;

namespace EFPractice.Application.TaskLists.Queries.PutTaskLists;

public class PutUpdateTaskListQuery : IRequest<Result>
{
    public int Id { get; init; }

    public string? Title { get; init; }
}

public class PutUpdateTaskListHandler : IRequestHandler<PutUpdateTaskListQuery, Result>
{
    private readonly IApplicationDbContext _context;

    public PutUpdateTaskListHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result> Handle(PutUpdateTaskListQuery request, CancellationToken cancellationToken)
    {
        var taskList = await _context.TaskLists.FindAsync(new object[] { request.Id }, cancellationToken);

        if (taskList is null)
        {
            return Result.Failure(new[] { "Task list not found." });
        }

        taskList.Title = request.Title;

        await _context.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}
