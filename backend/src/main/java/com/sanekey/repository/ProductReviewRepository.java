package com.sanekey.repository;

import com.sanekey.model.ProductReview;
import com.sanekey.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductReviewRepository extends JpaRepository<ProductReview, Long> {
    
    /**
     * Find reviews by product ID
     */
    List<ProductReview> findByProductIdOrderByCreatedAtDesc(String productId);
    
    /**
     * Find reviews by user
     */
    List<ProductReview> findByUserOrderByCreatedAtDesc(User user);
    
    /**
     * Find reviews by product ID and rating
     */
    List<ProductReview> findByProductIdAndRatingOrderByCreatedAtDesc(String productId, Integer rating);
    
    /**
     * Find reviews by product ID and user
     */
    Optional<ProductReview> findByProductIdAndUser(String productId, User user);
    
    /**
     * Check if user has reviewed a product
     */
    boolean existsByProductIdAndUser(String productId, User user);
    
    /**
     * Get average rating for a product
     */
    @Query("SELECT AVG(r.rating) FROM ProductReview r WHERE r.productId = :productId")
    Double getAverageRatingByProductId(@Param("productId") String productId);
    
    /**
     * Get total review count for a product
     */
    Long countByProductId(String productId);
    
    /**
     * Get rating distribution for a product
     */
    @Query("SELECT r.rating, COUNT(r) FROM ProductReview r WHERE r.productId = :productId GROUP BY r.rating ORDER BY r.rating DESC")
    List<Object[]> getRatingDistributionByProductId(@Param("productId") String productId);
    
    /**
     * Find most helpful reviews for a product
     */
    List<ProductReview> findByProductIdOrderByHelpfulCountDescCreatedAtDesc(String productId);
    
    /**
     * Find verified reviews for a product
     */
    List<ProductReview> findByProductIdAndIsVerifiedTrueOrderByCreatedAtDesc(String productId);
    
    /**
     * Find recent reviews (last N days)
     */
    @Query("SELECT r FROM ProductReview r WHERE r.createdAt >= :date ORDER BY r.createdAt DESC")
    List<ProductReview> findRecentReviews(@Param("date") java.time.LocalDateTime date);
    
    /**
     * Search reviews by title or comment
     */
    @Query("SELECT r FROM ProductReview r WHERE r.productId = :productId AND (LOWER(r.title) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR LOWER(r.comment) LIKE LOWER(CONCAT('%', :searchTerm, '%'))) ORDER BY r.createdAt DESC")
    List<ProductReview> searchReviewsByProductId(@Param("productId") String productId, @Param("searchTerm") String searchTerm);
}