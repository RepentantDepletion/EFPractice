using System.Security.Cryptography.X509Certificates;
using EFPractice.Application.Common.Interfaces;
using EFPractice.Domain.Entities;
using EFPractice.Domain.Enums;

namespace EFPractice.Application.UserTasks.Commands.GetUserTask;

public record CompleteTaskCommand(
    int? TaskId = null,
    string? Title = null
) : IRequest<UserTask>;

public class CompleteTaskCommandHandler : IRequestHandler<CompleteTaskCommand, UserTask>
{
    private readonly IApplicationDbContext _context;

    public CompleteTaskCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<UserTask> Handle(CompleteTaskCommand request, CancellationToken cancellationToken)
    {
        if (request.TaskId == null)
        {
            throw new ArgumentNullException(nameof(request.TaskId));
        }

        var entity = await _context.UserTasks.FindAsync(new object[] { request.TaskId }, cancellationToken);

        if (entity == null || entity.TaskID != request.TaskId)
        {
            throw new InvalidOperationException($"Task with ID {request.TaskId} not found.");
        }

        entity.Done = true;
        await _context.SaveChangesAsync(cancellationToken);

        return entity;
    }
}