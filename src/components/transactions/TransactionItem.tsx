import React from 'react';
import type { Transaction } from '../../types';
import { TransactionRow } from './TransactionRow';

interface TransactionItemProps {
  transaction: Transaction;
  showDate?: boolean;
  onSelect?: () => void;
}

/**
 * TransactionItem
 * Re-exports TransactionRow with Crimson Noir & Slate Edition styling.
 */
export const TransactionItem: React.FC<TransactionItemProps> = (props) => {
  return <TransactionRow {...props} />;
};
