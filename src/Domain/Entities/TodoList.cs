namespace EFPractice.Domain.Entities;

public class TodoList : BaseAuditableEntity
{
    public string? Title { get; set; }

    public Colour Colour { get; set; } = Colour.Grey;

    public IList<userTask> Items { get; private set; } = new List<userTask>();
}
