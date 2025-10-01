package com.sanekey.controller;

import com.sanekey.model.Payment;
import com.sanekey.model.User;
import com.sanekey.service.PaymentService;
import com.stripe.exception.StripeException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = "*", maxAge = 3600)
public class PaymentController {
    
    @Autowired
    private PaymentService paymentService;
    
    /**
     * Create Stripe payment
     */
    @PostMapping("/stripe/create")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<?> createStripePayment(
            @RequestBody CreatePaymentRequest request,
            Authentication authentication) {
        try {
            if (request.getAmount() == null || request.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "Invalid payment amount");
                return ResponseEntity.badRequest().body(error);
            }
            
            User user = (User) authentication.getPrincipal();
            
            Payment payment = paymentService.createStripePayment(
                user,
                request.getAmount(),
                request.getDescription()
            );
            
            Map<String, Object> response = new HashMap<>();
            response.put("payment", new PaymentResponse(payment));
            response.put("message", "Stripe payment created successfully");
            
            return ResponseEntity.ok(response);
            
        } catch (StripeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Stripe error: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Failed to create payment: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    /**
     * Create PayPal payment
     */
    @PostMapping("/paypal/create")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<?> createPayPalPayment(
            @RequestBody CreatePaymentRequest request,
            Authentication authentication) {
        try {
            if (request.getAmount() == null || request.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "Invalid payment amount");
                return ResponseEntity.badRequest().body(error);
            }
            
            User user = (User) authentication.getPrincipal();
            
            Payment payment = paymentService.createPayPalPayment(
                user,
                request.getAmount(),
                request.getDescription()
            );
            
            Map<String, Object> response = new HashMap<>();
            response.put("payment", new PaymentResponse(payment));
            response.put("message", "PayPal payment created successfully");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Failed to create PayPal payment: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    /**
     * Confirm Stripe payment
     */
    @PostMapping("/stripe/confirm")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<?> confirmStripePayment(@RequestBody ConfirmStripePaymentRequest request) {
        try {
            Payment payment = paymentService.confirmStripePayment(request.getPaymentIntentId());
            
            Map<String, Object> response = new HashMap<>();
            response.put("payment", new PaymentResponse(payment));
            response.put("message", "Payment confirmed successfully");
            
            return ResponseEntity.ok(response);
            
        } catch (StripeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Stripe error: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Failed to confirm payment: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    /**
     * Confirm PayPal payment
     */
    @PostMapping("/paypal/confirm")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<?> confirmPayPalPayment(@RequestBody ConfirmPayPalPaymentRequest request) {
        try {
            Payment payment = paymentService.confirmPayPalPayment(request.getOrderId());
            
            Map<String, Object> response = new HashMap<>();
            response.put("payment", new PaymentResponse(payment));
            response.put("message", "PayPal payment confirmed successfully");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Failed to confirm PayPal payment: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    /**
     * Get user's payment history
     */
    @GetMapping("/history")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<?> getPaymentHistory(Authentication authentication) {
        try {
            User user = (User) authentication.getPrincipal();
            List<Payment> payments = paymentService.getPaymentsByUser(user);
            
            List<PaymentResponse> paymentResponses = payments.stream()
                    .map(PaymentResponse::new)
                    .collect(Collectors.toList());
            
            return ResponseEntity.ok(paymentResponses);
            
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Failed to get payment history");
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    /**
     * Get payment by ID
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<?> getPaymentById(@PathVariable Long id, Authentication authentication) {
        try {
            Payment payment = paymentService.getPaymentById(id)
                    .orElseThrow(() -> new RuntimeException("Payment not found"));
            
            User user = (User) authentication.getPrincipal();
            
            // Check if user owns this payment or is admin
            if (!payment.getUser().getId().equals(user.getId()) && 
                !user.getRole().equals(User.Role.ADMIN)) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "Access denied");
                return ResponseEntity.status(403).body(error);
            }
            
            return ResponseEntity.ok(new PaymentResponse(payment));
            
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Payment not found");
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    /**
     * Cancel payment
     */
    @PutMapping("/{id}/cancel")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<?> cancelPayment(@PathVariable Long id, Authentication authentication) {
        try {
            Payment payment = paymentService.getPaymentById(id)
                    .orElseThrow(() -> new RuntimeException("Payment not found"));
            
            User user = (User) authentication.getPrincipal();
            
            // Check if user owns this payment or is admin
            if (!payment.getUser().getId().equals(user.getId()) && 
                !user.getRole().equals(User.Role.ADMIN)) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "Access denied");
                return ResponseEntity.status(403).body(error);
            }
            
            Payment cancelledPayment = paymentService.cancelPayment(id);
            
            Map<String, Object> response = new HashMap<>();
            response.put("payment", new PaymentResponse(cancelledPayment));
            response.put("message", "Payment cancelled successfully");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Failed to cancel payment: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    /**
     * Get all payments (Admin only)
     */
    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllPayments() {
        try {
            List<Payment> payments = paymentService.getPaymentsByStatus(null); // Get all
            List<PaymentResponse> paymentResponses = payments.stream()
                    .map(PaymentResponse::new)
                    .collect(Collectors.toList());
            
            return ResponseEntity.ok(paymentResponses);
            
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Failed to get payments");
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    /**
     * Get payment statistics (Admin only)
     */
    @GetMapping("/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getPaymentStats() {
        try {
            BigDecimal monthlyRevenue = paymentService.getMonthlyRevenue(
                LocalDateTime.now().getYear(),
                LocalDateTime.now().getMonthValue()
            );
            
            BigDecimal dailyRevenue = paymentService.getDailyRevenue(LocalDateTime.now());
            
            Map<String, Object> stats = new HashMap<>();
            stats.put("monthlyRevenue", monthlyRevenue);
            stats.put("dailyRevenue", dailyRevenue);
            
            return ResponseEntity.ok(stats);
            
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Failed to get payment statistics");
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    // Request DTOs
    public static class CreatePaymentRequest {
        private BigDecimal amount;
        private String description;
        
        public BigDecimal getAmount() { return amount; }
        public void setAmount(BigDecimal amount) { this.amount = amount; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
    }
    
    public static class ConfirmStripePaymentRequest {
        private String paymentIntentId;
        
        public String getPaymentIntentId() { return paymentIntentId; }
        public void setPaymentIntentId(String paymentIntentId) { this.paymentIntentId = paymentIntentId; }
    }
    
    public static class ConfirmPayPalPaymentRequest {
        private String orderId;
        
        public String getOrderId() { return orderId; }
        public void setOrderId(String orderId) { this.orderId = orderId; }
    }
    
    // Response DTO
    public static class PaymentResponse {
        private Long id;
        private BigDecimal amount;
        private String currency;
        private Payment.PaymentStatus status;
        private Payment.PaymentMethod method;
        private String transactionId;
        private String description;
        private LocalDateTime createdAt;
        private LocalDateTime completedAt;
        
        public PaymentResponse(Payment payment) {
            this.id = payment.getId();
            this.amount = payment.getAmount();
            this.currency = payment.getCurrency();
            this.status = payment.getStatus();
            this.method = payment.getMethod();
            this.transactionId = payment.getTransactionId();
            this.description = payment.getDescription();
            this.createdAt = payment.getCreatedAt();
            this.completedAt = payment.getCompletedAt();
        }
        
        // Getters
        public Long getId() { return id; }
        public BigDecimal getAmount() { return amount; }
        public String getCurrency() { return currency; }
        public Payment.PaymentStatus getStatus() { return status; }
        public Payment.PaymentMethod getMethod() { return method; }
        public String getTransactionId() { return transactionId; }
        public String getDescription() { return description; }
        public LocalDateTime getCreatedAt() { return createdAt; }
        public LocalDateTime getCompletedAt() { return completedAt; }
    }
}