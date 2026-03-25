namespace EFPractice.Application.userTasks.Commands.CreateuserTask;

public class CreateuserTaskCommandValidator : AbstractValidator<CreateuserTaskCommand>
{
    public CreateuserTaskCommandValidator()
    {
        RuleFor(v => v.Title)
            .MaximumLength(200)
            .NotEmpty();
    }
}
