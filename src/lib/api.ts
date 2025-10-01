// API configuration and utilities for Java backend integration
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-java-backend.herokuapp.com/api' 
  : 'http://localhost:8080/api';

// API client with authentication
class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('auth_token');
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  private async handleResponse(response: Response) {
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'API request failed');
    }
    
    return data;
  }

  async get(endpoint: string) {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    
    return this.handleResponse(response);
  }

  async post(endpoint: string, body: any) {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(body),
    });
    
    return this.handleResponse(response);
  }

  async put(endpoint: string, body: any) {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(body),
    });
    
    return this.handleResponse(response);
  }

  async delete(endpoint: string) {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    
    return this.handleResponse(response);
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
  }

  getToken(): string | null {
    return this.token;
  }
}

// Create API client instance
export const apiClient = new ApiClient(API_BASE_URL);

// Authentication API
export const authAPI = {
  signIn: async (email: string, password: string) => {
    const response = await apiClient.post('/auth/signin', { email, password });
    if (response.success && response.token) {
      apiClient.setToken(response.token);
    }
    return response;
  },

  signUp: async (email: string, password: string, fullName: string) => {
    const response = await apiClient.post('/auth/signup', { email, password, fullName });
    if (response.success && response.token) {
      apiClient.setToken(response.token);
    }
    return response;
  },

  signOut: async () => {
    const response = await apiClient.post('/auth/signout', {});
    apiClient.setToken(null);
    return response;
  },

  validateToken: async () => {
    const token = apiClient.getToken();
    if (!token) {
      throw new Error('No token found');
    }
    return await apiClient.get('/auth/validate');
  },

  getCurrentUser: async () => {
    return await apiClient.get('/auth/me');
  },
};

// User API
export const userAPI = {
  getProfile: async () => {
    return await apiClient.get('/users/profile');
  },

  updateProfile: async (fullName: string, avatarUrl?: string) => {
    return await apiClient.put('/users/profile', { fullName, avatarUrl });
  },

  changePassword: async (oldPassword: string, newPassword: string) => {
    return await apiClient.put('/users/change-password', { oldPassword, newPassword });
  },
};

// Payment API
export const paymentAPI = {
  createStripePayment: async (amount: number, description: string) => {
    return await apiClient.post('/payments/stripe/create', { amount, description });
  },

  createPayPalPayment: async (amount: number, description: string) => {
    return await apiClient.post('/payments/paypal/create', { amount, description });
  },

  confirmStripePayment: async (paymentIntentId: string) => {
    return await apiClient.post('/payments/stripe/confirm', { paymentIntentId });
  },

  confirmPayPalPayment: async (orderId: string) => {
    return await apiClient.post('/payments/paypal/confirm', { orderId });
  },

  getPaymentHistory: async () => {
    return await apiClient.get('/payments/history');
  },

  getPaymentById: async (id: number) => {
    return await apiClient.get(`/payments/${id}`);
  },

  cancelPayment: async (id: number) => {
    return await apiClient.put(`/payments/${id}/cancel`, {});
  },
};

export default apiClient;