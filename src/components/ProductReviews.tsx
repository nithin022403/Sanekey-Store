import React, { useState, useEffect } from 'react';
import { Star, ThumbsUp, Camera, CheckCircle, Filter, ChevronDown, Edit, Trash2 } from 'lucide-react';
import { ProductReview } from '../types';
import { useAuth } from '../context/AuthContext';
import { reviewAPI } from '../lib/api';

interface ProductReviewsProps {
  productId: string;
  onReviewsUpdate?: () => void;
}

export const ProductReviews: React.FC<ProductReviewsProps> = ({
  productId,
  onReviewsUpdate
}) => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [ratingSummary, setRatingSummary] = useState<any>(null);
  const [showWriteReview, setShowWriteReview] = useState(false);
  const [canReview, setCanReview] = useState(false);
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'helpful' | 'rating'>('newest');
  const [loading, setLoading] = useState(true);
  const [editingReview, setEditingReview] = useState<ProductReview | null>(null);
  const [newReview, setNewReview] = useState({
    rating: 5,
    title: '',
    comment: '',
    images: [] as string[]
  });

  useEffect(() => {
    loadReviews();
    loadRatingSummary();
    if (user) {
      checkCanReview();
    }
  }, [productId, user, filterRating]);

  const loadReviews = async () => {
    try {
      const response = await reviewAPI.getProductReviews(productId, filterRating || undefined);
      if (response.success) {
        let sortedReviews = [...response.reviews];
        
        // Sort reviews
        sortedReviews.sort((a, b) => {
          switch (sortBy) {
            case 'newest':
              return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            case 'oldest':
              return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
            case 'helpful':
              return b.helpfulCount - a.helpfulCount;
            case 'rating':
              return b.rating - a.rating;
            default:
              return 0;
          }
        });
        
        setReviews(sortedReviews);
      }
    } catch (error) {
      console.error('Failed to load reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRatingSummary = async () => {
    try {
      const response = await reviewAPI.getProductRatingSummary(productId);
      if (response.success) {
        setRatingSummary(response.summary);
      }
    } catch (error) {
      console.error('Failed to load rating summary:', error);
    }
  };

  const checkCanReview = async () => {
    try {
      const response = await reviewAPI.canUserReviewProduct(productId);
      if (response.success) {
        setCanReview(response.canReview);
      }
    } catch (error) {
      console.error('Failed to check review eligibility:', error);
    }
  };

  const handleSubmitReview = async () => {
    if (!user) return;

    try {
      if (editingReview) {
        await reviewAPI.updateReview(
          parseInt(editingReview.id),
          newReview.rating,
          newReview.title,
          newReview.comment,
          newReview.images
        );
        setEditingReview(null);
      } else {
        await reviewAPI.createReview(
          productId,
          newReview.rating,
          newReview.title,
          newReview.comment,
          newReview.images
        );
      }

      setNewReview({ rating: 5, title: '', comment: '', images: [] });
      setShowWriteReview(false);
      loadReviews();
      loadRatingSummary();
      checkCanReview();
      onReviewsUpdate?.();
    } catch (error: any) {
      console.error('Failed to submit review:', error);
      alert(error.message || 'Failed to submit review');
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm('Are you sure you want to delete this review?')) return;

    try {
      await reviewAPI.deleteReview(parseInt(reviewId));
      loadReviews();
      loadRatingSummary();
      checkCanReview();
      onReviewsUpdate?.();
    } catch (error: any) {
      console.error('Failed to delete review:', error);
      alert(error.message || 'Failed to delete review');
    }
  };

  const handleEditReview = (review: ProductReview) => {
    setEditingReview(review);
    setNewReview({
      rating: review.rating,
      title: review.title,
      comment: review.comment,
      images: review.images || []
    });
    setShowWriteReview(true);
  };

  const handleMarkHelpful = async (reviewId: string) => {
    try {
      await reviewAPI.markReviewAsHelpful(parseInt(reviewId));
      loadReviews();
    } catch (error) {
      console.error('Failed to mark review as helpful:', error);
    }
  };

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
    if (!ratingSummary?.ratingDistribution) return [];
    
    const distribution = [];
    for (let i = 5; i >= 1; i--) {
      distribution.push({
        rating: i,
        count: ratingSummary.ratingDistribution[i] || 0
      });
    }
    return distribution;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      {ratingSummary && (
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Overall Rating */}
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900 mb-2">
                {ratingSummary.averageRating.toFixed(1)}
              </div>
              <div className="flex items-center justify-center mb-2">
                {renderStars(ratingSummary.averageRating, 'lg')}
              </div>
              <p className="text-gray-600">Based on {ratingSummary.totalReviews} reviews</p>
            </div>

            {/* Rating Distribution */}
            <div className="space-y-2">
              {getRatingDistribution().map(({ rating, count }) => {
                const percentage = ratingSummary.totalReviews > 0 ? (count / ratingSummary.totalReviews) * 100 : 0;
                
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
          {user && canReview && (
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
      )}

      {/* Write Review Form */}
      {showWriteReview && user && (
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">
            {editingReview ? 'Edit Your Review' : 'Write Your Review'}
          </h3>
          
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
                {editingReview ? 'Update Review' : 'Submit Review'}
              </button>
              <button
                onClick={() => {
                  setShowWriteReview(false);
                  setEditingReview(null);
                  setNewReview({ rating: 5, title: '', comment: '', images: [] });
                }}
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
          Showing {reviews.length} reviews
        </p>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <div key={review.id} className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                  {review.user.avatarUrl ? (
                    <img
                      src={review.user.avatarUrl}
                      alt={review.user.fullName}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-gray-600 font-medium">
                      {review.user.fullName.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="font-medium text-gray-900">{review.user.fullName}</h4>
                    {review.isVerified && (
                      <CheckCircle className="h-4 w-4 text-green-500" title="Verified Purchase" />
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="flex">{renderStars(review.rating, 'sm')}</div>
                    <span className="text-sm text-gray-500">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Edit/Delete buttons for own reviews */}
              {user && user.id === review.user.id.toString() && (
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEditReview(review)}
                    className="text-gray-400 hover:text-indigo-600 transition-colors"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteReview(review.id)}
                    className="text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              )}
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
              <button 
                onClick={() => handleMarkHelpful(review.id)}
                className="flex items-center space-x-1 text-gray-600 hover:text-indigo-600 transition-colors"
              >
                <ThumbsUp className="h-4 w-4" />
                <span className="text-sm">Helpful ({review.helpfulCount})</span>
              </button>
            </div>
          </div>
        ))}

        {reviews.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">
              {filterRating ? 'No reviews match your current filters.' : 'No reviews yet. Be the first to review this product!'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};