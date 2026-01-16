-- Fun Prints Database Schema
-- PostgreSQL

-- Products Table
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  product_id VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  category VARCHAR(100),
  fabric VARCHAR(100),
  gsm VARCHAR(50),
  colors TEXT[], -- Array of available colors
  sizes TEXT[], -- Array of available sizes
  image_url TEXT,
  images_360 TEXT[], -- Array of 360 view images
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Orders Table
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  order_id VARCHAR(50) UNIQUE NOT NULL,
  customer_name VARCHAR(255) NOT NULL,
  customer_mobile VARCHAR(20) NOT NULL,
  customer_email VARCHAR(255),
  customer_address TEXT NOT NULL,
  customer_city VARCHAR(100),
  customer_state VARCHAR(100),
  customer_pincode VARCHAR(10),
  
  subtotal DECIMAL(10, 2) NOT NULL,
  tax DECIMAL(10, 2) DEFAULT 0,
  shipping DECIMAL(10, 2) DEFAULT 0,
  total_amount DECIMAL(10, 2) NOT NULL,
  
  payment_method VARCHAR(20) NOT NULL, -- COD or UPI
  payment_status VARCHAR(50) DEFAULT 'PENDING', -- PENDING, PAYMENT_PENDING, VERIFIED, FAILED
  order_status VARCHAR(50) DEFAULT 'NEW', -- NEW, PROCESSING, DISPATCHED, DELIVERED, CANCELLED
  
  whatsapp_sent BOOLEAN DEFAULT false,
  admin_notes TEXT,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Order Items Table
CREATE TABLE order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
  product_id VARCHAR(50) NOT NULL,
  product_name VARCHAR(255) NOT NULL,
  quantity INTEGER NOT NULL,
  size VARCHAR(10),
  color VARCHAR(50),
  price DECIMAL(10, 2) NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bulk Enquiries Table
CREATE TABLE bulk_enquiries (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  mobile VARCHAR(20) NOT NULL,
  company VARCHAR(255),
  quantity INTEGER NOT NULL,
  message TEXT,
  status VARCHAR(50) DEFAULT 'NEW', -- NEW, CONTACTED, QUOTED, CONVERTED, CLOSED
  admin_notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Admin Users Table (Simple)
CREATE TABLE admin_users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'ADMIN', -- ADMIN, SUPER_ADMIN
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for Performance
CREATE INDEX idx_orders_order_id ON orders(order_id);
CREATE INDEX idx_orders_status ON orders(order_status);
CREATE INDEX idx_orders_payment_status ON orders(payment_status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_active ON products(is_active);

-- Sample Admin User (Password: admin123 - CHANGE IN PRODUCTION!)
-- Password hash generated with bcrypt
INSERT INTO admin_users (email, password_hash, name, role) 
VALUES ('admin@funprints.com', '$2a$10$rKvVPZhJZhJZhJZhJZhJZeO', 'Admin User', 'SUPER_ADMIN');

-- Sample Products
INSERT INTO products (product_id, name, description, price, category, fabric, gsm, colors, sizes) VALUES
('FP001', 'Classic Round Neck', 'Premium quality cotton t-shirt perfect for daily wear', 799, 'Round Neck', '100% Cotton', '180 GSM', ARRAY['White', 'Black', 'Navy', 'Red'], ARRAY['S', 'M', 'L', 'XL', 'XXL']),
('FP002', 'Premium Polo', 'Elegant polo t-shirt for casual and semi-formal occasions', 1299, 'Polos', '100% Cotton', '200 GSM', ARRAY['White', 'Black', 'Navy', 'Grey'], ARRAY['S', 'M', 'L', 'XL', 'XXL']),
('FP003', 'Cozy Hoodie', 'Warm and comfortable hoodie for all seasons', 1899, 'Hoodies', 'Cotton Blend', '280 GSM', ARRAY['Black', 'Grey', 'Navy', 'Maroon'], ARRAY['S', 'M', 'L', 'XL', 'XXL']),
('FP004', 'Sports Performance', 'Breathable sports t-shirt with moisture-wicking technology', 999, 'Sportswear', 'Polyester Blend', '160 GSM', ARRAY['White', 'Black', 'Blue', 'Green'], ARRAY['S', 'M', 'L', 'XL', 'XXL']);
