package com.sanekey.service;

import com.paypal.core.PayPalEnvironment;
import com.paypal.core.PayPalHttpClient;
import com.paypal.orders.*;
import com.sanekey.model.Payment;
import com.sanekey.model.User;
import com.sanekey.repository.PaymentRepository;
import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import jakarta.annotation.PostConstruct;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional
public class PaymentService {
    
    private static final Logger logger = LoggerFactory.getLogger(PaymentService.class);
    
    @Autowired
    private PaymentRepository paymentRepository;
    
    @Value("${stripe.secret.key}")
    private String stripeSecretKey;
    
    @Value("${paypal.client.id}")
    private String paypalClientId;
    
    @Value("${paypal.client.secret}")
    private String paypalClientSecret;
    
    @Value("${paypal.environment:sandbox}")
    private String paypalEnvironment;
    
    private PayPalHttpClient paypalClient;
    
    @PostConstruct
    public void init() {
        // Initialize Stripe
        if (stripeSecretKey != null && !stripeSecretKey.isEmpty() && !stripeSecretKey.equals("${STRIPE_SECRET_KEY:}")) {
            Stripe.apiKey = stripeSecretKey;
            logger.info("Stripe initialized successfully");
        } else {
            logger.warn("Stripe not initialized - no API key provided");
        }
        
        // Initialize PayPal
        if (paypalClientId != null && !paypalClientId.isEmpty() && 
            paypalClientSecret != null && !paypalClientSecret.isEmpty() &&
            !paypalClientId.equals("${PAYPAL_CLIENT_ID:}") &&
            !paypalClientSecret.equals("${PAYPAL_CLIENT_SECRET:}")) {
            PayPalEnvironment environment = paypalEnvironment.equals("live") 
                ? new PayPalEnvironment.Live(paypalClientId, paypalClientSecret)
                : new PayPalEnvironment.Sandbox(paypalClientId, paypalClientSecret);
            paypalClient = new PayPalHttpClient(environment);
            logger.info("PayPal initialized successfully");
        } else {
            logger.warn("PayPal not initialized - no client credentials provided");
        }
    }
    
    /**
     * Create a new payment record
     */
    public Payment createPayment(User user, BigDecimal amount, Payment.PaymentMethod method, String description) {
        Payment payment = new Payment(user, amount, method, description);
        payment.setTransactionId(generateTransactionId());
        return paymentRepository.save(payment);
    }
    
    /**
     * Create Stripe Payment Intent
     */
    public Payment createStripePayment(User user, BigDecimal amount, String description) throws StripeException {
        Payment payment = createPayment(user, amount, Payment.PaymentMethod.STRIPE, description);
        
        PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                .setAmount(amount.multiply(BigDecimal.valueOf(100)).longValue()) // Convert to cents
                .setCurrency("inr")
                .setDescription(description)
                .putMetadata("user_id", user.getId().toString())
                .putMetadata("payment_id", payment.getId().toString())
                .build();
        
        PaymentIntent paymentIntent = PaymentIntent.create(params);
        
        payment.setStripePaymentIntentId(paymentIntent.getId());
        payment.setStatus(Payment.PaymentStatus.PENDING);
        
        return paymentRepository.save(payment);
    }
    
    /**
     * Create PayPal Order
     */
    public Payment createPayPalPayment(User user, BigDecimal amount, String description) {
        try {
            Payment payment = createPayment(user, amount, Payment.PaymentMethod.PAYPAL, description);
            
            OrderRequest orderRequest = new OrderRequest();
            orderRequest.checkoutPaymentIntent("CAPTURE");
            
            ApplicationContext applicationContext = new ApplicationContext()
                    .brandName("Sanekey Store")
                    .landingPage("BILLING")
                    .userAction("PAY_NOW")
                    .returnUrl("http://localhost:3000/payment/success")
                    .cancelUrl("http://localhost:3000/payment/cancel");
            
            orderRequest.applicationContext(applicationContext);
            
            List<PurchaseUnitRequest> purchaseUnits = List.of(
                new PurchaseUnitRequest()
                    .referenceId(payment.getTransactionId())
                    .description(description)
                    .amountWithBreakdown(new AmountWithBreakdown()
                        .currencyCode("INR")
                        .value(amount.toString()))
            );
            
            orderRequest.purchaseUnits(purchaseUnits);
            
            OrdersCreateRequest request = new OrdersCreateRequest();
            request.requestBody(orderRequest);
            
            com.paypal.http.HttpResponse<Order> response = paypalClient.execute(request);
            Order order = response.result();
            
            payment.setPaypalOrderId(order.id());
            payment.setStatus(Payment.PaymentStatus.PENDING);
            
            return paymentRepository.save(payment);
            
        } catch (Exception e) {
            throw new RuntimeException("Failed to create PayPal payment: " + e.getMessage());
        }
    }
    
