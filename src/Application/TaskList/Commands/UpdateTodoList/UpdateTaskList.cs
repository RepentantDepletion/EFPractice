using EFPractice.Application.Common.Interfaces;
using EFPractice.Domain.ValueObjects;

namespace EFPractice.Application.TaskLists.Commands.UpdateTaskList;

public record UpdateTaskListCommand : IRequest
{
    public int Id { get; init; }

    public string? Title { get; init; }

    public string? Colour { get; init; }
}

public class UpdateTaskListCommandHandler : IRequestHandler<UpdateTaskListCommand>
{
    private readonly IApplicationDbContext _context;

    public UpdateTaskListCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task Handle(UpdateTaskListCommand request, CancellationToken cancellationToken)
    {
        var entity = await _context.TaskLists
            .FindAsync([request.Id], cancellationToken);

        Guard.Against.NotFound(request.Id, entity);

        entity.Title = request.Title;

        if (request.Colour is not null)
        {
            entity.Colour = Colour.From(request.Colour);
        }

        await _context.SaveChangesAsync(cancellationToken);
    }
}
