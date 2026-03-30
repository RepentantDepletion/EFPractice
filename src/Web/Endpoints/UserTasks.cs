using System.Security.Cryptography.X509Certificates;
using EFPractice.Application.TaskLists.Queries.GetTodos;
using EFPractice.Application.UserTasks.Commands.CreateUserTask;
using EFPractice.Application.UserTasks.Commands.DeleteUserTask;
using EFPractice.Application.UserTasks.Commands.GetUserTask;
using EFPractice.Application.UserTasks.Commands.UpdateUserTask;
using EFPractice.Application.UserTasks.Commands.UpdateUserTaskDetail;
using EFPractice.Domain.Entities;
using Microsoft.AspNetCore.Http.HttpResults;

namespace EFPractice.Web.Endpoints;

public class UserTasks : IEndpointGroup
{
    public static void Map(RouteGroupBuilder groupBuilder)
    {

        groupBuilder.MapPost(CreateUserTask);
        groupBuilder.MapPut(UpdateUserTask, "{id}");
        groupBuilder.MapPatch(UpdateUserTaskDetail, "UpdateDetail/{id}");
        groupBuilder.MapDelete(DeleteUserTask, "{id}");
        groupBuilder.MapPatch(MarkTaskAsCompleted, "Complete/{id}");
        groupBuilder.MapGet(GetUserTask, "{id}");
    }

    [EndpointSummary("Create a new task")]
    [EndpointDescription("Creates a new task using the provided details and returns the ID of the created item.")]
    public static async Task<Created<int>> CreateUserTask(ISender sender, CreateUserTaskCommand command)
    {
        var id = await sender.Send(command);

        return TypedResults.Created($"/{nameof(UserTasks)}/{id}", id);
    }

    [EndpointSummary("Update a task Item")]
    [EndpointDescription("Updates the specified task. The ID in the URL must match the ID in the payload.")]
    public static async Task<Results<NoContent, BadRequest>> UpdateUserTask(ISender sender, int id, UpdateUserTaskCommand command)
    {
        if (id != command.Id)
            return TypedResults.BadRequest();

        await sender.Send(command);

        return TypedResults.NoContent();
    }

    [EndpointSummary("Update task Details")]
    [EndpointDescription("Updates the detail fields of a specific task. The ID in the URL must match the ID in the payload.")]
    public static async Task<Results<NoContent, BadRequest>> UpdateUserTaskDetail(ISender sender, int id, UpdateUserTaskDetailCommand command)
    {
        if (id != command.Id) return TypedResults.BadRequest();

        await sender.Send(command);

        return TypedResults.NoContent();
    }

    [EndpointSummary("Delete a task")]
    [EndpointDescription("Deletes the task with the specified ID.")]
    public static async Task<NoContent> DeleteUserTask(ISender sender, int id)
    {
        await sender.Send(new DeleteUserTaskCommand(id));

        return TypedResults.NoContent();
    }
    [EndpointSummary("Mark a task as completed")]
    [EndpointDescription("Marks the specified task as completed. The ID in the URL must match the ID in the payload.")]
    public static async Task<Results<NoContent, BadRequest>> MarkTaskAsCompleted(ISender sender, int id, CompleteTaskCommand command)
    {
        if (id != command.TaskId) return TypedResults.BadRequest();

        await sender.Send(command);

        return TypedResults.NoContent();
    }
    [EndpointSummary("Get a task by ID")]
    [EndpointDescription("Retrieves the task with the specified ID.")]
    public static async Task<Ok<UserTask>> GetUserTask(ISender sender, int id)
    {
        var task = await sender.Send(new GetUserTaskCommand(id));
        return TypedResults.Ok(task);
    }
}