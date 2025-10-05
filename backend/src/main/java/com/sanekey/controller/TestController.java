package com.sanekey.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.DatabaseMetaData;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/test")
@CrossOrigin(origins = "*")
public class TestController {
    
    private static final Logger logger = LoggerFactory.getLogger(TestController.class);
    
    @Autowired
    private DataSource dataSource;
    
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> healthCheck() {
        logger.info("🔍 Health check endpoint called");
        
        Map<String, Object> response = new HashMap<>();
        response.put("status", "UP");
        response.put("message", "Backend API is running successfully");
        response.put("timestamp", System.currentTimeMillis());
        response.put("service", "Sanekey Store API");
        response.put("version", "1.0.0");
        
        logger.info("✅ Health check successful");
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/db")
    public ResponseEntity<Map<String, Object>> databaseCheck() {
        logger.info("🔍 Database connection test endpoint called");
        
        Map<String, Object> response = new HashMap<>();
        
        try (Connection connection = dataSource.getConnection()) {
            DatabaseMetaData metaData = connection.getMetaData();
            
            response.put("status", "CONNECTED");
            response.put("message", "Database connection successful");
            response.put("database", metaData.getDatabaseProductName());
            response.put("version", metaData.getDatabaseProductVersion());
            response.put("url", metaData.getURL());
            response.put("host", "localhost");
            response.put("port", "3307");
            response.put("timestamp", System.currentTimeMillis());
            
            // Test query
            try (var stmt = connection.createStatement()) {
                var rs = stmt.executeQuery("SELECT 1 as test, NOW() as current_time");
                if (rs.next()) {
                    response.put("queryTest", "SUCCESS");
                    response.put("currentTime", rs.getTimestamp("current_time").toString());
                }
            }
            
            // Check current database
            try (var stmt = connection.createStatement()) {
                var rs = stmt.executeQuery("SELECT DATABASE() as current_db");
                if (rs.next()) {
                    String currentDb = rs.getString("current_db");
                    response.put("currentDatabase", currentDb != null ? currentDb : "None");
                }
            }
            
            logger.info("✅ Database connection test successful");
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("❌ Database connection test failed: {}", e.getMessage());
            
            response.put("status", "ERROR");
            response.put("message", "Database connection failed");
            response.put("error", e.getMessage());
            response.put("timestamp", System.currentTimeMillis());
            
            return ResponseEntity.status(500).body(response);
        }
    }
    
    @GetMapping("/cors")
    public ResponseEntity<Map<String, Object>> corsTest() {
        logger.info("🔍 CORS test endpoint called");
        
        Map<String, Object> response = new HashMap<>();
        response.put("status", "OK");
        response.put("message", "CORS is working correctly");
        response.put("timestamp", System.currentTimeMillis());
        
        return ResponseEntity.ok(response);
    }
}