package com.sanekey.controller;

import com.sanekey.config.JwtUtils;
import com.sanekey.model.User;
import com.sanekey.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173", "https://sanekey-store-13nf.bolt.host"}, maxAge = 3600)
public class AuthController {
    
    @Autowired
    private AuthenticationManager authenticationManager;
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private JwtUtils jwtUtils;
    
    /**
     * User sign in endpoint
     */
    @PostMapping("/signin")
    public ResponseEntity<?> signInUser(@Valid @RequestBody SignInRequest signInRequest) {
        try {
            // Authenticate user credentials
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                    signInRequest.getEmail(), 
                    signInRequest.getPassword()
                )
            );
            
            // Set authentication in security context
            SecurityContextHolder.getContext().setAuthentication(authentication);
            
            // Generate JWT token
            String jwt = jwtUtils.generateJwtToken(authentication);
            
            // Get user details
            User user = (User) authentication.getPrincipal();
            
            // Prepare response
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Sign in successful");
            response.put("token", jwt);
            response.put("tokenType", "Bearer");
            response.put("user", new UserResponse(user));
            response.put("timestamp", LocalDateTime.now());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Invalid email or password");
            error.put("timestamp", LocalDateTime.now());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    /**
     * User sign up endpoint
     */
    @PostMapping("/signup")
    public ResponseEntity<?> signUpUser(@Valid @RequestBody SignUpRequest signUpRequest) {
        try {
            // Check if email already exists
            if (userService.existsByEmail(signUpRequest.getEmail())) {
                Map<String, Object> error = new HashMap<>();
                error.put("success", false);
                error.put("message", "Email is already registered!");
                error.put("timestamp", LocalDateTime.now());
                return ResponseEntity.badRequest().body(error);
            }
            
            // Validate password strength
            if (signUpRequest.getPassword().length() < 6) {
                Map<String, Object> error = new HashMap<>();
                error.put("success", false);
                error.put("message", "Password must be at least 6 characters long");
                error.put("timestamp", LocalDateTime.now());
                return ResponseEntity.badRequest().body(error);
            }
            
            // Register new user
            User user = userService.registerUser(
                signUpRequest.getEmail(),
                signUpRequest.getPassword(),
                signUpRequest.getFullName()
            );
            
            // Auto sign in after registration
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                    signUpRequest.getEmail(), 
                    signUpRequest.getPassword()
                )
            );
            
            SecurityContextHolder.getContext().setAuthentication(authentication);
            String jwt = jwtUtils.generateJwtToken(authentication);
            
            // Prepare response
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Account created successfully!");
            response.put("token", jwt);
            response.put("tokenType", "Bearer");
            response.put("user", new UserResponse(user));
            response.put("timestamp", LocalDateTime.now());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Registration failed: " + e.getMessage());
            error.put("timestamp", LocalDateTime.now());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    /**
     * User sign out endpoint
     */
    @PostMapping("/signout")
    public ResponseEntity<?> signOutUser() {
        try {
            // Clear security context
            SecurityContextHolder.clearContext();
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Sign out successful");
            response.put("timestamp", LocalDateTime.now());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Sign out failed");
            error.put("timestamp", LocalDateTime.now());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    /**
     * Validate JWT token endpoint
     */
    @GetMapping("/validate")
    public ResponseEntity<?> validateToken(@RequestHeader("Authorization") String authHeader) {
        try {
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                String jwt = authHeader.substring(7);
                
                if (jwtUtils.validateJwtToken(jwt)) {
                    String email = jwtUtils.getUserNameFromJwtToken(jwt);
                    User user = userService.findByEmail(email)
                            .orElseThrow(() -> new RuntimeException("User not found"));
                    
                    Map<String, Object> response = new HashMap<>();
                    response.put("success", true);
                    response.put("valid", true);
                    response.put("user", new UserResponse(user));
                    response.put("timestamp", LocalDateTime.now());
                    
                    return ResponseEntity.ok(response);
                }
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("valid", false);
            response.put("message", "Invalid or expired token");
            response.put("timestamp", LocalDateTime.now());
            
            return ResponseEntity.badRequest().body(response);
            
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("valid", false);
            response.put("message", "Token validation failed");
            response.put("timestamp", LocalDateTime.now());
            
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    /**
     * Get current user endpoint
     */
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(Authentication authentication) {
        try {
            if (authentication != null && authentication.isAuthenticated()) {
                User user = (User) authentication.getPrincipal();
                
                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("user", new UserResponse(user));
                response.put("timestamp", LocalDateTime.now());
                
                return ResponseEntity.ok(response);
            }
            
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "User not authenticated");
            error.put("timestamp", LocalDateTime.now());
            
            return ResponseEntity.status(401).body(error);
            
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Failed to get user information");
            error.put("timestamp", LocalDateTime.now());
            
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    // Request DTOs
    public static class SignInRequest {
        private String email;
        private String password;
        
        // Getters and Setters
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }
    
    public static class SignUpRequest {
        private String email;
        private String password;
        private String fullName;
        
        // Getters and Setters
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
        public String getFullName() { return fullName; }
        public void setFullName(String fullName) { this.fullName = fullName; }
    }
    
    // Response DTO
    public static class UserResponse {
        private Long id;
        private String email;
        private String fullName;
        private String avatarUrl;
        private User.Role role;
        private LocalDateTime createdAt;
        
        public UserResponse(User user) {
            this.id = user.getId();
            this.email = user.getEmail();
            this.fullName = user.getFullName();
            this.avatarUrl = user.getAvatarUrl();
            this.role = user.getRole();
            this.createdAt = user.getCreatedAt();
        }
        
        // Getters
        public Long getId() { return id; }
        public String getEmail() { return email; }
        public String getFullName() { return fullName; }
        public String getAvatarUrl() { return avatarUrl; }
        public User.Role getRole() { return role; }
        public LocalDateTime getCreatedAt() { return createdAt; }
    }
}