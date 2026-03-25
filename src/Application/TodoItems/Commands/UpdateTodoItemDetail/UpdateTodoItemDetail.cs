using EFPractice.Application.Common.Interfaces;
using EFPractice.Domain.Enums;

namespace EFPractice.Application.userTasks.Commands.UpdateuserTaskDetail;

public record UpdateuserTaskDetailCommand : IRequest
{
    public int Id { get; init; }

    public int ListId { get; init; }

    public PriorityLevel Priority { get; init; }

    public string? Note { get; init; }
}

public class UpdateuserTaskDetailCommandHandler : IRequestHandler<UpdateuserTaskDetailCommand>
{
    private readonly IApplicationDbContext _context;

    public UpdateuserTaskDetailCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task Handle(UpdateuserTaskDetailCommand request, CancellationToken cancellationToken)
    {
        var entity = await _context.userTasks
            .FindAsync([request.Id], cancellationToken);

        Guard.Against.NotFound(request.Id, entity);

        entity.ListId = request.ListId;
        entity.Priority = request.Priority;
        entity.Note = request.Note;

        await _context.SaveChangesAsync(cancellationToken);
    }
}
