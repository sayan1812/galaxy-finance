import type { Transaction, DuplicateDetectionResult } from '../types';
import { categorizationService } from './categorizationService';
import { duplicateDetectionService } from './duplicateDetectionService';

export interface ImportResult {
  status: 'IMPORTED' | 'DUPLICATE_DETECTED' | 'FAILED';
  transaction?: Transaction;
  duplicateInfo?: DuplicateDetectionResult;
  message: string;
}

class TransactionImportService {
  /**
   * Process a single incoming online transaction payload (from webhook or mock feed).
   * Runs automatic categorization with merchant memory and duplicate detection.
   */
  public processIncomingTransaction(
    incoming: Partial<Transaction>,
    existingTransactions: Transaction[],
    allowDuplicateBypass: boolean = false
  ): ImportResult {
    try {
      if (!incoming.amount || incoming.amount <= 0) {
        return {
          status: 'FAILED',
          message: 'Invalid transaction: amount must be greater than zero.',
        };
      }

      const now = new Date();
      const pad = (n: number) => n.toString().padStart(2, '0');
      const defaultDate = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
      const defaultTime = `${pad(now.getHours())}:${pad(now.getMinutes())}`;

      const type = incoming.type || 'EXPENSE';
      const merchant = incoming.merchant?.trim() || '';
      const description = incoming.description?.trim() || '';

      // 1. Auto-Categorize with learned merchant rules first, then built-in keywords
      const resolvedCategory =
        incoming.category && incoming.category !== 'Other'
          ? incoming.category
          : categorizationService.categorize(merchant, description, type);

      const candidate: Transaction = {
        id: incoming.id || `tx-auto-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        type,
        amount: Math.abs(incoming.amount),
        currency: incoming.currency || 'INR',
        category: resolvedCategory,
        paymentMethod: incoming.paymentMethod || 'UPI',
        source: 'AUTOMATIC',
        merchant,
        description,
        date: incoming.date || defaultDate,
        time: incoming.time || defaultTime,
        account: incoming.account || 'Connected Online Feed',
        transactionReference: incoming.transactionReference || `REF/${Date.now()}`,
        isDuplicate: false,
        createdAt: incoming.createdAt || now.toISOString(),
        updatedAt: now.toISOString(),
      };

      // 2. Duplicate Detection
      if (!allowDuplicateBypass) {
        const dupCheck = duplicateDetectionService.detect(candidate, existingTransactions);
        if (dupCheck.isDuplicate) {
          candidate.isDuplicate = true;
          return {
            status: 'DUPLICATE_DETECTED',
            transaction: candidate,
            duplicateInfo: dupCheck,
            message: `Possible duplicate detected: ${dupCheck.reason}`,
          };
        }
      }

      return {
        status: 'IMPORTED',
        transaction: candidate,
        message: 'Transaction successfully processed and imported.',
      };
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Unknown error during import';
      return {
        status: 'FAILED',
        message: `Import processing error: ${errMsg}`,
      };
    }
  }

  /**
   * Batch process multiple incoming transactions.
   */
  public processBatch(
    incomingList: Partial<Transaction>[],
    existingTransactions: Transaction[]
  ): {
    imported: Transaction[];
    duplicates: Array<{ transaction: Transaction; duplicateInfo: DuplicateDetectionResult }>;
    failed: string[];
  } {
    const imported: Transaction[] = [];
    const duplicates: Array<{ transaction: Transaction; duplicateInfo: DuplicateDetectionResult }> = [];
    const failed: string[] = [];

    const currentCollection = [...existingTransactions];

    for (const item of incomingList) {
      const res = this.processIncomingTransaction(item, currentCollection);
      if (res.status === 'IMPORTED' && res.transaction) {
        imported.push(res.transaction);
        currentCollection.push(res.transaction);
      } else if (res.status === 'DUPLICATE_DETECTED' && res.transaction && res.duplicateInfo) {
        duplicates.push({ transaction: res.transaction, duplicateInfo: res.duplicateInfo });
      } else {
        failed.push(res.message);
      }
    }

    return { imported, duplicates, failed };
  }
}

export const transactionImportService = new TransactionImportService();
