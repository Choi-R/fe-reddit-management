import { useState } from 'react';
import AlertBanner from '../components/AlertBanner';
import { authService } from '../services/authService';

interface ForgotPasswordPageProps {
  navigateTo: (path: string) => void;
}

export default function ForgotPasswordPage({ navigateTo }: ForgotPasswordPageProps) {
  const [emailInput, setEmailInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput) {
      setErrorMsg('Please enter your email address.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await authService.forgotPassword(emailInput);
      const baseMsg = res.message || 'If the email is registered, a password reset link has been sent.';
      setSuccessMsg(`${baseMsg} (Note: The email might be in your spam folder.)`);
      setEmailInput('');
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Network error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="glass-panel login-card">
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>
            Reset Password
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.4' }}>
            Enter your registered email address and we'll send you instructions to reset your password.
          </p>
        </div>

        {errorMsg && <AlertBanner type="error" message={errorMsg} />}
        {successMsg && <AlertBanner type="success" message={successMsg} />}

        {!successMsg && (
          <form onSubmit={handleSubmit}>
            <div className="form-group" style={{ marginBottom: '2rem' }}>
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                className="form-input"
                placeholder="you@example.com"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.8rem', marginBottom: '1rem' }}
              disabled={isLoading}
            >
              {isLoading ? 'Sending Link...' : 'Send Reset Link'}
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
            ← Back to Login
          </a>
        </div>
      </div>
    </div>
  );
}
