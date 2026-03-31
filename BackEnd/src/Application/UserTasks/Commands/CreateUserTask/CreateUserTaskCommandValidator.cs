namespace EFPractice.Application.UserTasks.Commands.CreateUserTask;

public class CreateUserTaskCommandValidator : AbstractValidator<CreateUserTaskCommand>
{
    public CreateUserTaskCommandValidator()
    {
        RuleFor(v => v.Title)
            .MaximumLength(200)
            .NotEmpty();
    }
}
