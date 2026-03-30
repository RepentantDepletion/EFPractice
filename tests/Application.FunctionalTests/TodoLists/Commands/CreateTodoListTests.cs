using EFPractice.Application.Common.Exceptions;
using EFPractice.Application.TaskLists.Commands.CreateTaskList;
using EFPractice.Domain.Entities;

namespace EFPractice.Application.FunctionalTests.TaskLists.Commands;

public class CreateTaskListTests : TestBase
{
    [Test]
    public async Task ShouldRequireMinimumFields()
    {
        var command = new CreateTaskListCommand();
        await Should.ThrowAsync<ValidationException>(() => TestApp.SendAsync(command));
    }

    [Test]
    public async Task ShouldRequireUniqueTitle()
    {
        await TestApp.SendAsync(new CreateTaskListCommand
        {
            Title = "Shopping"
        });

        var command = new CreateTaskListCommand
        {
            Title = "Shopping"
        };

        await Should.ThrowAsync<ValidationException>(() => TestApp.SendAsync(command));
    }

    [Test]
    public async Task ShouldCreateTaskList()
    {
        var TaskID = await TestApp.RunAsDefaultUserAsync();

        var command = new CreateTaskListCommand
        {
            Title = "Tasks"
        };

        var id = await TestApp.SendAsync(command);

        var list = await TestApp.FindAsync<TaskList>(id);

        list.ShouldNotBeNull();
        list!.Title.ShouldBe(command.Title);
        list.CreatedBy.ShouldBe(TaskID);
        list.Created.ShouldBe(DateTime.Now, TimeSpan.FromMilliseconds(10000));
    }
}
