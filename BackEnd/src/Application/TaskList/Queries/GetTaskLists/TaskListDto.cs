using EFPractice.Application.TaskLists.Queries.GetTasks;
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

    public IReadOnlyCollection<UserTaskDto> Items { get; init; }

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<TaskList, TaskListDto>()
                .ForMember(d => d.Items, opt => opt.MapFrom(s => s.Items));
        }
    }
}
