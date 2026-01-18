import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-service-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Service role client for server-side operations
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Database Types
export interface Product {
  id: string;
  name: string;
  category: string;
  description: string;
  base_price: number;
  gst_percent: number;
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  color: string;
  size: string;
  stock: number;
  image_url: string;
  is_available: boolean;
  created_at: string;
}

export interface Order {
  id: string;
  order_code: string;
  customer_name: string;
  customer_email: string;
  customer_mobile: string;
  payment_method: string;
  payment_status: 'PENDING' | 'VERIFIED' | 'FAILED';
  order_status: 'CREATED' | 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED';
  total_amount: number;
  email_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  variant_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  created_at: string;
}

export interface OrderCustomization {
  id: string;
  order_id: string;
  logo_url?: string;
  position: string;
  scale: number;
  is_plain: boolean;
  created_at: string;
}

export interface OrderAddress {
  id: string;
  order_id: string;
  pincode: string;
  city: string;
  district: string;
  state: string;
  address_line: string;
  landmark?: string;
  address_type: string;
  created_at: string;
}

export interface PaymentProof {
  id: string;
  order_id: string;
  screenshot_url: string;
  verified: boolean;
  verified_by?: string;
  verified_at?: string;
  created_at: string;
}

export interface EmailVerification {
  id: string;
  order_id: string;
  email: string;
  otp_hash: string;
  expires_at: string;
  verified: boolean;
  verified_at?: string;
  created_at: string;
}

export interface BulkEnquiry {
  id: string;
  name: string;
  email: string;
  mobile: string;
  company?: string;
  quantity: number;
  message?: string;
  created_at: string;
}