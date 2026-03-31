using EFPractice.Application.Common.Interfaces;
using EFPractice.Domain.Entities;
using EFPractice.Domain.Enums;

namespace EFPractice.Application.UserTasks.Commands.GetAllTasks;

public record GetAllTasksCommand(
    int? TaskID = null,
    PriorityLevel? Priority = null
) : IRequest<List<UserTask>>;

public class GetAllTasksCommandHandler : IRequestHandler<GetAllTasksCommand, List<UserTask>>
{
    private readonly IApplicationDbContext _context;

    public GetAllTasksCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<UserTask>> Handle(GetAllTasksCommand request, CancellationToken cancellationToken)
    {
        return await _context.UserTasks.ToListAsync();
    }
}