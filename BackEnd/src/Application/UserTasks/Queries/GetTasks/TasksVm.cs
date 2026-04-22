using EFPractice.Application.Common.Models;
using EFPractice.Application.TaskLists.Queries.GetTasks;

namespace EFPractice.Application.UserTasks.Queries.GetTasks;

public class TasksVm
{
    public IList<UserTaskDto> Tasks { get; init; } = new List<UserTaskDto>();
    public IReadOnlyCollection<TaskListDto> Lists { get; init; } = [];
}