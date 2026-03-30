using EFPractice.Application.Common.Interfaces;
using EFPractice.Domain.Entities;
using EFPractice.Domain.Enums;

namespace EFPractice.Application.UserTasks.Commands.GetUserTask;

public record GetTasksCommand(
    int? TaskID = null,
    PriorityLevel? Priority = null
) : IRequest<List<UserTask>>;

public class GetTasksCommandHandler : IRequestHandler<GetTasksCommand, List<UserTask>>
{
    private readonly IApplicationDbContext _context;

    public GetTasksCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<UserTask>> Handle(GetTasksCommand request, CancellationToken cancellationToken)
    {
        return await _context.UserTasks.ToListAsync();
    }
}