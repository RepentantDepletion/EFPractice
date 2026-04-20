import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Login.css';

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
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <div className="logo-circle">
              <span className="logo-icon">✓</span>
            </div>
            <h1>TaskMaster</h1>
            <p className="subtitle">Organize your work, achieve your goals</p>
          </div>

          <div className="login-content">
            <button 
              className="google-button" 
              onClick={oauthSignIn} 
              disabled={isLoading}
              aria-label={isLoading ? 'Signing in' : 'Sign in with Google'}
            >
              <svg className="google-icon" viewBox="0 0 24 24" width="20" height="20">
                <path fill="#EA4335" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#4A90E2" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#FBBC05" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span className="button-text">
                {isLoading ? 'Signing in...' : 'Continue with Google'}
              </span>
            </button>
          </div>

          {status && (
            <div className={`status-message ${isLoading ? 'loading' : ''}`}>
              {status}
            </div>
          )}
        </div>
      </div>

      <div className="background-decoration">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
      </div>
    </div>
  );
}

export default Login;