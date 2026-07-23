// pages/Landing.jsx
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Wallet, Camera, ScanText, FolderInput, PieChart, ArrowRight } from 'lucide-react';

const STEPS = [
  { icon: Camera, title: 'Snap or upload', copy: 'Photograph a receipt or drag in a file — JPG, PNG, or PDF, straight from your phone or desktop.' },
  { icon: ScanText, title: 'We read it', copy: 'The text is pulled straight off the paper: merchant, date, total, and line items, right in your browser.' },
  { icon: FolderInput, title: 'Auto-categorized', copy: 'Each receipt is filed under Food, Travel, Bills, and more, based on the merchant name.' },
  { icon: PieChart, title: 'See your spending', copy: 'Watch it land in your monthly breakdown, budgets, and trends — no spreadsheet required.' },
];

export default function Landing({ onGetStarted }) {
  const navigate = useNavigate();

  return (
    <div className="bg-ink-50 dark:bg-ink-950">
      {/* Hero */}
      <header className="max-w-6xl mx-auto px-5 pt-8 flex items-center justify-between">
        <div className="flex items-center gap-2 font-display font-bold text-lg text-teal-800 dark:text-teal-200">
          <span className="grid place-items-center w-8 h-8 rounded-lg bg-teal-700 text-white"><Wallet size={17} /></span>
          SmartBill
        </div>
        <button onClick={() => navigate('/dashboard')} className="text-sm font-medium text-ink-600 dark:text-ink-300 hover:text-teal-700 dark:hover:text-teal-300">
          Go to dashboard
        </button>
      </header>

      <section className="max-w-6xl mx-auto px-5 pt-16 pb-24 grid md:grid-cols-2 gap-12 items-center">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <p className="uppercase tracking-widest text-xs font-semibold text-coral-500 mb-4">Every receipt, filed by itself</p>
          <h1 className="font-display font-extrabold text-4xl sm:text-5xl leading-[1.08] text-ink-900 dark:text-white">
            Photograph the bill.<br />Skip the spreadsheet.
          </h1>
          <p className="mt-5 text-ink-600 dark:text-ink-300 text-lg max-w-md">
            SmartBill reads your receipts, sorts every rupee into a category, and shows you exactly
            where your money went this month — no manual entry.
          </p>
          <div className="mt-8 flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={onGetStarted}
              className="flex items-center gap-2 bg-coral-500 hover:bg-coral-600 text-white font-semibold px-6 py-3.5 rounded-xl shadow-soft"
            >
              Scan your first receipt <ArrowRight size={18} />
            </motion.button>
            <button onClick={() => navigate('/dashboard')} className="text-ink-600 dark:text-ink-300 font-medium hover:text-teal-700 dark:hover:text-teal-300">
              View demo dashboard
            </button>
          </div>
        </motion.div>

        {/* Signature visual: a stack of "ticket stub" receipt cards, tilted */}
        <motion.div initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.15 }} className="relative h-80 hidden md:block">
          {[{ rot: -6, top: 40, bg: 'bg-white dark:bg-ink-800' }, { rot: 4, top: 10, bg: 'bg-white dark:bg-ink-900' }].map((s, i) => (
            <div key={i} className={`absolute left-1/2 w-64 ${s.bg} rounded-2xl shadow-lift border border-ink-200 dark:border-ink-700 p-5`}
              style={{ transform: `translateX(-50%) rotate(${s.rot}deg)`, top: s.top }}>
              <div className="h-2 w-20 rounded bg-ink-200 dark:bg-ink-600 mb-3" />
              <div className="h-2 w-32 rounded bg-ink-100 dark:bg-ink-700 mb-1.5" />
              <div className="h-2 w-28 rounded bg-ink-100 dark:bg-ink-700 mb-4" />
              <div className="perforation mb-3" />
              <div className="flex justify-between items-center">
                <div className="h-5 w-16 rounded-full bg-teal-100 dark:bg-teal-900" />
                <div className="h-4 w-14 rounded bg-coral-200 dark:bg-coral-900" />
              </div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* How it works */}
      <section className="max-w-5xl mx-auto px-5 py-20">
        <h2 className="font-display font-bold text-2xl sm:text-3xl text-center text-ink-900 dark:text-white mb-2">How it works</h2>
        <p className="text-center text-ink-500 dark:text-ink-400 mb-14">Four steps, no typing required.</p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {STEPS.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.45, delay: i * 0.08 }}
              className="bg-white dark:bg-ink-900 rounded-2xl border border-ink-200 dark:border-ink-800 p-6 shadow-soft"
            >
              <div className="w-11 h-11 rounded-xl bg-teal-50 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 grid place-items-center mb-4">
                <s.icon size={20} />
              </div>
              <p className="text-xs font-mono text-coral-500 mb-1">Step {i + 1}</p>
              <h3 className="font-display font-semibold text-ink-800 dark:text-ink-100 mb-1.5">{s.title}</h3>
              <p className="text-sm text-ink-500 dark:text-ink-400 leading-relaxed">{s.copy}</p>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-14">
          <motion.button
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={onGetStarted}
            className="bg-teal-700 hover:bg-teal-800 text-white font-semibold px-7 py-3.5 rounded-xl shadow-soft"
          >
            Get started — it's free
          </motion.button>
        </div>
      </section>

      <footer className="text-center text-xs text-ink-400 pb-10">
        SmartBill · your receipts stay on your own server
      </footer>
    </div>
  );
}
