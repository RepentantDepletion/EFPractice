using EFPractice.Application.UserTasks.Commands.CreateUserTask;
using EFPractice.Application.UserTasks.Commands.DeleteUserTask;
using EFPractice.Application.TaskLists.Commands.CreateTaskList;
using EFPractice.Domain.Entities;

namespace EFPractice.Application.FunctionalTests.UserTasks.Commands;

public class DeleteUserTaskTests : TestBase
{
    [Test]
    public async Task ShouldRequireValidUserTaskId()
    {
        var command = new DeleteUserTaskCommand(99);

        await Should.ThrowAsync<NotFoundException>(() => TestApp.SendAsync(command));
    }

    [Test]
    public async Task ShouldDeleteUserTask()
    {
        var listId = await TestApp.SendAsync(new CreateTaskListCommand
        {
            Title = "New List"
        });

        var itemId = await TestApp.SendAsync(new CreateUserTaskCommand
        {
            ListId = listId,
            Title = "New Item"
        });

        await TestApp.SendAsync(new DeleteUserTaskCommand(itemId));

        var item = await TestApp.FindAsync<UserTask>(itemId);

        item.ShouldBeNull();
    }
}
