package com.sanekey.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.sql.DataSource;
import java.sql.Connection;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/test")
@CrossOrigin(origins = "*", maxAge = 3600)
public class TestController {
    
    @Autowired
    private DataSource dataSource;
    
    /**
     * Health check endpoint
     */
    @GetMapping("/health")
    public ResponseEntity<?> healthCheck() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "UP");
        response.put("message", "Sanekey Store API is running");
        response.put("timestamp", System.currentTimeMillis());
        return ResponseEntity.ok(response);
    }
    
    /**
     * Database connection test
     */
    @GetMapping("/db")
    public ResponseEntity<?> testDatabase() {
        Map<String, Object> response = new HashMap<>();
        
        try {
            try (Connection connection = dataSource.getConnection()) {
                boolean isValid = connection.isValid(10); // 10 second timeout
                
                response.put("database", "Connected");
                response.put("valid", isValid);
                response.put("url", connection.getMetaData().getURL());
                response.put("driver", connection.getMetaData().getDriverName());
                response.put("catalog", connection.getCatalog());
                response.put("status", "SUCCESS");
                response.put("port", "3307");
                response.put("host", "localhost");
                
                // Test a simple query
                try (var stmt = connection.createStatement()) {
                    var rs = stmt.executeQuery("SELECT 1 as test");
                    if (rs.next()) {
                        response.put("queryTest", "SUCCESS");
                    }
                }
            }
            
        } catch (Exception e) {
            response.put("database", "Failed");
            response.put("error", e.getMessage());
            response.put("errorType", e.getClass().getSimpleName());
            response.put("status", "ERROR");
            response.put("suggestion", "Check if MySQL is running on localhost:3307 with password 'nithin123'");
            return ResponseEntity.status(500).body(response);
        }
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * CORS test endpoint
     */
    @GetMapping("/cors")
    public ResponseEntity<?> testCors() {
        Map<String, Object> response = new HashMap<>();
        response.put("cors", "enabled");
        response.put("message", "CORS is working properly");
        response.put("allowedOrigins", "http://localhost:3000, http://localhost:5173");
        return ResponseEntity.ok(response);
    }
}