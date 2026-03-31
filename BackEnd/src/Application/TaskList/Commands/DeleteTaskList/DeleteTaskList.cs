using EFPractice.Application.Common.Interfaces;

namespace EFPractice.Application.TaskLists.Commands.DeleteTaskList;

public record DeleteTaskListCommand(int Id) : IRequest;

public class DeleteTaskListCommandHandler : IRequestHandler<DeleteTaskListCommand>
{
    private readonly IApplicationDbContext _context;

    public DeleteTaskListCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task Handle(DeleteTaskListCommand request, CancellationToken cancellationToken)
    {
        var entity = await _context.TaskLists
            .Where(l => l.Id == request.Id)
            .SingleOrDefaultAsync(cancellationToken);

        Guard.Against.NotFound(request.Id, entity);

        _context.TaskLists.Remove(entity);

        await _context.SaveChangesAsync(cancellationToken);
    }
}
