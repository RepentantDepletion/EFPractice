namespace EFPractice.Domain.Entities;

public class TaskList : BaseAuditableEntity
{
    public string? Title { get; set; }

    public int ListID { get; set; }

    public IList<UserTask> Items { get; private set; } = new List<UserTask>();
}
