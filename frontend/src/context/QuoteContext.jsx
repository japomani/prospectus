import { createContext, useContext, useState } from 'react';
import { getDefaultQuote } from '../lib/fields.js';

const QuoteContext = createContext(null);

export function QuoteProvider({ children, initialQuote }) {
  const [quote, setQuote] = useState(initialQuote ?? getDefaultQuote());

  function updateQuote(updates) {
    setQuote(prev => ({ ...prev, ...updates }));
  }

  return (
    <QuoteContext.Provider value={{ quote, setQuote, updateQuote }}>
      {children}
    </QuoteContext.Provider>
  );
}

export function useQuote() {
  const ctx = useContext(QuoteContext);
  if (!ctx) throw new Error('useQuote must be used within QuoteProvider');
  return ctx;
}
