namespace EFPractice.Domain.Entities;

public class TaskList : BaseEntity
{
    public string UserID { get; set; } = string.Empty;
    public string? Title { get; set; }

    public IList<UserTask> Items { get; private set; } = new List<UserTask>();
}
