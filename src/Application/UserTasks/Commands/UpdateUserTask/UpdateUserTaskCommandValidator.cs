namespace EFPractice.Application.UserTasks.Commands.UpdateUserTask;

public class UpdateUserTaskCommandValidator : AbstractValidator<UpdateUserTaskCommand>
{
    public UpdateUserTaskCommandValidator()
    {
        RuleFor(v => v.Title)
            .MaximumLength(200)
            .NotEmpty();
    }
}
