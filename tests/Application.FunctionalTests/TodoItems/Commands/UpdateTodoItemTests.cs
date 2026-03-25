using EFPractice.Application.userTasks.Commands.CreateuserTask;
using EFPractice.Application.userTasks.Commands.UpdateuserTask;
using EFPractice.Application.TaskLists.Commands.CreateTaskList;
using EFPractice.Domain.Entities;

namespace EFPractice.Application.FunctionalTests.userTasks.Commands;

public class UpdateuserTaskTests : TestBase
{
    [Test]
    public async Task ShouldRequireValiduserTaskId()
    {
        var command = new UpdateuserTaskCommand { Id = 99, Title = "New Title" };
        await Should.ThrowAsync<NotFoundException>(() => TestApp.SendAsync(command));
    }

    [Test]
    public async Task ShouldUpdateuserTask()
    {
        var userId = await TestApp.RunAsDefaultUserAsync();

        var listId = await TestApp.SendAsync(new CreateTaskListCommand
        {
            Title = "New List"
        });

        var itemId = await TestApp.SendAsync(new CreateuserTaskCommand
        {
            ListId = listId,
            Title = "New Item"
        });

        var command = new UpdateuserTaskCommand
        {
            Id = itemId,
            Title = "Updated Item Title"
        };

        await TestApp.SendAsync(command);

        var item = await TestApp.FindAsync<userTask>(itemId);

        item.ShouldNotBeNull();
        item!.Title.ShouldBe(command.Title);
        item.LastModifiedBy.ShouldNotBeNull();
        item.LastModifiedBy.ShouldBe(userId);
        item.LastModified.ShouldBe(DateTime.Now, TimeSpan.FromMilliseconds(10000));
    }
}
