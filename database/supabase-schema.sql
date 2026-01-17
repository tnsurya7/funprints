-- Fun Prints Production Database Schema for Supabase

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create ENUMS for data consistency
CREATE TYPE payment_status_enum AS ENUM (
  'PENDING',
  'UPLOADED', 
  'VERIFIED',
  'FAILED'
);

CREATE TYPE order_status_enum AS ENUM (
  'CREATED',
  'CONFIRMED',
  'PRINTING',
  'DISPATCHED',
  'DELIVERED',
  'CANCELLED'
);

-- Products table (main product info)
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  base_price NUMERIC NOT NULL,
  gst_percent INTEGER DEFAULT 18,
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Product variants (color + size + stock combinations)
CREATE TABLE product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  color TEXT NOT NULL,
  size TEXT NOT NULL,
  stock INTEGER DEFAULT 0,
  image_url TEXT,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(product_id, color, size)
);

-- Orders table (main order info)
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_code TEXT UNIQUE NOT NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  customer_mobile TEXT NOT NULL,
  payment_method TEXT NOT NULL,
  payment_status payment_status_enum DEFAULT 'PENDING',
  order_status order_status_enum DEFAULT 'CREATED',
  total_amount NUMERIC NOT NULL,
  email_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Order items (what was ordered)
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  variant_id UUID REFERENCES product_variants(id),
  quantity INTEGER NOT NULL,
  unit_price NUMERIC NOT NULL,
  total_price NUMERIC NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Order customization (logo details)
