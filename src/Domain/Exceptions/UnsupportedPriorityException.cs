namespace EFPractice.Domain.Exceptions;

public class UnsupportedPriorityException : Exception
{
    public UnsupportedPriorityException(int priority)
        : base($"Priority \"{priority}\" is unsupported.")
    {
    }
}