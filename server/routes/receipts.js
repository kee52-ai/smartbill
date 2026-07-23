// routes/receipts.js
const express = require('express');
const multer = require('multer');
const { v4: uuid } = require('uuid');
const path = require('path');
const fs = require('fs');
const db = require('../db/init');

const router = express.Router();

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, path.join(__dirname, '..', 'uploads')),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, `${uuid()}${ext}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ok = /image\/(jpeg|png|webp)|application\/pdf/.test(file.mimetype);
    cb(ok ? null : new Error('Only JPG, PNG, WEBP or PDF files are allowed'), ok);
  },
});

function serialize(row) {
  return {
    ...row,
    items: row.items_json ? JSON.parse(row.items_json) : [],
    imageUrl: row.image_path ? `/uploads/${row.image_path}` : null,
  };
}

// GET /api/receipts?category=&from=&to=&q=
router.get('/', (req, res) => {
  const { category, from, to, q } = req.query;
  let sql = 'SELECT * FROM receipts WHERE 1=1';
  const params = [];

  if (category && category !== 'all') {
    sql += ' AND category = ?';
    params.push(category);
  }
  if (from) {
    sql += ' AND purchased_at >= ?';
    params.push(from);
  }
  if (to) {
    sql += ' AND purchased_at <= ?';
    params.push(to);
  }
  if (q) {
    sql += ' AND merchant LIKE ?';
    params.push(`%${q}%`);
  }
  sql += ' ORDER BY purchased_at DESC, created_at DESC';

  const rows = db.prepare(sql).all(...params);
  res.json(rows.map(serialize));
});

// GET /api/receipts/summary — dashboard aggregates
router.get('/summary', (_req, res) => {
  const now = new Date();
  const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;

  const monthTotal = db
    .prepare('SELECT COALESCE(SUM(amount),0) AS total FROM receipts WHERE purchased_at >= ?')
    .get(monthStart).total;

  const byCategory = db
    .prepare(
      `SELECT category, COALESCE(SUM(amount),0) AS total, COUNT(*) AS count
       FROM receipts WHERE purchased_at >= ? GROUP BY category ORDER BY total DESC`
    )
    .all(monthStart);

  // Last 6 months trend, oldest first.
  const trend = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const start = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
    const end = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-31`;
    const total = db
      .prepare('SELECT COALESCE(SUM(amount),0) AS total FROM receipts WHERE purchased_at BETWEEN ? AND ?')
      .get(start, end).total;
    trend.push({ month: d.toLocaleString('default', { month: 'short' }), total });
  }

  const totalReceipts = db.prepare('SELECT COUNT(*) AS c FROM receipts').get().c;

  res.json({ monthTotal, byCategory, trend, totalReceipts });
});

// GET /api/receipts/export.csv?from=&to=&category=
router.get('/export/csv', (req, res) => {
  const { category, from, to } = req.query;
  let sql = 'SELECT * FROM receipts WHERE 1=1';
  const params = [];
  if (category && category !== 'all') { sql += ' AND category = ?'; params.push(category); }
  if (from) { sql += ' AND purchased_at >= ?'; params.push(from); }
  if (to) { sql += ' AND purchased_at <= ?'; params.push(to); }
  sql += ' ORDER BY purchased_at DESC';

  const rows = db.prepare(sql).all(...params);
  const header = 'Date,Merchant,Category,Amount,Notes\n';
  const body = rows
    .map((r) => [r.purchased_at, `"${(r.merchant || '').replace(/"/g, '""')}"`, r.category, r.amount, `"${(r.notes || '').replace(/"/g, '""')}"`].join(','))
    .join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="smartbill-export.csv"');
  res.send(header + body);
});

// GET /api/receipts/:id
router.get('/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM receipts WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Receipt not found' });
  res.json(serialize(row));
});

// POST /api/receipts  (multipart: image + fields)
router.post('/', upload.single('image'), (req, res) => {
  const { merchant, category, amount, purchasedAt, rawText, items, notes } = req.body;

  if (!purchasedAt) return res.status(400).json({ error: 'purchasedAt is required' });

  const id = uuid();
  const stmt = db.prepare(`
    INSERT INTO receipts (id, merchant, category, amount, purchased_at, raw_text, items_json, image_path, notes)
    VALUES (@id, @merchant, @category, @amount, @purchasedAt, @rawText, @itemsJson, @imagePath, @notes)
  `);
  stmt.run({
    id,
    merchant: merchant || 'Unknown merchant',
    category: category || 'other',
    amount: parseFloat(amount) || 0,
    purchasedAt,
    rawText: rawText || '',
    itemsJson: items || '[]',
    imagePath: req.file ? req.file.filename : null,
    notes: notes || '',
  });

  res.status(201).json(serialize(db.prepare('SELECT * FROM receipts WHERE id = ?').get(id)));
});

// PUT /api/receipts/:id — edit fields (no new image required)
router.put('/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM receipts WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Receipt not found' });

  const { merchant, category, amount, purchasedAt, items, notes } = req.body;
  db.prepare(`
    UPDATE receipts SET
      merchant = @merchant,
      category = @category,
      amount = @amount,
      purchased_at = @purchasedAt,
      items_json = @itemsJson,
      notes = @notes,
      updated_at = datetime('now')
    WHERE id = @id
  `).run({
    id: req.params.id,
    merchant: merchant ?? existing.merchant,
    category: category ?? existing.category,
    amount: amount !== undefined ? parseFloat(amount) : existing.amount,
    purchasedAt: purchasedAt ?? existing.purchased_at,
    itemsJson: items !== undefined ? JSON.stringify(items) : existing.items_json,
    notes: notes ?? existing.notes,
  });

  res.json(serialize(db.prepare('SELECT * FROM receipts WHERE id = ?').get(req.params.id)));
});

// DELETE /api/receipts/:id
router.delete('/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM receipts WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Receipt not found' });

  if (existing.image_path) {
    const filePath = path.join(__dirname, '..', 'uploads', existing.image_path);
    fs.existsSync(filePath) && fs.unlink(filePath, () => {});
  }
  db.prepare('DELETE FROM receipts WHERE id = ?').run(req.params.id);
  res.status(204).end();
});

module.exports = router;
