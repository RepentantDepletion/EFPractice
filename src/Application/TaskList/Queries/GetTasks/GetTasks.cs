using EFPractice.Application.Common.Interfaces;
using EFPractice.Application.Common.Models;
using EFPractice.Application.Common.Security;
using EFPractice.Application.TaskLists.Queries.GetTasks;
using EFPractice.Domain.Enums;
using EFPractice.Domain.ValueObjects;

namespace EFPractice.Application.TaskLists.Queries.GetTodos;

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
            PriorityLevels = Enum.GetValues(typeof(PriorityLevel))
                .Cast<PriorityLevel>()
                .Select(p => new LookupDto { Id = (int)p, Title = p.ToString() })
                .ToList(),

            Colours =
            [
                new ColourDto { Code = Colour.Grey, Name = nameof(Colour.Grey) },
                new ColourDto { Code = Colour.Purple, Name = nameof(Colour.Purple) },
                new ColourDto { Code = Colour.Blue, Name = nameof(Colour.Blue) },
                new ColourDto { Code = Colour.Teal, Name = nameof(Colour.Teal) },
                new ColourDto { Code = Colour.Green, Name = nameof(Colour.Green) },
                new ColourDto { Code = Colour.Orange, Name = nameof(Colour.Orange) },
                new ColourDto { Code = Colour.Red, Name = nameof(Colour.Red) },
            ],

            Lists = await _context.TaskLists
                .AsNoTracking()
                .ProjectTo<TaskListDto>(_mapper.ConfigurationProvider)
                .OrderBy(t => t.Title)
                .ToListAsync(cancellationToken)
        };
    }
}
