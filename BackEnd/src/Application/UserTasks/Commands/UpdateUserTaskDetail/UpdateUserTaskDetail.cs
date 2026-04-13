using EFPractice.Application.Common.Interfaces;
using EFPractice.Domain.Entities;

namespace EFPractice.Application.UserTasks.Commands.UpdateUserTaskDetail;

public record UpdateUserTaskDetailCommand(int ID) : IRequest
{
    public string Title { get; init; } = string.Empty;
    public int ListID { get; init; }

    public int Priority { get; init; }

    public string? Description { get; init; }
    public DateTime Deadline { get; init; }
    public bool Done { get; init; }
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
            .FindAsync([request.ID], cancellationToken);

        Guard.Against.NotFound(request.ID, entity);

        entity.Title = request.Title;
        entity.ListID = request.ListID;
        entity.Priority = request.Priority;
        entity.Description = request.Description;
        entity.Deadline = request.Deadline;
        entity.Done = request.Done;
        await _context.SaveChangesAsync(cancellationToken);
    }
}
