import { useState } from 'react';
import AlertBanner from '../components/AlertBanner';

interface LoginPageProps {
  isAdminRoute: boolean;
  onLogin: (email: string, password: string) => Promise<void>;
  onSwitchRoute: () => void;
}

export default function LoginPage({ isAdminRoute, onLogin, onSwitchRoute }: LoginPageProps) {
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput || !passwordInput) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      await onLogin(emailInput, passwordInput);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Network error.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="glass-panel login-card">
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>
            {isAdminRoute ? 'Admin Portal' : 'Reddit Tasks CRM'}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            {isAdminRoute ? 'Admin & Choi Login' : 'Login to view available tasks'}
          </p>
        </div>

        {errorMsg && <AlertBanner type="error" message={errorMsg} />}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              className="form-input"
              placeholder="you@example.com"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              required
            />
          </div>
          <div className="form-group" style={{ marginBottom: '2rem' }}>
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.8rem' }}
            disabled={isLoading}
          >
            {isLoading ? 'Verifying...' : 'Sign In'}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              onSwitchRoute();
            }}
            style={{ color: 'var(--color-primary)', fontSize: '0.85rem', textDecoration: 'none' }}
          >
            {isAdminRoute ? '← Switch to User Login' : 'Admin Portal →'}
          </a>
        </div>
      </div>
    </div>
  );
}
