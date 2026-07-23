// utils/categories.js
// Single source of truth for categories: id, label, color (used in charts +
// badges), lucide icon name, and the merchant-name keywords used to
// auto-suggest a category right after OCR.

export const CATEGORIES = [
  { id: 'food', label: 'Food', color: '#e8562a', icon: 'UtensilsCrossed', keywords: ['swiggy', 'zomato', 'restaurant', 'cafe', 'dine', 'pizza', 'kitchen', 'eatery', 'foods', 'bakery'] },
  { id: 'groceries', label: 'Groceries', color: '#2f8170', icon: 'ShoppingBasket', keywords: ['bigbasket', 'grofers', 'blinkit', 'zepto', 'dmart', 'supermarket', 'grocery', 'mart', 'reliance fresh'] },
  { id: 'travel', label: 'Travel', color: '#3b6ea5', icon: 'Car', keywords: ['uber', 'ola', 'rapido', 'indigo', 'irctc', 'railway', 'airlines', 'metro', 'fuel', 'petrol', 'diesel', 'cab'] },
  { id: 'shopping', label: 'Shopping', color: '#8a5cc9', icon: 'ShoppingBag', keywords: ['amazon', 'flipkart', 'myntra', 'ajio', 'mall', 'store', 'boutique', 'apparel', 'fashion'] },
  { id: 'bills', label: 'Bills & Utilities', color: '#c9a227', icon: 'Receipt', keywords: ['electricity', 'water board', 'broadband', 'airtel', 'jio', 'vodafone', 'gas agency', 'utility', 'wifi', 'recharge'] },
  { id: 'health', label: 'Health', color: '#3aa38a', icon: 'HeartPulse', keywords: ['pharmacy', 'medical', 'hospital', 'clinic', 'apollo', 'diagnostics', 'chemist', 'medplus'] },
  { id: 'entertainment', label: 'Entertainment', color: '#c9578a', icon: 'Clapperboard', keywords: ['netflix', 'prime video', 'hotstar', 'spotify', 'cinema', 'pvr', 'inox', 'movies', 'bookmyshow'] },
  { id: 'other', label: 'Other', color: '#748584', icon: 'Tag', keywords: [] },
];

export const categoryById = (id) => CATEGORIES.find((c) => c.id === id) || CATEGORIES[CATEGORIES.length - 1];

export function suggestCategory(merchantName = '') {
  const name = merchantName.toLowerCase();
  for (const cat of CATEGORIES) {
    if (cat.keywords.some((kw) => name.includes(kw))) return cat.id;
  }
  return 'other';
}