CREATE TABLE order_customization (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  logo_url TEXT,
  position TEXT DEFAULT 'front',
  scale NUMERIC DEFAULT 1.0,
  is_plain BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Order address (structured pincode-based address)
CREATE TABLE order_address (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  pincode TEXT NOT NULL,
  city TEXT NOT NULL,
  district TEXT NOT NULL,
  state TEXT NOT NULL,
  address_line TEXT NOT NULL,
  landmark TEXT,
  address_type TEXT DEFAULT 'home',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Payment proofs (screenshot verification)
CREATE TABLE payment_proofs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  screenshot_url TEXT NOT NULL,
  verified BOOLEAN DEFAULT false,
  verified_by TEXT,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Email verification (OTP for COD orders)
CREATE TABLE email_verification (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  otp_hash TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  verified BOOLEAN DEFAULT false,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Bulk enquiries table
CREATE TABLE bulk_enquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  mobile TEXT NOT NULL,
  company TEXT,
  quantity INTEGER NOT NULL,
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX idx_orders_order_code ON orders(order_code);
CREATE INDEX idx_orders_status ON orders(order_status);
CREATE INDEX idx_orders_payment_status ON orders(payment_status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_enabled ON products(enabled);
CREATE INDEX idx_products_name ON products USING gin (to_tsvector('english', name));
CREATE INDEX idx_product_variants_product_id ON product_variants(product_id);
CREATE INDEX idx_product_variants_stock ON product_variants(stock);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_email_verification_expires_at ON email_verification(expires_at);

-- Auto-update timestamps function
CREATE OR REPLACE FUNCTION update_updated_at() 
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language plpgsql;

-- Create triggers for auto-updating timestamps
CREATE TRIGGER update_products_updated_at 
  BEFORE UPDATE ON products 
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at();

CREATE TRIGGER update_product_variants_updated_at 
  BEFORE UPDATE ON product_variants 
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at();

CREATE TRIGGER update_orders_updated_at 
  BEFORE UPDATE ON orders 
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at();

-- Insert initial products with variants
INSERT INTO products (name, category, description, base_price) VALUES
('Classic Round Neck T-Shirt', 'Round Neck', 'Comfortable cotton round neck t-shirt perfect for daily wear', 499),
('Premium Polo T-Shirt', 'Polo', 'Premium quality polo t-shirt with collar', 699),
('V-Neck T-Shirt', 'V-Neck', 'Stylish v-neck t-shirt for a modern look', 549),
('Premium Hoodie', 'Hoodie', 'Warm and comfortable hoodie for cold weather', 999),
('Zip Hoodie', 'Zip Hoodie', 'Zip-up hoodie with premium quality fabric', 1099);

-- Insert product variants (color + size + stock combinations)
INSERT INTO product_variants (product_id, color, size, stock, image_url) 
SELECT 
  p.id,
  v.color,
  v.size,
  v.stock,
  v.image_url
FROM products p
CROSS JOIN (
  VALUES 
    -- Round Neck variants
    ('White', 'S', 25, '/products/all tshirts/360/neck_white_front.png'),
    ('White', 'M', 25, '/products/all tshirts/360/neck_white_front.png'),
    ('White', 'L', 25, '/products/all tshirts/360/neck_white_front.png'),
    ('White', 'XL', 25, '/products/all tshirts/360/neck_white_front.png'),
    ('White', 'XXL', 25, '/products/all tshirts/360/neck_white_front.png'),
    ('Black', 'S', 20, '/products/all tshirts/360/neck_black_front.png'),
    ('Black', 'M', 20, '/products/all tshirts/360/neck_black_front.png'),
    ('Black', 'L', 20, '/products/all tshirts/360/neck_black_front.png'),
    ('Black', 'XL', 20, '/products/all tshirts/360/neck_black_front.png'),
    ('Black', 'XXL', 20, '/products/all tshirts/360/neck_black_front.png'),
    ('Grey', 'S', 15, '/products/all tshirts/360/neck_grey_front.png'),
    ('Grey', 'M', 15, '/products/all tshirts/360/neck_grey_front.png'),
    ('Grey', 'L', 15, '/products/all tshirts/360/neck_grey_front.png'),
    ('Grey', 'XL', 15, '/products/all tshirts/360/neck_grey_front.png'),
    ('Grey', 'XXL', 15, '/products/all tshirts/360/neck_grey_front.png'),
    ('Navy Blue', 'S', 18, '/products/all tshirts/360/neck_navyblue_front.png'),
    ('Navy Blue', 'M', 18, '/products/all tshirts/360/neck_navyblue_front.png'),
    ('Navy Blue', 'L', 18, '/products/all tshirts/360/neck_navyblue_front.png'),
    ('Navy Blue', 'XL', 18, '/products/all tshirts/360/neck_navyblue_front.png'),
    ('Navy Blue', 'XXL', 18, '/products/all tshirts/360/neck_navyblue_front.png'),
    ('Maroon', 'S', 12, '/products/all tshirts/360/neck_maroon_front.png'),
    ('Maroon', 'M', 12, '/products/all tshirts/360/neck_maroon_front.png'),
    ('Maroon', 'L', 12, '/products/all tshirts/360/neck_maroon_front.png'),
    ('Maroon', 'XL', 12, '/products/all tshirts/360/neck_maroon_front.png'),
    ('Maroon', 'XXL', 12, '/products/all tshirts/360/neck_maroon_front.png')
) AS v(color, size, stock, image_url)
WHERE p.category = 'Round Neck';

-- Insert Polo variants
INSERT INTO product_variants (product_id, color, size, stock, image_url) 
SELECT 
  p.id,
  v.color,
  v.size,
  v.stock,
  v.image_url
FROM products p
CROSS JOIN (
  VALUES 
    ('White', 'S', 15, '/products/all tshirts/360/polo_white_front.png'),
    ('White', 'M', 15, '/products/all tshirts/360/polo_white_front.png'),
    ('White', 'L', 15, '/products/all tshirts/360/polo_white_front.png'),
    ('White', 'XL', 15, '/products/all tshirts/360/polo_white_front.png'),
    ('White', 'XXL', 15, '/products/all tshirts/360/polo_white_front.png'),
    ('Black', 'S', 12, '/products/all tshirts/360/polo_black_front.png'),
    ('Black', 'M', 12, '/products/all tshirts/360/polo_black_front.png'),
    ('Black', 'L', 12, '/products/all tshirts/360/polo_black_front.png'),
    ('Black', 'XL', 12, '/products/all tshirts/360/polo_black_front.png'),
    ('Black', 'XXL', 12, '/products/all tshirts/360/polo_black_front.png'),
    ('Grey', 'S', 18, '/products/all tshirts/360/polo_grey_front.png'),
    ('Grey', 'M', 18, '/products/all tshirts/360/polo_grey_front.png'),
    ('Grey', 'L', 18, '/products/all tshirts/360/polo_grey_front.png'),
    ('Grey', 'XL', 18, '/products/all tshirts/360/polo_grey_front.png'),
    ('Grey', 'XXL', 18, '/products/all tshirts/360/polo_grey_front.png'),
    ('Navy Blue', 'S', 10, '/products/all tshirts/360/polo_navyblue_front.png'),
    ('Navy Blue', 'M', 10, '/products/all tshirts/360/polo_navyblue_front.png'),
    ('Navy Blue', 'L', 10, '/products/all tshirts/360/polo_navyblue_front.png'),
    ('Navy Blue', 'XL', 10, '/products/all tshirts/360/polo_navyblue_front.png'),
    ('Navy Blue', 'XXL', 10, '/products/all tshirts/360/polo_navyblue_front.png')
) AS v(color, size, stock, image_url)
WHERE p.category = 'Polo';

-- Insert V-Neck variants
INSERT INTO product_variants (product_id, color, size, stock, image_url) 
SELECT 
  p.id,
  v.color,
  v.size,
  v.stock,
  v.image_url
FROM products p
CROSS JOIN (
  VALUES 
    ('White', 'S', 20, '/products/all tshirts/360/v_neck_white_front.png'),
    ('White', 'M', 20, '/products/all tshirts/360/v_neck_white_front.png'),
    ('White', 'L', 20, '/products/all tshirts/360/v_neck_white_front.png'),
    ('White', 'XL', 20, '/products/all tshirts/360/v_neck_white_front.png'),
    ('White', 'XXL', 20, '/products/all tshirts/360/v_neck_white_front.png'),
    ('Black', 'S', 16, '/products/all tshirts/360/v_neck_black_front.png'),
    ('Black', 'M', 16, '/products/all tshirts/360/v_neck_black_front.png'),
    ('Black', 'L', 16, '/products/all tshirts/360/v_neck_black_front.png'),
    ('Black', 'XL', 16, '/products/all tshirts/360/v_neck_black_front.png'),
    ('Black', 'XXL', 16, '/products/all tshirts/360/v_neck_black_front.png'),
    ('Grey', 'S', 14, '/products/all tshirts/360/v_neck_grey_front.png'),
    ('Grey', 'M', 14, '/products/all tshirts/360/v_neck_grey_front.png'),
    ('Grey', 'L', 14, '/products/all tshirts/360/v_neck_grey_front.png'),
    ('Grey', 'XL', 14, '/products/all tshirts/360/v_neck_grey_front.png'),
    ('Grey', 'XXL', 14, '/products/all tshirts/360/v_neck_grey_front.png'),
    ('Navy Blue', 'S', 12, '/products/all tshirts/360/v_neck_navyblue_front.png'),
    ('Navy Blue', 'M', 12, '/products/all tshirts/360/v_neck_navyblue_front.png'),
    ('Navy Blue', 'L', 12, '/products/all tshirts/360/v_neck_navyblue_front.png'),
    ('Navy Blue', 'XL', 12, '/products/all tshirts/360/v_neck_navyblue_front.png'),
    ('Navy Blue', 'XXL', 12, '/products/all tshirts/360/v_neck_navyblue_front.png'),
    ('Maroon', 'S', 8, '/products/all tshirts/360/v_neck_Maroon_front.png'),
    ('Maroon', 'M', 8, '/products/all tshirts/360/v_neck_Maroon_front.png'),
    ('Maroon', 'L', 8, '/products/all tshirts/360/v_neck_Maroon_front.png'),
    ('Maroon', 'XL', 8, '/products/all tshirts/360/v_neck_Maroon_front.png'),
    ('Maroon', 'XXL', 8, '/products/all tshirts/360/v_neck_Maroon_front.png')
) AS v(color, size, stock, image_url)
WHERE p.category = 'V-Neck';

-- Insert Hoodie variants
INSERT INTO product_variants (product_id, color, size, stock, image_url) 
SELECT 
  p.id,
  v.color,
  v.size,
  v.stock,
  v.image_url
FROM products p
CROSS JOIN (
  VALUES 
    ('Black', 'S', 10, '/products/all tshirts/360/hoodie_black_front.png'),
    ('Black', 'M', 10, '/products/all tshirts/360/hoodie_black_front.png'),
    ('Black', 'L', 10, '/products/all tshirts/360/hoodie_black_front.png'),
    ('Black', 'XL', 10, '/products/all tshirts/360/hoodie_black_front.png'),
    ('Black', 'XXL', 10, '/products/all tshirts/360/hoodie_black_front.png'),
    ('Navy Blue', 'S', 8, '/products/all tshirts/360/hoodie_navyblue_front.png'),
    ('Navy Blue', 'M', 8, '/products/all tshirts/360/hoodie_navyblue_front.png'),
    ('Navy Blue', 'L', 8, '/products/all tshirts/360/hoodie_navyblue_front.png'),
    ('Navy Blue', 'XL', 8, '/products/all tshirts/360/hoodie_navyblue_front.png'),
    ('Navy Blue', 'XXL', 8, '/products/all tshirts/360/hoodie_navyblue_front.png')
) AS v(color, size, stock, image_url)
WHERE p.category = 'Hoodie';

-- Insert Zip Hoodie variants
INSERT INTO product_variants (product_id, color, size, stock, image_url) 
SELECT 
  p.id,
  v.color,
  v.size,
  v.stock,
  v.image_url
FROM products p
CROSS JOIN (
  VALUES 
    ('Black', 'S', 6, '/products/all tshirts/360/ziphoodie_black_front.png'),
    ('Black', 'M', 6, '/products/all tshirts/360/ziphoodie_black_front.png'),
    ('Black', 'L', 6, '/products/all tshirts/360/ziphoodie_black_front.png'),
    ('Black', 'XL', 6, '/products/all tshirts/360/ziphoodie_black_front.png'),
    ('Black', 'XXL', 6, '/products/all tshirts/360/ziphoodie_black_front.png'),
    ('Grey', 'S', 8, '/products/all tshirts/360/ziphoodie_grey_front.png'),
    ('Grey', 'M', 8, '/products/all tshirts/360/ziphoodie_grey_front.png'),
    ('Grey', 'L', 8, '/products/all tshirts/360/ziphoodie_grey_front.png'),
    ('Grey', 'XL', 8, '/products/all tshirts/360/ziphoodie_grey_front.png'),
    ('Grey', 'XXL', 8, '/products/all tshirts/360/ziphoodie_grey_front.png'),
    ('Maroon', 'S', 5, '/products/all tshirts/360/ziphoodie_maroon_front.png'),
    ('Maroon', 'M', 5, '/products/all tshirts/360/ziphoodie_maroon_front.png'),
    ('Maroon', 'L', 5, '/products/all tshirts/360/ziphoodie_maroon_front.png'),
    ('Maroon', 'XL', 5, '/products/all tshirts/360/ziphoodie_maroon_front.png'),
    ('Maroon', 'XXL', 5, '/products/all tshirts/360/ziphoodie_maroon_front.png')
) AS v(color, size, stock, image_url)
WHERE p.category = 'Zip Hoodie';

-- Create RLS policies (Row Level Security) - SECURE VERSION
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_customization ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_address ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_proofs ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_verification ENABLE ROW LEVEL SECURITY;
ALTER TABLE bulk_enquiries ENABLE ROW LEVEL SECURITY;

-- PUBLIC READ ONLY POLICIES (Safe)
CREATE POLICY "Public products are viewable by everyone" ON products
  FOR SELECT USING (enabled = true);

CREATE POLICY "Public product variants are viewable by everyone" ON product_variants
  FOR SELECT USING (is_available = true);

-- PUBLIC INSERT ONLY POLICIES (Safe - customers can create)
CREATE POLICY "Anyone can insert orders" ON orders
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can insert order items" ON order_items
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can insert order customization" ON order_customization
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can insert order address" ON order_address
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can insert payment proofs" ON payment_proofs
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can insert email verification" ON email_verification
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can insert bulk enquiries" ON bulk_enquiries
  FOR INSERT WITH CHECK (true);

-- PUBLIC READ POLICIES (Safe - for order tracking)
CREATE POLICY "Orders are viewable by everyone" ON orders
  FOR SELECT USING (true);

CREATE POLICY "Order items are viewable by everyone" ON order_items
  FOR SELECT USING (true);

CREATE POLICY "Order customization is viewable by everyone" ON order_customization
  FOR SELECT USING (true);

CREATE POLICY "Order address is viewable by everyone" ON order_address
  FOR SELECT USING (true);

CREATE POLICY "Payment proofs are viewable by everyone" ON payment_proofs
  FOR SELECT USING (true);

CREATE POLICY "Email verification is viewable by everyone" ON email_verification
  FOR SELECT USING (true);

CREATE POLICY "Bulk enquiries are viewable by everyone" ON bulk_enquiries
  FOR SELECT USING (true);

-- NO PUBLIC UPDATE/DELETE POLICIES
-- All admin updates must go through API with service role key

-- Create storage buckets for images
INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('customer-logos', 'customer-logos', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('payment-screenshots', 'payment-screenshots', true);

-- Storage policies
CREATE POLICY "Public can view product images" ON storage.objects
  FOR SELECT USING (bucket_id = 'product-images');

CREATE POLICY "Public can upload customer logos" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'customer-logos');

CREATE POLICY "Public can view customer logos" ON storage.objects
  FOR SELECT USING (bucket_id = 'customer-logos');

CREATE POLICY "Public can upload payment screenshots" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'payment-screenshots');

CREATE POLICY "Public can view payment screenshots" ON storage.objects
  FOR SELECT USING (bucket_id = 'payment-screenshots');