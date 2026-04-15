using EFPractice.Application.Common.Interfaces;
using EFPractice.Domain.Entities;
using EFPractice.Domain.ValueObjects;

namespace EFPractice.Application.TaskLists.Commands.CompleteTaskList;

public record CompleteTaskListCommand(int Id) : IRequest;

public class CompleteTaskListCommandHandler : IRequestHandler<CompleteTaskListCommand>
{
    private readonly IApplicationDbContext _context;

    public CompleteTaskListCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Unit> Handle(CompleteTaskListCommand request, CancellationToken cancellationToken)
    {
        var listExists = await _context.TaskLists
            .AnyAsync(l => l.Id == request.Id, cancellationToken);

        if (!listExists)
            throw new NotFoundException(nameof(TaskList), request.Id.ToString());

        var tasks = await _context.UserTasks
            .Where(t => t.ListID == request.Id)
            .ToListAsync(cancellationToken);

        foreach (var task in tasks)
        {
            task.Done = true;
        }

        await _context.SaveChangesAsync(cancellationToken);
        return Unit.Value;
    }

    Task IRequestHandler<CompleteTaskListCommand>.Handle(CompleteTaskListCommand request, CancellationToken cancellationToken)
    {
        return Handle(request, cancellationToken);
    }
}