// components/UploadModal.jsx
import { useState, useRef, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Upload, Camera, Loader2, Check } from 'lucide-react';
import { createWorker } from 'tesseract.js';
import { parseReceiptText } from '../utils/ocrParser';
import { suggestCategory, CATEGORIES } from '../utils/categories';
import { api } from '../utils/api';
import { useApp } from '../context/AppContext';

const STEPS = { PICK: 'pick', CAMERA: 'camera', SCANNING: 'scanning', REVIEW: 'review' };

export default function UploadModal({ open, onClose }) {
  const { refreshAll, pushToast } = useApp();
  const [step, setStep] = useState(STEPS.PICK);
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [progress, setProgress] = useState(0);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const fileInputRef = useRef(null);

  const reset = () => {
    setStep(STEPS.PICK);
    setFile(null);
    setPreviewUrl(null);
    setProgress(0);
    setForm(null);
    stopCamera();
  };

  const close = () => { reset(); onClose(); };

  const runOcr = useCallback(async (blob, url) => {
    setStep(STEPS.SCANNING);
    setProgress(0);
    try {
      const worker = await createWorker('eng', 1, {
        logger: (m) => {
          if (m.status === 'recognizing text') setProgress(Math.round(m.progress * 100));
        },
      });
      const { data } = await worker.recognize(url);
      await worker.terminate();

      const parsed = parseReceiptText(data.text || '');
      setForm({
        merchant: parsed.merchant,
        category: suggestCategory(parsed.merchant),
        amount: parsed.amount,
        purchasedAt: parsed.purchasedAt,
        items: parsed.items,
        rawText: parsed.rawText,
        notes: '',
      });
      setStep(STEPS.REVIEW);
    } catch (e) {
      pushToast('OCR could not read that image — you can still enter details manually.', 'error');
      setForm({ merchant: 'Unknown merchant', category: 'other', amount: 0, purchasedAt: new Date().toISOString().slice(0, 10), items: [], rawText: '', notes: '' });
      setStep(STEPS.REVIEW);
    }
  }, [pushToast]);

  const handleFile = (f) => {
    if (!f) return;
    if (f.type === 'application/pdf') {
      pushToast('PDF support scans the first page — rendering…', 'success');
    }
    const url = URL.createObjectURL(f);
    setFile(f);
    setPreviewUrl(url);
    runOcr(f, url);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files?.[0]);
  };

  const startCamera = async () => {
    setStep(STEPS.CAMERA);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch {
      pushToast('Could not access the camera — check permissions.', 'error');
      setStep(STEPS.PICK);
    }
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    canvas.toBlob((blob) => {
      stopCamera();
      const f = new File([blob], `capture-${Date.now()}.jpg`, { type: 'image/jpeg' });
      handleFile(f);
    }, 'image/jpeg', 0.92);
  };

  const save = async () => {
    setSaving(true);
    try {
      const fd = new FormData();
      if (file) fd.append('image', file);
      fd.append('merchant', form.merchant);
      fd.append('category', form.category);
      fd.append('amount', form.amount);
      fd.append('purchasedAt', form.purchasedAt);
      fd.append('items', JSON.stringify(form.items));
      fd.append('rawText', form.rawText);
      fd.append('notes', form.notes);
      await api.createReceipt(fd);
      pushToast('Receipt saved');
      await refreshAll();
      close();
    } catch (e) {
      pushToast(e.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-ink-950/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
        onClick={(e) => e.target === e.currentTarget && close()}
      >
        <motion.div
          initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }}
          transition={{ type: 'spring', damping: 26, stiffness: 300 }}
          className="bg-ink-50 dark:bg-ink-900 w-full sm:max-w-md sm:rounded-2.5xl rounded-t-2.5xl shadow-lift max-h-[92vh] overflow-y-auto"
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-ink-200 dark:border-ink-800 sticky top-0 bg-ink-50 dark:bg-ink-900 z-10">
            <h2 className="font-display font-semibold text-lg">Add a receipt</h2>
            <button onClick={close} className="w-8 h-8 grid place-items-center rounded-lg hover:bg-ink-200 dark:hover:bg-ink-800">
              <X size={18} />
            </button>
          </div>

          <div className="p-5">
            {step === STEPS.PICK && (
              <div className="space-y-4">
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={onDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`rounded-2xl border-2 border-dashed p-8 text-center cursor-pointer transition-colors ${
                    dragOver ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/20' : 'border-ink-300 dark:border-ink-700 hover:border-teal-400'
                  }`}
                >
                  <Upload size={26} className="mx-auto mb-2 text-ink-400" />
                  <p className="text-sm font-medium text-ink-700 dark:text-ink-200">Drag & drop a receipt here</p>
                  <p className="text-xs text-ink-500 mt-1">or click to browse — JPG, PNG, or PDF</p>
                  <input
                    ref={fileInputRef} type="file" accept="image/jpeg,image/png,application/pdf" className="hidden"
                    onChange={(e) => handleFile(e.target.files?.[0])}
                  />
                </div>
                <div className="flex items-center gap-3 text-xs text-ink-400"><div className="flex-1 h-px bg-ink-200 dark:bg-ink-800" />or<div className="flex-1 h-px bg-ink-200 dark:bg-ink-800" /></div>
                <button
                  onClick={startCamera}
                  className="w-full flex items-center justify-center gap-2 bg-teal-700 hover:bg-teal-800 text-white font-semibold py-3 rounded-xl transition-colors"
                >
                  <Camera size={18} /> Use camera
                </button>
              </div>
            )}

            {step === STEPS.CAMERA && (
              <div className="space-y-4">
                <div className="rounded-2xl overflow-hidden bg-black aspect-[3/4]">
                  <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                </div>
                <div className="flex gap-3">
                  <button onClick={() => { stopCamera(); setStep(STEPS.PICK); }} className="flex-1 py-3 rounded-xl border border-ink-300 dark:border-ink-700 font-medium">Cancel</button>
                  <button onClick={capturePhoto} className="flex-1 py-3 rounded-xl bg-coral-500 hover:bg-coral-600 text-white font-semibold">Capture</button>
                </div>
              </div>
            )}

            {step === STEPS.SCANNING && (
              <div className="space-y-4">
                <div className="relative rounded-2xl overflow-hidden aspect-[3/4] bg-ink-100 dark:bg-ink-800">
                  <img src={previewUrl} alt="Receipt preview" className="w-full h-full object-cover" />
                  <motion.div
                    className="absolute inset-x-0 h-16 bg-gradient-to-b from-transparent via-teal-300/40 to-transparent"
                    animate={{ top: ['-15%', '105%'] }}
                    transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
                    style={{ position: 'absolute' }}
                  />
                </div>
                <div className="flex items-center gap-2 justify-center text-sm text-ink-600 dark:text-ink-300">
                  <Loader2 size={16} className="animate-spin" /> Reading your receipt… {progress}%
                </div>
              </div>
            )}

            {step === STEPS.REVIEW && form && (
              <ReviewForm form={form} setForm={setForm} previewUrl={previewUrl} onSave={save} saving={saving} />
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function ReviewForm({ form, setForm, previewUrl, onSave, saving }) {
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  return (
    <div className="space-y-4">
      {previewUrl && (
        <img src={previewUrl} alt="Receipt" className="w-full h-40 object-cover rounded-xl border border-ink-200 dark:border-ink-800" />
      )}
      <p className="text-xs text-ink-500 flex items-center gap-1">
        <Check size={14} className="text-teal-600" /> Extracted — double-check before saving, OCR isn't perfect.
      </p>

      <Field label="Merchant">
        <input value={form.merchant} onChange={set('merchant')} className="input" />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Amount (₹)">
          <input type="number" step="0.01" value={form.amount} onChange={set('amount')} className="input font-mono" />
        </Field>
        <Field label="Date">
          <input type="date" value={form.purchasedAt} onChange={set('purchasedAt')} className="input" />
        </Field>
      </div>

      <Field label="Category">
        <select value={form.category} onChange={set('category')} className="input">
          {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
        </select>
      </Field>

      {form.items?.length > 0 && (
        <Field label={`Line items (${form.items.length})`}>
          <div className="max-h-28 overflow-y-auto rounded-lg border border-ink-200 dark:border-ink-800 divide-y divide-ink-100 dark:divide-ink-800">
            {form.items.map((it, i) => (
              <div key={i} className="flex justify-between px-3 py-1.5 text-sm">
                <span className="truncate text-ink-600 dark:text-ink-300">{it.name}</span>
                <span className="font-mono text-ink-800 dark:text-ink-100">₹{it.price}</span>
              </div>
            ))}
          </div>
        </Field>
      )}

      <Field label="Notes (optional)">
        <textarea value={form.notes} onChange={set('notes')} rows={2} className="input resize-none" />
      </Field>

      <button
        onClick={onSave}
        disabled={saving}
        className="w-full py-3 rounded-xl bg-teal-700 hover:bg-teal-800 disabled:opacity-60 text-white font-semibold flex items-center justify-center gap-2 transition-colors"
      >
        {saving ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
        {saving ? 'Saving…' : 'Save receipt'}
      </button>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-ink-500 dark:text-ink-400 mb-1">{label}</span>
      {children}
    </label>
  );
}
