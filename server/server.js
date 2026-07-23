// server.js
require('dotenv').config();
const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');

const UPLOADS_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use('/uploads', express.static(UPLOADS_DIR));

app.use('/api/receipts', require('./routes/receipts'));
app.use('/api/budgets', require('./routes/budgets'));

app.get('/api/health', (_req, res) => res.json({ ok: true }));

// In production, serve the built React app from the same process so the
// whole thing deploys as a single service (Render/Railway/one Vercel app
// with a rewrite, etc.) instead of needing two separate deployments.
const CLIENT_DIST = path.join(__dirname, '..', 'client', 'dist');
if (fs.existsSync(CLIENT_DIST)) {
  app.use(express.static(CLIENT_DIST));
  app.get('*', (_req, res) => res.sendFile(path.join(CLIENT_DIST, 'index.html')));
}

// Centralized error handler so route handlers can just throw/next(err).
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`SmartBill API listening on http://localhost:${PORT}`);
});
