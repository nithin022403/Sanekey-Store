-- Sanekey Store Database Schema

-- Create database (run this separately if needed)
-- CREATE DATABASE IF NOT EXISTS sanekey_store;
-- USE sanekey_store;

-- Users table
CREATE TABLE IF NOT EXISTS users (
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
);

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
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
);

-- Products table (for future use)
CREATE TABLE IF NOT EXISTS products (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    image_url VARCHAR(500),
    category VARCHAR(100),
    stock INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_category (category),
    INDEX idx_price (price),
    INDEX idx_active (is_active),
    INDEX idx_created_at (created_at)
);

-- Orders table (for future use)
CREATE TABLE IF NOT EXISTS orders (
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
);

-- Order items table (for future use)
CREATE TABLE IF NOT EXISTS order_items (
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
);

-- Insert default admin user (password: admin123)
INSERT IGNORE INTO users (email, password, full_name, role, is_active) VALUES 
('admin@sanekey.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Admin User', 'ADMIN', TRUE);

-- Insert sample products
INSERT IGNORE INTO products (name, description, price, image_url, category, stock) VALUES 
('iPhone 15 Pro', 'The most advanced iPhone yet with titanium design and A17 Pro chip.', 999.99, 'https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg', 'smartphones', 25),
('MacBook Pro 16"', 'Supercharged by M3 Pro and M3 Max chips for demanding workflows.', 2499.99, 'https://images.pexels.com/photos/18105/pexels-photo.jpg', 'laptops', 15),
('AirPods Pro', 'Active Noise Cancellation and Spatial Audio for immersive sound.', 249.99, 'https://images.pexels.com/photos/3780681/pexels-photo-3780681.jpeg', 'headphones', 50),
('Apple Watch Ultra', 'The most rugged and capable Apple Watch for extreme adventures.', 799.99, 'https://images.pexels.com/photos/437037/pexels-photo-437037.jpeg', 'watches', 30),
('Sony A7R V', 'Professional mirrorless camera with 61MP full-frame sensor.', 3899.99, 'https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg', 'cameras', 8),
('PlayStation 5', 'Experience lightning-fast loading with an ultra-high speed SSD.', 499.99, 'https://images.pexels.com/photos/371924/pexels-photo-371924.jpeg', 'gaming', 12);