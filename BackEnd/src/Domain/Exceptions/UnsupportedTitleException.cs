namespace EFPractice.Domain.Exceptions;

public class UnsupportedTitleException : Exception
{
    public UnsupportedTitleException(string title)
        : base($"Title \"{title}\" is unsupported.")
    {
    }
}