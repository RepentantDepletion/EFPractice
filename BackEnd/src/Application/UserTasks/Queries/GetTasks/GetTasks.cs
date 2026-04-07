using EFPractice.Application.Common.Interfaces;
using EFPractice.Application.Common.Models;
using EFPractice.Application.Common.Security;
using EFPractice.Application.TaskLists.Queries.GetTasks;
using EFPractice.Domain.Enums;
using EFPractice.Domain.ValueObjects;
using Microsoft.EntityFrameworkCore;

namespace EFPractice.Application.UserTasks.Queries.GetTasks;

[Authorize]
public record GetTasksQuery : IRequest<TasksVm>;

public class GetTasksQueryHandler : IRequestHandler<GetTasksQuery, TasksVm>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;

    public GetTasksQueryHandler(IApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<TasksVm> Handle(GetTasksQuery request, CancellationToken cancellationToken)
    {
        return new TasksVm
        {

            Lists = await _context.TaskLists
                .AsNoTracking()
                .ProjectTo<TaskListDto>(_mapper.ConfigurationProvider)
                .OrderBy(t => t.Title)
                .ToListAsync(cancellationToken)
        };
    }
}
