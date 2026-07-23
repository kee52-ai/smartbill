// components/EmptyState.jsx
import { motion } from 'framer-motion';
import { Receipt } from 'lucide-react';

export default function EmptyState({ title, subtitle, action }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center text-center py-16 px-6"
    >
      <div className="relative w-20 h-24 mb-5">
        <div className="absolute inset-0 rounded-lg bg-white dark:bg-ink-800 border-2 border-dashed border-ink-300 dark:border-ink-600 grid place-items-center">
          <Receipt size={30} className="text-ink-300 dark:text-ink-600" />
        </div>
      </div>
      <h3 className="font-display font-semibold text-lg text-ink-800 dark:text-ink-100">{title}</h3>
      <p className="text-ink-500 dark:text-ink-400 text-sm mt-1.5 max-w-xs">{subtitle}</p>
      {action && <div className="mt-5">{action}</div>}
    </motion.div>
  );
}
