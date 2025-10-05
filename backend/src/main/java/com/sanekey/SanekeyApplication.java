package com.sanekey;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@SpringBootApplication
public class SanekeyApplication {

    private static final Logger logger = LoggerFactory.getLogger(SanekeyApplication.class);

    public static void main(String[] args) {
        logger.info("🚀 Starting Sanekey Store Backend Application...");
        SpringApplication.run(SanekeyApplication.class, args);
    }

    @EventListener(ApplicationReadyEvent.class)
    public void onApplicationReady() {
        logger.info("=================================================");
        logger.info("🎉 Sanekey Store Backend Started Successfully!");
        logger.info("🌐 Server running on: http://localhost:8080");
        logger.info("📋 API Base URL: http://localhost:8080/api");
        logger.info("🔍 Health Check: http://localhost:8080/api/test/health");
        logger.info("🗄️ Database Test: http://localhost:8080/api/test/db");
        logger.info("=================================================");
        logger.info("📝 Available Endpoints:");
        logger.info("   GET  /api/test/health - Health check");
        logger.info("   GET  /api/test/db     - Database test");
        logger.info("   GET  /api/test/cors   - CORS test");
        logger.info("   POST /api/auth/signin - User login");
        logger.info("   POST /api/auth/signup - User registration");
        logger.info("=================================================");
    }
}