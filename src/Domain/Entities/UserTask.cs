namespace EFPractice.Domain.Entities;

public class userTask : BaseAuditableEntity
{
    public int TaskID { get; set; }

    public string? Title { get; set; }

    public string? Note { get; set; }

    public PriorityLevel Priority { get; set; }

    private bool _done;
    public bool Done
    {
        get => _done;
        set
        {
            if (value && !_done)
            {
                AddDomainEvent(new userTaskCompletedEvent(this));
            }

            _done = value;
        }
    }

    public TaskList List { get; set; } = null!;

    public int ListId { get; set; }
}
