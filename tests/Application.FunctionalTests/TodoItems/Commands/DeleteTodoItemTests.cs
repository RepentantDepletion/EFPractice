using EFPractice.Application.userTasks.Commands.CreateuserTask;
using EFPractice.Application.userTasks.Commands.DeleteuserTask;
using EFPractice.Application.TodoLists.Commands.CreateTodoList;
using EFPractice.Domain.Entities;

namespace EFPractice.Application.FunctionalTests.userTasks.Commands;

public class DeleteuserTaskTests : TestBase
{
    [Test]
    public async Task ShouldRequireValiduserTaskId()
    {
        var command = new DeleteuserTaskCommand(99);

        await Should.ThrowAsync<NotFoundException>(() => TestApp.SendAsync(command));
    }

    [Test]
    public async Task ShouldDeleteuserTask()
    {
        var listId = await TestApp.SendAsync(new CreateTodoListCommand
        {
            Title = "New List"
        });

        var itemId = await TestApp.SendAsync(new CreateuserTaskCommand
        {
            ListId = listId,
            Title = "New Item"
        });

        await TestApp.SendAsync(new DeleteuserTaskCommand(itemId));

        var item = await TestApp.FindAsync<userTask>(itemId);

        item.ShouldBeNull();
    }
}
