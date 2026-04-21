using EFPractice.Infrastructure.Identity;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using System.Net.Http.Headers;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;

namespace EFPractice.Web.Endpoints;

public class Users : IEndpointGroup
{
    private const string GoogleTokenEndpoint = "https://oauth2.googleapis.com/token";
    private const string GoogleUserInfoEndpoint = "https://openidconnect.googleapis.com/v1/userinfo";

    public static void Map(RouteGroupBuilder groupBuilder)
    {
        groupBuilder.MapIdentityApi<ApplicationUser>();

        groupBuilder.MapPost(ExchangeGoogleCode, "google/exchange");
        groupBuilder.MapPost(Logout, "logout").RequireAuthorization();
    }

    [EndpointSummary("Exchange Google authorization code")]
    [EndpointDescription("Exchanges a Google OAuth authorization code for an authenticated server-side session.")]
    public static async Task<Results<NoContent, BadRequest<string>>> ExchangeGoogleCode(
        [FromBody] GoogleCodeExchangeRequest request,
        IConfiguration configuration,
        IHttpClientFactory httpClientFactory,
        UserManager<ApplicationUser> userManager,
        SignInManager<ApplicationUser> signInManager,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Code)
            || string.IsNullOrWhiteSpace(request.CodeVerifier)
            || string.IsNullOrWhiteSpace(request.RedirectUri))
        {
            return TypedResults.BadRequest("Code, codeVerifier, and redirectUri are required.");
        }

        if (!Uri.TryCreate(request.RedirectUri, UriKind.Absolute, out _))
        {
            return TypedResults.BadRequest("redirectUri must be an absolute URI.");
        }

        var configuredClientId = configuration["GoogleOAuth:ClientId"];
        var clientId = configuredClientId;

        if (string.IsNullOrWhiteSpace(clientId))
        {
            return TypedResults.BadRequest("Google OAuth client ID is not configured.");
        }

        var allowedRedirectUris = configuration.GetSection("GoogleOAuth:AllowedRedirectUris").Get<string[]>() ?? [];
        if (allowedRedirectUris.Length > 0
            && !allowedRedirectUris.Contains(request.RedirectUri, StringComparer.Ordinal))
        {
            return TypedResults.BadRequest("redirectUri is not allowed.");
        }

        var formValues = new List<KeyValuePair<string, string>>
        {
            new("grant_type", "authorization_code"),
            new("code", request.Code),
            new("code_verifier", request.CodeVerifier),
            new("client_id", clientId),
            new("redirect_uri", request.RedirectUri),
        };

        var clientSecret = configuration["GoogleOAuth:ClientSecret"];
        if (!string.IsNullOrWhiteSpace(clientSecret))
        {
            formValues.Add(new("client_secret", clientSecret));
        }

        var httpClient = httpClientFactory.CreateClient();
        using var httpRequest = new HttpRequestMessage(HttpMethod.Post, GoogleTokenEndpoint)
        {
            Content = new FormUrlEncodedContent(formValues),
        };

        httpRequest.Headers.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

        using var tokenResponse = await httpClient.SendAsync(httpRequest, HttpCompletionOption.ResponseHeadersRead, cancellationToken);
        await using var responseStream = await tokenResponse.Content.ReadAsStreamAsync(cancellationToken);
        using var document = await JsonDocument.ParseAsync(responseStream, cancellationToken: cancellationToken);

        if (!tokenResponse.IsSuccessStatusCode)
        {
            if (document.RootElement.TryGetProperty("error", out var errorElement))
            {
                var description = document.RootElement.TryGetProperty("error_description", out var descriptionElement)
                    ? descriptionElement.GetString()
                    : null;
                var error = errorElement.GetString();
                return TypedResults.BadRequest(string.IsNullOrWhiteSpace(description) ? error ?? "Google token exchange failed." : $"{error}: {description}");
            }

            return TypedResults.BadRequest("Google token exchange failed.");
        }

        var accessToken = document.RootElement.TryGetProperty("access_token", out var accessTokenElement)
            ? accessTokenElement.GetString()
            : null;

        if (string.IsNullOrWhiteSpace(accessToken))
        {
            return TypedResults.BadRequest("Google token exchange returned no access_token.");
        }

        var googleUser = await GetGoogleUserAsync(httpClientFactory, accessToken, cancellationToken);
        if (googleUser is null)
        {
            return TypedResults.BadRequest("Google userinfo request failed.");
        }

        var localUser = await GetOrCreateLocalUserAsync(userManager, googleUser);
        if (localUser is null)
        {
            return TypedResults.BadRequest("Unable to create local user.");
        }

        await signInManager.SignInAsync(localUser, isPersistent: false);

        return TypedResults.NoContent();
    }

    [EndpointSummary("Log out")]
    [EndpointDescription("Logs out the current user by clearing the authentication cookie.")]
    public static async Task<Ok> Logout(SignInManager<ApplicationUser> signInManager)
    {
        await signInManager.SignOutAsync();
        return TypedResults.Ok();
    }

    public sealed record GoogleCodeExchangeRequest(string Code, string CodeVerifier, string RedirectUri);

    private static async Task<GoogleUserInfo?> GetGoogleUserAsync(IHttpClientFactory httpClientFactory, string accessToken, CancellationToken cancellationToken)
    {
        var httpClient = httpClientFactory.CreateClient();
        using var request = new HttpRequestMessage(HttpMethod.Get, GoogleUserInfoEndpoint);
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);
        request.Headers.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

        using var response = await httpClient.SendAsync(request, HttpCompletionOption.ResponseHeadersRead, cancellationToken);
        if (!response.IsSuccessStatusCode)
        {
            return null;
        }

        await using var stream = await response.Content.ReadAsStreamAsync(cancellationToken);
        using var document = await JsonDocument.ParseAsync(stream, cancellationToken: cancellationToken);
        var root = document.RootElement;

        return new GoogleUserInfo(
            root.TryGetProperty("email", out var emailValue) ? emailValue.GetString() : null,
            root.TryGetProperty("email_verified", out var emailVerifiedValue) && emailVerifiedValue.GetBoolean()
        );
    }

    private static async Task<ApplicationUser?> GetOrCreateLocalUserAsync(UserManager<ApplicationUser> userManager, GoogleUserInfo googleUser)
    {
        if (string.IsNullOrWhiteSpace(googleUser.Email) || !googleUser.EmailVerified)
        {
            return null;
        }

        var existingUser = await userManager.FindByEmailAsync(googleUser.Email);
        if (existingUser is not null)
        {
            return existingUser;
        }

        var localUser = new ApplicationUser
        {
            UserName = googleUser.Email,
            Email = googleUser.Email,
            EmailConfirmed = googleUser.EmailVerified,
        };

        try
        {
            var createResult = await userManager.CreateAsync(localUser);
            if (createResult.Succeeded)
            {
                return localUser;
            }
        }
        catch (DbUpdateException)
        {
            // Concurrent sign-ins can race user creation; reload by email.
        }

        return await userManager.FindByEmailAsync(googleUser.Email);
    }

    private sealed record GoogleUserInfo(string? Email, bool EmailVerified);
}
