using EFPractice.Domain.Events;
using Microsoft.Extensions.Logging;

namespace EFPractice.Application.UserTasks.EventHandlers;

public class LogUserTaskCompleted : INotificationHandler<UserTaskCompletedEvent>
{
    private readonly ILogger<LogUserTaskCompleted> _logger;

    public LogUserTaskCompleted(ILogger<LogUserTaskCompleted> logger)
    {
        _logger = logger;
    }

    public Task Handle(UserTaskCompletedEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation("EFPractice Domain Event: {DomainEvent}", notification.GetType().Name);

        return Task.CompletedTask;
    }
}
