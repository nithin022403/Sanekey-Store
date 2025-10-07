export interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  created_at: string;
  role?: 'USER' | 'ADMIN';
}

export interface CategoryItem {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: 'women' | 'men' | 'accessories' | 'sale' | 'gift-card';
  description?: string;
  rating?: number;
  reviewCount?: number;
  inStock?: boolean;
  features?: string[];
  images?: string[];
  images360?: string[];
  reviews?: ProductReview[];
}

export interface ProductReview {
  id: string;
  productId: string;
  rating: number;
  title: string;
  comment: string;
  isVerified: boolean;
  helpfulCount: number;
  images?: string[];
  createdAt: string;
  updatedAt: string;
  user: {
    id: number;
    fullName: string;
    avatarUrl?: string;
  };
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
}

export interface CartContextType {
  items: any[];
  addItem: (item: any, quantity?: number) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
}