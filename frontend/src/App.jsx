import { Routes, Route, Navigate } from 'react-router-dom';
import PricingCalculator from './pages/PricingCalculator.jsx';
import Prospectus from './pages/Prospectus.jsx';
import { QuoteProvider } from './context/QuoteContext.jsx';
import './styles/global.css';

export default function App() {
  return (
    <QuoteProvider>
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
