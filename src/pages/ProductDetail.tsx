import React, { useState } from 'react';
import { ArrowLeft, Star, Heart, Share2, ShoppingCart, Plus, Minus, Check, Truck, RotateCcw, Shield, Eye } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { CategoryItem } from '../types';
import { Product360Viewer } from '../components/Product360Viewer';
import { ProductReviews } from '../components/ProductReviews';

interface ProductDetailProps {
  product: CategoryItem;
  onNavigate: (page: string) => void;
}

export const ProductDetail: React.FC<ProductDetailProps> = ({ product, onNavigate }) => {
  const { addItem } = useCart();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | '360' | 'reviews'>('details');

  // Enhanced product data with 360° images and reviews
  const productData = {
    ...product,
    description: product.description || `Experience the premium quality of ${product.name}. Crafted with attention to detail and designed for modern lifestyle.`,
    rating: product.rating || 4.5,
    reviewCount: product.reviewCount || 128,
    inStock: product.inStock !== false,
    features: product.features || [
      'Premium quality materials',
      'Comfortable fit',
      'Durable construction',
      'Easy care instructions',
      'Satisfaction guaranteed'
    ],
    images: product.images || [
      product.image,
      'https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=600',
      'https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=600',
      'https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=600'
    ],
    images360: product.images360 || [
      'https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=600',
      'https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=600',
      'https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=600',
      'https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=600',
      'https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=600',
      'https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=600',
      'https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=600',
      'https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=600'
    ],
    reviews: product.reviews || [
      {
        id: '1',
        userId: 'user1',
        userName: 'Sarah Johnson',
        userAvatar: 'https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=100',
        rating: 5,
        title: 'Absolutely love this product!',
        comment: 'The quality is outstanding and it fits perfectly. Highly recommend to anyone looking for premium quality.',
        date: '2024-01-15',
        verified: true,
        helpful: 12,
        images: ['https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=200']
      },
      {
        id: '2',
        userId: 'user2',
        userName: 'Mike Chen',
        rating: 4,
        title: 'Great value for money',
        comment: 'Good quality product, delivery was fast. Only minor issue was the packaging could be better.',
        date: '2024-01-10',
        verified: true,
        helpful: 8
      },
      {
        id: '3',
        userId: 'user3',
        userName: 'Emma Wilson',
        rating: 5,
        title: 'Perfect!',
        comment: 'Exactly what I was looking for. The material feels premium and the design is beautiful.',
        date: '2024-01-05',
        verified: true,
        helpful: 15
      }
    ]
  };

  const handleAddToCart = () => {
    addItem(productData, quantity);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const handleBuyNow = () => {
    addItem(productData, quantity);
    onNavigate('checkout');
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < Math.floor(rating)
            ? 'text-yellow-400 fill-current'
            : i < rating
            ? 'text-yellow-400 fill-current opacity-50'
            : 'text-gray-300'
        }`}
      />
    ));
  };

  const discountPercentage = productData.originalPrice 
    ? Math.round(((productData.originalPrice - productData.price) / productData.originalPrice) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => onNavigate('products')}
          className="flex items-center text-gray-600 hover:text-indigo-600 mb-6 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Products
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Tab Navigation */}
            <div className="flex space-x-4 mb-4">
              <button
                onClick={() => setActiveTab('details')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'details'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Gallery
              </button>
              <button
                onClick={() => setActiveTab('360')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 ${
                  activeTab === '360'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <Eye className="h-4 w-4" />
                <span>360° View</span>
              </button>
            </div>

            {/* Image Display */}
            {activeTab === 'details' ? (
              <>
                {/* Main Image */}
                <div className="aspect-square bg-white rounded-lg overflow-hidden shadow-lg">
                  <img
                    src={productData.images[selectedImage]}
                    alt={productData.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Thumbnail Images */}
                <div className="grid grid-cols-4 gap-4">
                  {productData.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`aspect-square bg-white rounded-lg overflow-hidden border-2 transition-all ${
                        selectedImage === index
                          ? 'border-indigo-600 ring-2 ring-indigo-200'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <img
                        src={image}
                        alt={`${productData.name} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <Product360Viewer
                images={productData.images360}
                productName={productData.name}
              />
            )}
          </div>

          {/* Product Information */}
          <div className="space-y-6">
            {/* Category Badge */}
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 bg-indigo-100 text-indigo-800 text-sm font-medium rounded-full capitalize">
                {productData.category}
              </span>
              {discountPercentage > 0 && (
                <span className="px-3 py-1 bg-red-100 text-red-800 text-sm font-medium rounded-full">
                  {discountPercentage}% OFF
                </span>
              )}
            </div>

            {/* Product Title */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {productData.name}
              </h1>
              
              {/* Rating */}
              <div className="flex items-center space-x-2">
                <div className="flex items-center">
                  {renderStars(productData.rating)}
                </div>
                <span className="text-sm text-gray-600">
                  {productData.rating} ({productData.reviewCount} reviews)
                </span>
              </div>
            </div>

            {/* Price */}
            <div className="flex items-center space-x-4">
              <span className="text-3xl font-bold text-indigo-600">
                ₹{productData.price.toFixed(2)}
              </span>
              {productData.originalPrice && (
                <span className="text-xl text-gray-500 line-through">
                  ₹{productData.originalPrice.toFixed(2)}
                </span>
              )}
            </div>

            {/* Stock Status */}
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${productData.inStock ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className={`text-sm font-medium ${productData.inStock ? 'text-green-700' : 'text-red-700'}`}>
                {productData.inStock ? 'In Stock' : 'Out of Stock'}
              </span>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
              <p className="text-gray-600 leading-relaxed">
                {productData.description}
              </p>
            </div>

            {/* Features */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Features</h3>
              <ul className="space-y-2">
                {productData.features.map((feature, index) => (
                  <li key={index} className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                    <span className="text-gray-600">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Quantity Selector */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Quantity</h3>
              <div className="flex items-center space-x-4">
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 hover:bg-gray-100 transition-colors"
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="px-4 py-2 font-medium">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-2 hover:bg-gray-100 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <span className="text-sm text-gray-600">
                  Total: ₹{(productData.price * quantity).toFixed(2)}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              <div className="flex space-x-4">
                <button
                  onClick={handleAddToCart}
                  disabled={!productData.inStock || isAdded}
                  className={`flex-1 flex items-center justify-center px-6 py-3 rounded-lg font-medium transition-all ${
                    isAdded
                      ? 'bg-green-600 text-white'
                      : productData.inStock
                      ? 'bg-indigo-600 text-white hover:bg-indigo-700 hover:scale-105'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {isAdded ? (
                    <>
                      <Check className="h-5 w-5 mr-2" />
                      Added to Cart
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="h-5 w-5 mr-2" />
                      Add to Cart
                    </>
                  )}
                </button>

                <button
                  onClick={handleBuyNow}
                  disabled={!productData.inStock}
                  className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all ${
                    productData.inStock
                      ? 'bg-gray-900 text-white hover:bg-gray-800 hover:scale-105'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Buy Now
                </button>
              </div>

              {/* Secondary Actions */}
              <div className="flex space-x-4">
                <button
                  onClick={() => setIsFavorite(!isFavorite)}
                  className={`flex items-center justify-center px-4 py-2 border rounded-lg transition-all ${
                    isFavorite
                      ? 'border-red-300 bg-red-50 text-red-600'
                      : 'border-gray-300 text-gray-600 hover:border-gray-400'
                  }`}
                >
                  <Heart className={`h-4 w-4 mr-2 ${isFavorite ? 'fill-current' : ''}`} />
                  {isFavorite ? 'Favorited' : 'Add to Favorites'}
                </button>

                <button className="flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-600 rounded-lg hover:border-gray-400 transition-colors">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </button>
              </div>
            </div>

            {/* Additional Information */}
            <div className="border-t pt-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-2">
                  <Truck className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Free Shipping</p>
                    <p className="text-xs text-gray-600">On orders over ₹4000</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <RotateCcw className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Easy Returns</p>
                    <p className="text-xs text-gray-600">30-day return policy</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Warranty</p>
                    <p className="text-xs text-gray-600">1-year manufacturer warranty</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-12">
          <button
            onClick={() => setActiveTab('reviews')}
            className="text-2xl font-bold text-gray-900 mb-6 hover:text-indigo-600 transition-colors"
          >
            Customer Reviews
          </button>
          
          <ProductReviews
            reviews={productData.reviews}
            productId={productData.id}
            averageRating={productData.rating}
            totalReviews={productData.reviewCount}
            onAddReview={(review) => {
              // In a real app, this would make an API call
              console.log('New review:', review);
            }}
          />
        </div>
      </div>
    </div>
  );
};