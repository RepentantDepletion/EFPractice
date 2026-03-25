using EFPractice.Application.TaskLists.Queries.GetTodos;
using EFPractice.Domain.Entities;

namespace EFPractice.Application.TaskLists.Queries.GetTasks;

public class TaskListDto
{
    public TaskListDto()
    {
        Items = [];
    }

    public int Id { get; init; }

    public string? Title { get; init; }

    public string? Colour { get; init; }

    public IReadOnlyCollection<userTaskDto> Items { get; init; }

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<TaskList, TaskListDto>();
        }
    }
}
