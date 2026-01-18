import { supabase, supabaseAdmin, Product, ProductVariant, Order, OrderItem, OrderCustomization, OrderAddress, PaymentProof, EmailVerification, BulkEnquiry } from './supabase';

// Single source of truth for pricing calculation
export function calculatePrice(basePrice: number, gstPercent: number = 18, quantity: number = 1): {
  basePrice: number;
  gstAmount: number;
  totalAmount: number;
} {
  const basePriceTotal = basePrice * quantity;
  const gstAmount = Math.round((basePriceTotal * gstPercent) / 100);
  const totalAmount = basePriceTotal + gstAmount;
  
  return {
    basePrice: basePriceTotal,
    gstAmount,
    totalAmount
  };
}

// Products Service
export class ProductsService {
  static async getAllProducts(): Promise<(Product & { variants: ProductVariant[] })[]> {
    try {
      const { data: products, error: productsError } = await supabaseAdmin
        .from('products')
        .select('*')
        .eq('enabled', true)
        .order('created_at', { ascending: false });

      if (productsError) {
        console.error('Error fetching products:', productsError);
        return [];
      }

      if (!products || products.length === 0) {
        return [];
      }

      // Fetch variants for all products
      const { data: variants, error: variantsError } = await supabaseAdmin
        .from('product_variants')
        .select('*')
        .eq('is_available', true)
        .in('product_id', products.map(p => p.id));

      if (variantsError) {
        console.error('Error fetching variants:', variantsError);
        return products.map(p => ({ ...p, variants: [] }));
      }

      // Group variants by product
      const productsWithVariants = products.map(product => ({
        ...product,
        variants: variants?.filter(v => v.product_id === product.id) || []
      }));

      return productsWithVariants;
    } catch (err) {
      console.error('Products service error:', err);
      return [];
    }
  }

  static async getAllProductsAdmin(): Promise<(Product & { variants: ProductVariant[] })[]> {
    try {
      const { data: products, error: productsError } = await supabaseAdmin
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (productsError) {
        console.error('Error fetching admin products:', productsError);
        return [];
      }

      if (!products || products.length === 0) {
        return [];
      }

      // Fetch all variants for admin
      const { data: variants, error: variantsError } = await supabaseAdmin
        .from('product_variants')
        .select('*')
        .in('product_id', products.map(p => p.id));

      if (variantsError) {
        console.error('Error fetching variants:', variantsError);
        return products.map(p => ({ ...p, variants: [] }));
      }

      // Group variants by product
      const productsWithVariants = products.map(product => ({
        ...product,
        variants: variants?.filter(v => v.product_id === product.id) || []
      }));

      return productsWithVariants;
    } catch (err) {
      console.error('Admin products service error:', err);
      return [];
    }
  }

  static async getProductById(id: string): Promise<(Product & { variants: ProductVariant[] }) | null> {
    try {
      const { data: product, error: productError } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .eq('enabled', true)
        .single();

      if (productError || !product) {
        console.error('Error fetching product:', productError);
        return null;
      }

      const { data: variants, error: variantsError } = await supabase
        .from('product_variants')
        .select('*')
        .eq('product_id', id)
        .eq('is_available', true);

      if (variantsError) {
        console.error('Error fetching variants:', variantsError);
        return { ...product, variants: [] };
      }

      return { ...product, variants: variants || [] };
    } catch (err) {
      console.error('Get product error:', err);
      return null;
    }
  }

  static async updateVariantStock(variantId: string, newStock: number): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('product_variants')
        .update({ 
          stock: Math.max(0, newStock),
          is_available: newStock > 0
        })
        .eq('id', variantId);

      if (error) {
        console.error('Error updating variant stock:', error);
        return false;
      }

      return true;
    } catch (err) {
      console.error('Update variant stock error:', err);
      return false;
    }
  }

  static async createProduct(productData: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Promise<Product | null> {
    try {
      const { data, error } = await supabase
        .from('products')
        .insert([productData])
        .select()
        .single();

      if (error) {
        console.error('Error creating product:', error);
        return null;
      }

      return data;
    } catch (err) {
      console.error('Create product error:', err);
      return null;
    }
  }

  static async updateProduct(id: string, updates: Partial<Product>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('products')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) {
        console.error('Error updating product:', error);
        return false;
      }

      return true;
    } catch (err) {
      console.error('Update product error:', err);
      return false;
    }
  }

  static async toggleProductStatus(productId: string): Promise<boolean> {
    try {
      // First get current status
      const { data: product, error: fetchError } = await supabase
        .from('products')
        .select('enabled')
        .eq('id', productId)
        .single();

      if (fetchError || !product) {
        console.error('Error fetching product for status toggle:', fetchError);
        return false;
      }

      // Toggle the status
      const { error: updateError } = await supabase
        .from('products')
        .update({ 
          enabled: !product.enabled,
          updated_at: new Date().toISOString()
        })
        .eq('id', productId);

      if (updateError) {
        console.error('Error toggling product status:', updateError);
        return false;
      }

      return true;
    } catch (err) {
      console.error('Toggle product status error:', err);
      return false;
    }
  }
}

