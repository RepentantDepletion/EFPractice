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

    public GetUserTaskCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<UserTask?> Handle(GetUserTaskCommand request, CancellationToken cancellationToken)
    {
        var entity = await _context.UserTasks.FindAsync(request.TaskID , cancellationToken);

        if (entity == null || entity.ListID != request.ListId)
        {
            return null;
        }

        return entity;
    }
}