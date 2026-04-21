using EFPractice.Infrastructure.Identity;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using System.Net.Http.Headers;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;
using System.Text;

namespace EFPractice.Web.Endpoints;

public class Users : IEndpointGroup
{
    private const string GoogleAuthorizationEndpoint = "https://accounts.google.com/o/oauth2/v2/auth";
    private const string GoogleTokenEndpoint = "https://oauth2.googleapis.com/token";
    private const string GoogleUserInfoEndpoint = "https://openidconnect.googleapis.com/v1/userinfo";
    private const string GoogleScope = "openid email profile";
    private const string OAuthStateCookieName = "google_oauth_state";
    private const string OAuthCodeVerifierCookieName = "google_oauth_code_verifier";

    public static void Map(RouteGroupBuilder groupBuilder)
    {
        groupBuilder.MapIdentityApi<ApplicationUser>();

        groupBuilder.MapGet(StartGoogleSignIn, "google/start");
        groupBuilder.MapGet(HandleGoogleCallback, "google/callback");
        groupBuilder.MapPost(Logout, "logout").RequireAuthorization();
    }

    [EndpointSummary("Start Google OAuth sign-in")]
    [EndpointDescription("Starts the Google OAuth flow from the backend and redirects to Google.")]
    public static RedirectHttpResult StartGoogleSignIn(
        HttpContext httpContext,
        IConfiguration configuration)
    {
        var clientId = configuration["GoogleOAuth:ClientId"];
        if (string.IsNullOrWhiteSpace(clientId))
        {
            return TypedResults.Redirect(BuildFailureRedirectUri(configuration, "oauth_not_configured"));
        }

        var callbackUri = GetBackendCallbackUri(httpContext, configuration);
        var state = GenerateRandomToken(48);
        var codeVerifier = GenerateRandomToken(64);
        var codeChallenge = ComputeCodeChallenge(codeVerifier);

        var cookieOptions = BuildOAuthCookieOptions(httpContext);
        httpContext.Response.Cookies.Append(OAuthStateCookieName, state, cookieOptions);
        httpContext.Response.Cookies.Append(OAuthCodeVerifierCookieName, codeVerifier, cookieOptions);

        var parameters = new Dictionary<string, string>
        {
            ["client_id"] = clientId,
            ["redirect_uri"] = callbackUri,
            ["response_type"] = "code",
            ["scope"] = GoogleScope,
            ["include_granted_scopes"] = "true",
            ["code_challenge"] = codeChallenge,
            ["code_challenge_method"] = "S256",
            ["state"] = state,
        };

        var authorizationUri = BuildUriWithQuery(GoogleAuthorizationEndpoint, parameters);
        return TypedResults.Redirect(authorizationUri);
    }

    [EndpointSummary("Handle Google OAuth callback")]
    [EndpointDescription("Completes Google OAuth callback, creates local user session, and redirects to frontend.")]
    public static async Task<RedirectHttpResult> HandleGoogleCallback(
        [FromQuery] string? code,
        [FromQuery] string? state,
        [FromQuery] string? error,
        HttpContext httpContext,
        IConfiguration configuration,
        IHttpClientFactory httpClientFactory,
        UserManager<ApplicationUser> userManager,
        SignInManager<ApplicationUser> signInManager,
        CancellationToken cancellationToken)
    {
        if (!string.IsNullOrWhiteSpace(error))
        {
            ClearOAuthCookies(httpContext);
            return TypedResults.Redirect(BuildFailureRedirectUri(configuration, "google_denied"));
        }

        var expectedState = httpContext.Request.Cookies[OAuthStateCookieName];
        var codeVerifier = httpContext.Request.Cookies[OAuthCodeVerifierCookieName];
        ClearOAuthCookies(httpContext);

        if (string.IsNullOrWhiteSpace(code)
            || string.IsNullOrWhiteSpace(state)
            || string.IsNullOrWhiteSpace(expectedState)
            || string.IsNullOrWhiteSpace(codeVerifier)
            || !SecureEquals(state, expectedState))
        {
            return TypedResults.Redirect(BuildFailureRedirectUri(configuration, "invalid_oauth_state"));
        }

        var clientId = configuration["GoogleOAuth:ClientId"];

        if (string.IsNullOrWhiteSpace(clientId))
        {
            return TypedResults.Redirect(BuildFailureRedirectUri(configuration, "oauth_not_configured"));
        }

        var callbackUri = GetBackendCallbackUri(httpContext, configuration);

        var formValues = new List<KeyValuePair<string, string>>
        {
            new("grant_type", "authorization_code"),
            new("code", code),
            new("code_verifier", codeVerifier),
            new("client_id", clientId),
            new("redirect_uri", callbackUri),
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
            return TypedResults.Redirect(BuildFailureRedirectUri(configuration, "token_exchange_failed"));
        }

        var accessToken = document.RootElement.TryGetProperty("access_token", out var accessTokenElement)
            ? accessTokenElement.GetString()
            : null;

        if (string.IsNullOrWhiteSpace(accessToken))
        {
            return TypedResults.Redirect(BuildFailureRedirectUri(configuration, "missing_access_token"));
        }

        var googleUser = await GetGoogleUserAsync(httpClientFactory, accessToken, cancellationToken);
        if (googleUser is null)
        {
            return TypedResults.Redirect(BuildFailureRedirectUri(configuration, "google_userinfo_failed"));
        }

        var localUser = await GetOrCreateLocalUserAsync(userManager, googleUser);
        if (localUser is null)
        {
            return TypedResults.Redirect(BuildFailureRedirectUri(configuration, "local_user_failed"));
        }

        await signInManager.SignInAsync(localUser, isPersistent: false);

        return TypedResults.Redirect(GetFrontendSuccessRedirectUri(configuration));
    }

