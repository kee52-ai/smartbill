// utils/api.js
// Small fetch wrapper — no axios needed for this surface area. Every
// function throws a plain Error with a useful message so callers can just
// try/catch and show it in a toast.

async function handle(res) {
  if (res.status === 204) return null;
  const isJson = res.headers.get('content-type')?.includes('application/json');
  const data = isJson ? await res.json() : await res.text();
  if (!res.ok) throw new Error((data && data.error) || 'Something went wrong');
  return data;
}

export const api = {
  getReceipts: (params = {}) => {
    const qs = new URLSearchParams(Object.entries(params).filter(([, v]) => v));
    return fetch(`/api/receipts?${qs}`).then(handle);
  },
  getReceipt: (id) => fetch(`/api/receipts/${id}`).then(handle),
  getSummary: () => fetch('/api/receipts/summary').then(handle),
  createReceipt: (formData) =>
    fetch('/api/receipts', { method: 'POST', body: formData }).then(handle),
  updateReceipt: (id, payload) =>
    fetch(`/api/receipts/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).then(handle),
  deleteReceipt: (id) => fetch(`/api/receipts/${id}`, { method: 'DELETE' }).then(handle),
  exportCsvUrl: (params = {}) => {
    const qs = new URLSearchParams(Object.entries(params).filter(([, v]) => v));
    return `/api/receipts/export/csv?${qs}`;
  },
  getBudgets: () => fetch('/api/budgets').then(handle),
  setBudget: (category, limit) =>
    fetch('/api/budgets', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category, limit }),
    }).then(handle),
};
