using System.Diagnostics;
using EFPractice.Application.Common.Interfaces;
using Microsoft.Extensions.Logging;

namespace EFPractice.Application.Common.Behaviours;

public class PerformanceBehaviour<TRequest, TResponse> : IPipelineBehavior<TRequest, TResponse>
    where TRequest : notnull
{
    private readonly Stopwatch _timer;
    private readonly ILogger<TRequest> _logger;
    private readonly IUser _user;
    private readonly IIdentityService _identityService;

    public PerformanceBehaviour(
        ILogger<TRequest> logger,
        IUser user,
        IIdentityService identityService)
    {
        _timer = new Stopwatch();

        _logger = logger;
        _user = user;
        _identityService = identityService;
    }

    public async Task<TResponse> Handle(TRequest request, RequestHandlerDelegate<TResponse> next, CancellationToken cancellationToken)
    {
        _timer.Start();

        var response = await next();

        _timer.Stop();

        var elapsedMilliseconds = _timer.ElapsedMilliseconds;

        if (elapsedMilliseconds > 500)
        {
            var requestName = typeof(TRequest).Name;
            var TaskID = _user.Id ?? string.Empty;
            var userName = string.Empty;

            if (!string.IsNullOrEmpty(TaskID))
            {
                userName = await _identityService.GetUserNameAsync(TaskID);
            }

            _logger.LogWarning("EFPractice Long Running Request: {Name} ({ElapsedMilliseconds} milliseconds) {@TaskID} {@UserName} {@Request}",
                requestName, elapsedMilliseconds, TaskID, userName, request);
        }

        return response;
    }
}
