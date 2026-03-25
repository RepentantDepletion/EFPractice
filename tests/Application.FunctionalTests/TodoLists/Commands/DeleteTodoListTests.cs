using EFPractice.Application.TaskLists.Commands.CreateTaskList;
using EFPractice.Application.TaskLists.Commands.DeleteTaskList;
using EFPractice.Domain.Entities;

namespace EFPractice.Application.FunctionalTests.TaskLists.Commands;

public class DeleteTaskListTests : TestBase
{
    [Test]
    public async Task ShouldRequireValidTaskListId()
    {
        var command = new DeleteTaskListCommand(99);
        await Should.ThrowAsync<NotFoundException>(() => TestApp.SendAsync(command));
    }

    [Test]
    public async Task ShouldDeleteTaskList()
    {
        var listId = await TestApp.SendAsync(new CreateTaskListCommand
        {
            Title = "New List"
        });

        await TestApp.SendAsync(new DeleteTaskListCommand(listId));

        var list = await TestApp.FindAsync<TaskList>(listId);

        list.ShouldBeNull();
    }
}
