using EFPractice.Application.Common.Interfaces;
using EFPractice.Domain.Enums;

namespace EFPractice.Application.UserTasks.Commands.UpdateUserTaskDetail;

public record UpdateUserTaskDetailCommand : IRequest
{
    public int Id { get; init; }

    public int ListID { get; init; }

    public PriorityLevel Priority { get; init; }

    public string? Description { get; init; }
}

public class UpdateUserTaskDetailCommandHandler : IRequestHandler<UpdateUserTaskDetailCommand>
{
    private readonly IApplicationDbContext _context;

    public UpdateUserTaskDetailCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task Handle(UpdateUserTaskDetailCommand request, CancellationToken cancellationToken)
    {
        var entity = await _context.UserTasks
            .FindAsync([request.Id], cancellationToken);

        Guard.Against.NotFound(request.Id, entity);

        entity.ListID = request.ListID;
        entity.Priority = request.Priority;
        entity.Description = request.Description;

        await _context.SaveChangesAsync(cancellationToken);
    }
}
