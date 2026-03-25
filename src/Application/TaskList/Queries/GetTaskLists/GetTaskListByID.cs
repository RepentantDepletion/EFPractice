using EFPractice.Application.Common.Interfaces;
using EFPractice.Application.TaskLists.Queries.GetTodos;
using EFPractice.Domain.Entities;

namespace EFPractice.Application.TaskLists.Queries.GetTasks;

public class GetTaskListByIDQuery : IRequest<TaskListDto>
{
    public GetTaskListByIDQuery(int id)
    {
        Id = id;
    }

    public int Id { get; init; }
}

public class GetTaskListByIDQueryHandler : IRequestHandler<GetTaskListByIDQuery, TaskListDto>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;

    public GetTaskListByIDQueryHandler(IApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }


public async Task<TaskListDto> Handle(
        GetTaskListByIDQuery request, 
        CancellationToken cancellationToken)
    {
        var result = await _context.TaskLists
            .Where(tl => tl.Id == request.Id)
            .ProjectTo<TaskListDto>(_mapper.ConfigurationProvider)
            .FirstOrDefaultAsync(cancellationToken);

        if(result == null)
        {
            throw new NotFoundException(nameof(TaskList), request.Id.ToString());
        }

        return result; // returns null if not found (you can throw NotFound if you want)
    }

}