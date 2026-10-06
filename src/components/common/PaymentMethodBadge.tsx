import React from 'react';
import { Banknote, Smartphone, CreditCard, Landmark, HelpCircle } from 'lucide-react';
import type { PaymentMethod, TransactionSource } from '../../types';

interface PaymentMethodBadgeProps {
  method: PaymentMethod;
  source?: TransactionSource;
  size?: 'sm' | 'md';
  showIcon?: boolean;
  showSource?: boolean;
}

export const PaymentMethodBadge: React.FC<PaymentMethodBadgeProps> = ({
  method,
  source,
  size = 'md',
  showIcon = true,
  showSource = false,
}) => {
  const getConfig = () => {
    switch (method) {
      case 'CASH':
        return {
          label: 'Cash',
          icon: Banknote,
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60',
        };
      case 'UPI':
        return {
          label: 'UPI',
          icon: Smartphone,
          bg: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800/60',
        };
      case 'DEBIT_CARD':
        return {
          label: 'Debit Card',
          icon: CreditCard,
          bg: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800/60',
        };
      case 'CREDIT_CARD':
        return {
          label: 'Credit Card',
          icon: CreditCard,
          bg: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800/60',
        };
      case 'BANK_TRANSFER':
        return {
          label: 'Bank Transfer',
          icon: Landmark,
          bg: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800/60',
        };
      case 'OTHER':
      default:
        return {
          label: 'Other',
          icon: HelpCircle,
          bg: 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700',
        };
    }
  };

  const { icon: Icon, bg, label } = getConfig();
  const iconSize = size === 'sm' ? 12 : 14;
  const padding = size === 'sm' ? 'px-1.5 py-0.5 text-[11px]' : 'px-2 py-1 text-xs';

  return (
    <div className="inline-flex items-center gap-1.5 flex-wrap">
      <span
        className={`inline-flex items-center gap-1.5 font-medium rounded-md border ${bg} ${padding} transition-colors`}
      >
        {showIcon && <Icon size={iconSize} className="flex-shrink-0" />}
        <span>{label}</span>
      </span>

      {showSource && source && (
        <span
          className={`inline-flex items-center px-1.5 py-0.5 text-[10px] font-semibold tracking-wider uppercase rounded ${
            source === 'AUTOMATIC'
              ? 'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800'
              : 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800'
          }`}
        >
          {source === 'AUTOMATIC' ? 'AUTO' : 'MANUAL'}
        </span>
      )}
    </div>
  );
};
