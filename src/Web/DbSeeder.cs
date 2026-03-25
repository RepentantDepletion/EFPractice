using EFPractice.Application.Common.Interfaces;
using EFPractice.Domain.Entities;
using EFPractice.Domain.Enums;

public static class DbSeeder
{
    public static async Task SeedAsync(IApplicationDbContext context)
    {
        if (!context.TaskLists.Any())
        {
            var lists = new List<TaskList>
            {
                new TaskList { Id = 1, Title = "Personal", Colour = (EFPractice.Domain.ValueObjects.Colour)"Blue" },
                new TaskList { Id = 2, Title = "Work", Colour = (EFPractice.Domain.ValueObjects.Colour)"Red" }
            };

            await context.TaskLists.AddRangeAsync(lists);
        }

        if (!context.userTasks.Any())
        {
            var tasks = new List<userTask>
            {
                new userTask 
                { 
                    Id = 1,
                    ListId = 1,
                    Title = "Walk the dog",
                    Note = "Before 7 PM",
                    Priority = PriorityLevel.Low
                },
                new userTask 
                { 
                    Id = 2,
                    ListId = 2,
                    Title = "Prepare slides",
                    Note = "For Monday meeting",
                    Priority = PriorityLevel.High
                }
            };

            await context.userTasks.AddRangeAsync(tasks);
        }

        await context.SaveChangesAsync(default);
    }
}