using EFPractice.Application.Common.Interfaces;
using EFPractice.Domain.Entities;
using EFPractice.Domain.Enums;

namespace EFPractice.Application.userTasks.Commands.GetuserTask;

public record GetTasksCommand(
    int? TaskID = null,
    PriorityLevel? Priority = null
) : IRequest<List<userTask>>;

public class GetTasksCommandHandler : IRequestHandler<GetTasksCommand, List<userTask>>
{
    private readonly IApplicationDbContext _context;

    public GetTasksCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<userTask>> Handle(GetTasksCommand request, CancellationToken cancellationToken)
    {
        return await _context.userTasks.ToListAsync();
    }
}