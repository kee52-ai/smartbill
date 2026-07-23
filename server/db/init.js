// db/init.js
// Owns the SQLite connection and schema. better-sqlite3 is synchronous,
// which keeps route handlers simple (no await needed for queries) and is
// plenty fast for a single-writer receipt-scanning app.

const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const DATA_DIR = path.join(__dirname, '..', 'data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const db = new Database(path.join(DATA_DIR, 'smartbill.db'));
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS receipts (
    id TEXT PRIMARY KEY,
    merchant TEXT NOT NULL DEFAULT 'Unknown merchant',
    category TEXT NOT NULL DEFAULT 'other',
    amount REAL NOT NULL DEFAULT 0,
    purchased_at TEXT NOT NULL,          -- ISO date (yyyy-mm-dd) of the purchase
    raw_text TEXT,                        -- full OCR output, kept for re-parsing/debugging
    items_json TEXT,                      -- JSON array of {name, price} line items
    image_path TEXT,                      -- relative path under /uploads
    notes TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE INDEX IF NOT EXISTS idx_receipts_category ON receipts(category);
  CREATE INDEX IF NOT EXISTS idx_receipts_purchased_at ON receipts(purchased_at);

  CREATE TABLE IF NOT EXISTS budgets (
    category TEXT PRIMARY KEY,            -- 'overall' or a category id
    monthly_limit REAL NOT NULL DEFAULT 0,
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

module.exports = db;
