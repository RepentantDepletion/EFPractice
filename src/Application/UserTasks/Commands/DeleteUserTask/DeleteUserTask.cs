using EFPractice.Application.Common.Interfaces;

namespace EFPractice.Application.userTasks.Commands.DeleteuserTask;

public record DeleteuserTaskCommand(int Id) : IRequest;

public class DeleteuserTaskCommandHandler : IRequestHandler<DeleteuserTaskCommand>
{
    private readonly IApplicationDbContext _context;

    public DeleteuserTaskCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task Handle(DeleteuserTaskCommand request, CancellationToken cancellationToken)
    {
        var entity = await _context.userTasks
            .FindAsync([request.Id], cancellationToken);

        Guard.Against.NotFound(request.Id, entity);

        _context.userTasks.Remove(entity);

        await _context.SaveChangesAsync(cancellationToken);
    }

}
