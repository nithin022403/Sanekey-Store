package com.sanekey.controller;

import com.sanekey.model.User;
import com.sanekey.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*", maxAge = 3600)
public class UserController {
    
    @Autowired
    private UserService userService;
    
    /**
     * Get current user profile
     */
    @GetMapping("/profile")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<?> getUserProfile(Authentication authentication) {
        try {
            User user = (User) authentication.getPrincipal();
            return ResponseEntity.ok(new UserResponse(user));
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Failed to get user profile");
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    /**
     * Update user profile
     */
    @PutMapping("/profile")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<?> updateUserProfile(
            @RequestBody UpdateProfileRequest request,
            Authentication authentication) {
        try {
            User currentUser = (User) authentication.getPrincipal();
            
            User updatedUser = userService.updateUserProfile(
                currentUser.getId(),
                request.getFullName(),
                request.getAvatarUrl()
            );
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Profile updated successfully");
            response.put("user", new UserResponse(updatedUser));
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Failed to update profile: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    /**
     * Change password
     */
    @PutMapping("/change-password")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<?> changePassword(
            @RequestBody ChangePasswordRequest request,
            Authentication authentication) {
        try {
            User currentUser = (User) authentication.getPrincipal();
            
            userService.changePassword(
                currentUser.getId(),
                request.getOldPassword(),
                request.getNewPassword()
            );
            
            Map<String, String> response = new HashMap<>();
            response.put("message", "Password changed successfully");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Failed to change password: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    /**
     * Deactivate user account
     */
    @PutMapping("/deactivate")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<?> deactivateAccount(Authentication authentication) {
        try {
            User currentUser = (User) authentication.getPrincipal();
            userService.deactivateUser(currentUser.getId());
            
            Map<String, String> response = new HashMap<>();
            response.put("message", "Account deactivated successfully");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Failed to deactivate account: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    /**
     * Get all users (Admin only)
     */
    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllUsers() {
        try {
            List<User> users = userService.getAllActiveUsers();
            List<UserResponse> userResponses = users.stream()
                    .map(UserResponse::new)
                    .collect(Collectors.toList());
            
            return ResponseEntity.ok(userResponses);
            
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Failed to get users");
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    /**
     * Get user by ID (Admin only)
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getUserById(@PathVariable Long id) {
        try {
            User user = userService.findById(id)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            return ResponseEntity.ok(new UserResponse(user));
            
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "User not found");
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    /**
     * Search users by name (Admin only)
     */
    @GetMapping("/search")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> searchUsers(@RequestParam String name) {
        try {
            List<User> users = userService.searchUsersByName(name);
            List<UserResponse> userResponses = users.stream()
                    .map(UserResponse::new)
                    .collect(Collectors.toList());
            
            return ResponseEntity.ok(userResponses);
            
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Search failed");
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    /**
     * Get user statistics (Admin only)
     */
    @GetMapping("/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getUserStats() {
        try {
            Long activeUsersCount = userService.getActiveUsersCount();
            List<User> recentUsers = userService.getRecentUsers();
            
            Map<String, Object> stats = new HashMap<>();
            stats.put("totalActiveUsers", activeUsersCount);
            stats.put("recentUsersCount", recentUsers.size());
            stats.put("recentUsers", recentUsers.stream()
                    .map(UserResponse::new)
                    .collect(Collectors.toList()));
            
            return ResponseEntity.ok(stats);
            
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Failed to get user statistics");
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    // Request DTOs
    public static class UpdateProfileRequest {
        private String fullName;
        private String avatarUrl;
        
        public String getFullName() { return fullName; }
        public void setFullName(String fullName) { this.fullName = fullName; }
        public String getAvatarUrl() { return avatarUrl; }
        public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }
    }
    
    public static class ChangePasswordRequest {
        private String oldPassword;
        private String newPassword;
        
        public String getOldPassword() { return oldPassword; }
        public void setOldPassword(String oldPassword) { this.oldPassword = oldPassword; }
        public String getNewPassword() { return newPassword; }
        public void setNewPassword(String newPassword) { this.newPassword = newPassword; }
    }
    
    // Response DTO
    public static class UserResponse {
        private Long id;
        private String email;
        private String fullName;
        private String avatarUrl;
        private User.Role role;
        private Boolean isActive;
        
        public UserResponse(User user) {
            this.id = user.getId();
            this.email = user.getEmail();
            this.fullName = user.getFullName();
            this.avatarUrl = user.getAvatarUrl();
            this.role = user.getRole();
            this.isActive = user.getIsActive();
        }
        
        // Getters
        public Long getId() { return id; }
        public String getEmail() { return email; }
        public String getFullName() { return fullName; }
        public String getAvatarUrl() { return avatarUrl; }
        public User.Role getRole() { return role; }
        public Boolean getIsActive() { return isActive; }
    }
}