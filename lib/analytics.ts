/**
 * Google Analytics 4 (GA4) Standard E-commerce & Web Event Tracking
 * Strictly compliant with GA4 Measurement Protocol / gtag.js standards.
 */

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

export interface GA4Item {
  item_id: string;
  item_name: string;
  price?: number;
  item_category?: string;
  item_variant?: string;
  quantity?: number;
}

export const sendGAEvent = (eventName: string, params: Record<string, any> = {}) => {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', eventName, params);
  }
};

/**
 * 1. view_item_list - triggered when viewing catalog / products list
 */
export const trackViewItemList = (items: GA4Item[], listName = 'Product Catalog') => {
  sendGAEvent('view_item_list', {
    item_list_name: listName,
    items: items.slice(0, 30).map((item, index) => ({
      ...item,
      index: index + 1,
    })),
  });
};

/**
 * 2. select_item - triggered when selecting / clicking a product card
 */
export const trackSelectItem = (item: GA4Item, listName = 'Product Catalog') => {
  sendGAEvent('select_item', {
    item_list_name: listName,
    items: [item],
  });
};

/**
 * 3. view_item - triggered on product detail page view
 */
export const trackViewItem = (item: GA4Item) => {
  sendGAEvent('view_item', {
    currency: 'INR',
    value: item.price || 0,
    items: [item],
  });
};

/**
 * 4. add_to_cart - triggered when adding an item to the shopping cart
 */
export const trackAddToCart = (item: GA4Item) => {
  sendGAEvent('add_to_cart', {
    currency: 'INR',
    value: (item.price || 0) * (item.quantity || 1),
    items: [item],
  });
};

/**
 * 5. remove_from_cart - triggered when removing an item from the cart
 */
export const trackRemoveFromCart = (item: GA4Item) => {
  sendGAEvent('remove_from_cart', {
    currency: 'INR',
    value: (item.price || 0) * (item.quantity || 1),
    items: [item],
  });
};

/**
 * 6. begin_checkout - triggered when starting the checkout process
 */
export const trackBeginCheckout = (items: GA4Item[], totalValue: number) => {
  sendGAEvent('begin_checkout', {
    currency: 'INR',
    value: totalValue,
    items,
  });
};

/**
 * 7. add_shipping_info - triggered when user saves/submits shipping info
 */
export const trackAddShippingInfo = (
  items: GA4Item[],
  totalValue: number,
  shippingTier = 'Standard Dispatch'
) => {
  sendGAEvent('add_shipping_info', {
    currency: 'INR',
    value: totalValue,
    shipping_tier: shippingTier,
    items,
  });
};

/**
 * 8. add_payment_info - triggered when user chooses/submits payment choice
 */
export const trackAddPaymentInfo = (
  items: GA4Item[],
  totalValue: number,
  paymentType: string
) => {
  sendGAEvent('add_payment_info', {
    currency: 'INR',
    value: totalValue,
    payment_type: paymentType,
    items,
  });
};

/**
 * 9. purchase - triggered exclusively upon verified order completion.
 * Prevents duplicates on page reloads via sessionStorage.
 */
export const trackPurchase = (
  orderId: string,
  items: GA4Item[],
  totalValue: number,
  shipping = 0,
  tax = 0
) => {
  if (typeof window === 'undefined') return;

  try {
    const key = `funprint_ga4_purchased_${orderId}`;
    if (sessionStorage.getItem(key)) {
      return; // Already tracked for this session, suppress duplicate
    }
    sessionStorage.setItem(key, 'true');
  } catch (e) {
    // Fail-safe if sessionStorage restricted
  }

  sendGAEvent('purchase', {
    transaction_id: orderId,
    value: totalValue,
    currency: 'INR',
    shipping,
    tax,
    items,
  });
};
