namespace EFPractice.Domain.Events;

public class UserTaskCompletedEvent : BaseEvent
{
    public UserTaskCompletedEvent(UserTask item)
    {
        Item = item;
    }

    public UserTask Item { get; }
}
