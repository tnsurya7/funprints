-- STEP 1: Enable required extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- STEP 2: Check if products table is empty (should return 0)
-- SELECT count(*) FROM products;

-- STEP 3: Insert products (SAFE VERSION)
INSERT INTO products (name, category, description, base_price, enabled) VALUES
('Classic Round Neck T-Shirt', 'Round Neck', 'Comfortable cotton round neck t-shirt perfect for daily wear', 499, true),
('Premium Polo T-Shirt', 'Polo', 'Premium quality polo t-shirt with collar', 699, true),
('V-Neck T-Shirt', 'V-Neck', 'Stylish v-neck t-shirt for a modern look', 549, true),
('Premium Hoodie', 'Hoodie', 'Warm and comfortable hoodie for cold weather', 999, true),
('Zip Hoodie', 'Zip Hoodie', 'Zip-up hoodie with premium quality fabric', 1099, true);

-- STEP 4: Insert product variants (MINIMUM TEST DATA)
INSERT INTO product_variants (product_id, color, size, stock, image_url, is_available)
SELECT 
  p.id,
  v.color,
  v.size,
  v.stock,
  v.image_url,
  true
FROM products p
CROSS JOIN (
  VALUES 
    -- Round Neck variants
    ('White', 'S', 25, '/products/all tshirts/360/neck_white_front.png'),
    ('White', 'M', 25, '/products/all tshirts/360/neck_white_front.png'),
    ('White', 'L', 25, '/products/all tshirts/360/neck_white_front.png'),
    ('Black', 'S', 20, '/products/all tshirts/360/neck_black_front.png'),
    ('Black', 'M', 20, '/products/all tshirts/360/neck_black_front.png'),
    ('Black', 'L', 20, '/products/all tshirts/360/neck_black_front.png'),
    ('Grey', 'S', 15, '/products/all tshirts/360/neck_grey_front.png'),
    ('Grey', 'M', 15, '/products/all tshirts/360/neck_grey_front.png'),
    ('Grey', 'L', 15, '/products/all tshirts/360/neck_grey_front.png')
) AS v(color, size, stock, image_url)
WHERE p.category = 'Round Neck'

UNION ALL

SELECT 
  p.id,
  v.color,
  v.size,
  v.stock,
  v.image_url,
  true
FROM products p
CROSS JOIN (
  VALUES 
    ('White', 'S', 15, '/products/all tshirts/360/polo_white_front.png'),
    ('White', 'M', 15, '/products/all tshirts/360/polo_white_front.png'),
    ('Black', 'S', 12, '/products/all tshirts/360/polo_black_front.png'),
    ('Black', 'M', 12, '/products/all tshirts/360/polo_black_front.png'),
    ('Grey', 'S', 18, '/products/all tshirts/360/polo_grey_front.png'),
    ('Grey', 'M', 18, '/products/all tshirts/360/polo_grey_front.png')
) AS v(color, size, stock, image_url)
WHERE p.category = 'Polo'

UNION ALL

SELECT 
  p.id,
  v.color,
  v.size,
  v.stock,
  v.image_url,
  true
FROM products p
CROSS JOIN (
  VALUES 
    ('White', 'S', 20, '/products/all tshirts/360/v_neck_white_front.png'),
    ('White', 'M', 20, '/products/all tshirts/360/v_neck_white_front.png'),
    ('Black', 'S', 16, '/products/all tshirts/360/v_neck_black_front.png'),
    ('Black', 'M', 16, '/products/all tshirts/360/v_neck_black_front.png'),
    ('Grey', 'S', 14, '/products/all tshirts/360/v_neck_grey_front.png'),
    ('Grey', 'M', 14, '/products/all tshirts/360/v_neck_grey_front.png')
) AS v(color, size, stock, image_url)
WHERE p.category = 'V-Neck'

UNION ALL

SELECT 
  p.id,
  v.color,
  v.size,
  v.stock,
  v.image_url,
  true
FROM products p
CROSS JOIN (
  VALUES 
    ('Black', 'S', 10, '/products/all tshirts/360/hoodie_black_front.png'),
    ('Black', 'M', 10, '/products/all tshirts/360/hoodie_black_front.png'),
    ('Black', 'L', 10, '/products/all tshirts/360/hoodie_black_front.png'),
    ('Navy Blue', 'S', 8, '/products/all tshirts/360/hoodie_navyblue_front.png'),
    ('Navy Blue', 'M', 8, '/products/all tshirts/360/hoodie_navyblue_front.png'),
    ('Navy Blue', 'L', 8, '/products/all tshirts/360/hoodie_navyblue_front.png')
) AS v(color, size, stock, image_url)
WHERE p.category = 'Hoodie'

UNION ALL

SELECT 
  p.id,
  v.color,
  v.size,
  v.stock,
  v.image_url,
  true
FROM products p
CROSS JOIN (
  VALUES 
    ('Black', 'S', 6, '/products/all tshirts/360/ziphoodie_black_front.png'),
    ('Black', 'M', 6, '/products/all tshirts/360/ziphoodie_black_front.png'),
    ('Grey', 'S', 8, '/products/all tshirts/360/ziphoodie_grey_front.png'),
    ('Grey', 'M', 8, '/products/all tshirts/360/ziphoodie_grey_front.png'),
    ('Maroon', 'S', 5, '/products/all tshirts/360/ziphoodie_maroon_front.png'),
    ('Maroon', 'M', 5, '/products/all tshirts/360/ziphoodie_maroon_front.png')
) AS v(color, size, stock, image_url)
WHERE p.category = 'Zip Hoodie';

-- STEP 5: Verify data was inserted
SELECT 'Products inserted:' as info, count(*) as count FROM products;
SELECT 'Variants inserted:' as info, count(*) as count FROM product_variants;

-- STEP 6: Test query that frontend uses
SELECT 
  p.id,
  p.name,
  p.category,
  p.base_price,
  p.enabled,
  count(pv.id) as variant_count
FROM products p
LEFT JOIN product_variants pv ON p.id = pv.product_id
WHERE p.enabled = true
GROUP BY p.id, p.name, p.category, p.base_price, p.enabled;