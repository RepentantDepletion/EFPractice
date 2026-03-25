using EFPractice.Application.userTasks.Commands.CreateuserTask;
using EFPractice.Application.userTasks.Commands.DeleteuserTask;
using EFPractice.Application.userTasks.Commands.UpdateuserTask;
using EFPractice.Application.userTasks.Commands.UpdateuserTaskDetail;
using Microsoft.AspNetCore.Http.HttpResults;

namespace EFPractice.Web.Endpoints;

public class userTasks : IEndpointGroup
{
    public static void Map(RouteGroupBuilder groupBuilder)
    {
        groupBuilder.RequireAuthorization();

        groupBuilder.MapPost(CreateuserTask);
        groupBuilder.MapPut(UpdateuserTask, "{id}");
        groupBuilder.MapPatch(UpdateuserTaskDetail, "UpdateDetail/{id}");
        groupBuilder.MapDelete(DeleteuserTask, "{id}");
    }

    [EndpointSummary("Create a new Todo Item")]
    [EndpointDescription("Creates a new todo item using the provided details and returns the ID of the created item.")]
    public static async Task<Created<int>> CreateuserTask(ISender sender, CreateuserTaskCommand command)
    {
        var id = await sender.Send(command);

        return TypedResults.Created($"/{nameof(userTasks)}/{id}", id);
    }

    [EndpointSummary("Update a Todo Item")]
    [EndpointDescription("Updates the specified todo item. The ID in the URL must match the ID in the payload.")]
    public static async Task<Results<NoContent, BadRequest>> UpdateuserTask(ISender sender, int id, UpdateuserTaskCommand command)
    {
        if (id != command.Id)
            return TypedResults.BadRequest();

        await sender.Send(command);

        return TypedResults.NoContent();
    }

    [EndpointSummary("Update Todo Item Details")]
    [EndpointDescription("Updates the detail fields of a specific todo item. The ID in the URL must match the ID in the payload.")]
    public static async Task<Results<NoContent, BadRequest>> UpdateuserTaskDetail(ISender sender, int id, UpdateuserTaskDetailCommand command)
    {
        if (id != command.Id) return TypedResults.BadRequest();

        await sender.Send(command);

        return TypedResults.NoContent();
    }

    [EndpointSummary("Delete a Todo Item")]
    [EndpointDescription("Deletes the todo item with the specified ID.")]
    public static async Task<NoContent> DeleteuserTask(ISender sender, int id)
    {
        await sender.Send(new DeleteuserTaskCommand(id));

        return TypedResults.NoContent();
    }
}
