using EFPractice.Application.userTasks.Commands.CreateuserTask;
using EFPractice.Application.userTasks.Commands.UpdateuserTask;
using EFPractice.Application.userTasks.Commands.UpdateuserTaskDetail;
using EFPractice.Application.TaskLists.Commands.CreateTaskList;
using EFPractice.Domain.Entities;
using EFPractice.Domain.Enums;

namespace EFPractice.Application.FunctionalTests.userTasks.Commands;

public class UpdateuserTaskDetailTests : TestBase
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

        var command = new UpdateuserTaskDetailCommand
        {
            Id = itemId,
            ListId = listId,
            Note = "This is the note.",
            Priority = PriorityLevel.High
        };

        await TestApp.SendAsync(command);

        var item = await TestApp.FindAsync<userTask>(itemId);

        item.ShouldNotBeNull();
        item!.ListId.ShouldBe(command.ListId);
        item.Note.ShouldBe(command.Note);
        item.Priority.ShouldBe(command.Priority);
        item.LastModifiedBy.ShouldNotBeNull();
        item.LastModifiedBy.ShouldBe(userId);
        item.LastModified.ShouldBe(DateTime.Now, TimeSpan.FromMilliseconds(10000));
    }
}
