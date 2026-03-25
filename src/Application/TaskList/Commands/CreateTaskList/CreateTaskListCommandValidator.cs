using EFPractice.Application.Common.Interfaces;

namespace EFPractice.Application.TaskLists.Commands.CreateTaskList;

public class CreateTaskListCommandValidator : AbstractValidator<CreateTaskListCommand>
{
    private readonly IApplicationDbContext _context;

    public CreateTaskListCommandValidator(IApplicationDbContext context)
    {
        _context = context;

        RuleFor(v => v.Title)
            .NotEmpty()
            .MaximumLength(200)
            .MustAsync(BeUniqueTitle)
                .WithMessage("'{PropertyName}' must be unique.")
                .WithErrorCode("Unique");
    }

    public async Task<bool> BeUniqueTitle(string title, CancellationToken cancellationToken)
    {
        return !await _context.TaskLists
            .AnyAsync(l => l.Title == title, cancellationToken);
    }
}
