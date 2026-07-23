// pages/Budgets.jsx
import { useState, useMemo } from 'react';
import { AlertTriangle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CATEGORIES } from '../utils/categories';
import { api } from '../utils/api';
import BudgetProgress from '../components/BudgetProgress';

export default function Budgets() {
  const { summary, budgets, refreshAll, pushToast } = useApp();
  const [drafts, setDrafts] = useState({});

  const spentByCategory = useMemo(() => {
    const map = {};
    (summary?.byCategory || []).forEach((c) => { map[c.category] = c.total; });
    return map;
  }, [summary]);

  const overBudgetCategories = CATEGORIES.filter(
    (c) => budgets[c.id] > 0 && (spentByCategory[c.id] || 0) > budgets[c.id]
  );

  const draftValue = (key) => drafts[key] ?? budgets[key] ?? '';

  const saveBudget = async (key) => {
    const value = drafts[key];
    if (value === undefined) return;
    try {
      await api.setBudget(key, value);
      pushToast('Budget updated');
      refreshAll();
    } catch (e) {
      pushToast(e.message, 'error');
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="font-display font-bold text-2xl text-ink-900 dark:text-white">Budgets</h1>

      {overBudgetCategories.length > 0 && (
        <div className="rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 flex items-start gap-3">
          <AlertTriangle size={18} className="text-red-600 mt-0.5 shrink-0" />
          <p className="text-sm text-red-700 dark:text-red-300">
            You're over budget in {overBudgetCategories.map((c) => c.label).join(', ')} this month.
          </p>
        </div>
      )}

      <div className="bg-white dark:bg-ink-900 rounded-2xl border border-ink-200 dark:border-ink-800 p-5">
        <h3 className="font-display font-semibold mb-1 text-ink-800 dark:text-ink-100">Overall monthly budget</h3>
        <p className="text-xs text-ink-500 mb-3">Total spend limit across every category.</p>
        <div className="flex gap-2 mb-4">
          <input
            type="number"
            className="input"
            placeholder="e.g. 30000"
            value={draftValue('overall')}
            onChange={(e) => setDrafts((d) => ({ ...d, overall: e.target.value }))}
          />
          <button onClick={() => saveBudget('overall')} className="bg-teal-700 hover:bg-teal-800 text-white font-medium px-4 rounded-lg text-sm shrink-0">Save</button>
        </div>
        <BudgetProgress label="Overall" spent={summary?.monthTotal || 0} limit={budgets.overall || 0} />
      </div>

      <div className="bg-white dark:bg-ink-900 rounded-2xl border border-ink-200 dark:border-ink-800 p-5">
        <h3 className="font-display font-semibold mb-1 text-ink-800 dark:text-ink-100">Per-category budgets</h3>
        <p className="text-xs text-ink-500 mb-4">Set a limit for any category you want to keep an eye on.</p>

        <div className="divide-y divide-ink-100 dark:divide-ink-800">
          {CATEGORIES.map((c) => (
            <div key={c.id} className="py-4 first:pt-0">
              <div className="flex gap-2 mb-2">
                <input
                  type="number"
                  className="input"
                  placeholder={`Limit for ${c.label}`}
                  value={draftValue(c.id)}
                  onChange={(e) => setDrafts((d) => ({ ...d, [c.id]: e.target.value }))}
                />
                <button onClick={() => saveBudget(c.id)} className="bg-ink-800 dark:bg-ink-700 hover:bg-ink-900 text-white font-medium px-4 rounded-lg text-sm shrink-0">Save</button>
              </div>
              <BudgetProgress categoryId={c.id} spent={spentByCategory[c.id] || 0} limit={budgets[c.id] || 0} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
