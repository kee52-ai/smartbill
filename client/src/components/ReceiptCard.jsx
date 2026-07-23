// components/ReceiptCard.jsx
import { motion } from 'framer-motion';
import { Receipt as ReceiptIcon, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CategoryBadge from './CategoryBadge';

export default function ReceiptCard({ receipt, index = 0 }) {
  const navigate = useNavigate();
  const date = new Date(receipt.purchased_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <motion.button
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.04, 0.3), duration: 0.3 }}
      whileHover={{ y: -3 }}
      onClick={() => navigate(`/receipts/${receipt.id}`)}
      className="group w-full text-left bg-white dark:bg-ink-900 rounded-2xl border border-ink-200 dark:border-ink-800 shadow-soft hover:shadow-lift transition-shadow overflow-hidden"
    >
      <div className="flex gap-4 p-4">
        <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-ink-100 dark:bg-ink-800 grid place-items-center">
          {receipt.imageUrl ? (
            <img src={receipt.imageUrl} alt={receipt.merchant} className="w-full h-full object-cover" />
          ) : (
            <ReceiptIcon size={22} className="text-ink-400" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className="font-display font-semibold text-ink-800 dark:text-ink-100 truncate">{receipt.merchant}</p>
            <p className="font-mono font-semibold text-ink-900 dark:text-white shrink-0">₹{Number(receipt.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
          </div>
          <p className="text-xs text-ink-500 dark:text-ink-400 flex items-center gap-1 mt-1">
            <Calendar size={12} /> {date}
          </p>
          <div className="mt-2"><CategoryBadge id={receipt.category} /></div>
        </div>
      </div>
      <div className="perforation mx-4" />
    </motion.button>
  );
}