    [EndpointSummary("Log out")]
    [EndpointDescription("Logs out the current user by clearing the authentication cookie.")]
    public static async Task<Ok> Logout(SignInManager<ApplicationUser> signInManager)
    {
        await signInManager.SignOutAsync();
        return TypedResults.Ok();
    }

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

    private static CookieOptions BuildOAuthCookieOptions(HttpContext httpContext) => new()
    {
        HttpOnly = true,
        IsEssential = true,
        SameSite = SameSiteMode.Lax,
        Secure = httpContext.Request.IsHttps,
        Expires = DateTimeOffset.UtcNow.AddMinutes(10),
        Path = "/",
    };

    private static void ClearOAuthCookies(HttpContext httpContext)
    {
        var options = new CookieOptions
        {
            HttpOnly = true,
            IsEssential = true,
            SameSite = SameSiteMode.Lax,
            Secure = httpContext.Request.IsHttps,
            Path = "/",
        };

        httpContext.Response.Cookies.Delete(OAuthStateCookieName, options);
        httpContext.Response.Cookies.Delete(OAuthCodeVerifierCookieName, options);
    }

    private static string GenerateRandomToken(int byteLength)
    {
        var bytes = RandomNumberGenerator.GetBytes(byteLength);
        return Convert.ToBase64String(bytes)
            .Replace('+', '-')
            .Replace('/', '_')
            .TrimEnd('=');
    }

    private static string ComputeCodeChallenge(string codeVerifier)
    {
        var bytes = Encoding.UTF8.GetBytes(codeVerifier);
        var hash = SHA256.HashData(bytes);
        return Convert.ToBase64String(hash)
            .Replace('+', '-')
            .Replace('/', '_')
            .TrimEnd('=');
    }

    private static bool SecureEquals(string left, string right)
    {
        var leftBytes = Encoding.UTF8.GetBytes(left);
        var rightBytes = Encoding.UTF8.GetBytes(right);

        return leftBytes.Length == rightBytes.Length
               && CryptographicOperations.FixedTimeEquals(leftBytes, rightBytes);
    }

    private static string BuildUriWithQuery(string baseUri, IReadOnlyDictionary<string, string> parameters)
    {
        var query = string.Join("&", parameters.Select(pair =>
            $"{Uri.EscapeDataString(pair.Key)}={Uri.EscapeDataString(pair.Value)}"));
        return $"{baseUri}?{query}";
    }

    private static string GetBackendCallbackUri(HttpContext httpContext, IConfiguration configuration)
    {
        var configured = configuration["GoogleOAuth:BackendCallbackUri"];
        if (!string.IsNullOrWhiteSpace(configured))
        {
            return configured;
        }

        return $"{httpContext.Request.Scheme}://{httpContext.Request.Host}/api/Users/google/callback";
    }

    private static string GetFrontendSuccessRedirectUri(IConfiguration configuration)
    {
        var configured = configuration["GoogleOAuth:FrontendSuccessRedirectUri"];
        if (!string.IsNullOrWhiteSpace(configured))
        {
            return configured;
        }

        return "http://localhost:5173/home";
    }

    private static string BuildFailureRedirectUri(IConfiguration configuration, string errorCode)
    {
        var configured = configuration["GoogleOAuth:FrontendFailureRedirectUri"];
        var baseUri = string.IsNullOrWhiteSpace(configured)
            ? "http://localhost:5173/"
            : configured;

        var separator = baseUri.Contains('?', StringComparison.Ordinal) ? "&" : "?";
        return $"{baseUri}{separator}authError={Uri.EscapeDataString(errorCode)}";
    }

    private sealed record GoogleUserInfo(string? Email, bool EmailVerified);
}
