const RAW_API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://galaxy-finance-js0l.onrender.com/api' : '/api');
const API_BASE = RAW_API_URL.replace(/\/+$/, '');

class ApiClient {
  private token: string | null = null;

  constructor() {
    this.token = typeof window !== 'undefined' ? localStorage.getItem('rupeewise_token') : null;
  }

  setToken(token: string | null) {
    this.token = token;
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('rupeewise_token', token);
      } else {
        localStorage.removeItem('rupeewise_token');
      }
    }
  }

  getToken(): string | null {
    return this.token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers = new Headers(options.headers || {});
    headers.set('Content-Type', 'application/json');

    if (this.token) {
      headers.set('Authorization', `Bearer ${this.token}`);
    }

    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const url = `${API_BASE}${cleanEndpoint}`;

    const response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include'
    });

    if (response.status === 401) {
      // Invalidate local token on unauthorized
      this.setToken(null);
    }

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.error || `Request failed with status ${response.status}`);
    }

    return data as T;
  }

  // --- Auth Endpoints ---
  async register(data: any) {
    const res = await this.request<{ token: string; user: any; message: string; verificationToken?: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    if (res.token) this.setToken(res.token);
    return res;
  }

  async login(identifier: string, password: string, rememberMe = true) {
    const res = await this.request<{ token: string; user: any; message: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier, password, rememberMe })
    });
    if (res.token) this.setToken(res.token);
    return res;
  }

  async googleSync(payload: { email: string; name?: string; photoURL?: string; uid?: string; idToken?: string }) {
    const res = await this.request<{ token: string; user: any; message: string }>('/auth/google-sync', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    if (res.token) this.setToken(res.token);
    return res;
  }

  async deleteMyAccount(password?: string) {
    const res = await this.request<{ success: boolean; message: string }>('/users/me', {
      method: 'DELETE',
      body: JSON.stringify({ password })
    });
    this.setToken(null);
    return res;
  }

  async logout() {
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } finally {
      this.setToken(null);
    }
  }

  async sendVerificationEmail() {
    return this.request<{ message: string; verificationToken?: string }>('/auth/send-verification-email', {
      method: 'POST'
    });
  }

  async verifyEmail(token: string) {
    return this.request<{ message: string; emailVerified: boolean }>('/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ token })
    });
  }

  async sendOtp(phone?: string) {
    return this.request<{ message: string; expiresAt: number; otp?: string }>('/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify({ phone })
    });
  }

  async verifyOtp(otp: string) {
    return this.request<{ message: string; phoneVerified: boolean }>('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ otp })
    });
  }

  async forgotPassword(identifier: string) {
    return this.request<{ message: string; target?: string; otp?: string }>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ identifier })
    });
  }

  async resetPassword(data: any) {
    return this.request<{ message: string }>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  // --- User Profile ---
  async getAuthMe() {
    return this.request<{ user: any; message?: string }>('/v1/auth/me');
  }

  async getMe() {
    return this.request<{ user: any; settings: any }>('/users/me');
  }

  async updateMe(data: any) {
    return this.request<{ user: any; message: string }>('/users/me', {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  }

  // --- Banks ---
  async getBanks() {
    return this.request<{ banks: any[]; totalBankBalance: number; count: number }>('/banks');
  }

  async createBank(bankData: any) {
    return this.request<{ bank: any; message: string }>('/banks', {
      method: 'POST',
      body: JSON.stringify(bankData)
    });
  }

  async getBank(id: string) {
    return this.request<{ bank: any; transactions: any[]; adjustments: any[] }>(`/banks/${id}`);
  }

  async updateBank(id: string, bankData: any) {
    return this.request<{ bank: any; message: string }>(`/banks/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(bankData)
    });
  }

  async deleteBank(id: string) {
    return this.request<{ message: string }>(`/banks/${id}`, {
      method: 'DELETE'
    });
  }

  // --- MongoDB Accounts / Vaults ---
  async getAccounts() {
    return this.request<{ accounts: any[]; count: number }>('/accounts');
  }

  async createAccount(accountData: any) {
    return this.request<{ account: any; message: string }>('/accounts', {
      method: 'POST',
      body: JSON.stringify(accountData)
    });
  }

  async deleteAccount(id: string) {
    return this.request<{ message: string; deletedId?: string }>(`/accounts/${id}`, {
      method: 'DELETE'
    });
  }

  async updateBankBalance(id: string, newBalance: number, reason: string) {
    return this.request<{ bank: any; adjustment: any; message: string }>(`/banks/${id}/balance`, {
      method: 'POST',
      body: JSON.stringify({ newBalance, reason })
    });
  }

  // --- Transactions ---
  async getTransactions(params: Record<string, any> = {}) {
    const query = new URLSearchParams();
    for (const key of Object.keys(params)) {
      if (params[key] !== undefined && params[key] !== null) {
        query.set(key, String(params[key]));
      }
    }
    const qStr = query.toString();
    return this.request<{ transactions: any[]; pagination: any; overview: any }>(`/transactions${qStr ? `?${qStr}` : ''}`);
  }

  async createTransaction(txData: any) {
    return this.request<{ transaction: any; overview: any; message: string }>('/transactions', {
      method: 'POST',
      body: JSON.stringify(txData)
    });
  }

  async updateTransaction(id: string, txData: any) {
    return this.request<{ transaction: any; overview: any; message: string }>(`/transactions/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(txData)
    });
  }

  async deleteTransaction(id: string) {
    return this.request<{ deletedId: string; overview: any; message: string }>(`/transactions/${id}`, {
      method: 'DELETE'
    });
  }

  // --- Budgets ---
  async getBudgets(month?: number, year?: number) {
    const query = month && year ? `?month=${month}&year=${year}` : '';
    return this.request<{ budgets: any[]; month: number; year: number }>(`/budgets${query}`);
  }

  async createBudget(category: string, amount: number, month?: number, year?: number) {
    return this.request<{ budget: any; message: string }>('/budgets', {
      method: 'POST',
      body: JSON.stringify({ category, amount, month, year })
    });
  }

  async deleteBudget(id: string) {
    return this.request<{ message: string }>(`/budgets/${id}`, {
      method: 'DELETE'
    });
  }

  // --- Reports ---
  async getReports(range = 'this_month', startDate?: string, endDate?: string) {
    const query = new URLSearchParams({ range });
    if (startDate) query.set('startDate', startDate);
    if (endDate) query.set('endDate', endDate);
    return this.request<any>(`/reports?${query.toString()}`);
  }

  // --- Calendar ---
  async getCalendar(month: number, year: number, dimension = 'All') {
    return this.request<{ month: number; year: number; dimension: string; days: Record<string, any> }>(
      `/calendar?month=${month}&year=${year}&dimension=${dimension}`
    );
  }

  // --- Settings ---
  async getSettings() {
    return this.request<any>('/settings');
  }

  async updateSettings(settings: any) {
    return this.request<{ settings: any; message: string }>('/settings', {
      method: 'PATCH',
      body: JSON.stringify(settings)
    });
  }

  // --- AI Agent ---
  async chatWithAi(message: string) {
    return this.request<{ reply: string; requiresConfirmation?: boolean; pendingAction?: any }>('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ message })
    });
  }

  async confirmAiAction(actionId: string, confirmed: boolean) {
    return this.request<{ success?: boolean; message: string; deletedId?: string; overview?: any }>('/ai/confirm-action', {
      method: 'POST',
      body: JSON.stringify({ actionId, confirmed })
    });
  }

  async getAiAuditLogs() {
    return this.request<{ logs: any[] }>('/ai/audit-logs');
  }
}

export const api = new ApiClient();
export default api;
