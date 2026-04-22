using System.Security.Cryptography.X509Certificates;
using EFPractice.Application.Common.Interfaces;
using EFPractice.Application.Common.Security;
using EFPractice.Domain.Entities;
using EFPractice.Domain.Enums;

namespace EFPractice.Application.UserTasks.Commands.GetUserTask;

[Authorize]

public record CompleteTaskCommand(int ID) : IRequest<UserTask>;

public class CompleteTaskCommandHandler : IRequestHandler<CompleteTaskCommand, UserTask>
{
    private readonly IApplicationDbContext _context;
    private readonly IUser _user;

    public CompleteTaskCommandHandler(IApplicationDbContext context, IUser user)
    {
        _context = context;
        _user = user;
    }

    public async Task<UserTask> Handle(CompleteTaskCommand request, CancellationToken cancellationToken)
    {
        if(string.IsNullOrEmpty(_user.Id))
            throw new ArgumentException("User ID cannot be null or empty.");


        var entity = await _context.UserTasks.SingleOrDefaultAsync(x => x.Id == request.ID && x.UserID == _user.Id, cancellationToken);

        if (entity == null || entity.Id != request.ID)
        {
            throw new InvalidOperationException($"Task with ID {request.ID} not found.");
        }

        entity.Done = true;
        await _context.SaveChangesAsync(cancellationToken);

        return entity;
    }
}