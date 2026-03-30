using EFPractice.Application.Common.Interfaces;
using EFPractice.Domain.Entities;
using EFPractice.Domain.ValueObjects;

namespace EFPractice.Application.TaskLists.Commands.CreateTaskList;

public record CreateTaskListCommand : IRequest<int>
{
    public string? Title { get; init; }
}

public class CreateTaskListCommandHandler : IRequestHandler<CreateTaskListCommand, int>
{
    private readonly IApplicationDbContext _context;

    public CreateTaskListCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<int> Handle(CreateTaskListCommand request, CancellationToken cancellationToken)
    {
        var entity = new TaskList
        {
            Title = request.Title
        };

        _context.TaskLists.Add(entity);

        await _context.SaveChangesAsync(cancellationToken);

        return entity.Id;
    }
}
