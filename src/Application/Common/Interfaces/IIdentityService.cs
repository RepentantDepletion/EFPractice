using EFPractice.Application.Common.Models;

namespace EFPractice.Application.Common.Interfaces;

public interface IIdentityService
{
    Task<string?> GetUserNameAsync(string TaskID);

    Task<bool> IsInRoleAsync(string TaskID, string role);

    Task<bool> AuthorizeAsync(string TaskID, string policyName);

    Task<(Result Result, string TaskID)> CreateUserAsync(string userName, string password);

    Task<Result> DeleteUserAsync(string TaskID);
}
