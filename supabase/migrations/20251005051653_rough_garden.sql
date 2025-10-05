-- Sanekey Store Database Schema
-- MySQL Database Setup Script

-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS sanekey_store 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

-- Use the database
USE sanekey_store;

-- Drop tables if they exist (for clean setup)
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS users;

-- Create users table
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    avatar_url VARCHAR(500),
    role ENUM('USER', 'ADMIN') DEFAULT 'USER',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_email (email),
    INDEX idx_role (role),
    INDEX idx_active (is_active),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create payments table
CREATE TABLE payments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'INR',
    status ENUM('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED', 'REFUNDED') DEFAULT 'PENDING',
    method ENUM('STRIPE', 'PAYPAL', 'CREDIT_CARD', 'DEBIT_CARD', 'UPI', 'NET_BANKING'),
    stripe_payment_intent_id VARCHAR(255),
    paypal_order_id VARCHAR(255),
    transaction_id VARCHAR(255) UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_method (method),
    INDEX idx_transaction_id (transaction_id),
    INDEX idx_created_at (created_at),
    INDEX idx_completed_at (completed_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create products table
CREATE TABLE products (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    original_price DECIMAL(10, 2),
    image_url VARCHAR(500),
    category VARCHAR(100),
    stock INT DEFAULT 0,
    rating DECIMAL(2, 1) DEFAULT 0.0,
    review_count INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_category (category),
    INDEX idx_price (price),
    INDEX idx_active (is_active),
    INDEX idx_rating (rating),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create orders table
CREATE TABLE orders (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    payment_id BIGINT,
    total_amount DECIMAL(10, 2) NOT NULL,
    status ENUM('PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED') DEFAULT 'PENDING',
    shipping_address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_payment_id (payment_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create order_items table
CREATE TABLE order_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    INDEX idx_order_id (order_id),
    INDEX idx_product_id (product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default admin user (password: admin123)
-- Password hash for 'admin123' using BCrypt
INSERT INTO users (email, password, full_name, role, is_active) VALUES 
('admin@sanekey.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Admin User', 'ADMIN', TRUE);

-- Insert test user (password: test123)
-- Password hash for 'test123' using BCrypt
INSERT INTO users (email, password, full_name, role, is_active) VALUES 
('test@sanekey.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Test User', 'USER', TRUE);

-- Insert sample products
INSERT INTO products (name, description, price, original_price, image_url, category, stock, rating, review_count) VALUES 
('Elegant Silk Scarf', 'Luxurious silk scarf perfect for any occasion. Made from 100% pure silk with elegant patterns and hand-finished edges.', 89.99, 119.99, 'https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=400', 'women', 25, 4.8, 156),
('Winter Wool Coat', 'Warm and stylish wool coat for winter. Premium wool blend with modern tailoring and water-resistant finish.', 299.99, NULL, 'https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=400', 'women', 15, 4.6, 89),
('Floral Summer Dress', 'Beautiful floral dress perfect for summer occasions. Lightweight and comfortable fabric with breathable design.', 129.99, NULL, 'https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=400', 'women', 30, 4.7, 203),
('Classic Leather Jacket', 'Timeless leather jacket crafted from genuine leather. Perfect for casual and semi-formal occasions.', 399.99, 499.99, 'https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=400', 'men', 20, 4.9, 312),
('Cotton Dress Shirt', 'Premium cotton dress shirt for professional and formal occasions. Wrinkle-resistant fabric with tailored fit.', 79.99, NULL, 'https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=400', 'men', 40, 4.4, 127),
('Wool Blazer', 'Sophisticated wool blazer for business and formal events. Modern cut with classic styling and premium materials.', 249.99, NULL, 'https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=400', 'men', 18, 4.5, 98),
('Leather Wallet', 'Premium leather wallet with multiple card slots and bill compartments. Compact design with RFID blocking.', 59.99, NULL, 'https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=400', 'accessories', 50, 4.6, 245),
('Designer Cap', 'Stylish designer cap perfect for casual wear. Adjustable fit with premium materials and UV protection.', 39.99, NULL, 'https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=400', 'accessories', 35, 4.3, 78),
('Laptop Case', 'Protective laptop case with padded interior. Water-resistant design that fits most 13-15 inch laptops.', 89.99, NULL, 'https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=400', 'accessories', 25, 4.7, 156),
('Sale Scarf', 'Beautiful scarf at a discounted price. Limited time offer on this premium accessory with elegant design.', 44.99, 89.99, 'https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=400', 'sale', 15, 4.5, 89),
('Digital Gift Card ₹1000', 'Perfect gift for any occasion. Digital delivery within minutes of purchase with custom message option.', 1000.00, NULL, 'https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=400', 'gift-card', 999, 5.0, 45),
('Digital Gift Card ₹2500', 'Premium gift card value for special occasions. Digital delivery with custom message and premium packaging.', 2500.00, NULL, 'https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=400', 'gift-card', 999, 5.0, 32);

-- Verify the setup
SELECT 'Database setup completed successfully!' as status;
SELECT COUNT(*) as user_count FROM users;
SELECT COUNT(*) as product_count FROM products;

-- Show table structure
SHOW TABLES;