using EFPractice.Application.Common.Interfaces;

namespace EFPractice.Application.UserTasks.Commands.UpdateUserTask;

public record UpdateUserTaskCommand : IRequest
{
    public int Id { get; init; }

    public string? Title { get; init; }

    public bool Done { get; init; }
}

public class UpdateUserTaskCommandHandler : IRequestHandler<UpdateUserTaskCommand>
{
    private readonly IApplicationDbContext _context;

    public UpdateUserTaskCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task Handle(UpdateUserTaskCommand request, CancellationToken cancellationToken)
    {
        var entity = await _context.UserTasks
            .FindAsync([request.Id], cancellationToken);

        Guard.Against.NotFound(request.Id, entity);

        entity.Title = request.Title;
        entity.Done = request.Done;

        await _context.SaveChangesAsync(cancellationToken);
    }
}
