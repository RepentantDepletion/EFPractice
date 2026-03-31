using EFPractice.Application.Common.Interfaces;
using EFPractice.Domain.Entities;
using EFPractice.Domain.Enums;

namespace EFPractice.Application.UserTasks.Commands.GetUserTask;

public record GetTaskListCommand(
    int? ListID = null,
    PriorityLevel? Priority = null
) : IRequest<TaskList?>;

public class GetTaskListCommandHandler : IRequestHandler<GetTaskListCommand, TaskList?>
{
    private readonly IApplicationDbContext _context;

    public GetTaskListCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<TaskList?> Handle(GetTaskListCommand request, CancellationToken cancellationToken)
    {
        if (request.ListID == null)
        {
            return null;
        }
        
        var entity = await _context.TaskLists.FindAsync(new object[] { request.ListID }, cancellationToken);

        if (entity == null || entity.Id != request.ListID || request.ListID == null)
        {
            return null;
        }

        return entity;
    }
}