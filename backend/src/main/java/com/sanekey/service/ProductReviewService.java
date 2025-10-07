package com.sanekey.service;

import com.sanekey.model.ProductReview;
import com.sanekey.model.User;
import com.sanekey.repository.ProductReviewRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@Transactional
public class ProductReviewService {
    
    @Autowired
    private ProductReviewRepository reviewRepository;
    
    /**
     * Create a new review
     */
    public ProductReview createReview(User user, String productId, Integer rating, String title, String comment, List<String> images) {
        // Check if user has already reviewed this product
        if (reviewRepository.existsByProductIdAndUser(productId, user)) {
            throw new RuntimeException("You have already reviewed this product");
        }
        
        ProductReview review = new ProductReview(user, productId, rating, title, comment);
        review.setImages(images);
        review.setIsVerified(true); // In real app, this would be based on purchase history
        
        return reviewRepository.save(review);
    }
    
    /**
     * Update an existing review
     */
    public ProductReview updateReview(Long reviewId, User user, Integer rating, String title, String comment, List<String> images) {
        ProductReview review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found"));
        
        // Check if user owns this review
        if (!review.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("You can only update your own reviews");
        }
        
        review.setRating(rating);
        review.setTitle(title);
        review.setComment(comment);
        review.setImages(images);
        review.setUpdatedAt(LocalDateTime.now());
        
        return reviewRepository.save(review);
    }
    
    /**
     * Delete a review
     */
    public void deleteReview(Long reviewId, User user) {
        ProductReview review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found"));
        
        // Check if user owns this review or is admin
        if (!review.getUser().getId().equals(user.getId()) && !user.getRole().equals(User.Role.ADMIN)) {
            throw new RuntimeException("You can only delete your own reviews");
        }
        
        reviewRepository.delete(review);
    }
    
    /**
     * Get reviews for a product
     */
    public List<ProductReview> getReviewsByProductId(String productId) {
        return reviewRepository.findByProductIdOrderByCreatedAtDesc(productId);
    }
    
    /**
     * Get reviews by product ID and rating
     */
    public List<ProductReview> getReviewsByProductIdAndRating(String productId, Integer rating) {
        return reviewRepository.findByProductIdAndRatingOrderByCreatedAtDesc(productId, rating);
    }
    
    /**
     * Get reviews by user
     */
    public List<ProductReview> getReviewsByUser(User user) {
        return reviewRepository.findByUserOrderByCreatedAtDesc(user);
    }
    
    /**
     * Get review by ID
     */
    public Optional<ProductReview> getReviewById(Long id) {
        return reviewRepository.findById(id);
    }
    
    /**
     * Mark review as helpful
     */
    public ProductReview markReviewAsHelpful(Long reviewId) {
        ProductReview review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found"));
        
        review.setHelpfulCount(review.getHelpfulCount() + 1);
        return reviewRepository.save(review);
    }
    
    /**
     * Get product rating summary
     */
    public Map<String, Object> getProductRatingSummary(String productId) {
        Map<String, Object> summary = new HashMap<>();
        
        // Average rating
        Double averageRating = reviewRepository.getAverageRatingByProductId(productId);
        summary.put("averageRating", averageRating != null ? averageRating : 0.0);
        
        // Total reviews
        Long totalReviews = reviewRepository.countByProductId(productId);
        summary.put("totalReviews", totalReviews);
        
        // Rating distribution
        List<Object[]> distribution = reviewRepository.getRatingDistributionByProductId(productId);
        Map<Integer, Long> ratingDistribution = new HashMap<>();
        for (int i = 1; i <= 5; i++) {
            ratingDistribution.put(i, 0L);
        }
        for (Object[] row : distribution) {
            Integer rating = (Integer) row[0];
            Long count = (Long) row[1];
            ratingDistribution.put(rating, count);
        }
        summary.put("ratingDistribution", ratingDistribution);
        
        return summary;
    }
    
    /**
     * Get most helpful reviews
     */
    public List<ProductReview> getMostHelpfulReviews(String productId) {
        return reviewRepository.findByProductIdOrderByHelpfulCountDescCreatedAtDesc(productId);
    }
    
    /**
     * Get verified reviews
     */
    public List<ProductReview> getVerifiedReviews(String productId) {
        return reviewRepository.findByProductIdAndIsVerifiedTrueOrderByCreatedAtDesc(productId);
    }
    
    /**
     * Search reviews
     */
    public List<ProductReview> searchReviews(String productId, String searchTerm) {
        return reviewRepository.searchReviewsByProductId(productId, searchTerm);
    }
    
    /**
     * Check if user can review product
     */
    public boolean canUserReviewProduct(User user, String productId) {
        return !reviewRepository.existsByProductIdAndUser(productId, user);
    }
    
    /**
     * Get user's review for a product
     */
    public Optional<ProductReview> getUserReviewForProduct(User user, String productId) {
        return reviewRepository.findByProductIdAndUser(productId, user);
    }
}