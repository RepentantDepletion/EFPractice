using EFPractice.Application.Common.Interfaces;
using EFPractice.Domain.Entities;
using EFPractice.Domain.Enums;

namespace EFPractice.Application.userTasks.Commands.GetuserTask;

public record CompleteTaskCommand(
    int? TaskID = null,
    string? Title = null
) : IRequest<userTask>;

public class CompleteTaskCommandHandler : IRequestHandler<CompleteTaskCommand, userTask>
{
    private readonly IApplicationDbContext _context;

    public CompleteTaskCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<userTask> Handle(CompleteTaskCommand request, CancellationToken cancellationToken)
    {
        if (request.TaskID == null)
        {
            throw new ArgumentNullException(nameof(request.TaskID));
        }
        
        var entity = await _context.userTasks.FindAsync(new object[] { request.TaskID }, cancellationToken);

        if (entity == null || entity.TaskID != request.TaskID)
        {
            throw new InvalidOperationException($"Task with ID {request.TaskID} not found.");
        }

        entity.Done = true;
        await _context.SaveChangesAsync(cancellationToken);

        return entity;
    }
}