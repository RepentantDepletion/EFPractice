using System.ComponentModel.DataAnnotations;
using System.Runtime.InteropServices;
using System.Security.Cryptography.X509Certificates;

namespace EFPractice.Domain.Entities;

public class UserTask : BaseAuditableEntity
{
    [Key]

    public required int TaskID { get; set; }

    public string? Title { get; set; }

    public string? Description { get; set; }

    public PriorityLevel Priority { get; set; }

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

    public int ListID { get; set; }
    public DateTime? Deadline { get; set; }
}
