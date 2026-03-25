using EFPractice.Application.Common.Interfaces;
using EFPractice.Domain.Entities;

namespace EFPractice.Application.userTasks.Commands.CreateuserTask;

public record CreateuserTaskCommand : IRequest<int>
{
    public int ListId { get; init; }

    public string? Title { get; init; }
}

public class CreateuserTaskCommandHandler : IRequestHandler<CreateuserTaskCommand, int>
{
    private readonly IApplicationDbContext _context;

    public CreateuserTaskCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<int> Handle(CreateuserTaskCommand request, CancellationToken cancellationToken)
    {
        var entity = new userTask
        {
            ListId = request.ListId,
            Title = request.Title,
            Done = false
        };

        _context.userTasks.Add(entity);

        await _context.SaveChangesAsync(cancellationToken);

        return entity.Id;
    }
}
