using EFPractice.Application.Common.Interfaces;

namespace EFPractice.Application.userTasks.Commands.UpdateuserTask;

public record UpdateuserTaskCommand : IRequest
{
    public int Id { get; init; }

    public string? Title { get; init; }

    public bool Done { get; init; }
}

public class UpdateuserTaskCommandHandler : IRequestHandler<UpdateuserTaskCommand>
{
    private readonly IApplicationDbContext _context;

    public UpdateuserTaskCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task Handle(UpdateuserTaskCommand request, CancellationToken cancellationToken)
    {
        var entity = await _context.userTasks
            .FindAsync([request.Id], cancellationToken);

        Guard.Against.NotFound(request.Id, entity);

        entity.Title = request.Title;
        entity.Done = request.Done;

        await _context.SaveChangesAsync(cancellationToken);
    }
}
