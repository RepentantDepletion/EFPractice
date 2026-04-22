using System.Security.Cryptography.X509Certificates;
using EFPractice.Application.UserTasks.Commands.CreateUserTask;
using EFPractice.Application.UserTasks.Commands.DeleteUserTask;
using EFPractice.Application.UserTasks.Commands.GetUserTask;
using EFPractice.Application.UserTasks.Commands.UpdateUserTaskDetail;
using EFPractice.Application.UserTasks.Commands.GetAllTasks;
using EFPractice.Domain.Entities;
using Microsoft.AspNetCore.Http.HttpResults;
using EFPractice.Application.TaskLists.Queries.GetTasks;

namespace EFPractice.Web.Endpoints;

public class UserTasks : IEndpointGroup
{
    public static void Map(RouteGroupBuilder groupBuilder)
    {

        groupBuilder.MapPost(CreateUserTask).RequireAuthorization();
        groupBuilder.MapPut(UpdateUserTaskDetail, "UpdateDetail/{id:int}").RequireAuthorization();
        groupBuilder.MapDelete(DeleteUserTask, "{id:int}").RequireAuthorization();
        groupBuilder.MapPut(MarkTaskAsCompleted, "Complete/{id:int}").RequireAuthorization();
        groupBuilder.MapGet(GetUserTask, "{id:int}").RequireAuthorization();
        groupBuilder.MapGet(GetAllTasks, "GetAll").RequireAuthorization();
    }

    [EndpointSummary("Create a new task")]
    [EndpointDescription("Creates a new task using the provided details and returns the ID of the created item.")]
    public static async Task<Created<int>> CreateUserTask(ISender sender, CreateUserTaskCommand command)
    {
        var id = await sender.Send(command);

        return TypedResults.Created($"/{nameof(UserTasks)}/{id}", id);
    }

    [EndpointSummary("Update task Details")]
    [EndpointDescription("Updates the detail fields of a specific task. The ID in the URL must match the ID in the payload.")]
    public static async Task<Results<NoContent, BadRequest>> UpdateUserTaskDetail(ISender sender, int id, UserTaskDto body)
    {
        if(body.Title == null || body.Description == null)
        {
            return TypedResults.BadRequest();
        }

        var command = new UpdateUserTaskDetailCommand(id)
        {
            ID = id,
            Title = body.Title,
            ListID = body.ListId,
            Priority = body.Priority,
            Description = body.Description,
            Deadline = body.Deadline,
            Done = body.Done,
            Recurrence = body.Recurrence
        };

        if (id != command.ID) return TypedResults.BadRequest();

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
    public static async Task<Results<NoContent, BadRequest>> MarkTaskAsCompleted(ISender sender, int id)
    {
        var command = new CompleteTaskCommand(id);

        await sender.Send(command);

        return TypedResults.NoContent();
    }
    [EndpointSummary("Get a task by ID")]
    [EndpointDescription("Retrieves the task with the specified ID.")]
    public static async Task<Ok<UserTaskDto>> GetUserTask(ISender sender, int id)
    {
        var task = await sender.Send(new GetTaskByIDQuery(id));
        return TypedResults.Ok(task);
    }

    [EndpointSummary("Get all tasks")]
    [EndpointDescription("Retrieves a list of all tasks")]
    public static async Task<Ok<List<UserTask>>> GetAllTasks(ISender sender, int? TaskID = null)
    {
        var tasks = await sender.Send(new GetAllTasksCommand(TaskID));
        return TypedResults.Ok(tasks);
    }
}