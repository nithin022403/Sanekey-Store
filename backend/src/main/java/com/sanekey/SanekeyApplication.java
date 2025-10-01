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
        logger.info("Starting Sanekey Store Application...");
        SpringApplication.run(SanekeyApplication.class, args);
    }
    
    @EventListener(ApplicationReadyEvent.class)
    public void onApplicationReady() {
        logger.info("=================================================");
        logger.info("🚀 Sanekey Store Backend is ready!");
        logger.info("📍 Server running on: http://localhost:8080");
        logger.info("🔗 API Base URL: http://localhost:8080/api");
        logger.info("🏥 Health Check: http://localhost:8080/api/test/health");
        logger.info("💾 Database Test: http://localhost:8080/api/test/db");
        logger.info("🔧 Database: MySQL on localhost:3307");
        logger.info("👤 Database User: root");
        logger.info("🗄️ Database Name: sanekey_store");
        logger.info("=================================================");
    }

}