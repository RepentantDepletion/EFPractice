namespace EFPractice.Domain.ValueObjects;

public class TaskTitle(string title) : ValueObject
{
    public static TaskTitle From(string title)
    {
        var taskTitle = new TaskTitle(title);

        if (string.IsNullOrWhiteSpace(title))
        {
            throw new UnsupportedTitleException(title);
        }

        return taskTitle;
    }

    public string Title { get; private set; } = string.IsNullOrWhiteSpace(title)?"Untitled Task":title;

    protected override IEnumerable<object> GetEqualityComponents()
    {
        yield return title;
    }
}