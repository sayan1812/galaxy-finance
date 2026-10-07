import axios, { type AxiosInstance, type InternalAxiosRequestConfig, type AxiosResponse } from 'axios';

/**
 * GALAXY FINANCE — CLIENT-SERVER API ENGINE
 * Configured with request/response interceptors, Bearer token injection,
 * and 401 automatic session eviction.
 */

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

export const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
  timeout: 15000,
});

// Request Interceptor: Inject JWT token into Authorization header
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('rupeewise_token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Invalidate session on 401 Unauthorized
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      if (typeof window !== 'undefined') {
        const hadToken = !!localStorage.getItem('rupeewise_token');
        localStorage.removeItem('rupeewise_token');
        localStorage.removeItem('rupeewise_user');

        if (hadToken) {
          window.dispatchEvent(new CustomEvent('auth:unauthorized'));
        }
      }
    }
    return Promise.reject(error);
  }
);

// Session helper utilities
export const setAuthToken = (token: string | null) => {
  if (typeof window !== 'undefined') {
    if (token) {
      localStorage.setItem('rupeewise_token', token);
    } else {
      localStorage.removeItem('rupeewise_token');
    }
  }
};

export const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('rupeewise_token');
  }
  return null;
};

// Typed Endpoint Operations
export const api = {
  client: apiClient,
  setToken: setAuthToken,
  getToken: getAuthToken,

  // --- Auth Workflow ---
  async register(data: { name: string; email: string; password: string; confirmPassword?: string }) {
    const res = await apiClient.post('/auth/register', data);
    if (res.data.token) setAuthToken(res.data.token);
    return res.data;
  },

  async login(identifier: string, password: string, rememberMe = true) {
    const res = await apiClient.post('/auth/login', { identifier, password, rememberMe });
    if (res.data.token) setAuthToken(res.data.token);
    return res.data;
  },

  async googleSync(payload: { email: string; name?: string; photoURL?: string; uid?: string; idToken?: string }) {
    const res = await apiClient.post('/auth/google-sync', payload);
    if (res.data.token) setAuthToken(res.data.token);
    return res.data;
  },

  async logout() {
    try {
      await apiClient.post('/auth/logout');
    } finally {
      setAuthToken(null);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('rupeewise_user');
      }
    }
  },

  async getMe() {
    const res = await apiClient.get('/auth/me');
    return res.data;
  },

  async deleteMyAccount(password?: string) {
    const res = await apiClient.delete('/users/me', { data: { password } });
    setAuthToken(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('rupeewise_user');
      localStorage.removeItem('rupeewise_token');
    }
    return res.data;
  },

  // --- Accounts (MongoDB Vaults) ---
  async getAccounts() {
    const res = await apiClient.get('/accounts');
    return res.data;
  },

  async createAccount(accountData: { accountName: string; accountType?: string; balance?: number; accountNumberMask?: string }) {
    const res = await apiClient.post('/accounts', accountData);
    return res.data;
  },

  async updateAccount(id: string, accountData: Partial<{ accountName: string; balance: number; accountNumberMask: string }>) {
    const res = await apiClient.patch(`/accounts/${id}`, accountData);
    return res.data;
  },

  async deleteAccount(id: string) {
    const res = await apiClient.delete(`/accounts/${id}`);
    return res.data;
  },

  // --- Transactions ---
  async getTransactions(params: Record<string, any> = {}) {
    const res = await apiClient.get('/transactions', { params });
    return res.data;
  },

  async createTransaction(txData: { accountId?: string; amount: number; type: 'income' | 'expense' | 'transfer'; category?: string; notes?: string; date?: string | Date }) {
    const res = await apiClient.post('/transactions', txData);
    return res.data;
  },

  async deleteTransaction(id: string) {
    const res = await apiClient.delete(`/transactions/${id}`);
    return res.data;
  },

  // --- Dashboard Aggregations ---
  async getDashboardSummary() {
    const res = await apiClient.get('/dashboard/summary');
    return res.data;
  },

  // --- Download & App Releases ---
  async getDownloadInfo() {
    const res = await apiClient.get('/download/info');
    return res.data;
  },

  getApkDownloadUrl(): string {
    return `${BASE_URL}/download/apk`;
  },
};

export default api;
