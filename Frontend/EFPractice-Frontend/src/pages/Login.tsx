import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const GOOGLE_AUTH_ENDPOINT = 'https://accounts.google.com/o/oauth2/v2/auth';
const CLIENT_ID = '1010846955790-cf7tg92ekd63susu7m5ief9pkn8g555a.apps.googleusercontent.com';
const REDIRECT_URI = `${window.location.origin}/`;
const SCOPES = ['openid', 'email', 'profile'].join(' ');

const OAUTH_STORAGE_KEYS = {
  state: 'google_oauth_state',
  accessToken: 'google_access_token',
  tokenExpiry: 'google_access_token_expiry',
} as const;

const createRandomString = (length: number): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
  const random = new Uint8Array(length);
  crypto.getRandomValues(random);
  return Array.from(random, (byte) => chars[byte % chars.length]).join('');
};

const oauthSignIn = (): void => {
  const state = createRandomString(64);

  sessionStorage.setItem(OAUTH_STORAGE_KEYS.state, state);

  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: 'token',
    scope: SCOPES,
    include_granted_scopes: 'true',
    state,
  });

  window.location.assign(`${GOOGLE_AUTH_ENDPOINT}?${params.toString()}`);
};

function Login() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<string>('Sign in to continue.');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const handleOAuthCallback = () => {
      const query = new URLSearchParams(window.location.search);
      const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''));

      const error = query.get('error') ?? hash.get('error');
      const accessToken = hash.get('access_token');
      const expiresIn = Number(hash.get('expires_in') ?? 3600);
      const state = hash.get('state') ?? query.get('state');

      if (error) {
        setStatus(`Google sign-in failed: ${error}`);
        return;
      }

      if (!accessToken) {
        return;
      }

      const expectedState = sessionStorage.getItem(OAUTH_STORAGE_KEYS.state);

      if (!expectedState || state !== expectedState) {
        setStatus('Invalid sign-in state. Please try again.');
        return;
      }

      setIsLoading(true);
      setStatus('Completing Google sign-in...');

      try {
        const expiresInMs = (Number.isFinite(expiresIn) ? expiresIn : 3600) * 1000;
        const expiryTs = String(Date.now() + expiresInMs);

        sessionStorage.setItem(OAUTH_STORAGE_KEYS.accessToken, accessToken);
        sessionStorage.setItem(OAUTH_STORAGE_KEYS.tokenExpiry, expiryTs);

        sessionStorage.removeItem(OAUTH_STORAGE_KEYS.state);

        window.history.replaceState({}, document.title, window.location.pathname);
        navigate('/home', { replace: true });
      } catch (exchangeError) {
        const message = exchangeError instanceof Error ? exchangeError.message : 'Unknown sign-in error';
        setStatus(`Could not complete sign-in: ${message}`);
      } finally {
        setIsLoading(false);
      }
    };

    void handleOAuthCallback();
  }, [navigate]);

  return (
    <div className="login-page">
      <h1>Welcome to TaskMaster</h1>
      <button className="login-button" onClick={oauthSignIn} disabled={isLoading}>
        {isLoading ? 'Signing in...' : 'Sign in with Google'}
      </button>
      <p>{status}</p>
    </div>
  );
}

export default Login;