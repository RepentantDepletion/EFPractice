namespace EFPractice.Domain.Entities;

public class TaskList : BaseEntity
{
    public int UserID { get; set; }
    public string? Title { get; set; }

    public IList<UserTask> Items { get; private set; } = new List<UserTask>();
}
