using System.Security.Cryptography.X509Certificates;
using EFPractice.Application.Common.Interfaces;
using EFPractice.Domain.Entities;

namespace EFPractice.Application.UserTasks.Commands.CreateUserTask;

public record CreateUserTaskCommand : IRequest<int>
{
    public string? Title { get; init; }
    public string? Description { get; init; }
    public DateTime? Deadline { get; init; }
    public int ListID { get; init; }
    public bool Done { get; init; }
    public int Priority { get; init; }
}

public class CreateUserTaskCommandHandler : IRequestHandler<CreateUserTaskCommand, int>
{
    private readonly IApplicationDbContext _context;

    public CreateUserTaskCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<int> Handle(CreateUserTaskCommand request, CancellationToken cancellationToken)
    {
        var entity = new UserTask
        {
            Title = request.Title,
            Description = request.Description,
            Deadline = request.Deadline,
            ListID = request.ListID,
            Done = false
        };

        _context.UserTasks.Add(entity);

        await _context.SaveChangesAsync(cancellationToken);

        return entity.Id;
    }
}
