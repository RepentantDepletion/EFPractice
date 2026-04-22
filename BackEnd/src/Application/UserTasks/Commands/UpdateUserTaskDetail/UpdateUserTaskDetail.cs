using EFPractice.Application.Common.Interfaces;
using EFPractice.Domain.Entities;
using EFPractice.Domain.Enums;

namespace EFPractice.Application.UserTasks.Commands.UpdateUserTaskDetail;

public record UpdateUserTaskDetailCommand(int ID) : IRequest
{
    public string Title { get; init; } = string.Empty;
    public int? ListID { get; init; }

    public int Priority { get; init; }

    public string? Description { get; init; }
    public DateTime Deadline { get; init; }
    public bool Done { get; init; }
    public RecurrencePattern Recurrence { get; init; }
}

public class UpdateUserTaskDetailCommandHandler : IRequestHandler<UpdateUserTaskDetailCommand>
{
    private readonly IApplicationDbContext _context;
    private readonly IUser _user;

    public UpdateUserTaskDetailCommandHandler(IApplicationDbContext context, IUser user)
    {
        _context = context;
        _user = user;
    }

    public async Task Handle(UpdateUserTaskDetailCommand request, CancellationToken cancellationToken)
    {
        if(string.IsNullOrEmpty(_user.Id))
            throw new ArgumentException("User ID cannot be null or empty.");

        var entity = await _context.UserTasks.SingleOrDefaultAsync(x => x.Id == request.ID && x.UserID == _user.Id, cancellationToken);

        Guard.Against.NotFound(request.ID, entity);

        entity.Title = request.Title;
        entity.ListID = request.ListID;
        entity.Priority = request.Priority;
        entity.Description = request.Description;
        entity.Deadline = request.Deadline;
        entity.Done = request.Done;
        entity.Recurrence = request.Recurrence;
        await _context.SaveChangesAsync(cancellationToken);
    }
}
