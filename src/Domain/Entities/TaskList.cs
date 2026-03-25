namespace EFPractice.Domain.Entities;

public class TaskList : BaseAuditableEntity
{
    public string? Title { get; set; }

    public int ListID { get; set; }

    public Colour Colour { get; set; } = Colour.Grey;

    public IList<userTask> Items { get; private set; } = new List<userTask>();
}
