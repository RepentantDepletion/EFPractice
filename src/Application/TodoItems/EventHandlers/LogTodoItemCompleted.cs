using EFPractice.Domain.Events;
using Microsoft.Extensions.Logging;

namespace EFPractice.Application.userTasks.EventHandlers;

public class LoguserTaskCompleted : INotificationHandler<userTaskCompletedEvent>
{
    private readonly ILogger<LoguserTaskCompleted> _logger;

    public LoguserTaskCompleted(ILogger<LoguserTaskCompleted> logger)
    {
        _logger = logger;
    }

    public Task Handle(userTaskCompletedEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation("EFPractice Domain Event: {DomainEvent}", notification.GetType().Name);

        return Task.CompletedTask;
    }
}
