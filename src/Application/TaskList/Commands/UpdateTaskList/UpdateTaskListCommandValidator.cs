using EFPractice.Application.Common.Interfaces;

namespace EFPractice.Application.TaskLists.Commands.UpdateTaskList;

public class UpdateTaskListCommandValidator : AbstractValidator<UpdateTaskListCommand>
{
    private readonly IApplicationDbContext _context;

    public UpdateTaskListCommandValidator(IApplicationDbContext context)
    {
        _context = context;

        RuleFor(v => v.Title)
            .NotEmpty()
            .MaximumLength(200)
            .MustAsync(BeUniqueTitle)
                .WithMessage("'{PropertyName}' must be unique.")
                .WithErrorCode("Unique");
    }

    public async Task<bool> BeUniqueTitle(UpdateTaskListCommand model, string title, CancellationToken cancellationToken)
    {
        return !await _context.TaskLists
            .Where(l => l.Id != model.Id)
            .AnyAsync(l => l.Title == title, cancellationToken);
    }
}
