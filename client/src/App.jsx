// App.jsx
import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar';
import Toaster from './components/Toaster';
import UploadModal from './components/UploadModal';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import ReceiptsList from './pages/ReceiptsList';
import ReceiptDetail from './pages/ReceiptDetail';
import Budgets from './pages/Budgets';

export default function App() {
  const [uploadOpen, setUploadOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      <Routes>
        <Route path="/" element={<Landing onGetStarted={() => setUploadOpen(true)} />} />
        <Route
          path="/*"
          element={
            <>
              <Navbar onUpload={() => setUploadOpen(true)} />
              <main className="flex-1 max-w-6xl w-full mx-auto px-5 py-8 pb-24 sm:pb-8">
                <Routes>
                  <Route path="dashboard" element={<Dashboard onUpload={() => setUploadOpen(true)} />} />
                  <Route path="receipts" element={<ReceiptsList onUpload={() => setUploadOpen(true)} />} />
                  <Route path="receipts/:id" element={<ReceiptDetail />} />
                  <Route path="budgets" element={<Budgets />} />
                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
              </main>
            </>
          }
        />
      </Routes>

      <AnimatePresence>
        {uploadOpen && <UploadModal open={uploadOpen} onClose={() => setUploadOpen(false)} />}
      </AnimatePresence>
      <Toaster />
    </div>
  );
}
