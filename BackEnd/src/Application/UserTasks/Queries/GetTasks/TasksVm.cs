using EFPractice.Application.Common.Models;
using EFPractice.Application.TaskLists.Queries.GetTasks;

namespace EFPractice.Application.UserTasks.Queries.GetTasks;

public class TasksVm
{
    public IReadOnlyCollection<TaskListDto> Lists { get; init; } = [];
}