using EFPractice.Application.Common.Exceptions;
using EFPractice.Application.UserTasks.Commands.CreateUserTask;
using EFPractice.Application.TaskLists.Commands.CreateTaskList;
using EFPractice.Domain.Entities;

namespace EFPractice.Application.FunctionalTests.UserTasks.Commands;

public class CreateUserTaskTests : TestBase
{
    [Test]
    public async Task ShouldRequireMinimumFields()
    {
        var command = new CreateUserTaskCommand();

        await Should.ThrowAsync<ValidationException>(() => TestApp.SendAsync(command));
    }

    [Test]
    public async Task ShouldCreateUserTask()
    {
        var TaskID = await TestApp.RunAsDefaultUserAsync();

        var listId = await TestApp.SendAsync(new CreateTaskListCommand
        {
            Title = "New List"
        });

        var command = new CreateUserTaskCommand
        {
            ListId = listId,
            Title = "Tasks"
        };

        var itemId = await TestApp.SendAsync(command);

        var item = await TestApp.FindAsync<UserTask>(itemId);

        item.ShouldNotBeNull();
        item!.ListId.ShouldBe(command.ListId);
        item.Title.ShouldBe(command.Title);
        item.CreatedBy.ShouldBe(TaskID);
        item.Created.ShouldBe(DateTime.Now, TimeSpan.FromMilliseconds(10000));
        item.LastModifiedBy.ShouldBe(TaskID);
        item.LastModified.ShouldBe(DateTime.Now, TimeSpan.FromMilliseconds(10000));
    }
}
