using EFPractice.Application.Common.Behaviours;
using EFPractice.Application.Common.Interfaces;
using EFPractice.Application.userTasks.Commands.CreateuserTask;
using Microsoft.Extensions.Logging;
using Moq;
using NUnit.Framework;

namespace EFPractice.Application.UnitTests.Common.Behaviours;

public class RequestLoggerTests
{
    private Mock<ILogger<CreateuserTaskCommand>> _logger = null!;
    private Mock<IUser> _user = null!;
    private Mock<IIdentityService> _identityService = null!;

    [SetUp]
    public void Setup()
    {
        _logger = new Mock<ILogger<CreateuserTaskCommand>>();
        _user = new Mock<IUser>();
        _identityService = new Mock<IIdentityService>();
    }

    [Test]
    public async Task ShouldCallGetUserNameAsyncOnceIfAuthenticated()
    {
        _user.Setup(x => x.Id).Returns(Guid.NewGuid().ToString());

        var requestLogger = new LoggingBehaviour<CreateuserTaskCommand>(_logger.Object, _user.Object, _identityService.Object);

        await requestLogger.Process(new CreateuserTaskCommand { ListId = 1, Title = "title" }, new CancellationToken());

        _identityService.Verify(i => i.GetUserNameAsync(It.IsAny<string>()), Times.Once);
    }

    [Test]
    public async Task ShouldNotCallGetUserNameAsyncOnceIfUnauthenticated()
    {
        var requestLogger = new LoggingBehaviour<CreateuserTaskCommand>(_logger.Object, _user.Object, _identityService.Object);

        await requestLogger.Process(new CreateuserTaskCommand { ListId = 1, Title = "title" }, new CancellationToken());

        _identityService.Verify(i => i.GetUserNameAsync(It.IsAny<string>()), Times.Never);
    }
}
