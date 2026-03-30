using EFPractice.Application.Common.Behaviours;
using EFPractice.Application.Common.Interfaces;
using EFPractice.Application.UserTasks.Commands.CreateUserTask;
using Microsoft.Extensions.Logging;
using Moq;
using NUnit.Framework;

namespace EFPractice.Application.UnitTests.Common.Behaviours;

public class RequestLoggerTests
{
    private Mock<ILogger<CreateUserTaskCommand>> _logger = null!;
    private Mock<IUser> _user = null!;
    private Mock<IIdentityService> _identityService = null!;

    [SetUp]
    public void Setup()
    {
        _logger = new Mock<ILogger<CreateUserTaskCommand>>();
        _user = new Mock<IUser>();
        _identityService = new Mock<IIdentityService>();
    }

    [Test]
    public async Task ShouldCallGetUserNameAsyncOnceIfAuthenticated()
    {
        _user.Setup(x => x.Id).Returns(Guid.NewGuid().ToString());

        var requestLogger = new LoggingBehaviour<CreateUserTaskCommand>(_logger.Object, _user.Object, _identityService.Object);

        await requestLogger.Process(new CreateUserTaskCommand { ListId = 1, Title = "title" }, new CancellationToken());

        _identityService.Verify(i => i.GetUserNameAsync(It.IsAny<string>()), Times.Once);
    }

    [Test]
    public async Task ShouldNotCallGetUserNameAsyncOnceIfUnauthenticated()
    {
        var requestLogger = new LoggingBehaviour<CreateUserTaskCommand>(_logger.Object, _user.Object, _identityService.Object);

        await requestLogger.Process(new CreateUserTaskCommand { ListId = 1, Title = "title" }, new CancellationToken());

        _identityService.Verify(i => i.GetUserNameAsync(It.IsAny<string>()), Times.Never);
    }
}
