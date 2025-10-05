import React from 'react';
import { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { Navbar } from './components/Navbar';
import { Home } from './pages/Home';
import { Products } from './pages/Products';
import { ProductDetail } from './pages/ProductDetail';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Cart } from './pages/Cart';
import { Checkout } from './pages/Checkout';
import { TestConnection } from './components/TestConnection';
import { CategoryItem } from './types';

// Mock data for product details (in a real app, this would come from an API)
const mockProducts: { [key: string]: CategoryItem } = {
  '1': { 
    id: '1', 
    name: 'Elegant Silk Scarf', 
    price: 89.99, 
    originalPrice: 119.99,
    image: 'https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=400', 
    category: 'women',
    description: 'Luxurious silk scarf perfect for any occasion. Made from 100% pure silk with elegant patterns and hand-finished edges. This versatile accessory can be worn in multiple ways and comes in a beautiful gift box.',
    rating: 4.8,
    reviewCount: 156,
    inStock: true,
    features: ['100% Pure Silk', 'Hand-finished edges', 'Versatile styling', 'Gift box included', 'Multiple color options'],
    images: [
      'https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=600',
      'https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=600',
      'https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=600',
      'https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=600'
    ],
    images360: [
      'https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=600',
      'https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=600',
      'https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=600',
      'https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=600',
      'https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=600',
      'https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=600',
      'https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=600',
      'https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=600'
    ],
    reviews: [
      {
        id: '1',
        userId: 'user1',
        userName: 'Sarah Johnson',
        userAvatar: 'https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=100',
        rating: 5,
        title: 'Absolutely love this scarf!',
        comment: 'The silk quality is outstanding and it feels so luxurious. Perfect for both casual and formal occasions.',
        date: '2024-01-15',
        verified: true,
        helpful: 12,
        images: ['https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=200']
      },
      {
        id: '2',
        userId: 'user2',
        userName: 'Emma Wilson',
        rating: 4,
        title: 'Beautiful design',
        comment: 'Love the patterns and colors. Great quality for the price.',
        date: '2024-01-10',
        verified: true,
        helpful: 8
      }
    ]
  },
  // Add more products as needed...
};

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

  const handleNavigation = (page: string, productId?: string) => {
    setCurrentPage(page);
    if (productId) {
      setSelectedProductId(productId);
    }
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <Home onNavigate={handleNavigation} />;
      case 'products':
        return <Products onNavigate={handleNavigation} />;
      case 'product-detail':
        if (selectedProductId && mockProducts[selectedProductId]) {
          return <ProductDetail product={mockProducts[selectedProductId]} onNavigate={handleNavigation} />;
        }
        return <Products onNavigate={handleNavigation} />;
      case 'login':
        return <Login onNavigate={handleNavigation} />;
      case 'register':
        return <Register onNavigate={handleNavigation} />;
      case 'cart':
        return <Cart onNavigate={handleNavigation} />;
      case 'checkout':
        return <Checkout onNavigate={handleNavigation} />;
      default:
        return <Home onNavigate={handleNavigation} />;
    }
  };

  return (
    <AuthProvider>
      <CartProvider>
        <div className="min-h-screen bg-gray-50">
          <Navbar currentPage={currentPage} onNavigate={handleNavigation} />
          {renderPage()}
          <TestConnection />
        </div>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
