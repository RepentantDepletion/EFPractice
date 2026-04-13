using EFPractice.Domain.Entities;

namespace EFPractice.Application.TaskLists.Queries.GetTasks;

public class UserTaskDto
{
    public int ID { get; init; }
    public int? ListId { get; init; }

    public string? Title { get; init; }

    public bool Done { get; init; }

    public int Priority { get; init; }

    public string? Description { get; init; }
    public DateTime Deadline { get; init; }

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<UserTask, UserTaskDto>();
        }
    }
}
