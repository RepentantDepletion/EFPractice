using EFPractice.Application.TaskLists.Queries.GetTasks;
using EFPractice.Domain.Entities;
using EFPractice.Domain.ValueObjects;

namespace EFPractice.Application.FunctionalTests.TaskLists.Queries;

public class GetTasksTests : TestBase
{
    [Test]
    public async Task ShouldReturnPriorityLevels()
    {
        await TestApp.RunAsDefaultUserAsync();

        var query = new GetTasksQuery();

        var result = await TestApp.SendAsync(query);

        result.PriorityLevels.ShouldNotBeEmpty();
    }

    [Test]
    public async Task ShouldReturnAllListsAndItems()
    {
        await TestApp.RunAsDefaultUserAsync();

        await TestApp.AddAsync(new TaskList
        {
            Title = "Shopping",
            Colour = Colour.Blue,
            Items =
                {
                    new UserTask { Title = "Apples", Done = true },
                    new UserTask { Title = "Milk", Done = true },
                    new UserTask { Title = "Bread", Done = true },
                    new UserTask { Title = "Toilet paper" },
                    new UserTask { Title = "Pasta" },
                    new UserTask { Title = "Tissues" },
                    new UserTask { Title = "Tuna" }
                }
        });

        var query = new GetTasksQuery();

        var result = await TestApp.SendAsync(query);

        result.Lists.Count.ShouldBe(1);
        result.Lists.First().Items.Count.ShouldBe(7);
    }

    [Test]
    public async Task ShouldDenyAnonymousUser()
    {
        var query = new GetTasksQuery();

        var action = () => TestApp.SendAsync(query);

        await Should.ThrowAsync<UnauthorizedAccessException>(action);
    }
}
