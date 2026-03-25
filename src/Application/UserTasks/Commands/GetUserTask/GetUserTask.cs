using EFPractice.Application.Common.Interfaces;
using EFPractice.Domain.Entities;
using EFPractice.Domain.Enums;

namespace EFPractice.Application.userTasks.Commands.GetuserTask;

public record GetuserTaskCommand : IRequest<userTask?>
{
    public int TaskID { get; init; }

    public int ListId { get; init; }

    public string? Title { get; init; }

    public string ? Note { get; init; }

    public PriorityLevel Priority { get; init; }
}

public class GetuserTaskCommandHandler : IRequestHandler<GetuserTaskCommand, userTask?>
{
    private readonly IApplicationDbContext _context;

    public GetuserTaskCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<userTask?> Handle(GetuserTaskCommand request, CancellationToken cancellationToken)
    {
        var entity = await _context.userTasks.FindAsync(new object[] { request.TaskID }, cancellationToken);

        if (entity == null || entity.ListId != request.ListId)
        {
            return null;
        }

        return entity;
    }
}