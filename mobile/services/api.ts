import { Platform } from 'react-native';
import { getAuthToken, removeAuthToken, getCustomApiUrl } from './storage';

// Default API base URLs:
// Supports EXPO_PUBLIC_API_URL environment variable, or falls back to:
// Android Emulator: 10.0.2.2:5000
// iOS Simulator / Web / Devices: localhost:5000
const FALLBACK_API_URL = Platform.select({
  android: 'http://10.0.2.2:5000',
  default: 'http://localhost:5000'
}) || 'http://localhost:5000';

const DEFAULT_API_URL: string = process.env.EXPO_PUBLIC_API_URL || FALLBACK_API_URL;

let cachedBaseUrl: string | null = null;

export async function getBaseUrl(): Promise<string> {
  if (cachedBaseUrl) return cachedBaseUrl;
  const custom = await getCustomApiUrl();
  cachedBaseUrl = custom || DEFAULT_API_URL;
  return cachedBaseUrl || DEFAULT_API_URL;
}

export function setApiUrlOverride(url: string) {
  cachedBaseUrl = url;
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const baseUrl = await getBaseUrl();
  const url = `${baseUrl}${endpoint}`;
  const token = await getAuthToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Create 10s timeout controller
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (response.status === 401) {
      // Token expired or invalid
      if (!endpoint.includes('/auth/login')) {
        await removeAuthToken();
      }
      const data = await response.json().catch(() => ({}));
      throw new Error(data.error || 'Authentication session expired. Please sign in again.');
    }

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.error || `Server request failed (${response.status})`);
    }

    return data as T;
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new Error('Connection timeout. Please verify your server is running.');
    }
    throw err;
  }
}

