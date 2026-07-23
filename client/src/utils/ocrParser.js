// utils/ocrParser.js
//
// Turns raw, noisy OCR text into a best-guess structured receipt. Nothing
// here is claimed to be 100% accurate — that's exactly why the UI always
// shows these results in an editable form rather than saving them directly.
// Each heuristic below is intentionally simple and commented, since receipt
// layouts vary wildly across printers, fonts, and countries.

const TOTAL_KEYWORDS = [
  'grand total', 'total due', 'amount due', 'balance due', 'net total',
  'net payable', 'total amount', 'total:', 'total ', 'amount payable',
];

// Matches "123", "1,234.50", "₹123.00", "$12.99", "Rs. 450" etc.
const MONEY_REGEX = /(?:₹|rs\.?|inr|\$|usd)?\s?([0-9]{1,3}(?:[,.\s][0-9]{2,3})*(?:\.[0-9]{2})?)/i;

// Common date formats: 12/07/2026, 12-07-26, 2026-07-12, 12 Jul 2026, Jul 12 2026
const DATE_PATTERNS = [
  /\b(\d{4})-(\d{1,2})-(\d{1,2})\b/, // yyyy-mm-dd
  /\b(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2,4})\b/, // dd/mm/yyyy or mm/dd/yyyy
  /\b(\d{1,2})\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+(\d{2,4})\b/i,
  /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+(\d{1,2}),?\s+(\d{2,4})\b/i,
];

const MONTHS = { jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5, jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11 };

function toIsoDate(match, patternIndex) {
  try {
    let y, m, d;
    if (patternIndex === 0) {
      [, y, m, d] = match;
    } else if (patternIndex === 1) {
      let [, a, b, c] = match;
      y = c.length === 2 ? `20${c}` : c;
      // Ambiguous dd/mm vs mm/dd — assume dd/mm (common outside the US),
      // but fall back to swapping if the "day" is > 12 (impossible as a month).
      m = Number(a) > 12 ? a : b;
      d = Number(a) > 12 ? b : a;
    } else if (patternIndex === 2) {
      let [, dd, mon, yy] = match;
      d = dd; m = MONTHS[mon.slice(0, 3).toLowerCase()] + 1; y = yy.length === 2 ? `20${yy}` : yy;
    } else {
      let [, mon, dd, yy] = match;
      d = dd; m = MONTHS[mon.slice(0, 3).toLowerCase()] + 1; y = yy.length === 2 ? `20${yy}` : yy;
    }
    const iso = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    // Sanity check: reject obviously invalid dates rather than silently saving garbage.
    const dt = new Date(iso);
    if (Number.isNaN(dt.getTime())) return null;
    return iso;
  } catch {
    return null;
  }
}

function parseMoney(str) {
  const match = str.match(MONEY_REGEX);
  if (!match) return null;
  const cleaned = match[1].replace(/,/g, '').replace(/\s/g, '');
  const value = parseFloat(cleaned);
  return Number.isFinite(value) ? value : null;
}

function extractDate(lines) {
  for (const line of lines) {
    for (let i = 0; i < DATE_PATTERNS.length; i++) {
      const match = line.match(DATE_PATTERNS[i]);
      if (match) {
        const iso = toIsoDate(match, i);
        if (iso) return iso;
      }
    }
  }
  return null;
}

function extractTotal(lines) {
  // Pass 1: look for an explicit "total"-style keyword on the line — this is
  // far more reliable than just grabbing the largest number on the receipt.
  for (const line of lines) {
    const lower = line.toLowerCase();
    if (TOTAL_KEYWORDS.some((kw) => lower.includes(kw))) {
      const value = parseMoney(line);
      if (value !== null) return value;
    }
  }
  // Pass 2 (fallback): grab every money-looking number and assume the total
  // is the largest one (subtotal/tax lines are usually smaller).
  const amounts = [];
  for (const line of lines) {
    const match = line.match(MONEY_REGEX);
    if (match) {
      const value = parseMoney(line);
      if (value !== null && value > 0) amounts.push(value);
    }
  }
  return amounts.length ? Math.max(...amounts) : null;
}

function extractMerchant(lines) {
  // Merchant name is almost always one of the first few non-empty lines,
  // and it's rarely a line that's mostly digits (address/phone numbers).
  const candidates = lines.slice(0, 6).filter((l) => {
    const letters = (l.match(/[a-zA-Z]/g) || []).length;
    return l.trim().length > 2 && letters >= l.trim().length * 0.4;
  });
  return candidates[0] ? candidates[0].trim().replace(/\s{2,}/g, ' ') : 'Unknown merchant';
}

function extractLineItems(lines) {
  // A "line item" looks like: <description> ... <price> — description text
  // followed by a trailing money value, and NOT a total/subtotal/tax line.
  const skipWords = ['total', 'subtotal', 'tax', 'cash', 'change', 'balance', 'gst', 'cgst', 'sgst', 'discount', 'card', 'thank'];
  const items = [];
  for (const line of lines) {
    const lower = line.toLowerCase();
    if (skipWords.some((w) => lower.includes(w))) continue;
    const match = line.match(/^(.{2,40}?)\s+(?:x\d+\s+)?(?:₹|rs\.?|inr|\$)?\s?([0-9]+(?:[.,][0-9]{2})?)\s*$/i);
    if (match) {
      const name = match[1].trim();
      const price = parseFloat(match[2].replace(',', ''));
      if (name && Number.isFinite(price) && price > 0 && price < 100000) {
        items.push({ name, price });
      }
    }
  }
  return items.slice(0, 25); // sane cap in case OCR noise creates false positives
}

export function parseReceiptText(rawText) {
  const lines = rawText
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

  return {
    merchant: extractMerchant(lines),
    purchasedAt: extractDate(lines) || new Date().toISOString().slice(0, 10),
    amount: extractTotal(lines) ?? 0,
    items: extractLineItems(lines),
    rawText,
  };
}
