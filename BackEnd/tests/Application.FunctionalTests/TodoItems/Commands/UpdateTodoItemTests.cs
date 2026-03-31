using EFPractice.Application.UserTasks.Commands.CreateUserTask;
using EFPractice.Application.UserTasks.Commands.UpdateUserTask;
using EFPractice.Application.TaskLists.Commands.CreateTaskList;
using EFPractice.Domain.Entities;

namespace EFPractice.Application.FunctionalTests.UserTasks.Commands;

public class UpdateUserTaskTests : TestBase
{
    [Test]
    public async Task ShouldRequireValidUserTaskId()
    {
        var command = new UpdateUserTaskCommand { Id = 99, Title = "New Title" };
        await Should.ThrowAsync<NotFoundException>(() => TestApp.SendAsync(command));
    }

    [Test]
    public async Task ShouldUpdateUserTask()
    {
        var TaskID = await TestApp.RunAsDefaultUserAsync();

        var listId = await TestApp.SendAsync(new CreateTaskListCommand
        {
            Title = "New List"
        });

        var itemId = await TestApp.SendAsync(new CreateUserTaskCommand
        {
            ListId = listId,
            Title = "New Item"
        });

        var command = new UpdateUserTaskCommand
        {
            Id = itemId,
            Title = "Updated Item Title"
        };

        await TestApp.SendAsync(command);

        var item = await TestApp.FindAsync<UserTask>(itemId);

        item.ShouldNotBeNull();
        item!.Title.ShouldBe(command.Title);
        item.LastModifiedBy.ShouldNotBeNull();
        item.LastModifiedBy.ShouldBe(TaskID);
        item.LastModified.ShouldBe(DateTime.Now, TimeSpan.FromMilliseconds(10000));
    }
}
