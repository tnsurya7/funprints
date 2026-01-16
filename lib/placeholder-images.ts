// Placeholder T-shirt images from free stock photo services
// These are temporary demo images for development only
// Replace with your own product photography in production

export interface ProductImage {
  id: string;
  front: string;
  back: string;
  side: string;
  color: string;
  type: string;
}

// Using Unsplash and Pexels free stock images
// All images are royalty-free and can be used for development/demo purposes

export const placeholderImages: ProductImage[] = [
  // White Round Neck T-Shirt
  {
    id: 'white-roundneck',
    front: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=2000&h=2000&fit=crop',
    back: 'https://images.unsplash.com/photo-1622445275463-afa2ab738c34?w=2000&h=2000&fit=crop',
    side: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=2000&h=2000&fit=crop',
    color: 'White',
    type: 'Round Neck',
  },
  // Black Round Neck T-Shirt
  {
    id: 'black-roundneck',
    front: 'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=2000&h=2000&fit=crop',
    back: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=2000&h=2000&fit=crop',
    side: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=2000&h=2000&fit=crop',
    color: 'Black',
    type: 'Round Neck',
  },
  // Grey Round Neck T-Shirt
  {
    id: 'grey-roundneck',
    front: 'https://images.unsplash.com/photo-1562157873-818bc0726f68?w=2000&h=2000&fit=crop',
    back: 'https://images.unsplash.com/photo-1622445275463-afa2ab738c34?w=2000&h=2000&fit=crop',
    side: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=2000&h=2000&fit=crop',
    color: 'Grey',
    type: 'Round Neck',
  },
  // Navy Blue Round Neck T-Shirt
  {
    id: 'navy-roundneck',
    front: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=2000&h=2000&fit=crop',
    back: 'https://images.unsplash.com/photo-1622445275463-afa2ab738c34?w=2000&h=2000&fit=crop',
    side: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=2000&h=2000&fit=crop',
    color: 'Navy',
    type: 'Round Neck',
  },
  // White Polo T-Shirt
  {
    id: 'white-polo',
    front: 'https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=2000&h=2000&fit=crop',
    back: 'https://images.unsplash.com/photo-1622445275463-afa2ab738c34?w=2000&h=2000&fit=crop',
    side: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=2000&h=2000&fit=crop',
    color: 'White',
    type: 'Polo',
  },
  // Black Polo T-Shirt
  {
    id: 'black-polo',
    front: 'https://images.unsplash.com/photo-1607345366928-199ea26cfe3e?w=2000&h=2000&fit=crop',
    back: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=2000&h=2000&fit=crop',
    side: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=2000&h=2000&fit=crop',
    color: 'Black',
    type: 'Polo',
  },
];

// Fallback placeholder if image fails to load
export const fallbackImage = 'https://via.placeholder.com/2000x2000/f3f4f6/9ca3af?text=T-Shirt+Image';

// Get images by product type
export const getImagesByType = (type: string): ProductImage[] => {
  return placeholderImages.filter((img) => img.type === type);
};

// Get images by color
export const getImagesByColor = (color: string): ProductImage[] => {
  return placeholderImages.filter((img) => img.color === color);
};

// Get specific product images
export const getProductImages = (id: string): ProductImage | undefined => {
  return placeholderImages.find((img) => img.id === id);
};

// Alternative free stock image sources (backup)
export const alternativeSources = {
  unsplash: 'https://unsplash.com/s/photos/plain-tshirt',
  pexels: 'https://www.pexels.com/search/plain%20tshirt/',
  pixabay: 'https://pixabay.com/images/search/tshirt/',
  placeholder: 'https://via.placeholder.com/2000x2000',
};

// Image optimization settings
export const imageConfig = {
  quality: 90,
  format: 'webp',
  sizes: {
    thumbnail: 400,
    medium: 800,
    large: 1200,
    full: 2000,
  },
};

// Legal notice for development team
export const LEGAL_NOTICE = `
⚠️ PLACEHOLDER IMAGES - DEVELOPMENT ONLY

These images are temporary placeholders from free stock photo services:
- Unsplash (https://unsplash.com) - Free to use
- Pexels (https://pexels.com) - Free to use
- Placeholder services - Demo purposes

IMPORTANT:
1. These images are for UI development and testing only
2. Replace with original product photography before production
3. Do not use for commercial purposes without proper licensing
4. Ensure all final images are owned or properly licensed

TODO BEFORE PRODUCTION:
[ ] Replace all placeholder images with original photography
[ ] Verify image licensing and ownership
[ ] Optimize images for web (WebP, compression)
[ ] Add proper alt text for accessibility
[ ] Test image loading performance
`;

export default placeholderImages;
