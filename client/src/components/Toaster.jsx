// components/Toaster.jsx
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Toaster() {
  const { toasts } = useApp();
  return (
    <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2 w-[calc(100%-2.5rem)] max-w-sm">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 40 }}
            transition={{ duration: 0.25 }}
            className={`flex items-center gap-2 rounded-xl px-4 py-3 shadow-lift text-sm font-medium
              ${t.type === 'error' ? 'bg-coral-600 text-white' : 'bg-teal-700 text-white'}`}
          >
            {t.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
            {t.message}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
