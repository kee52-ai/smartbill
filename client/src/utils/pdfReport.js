// utils/pdfReport.js
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { categoryById } from './categories';

export function exportReceiptsPdf(receipts, { from, to } = {}) {
  const doc = new jsPDF();
  const total = receipts.reduce((sum, r) => sum + Number(r.amount), 0);

  doc.setFontSize(18);
  doc.text('SmartBill — Expense Report', 14, 18);
  doc.setFontSize(10);
  doc.setTextColor(110);
  const range = from || to ? `${from || 'earliest'} to ${to || 'latest'}` : 'All time';
  doc.text(`Period: ${range}`, 14, 25);
  doc.text(`Generated: ${new Date().toLocaleDateString('en-IN')}`, 14, 30);

  autoTable(doc, {
    startY: 36,
    head: [['Date', 'Merchant', 'Category', 'Amount (₹)']],
    body: receipts.map((r) => [
      r.purchased_at,
      r.merchant,
      categoryById(r.category).label,
      Number(r.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 }),
    ]),
    styles: { fontSize: 9 },
    headStyles: { fillColor: [34, 104, 90] },
  });

  const finalY = doc.lastAutoTable.finalY || 40;
  doc.setFontSize(12);
  doc.setTextColor(20);
  doc.text(`Total: ₹${total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, 14, finalY + 10);

  doc.save('smartbill-report.pdf');
}
