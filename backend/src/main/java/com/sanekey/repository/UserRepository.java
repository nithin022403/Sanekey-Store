package com.sanekey.repository;

import com.sanekey.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import jakarta.transaction.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    // ✅ Find user by email
    Optional<User> findByEmail(String email);

    // ✅ Check if email already exists
    Boolean existsByEmail(String email);

    // ✅ Get all active users
    List<User> findByIsActiveTrue();

    // ✅ Get users by role
    List<User> findByRole(User.Role role);

    // ✅ Users created after a date
    List<User> findByCreatedAtAfter(LocalDateTime date);

    // ✅ Search by full name (case insensitive)
    @Query("SELECT u FROM User u WHERE LOWER(u.fullName) LIKE LOWER(CONCAT('%', :name, '%'))")
    List<User> findByFullNameContainingIgnoreCase(@Param("name") String name);

    // ✅ Count active users
    @Query("SELECT COUNT(u) FROM User u WHERE u.isActive = true")
    Long countActiveUsers();

    // ✅ Recent users
    @Query("SELECT u FROM User u WHERE u.createdAt >= :date ORDER BY u.createdAt DESC")
    List<User> findRecentUsers(@Param("date") LocalDateTime date);

    // ❗ FIXED: Soft delete (IMPORTANT)
    @Modifying
    @Transactional
    @Query("UPDATE User u SET u.isActive = false, u.updatedAt = CURRENT_TIMESTAMP WHERE u.id = :id")
    int softDeleteById(@Param("id") Long id);
}