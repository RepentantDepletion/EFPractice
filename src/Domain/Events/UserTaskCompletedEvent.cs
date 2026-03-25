namespace EFPractice.Domain.Events;

public class userTaskCompletedEvent : BaseEvent
{
    public userTaskCompletedEvent(userTask item)
    {
        Item = item;
    }

    public userTask Item { get; }
}
