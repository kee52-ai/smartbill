// context/AppContext.jsx
import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { api } from '../utils/api';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [receipts, setReceipts] = useState([]);
  const [summary, setSummary] = useState(null);
  const [budgets, setBudgets] = useState({});
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState([]);
  const [dark, setDark] = useState(() => localStorage.getItem('sb-theme') === 'dark');

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('sb-theme', dark ? 'dark' : 'light');
  }, [dark]);

  const pushToast = useCallback((message, type = 'success') => {
    const id = crypto.randomUUID();
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200);
  }, []);

  const refreshAll = useCallback(async (filters = {}) => {
    setLoading(true);
    try {
      const [r, s, b] = await Promise.all([
        api.getReceipts(filters),
        api.getSummary(),
        api.getBudgets(),
      ]);
      setReceipts(r);
      setSummary(s);
      setBudgets(b);
    } catch (e) {
      pushToast(e.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [pushToast]);

  useEffect(() => { refreshAll(); }, [refreshAll]);

  const value = {
    receipts, summary, budgets, loading, dark,
    setDark, refreshAll, pushToast, toasts,
    setToasts,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
