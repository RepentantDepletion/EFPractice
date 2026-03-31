using System.Security.Cryptography.X509Certificates;
using EFPractice.Application.Common.Interfaces;
using EFPractice.Domain.Entities;
using EFPractice.Domain.Enums;

namespace EFPractice.Application.UserTasks.Commands.GetUserTask;

public record CompleteTaskCommand(int ID) : IRequest<UserTask>;

public class CompleteTaskCommandHandler : IRequestHandler<CompleteTaskCommand, UserTask>
{
    private readonly IApplicationDbContext _context;

    public CompleteTaskCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<UserTask> Handle(CompleteTaskCommand request, CancellationToken cancellationToken)
    {
        var entity = await _context.UserTasks.FindAsync(new object[] { request.ID }, cancellationToken);

        if (entity == null || entity.Id != request.ID)
        {
            throw new InvalidOperationException($"Task with ID {request.ID} not found.");
        }

        entity.Done = true;
        await _context.SaveChangesAsync(cancellationToken);

        return entity;
    }
}