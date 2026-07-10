import { useState } from 'react';
import { setApiPassword } from '../lib/auth.js';

export default function LoginGate({ onSuccess }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    const trimmed = password.trim();
    if (!trimmed) {
      setError('Enter the password.');
      return;
    }
    setApiPassword(trimmed);
    setError('');
    onSuccess();
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
          />
        </div>
        {error && <p className="pricing-error">{error}</p>}
        <button type="submit" className="btn btn-primary login-submit">
          Continue
        </button>
      </form>
    </div>
  );
}
