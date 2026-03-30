using EFPractice.Application.UserTasks.Commands.CreateUserTask;
using EFPractice.Application.UserTasks.Commands.UpdateUserTask;
using EFPractice.Application.UserTasks.Commands.UpdateUserTaskDetail;
using EFPractice.Application.TaskLists.Commands.CreateTaskList;
using EFPractice.Domain.Entities;
using EFPractice.Domain.Enums;

namespace EFPractice.Application.FunctionalTests.UserTasks.Commands;

public class UpdateUserTaskDetailTests : TestBase
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

        var command = new UpdateUserTaskDetailCommand
        {
            Id = itemId,
            ListId = listId,
            Note = "This is the note.",
            Priority = PriorityLevel.High
        };

        await TestApp.SendAsync(command);

        var item = await TestApp.FindAsync<UserTask>(itemId);

        item.ShouldNotBeNull();
        item!.ListId.ShouldBe(command.ListId);
        item.Note.ShouldBe(command.Note);
        item.Priority.ShouldBe(command.Priority);
        item.LastModifiedBy.ShouldNotBeNull();
        item.LastModifiedBy.ShouldBe(TaskID);
        item.LastModified.ShouldBe(DateTime.Now, TimeSpan.FromMilliseconds(10000));
    }
}
