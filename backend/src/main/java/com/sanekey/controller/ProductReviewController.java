package com.sanekey.controller;

import com.sanekey.model.ProductReview;
import com.sanekey.model.User;
import com.sanekey.service.ProductReviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/reviews")
@CrossOrigin(origins = "*", maxAge = 3600)
public class ProductReviewController {
    
    @Autowired
    private ProductReviewService reviewService;
    
    /**
     * Create a new review
     */
    @PostMapping
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<?> createReview(@RequestBody CreateReviewRequest request, Authentication authentication) {
        try {
            User user = (User) authentication.getPrincipal();
            
            ProductReview review = reviewService.createReview(
                user,
                request.getProductId(),
                request.getRating(),
                request.getTitle(),
                request.getComment(),
                request.getImages()
            );
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Review created successfully");
            response.put("review", new ReviewResponse(review));
            response.put("timestamp", LocalDateTime.now());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            error.put("timestamp", LocalDateTime.now());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    /**
     * Update an existing review
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<?> updateReview(@PathVariable Long id, @RequestBody UpdateReviewRequest request, Authentication authentication) {
        try {
            User user = (User) authentication.getPrincipal();
            
            ProductReview review = reviewService.updateReview(
                id,
                user,
                request.getRating(),
                request.getTitle(),
                request.getComment(),
                request.getImages()
            );
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Review updated successfully");
            response.put("review", new ReviewResponse(review));
            response.put("timestamp", LocalDateTime.now());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            error.put("timestamp", LocalDateTime.now());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    /**
     * Delete a review
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<?> deleteReview(@PathVariable Long id, Authentication authentication) {
        try {
            User user = (User) authentication.getPrincipal();
            reviewService.deleteReview(id, user);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Review deleted successfully");
            response.put("timestamp", LocalDateTime.now());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            error.put("timestamp", LocalDateTime.now());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    /**
     * Get reviews for a product
     */
    @GetMapping("/product/{productId}")
    public ResponseEntity<?> getProductReviews(@PathVariable String productId, @RequestParam(required = false) Integer rating) {
        try {
            List<ProductReview> reviews;
            
            if (rating != null) {
                reviews = reviewService.getReviewsByProductIdAndRating(productId, rating);
            } else {
                reviews = reviewService.getReviewsByProductId(productId);
            }
            
            List<ReviewResponse> reviewResponses = reviews.stream()
                    .map(ReviewResponse::new)
                    .collect(Collectors.toList());
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("reviews", reviewResponses);
            response.put("count", reviewResponses.size());
            response.put("timestamp", LocalDateTime.now());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Failed to get reviews");
            error.put("timestamp", LocalDateTime.now());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    /**
     * Get product rating summary
     */
    @GetMapping("/product/{productId}/summary")
    public ResponseEntity<?> getProductRatingSummary(@PathVariable String productId) {
        try {
            Map<String, Object> summary = reviewService.getProductRatingSummary(productId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("summary", summary);
            response.put("timestamp", LocalDateTime.now());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Failed to get rating summary");
            error.put("timestamp", LocalDateTime.now());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    /**
     * Mark review as helpful
     */
    @PostMapping("/{id}/helpful")
    public ResponseEntity<?> markReviewAsHelpful(@PathVariable Long id) {
        try {
            ProductReview review = reviewService.markReviewAsHelpful(id);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Review marked as helpful");
            response.put("helpfulCount", review.getHelpfulCount());
            response.put("timestamp", LocalDateTime.now());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            error.put("timestamp", LocalDateTime.now());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    /**
     * Get user's reviews
     */
    @GetMapping("/my-reviews")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<?> getUserReviews(Authentication authentication) {
        try {
            User user = (User) authentication.getPrincipal();
            List<ProductReview> reviews = reviewService.getReviewsByUser(user);
            
            List<ReviewResponse> reviewResponses = reviews.stream()
                    .map(ReviewResponse::new)
                    .collect(Collectors.toList());
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("reviews", reviewResponses);
            response.put("count", reviewResponses.size());
            response.put("timestamp", LocalDateTime.now());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Failed to get user reviews");
            error.put("timestamp", LocalDateTime.now());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    /**
     * Check if user can review product
     */
    @GetMapping("/can-review/{productId}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<?> canUserReviewProduct(@PathVariable String productId, Authentication authentication) {
        try {
            User user = (User) authentication.getPrincipal();
            boolean canReview = reviewService.canUserReviewProduct(user, productId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("canReview", canReview);
            response.put("timestamp", LocalDateTime.now());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Failed to check review eligibility");
            error.put("timestamp", LocalDateTime.now());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    // Request DTOs
    public static class CreateReviewRequest {
        private String productId;
        private Integer rating;
        private String title;
        private String comment;
        private List<String> images;
        
        // Getters and Setters
        public String getProductId() { return productId; }
        public void setProductId(String productId) { this.productId = productId; }
        public Integer getRating() { return rating; }
        public void setRating(Integer rating) { this.rating = rating; }
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public String getComment() { return comment; }
        public void setComment(String comment) { this.comment = comment; }
        public List<String> getImages() { return images; }
        public void setImages(List<String> images) { this.images = images; }
    }
    
    public static class UpdateReviewRequest {
        private Integer rating;
        private String title;
        private String comment;
        private List<String> images;
        
        // Getters and Setters
        public Integer getRating() { return rating; }
        public void setRating(Integer rating) { this.rating = rating; }
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public String getComment() { return comment; }
        public void setComment(String comment) { this.comment = comment; }
        public List<String> getImages() { return images; }
        public void setImages(List<String> images) { this.images = images; }
    }
    
    // Response DTO
    public static class ReviewResponse {
        private Long id;
        private String productId;
        private Integer rating;
        private String title;
        private String comment;
        private Boolean isVerified;
        private Integer helpfulCount;
        private List<String> images;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
        private UserInfo user;
        
        public ReviewResponse(ProductReview review) {
            this.id = review.getId();
            this.productId = review.getProductId();
            this.rating = review.getRating();
            this.title = review.getTitle();
            this.comment = review.getComment();
            this.isVerified = review.getIsVerified();
            this.helpfulCount = review.getHelpfulCount();
            this.images = review.getImages();
            this.createdAt = review.getCreatedAt();
            this.updatedAt = review.getUpdatedAt();
            this.user = new UserInfo(review.getUser());
        }
        
        // Getters
        public Long getId() { return id; }
        public String getProductId() { return productId; }
        public Integer getRating() { return rating; }
        public String getTitle() { return title; }
        public String getComment() { return comment; }
        public Boolean getIsVerified() { return isVerified; }
        public Integer getHelpfulCount() { return helpfulCount; }
        public List<String> getImages() { return images; }
        public LocalDateTime getCreatedAt() { return createdAt; }
        public LocalDateTime getUpdatedAt() { return updatedAt; }
        public UserInfo getUser() { return user; }
        
        public static class UserInfo {
            private Long id;
            private String fullName;
            private String avatarUrl;
            
            public UserInfo(User user) {
                this.id = user.getId();
                this.fullName = user.getFullName();
                this.avatarUrl = user.getAvatarUrl();
            }
            
            // Getters
            public Long getId() { return id; }
            public String getFullName() { return fullName; }
            public String getAvatarUrl() { return avatarUrl; }
        }
    }
}