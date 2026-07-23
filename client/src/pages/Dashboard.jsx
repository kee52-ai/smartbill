// pages/Dashboard.jsx
import { useEffect, useState } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { TrendingUp, Receipt as ReceiptIcon } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { categoryById } from '../utils/categories';
import ReceiptCard from '../components/ReceiptCard';
import EmptyState from '../components/EmptyState';
import { StatCardSkeleton, ChartSkeleton, ReceiptCardSkeleton } from '../components/SkeletonLoader';
import { useNavigate } from 'react-router-dom';

function AnimatedNumber({ value }) {
  const mv = useMotionValue(0);
  const rounded = useTransform(mv, (v) => `₹${v.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`);
  const [display, setDisplay] = useState('₹0');

  useEffect(() => {
    const controls = animate(mv, value, { duration: 1.1, ease: 'easeOut' });
    const unsub = rounded.on('change', setDisplay);
    return () => { controls.stop(); unsub(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return <span>{display}</span>;
}

export default function Dashboard({ onUpload }) {
  const { summary, receipts, budgets, loading } = useApp();
  const navigate = useNavigate();

  const overallLimit = budgets.overall || 0;
  const monthTotal = summary?.monthTotal || 0;

  const pieData = (summary?.byCategory || []).map((c) => ({
    name: categoryById(c.category).label,
    value: c.total,
    color: categoryById(c.category).color,
  }));

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="font-display font-bold text-2xl text-ink-900 dark:text-white">Dashboard</h1>
      </div>

      {/* Stat cards */}
      <div className="grid sm:grid-cols-3 gap-4">
        {loading ? <StatCardSkeleton /> : (
          <div className="rounded-2xl border border-ink-200 dark:border-ink-800 bg-white dark:bg-ink-900 p-5">
            <p className="text-xs font-medium text-ink-500 dark:text-ink-400 mb-1">Spent this month</p>
            <p className="font-display font-bold text-3xl text-teal-700 dark:text-teal-300">
              <AnimatedNumber value={monthTotal} />
            </p>
          </div>
        )}
        {loading ? <StatCardSkeleton /> : (
          <div className="rounded-2xl border border-ink-200 dark:border-ink-800 bg-white dark:bg-ink-900 p-5">
            <p className="text-xs font-medium text-ink-500 dark:text-ink-400 mb-1">Monthly budget</p>
            <p className="font-display font-bold text-3xl text-ink-800 dark:text-ink-100">
              {overallLimit > 0 ? `₹${overallLimit.toLocaleString('en-IN')}` : '—'}
            </p>
            {overallLimit > 0 && (
              <p className="text-xs text-ink-500 mt-1">{Math.round((monthTotal / overallLimit) * 100)}% used</p>
            )}
          </div>
        )}
        {loading ? <StatCardSkeleton /> : (
          <div className="rounded-2xl border border-ink-200 dark:border-ink-800 bg-white dark:bg-ink-900 p-5">
            <p className="text-xs font-medium text-ink-500 dark:text-ink-400 mb-1">Total receipts</p>
            <p className="font-display font-bold text-3xl text-ink-800 dark:text-ink-100">{summary?.totalReceipts ?? 0}</p>
          </div>
        )}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-ink-200 dark:border-ink-800 bg-white dark:bg-ink-900 p-5">
          <h3 className="font-display font-semibold mb-3 text-ink-800 dark:text-ink-100">Spending by category</h3>
          {loading ? <ChartSkeleton /> : pieData.length === 0 ? (
            <EmptyState title="No spending yet" subtitle="Upload a receipt to see your breakdown here." />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={62} outerRadius={95} paddingAngle={3} animationDuration={700}>
                  {pieData.map((entry, i) => <Cell key={i} fill={entry.color} stroke="none" />)}
                </Pie>
                <Tooltip formatter={(v) => `₹${Number(v).toLocaleString('en-IN')}`} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="rounded-2xl border border-ink-200 dark:border-ink-800 bg-white dark:bg-ink-900 p-5">
          <h3 className="font-display font-semibold mb-3 text-ink-800 dark:text-ink-100 flex items-center gap-2">
            <TrendingUp size={16} className="text-teal-600" /> Last 6 months
          </h3>
          {loading ? <ChartSkeleton /> : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={summary?.trend || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--tw-color-ink-100, #e8ecec)" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} width={40} />
                <Tooltip formatter={(v) => `₹${Number(v).toLocaleString('en-IN')}`} />
                <Bar dataKey="total" fill="#2f8170" radius={[6, 6, 0, 0]} animationDuration={700} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Recent receipts */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display font-semibold text-ink-800 dark:text-ink-100">Recent receipts</h3>
          <button onClick={() => navigate('/receipts')} className="text-sm font-medium text-teal-700 dark:text-teal-300 hover:underline">View all</button>
        </div>
        {loading ? (
          <div className="grid sm:grid-cols-2 gap-3">{Array.from({ length: 4 }).map((_, i) => <ReceiptCardSkeleton key={i} />)}</div>
        ) : receipts.length === 0 ? (
          <EmptyState
            title="No receipts yet"
            subtitle="Upload your first one to get started — it takes about ten seconds."
            action={<button onClick={onUpload} className="bg-coral-500 hover:bg-coral-600 text-white font-semibold px-5 py-2.5 rounded-lg flex items-center gap-2"><ReceiptIcon size={16} /> Upload receipt</button>}
          />
        ) : (
          <div className="grid sm:grid-cols-2 gap-3">
            {receipts.slice(0, 6).map((r, i) => <ReceiptCard key={r.id} receipt={r} index={i} />)}
          </div>
        )}
      </div>
    </div>
  );
}
