package com.sanekey.repository;

import com.sanekey.model.Payment;
import com.sanekey.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    
    /**
     * Find payments by user
     */
    List<Payment> findByUserOrderByCreatedAtDesc(User user);
    
    /**
     * Find payments by user ID
     */
    List<Payment> findByUserIdOrderByCreatedAtDesc(Long userId);
    
    /**
     * Find payment by transaction ID
     */
    Optional<Payment> findByTransactionId(String transactionId);
    
    /**
     * Find payment by Stripe payment intent ID
     */
    Optional<Payment> findByStripePaymentIntentId(String stripePaymentIntentId);
    
    /**
     * Find payment by PayPal order ID
     */
    Optional<Payment> findByPaypalOrderId(String paypalOrderId);
    
    /**
     * Find payments by status
     */
    List<Payment> findByStatusOrderByCreatedAtDesc(Payment.PaymentStatus status);
    
    /**
     * Find payments by method
     */
    List<Payment> findByMethodOrderByCreatedAtDesc(Payment.PaymentMethod method);
    
    /**
     * Find payments within date range
     */
    List<Payment> findByCreatedAtBetweenOrderByCreatedAtDesc(LocalDateTime startDate, LocalDateTime endDate);
    
    /**
     * Find payments by user and status
     */
    List<Payment> findByUserAndStatusOrderByCreatedAtDesc(User user, Payment.PaymentStatus status);
    
    /**
     * Find payments by amount range
     */
    List<Payment> findByAmountBetweenOrderByCreatedAtDesc(BigDecimal minAmount, BigDecimal maxAmount);
    
    /**
     * Get total amount by user
     */
    @Query("SELECT SUM(p.amount) FROM Payment p WHERE p.user = :user AND p.status = 'COMPLETED'")
    BigDecimal getTotalAmountByUser(@Param("user") User user);
    
    /**
     * Get total amount by status
     */
    @Query("SELECT SUM(p.amount) FROM Payment p WHERE p.status = :status")
    BigDecimal getTotalAmountByStatus(@Param("status") Payment.PaymentStatus status);
    
    /**
     * Count payments by status
     */
    Long countByStatus(Payment.PaymentStatus status);
    
    /**
     * Count payments by user
     */
    Long countByUser(User user);
    
    /**
     * Find recent payments (last N days)
     */
    @Query("SELECT p FROM Payment p WHERE p.createdAt >= :date ORDER BY p.createdAt DESC")
    List<Payment> findRecentPayments(@Param("date") LocalDateTime date);
    
    /**
     * Find failed payments that can be retried
     */
    @Query("SELECT p FROM Payment p WHERE p.status = 'FAILED' AND p.createdAt >= :date ORDER BY p.createdAt DESC")
    List<Payment> findRetryableFailedPayments(@Param("date") LocalDateTime date);
    
    /**
     * Get monthly revenue
     */
    @Query("SELECT SUM(p.amount) FROM Payment p WHERE p.status = 'COMPLETED' AND YEAR(p.completedAt) = :year AND MONTH(p.completedAt) = :month")
    BigDecimal getMonthlyRevenue(@Param("year") int year, @Param("month") int month);
    
    /**
     * Get daily revenue
     */
    @Query("SELECT SUM(p.amount) FROM Payment p WHERE p.status = 'COMPLETED' AND DATE(p.completedAt) = DATE(:date)")
    BigDecimal getDailyRevenue(@Param("date") LocalDateTime date);
}