// Orders Service
export class OrdersService {
  static async createOrder(orderData: {
    items: Array<{
      productId: string;
      variantId: string;
      quantity: number;
      unitPrice: number;
    }>;
    customer: {
      name: string;
      email?: string;
      mobile: string;
    };
    address: {
      pincode: string;
      city: string;
      district: string;
      state: string;
      addressLine: string;
      landmark?: string;
      addressType?: string;
    };
    customization?: {
      logoUrl?: string;
      position?: string;
      scale?: number;
      isPlain?: boolean;
    };
    paymentMethod: string;
    orderCode?: string;
  }): Promise<{ orderCode: string; totalAmount: number }> {
    try {
      const generatedOrderCode = orderData.orderCode || `FP${Date.now()}`;

      // Calculate total using single source of truth
      let calculatedTotal = 0;
      const processedItems = orderData.items.map((item) => {
        const pricing = calculatePrice(item.unitPrice, 18, item.quantity);
        calculatedTotal += pricing.totalAmount;
        
        return {
          product_id: item.productId,
          variant_id: item.variantId,
          quantity: item.quantity,
          unit_price: item.unitPrice,
          total_price: pricing.totalAmount,
        };
      });

      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([{
          order_code: generatedOrderCode,
          customer_name: orderData.customer.name,
          customer_email: orderData.customer.email || '',
          customer_mobile: orderData.customer.mobile,
          payment_method: orderData.paymentMethod,
          payment_status: 'PENDING',
          order_status: 'CREATED',
          total_amount: calculatedTotal,
          email_verified: false,
        }])
        .select()
        .single();

      if (orderError || !order) {
        console.error('Error creating order:', orderError);
        throw new Error('Failed to create order');
      }

      // Create order items
      const itemsWithOrderId = processedItems.map(item => ({
        ...item,
        order_id: order.id
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(itemsWithOrderId);

      if (itemsError) {
        console.error('Error creating order items:', itemsError);
        throw new Error('Failed to create order items');
      }

      // Create order address
      const { error: addressError } = await supabase
        .from('order_address')
        .insert([{
          order_id: order.id,
          pincode: orderData.address.pincode,
          city: orderData.address.city,
          district: orderData.address.district,
          state: orderData.address.state,
          address_line: orderData.address.addressLine,
          landmark: orderData.address.landmark,
          address_type: orderData.address.addressType || 'home',
        }]);

      if (addressError) {
        console.error('Error creating order address:', addressError);
        throw new Error('Failed to create order address');
      }

      // Create order customization if provided
      if (orderData.customization) {
        const { error: customizationError } = await supabase
          .from('order_customization')
          .insert([{
            order_id: order.id,
            logo_url: orderData.customization.logoUrl,
            position: orderData.customization.position || 'front',
            scale: orderData.customization.scale || 1.0,
            is_plain: orderData.customization.isPlain || false,
          }]);

        if (customizationError) {
          console.error('Error creating order customization:', customizationError);
          // Don't throw error for customization, it's optional
        }
      }

      // Reduce stock for ordered variants
      for (const item of orderData.items) {
        const { data: variant, error: variantError } = await supabase
          .from('product_variants')
          .select('stock')
          .eq('id', item.variantId)
          .single();

        if (!variantError && variant) {
          const newStock = Math.max(0, variant.stock - item.quantity);
          await supabase
            .from('product_variants')
            .update({ 
              stock: newStock,
              is_available: newStock > 0
            })
            .eq('id', item.variantId);
        }
      }

      return {
        orderCode: generatedOrderCode,
        totalAmount: calculatedTotal
      };
    } catch (err) {
      console.error('Create order error:', err);
      throw new Error('Failed to create order');
    }
  }

  static async getAllOrders(): Promise<any[]> {
    try {
      const { data: orders, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            product_variants (
              *,
              products (*)
            )
          ),
          order_address (*),
          order_customization (*),
          payment_proofs (*)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching orders:', error);
        return [];
      }

      return orders || [];
    } catch (err) {
      console.error('Get all orders error:', err);
      return [];
    }
  }

  static async getOrderByCode(orderCode: string): Promise<any | null> {
    try {
      const { data: order, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            product_variants (
              *,
              products (*)
            )
          ),
          order_address (*),
          order_customization (*),
          payment_proofs (*)
        `)
        .eq('order_code', orderCode)
        .single();

      if (error) {
        console.error('Error fetching order:', error);
        return null;
      }

      return order;
    } catch (err) {
      console.error('Get order error:', err);
      return null;
    }
  }

  static async updateOrderStatus(
    orderCode: string,
    orderStatus: Order['order_status'],
    paymentStatus?: Order['payment_status']
  ): Promise<boolean> {
    try {
      const updates: any = {
        order_status: orderStatus,
        updated_at: new Date().toISOString()
      };

      if (paymentStatus) {
        updates.payment_status = paymentStatus;
      }

      const { error } = await supabase
        .from('orders')
        .update(updates)
        .eq('order_code', orderCode);

      if (error) {
        console.error('Error updating order status:', error);
        return false;
      }

      return true;
    } catch (err) {
      console.error('Update order status error:', err);
      return false;
    }
  }
}

// Email Verification Service
export class EmailVerificationService {
  static async createVerification(orderId: string, email: string, otpHash: string): Promise<boolean> {
    try {
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 10); // 10 minutes expiry

      const { error } = await supabase
        .from('email_verification')
        .insert([{
          order_id: orderId,
          email,
          otp_hash: otpHash,
          expires_at: expiresAt.toISOString(),
          verified: false,
        }]);

      if (error) {
        console.error('Error creating email verification:', error);
        return false;
      }

      return true;
    } catch (err) {
      console.error('Create email verification error:', err);
      return false;
    }
  }

  static async verifyOTP(orderId: string, otpHash: string): Promise<boolean> {
    try {
      const { data: verification, error: fetchError } = await supabase
        .from('email_verification')
        .select('*')
        .eq('order_id', orderId)
        .eq('otp_hash', otpHash)
        .gt('expires_at', new Date().toISOString())
        .eq('verified', false)
        .single();

      if (fetchError || !verification) {
        console.error('Invalid or expired OTP:', fetchError);
        return false;
      }

      // Mark as verified
      const { error: updateError } = await supabase
        .from('email_verification')
        .update({
          verified: true,
          verified_at: new Date().toISOString()
        })
        .eq('id', verification.id);

      if (updateError) {
        console.error('Error updating verification:', updateError);
        return false;
      }

      // Update order email_verified status
      const { error: orderUpdateError } = await supabase
        .from('orders')
        .update({ email_verified: true })
        .eq('id', orderId);

      if (orderUpdateError) {
        console.error('Error updating order verification status:', orderUpdateError);
        return false;
      }

      return true;
    } catch (err) {
      console.error('Verify OTP error:', err);
      return false;
    }
  }
}

// Payment Proof Service
export class PaymentProofService {
  static async uploadProof(orderId: string, screenshotUrl: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('payment_proofs')
        .insert([{
          order_id: orderId,
          screenshot_url: screenshotUrl,
          verified: false,
        }]);

      if (error) {
        console.error('Error uploading payment proof:', error);
        return false;
      }

      return true;
    } catch (err) {
      console.error('Upload payment proof error:', err);
      return false;
    }
  }

  static async verifyProof(proofId: string, verifiedBy: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('payment_proofs')
        .update({
          verified: true,
          verified_by: verifiedBy,
          verified_at: new Date().toISOString()
        })
        .eq('id', proofId);

      if (error) {
        console.error('Error verifying payment proof:', error);
        return false;
      }

      return true;
    } catch (err) {
      console.error('Verify payment proof error:', err);
      return false;
    }
  }
}

// Bulk Enquiries Service
export class BulkEnquiriesService {
  static async createEnquiry(enquiry: Omit<BulkEnquiry, 'id' | 'created_at'>): Promise<BulkEnquiry | null> {
    try {
      const { data, error } = await supabase
        .from('bulk_enquiries')
        .insert([enquiry])
        .select()
        .single();

      if (error) {
        console.error('Error creating bulk enquiry:', error);
        return null;
      }

      return data;
    } catch (err) {
      console.error('Create bulk enquiry error:', err);
      return null;
    }
  }

  static async getAllEnquiries(): Promise<BulkEnquiry[]> {
    try {
      const { data, error } = await supabase
        .from('bulk_enquiries')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching enquiries:', error);
        return [];
      }

      return data || [];
    } catch (err) {
      console.error('Get all enquiries error:', err);
      return [];
    }
  }
}

// Storage Service
export class StorageService {
  static async uploadProductImage(file: File, productId: string, variantId: string): Promise<string | null> {
    try {
      const fileName = `${productId}/${variantId}/${Date.now()}-${file.name}`;
      
      const { data, error } = await supabase.storage
        .from('product-images')
        .upload(fileName, file);

      if (error) {
        console.error('Error uploading product image:', error);
        return null;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (err) {
      console.error('Upload product image error:', err);
      return null;
    }
  }

  static async uploadCustomerLogo(file: File, orderCode: string): Promise<string | null> {
    try {
      const fileName = `${orderCode}/${Date.now()}-${file.name}`;
      
      const { data, error } = await supabase.storage
        .from('customer-logos')
        .upload(fileName, file);

      if (error) {
        console.error('Error uploading customer logo:', error);
        return null;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('customer-logos')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (err) {
      console.error('Upload customer logo error:', err);
      return null;
    }
  }

  static async uploadPaymentScreenshot(file: File, orderCode: string): Promise<string | null> {
    try {
      const fileName = `${orderCode}/${Date.now()}-${file.name}`;
      
      const { data, error } = await supabase.storage
        .from('payment-screenshots')
        .upload(fileName, file);

      if (error) {
        console.error('Error uploading payment screenshot:', error);
        return null;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('payment-screenshots')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (err) {
      console.error('Upload payment screenshot error:', err);
      return null;
    }
  }
}