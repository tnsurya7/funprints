-- Fix RLS policies to allow public read access

-- Drop existing policies that might be blocking
DROP POLICY IF EXISTS "Public products are viewable by everyone" ON products;
DROP POLICY IF EXISTS "Public product variants are viewable by everyone" ON product_variants;
DROP POLICY IF EXISTS "Public read products" ON products;
DROP POLICY IF EXISTS "Public read variants" ON product_variants;

-- Create correct public read policies
CREATE POLICY "Allow public read products" ON products 
  FOR SELECT USING (enabled = true);

CREATE POLICY "Allow public read variants" ON product_variants 
  FOR SELECT USING (is_available = true);

-- Test queries to verify data exists
SELECT 'Products count:' as info, count(*) as count FROM products WHERE enabled = true;
SELECT 'Variants count:' as info, count(*) as count FROM product_variants WHERE is_available = true;

-- Test the exact query the frontend uses
SELECT 
  p.id,
  p.name,
  p.category,
  p.base_price,
  p.enabled,
  pv.id as variant_id,
  pv.color,
  pv.size,
  pv.stock,
  pv.image_url,
  pv.is_available
FROM products p
LEFT JOIN product_variants pv ON p.id = pv.product_id
WHERE p.enabled = true AND pv.is_available = true
LIMIT 10;