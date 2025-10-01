import React from 'react';
import { CategoryGrid } from '../components/CategoryGrid';
import { ArrowRight, Zap, Shield, Truck } from 'lucide-react';

interface HomeProps {
  onNavigate: (page: string) => void;
}

export const Home: React.FC<HomeProps> = ({ onNavigate }) => {
  const handleCategorySelect = (category: string) => {
    // Navigate to category page
    onNavigate('products');
  };

  const features = [
    {
      icon: Zap,
      title: 'Fast Delivery',
      description: 'Free shipping on orders over ₹4000',
    },
    {
      icon: Shield,
      title: 'Secure Payment',
      description: '100% secure payment processing',
    },
    {
      icon: Truck,
      title: 'Easy Returns',
      description: '30-day hassle-free returns',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Welcome to Sanekey Store
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-indigo-100">
              Discover premium fashion and accessories for everyone
            </p>
            <button
              onClick={() => onNavigate('products')}
              className="inline-flex items-center px-8 py-3 bg-white text-indigo-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
            >
              Shop Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Categories */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
            Shop by Category
          </h2>
          <CategoryGrid onCategorySelect={handleCategorySelect} />
        </div>

        {/* Featured Categories */}
        <div className="mb-16">
          <div className="bg-gradient-to-r from-pink-500 to-purple-600 rounded-2xl p-8 text-white text-center">
            <h2 className="text-3xl font-bold mb-4">Special Offers</h2>
            <p className="text-xl mb-6 opacity-90">
              Up to 50% off on selected items from Women, Men & Accessories
            </p>
            <button
              onClick={() => handleCategorySelect('sale')}
              className="inline-flex items-center px-6 py-3 bg-white text-purple-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
            >
              Shop Sale Items
              <ArrowRight className="ml-2 h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Gift Card Section */}
        <div className="mb-16">
          <div className="bg-gradient-to-r from-green-500 to-blue-600 rounded-2xl p-8 text-white text-center">
            <h2 className="text-3xl font-bold mb-4">Perfect Gift Solution</h2>
            <p className="text-xl mb-6 opacity-90">
              Give the gift of choice with our digital and physical gift cards
            </p>
            <button
              onClick={() => handleCategorySelect('gift-card')}
              className="inline-flex items-center px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
            >
              Buy Gift Cards
              <ArrowRight className="ml-2 h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Features */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Why Choose Sanekey Store?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <div key={index} className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4">
                    <IconComponent className="h-8 w-8 text-indigo-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};