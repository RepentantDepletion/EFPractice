namespace EFPractice.Domain.Exceptions;

public class UnsupportedDeadlineException : Exception
{
    public UnsupportedDeadlineException(DateTime deadline)
        : base($"Deadline \"{deadline}\" is unsupported.")
    {
    }
}