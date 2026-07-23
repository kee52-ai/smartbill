// pages/ReceiptsList.jsx
import { useState, useMemo } from 'react';
import { Search, Download, FileText, Receipt as ReceiptIcon } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CATEGORIES } from '../utils/categories';
import { api } from '../utils/api';
import { exportReceiptsPdf } from '../utils/pdfReport';
import ReceiptCard from '../components/ReceiptCard';
import EmptyState from '../components/EmptyState';
import { ReceiptCardSkeleton } from '../components/SkeletonLoader';

export default function ReceiptsList({ onUpload }) {
  const { receipts, loading, refreshAll } = useApp();
  const [q, setQ] = useState('');
  const [category, setCategory] = useState('all');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const filtered = useMemo(() => {
    return receipts.filter((r) => {
      if (category !== 'all' && r.category !== category) return false;
      if (q && !r.merchant.toLowerCase().includes(q.toLowerCase())) return false;
      if (from && r.purchased_at < from) return false;
      if (to && r.purchased_at > to) return false;
      return true;
    });
  }, [receipts, q, category, from, to]);

  const applyServerFilter = () => refreshAll({ category, from, to, q });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="font-display font-bold text-2xl text-ink-900 dark:text-white">Receipts</h1>
        <div className="flex gap-2">
          <a
            href={api.exportCsvUrl({ category, from, to })}
            className="flex items-center gap-2 text-sm font-medium border border-ink-300 dark:border-ink-700 px-3.5 py-2 rounded-lg hover:bg-ink-100 dark:hover:bg-ink-800 transition-colors"
          >
            <Download size={15} /> CSV
          </a>
          <button
            onClick={() => exportReceiptsPdf(filtered, { from, to })}
            className="flex items-center gap-2 text-sm font-medium border border-ink-300 dark:border-ink-700 px-3.5 py-2 rounded-lg hover:bg-ink-100 dark:hover:bg-ink-800 transition-colors"
          >
            <FileText size={15} /> PDF report
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-ink-900 border border-ink-200 dark:border-ink-800 rounded-2xl p-4 flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-[180px]">
          <label className="block text-xs font-medium text-ink-500 mb-1">Search merchant</label>
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
            <input value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && applyServerFilter()} placeholder="e.g. Swiggy" className="input pl-9" />
          </div>
        </div>
        <div className="w-44">
          <label className="block text-xs font-medium text-ink-500 mb-1">Category</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="input">
            <option value="all">All categories</option>
            {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
          </select>
        </div>
        <div className="w-36">
          <label className="block text-xs font-medium text-ink-500 mb-1">From</label>
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="input" />
        </div>
        <div className="w-36">
          <label className="block text-xs font-medium text-ink-500 mb-1">To</label>
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="input" />
        </div>
        <button onClick={applyServerFilter} className="bg-teal-700 hover:bg-teal-800 text-white font-medium px-4 py-2 rounded-lg text-sm">Apply</button>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 gap-3">{Array.from({ length: 6 }).map((_, i) => <ReceiptCardSkeleton key={i} />)}</div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No receipts match"
          subtitle="Try adjusting your filters, or upload a new receipt."
          action={<button onClick={onUpload} className="bg-coral-500 hover:bg-coral-600 text-white font-semibold px-5 py-2.5 rounded-lg flex items-center gap-2"><ReceiptIcon size={16} /> Upload receipt</button>}
        />
      ) : (
        <div className="grid sm:grid-cols-2 gap-3">
          {filtered.map((r, i) => <ReceiptCard key={r.id} receipt={r} index={i} />)}
        </div>
      )}
    </div>
  );
}
