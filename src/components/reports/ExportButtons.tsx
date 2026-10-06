import React from 'react';
import { FileSpreadsheet, FileText, Printer } from 'lucide-react';
import type { Transaction, CurrencyConfig } from '../../types';
import { exportToCSV, exportToPDF } from '../../utils/exportUtils';

interface ExportButtonsProps {
  transactions: Transaction[];
  currency: CurrencyConfig;
  periodLabel: string;
}

export const ExportButtons: React.FC<ExportButtonsProps> = ({
  transactions,
  currency,
  periodLabel,
}) => {
  const handleExportCSV = () => {
    const today = new Date().toISOString().split('T')[0];
    exportToCSV(transactions, currency, `RupeeWise_Transactions_${today}.csv`);
  };

  const handleExportPDF = () => {
    const today = new Date().toISOString().split('T')[0];
    exportToPDF(transactions, currency, periodLabel, `RupeeWise_Statement_${today}.pdf`);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* CSV Export */}
      <button
        onClick={handleExportCSV}
        disabled={transactions.length === 0}
        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/80 text-xs font-bold transition shadow-xs disabled:opacity-50 cursor-pointer"
        title="Download CSV spreadsheet"
      >
        <FileSpreadsheet size={16} className="text-emerald-600" />
        <span>Export CSV</span>
      </button>

      {/* PDF Export */}
      <button
        onClick={handleExportPDF}
        disabled={transactions.length === 0}
        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold transition shadow-md shadow-emerald-600/20 disabled:opacity-50 cursor-pointer"
        title="Download PDF statement report"
      >
        <FileText size={16} />
        <span>Export PDF Report</span>
      </button>

      {/* Print */}
      <button
        onClick={handlePrint}
        className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs transition cursor-pointer"
        title="Print statement"
      >
        <Printer size={16} />
      </button>
    </div>
  );
};
