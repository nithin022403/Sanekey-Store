import React, { useState, useEffect } from 'react';
import { Search, Filter, ShoppingBag } from 'lucide-react';
import { AddToCartButton } from '../components/AddToCartButton';
import { CategoryItem } from '../types';

interface ProductsProps {
  onNavigate: (page: string, productId?: string) => void;
}

// Mock category items data
const mockCategoryItems = {
  women: [
    { 
      id: '1', 
      name: 'Elegant Silk Scarf', 
      price: 89.99, 
      originalPrice: 119.99,
      image: 'https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=400', 
      category: 'women',
      description: 'Luxurious silk scarf perfect for any occasion. Made from 100% pure silk with elegant patterns.',
      rating: 4.8,
      reviewCount: 156,
      inStock: true,
      features: ['100% Pure Silk', 'Hand-finished edges', 'Versatile styling', 'Gift box included']
    },
    { 
      id: '2', 
      name: 'Winter Wool Coat', 
      price: 299.99, 
      image: 'https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=400', 
      category: 'women',
      description: 'Warm and stylish wool coat for winter. Premium wool blend with modern tailoring.',
      rating: 4.6,
      reviewCount: 89,
      inStock: true,
      features: ['Premium wool blend', 'Water-resistant', 'Tailored fit', 'Multiple pockets']
    },
    { 
      id: '3', 
      name: 'Floral Summer Dress', 
      price: 129.99, 
      image: 'https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=400', 
      category: 'women',
      description: 'Beautiful floral dress perfect for summer occasions. Lightweight and comfortable fabric.',
      rating: 4.7,
      reviewCount: 203,
      inStock: true,
      features: ['Breathable fabric', 'Floral print', 'Comfortable fit', 'Machine washable']
    },
  ],
  men: [
    { 
      id: '4', 
      name: 'Classic Leather Jacket', 
      price: 399.99, 
      originalPrice: 499.99,
      image: 'https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=400', 
      category: 'men',
      description: 'Timeless leather jacket crafted from genuine leather. Perfect for casual and semi-formal occasions.',
      rating: 4.9,
      reviewCount: 312,
      inStock: true,
      features: ['Genuine leather', 'Classic design', 'Multiple pockets', 'Durable construction']
    },
    { 
      id: '5', 
      name: 'Cotton Dress Shirt', 
      price: 79.99, 
      image: 'https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=400', 
      category: 'men',
      description: 'Premium cotton dress shirt for professional and formal occasions. Wrinkle-resistant fabric.',
      rating: 4.4,
      reviewCount: 127,
      inStock: true,
      features: ['100% Cotton', 'Wrinkle-resistant', 'Tailored fit', 'Easy care']
    },
    { 
      id: '6', 
      name: 'Wool Blazer', 
      price: 249.99, 
      image: 'https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=400', 
      category: 'men',
      description: 'Sophisticated wool blazer for business and formal events. Modern cut with classic styling.',
      rating: 4.5,
      reviewCount: 98,
      inStock: true,
      features: ['Premium wool', 'Modern fit', 'Professional styling', 'Versatile wear']
    },
  ],
  accessories: [
    { 
      id: '7', 
      name: 'Leather Wallet', 
      price: 59.99, 
      image: 'https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=400', 
      category: 'accessories',
      description: 'Premium leather wallet with multiple card slots and bill compartments. Compact and durable.',
      rating: 4.6,
      reviewCount: 245,
      inStock: true,
      features: ['Genuine leather', 'RFID blocking', 'Multiple compartments', 'Compact design']
    },
    { 
      id: '8', 
      name: 'Designer Cap', 
      price: 39.99, 
      image: 'https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=400', 
      category: 'accessories',
      description: 'Stylish designer cap perfect for casual wear. Adjustable fit with premium materials.',
      rating: 4.3,
      reviewCount: 78,
      inStock: true,
      features: ['Adjustable fit', 'Premium materials', 'Stylish design', 'UV protection']
    },
    { 
      id: '9', 
      name: 'Laptop Case', 
      price: 89.99, 
      image: 'https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=400', 
      category: 'accessories',
      description: 'Protective laptop case with padded interior. Fits most 13-15 inch laptops.',
      rating: 4.7,
      reviewCount: 156,
      inStock: true,
      features: ['Padded protection', 'Water-resistant', 'Multiple pockets', 'Fits 13-15 inch laptops']
    },
  ],
  sale: [
    { 
      id: '10', 
      name: 'Discounted Scarf', 
      price: 44.99, 
      originalPrice: 89.99, 
      image: 'https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=400', 
      category: 'sale',
      description: 'Beautiful scarf at a discounted price. Limited time offer on this premium accessory.',
      rating: 4.5,
      reviewCount: 89,
      inStock: true,
      features: ['50% Off', 'Premium quality', 'Limited time offer', 'Gift ready']
    },
    { 
      id: '11', 
      name: 'Sale Jacket', 
      price: 199.99, 
      originalPrice: 399.99, 
      image: 'https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=400', 
      category: 'sale',
      description: 'Premium jacket at an unbeatable price. Don\'t miss this amazing deal!',
      rating: 4.8,
      reviewCount: 167,
      inStock: true,
      features: ['50% Off', 'Premium materials', 'Limited stock', 'Best seller']
    },
  ],
  'gift-card': [
    { 
      id: '12', 
      name: 'Digital Gift Card ₹1000', 
      price: 1000, 
      image: 'https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=400', 
      category: 'gift-card',
      description: 'Perfect gift for any occasion. Digital delivery within minutes of purchase.',
      rating: 5.0,
      reviewCount: 45,
      inStock: true,
      features: ['Instant delivery', 'No expiry', 'Perfect gift', 'Easy to use']
    },
    { 
      id: '13', 
      name: 'Digital Gift Card ₹2500', 
      price: 2500, 
      image: 'https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=400', 
      category: 'gift-card',
      description: 'Premium gift card value for special occasions. Digital delivery with custom message.',
      rating: 5.0,
      reviewCount: 32,
      inStock: true,
      features: ['Instant delivery', 'Custom message', 'No expiry', 'Premium value']
    },
    { 
      id: '14', 
      name: 'Physical Gift Card ₹5000', 
      price: 5000, 
      image: 'https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=400', 
      category: 'gift-card',
      description: 'Luxury physical gift card in premium packaging. Perfect for special celebrations.',
      rating: 5.0,
      reviewCount: 28,
      inStock: true,
      features: ['Premium packaging', 'Physical card', 'No expiry', 'Luxury gift']
    },
  ],
};

