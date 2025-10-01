package com.sanekey.config;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

import javax.sql.DataSource;
import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.beans.factory.annotation.Value;

@Configuration
public class DatabaseConfig {
    
    @Value("${spring.datasource.url:jdbc:mysql://localhost:3307/sanekey_store?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true&createDatabaseIfNotExist=true&autoReconnect=true&useUnicode=true&characterEncoding=UTF-8&connectTimeout=60000&socketTimeout=60000}")
    private String datasourceUrl;
    
    @Value("${spring.datasource.username:root}")
    private String datasourceUsername;
    
    @Value("${spring.datasource.password:nithin123}")
    private String datasourcePassword;
    
    @Value("${spring.datasource.driver-class-name:com.mysql.cj.jdbc.Driver}")
    private String datasourceDriverClassName;
    
    @Bean
    @Profile("!test")
    public DataSource dataSource() {
        DataSource dataSource = DataSourceBuilder.create()
                .url(datasourceUrl)
                .username(datasourceUsername)
                .password(datasourcePassword)
                .driverClassName(datasourceDriverClassName)
                .build();
        
        // Test connection on startup
        try (Connection connection = dataSource.getConnection()) {
            System.out.println("✅ Database connection successful!");
            System.out.println("📍 Connected to: " + connection.getMetaData().getURL());
        } catch (Exception e) {
            System.err.println("❌ Database connection failed: " + e.getMessage());
        }
        
        return dataSource;
    }
}