import React, { useState } from 'react';
import { Star, ThumbsUp, Camera, CheckCircle, Filter, ChevronDown } from 'lucide-react';
import { ProductReview } from '../types';
import { useAuth } from '../context/AuthContext';

interface ProductReviewsProps {
  reviews: ProductReview[];
  productId: string;
  averageRating: number;
  totalReviews: number;
  onAddReview?: (review: Omit<ProductReview, 'id' | 'date' | 'helpful'>) => void;
}

export const ProductReviews: React.FC<ProductReviewsProps> = ({
  reviews,
  productId,
  averageRating,
  totalReviews,
  onAddReview
}) => {
  const { user } = useAuth();
  const [showWriteReview, setShowWriteReview] = useState(false);
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'helpful' | 'rating'>('newest');
  const [newReview, setNewReview] = useState({
    rating: 5,
    title: '',
    comment: '',
    images: [] as string[]
  });

  const renderStars = (rating: number, size: 'sm' | 'md' | 'lg' = 'md') => {
    const sizeClasses = {
      sm: 'h-3 w-3',
      md: 'h-4 w-4',
      lg: 'h-5 w-5'
    };

    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`${sizeClasses[size]} ${
          i < Math.floor(rating)
            ? 'text-yellow-400 fill-current'
            : i < rating
            ? 'text-yellow-400 fill-current opacity-50'
            : 'text-gray-300'
        }`}
      />
    ));
  };

  const getRatingDistribution = () => {
    const distribution = [0, 0, 0, 0, 0];
    reviews.forEach(review => {
      distribution[review.rating - 1]++;
    });
    return distribution.reverse(); // 5 stars first
  };

  const filteredAndSortedReviews = reviews
    .filter(review => filterRating === null || review.rating === filterRating)
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'oldest':
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case 'helpful':
          return b.helpful - a.helpful;
        case 'rating':
          return b.rating - a.rating;
        default:
          return 0;
      }
    });

  const handleSubmitReview = () => {
    if (!user || !onAddReview) return;

    const review: Omit<ProductReview, 'id' | 'date' | 'helpful'> = {
      userId: user.id,
      userName: user.full_name,
      userAvatar: user.avatar_url,
      rating: newReview.rating,
      title: newReview.title,
      comment: newReview.comment,
      verified: true,
      images: newReview.images
    };

    onAddReview(review);
    setNewReview({ rating: 5, title: '', comment: '', images: [] });
    setShowWriteReview(false);
  };

  const ratingDistribution = getRatingDistribution();

  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      <div className="bg-white rounded-lg p-6 shadow-sm border">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Overall Rating */}
          <div className="text-center">
            <div className="text-4xl font-bold text-gray-900 mb-2">
              {averageRating.toFixed(1)}
            </div>
            <div className="flex items-center justify-center mb-2">
              {renderStars(averageRating, 'lg')}
            </div>
            <p className="text-gray-600">Based on {totalReviews} reviews</p>
          </div>

          {/* Rating Distribution */}
          <div className="space-y-2">
            {ratingDistribution.map((count, index) => {
              const rating = 5 - index;
              const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
              
              return (
                <div key={rating} className="flex items-center space-x-2">
                  <span className="text-sm font-medium w-8">{rating}★</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-600 w-8">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Write Review Button */}
        {user && (
          <div className="mt-6 text-center">
            <button
              onClick={() => setShowWriteReview(!showWriteReview)}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Write a Review
            </button>
          </div>
        )}
      </div>

      {/* Write Review Form */}
      {showWriteReview && user && (
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Write Your Review</h3>
          
          <div className="space-y-4">
            {/* Rating */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rating
              </label>
              <div className="flex space-x-1">
                {Array.from({ length: 5 }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => setNewReview({ ...newReview, rating: i + 1 })}
                    className="focus:outline-none"
                  >
                    <Star
                      className={`h-6 w-6 ${
                        i < newReview.rating
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Review Title
              </label>
              <input
                type="text"
                value={newReview.title}
                onChange={(e) => setNewReview({ ...newReview, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Summarize your experience"
              />
            </div>

            {/* Comment */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Review
              </label>
              <textarea
                value={newReview.comment}
                onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Share your thoughts about this product"
              />
            </div>

            {/* Submit Buttons */}
            <div className="flex space-x-3">
              <button
                onClick={handleSubmitReview}
                disabled={!newReview.title || !newReview.comment}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Submit Review
              </button>
              <button
                onClick={() => setShowWriteReview(false)}
                className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filters and Sort */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          {/* Filter by Rating */}
          <div className="relative">
            <select
              value={filterRating || ''}
              onChange={(e) => setFilterRating(e.target.value ? parseInt(e.target.value) : null)}
              className="appearance-none bg-white border border-gray-300 rounded-md px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>

          {/* Sort */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="appearance-none bg-white border border-gray-300 rounded-md px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="helpful">Most Helpful</option>
              <option value="rating">Highest Rating</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>
        </div>

        <p className="text-sm text-gray-600">
          Showing {filteredAndSortedReviews.length} of {reviews.length} reviews
        </p>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {filteredAndSortedReviews.map((review) => (
          <div key={review.id} className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                  {review.userAvatar ? (
                    <img
                      src={review.userAvatar}
                      alt={review.userName}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-gray-600 font-medium">
                      {review.userName.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="font-medium text-gray-900">{review.userName}</h4>
                    {review.verified && (
                      <CheckCircle className="h-4 w-4 text-green-500" title="Verified Purchase" />
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="flex">{renderStars(review.rating, 'sm')}</div>
                    <span className="text-sm text-gray-500">
                      {new Date(review.date).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <h5 className="font-medium text-gray-900 mb-2">{review.title}</h5>
            <p className="text-gray-700 mb-4">{review.comment}</p>

            {/* Review Images */}
            {review.images && review.images.length > 0 && (
              <div className="flex space-x-2 mb-4">
                {review.images.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`Review image ${index + 1}`}
                    className="w-16 h-16 object-cover rounded-md border"
                  />
                ))}
              </div>
            )}

            {/* Helpful Button */}
            <div className="flex items-center space-x-4">
              <button className="flex items-center space-x-1 text-gray-600 hover:text-indigo-600 transition-colors">
                <ThumbsUp className="h-4 w-4" />
                <span className="text-sm">Helpful ({review.helpful})</span>
              </button>
            </div>
          </div>
        ))}

        {filteredAndSortedReviews.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">No reviews match your current filters.</p>
          </div>
        )}
      </div>
    </div>
  );
};