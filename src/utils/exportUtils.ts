import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Transaction, CurrencyConfig } from '../types';
import { formatDate, formatTime } from './dateUtils';

export function exportToCSV(
  transactions: Transaction[], 
  currency: CurrencyConfig,
  filename: string = 'transactions-export.csv'
): void {
  const headers = [
    'Transaction ID',
    'Date',
    'Time',
    'Type',
    'Source',
    `Amount (${currency.code})`,
    'Category',
    'Payment Method',
    'Account / Bank',
    'Merchant / Payee',
    'Description / Note',
    'Reference ID',
    'Recurring'
  ];

  const rows = transactions.map((t) => [
    `"${t.id}"`,
    `"${formatDate(t.date)}"`,
    `"${t.time || formatTime(t.date)}"`,
    `"${t.type}"`,
    `"${t.source}"`,
    t.amount.toString(),
    `"${t.category.replace(/"/g, '""')}"`,
    `"${t.paymentMethod}"`,
    `"${(t.account || '').replace(/"/g, '""')}"`,
    `"${(t.merchant || '').replace(/"/g, '""')}"`,
    `"${(t.description || '').replace(/"/g, '""')}"`,
    `"${(t.transactionReference || '').replace(/"/g, '""')}"`,
    `"${t.isRecurring ? 'Yes' : 'No'}"`
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportToPDF(
  transactions: Transaction[],
  currency: CurrencyConfig,
  periodLabel: string = 'All Time',
  filename: string = 'financial-report.pdf'
): void {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  // Calculate totals
  const totalIncome = transactions
    .filter((t) => t.type === 'INCOME')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + t.amount, 0);

  const netBalance = totalIncome - totalExpense;

  // Header Banner
  doc.setFillColor(15, 23, 42); // Slate-900
  doc.rect(0, 0, 210, 36, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('RUPEEWISE FINANCIAL STATEMENT', 14, 16);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(203, 213, 225);
  doc.text(`Report Period: ${periodLabel}  |  Generated on: ${new Date().toLocaleString()}`, 14, 25);
  doc.text(`Total Records: ${transactions.length} Transactions  |  Auto & Manual Tracked`, 14, 30);

  // Summary Metrics Cards in PDF
  const cardY = 44;
  const cardW = 58;
  const cardH = 22;

  // Total Income Box
  doc.setFillColor(240, 253, 244);
  doc.setDrawColor(34, 197, 94);
  doc.roundedRect(14, cardY, cardW, cardH, 2, 2, 'FD');
  doc.setFontSize(8);
  doc.setTextColor(22, 101, 52);
  doc.text('TOTAL INCOME', 18, cardY + 7);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text(`+${currency.symbol}${totalIncome.toLocaleString()}`, 18, cardY + 16);

  // Total Expense Box
  doc.setFillColor(254, 242, 242);
  doc.setDrawColor(239, 68, 68);
  doc.roundedRect(76, cardY, cardW, cardH, 2, 2, 'FD');
  doc.setFontSize(8);
  doc.setTextColor(153, 27, 27);
  doc.setFont('helvetica', 'normal');
  doc.text('TOTAL EXPENSE', 80, cardY + 7);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text(`-${currency.symbol}${totalExpense.toLocaleString()}`, 80, cardY + 16);

  // Net Balance Box
  const isNetPos = netBalance >= 0;
  doc.setFillColor(isNetPos ? 240 : 254, isNetPos ? 249 : 242, isNetPos ? 255 : 242);
  doc.setDrawColor(isNetPos ? 14 : 239, isNetPos ? 165 : 68, isNetPos ? 233 : 68);
  doc.roundedRect(138, cardY, cardW, cardH, 2, 2, 'FD');
  doc.setFontSize(8);
  doc.setTextColor(isNetPos ? 12 : 153, isNetPos ? 74 : 27, isNetPos ? 110 : 27);
  doc.setFont('helvetica', 'normal');
  doc.text('NET BALANCE', 142, cardY + 7);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text(`${isNetPos ? '+' : ''}${currency.symbol}${netBalance.toLocaleString()}`, 142, cardY + 16);

  // Transactions Table
  const tableData = transactions.map((t) => [
    formatDate(t.date),
    `${t.type} (${t.source === 'AUTOMATIC' ? 'AUTO' : 'MANUAL'})`,
    `${t.type === 'INCOME' ? '+' : '-'}${currency.symbol}${t.amount.toLocaleString()}`,
    t.category,
    t.paymentMethod.replace('_', ' '),
    t.merchant || '-',
    t.description || (t.transactionReference ? `Ref: ${t.transactionReference}` : '-')
  ]);

  autoTable(doc, {
    startY: cardY + cardH + 8,
    head: [['Date', 'Type & Source', 'Amount', 'Category', 'Payment', 'Merchant', 'Details']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [30, 41, 59],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
      cellPadding: 2.5
    },
    bodyStyles: {
      fontSize: 8,
      cellPadding: 2.5,
      textColor: [30, 41, 59]
    },
    columnStyles: {
      0: { cellWidth: 24 },
      1: { cellWidth: 26 },
      2: { cellWidth: 26, fontStyle: 'bold' },
      3: { cellWidth: 30 },
      4: { cellWidth: 24 },
      5: { cellWidth: 30 },
      6: { cellWidth: 'auto' },
    },
    didParseCell: (data) => {
      if (data.section === 'body' && data.column.index === 1) {
        if (String(data.cell.raw || '').startsWith('INCOME')) {
          data.cell.styles.textColor = [22, 163, 74];
          data.cell.styles.fontStyle = 'bold';
        } else {
          data.cell.styles.textColor = [220, 38, 38];
          data.cell.styles.fontStyle = 'bold';
        }
      }
      if (data.section === 'body' && data.column.index === 2) {
        const text = String(data.cell.raw || '');
        if (text.startsWith('+')) {
          data.cell.styles.textColor = [22, 163, 74];
        } else {
          data.cell.styles.textColor = [220, 38, 38];
        }
      }
    },
    foot: [
      [
        'Total', 
        '', 
        `${netBalance >= 0 ? '+' : ''}${currency.symbol}${netBalance.toLocaleString()}`, 
        '', 
        '', 
        '', 
        `Income: ${currency.symbol}${totalIncome.toLocaleString()} | Expense: ${currency.symbol}${totalExpense.toLocaleString()}`
      ]
    ],
    footStyles: {
      fillColor: [241, 245, 249],
      textColor: [15, 23, 42],
      fontStyle: 'bold',
      fontSize: 8.5
    },
    margin: { left: 14, right: 14 },
  });

  const pageCount = (doc as unknown as { internal: { getNumberOfPages: () => number } }).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `RupeeWise Daily Transaction Tracker — Page ${i} of ${pageCount}`,
      105,
      290,
      { align: 'center' }
    );
  }

  doc.save(filename);
}
