import { NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  const results: any = {
    timestamp: new Date().toISOString(),
    checks: {}
  };

  try {
    // 1. Check environment variables
    results.checks.env = {
      NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      url_value: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 20) + '...',
    };

    // 2. Check products table with admin client (bypasses RLS)
    try {
      const { data: adminProducts, error: adminError } = await supabaseAdmin
        .from('products')
        .select('id, name, enabled')
        .limit(5);
      
      results.checks.admin_products = {
        success: !adminError,
        error: adminError?.message,
        count: adminProducts?.length || 0,
        sample: adminProducts?.slice(0, 2) || []
      };
    } catch (err) {
      results.checks.admin_products = {
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error'
      };
    }

    // 3. Check products with anon client (tests RLS)
    try {
      const { data: anonProducts, error: anonError } = await supabase
        .from('products')
        .select('id, name, enabled')
        .eq('enabled', true)
        .limit(5);
      
      results.checks.anon_products = {
        success: !anonError,
        error: anonError?.message,
        count: anonProducts?.length || 0,
        sample: anonProducts?.slice(0, 2) || []
      };
    } catch (err) {
      results.checks.anon_products = {
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error'
      };
    }

    // 4. Check product variants with admin
    try {
      const { data: adminVariants, error: variantError } = await supabaseAdmin
        .from('product_variants')
        .select('id, product_id, color, size, stock, is_available')
        .limit(5);
      
      results.checks.admin_variants = {
        success: !variantError,
        error: variantError?.message,
        count: adminVariants?.length || 0,
        sample: adminVariants?.slice(0, 2) || []
      };
    } catch (err) {
      results.checks.admin_variants = {
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error'
      };
    }

    // 5. Check products with variants (the actual frontend query)
    try {
      const { data: productsWithVariants, error: joinError } = await supabaseAdmin
        .from('products')
        .select(`
          *,
          variants:product_variants(*)
        `)
        .eq('enabled', true)
        .limit(3);
      
      results.checks.products_with_variants = {
        success: !joinError,
        error: joinError?.message,
        count: productsWithVariants?.length || 0,
        sample: productsWithVariants?.map(p => ({
          id: p.id,
          name: p.name,
          enabled: p.enabled,
          variant_count: p.variants?.length || 0
        })) || []
      };
    } catch (err) {
      results.checks.products_with_variants = {
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error'
      };
    }

    // 6. Test the exact frontend query
    try {
      const { data: frontendQuery, error: frontendError } = await supabase
        .from('products')
        .select(`
          *,
          variants:product_variants(*)
        `)
        .eq('enabled', true);
      
      results.checks.frontend_query = {
        success: !frontendError,
        error: frontendError?.message,
        count: frontendQuery?.length || 0,
        rls_blocking: !frontendError && frontendQuery?.length === 0 && results.checks.admin_products.count > 0
      };
    } catch (err) {
      results.checks.frontend_query = {
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error'
      };
    }

    // 7. Diagnosis
    results.diagnosis = {
      data_exists: results.checks.admin_products.count > 0,
      rls_blocking: results.checks.admin_products.count > 0 && results.checks.anon_products.count === 0,
      env_missing: !results.checks.env.NEXT_PUBLIC_SUPABASE_URL || !results.checks.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      variants_exist: results.checks.admin_variants.count > 0,
      frontend_query_works: results.checks.frontend_query.success && results.checks.frontend_query.count > 0
    };

    // 8. Recommendation
    if (results.diagnosis.env_missing) {
      results.recommendation = "ENV_MISSING";
    } else if (results.diagnosis.rls_blocking) {
      results.recommendation = "RLS_BLOCK";
    } else if (!results.diagnosis.data_exists) {
      results.recommendation = "NO_DATA";
    } else {
      results.recommendation = "DATA_OK";
    }

    return NextResponse.json(results, { status: 200 });

  } catch (error) {
    results.checks.fatal_error = {
      error: error instanceof Error ? error.message : 'Unknown fatal error'
    };
    results.recommendation = "FATAL_ERROR";
    
    return NextResponse.json(results, { status: 500 });
  }
}