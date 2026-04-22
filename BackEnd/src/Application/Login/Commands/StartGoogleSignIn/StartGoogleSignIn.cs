using System.Security.Cryptography;
using System.Text;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.Extensions.Configuration;

namespace EFPractice.Application.Login.Commands.StartGoogleSignIn;

public sealed record StartGoogleSignInCommand(HttpContext HttpContext, IConfiguration Configuration)
    : IRequest<RedirectHttpResult>;

public sealed class StartGoogleSignInCommandHandler : IRequestHandler<StartGoogleSignInCommand, RedirectHttpResult>
{
    private const string GoogleAuthorizationEndpoint = "https://accounts.google.com/o/oauth2/v2/auth";
    private const string GoogleScope = "openid email profile";
    private const string OAuthStateCookieName = "google_oauth_state";
    private const string OAuthCodeVerifierCookieName = "google_oauth_code_verifier";

    public Task<RedirectHttpResult> Handle(StartGoogleSignInCommand request, CancellationToken cancellationToken)
    {
        var clientId = request.Configuration["GoogleOAuth:ClientId"];
        if (string.IsNullOrWhiteSpace(clientId))
        {
            return Task.FromResult(TypedResults.Redirect(BuildFailureRedirectUri(request.Configuration, "oauth_not_configured")));
        }

        var callbackUri = GetBackendCallbackUri(request.HttpContext, request.Configuration);
        var state = GenerateRandomToken(48);
        var codeVerifier = GenerateRandomToken(64);
        var codeChallenge = ComputeCodeChallenge(codeVerifier);

        var cookieOptions = BuildOAuthCookieOptions(request.HttpContext);
        request.HttpContext.Response.Cookies.Append(OAuthStateCookieName, state, cookieOptions);
        request.HttpContext.Response.Cookies.Append(OAuthCodeVerifierCookieName, codeVerifier, cookieOptions);

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
        return Task.FromResult(TypedResults.Redirect(authorizationUri));
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

    private static string BuildFailureRedirectUri(IConfiguration configuration, string errorCode)
    {
        var configured = configuration["GoogleOAuth:FrontendFailureRedirectUri"];
        var baseUri = string.IsNullOrWhiteSpace(configured)
            ? "http://localhost:5173/"
            : configured;

        var separator = baseUri.Contains('?', StringComparison.Ordinal) ? "&" : "?";
        return $"{baseUri}{separator}authError={Uri.EscapeDataString(errorCode)}";
    }
}