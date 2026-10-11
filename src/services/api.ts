import axios, { type AxiosInstance, type InternalAxiosRequestConfig, type AxiosResponse } from 'axios';

/**
 * GALAXY FINANCE — CLIENT-SERVER API ENGINE
 * Configured with request/response interceptors, Bearer token injection,
 * and 401 automatic session eviction.
 */

const RAW_API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://galaxy-finance-js0l.onrender.com/api' : 'http://localhost:5000/api/v1');
const BASE_URL = RAW_API_URL.replace(/\/+$/, '');

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
      const token = localStorage.getItem('token') || localStorage.getItem('galaxy_token') || localStorage.getItem('rupeewise_token');
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
        const hadToken = !!(localStorage.getItem('token') || localStorage.getItem('galaxy_token') || localStorage.getItem('rupeewise_token'));
        localStorage.removeItem('token');
        localStorage.removeItem('galaxy_token');
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
      localStorage.setItem('token', token);
      localStorage.setItem('galaxy_token', token);
      localStorage.setItem('rupeewise_token', token);
    } else {
      localStorage.removeItem('token');
      localStorage.removeItem('galaxy_token');
      localStorage.removeItem('rupeewise_token');
    }
  }
};

export const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token') || localStorage.getItem('galaxy_token') || localStorage.getItem('rupeewise_token');
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
    const token = getAuthToken();
    if (!token) return null;
    try {
      const res = await apiClient.get('/auth/me');
      return res.data;
    } catch (err: any) {
      if (err?.response?.status === 401) return null;
      throw err;
    }
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
    const token = getAuthToken();
    if (!token) {
      const list: any[] = [];
      (list as any).accounts = list;
      (list as any).success = true;
      return list;
    }
    try {
      const res = await apiClient.get('/accounts');
      const data = res.data;
      const list = Array.isArray(data) ? data : (data && Array.isArray(data.accounts) ? data.accounts : []);
      (list as any).accounts = list;
      (list as any).success = true;
      return list;
    } catch (err: any) {
      if (err?.response?.status === 401) {
        const list: any[] = [];
        (list as any).accounts = list;
        (list as any).success = true;
        return list;
      }
      throw err;
    }
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
    const token = getAuthToken();
    if (!token) {
      return { transactions: [], pagination: {}, overview: {} };
    }
    try {
      const res = await apiClient.get('/transactions', { params });
      return res.data;
    } catch (err: any) {
      if (err?.response?.status === 401) {
        return { transactions: [], pagination: {}, overview: {} };
      }
      throw err;
    }
  },

  async createTransaction(txData: { accountId?: string; toAccountId?: string; amount: number; type: 'income' | 'expense' | 'transfer'; category?: string; notes?: string; merchant?: string; date?: string | Date }) {
    const res = await apiClient.post('/transactions', txData);
    return res.data;
  },

  async updateTransaction(id: string, txData: any) {
    const res = await apiClient.patch(`/transactions/${id}`, txData);
    return res.data;
  },

  async deleteTransaction(id: string) {
    const res = await apiClient.delete(`/transactions/${id}`);
    return res.data;
  },

  // --- Custom Categories (Defensive with Local Fallback) ---
  getCustomCategories: async () => {
    const token = getAuthToken();
    if (!token) {
      const local = typeof window !== 'undefined' ? localStorage.getItem('galaxy_custom_categories') : null;
      const parsed = local ? JSON.parse(local) : [];
      const list = Array.isArray(parsed) ? parsed : [];
      (list as any).categories = list;
      (list as any).success = true;
      return list;
    }
    try {
      const response = await apiClient.get('/categories/custom').catch(() => apiClient.get('/users/categories'));
      const data = response.data;
      const list = Array.isArray(data) ? data : (data && Array.isArray(data.categories) ? data.categories : []);
      // Polymorphic properties for backwards and forwards compatibility
      (list as any).categories = list;
      (list as any).success = true;
      return list;
    } catch (error: any) {
      if (error?.response?.status !== 401) {
        console.warn('API getCustomCategories failed, reading from local fallback:', error);
      }
      try {
        const local = localStorage.getItem('galaxy_custom_categories');
        const list = local ? JSON.parse(local) : [];
        const validList = Array.isArray(list) ? list : [];
        (validList as any).categories = validList;
        (validList as any).success = true;
        return validList;
      } catch {
        const empty: any[] = [];
        (empty as any).categories = empty;
        (empty as any).success = true;
        return empty;
      }
    }
  },

  addCustomCategory: async (categoryData: { name: string; type?: string; color?: string; icon?: string }) => {
    try {
      const response = await apiClient.post('/categories/custom', categoryData).catch(() => apiClient.post('/users/categories', categoryData));
      return response.data?.category || response.data;
    } catch (error) {
      console.warn('API addCustomCategory failed, saving to local fallback:', error);
      try {
        const local = localStorage.getItem('galaxy_custom_categories');
        const list = local ? JSON.parse(local) : [];
        const newCategory = { id: `cat-${Date.now()}`, ...categoryData };
        list.push(newCategory);
        localStorage.setItem('galaxy_custom_categories', JSON.stringify(list));
        return newCategory;
      } catch {
        return { id: `cat-${Date.now()}`, ...categoryData };
      }
    }
  },

  deleteCustomCategory: async (id: string) => {
    try {
      const response = await apiClient.delete(`/categories/custom/${id}`).catch(() => apiClient.delete(`/users/categories/${id}`));
      return response.data;
    } catch (error) {
      console.warn('API deleteCustomCategory failed, removing from local fallback:', error);
      try {
        const local = localStorage.getItem('galaxy_custom_categories');
        if (local) {
          const list = JSON.parse(local);
          const filtered = list.filter((c: any) => c.id !== id && c._id !== id);
          localStorage.setItem('galaxy_custom_categories', JSON.stringify(filtered));
        }
      } catch {
        // ignore
      }
      return { success: true };
    }
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
