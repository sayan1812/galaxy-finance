import NetInfo from '@react-native-community/netinfo';
import { api } from './api';
import { getOfflineQueue, saveOfflineQueue, clearOfflineQueue } from './storage';
import { Transaction } from '../types';

export interface SyncResult {
  success: boolean;
  syncedCount: number;
  duplicateCount: number;
  errors: any[];
}

export const syncService = {
  /**
   * Queue a transaction locally while disconnected
   */
  async queueTransaction(tx: Partial<Transaction>): Promise<Transaction> {
    const localId = 'offline_tx_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7);
    const offlineItem: Transaction = {
      id: localId,
      localId,
      amount: Number(tx.amount) || 0,
      type: tx.type || 'expense',
      category: tx.category || 'Other',
      subcategory: tx.subcategory,
      paymentMethod: tx.paymentMethod || 'Cash',
      source: tx.source || 'Manual',
      merchant: tx.merchant,
      description: tx.description,
      date: tx.date || new Date().toISOString().slice(0, 10),
      time: tx.time || new Date().toISOString().slice(11, 16),
      transactionReference: tx.transactionReference,
      bankId: tx.bankId || null,
      createdAt: new Date().toISOString(),
      isPendingSync: true
    };

    const currentQueue = await getOfflineQueue();
    currentQueue.push(offlineItem);
    await saveOfflineQueue(currentQueue);

    return offlineItem;
  },

  /**
   * Check if online and synchronizes all pending offline transactions
   */
  async syncPendingQueue(): Promise<SyncResult> {
    const netState = await NetInfo.fetch();
    const isOnline = Boolean(netState.isConnected && netState.isInternetReachable !== false);

    if (!isOnline) {
      return { success: false, syncedCount: 0, duplicateCount: 0, errors: ['Offline'] };
    }

    const queue = await getOfflineQueue();
    if (!queue || queue.length === 0) {
      return { success: true, syncedCount: 0, duplicateCount: 0, errors: [] };
    }

    try {
      const res = await api.syncBatch(queue);
      if (res && res.success) {
        await clearOfflineQueue();
        return {
          success: true,
          syncedCount: res.syncedCount,
          duplicateCount: res.duplicateCount,
          errors: []
        };
      } else {
        return { success: false, syncedCount: 0, duplicateCount: 0, errors: ['Sync failed on server'] };
      }
    } catch (err: any) {
      return { success: false, syncedCount: 0, duplicateCount: 0, errors: [err.message] };
    }
  },

  /**
   * Get count of pending offline items
   */
  async getPendingCount(): Promise<number> {
    const queue = await getOfflineQueue();
    return queue.length;
  }
};
