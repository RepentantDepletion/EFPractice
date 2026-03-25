namespace EFPractice.Application.userTasks.Commands.UpdateuserTask;

public class UpdateuserTaskCommandValidator : AbstractValidator<UpdateuserTaskCommand>
{
    public UpdateuserTaskCommandValidator()
    {
        RuleFor(v => v.Title)
            .MaximumLength(200)
            .NotEmpty();
    }
}
