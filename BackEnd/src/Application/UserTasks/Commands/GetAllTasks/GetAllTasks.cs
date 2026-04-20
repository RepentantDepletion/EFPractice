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
    private readonly IUser _user;

    public GetAllTasksCommandHandler(IApplicationDbContext context, IUser user)
    {
        _context = context;
        _user = user;
    }

    public async Task<List<UserTask>> Handle(GetAllTasksCommand request, CancellationToken cancellationToken)
    {
        if(string.IsNullOrEmpty(_user.Id))
            throw new ArgumentException("User ID cannot be null or empty.");

        var query = _context.UserTasks
            .Where(task => task.UserID == _user.Id)
            .AsQueryable();

        if (request.TaskID.HasValue)
        {
            query = query.Where(task => task.Id == request.TaskID.Value);
        }

        if (request.Priority.HasValue)
        {
            query = query.Where(task => task.Priority == (int)request.Priority.Value);
        }

        return await query.ToListAsync(cancellationToken);
    }
}