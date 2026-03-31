using EFPractice.Application.Common.Interfaces;
using EFPractice.Application.Common.Models;
using EFPractice.Domain.Entities;

namespace EFPractice.Application.UserTasks.Queries.PatchTasks;

public class PutCompleteTaskQuery : IRequest<Result>
{
    public int Id { get; init; }

    public bool Done { get; init; }
}

public class PutCompleteTaskHandler : IRequestHandler<PutCompleteTaskQuery, Result>
{
    private readonly IApplicationDbContext _context;

    public PutCompleteTaskHandler(IApplicationDbContext context)
    {
        _context = context;
    }


    public async Task<Result> Handle(PutCompleteTaskQuery request, CancellationToken cancellationToken)
    {
        var task = await _context.UserTasks.FindAsync(new object[] { request.Id }, cancellationToken);

        if (task is null)
        {
            return Result.Failure(new[] { "Task not found." });
        }

        task.Done = request.Done;

        await _context.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}
