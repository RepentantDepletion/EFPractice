using System.ComponentModel.DataAnnotations;
using System.Runtime.InteropServices;

namespace EFPractice.Domain.Entities;

public class UserTask : BaseEntity
{
    public string UserID { get; set; } = string.Empty;

    public string? Title { get; set; }

    public string? Description { get; set; }

    public int Priority { get; set; }

    private bool _done;
    public bool Done
    {
        get => _done;
        set
        {
            if (value && !_done)
            {
                AddDomainEvent(new UserTaskCompletedEvent(this));
            }

            _done = value;
        }
    }

    public int? ListID { get; set; }

    public TaskList? TaskList { get; set; }

    public DateTime? Deadline { get; set; }

    public RecurrencePattern Recurrence { get; set; }
}
