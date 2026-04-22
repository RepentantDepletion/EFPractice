using EFPractice.Application.Common.Interfaces;

namespace EFPractice.Application.UserTasks.Commands.DeleteUserTask;

public record DeleteUserTaskCommand(int Id) : IRequest;

public class DeleteUserTaskCommandHandler : IRequestHandler<DeleteUserTaskCommand>
{
    private readonly IApplicationDbContext _context;
    private readonly IUser _user;

    public DeleteUserTaskCommandHandler(IApplicationDbContext context, IUser user)
    {
        _context = context;
        _user = user;
    }

    public async Task Handle(DeleteUserTaskCommand request, CancellationToken cancellationToken)
    {
        if(string.IsNullOrEmpty(_user.Id))
            throw new ArgumentException("User ID cannot be null or empty.");

        var entity = await _context.UserTasks.SingleOrDefaultAsync(x => x.Id == request.Id && x.UserID == _user.Id, cancellationToken);

        Guard.Against.NotFound(request.Id, entity);

        _context.UserTasks.Remove(entity);

        await _context.SaveChangesAsync(cancellationToken);
    }

}
