using EFPractice.Application.Common.Interfaces;
using EFPractice.Application.Common.Models;
using EFPractice.Application.Common.Security;
using EFPractice.Application.TaskLists.Queries.GetTasks;
using EFPractice.Domain.Enums;
using EFPractice.Domain.ValueObjects;

namespace EFPractice.Application.TaskLists.Queries.GetTodos;

public record GetTaskByIDQuery :IRequest<UserTaskDto?>
{
    public GetTaskByIDQuery(int id)
    {
        ID = id;
    }

    public int ID { get; init; }
}

public class GetTaskByIDQueryHandler : IRequestHandler<GetTaskByIDQuery, UserTaskDto?>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;

    public GetTaskByIDQueryHandler(IApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<UserTaskDto?> Handle(GetTaskByIDQuery request, CancellationToken cancellationToken)
    {
        var entity = await _context.UserTasks.FindAsync(new object[] { request.ID }, cancellationToken);

        if (entity == null)
        {
            return null;
        }

        return _mapper.Map<UserTaskDto>(entity);
    }
}