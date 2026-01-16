// Color-based image paths
export const productColors = {
  'round-neck': {
    White: '/products/round-neck/white',
    Black: '/products/round-neck/black',
    Navy: '/products/round-neck/navy',
    Grey: '/products/round-neck/grey',
  },
  'polo': {
    White: '/products/polo/white',
    Black: '/products/polo/black',
    Navy: '/products/polo/navy',
    Grey: '/products/polo/grey',
  },
};

export const getProductImagePath = (category: string, color: string, view: 'front' | 'back' | 'side') => {
  const categoryKey = category.toLowerCase().replace(' ', '-');
  const colorKey = color as keyof typeof productColors.polo;
  const basePath = productColors[categoryKey as keyof typeof productColors]?.[colorKey];
  
  if (!basePath) return `https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=800&fit=crop`;
  
  return `${basePath}/${view}.jpg`;
};
