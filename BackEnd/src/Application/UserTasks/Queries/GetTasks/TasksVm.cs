using EFPractice.Application.Common.Models;
using EFPractice.Application.TaskLists.Queries.GetTasks;

namespace EFPractice.Application.UserTasks.Queries.GetTasks;

public class TasksVm
{
    public IReadOnlyCollection<LookupDto> PriorityLevels { get; init; } = [];

    public IReadOnlyCollection<ColourDto> Colours { get; init; } = [];

    public IReadOnlyCollection<TaskListDto> Lists { get; init; } = [];
}

public class ColourDto
{
    public string Code { get; init; } = string.Empty;

    public string Name { get; init; } = string.Empty;
}
