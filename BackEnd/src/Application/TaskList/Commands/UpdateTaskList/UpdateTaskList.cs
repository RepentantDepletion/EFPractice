using EFPractice.Application.Common.Interfaces;
using EFPractice.Domain.Entities;
using EFPractice.Domain.Enums;
using EFPractice.Domain.ValueObjects;
using Microsoft.EntityFrameworkCore;

namespace EFPractice.Application.TaskLists.Commands.UpdateTaskList;

public record UpdateTaskListCommand : IRequest
{
    public int Id { get; init; }

    public string? Title { get; init; }

    public IEnumerable<UpdateTaskListItem>? Items { get; init; }
}

public record UpdateTaskListItem(int ID)
{
    public string? Title { get; init; }

    public string? Description { get; init; }

    public int? Priority { get; init; }

    public bool? Done { get; init; }

    public DateTime? Deadline { get; init; }

    public int? ListID { get; init; }
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
            .Include(tl => tl.Items)
            .FirstOrDefaultAsync(tl => tl.Id == request.Id, cancellationToken);

        Guard.Against.NotFound(request.Id, entity);

        if (request.Title is not null)
        {
            entity.Title = request.Title;
        }

        if (request.Items is not null)
        {
            foreach (var item in request.Items)
            {
                if (item.ID == 0)
                {
                    if (item.Title is null && item.Description is null && item.Priority is null && item.Done is null && item.Deadline is null)
                    {
                        continue;
                    }

                    entity.Items.Add(new UserTask
                    {
                        Title = item.Title,
                        Description = item.Description,
                        Priority = item.Priority.HasValue ? (PriorityLevel)item.Priority.Value : PriorityLevel.Low,
                        Done = item.Done ?? false,
                        Deadline = item.Deadline,
                        ListID = item.ListID ?? entity.Id
                    });

                    continue;
                }

                var task = entity.Items.FirstOrDefault(t => t.Id == item.ID);

                Guard.Against.NotFound(item.ID, task);

                if (item.Title is not null)
                {
                    task.Title = item.Title;
                }

                if (item.Description is not null)
                {
                    task.Description = item.Description;
                }

                if (item.Priority.HasValue)
                {
                    task.Priority = (PriorityLevel)item.Priority.Value;
                }

                if (item.Done.HasValue)
                {
                    task.Done = item.Done.Value;
                }

                if (item.Deadline.HasValue)
                {
                    task.Deadline = item.Deadline;
                }

                if (item.ListID.HasValue)
                {
                    task.ListID = item.ListID.Value;
                }
            }
        }

        await _context.SaveChangesAsync(cancellationToken);
    }
}
