// components/Navbar.jsx
import { NavLink, useNavigate } from 'react-router-dom';
import { Receipt, LayoutDashboard, Wallet, Sun, Moon, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';

export default function Navbar({ onUpload }) {
  const { dark, setDark } = useApp();
  const navigate = useNavigate();

  const linkClass = ({ isActive }) =>
    `flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
      isActive
        ? 'text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-900/40'
        : 'text-ink-500 hover:text-ink-800 dark:text-ink-400 dark:hover:text-ink-100'
    }`;

  return (
    <header className="sticky top-0 z-40 bg-ink-50/85 dark:bg-ink-950/85 backdrop-blur border-b border-ink-200/70 dark:border-ink-800">
      <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
        <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 font-display font-bold text-lg text-teal-800 dark:text-teal-200">
          <span className="grid place-items-center w-8 h-8 rounded-lg bg-teal-700 text-white">
            <Wallet size={17} />
          </span>
          SmartBill
        </button>

        <nav className="hidden sm:flex items-center gap-1">
          <NavLink to="/dashboard" className={linkClass}><LayoutDashboard size={16} /> Dashboard</NavLink>
          <NavLink to="/receipts" className={linkClass}><Receipt size={16} /> Receipts</NavLink>
          <NavLink to="/budgets" className={linkClass}><Wallet size={16} /> Budgets</NavLink>
        </nav>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setDark(!dark)}
            aria-label="Toggle dark mode"
            className="w-9 h-9 grid place-items-center rounded-lg text-ink-500 hover:bg-ink-100 dark:hover:bg-ink-800 dark:text-ink-300 transition-colors"
          >
            {dark ? <Sun size={17} /> : <Moon size={17} />}
          </button>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onUpload}
            className="hidden sm:flex items-center gap-1.5 bg-coral-500 hover:bg-coral-600 text-white text-sm font-semibold px-4 py-2 rounded-lg shadow-soft transition-colors"
          >
            <Plus size={16} /> Upload Receipt
          </motion.button>
        </div>
      </div>

      {/* Mobile bottom nav */}
      <nav className="sm:hidden fixed bottom-0 inset-x-0 bg-ink-50 dark:bg-ink-950 border-t border-ink-200 dark:border-ink-800 flex justify-around py-2 z-40">
        <NavLink to="/dashboard" className={linkClass}><LayoutDashboard size={18} /></NavLink>
        <NavLink to="/receipts" className={linkClass}><Receipt size={18} /></NavLink>
        <NavLink to="/budgets" className={linkClass}><Wallet size={18} /></NavLink>
      </nav>

      {/* Mobile floating action button */}
      <motion.button
        whileTap={{ scale: 0.92 }}
        onClick={onUpload}
        aria-label="Upload receipt"
        className="sm:hidden fixed bottom-20 right-5 z-40 w-14 h-14 rounded-full bg-coral-500 text-white shadow-lift grid place-items-center"
      >
        <Plus size={24} />
      </motion.button>
    </header>
  );
}
