using EFPractice.Application.TodoLists.Queries.GetTodos;
using EFPractice.Domain.Entities;
using EFPractice.Domain.ValueObjects;

namespace EFPractice.Application.FunctionalTests.TodoLists.Queries;

public class GetTodosTests : TestBase
{
    [Test]
    public async Task ShouldReturnPriorityLevels()
    {
        await TestApp.RunAsDefaultUserAsync();

        var query = new GetTodosQuery();

        var result = await TestApp.SendAsync(query);

        result.PriorityLevels.ShouldNotBeEmpty();
    }

    [Test]
    public async Task ShouldReturnAllListsAndItems()
    {
        await TestApp.RunAsDefaultUserAsync();

        await TestApp.AddAsync(new TodoList
        {
            Title = "Shopping",
            Colour = Colour.Blue,
            Items =
                {
                    new userTask { Title = "Apples", Done = true },
                    new userTask { Title = "Milk", Done = true },
                    new userTask { Title = "Bread", Done = true },
                    new userTask { Title = "Toilet paper" },
                    new userTask { Title = "Pasta" },
                    new userTask { Title = "Tissues" },
                    new userTask { Title = "Tuna" }
                }
        });

        var query = new GetTodosQuery();

        var result = await TestApp.SendAsync(query);

        result.Lists.Count.ShouldBe(1);
        result.Lists.First().Items.Count.ShouldBe(7);
    }

    [Test]
    public async Task ShouldDenyAnonymousUser()
    {
        var query = new GetTodosQuery();

        var action = () => TestApp.SendAsync(query);

        await Should.ThrowAsync<UnauthorizedAccessException>(action);
    }
}