    /**
     * Confirm Stripe payment
     */
    public Payment confirmStripePayment(String paymentIntentId) throws StripeException {
        PaymentIntent paymentIntent = PaymentIntent.retrieve(paymentIntentId);
        
        Payment payment = paymentRepository.findByStripePaymentIntentId(paymentIntentId)
                .orElseThrow(() -> new RuntimeException("Payment not found"));
        
        if ("succeeded".equals(paymentIntent.getStatus())) {
            payment.setStatus(Payment.PaymentStatus.COMPLETED);
            payment.setCompletedAt(LocalDateTime.now());
        } else if ("payment_failed".equals(paymentIntent.getStatus())) {
            payment.setStatus(Payment.PaymentStatus.FAILED);
        }
        
        return paymentRepository.save(payment);
    }
    
    /**
     * Confirm PayPal payment
     */
    public Payment confirmPayPalPayment(String orderId) {
        try {
            Payment payment = paymentRepository.findByPaypalOrderId(orderId)
                    .orElseThrow(() -> new RuntimeException("Payment not found"));
            
            OrdersCaptureRequest request = new OrdersCaptureRequest(orderId);
            com.paypal.http.HttpResponse<Order> response = paypalClient.execute(request);
            Order order = response.result();
            
            if ("COMPLETED".equals(order.status())) {
                payment.setStatus(Payment.PaymentStatus.COMPLETED);
                payment.setCompletedAt(LocalDateTime.now());
            } else {
                payment.setStatus(Payment.PaymentStatus.FAILED);
            }
            
            return paymentRepository.save(payment);
            
        } catch (Exception e) {
            throw new RuntimeException("Failed to confirm PayPal payment: " + e.getMessage());
        }
    }
    
    /**
     * Get payment by ID
     */
    public Optional<Payment> getPaymentById(Long id) {
        return paymentRepository.findById(id);
    }
    
    /**
     * Get payments by user
     */
    public List<Payment> getPaymentsByUser(User user) {
        return paymentRepository.findByUserOrderByCreatedAtDesc(user);
    }
    
    /**
     * Get payments by user ID
     */
    public List<Payment> getPaymentsByUserId(Long userId) {
        return paymentRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }
    
    /**
     * Get payment by transaction ID
     */
    public Optional<Payment> getPaymentByTransactionId(String transactionId) {
        return paymentRepository.findByTransactionId(transactionId);
    }
    
    /**
     * Get payments by status
     */
    public List<Payment> getPaymentsByStatus(Payment.PaymentStatus status) {
        return paymentRepository.findByStatusOrderByCreatedAtDesc(status);
    }
    
    /**
     * Get total amount by user
     */
    public BigDecimal getTotalAmountByUser(User user) {
        BigDecimal total = paymentRepository.getTotalAmountByUser(user);
        return total != null ? total : BigDecimal.ZERO;
    }
    
    /**
     * Get monthly revenue
     */
    public BigDecimal getMonthlyRevenue(int year, int month) {
        BigDecimal revenue = paymentRepository.getMonthlyRevenue(year, month);
        return revenue != null ? revenue : BigDecimal.ZERO;
    }
    
    /**
     * Get daily revenue
     */
    public BigDecimal getDailyRevenue(LocalDateTime date) {
        BigDecimal revenue = paymentRepository.getDailyRevenue(date);
        return revenue != null ? revenue : BigDecimal.ZERO;
    }
    
    /**
     * Cancel payment
     */
    public Payment cancelPayment(Long paymentId) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new RuntimeException("Payment not found"));
        
        if (payment.getStatus() == Payment.PaymentStatus.PENDING) {
            payment.setStatus(Payment.PaymentStatus.CANCELLED);
            return paymentRepository.save(payment);
        } else {
            throw new RuntimeException("Cannot cancel payment with status: " + payment.getStatus());
        }
    }
    
    /**
     * Refund payment
     */
    public Payment refundPayment(Long paymentId) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new RuntimeException("Payment not found"));
        
        if (payment.getStatus() == Payment.PaymentStatus.COMPLETED) {
            // Here you would implement actual refund logic with Stripe/PayPal
            payment.setStatus(Payment.PaymentStatus.REFUNDED);
            return paymentRepository.save(payment);
        } else {
            throw new RuntimeException("Cannot refund payment with status: " + payment.getStatus());
        }
    }
    
    /**
     * Generate unique transaction ID
     */
    private String generateTransactionId() {
        return "TXN_" + System.currentTimeMillis() + "_" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }
}