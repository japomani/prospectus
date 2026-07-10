import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginGate from './components/LoginGate.jsx';
import PricingCalculator from './pages/PricingCalculator.jsx';
import Prospectus from './pages/Prospectus.jsx';
import { QuoteProvider } from './context/QuoteContext.jsx';
import { clearApiPassword, isLoggedIn } from './lib/auth.js';
import './styles/global.css';

export default function App() {
  const [authed, setAuthed] = useState(() => isLoggedIn());

  function handleLogout() {
    clearApiPassword();
    setAuthed(false);
  }

  if (!authed) {
    return <LoginGate onSuccess={() => setAuthed(true)} />;
  }

  return (
    <QuoteProvider>
      <div className="app-logout-bar no-print">
        <button type="button" className="btn btn-secondary btn-sm" onClick={handleLogout}>
          Log out
        </button>
      </div>
      <Routes>
        <Route path="/pricing" element={<PricingCalculator />} />
        <Route path="/prospectus" element={<Prospectus />} />
        <Route path="/quotes/new" element={<Prospectus />} />
        <Route path="/quotes/:id" element={<Prospectus />} />
        <Route path="/" element={<Navigate to="/pricing" replace />} />
      </Routes>
    </QuoteProvider>
  );
}
