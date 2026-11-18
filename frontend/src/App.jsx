import { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import LoginGate from './components/LoginGate.jsx';
import PricingCalculator from './pages/PricingCalculator.jsx';
import Prospectus from './pages/Prospectus.jsx';
import { QuoteProvider } from './context/QuoteContext.jsx';
import { clearApiPassword, isLoggedIn, setIsAdmin } from './lib/auth.js';
import { isApiConfigured, verifySession } from './lib/api.js';
import { safeReturnPath } from './lib/returnPath.js';
import './styles/global.css';

function PricingRoute({ authed, onAuthed }) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const next = safeReturnPath(searchParams.get('next'));

  if (authed) {
    if (next) {
      return <Navigate to={next} replace />;
    }
    return <PricingCalculator />;
  }

  return (
    <LoginGate
      onSuccess={() => {
        onAuthed();
        if (next) {
          navigate(next, { replace: true });
        }
      }}
    />
  );
}

export default function App() {
  const [authed, setAuthed] = useState(() => isLoggedIn());

  useEffect(() => {
    if (!authed || !isApiConfigured()) return;
    verifySession().catch(() => {
      setIsAdmin(false);
    });
  }, [authed]);

  function handleLogout() {
    clearApiPassword();
    setAuthed(false);
  }

  return (
    <QuoteProvider>
      {authed && (
        <div className="app-logout-bar no-print">
          <button type="button" className="btn btn-secondary btn-sm" onClick={handleLogout}>
            Log out
          </button>
        </div>
      )}
      <Routes>
        <Route
          path="/pricing"
          element={<PricingRoute authed={authed} onAuthed={() => setAuthed(true)} />}
        />
        {/* Prospectus view routes are public so Copy Link / View Prospectus URLs work when shared */}
        <Route path="/prospectus" element={<Prospectus />} />
        <Route path="/quotes/new" element={<Prospectus />} />
        <Route path="/quotes/:id" element={<Prospectus />} />
        <Route path="/" element={<Navigate to="/pricing" replace />} />
      </Routes>
    </QuoteProvider>
  );
}
