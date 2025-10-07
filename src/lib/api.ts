// Enhanced API configuration for complete backend integration
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-backend-domain.com/api' 
  : 'http://localhost:8080/api';

// Enhanced API client with comprehensive error handling
class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('auth_token');
    console.log('🔧 API Client initialized with base URL:', baseURL);
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  private async handleResponse(response: Response) {
    console.log(`📡 Response Status: ${response.status} ${response.statusText}`);
    
    const contentType = response.headers.get('content-type');
    
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.error('❌ Non-JSON response:', text);
      throw new Error(`Server returned ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!response.ok) {
      console.error('❌ API Error:', {
        status: response.status,
        statusText: response.statusText,
        data
      });
      throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`);
    }
    
    return data;
  }

  async get(endpoint: string) {
    const url = `${this.baseURL}${endpoint}`;
    console.log(`🔄 GET ${url}`);
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders(),
        mode: 'cors',
      });
      
      const data = await this.handleResponse(response);
      console.log(`✅ GET ${endpoint} success:`, data);
      return data;
    } catch (error) {
      console.error(`❌ GET ${endpoint} failed:`, error);
      throw error;
    }
  }

  async post(endpoint: string, body: any) {
    const url = `${this.baseURL}${endpoint}`;
    console.log(`🔄 POST ${url}`, body);
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(body),
        mode: 'cors',
      });
      
      const data = await this.handleResponse(response);
      console.log(`✅ POST ${endpoint} success:`, data);
      return data;
    } catch (error) {
      console.error(`❌ POST ${endpoint} failed:`, error);
      throw error;
    }
  }

  async put(endpoint: string, body: any) {
    const url = `${this.baseURL}${endpoint}`;
    console.log(`🔄 PUT ${url}`, body);
    
    try {
      const response = await fetch(url, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(body),
        mode: 'cors',
      });
      
      const data = await this.handleResponse(response);
      console.log(`✅ PUT ${endpoint} success:`, data);
      return data;
    } catch (error) {
      console.error(`❌ PUT ${endpoint} failed:`, error);
      throw error;
    }
  }

  async delete(endpoint: string) {
    const url = `${this.baseURL}${endpoint}`;
    console.log(`🔄 DELETE ${url}`);
    
    try {
      const response = await fetch(url, {
        method: 'DELETE',
        headers: this.getHeaders(),
        mode: 'cors',
      });
      
      const data = await this.handleResponse(response);
      console.log(`✅ DELETE ${endpoint} success:`, data);
      return data;
    } catch (error) {
      console.error(`❌ DELETE ${endpoint} failed:`, error);
      throw error;
    }
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('auth_token', token);
      console.log('🔐 Token stored successfully');
    } else {
      localStorage.removeItem('auth_token');
      console.log('🔓 Token removed');
    }
  }

  getToken(): string | null {
    return this.token;
  }

  // Test backend connection
  async testConnection() {
    try {
      console.log('🔍 Testing backend connection...');
      const response = await this.get('/test/health');
      console.log('✅ Backend connection successful');
      return { success: true, data: response };
    } catch (error: any) {
      console.error('❌ Backend connection failed:', error.message);
      return { success: false, error: error.message };
    }
  }

  // Test database connection
  async testDatabase() {
    try {
      console.log('🔍 Testing database connection...');
      const response = await this.get('/test/db');
      console.log('✅ Database connection successful');
      return { success: true, data: response };
    } catch (error: any) {
      console.error('❌ Database connection failed:', error.message);
      return { success: false, error: error.message };
    }
  }
}

// Create API client instance
export const apiClient = new ApiClient(API_BASE_URL);

// Enhanced Authentication API
export const authAPI = {
  signIn: async (email: string, password: string) => {
    console.log('🔐 Attempting sign in for:', email);
    try {
      const response = await apiClient.post('/auth/signin', { email, password });
      
      if (response.success && response.token) {
        apiClient.setToken(response.token);
        console.log('✅ Sign in successful');
        return response;
      } else {
        throw new Error(response.message || 'Sign in failed');
      }
    } catch (error: any) {
      console.error('❌ Sign in failed:', error);
      throw error;
    }
  },

  signUp: async (email: string, password: string, fullName: string) => {
    console.log('📝 Attempting sign up for:', email);
    try {
      const response = await apiClient.post('/auth/signup', { email, password, fullName });
      
      if (response.success && response.token) {
        apiClient.setToken(response.token);
        console.log('✅ Sign up successful');
        return response;
      } else {
        throw new Error(response.message || 'Sign up failed');
      }
    } catch (error: any) {
      console.error('❌ Sign up failed:', error);
      throw error;
    }
  },

  signOut: async () => {
    console.log('🔓 Attempting sign out');
    try {
      await apiClient.post('/auth/signout', {});
      apiClient.setToken(null);
      console.log('✅ Sign out successful');
    } catch (error) {
      console.error('❌ Sign out failed:', error);
      // Clear token anyway
      apiClient.setToken(null);
    }
  },

  validateToken: async () => {
    const token = apiClient.getToken();
    if (!token) {
      throw new Error('No token found');
    }
    
    console.log('🔍 Validating token');
    try {
      const response = await apiClient.get('/auth/validate');
      console.log('✅ Token validation successful');
      return response;
    } catch (error) {
      console.error('❌ Token validation failed:', error);
      apiClient.setToken(null);
      throw error;
    }
  },

  getCurrentUser: async () => {
    console.log('👤 Getting current user');
    try {
      const response = await apiClient.get('/auth/me');
      console.log('✅ Got current user');
      return response;
    } catch (error) {
      console.error('❌ Failed to get current user:', error);
      throw error;
    }
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

// Product Review API
export const reviewAPI = {
  createReview: async (productId: string, rating: number, title: string, comment: string, images?: string[]) => {
    return await apiClient.post('/reviews', { productId, rating, title, comment, images });
  },

  updateReview: async (reviewId: number, rating: number, title: string, comment: string, images?: string[]) => {
    return await apiClient.put(`/reviews/${reviewId}`, { rating, title, comment, images });
  },

  deleteReview: async (reviewId: number) => {
    return await apiClient.delete(`/reviews/${reviewId}`);
  },

  getProductReviews: async (productId: string, rating?: number) => {
    const params = rating ? `?rating=${rating}` : '';
    return await apiClient.get(`/reviews/product/${productId}${params}`);
  },

  getProductRatingSummary: async (productId: string) => {
    return await apiClient.get(`/reviews/product/${productId}/summary`);
  },

  markReviewAsHelpful: async (reviewId: number) => {
    return await apiClient.post(`/reviews/${reviewId}/helpful`, {});
  },

  getUserReviews: async () => {
    return await apiClient.get('/reviews/my-reviews');
  },

  canUserReviewProduct: async (productId: string) => {
    return await apiClient.get(`/reviews/can-review/${productId}`);
  },
};

export default apiClient;