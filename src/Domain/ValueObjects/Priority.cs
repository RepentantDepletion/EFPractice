namespace EFPractice.Domain.Exceptions;

public class Priority(int prioValue) : ValueObject
{
    public static Priority From(int prioValue)
    {
        var priority = new Priority(prioValue);

        if (prioValue < 1 || prioValue > 5)
        {
            throw new UnsupportedPriorityException(prioValue);
        }

        return priority;
    }

    public int prioValue { get; private set; } = prioValue;

    protected override IEnumerable<object> GetEqualityComponents()
    {
        yield return prioValue;
    }
}