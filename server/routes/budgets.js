// routes/budgets.js
const express = require('express');
const db = require('../db/init');

const router = express.Router();

// GET /api/budgets — { overall: 0, food: 0, ... }
router.get('/', (_req, res) => {
  const rows = db.prepare('SELECT category, monthly_limit FROM budgets').all();
  const out = {};
  rows.forEach((r) => { out[r.category] = r.monthly_limit; });
  res.json(out);
});

// PUT /api/budgets  { category: 'overall' | categoryId, limit: number }
router.put('/', (req, res) => {
  const { category, limit } = req.body;
  if (!category || limit === undefined) {
    return res.status(400).json({ error: 'category and limit are required' });
  }
  db.prepare(`
    INSERT INTO budgets (category, monthly_limit, updated_at)
    VALUES (?, ?, datetime('now'))
    ON CONFLICT(category) DO UPDATE SET monthly_limit = excluded.monthly_limit, updated_at = datetime('now')
  `).run(category, parseFloat(limit) || 0);

  res.json({ category, limit: parseFloat(limit) || 0 });
});

module.exports = router;
