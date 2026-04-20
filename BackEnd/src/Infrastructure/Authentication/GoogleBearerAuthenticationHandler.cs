using System.Security.Claims;
using System.Text.Encodings.Web;
using System.Text.Json;
using EFPractice.Infrastructure.Identity;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace EFPractice.Infrastructure.Authentication;

internal sealed class GoogleBearerAuthenticationHandler : AuthenticationHandler<AuthenticationSchemeOptions>
{
    private const string GoogleUserInfoEndpoint = "https://openidconnect.googleapis.com/v1/userinfo";

    private readonly IHttpClientFactory _httpClientFactory;
    private readonly UserManager<ApplicationUser> _userManager;

    public GoogleBearerAuthenticationHandler(
        IOptionsMonitor<AuthenticationSchemeOptions> options,
        ILoggerFactory logger,
        UrlEncoder encoder,
        IHttpClientFactory httpClientFactory,
        UserManager<ApplicationUser> userManager)
        : base(options, logger, encoder)
    {
        _httpClientFactory = httpClientFactory;
        _userManager = userManager;
    }

    protected override async Task<AuthenticateResult> HandleAuthenticateAsync()
    {
        if (!Request.Headers.TryGetValue("Authorization", out var authorizationValues))
        {
            return AuthenticateResult.NoResult();
        }

        var authorizationHeader = authorizationValues.ToString();
        if (!authorizationHeader.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
        {
            return AuthenticateResult.NoResult();
        }

        var accessToken = authorizationHeader["Bearer ".Length..].Trim();
        if (string.IsNullOrWhiteSpace(accessToken))
        {
            return AuthenticateResult.NoResult();
        }

        var googleUser = await GetGoogleUserAsync(accessToken);
        if (googleUser is null)
        {
            return AuthenticateResult.Fail("Invalid Google access token.");
        }

        var localUser = await GetOrCreateLocalUserAsync(googleUser);
        if (localUser is null)
        {
            return AuthenticateResult.Fail("Unable to create local user.");
        }

        var userName = localUser.UserName ?? googleUser.Email;
        var userEmail = localUser.Email ?? googleUser.Email;

        if (string.IsNullOrWhiteSpace(userName) || string.IsNullOrWhiteSpace(userEmail))
        {
            return AuthenticateResult.Fail("Google user data is incomplete.");
        }

        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, localUser.Id),
            new(ClaimTypes.Name, userName),
            new(ClaimTypes.Email, userEmail),
        };

        var identity = new ClaimsIdentity(claims, Scheme.Name);
        var principal = new ClaimsPrincipal(identity);
        var ticket = new AuthenticationTicket(principal, Scheme.Name);

        return AuthenticateResult.Success(ticket);
    }

    private async Task<GoogleUserInfo?> GetGoogleUserAsync(string accessToken)
    {
        var client = _httpClientFactory.CreateClient();
        using var request = new HttpRequestMessage(HttpMethod.Get, GoogleUserInfoEndpoint);
        request.Headers.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", accessToken);

        using var response = await client.SendAsync(request, HttpCompletionOption.ResponseHeadersRead, Context.RequestAborted);
        if (!response.IsSuccessStatusCode)
        {
            return null;
        }

        await using var stream = await response.Content.ReadAsStreamAsync(Context.RequestAborted);
        using var document = await JsonDocument.ParseAsync(stream, cancellationToken: Context.RequestAborted);

        var root = document.RootElement;

        return new GoogleUserInfo(
            root.TryGetProperty("sub", out var subValue) ? subValue.GetString() : null,
            root.TryGetProperty("email", out var emailValue) ? emailValue.GetString() : null,
            root.TryGetProperty("email_verified", out var emailVerifiedValue) && emailVerifiedValue.GetBoolean(),
            root.TryGetProperty("name", out var nameValue) ? nameValue.GetString() : null);
    }

    private async Task<ApplicationUser?> GetOrCreateLocalUserAsync(GoogleUserInfo googleUser)
    {
        if (string.IsNullOrWhiteSpace(googleUser.Email) || !googleUser.EmailVerified)
        {
            return null;
        }

        var localUser = await _userManager.FindByEmailAsync(googleUser.Email);
        if (localUser is not null)
        {
            return localUser;
        }

        localUser = new ApplicationUser
        {
            UserName = googleUser.Email,
            Email = googleUser.Email,
            EmailConfirmed = googleUser.EmailVerified,
        };

        try
        {
            var result = await _userManager.CreateAsync(localUser);
            if (result.Succeeded)
            {
                return localUser;
            }
        }
        catch (DbUpdateException)
        {
            // Another request likely created the same local user at the same time.
        }

        return await _userManager.FindByEmailAsync(googleUser.Email);
    }

    private sealed record GoogleUserInfo(
        string? Sub,
        string? Email,
        bool EmailVerified,
        string? Name);
}