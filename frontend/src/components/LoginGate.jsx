import { useState } from 'react';
import { setApiPassword, setIsAdmin, clearApiPassword } from '../lib/auth.js';
import { isApiConfigured, verifySession } from '../lib/api.js';

export default function LoginGate({ onSuccess }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    const trimmed = password.trim();
    if (!trimmed) {
      setError('Enter the password.');
      return;
    }
    setBusy(true);
    setError('');
    setApiPassword(trimmed);
    try {
      if (isApiConfigured()) {
        await verifySession();
      } else {
        // Local-only: treat known admin default as admin when API is not wired.
        setIsAdmin(trimmed === 'delphiniumadmin');
      }
      onSuccess();
    } catch (err) {
      clearApiPassword();
      setIsAdmin(false);
      setError(err.message === 'unauthorized' ? 'Incorrect password.' : (err.message || 'Login failed'));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="login-gate">
      <form className="login-card card" onSubmit={handleSubmit}>
        <h1 className="login-title">Pricing calculator</h1>
        <p className="pricing-muted login-lead">
          Enter the shared access password to build and save quotes.
        </p>
        <div className="form-group">
          <label htmlFor="login-password">Password</label>
          <input
            id="login-password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={e => {
              setPassword(e.target.value);
              if (error) setError('');
            }}
            autoFocus
            disabled={busy}
          />
        </div>
        {error && <p className="pricing-error">{error}</p>}
        <button type="submit" className="btn btn-primary login-submit" disabled={busy}>
          {busy ? 'Checking…' : 'Continue'}
        </button>
      </form>
    </div>
  );
}
