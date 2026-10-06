import type { Transaction, DuplicateDetectionResult } from '../types';

class DuplicateDetectionService {
  /**
   * Check whether a candidate transaction is a duplicate of any existing transaction.
   */
  public detect(
    candidate: Partial<Transaction>,
    existingTransactions: Transaction[]
  ): DuplicateDetectionResult {
    if (!candidate.amount || !candidate.date) {
      return { isDuplicate: false, confidence: 0 };
    }

    const candRef = candidate.transactionReference?.trim();
    const candMerchant = candidate.merchant?.trim().toLowerCase();
    const candAmount = Math.abs(candidate.amount);
    const candDate = candidate.date.slice(0, 10); // YYYY-MM-DD
    const candTime = candidate.time?.trim();

    for (const existing of existingTransactions) {
      const existRef = existing.transactionReference?.trim();
      const existMerchant = existing.merchant?.trim().toLowerCase();
      const existAmount = Math.abs(existing.amount);
      const existDate = existing.date.slice(0, 10);
      const existTime = existing.time?.trim();

      // Rule 1: Exact reference ID match (Highest confidence: 100%)
      if (candRef && existRef && candRef.toLowerCase() === existRef.toLowerCase()) {
        return {
          isDuplicate: true,
          existingTransaction: existing,
          reason: `Exact transaction reference match (#${existRef})`,
          confidence: 100,
        };
      }

      // Rule 2: Same amount, same date, same merchant
      const sameAmount = Math.abs(candAmount - existAmount) < 0.001;
      const sameDate = candDate === existDate;
      const sameMerchant = candMerchant && existMerchant && (
        candMerchant === existMerchant ||
        candMerchant.includes(existMerchant) ||
        existMerchant.includes(candMerchant)
      );

      if (sameAmount && sameDate && sameMerchant) {
        // Check if time is also close (within 15 minutes)
        if (candTime && existTime) {
          const timeDiffMinutes = this.getTimeDiffMinutes(candTime, existTime);
          if (timeDiffMinutes <= 15) {
            return {
              isDuplicate: true,
              existingTransaction: existing,
              reason: `Identical amount (₹${candAmount}) and merchant ("${existing.merchant}") recorded within ${timeDiffMinutes} mins on ${candDate}`,
              confidence: 95,
            };
          }
        }

        // Even without precise time or if time is slightly further apart
        return {
          isDuplicate: true,
          existingTransaction: existing,
          reason: `Matching amount (₹${candAmount}) and merchant ("${existing.merchant}") on ${candDate}`,
          confidence: 85,
        };
      }

      // Rule 3: Exact amount, exact timestamp, same payment method (even if merchant is unnamed)
      if (sameAmount && sameDate && candidate.paymentMethod === existing.paymentMethod && candTime && existTime) {
        const timeDiffMinutes = this.getTimeDiffMinutes(candTime, existTime);
        if (timeDiffMinutes <= 2) {
          return {
            isDuplicate: true,
            existingTransaction: existing,
            reason: `Matching amount (₹${candAmount}) via ${candidate.paymentMethod} at approximately the same time (${existTime})`,
            confidence: 80,
          };
        }
      }
    }

    return { isDuplicate: false, confidence: 0 };
  }

  private getTimeDiffMinutes(timeA: string, timeB: string): number {
    const parse = (t: string) => {
      const parts = t.split(':').map((p) => parseInt(p, 10) || 0);
      return (parts[0] * 60) + (parts[1] || 0);
    };
    return Math.abs(parse(timeA) - parse(timeB));
  }
}

export const duplicateDetectionService = new DuplicateDetectionService();
