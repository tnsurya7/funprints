import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

const products = [
  {
    name: 'Classic Round Neck T-Shirt',
    category: 'Round Neck',
    description: 'Comfortable cotton round neck t-shirt perfect for daily wear',
    base_price: 499,
    variants: [
      { color: 'White', sizes: ['S', 'M', 'L', 'XL', 'XXL'], stock: 25, image: '/products/all tshirts/360/neck_white_front.png' },
      { color: 'Black', sizes: ['S', 'M', 'L', 'XL', 'XXL'], stock: 20, image: '/products/all tshirts/360/neck_black_front.png' },
      { color: 'Grey', sizes: ['S', 'M', 'L', 'XL', 'XXL'], stock: 15, image: '/products/all tshirts/360/neck_grey_front.png' },
      { color: 'Navy Blue', sizes: ['S', 'M', 'L', 'XL', 'XXL'], stock: 18, image: '/products/all tshirts/360/neck_navyblue_front.png' },
      { color: 'Maroon', sizes: ['S', 'M', 'L', 'XL', 'XXL'], stock: 12, image: '/products/all tshirts/360/neck_maroon_front.png' }
    ]
  },
  {
    name: 'Premium Polo T-Shirt',
    category: 'Polo',
    description: 'Premium quality polo t-shirt with collar',
    base_price: 699,
    variants: [
      { color: 'White', sizes: ['S', 'M', 'L', 'XL', 'XXL'], stock: 15, image: '/products/all tshirts/360/polo_white_front.png' },
      { color: 'Black', sizes: ['S', 'M', 'L', 'XL', 'XXL'], stock: 12, image: '/products/all tshirts/360/polo_black_front.png' },
      { color: 'Grey', sizes: ['S', 'M', 'L', 'XL', 'XXL'], stock: 18, image: '/products/all tshirts/360/polo_grey_front.png' },
      { color: 'Navy Blue', sizes: ['S', 'M', 'L', 'XL', 'XXL'], stock: 10, image: '/products/all tshirts/360/polo_navyblue_front.png' }
    ]
  },
  {
    name: 'V-Neck T-Shirt',
    category: 'V-Neck',
    description: 'Stylish v-neck t-shirt for a modern look',
    base_price: 549,
    variants: [
      { color: 'White', sizes: ['S', 'M', 'L', 'XL', 'XXL'], stock: 20, image: '/products/all tshirts/360/v_neck_white_front.png' },
      { color: 'Black', sizes: ['S', 'M', 'L', 'XL', 'XXL'], stock: 16, image: '/products/all tshirts/360/v_neck_black_front.png' },
      { color: 'Grey', sizes: ['S', 'M', 'L', 'XL', 'XXL'], stock: 14, image: '/products/all tshirts/360/v_neck_grey_front.png' },
      { color: 'Navy Blue', sizes: ['S', 'M', 'L', 'XL', 'XXL'], stock: 12, image: '/products/all tshirts/360/v_neck_navyblue_front.png' },
      { color: 'Maroon', sizes: ['S', 'M', 'L', 'XL', 'XXL'], stock: 8, image: '/products/all tshirts/360/v_neck_Maroon_front.png' }
    ]
  },
  {
    name: 'Premium Hoodie',
    category: 'Hoodie',
    description: 'Warm and comfortable hoodie for cold weather',
    base_price: 999,
    variants: [
      { color: 'Black', sizes: ['S', 'M', 'L', 'XL', 'XXL'], stock: 10, image: '/products/all tshirts/360/hoodie_black_front.png' },
      { color: 'Navy Blue', sizes: ['S', 'M', 'L', 'XL', 'XXL'], stock: 8, image: '/products/all tshirts/360/hoodie_navyblue_front.png' }
    ]
  },
  {
    name: 'Zip Hoodie',
    category: 'Zip Hoodie',
    description: 'Zip-up hoodie with premium quality fabric',
    base_price: 1099,
    variants: [
      { color: 'Black', sizes: ['S', 'M', 'L', 'XL', 'XXL'], stock: 6, image: '/products/all tshirts/360/ziphoodie_black_front.png' },
      { color: 'Grey', sizes: ['S', 'M', 'L', 'XL', 'XXL'], stock: 8, image: '/products/all tshirts/360/ziphoodie_grey_front.png' },
      { color: 'Maroon', sizes: ['S', 'M', 'L', 'XL', 'XXL'], stock: 5, image: '/products/all tshirts/360/ziphoodie_maroon_front.png' }
    ]
  }
];

export async function POST() {
  try {
    console.log('🚀 Starting product population...');

    // First, check if products already exist
    const { data: existingProducts } = await supabaseAdmin
      .from('products')
      .select('id')
      .limit(1);

    if (existingProducts && existingProducts.length > 0) {
      return NextResponse.json({ 
        success: true, 
        message: 'Products already exist in database',
        count: existingProducts.length 
      });
    }

    let totalProducts = 0;
    let totalVariants = 0;

    // Insert products
    for (const product of products) {
      console.log(`📦 Adding product: ${product.name}`);
      
      const { data: insertedProduct, error: productError } = await supabaseAdmin
        .from('products')
        .insert([{
          name: product.name,
          category: product.category,
          description: product.description,
          base_price: product.base_price,
          gst_percent: 18,
          enabled: true
        }])
        .select()
        .single();

      if (productError) {
        console.error(`❌ Error inserting product ${product.name}:`, productError);
        continue;
      }

      totalProducts++;

      // Insert variants for this product
      const variants = [];
      for (const variant of product.variants) {
        for (const size of variant.sizes) {
          variants.push({
            product_id: insertedProduct.id,
            color: variant.color,
            size: size,
            stock: variant.stock,
            image_url: variant.image,
            is_available: true
          });
        }
      }

      const { error: variantsError } = await supabaseAdmin
        .from('product_variants')
        .insert(variants);

      if (variantsError) {
        console.error(`❌ Error inserting variants for ${product.name}:`, variantsError);
      } else {
        totalVariants += variants.length;
        console.log(`✅ Added ${variants.length} variants for ${product.name}`);
      }
    }

    console.log('🎉 Product population completed successfully!');
    
    return NextResponse.json({ 
      success: true, 
      message: 'Products populated successfully!',
      productsAdded: totalProducts,
      variantsAdded: totalVariants
    });
    
  } catch (error) {
    console.error('❌ Error during population:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to populate products',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}