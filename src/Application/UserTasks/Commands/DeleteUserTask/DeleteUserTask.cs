using EFPractice.Application.Common.Interfaces;

namespace EFPractice.Application.UserTasks.Commands.DeleteUserTask;

public record DeleteUserTaskCommand(int Id) : IRequest;

public class DeleteUserTaskCommandHandler : IRequestHandler<DeleteUserTaskCommand>
{
    private readonly IApplicationDbContext _context;

    public DeleteUserTaskCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task Handle(DeleteUserTaskCommand request, CancellationToken cancellationToken)
    {
        var entity = await _context.UserTasks
            .FindAsync([request.Id], cancellationToken);

        Guard.Against.NotFound(request.Id, entity);

        _context.UserTasks.Remove(entity);

        await _context.SaveChangesAsync(cancellationToken);
    }

}
