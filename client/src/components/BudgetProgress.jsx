// components/BudgetProgress.jsx
import { motion } from 'framer-motion';
import CategoryBadge from './CategoryBadge';

function barColor(pct) {
  if (pct >= 100) return 'bg-red-500';
  if (pct >= 75) return 'bg-amber-400';
  return 'bg-teal-600';
}

export default function BudgetProgress({ categoryId, label, spent, limit }) {
  const pct = limit > 0 ? Math.min((spent / limit) * 100, 100) : 0;
  const over = limit > 0 && spent > limit;

  return (
    <div className="py-3">
      <div className="flex items-center justify-between mb-1.5">
        {categoryId ? <CategoryBadge id={categoryId} /> : <span className="font-display font-semibold text-sm text-ink-800 dark:text-ink-100">{label}</span>}
        <span className="text-xs font-mono text-ink-500 dark:text-ink-400">
          ₹{spent.toLocaleString('en-IN')} {limit > 0 && `/ ₹${limit.toLocaleString('en-IN')}`}
        </span>
      </div>
      <div className="h-2.5 rounded-full bg-ink-100 dark:bg-ink-800 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className={`h-full rounded-full ${barColor(pct)}`}
        />
      </div>
      {over && <p className="text-xs text-red-500 mt-1 font-medium">Over budget by ₹{(spent - limit).toLocaleString('en-IN')}</p>}
    </div>
  );
}
