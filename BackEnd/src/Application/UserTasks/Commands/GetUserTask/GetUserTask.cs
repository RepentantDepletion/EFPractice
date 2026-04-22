using EFPractice.Application.Common.Interfaces;
using EFPractice.Application.TaskLists.Queries.GetTasks;
using EFPractice.Domain.Entities;
using EFPractice.Domain.Enums;

namespace EFPractice.Application.UserTasks.Commands.GetUserTask;

public record GetUserTaskCommand : IRequest<UserTask?>
{

    public GetUserTaskCommand(int id)
    {
        TaskID = id;
    }

    public int TaskID { get; init; }

    public int ListId { get; init; }
}

public class GetUserTaskCommandHandler : IRequestHandler<GetUserTaskCommand, UserTask?>
{
    private readonly IApplicationDbContext _context;
    private readonly IUser _user;

    public GetUserTaskCommandHandler(IApplicationDbContext context, IUser user)
    {
        _context = context;
        _user = user;
    }

    public async Task<UserTask?> Handle(GetUserTaskCommand request, CancellationToken cancellationToken)
    {
        if(string.IsNullOrEmpty(_user.Id))
            throw new ArgumentException("User ID cannot be null or empty.");

        var entity = await _context.UserTasks.SingleOrDefaultAsync(x => x.Id == request.TaskID && x.UserID == _user.Id, cancellationToken);

        if (entity == null || entity.ListID != request.ListId)
        {
            return null;
        }

        return entity;
    }
}