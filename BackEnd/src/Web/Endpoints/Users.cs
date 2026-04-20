using EFPractice.Infrastructure.Identity;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using System.Net.Http.Headers;
using System.Text.Json;

namespace EFPractice.Web.Endpoints;

public class Users : IEndpointGroup
{
    private const string GoogleTokenEndpoint = "https://oauth2.googleapis.com/token";

    public static void Map(RouteGroupBuilder groupBuilder)
    {
        groupBuilder.MapIdentityApi<ApplicationUser>();

        groupBuilder.MapPost(ExchangeGoogleCode, "google/exchange");
        groupBuilder.MapPost(Logout, "logout").RequireAuthorization();
    }

    [EndpointSummary("Exchange Google authorization code")]
    [EndpointDescription("Exchanges a Google OAuth authorization code for an access token using PKCE.")]
    public static async Task<Results<Ok<GoogleCodeExchangeResponse>, BadRequest<string>>> ExchangeGoogleCode(
        [FromBody] GoogleCodeExchangeRequest request,
        IConfiguration configuration,
        IHttpClientFactory httpClientFactory,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Code)
            || string.IsNullOrWhiteSpace(request.CodeVerifier)
            || string.IsNullOrWhiteSpace(request.RedirectUri)
            || string.IsNullOrWhiteSpace(request.ClientId))
        {
            return TypedResults.BadRequest("Code, codeVerifier, redirectUri, and clientId are required.");
        }

        if (!Uri.TryCreate(request.RedirectUri, UriKind.Absolute, out _))
        {
            return TypedResults.BadRequest("redirectUri must be an absolute URI.");
        }

        var configuredClientId = configuration["GoogleOAuth:ClientId"];
        var clientId = string.IsNullOrWhiteSpace(configuredClientId) ? request.ClientId : configuredClientId;

        if (!string.IsNullOrWhiteSpace(configuredClientId)
            && !string.Equals(configuredClientId, request.ClientId, StringComparison.Ordinal))
        {
            return TypedResults.BadRequest("Client ID does not match server configuration.");
        }

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

        var expiresIn = document.RootElement.TryGetProperty("expires_in", out var expiresInElement)
            && expiresInElement.TryGetInt32(out var parsedExpiresIn)
                ? parsedExpiresIn
                : 3600;

        return TypedResults.Ok(new GoogleCodeExchangeResponse(accessToken, expiresIn));
    }

    [EndpointSummary("Log out")]
    [EndpointDescription("Logs out the current user by clearing the authentication cookie.")]
    public static async Task<Results<Ok, UnauthorizedHttpResult>> Logout(SignInManager<ApplicationUser> signInManager, [FromBody] object empty)
    {
        if (empty != null)
        {
            await signInManager.SignOutAsync();
            return TypedResults.Ok();
        }

        return TypedResults.Unauthorized();
    }

    public sealed record GoogleCodeExchangeRequest(string Code, string CodeVerifier, string RedirectUri, string ClientId);

    public sealed record GoogleCodeExchangeResponse(string AccessToken, int ExpiresIn);
}
