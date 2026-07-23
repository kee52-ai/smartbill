// pages/ReceiptDetail.jsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Trash2, Save, Receipt as ReceiptIcon, AlertTriangle } from 'lucide-react';
import { api } from '../utils/api';
import { CATEGORIES } from '../utils/categories';
import { useApp } from '../context/AppContext';

export default function ReceiptDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { refreshAll, pushToast } = useApp();
  const [receipt, setReceipt] = useState(null);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    api.getReceipt(id)
      .then((r) => { setReceipt(r); setForm({ merchant: r.merchant, category: r.category, amount: r.amount, purchasedAt: r.purchased_at, notes: r.notes || '' }); })
      .catch((e) => pushToast(e.message, 'error'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (!receipt || !form) return <div className="max-w-3xl mx-auto py-16 text-center text-ink-400">Loading receipt…</div>;

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const save = async () => {
    setSaving(true);
    try {
      const updated = await api.updateReceipt(id, form);
      setReceipt(updated);
      pushToast('Changes saved');
      refreshAll();
    } catch (e) {
      pushToast(e.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const del = async () => {
    try {
      await api.deleteReceipt(id);
      pushToast('Receipt deleted');
      refreshAll();
      navigate('/receipts');
    } catch (e) {
      pushToast(e.message, 'error');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm font-medium text-ink-500 hover:text-ink-800 dark:hover:text-ink-200">
        <ArrowLeft size={16} /> Back
      </button>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="rounded-2xl overflow-hidden border border-ink-200 dark:border-ink-800 bg-white dark:bg-ink-900 aspect-[3/4] grid place-items-center">
          {receipt.imageUrl ? (
            <img src={receipt.imageUrl} alt={receipt.merchant} className="w-full h-full object-cover" />
          ) : (
            <ReceiptIcon size={48} className="text-ink-300" />
          )}
        </div>

        <div className="bg-white dark:bg-ink-900 rounded-2xl border border-ink-200 dark:border-ink-800 p-5 space-y-4">
          <label className="block">
            <span className="block text-xs font-medium text-ink-500 mb-1">Merchant</span>
            <input value={form.merchant} onChange={set('merchant')} className="input" />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="block text-xs font-medium text-ink-500 mb-1">Amount (₹)</span>
              <input type="number" step="0.01" value={form.amount} onChange={set('amount')} className="input font-mono" />
            </label>
            <label className="block">
              <span className="block text-xs font-medium text-ink-500 mb-1">Date</span>
              <input type="date" value={form.purchasedAt} onChange={set('purchasedAt')} className="input" />
            </label>
          </div>

          <label className="block">
            <span className="block text-xs font-medium text-ink-500 mb-1">Category</span>
            <select value={form.category} onChange={set('category')} className="input">
              {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
          </label>

          <label className="block">
            <span className="block text-xs font-medium text-ink-500 mb-1">Notes</span>
            <textarea value={form.notes} onChange={set('notes')} rows={3} className="input resize-none" />
          </label>

          {receipt.items?.length > 0 && (
            <div>
              <span className="block text-xs font-medium text-ink-500 mb-1">Line items</span>
              <div className="rounded-lg border border-ink-200 dark:border-ink-800 divide-y divide-ink-100 dark:divide-ink-800 max-h-36 overflow-y-auto">
                {receipt.items.map((it, i) => (
                  <div key={i} className="flex justify-between px-3 py-1.5 text-sm">
                    <span className="text-ink-600 dark:text-ink-300">{it.name}</span>
                    <span className="font-mono text-ink-800 dark:text-ink-100">₹{it.price}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button onClick={save} disabled={saving} className="flex-1 flex items-center justify-center gap-2 bg-teal-700 hover:bg-teal-800 disabled:opacity-60 text-white font-semibold py-2.5 rounded-lg">
              <Save size={16} /> {saving ? 'Saving…' : 'Save changes'}
            </button>
            <button onClick={() => setConfirmDelete(true)} className="flex items-center justify-center gap-2 border border-red-300 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 font-semibold px-4 py-2.5 rounded-lg">
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {confirmDelete && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-ink-950/50 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white dark:bg-ink-900 rounded-2xl p-6 max-w-sm w-full shadow-lift">
              <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/40 text-red-600 grid place-items-center mb-3">
                <AlertTriangle size={20} />
              </div>
              <h3 className="font-display font-semibold text-lg mb-1">Delete this receipt?</h3>
              <p className="text-sm text-ink-500 dark:text-ink-400 mb-5">This can't be undone — the receipt and its image will be permanently removed.</p>
              <div className="flex gap-3">
                <button onClick={() => setConfirmDelete(false)} className="flex-1 py-2.5 rounded-lg border border-ink-300 dark:border-ink-700 font-medium">Cancel</button>
                <button onClick={del} className="flex-1 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold">Delete</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
