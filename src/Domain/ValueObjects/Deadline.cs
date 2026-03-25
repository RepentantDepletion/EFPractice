namespace EFPractice.Domain.Exceptions;

public class Deadline(DateTime date) : ValueObject
{
    public static Deadline From(DateTime date)
    {
        var deadline = new Deadline(date);

        if (date < DateTime.UtcNow)
        {
            throw new UnsupportedDeadlineException(date);
        }

        return deadline;
    }

    protected override IEnumerable<object> GetEqualityComponents()
    {
        yield return date;
    }
}