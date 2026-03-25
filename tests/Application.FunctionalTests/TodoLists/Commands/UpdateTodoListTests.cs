using EFPractice.Application.Common.Exceptions;
using EFPractice.Application.TaskLists.Commands.CreateTaskList;
using EFPractice.Application.TaskLists.Commands.UpdateTaskList;
using EFPractice.Domain.Entities;

namespace EFPractice.Application.FunctionalTests.TaskLists.Commands;

public class UpdateTaskListTests : TestBase
{
    [Test]
    public async Task ShouldRequireValidTaskListId()
    {
        var command = new UpdateTaskListCommand { Id = 99, Title = "New Title" };
        await Should.ThrowAsync<NotFoundException>(() => TestApp.SendAsync(command));
    }

    [Test]
    public async Task ShouldRequireUniqueTitle()
    {
        var listId = await TestApp.SendAsync(new CreateTaskListCommand
        {
            Title = "New List"
        });

        await TestApp.SendAsync(new CreateTaskListCommand
        {
            Title = "Other List"
        });

        var command = new UpdateTaskListCommand
        {
            Id = listId,
            Title = "Other List"
        };

        var ex = await Should.ThrowAsync<ValidationException>(() => TestApp.SendAsync(command));

        ex.Errors.ShouldContainKey("Title");
        ex.Errors["Title"].ShouldContain("'Title' must be unique.");
    }

    [Test]
    public async Task ShouldUpdateTaskList()
    {
        var userId = await TestApp.RunAsDefaultUserAsync();

        var listId = await TestApp.SendAsync(new CreateTaskListCommand
        {
            Title = "New List"
        });

        var command = new UpdateTaskListCommand
        {
            Id = listId,
            Title = "Updated List Title"
        };

        await TestApp.SendAsync(command);

        var list = await TestApp.FindAsync<TaskList>(listId);

        list.ShouldNotBeNull();
        list!.Title.ShouldBe(command.Title);
        list.LastModifiedBy.ShouldNotBeNull();
        list.LastModifiedBy.ShouldBe(userId);
        list.LastModified.ShouldBe(DateTime.Now, TimeSpan.FromMilliseconds(10000));
    }
}