export const Products: React.FC<ProductsProps> = ({ onNavigate }) => {
  const [items, setItems] = useState<CategoryItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<CategoryItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('name');

  useEffect(() => {
    // Combine all items
    const allItems = Object.values(mockCategoryItems).flat() as CategoryItem[];
    setItems(allItems);
    setFilteredItems(allItems);
  }, []);

  useEffect(() => {
    let filtered = items;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    // Sort items
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

    setFilteredItems(filtered);
  }, [items, searchTerm, selectedCategory, sortBy]);

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'women', label: 'Women' },
    { value: 'men', label: 'Men' },
    { value: 'accessories', label: 'Accessories' },
    { value: 'sale', label: 'Sale / Discounts' },
    { value: 'gift-card', label: 'Gift Card' },
  ];

  const handleProductClick = (productId: string) => {
    onNavigate('product-detail', productId);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">All Products</h1>
          
          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-gray-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                {categories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="name">Sort by Name</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>

          {/* Results count */}
          <p className="text-gray-600">
            Showing {filteredItems.length} of {items.length} products
          </p>
        </div>

        {/* Products Grid */}
        {filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map((item) => (
              <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <div 
                  className="aspect-w-1 aspect-h-1 w-full overflow-hidden bg-gray-200 cursor-pointer"
                  onClick={() => handleProductClick(item.id)}
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-48 w-full object-cover object-center hover:opacity-75 transition-opacity"
                  />
                </div>
                
                <div className="p-4">
                  <h3 
                    className="text-lg font-semibold text-gray-900 mb-2 cursor-pointer hover:text-indigo-600 transition-colors"
                    onClick={() => handleProductClick(item.id)}
                  >
                    {item.name}
                  </h3>
                  
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl font-bold text-indigo-600">
                        ₹{item.price.toFixed(2)}
                      </span>
                      {item.originalPrice && (
                        <span className="text-sm text-gray-500 line-through">
                          ₹{item.originalPrice.toFixed(2)}
                        </span>
                      )}
                    </div>
                    {item.category === 'sale' && (
                      <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded">
                        SALE
                      </span>
                    )}
                  </div>
                  
                  <AddToCartButton item={item} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <ShoppingBag className="mx-auto h-24 w-24 text-gray-400 mb-4" />
            <p className="text-gray-500 text-lg">No products found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};