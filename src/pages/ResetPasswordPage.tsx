import { useState, useEffect } from 'react';
import AlertBanner from '../components/AlertBanner';
import { authService } from '../services/authService';

interface ResetPasswordPageProps {
  navigateTo: (path: string) => void;
}

export default function ResetPasswordPage({ navigateTo }: ResetPasswordPageProps) {
  const [token, setToken] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tokenParam = urlParams.get('token');
    if (!tokenParam) {
      setErrorMsg('Invalid URL: Reset token is missing.');
    } else {
      setToken(tokenParam);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setErrorMsg('Cannot reset password: reset token is missing.');
      return;
    }

    if (!password || !confirmPassword) {
      setErrorMsg('Please fill in all fields.');
      return;
    }

    if (password.length < 8) {
      setErrorMsg('Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await authService.resetPassword(token, password);
      setSuccessMsg(res.message || 'Your password has been successfully reset.');
      setPassword('');
      setConfirmPassword('');
      // Clean up token query param from URL to prevent accidental reuse
      window.history.replaceState({}, '', window.location.pathname);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to reset password. Please request a new link.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="glass-panel login-card">
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>
            Choose New Password
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Choose a strong, secure password for your account.
          </p>
        </div>

        {errorMsg && <AlertBanner type="error" message={errorMsg} />}
        {successMsg && <AlertBanner type="success" message={successMsg} />}

        {!successMsg && token && (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="new-password">New Password</label>
              <input
                id="new-password"
                type="password"
                className="form-input"
                placeholder="Minimum 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="form-group" style={{ marginBottom: '2rem' }}>
              <label htmlFor="confirm-password">Confirm Password</label>
              <input
                id="confirm-password"
                type="password"
                className="form-input"
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.8rem' }}
              disabled={isLoading}
            >
              {isLoading ? 'Resetting Password...' : 'Reset Password'}
            </button>
          </form>
        )}

        <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              navigateTo('/');
            }}
            style={{ color: 'var(--color-primary)', fontSize: '0.85rem', textDecoration: 'none' }}
          >
            Go to Sign In
          </a>
        </div>
      </div>
    </div>
  );
}
