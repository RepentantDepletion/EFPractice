using EFPractice.Application.TaskLists.Commands.CreateTaskList;
using EFPractice.Application.TaskLists.Commands.DeleteTaskList;
using EFPractice.Application.TaskLists.Commands.UpdateTaskList;
using EFPractice.Application.TaskLists.Queries.GetTasks;
using EFPractice.Application.TaskLists.Queries.GetTodos;
using EFPractice.Application.UserTasks.Commands.GetUserTask;
using EFPractice.Domain.Entities;
using Microsoft.AspNetCore.Http.HttpResults;

namespace EFPractice.Web.Endpoints;

public class TaskLists : IEndpointGroup
{
    public static void Map(RouteGroupBuilder groupBuilder)
    {

        groupBuilder.MapGet(GetAllTaskLists);
        groupBuilder.MapPost(CreateTaskList);
        groupBuilder.MapPut(UpdateTaskList, "{id}");
        groupBuilder.MapDelete(DeleteTaskList, "{id}");
        groupBuilder.MapGet(GetTaskList, "{id}");
    }

    [EndpointSummary("Get all Task Lists")]
    [EndpointDescription("Retrieves all task lists along with their items.")]
    public static async Task<Ok<TasksVm>> GetAllTaskLists(ISender sender)
    {
        var vm = await sender.Send(new GetTasksQuery());

        return TypedResults.Ok(vm);
    }

    [EndpointSummary("Create a new Task List")]
    [EndpointDescription("Creates a new task list using the provided details and returns the ID of the created list.")]
    public static async Task<Created<int>> CreateTaskList(ISender sender, CreateTaskListCommand command)
    {
        var id = await sender.Send(command);

        return TypedResults.Created($"/{nameof(TaskLists)}/{id}", id);
    }

    [EndpointSummary("Update a Task List")]
    [EndpointDescription("Updates the specified task list. The ID in the URL must match the ID in the payload.")]
    public static async Task<Results<NoContent, BadRequest>> UpdateTaskList(ISender sender, int id, UpdateTaskListCommand command)
    {
        if (id != command.Id) return TypedResults.BadRequest();

        await sender.Send(command);

        return TypedResults.NoContent();
    }

    [EndpointSummary("Delete a Task List")]
    [EndpointDescription("Deletes the todo list with the specified ID.")]
    public static async Task<NoContent> DeleteTaskList(ISender sender, int id)
    {
        await sender.Send(new DeleteTaskListCommand(id));

        return TypedResults.NoContent();
    }
    [EndpointSummary("Get a Task List by ID")]
    [EndpointDescription("Retrieves the task list with the specified ID.")]
    public static async Task<Ok<TaskListDto>> GetTaskList(ISender sender, int id)
    {
        var taskList = await sender.Send(new GetTaskListByIDQuery(id));
        return TypedResults.Ok(taskList);
    }
}