export const api = {
  // Auth
  login: (credentials: { identifier: string; password: string }) => 
    request<{ user: any; token: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    }),

  register: (payload: { name: string; email: string; phone?: string; password: string }) =>
    request<{ user: any; token: string; message: string }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  logout: () => 
    request<{ message: string }>('/api/auth/logout', { method: 'POST' }),

  getMe: () => 
    request<{ user: any; settings: any }>('/api/users/me'),

  sendEmailVerification: () =>
    request<{ message: string; previewUrl?: string }>('/api/auth/send-verification-email', { method: 'POST' }),

  verifyEmail: (token: string) =>
    request<{ message: string; verified: boolean }>('/api/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ token })
    }),

  sendPhoneOtp: () =>
    request<{ message: string; cooldown: number }>('/api/auth/send-otp', { method: 'POST' }),

  verifyPhoneOtp: (otp: string) =>
    request<{ message: string; verified: boolean }>('/api/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ otp })
    }),

  forgotPassword: (identifier: string) =>
    request<{ message: string }>('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ identifier })
    }),

  resetPassword: (payload: { identifier: string; otp: string; newPassword: string }) =>
    request<{ message: string; success: boolean }>('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  // Banks
  getBanks: () => 
    request<{ banks: any[]; totalBankBalance: number }>('/api/banks'),

  createBank: (bankData: any) =>
    request<{ bank: any; totalBankBalance: number }>('/api/banks', {
      method: 'POST',
      body: JSON.stringify(bankData)
    }),

  updateBank: (id: string, bankData: any) =>
    request<{ bank: any; totalBankBalance: number }>(`/api/banks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(bankData)
    }),

  deleteBank: (id: string) =>
    request<{ message: string; totalBankBalance: number }>(`/api/banks/${id}`, {
      method: 'DELETE'
    }),

  adjustBankBalance: (id: string, newBalance: number, reason: string) =>
    request<{ bank: any; adjustment: any; totalBankBalance: number }>(`/api/banks/${id}/balance`, {
      method: 'POST',
      body: JSON.stringify({ newBalance, reason })
    }),

  // Transactions
  getTransactions: (params: Record<string, string | number> = {}) => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        searchParams.append(k, String(v));
      }
    });
    const query = searchParams.toString();
    return request<{
      transactions: any[];
      pagination: any;
      overview: any;
    }>(`/api/transactions${query ? `?${query}` : ''}`);
  },

  createTransaction: (txData: any) =>
    request<{ transaction: any; overview: any }>('/api/transactions', {
      method: 'POST',
      body: JSON.stringify(txData)
    }),

  updateTransaction: (id: string, txData: any) =>
    request<{ transaction: any; overview: any }>(`/api/transactions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(txData)
    }),

  deleteTransaction: (id: string) =>
    request<{ message: string; overview: any }>(`/api/transactions/${id}`, {
      method: 'DELETE'
    }),

  // Budgets
  getBudgets: (month?: number, year?: number) => {
    const q = month && year ? `?month=${month}&year=${year}` : '';
    return request<{ budgets: any[]; totalBudgeted: number; totalSpent: number }>(`/api/budgets${q}`);
  },

  createBudget: (budgetData: any) =>
    request<{ budget: any }>('/api/budgets', {
      method: 'POST',
      body: JSON.stringify(budgetData)
    }),

  updateBudget: (id: string, budgetData: any) =>
    request<{ budget: any }>(`/api/budgets/${id}`, {
      method: 'PUT',
      body: JSON.stringify(budgetData)
    }),

  deleteBudget: (id: string) =>
    request<{ message: string }>(`/api/budgets/${id}`, { method: 'DELETE' }),

  // Calendar
  getCalendar: (month: number, year: number, filterDimension = 'all') =>
    request<{
      month: number;
      year: number;
      monthIncome: number;
      monthExpense: number;
      monthNet: number;
      days: Record<string, any>;
    }>(`/api/calendar?month=${month}&year=${year}&dimension=${filterDimension}`),

  // Reports
  getReports: (range = 'this_month') =>
    request<{
      range: string;
      summary: any;
      categoryBreakdown: any[];
      paymentMethodBreakdown: any[];
      timeline: any[];
      highestExpense: any;
    }>(`/api/reports?range=${range}`),

  // Settings
  getSettings: () =>
    request<{ settings: any }>('/api/settings'),

  updateSettings: (settingsData: any) =>
    request<{ settings: any }>('/api/settings', {
      method: 'PUT',
      body: JSON.stringify(settingsData)
    }),

  // AI Assistant
  chatAi: (message: string) =>
    request<{
      reply: string;
      requiresConfirmation?: boolean;
      pendingAction?: any;
    }>('/api/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ message })
    }),

  confirmAiAction: (actionData: any) =>
    request<{ success: boolean; message: string; overview?: any }>('/api/ai/confirm-action', {
      method: 'POST',
      body: JSON.stringify(actionData)
    }),

  // Offline Sync
  syncBatch: (transactions: any[]) =>
    request<{
      success: boolean;
      syncedCount: number;
      duplicateCount: number;
      results: any[];
      overview: any;
    }>('/api/sync/batch', {
      method: 'POST',
      body: JSON.stringify({ transactions })
    }),

  getSyncStatus: () =>
    request<{ status: string; serverTime: string; lastModified: string; overview: any }>('/api/sync/status'),

  // Notifications
  getNotifications: () =>
    request<{ notifications: any[]; unreadCount: number }>('/api/notifications'),

  registerPushToken: (token: string, platform = Platform.OS) =>
    request<{ success: boolean }>('/api/notifications/register-token', {
      method: 'POST',
      body: JSON.stringify({ token, platform })
    }),

  markNotificationsRead: (id?: string) =>
    request<{ success: boolean }>('/api/notifications/mark-read', {
      method: 'POST',
      body: JSON.stringify({ id })
    }),

  triggerTestNotification: (type = 'budget') =>
    request<{ success: boolean; notification: any }>('/api/notifications/trigger-test', {
      method: 'POST',
      body: JSON.stringify({ type })
    })
};
