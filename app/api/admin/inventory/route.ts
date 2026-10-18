import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const admin = requireAdmin(req);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const products = await sql`
      SELECT 
        p.*,
        COALESCE(json_agg(json_build_object(
          'id', pv.id,
          'colorName', pv.color_name,
          'colorHex', pv.color_hex,
          'size', pv.size,
          'sku', pv.sku,
          'isAvailable', pv.is_available,
          'stockQuantity', pv.stock_quantity
        )) FILTER (WHERE pv.id IS NOT NULL), '[]'::json) as variants,
        COALESCE(SUM(pv.stock_quantity), 0) as total_stock
      FROM products p
      LEFT JOIN product_variants pv ON pv.product_id = p.id
      GROUP BY p.id
      ORDER BY p.name ASC;
    `;

    return NextResponse.json({ success: true, products });
  } catch (error: any) {
    console.error('Fetch inventory error:', error);
    return NextResponse.json({ error: 'Failed to fetch inventory' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const admin = requireAdmin(req);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { 
      type, 
      action, 
      productId, 
      variantId, 
      isVisible, 
      isInStock, 
      lowStockThreshold, 
      price, 
      name, 
      category, 
      description,
      stockQuantity, 
      isAvailable 
    } = body;

    const resolvedPrice = price !== undefined ? Number(price) : undefined;

    // 1. ADD COLOR TO PRODUCT ACROSS SIZES
    if (action === 'ADD_COLOR' && productId && body.colorName) {
      const cName = body.colorName.trim();
      const cHex = body.colorHex?.trim() || '#000000';
      const initialStock = Number(body.stockQuantity) || 15;

      const existingSizesRows = await sql`
        SELECT DISTINCT size FROM product_variants WHERE product_id = ${productId};
      `;
      const sizesToUse = existingSizesRows.length > 0 
        ? existingSizesRows.map((r: any) => r.size) 
        : ['S', 'M', 'L', 'XL', 'XXL'];

      for (const sz of sizesToUse) {
        const sku = `${productId.substring(0, 4).toUpperCase()}-${cName.substring(0, 3).toUpperCase()}-${sz}-${Math.floor(100 + Math.random() * 900)}`;
        await sql`
          INSERT INTO product_variants (product_id, color_name, color_hex, size, sku, stock_quantity, is_available)
          VALUES (${productId}, ${cName}, ${cHex}, ${sz}, ${sku}, ${initialStock}, true)
          ON CONFLICT (product_id, color_name, size) DO UPDATE SET
            color_hex = EXCLUDED.color_hex,
            is_available = true,
            stock_quantity = GREATEST(product_variants.stock_quantity, EXCLUDED.stock_quantity),
            updated_at = NOW();
        `;
      }

      await sql`
        INSERT INTO admin_audit_logs (admin_email, action, target_type, target_id, after_state)
        VALUES (${admin.email}, 'ADD_PRODUCT_COLOR', 'product', ${productId}, ${JSON.stringify({ colorName: cName, colorHex: cHex })});
      `;

      return NextResponse.json({ success: true, message: `Color "${cName}" added with all sizes.` });
    }

    // 2. EDIT COLOR NAME & HEX ACROSS VARIANTS
    if (action === 'EDIT_COLOR' && productId && body.oldColorName && body.newColorName) {
      const oldC = body.oldColorName.trim();
      const newC = body.newColorName.trim();
      const newHex = body.newColorHex?.trim() || null;

      if (oldC.toLowerCase() !== newC.toLowerCase()) {
        await sql`
          DELETE FROM product_variants
          WHERE product_id = ${productId} 
            AND LOWER(color_name) = LOWER(${newC})
            AND size IN (
              SELECT size FROM product_variants 
              WHERE product_id = ${productId} AND LOWER(color_name) = LOWER(${oldC})
            );
        `;
      }

      await sql`
        UPDATE product_variants
        SET 
          color_name = ${newC},
          color_hex = COALESCE(${newHex}, color_hex),
          updated_at = NOW()
        WHERE product_id = ${productId} AND LOWER(color_name) = LOWER(${oldC});
      `;

      await sql`
        INSERT INTO admin_audit_logs (admin_email, action, target_type, target_id, after_state)
        VALUES (${admin.email}, 'EDIT_PRODUCT_COLOR', 'product', ${productId}, ${JSON.stringify({ oldColor: oldC, newColor: newC, hex: newHex })});
      `;

      return NextResponse.json({ success: true, message: `Color updated to "${newC}".` });
    }

    // 3. ADD SIZE TO PRODUCT ACROSS COLORS
    if (action === 'ADD_SIZE' && productId && body.size) {
      const szName = body.size.trim().toUpperCase();
      const initialStock = Number(body.stockQuantity) || 15;

      const existingColorsRows = await sql`
        SELECT DISTINCT color_name, color_hex FROM product_variants WHERE product_id = ${productId};
      `;
      const colorsToUse = existingColorsRows.length > 0 
        ? existingColorsRows 
        : [{ color_name: 'Black', color_hex: '#000000' }];

      for (const col of colorsToUse) {
        const sku = `${productId.substring(0, 4).toUpperCase()}-${col.color_name.substring(0, 3).toUpperCase()}-${szName}-${Math.floor(100 + Math.random() * 900)}`;
        await sql`
          INSERT INTO product_variants (product_id, color_name, color_hex, size, sku, stock_quantity, is_available)
          VALUES (${productId}, ${col.color_name}, ${col.color_hex || '#000000'}, ${szName}, ${sku}, ${initialStock}, true)
          ON CONFLICT (product_id, color_name, size) DO UPDATE SET
            is_available = true,
            stock_quantity = GREATEST(product_variants.stock_quantity, EXCLUDED.stock_quantity),
            updated_at = NOW();
        `;
      }

      await sql`
        INSERT INTO admin_audit_logs (admin_email, action, target_type, target_id, after_state)
        VALUES (${admin.email}, 'ADD_PRODUCT_SIZE', 'product', ${productId}, ${JSON.stringify({ size: szName })});
      `;

      return NextResponse.json({ success: true, message: `Size "${szName}" added across all colors.` });
    }

    // 4. EDIT SIZE ACROSS VARIANTS
    if (action === 'EDIT_SIZE' && productId && body.oldSize && body.newSize) {
      const oldS = body.oldSize.trim().toUpperCase();
      const newS = body.newSize.trim().toUpperCase();

      if (oldS !== newS) {
        await sql`
          DELETE FROM product_variants
          WHERE product_id = ${productId}
            AND UPPER(size) = UPPER(${newS})
            AND color_name IN (
              SELECT color_name FROM product_variants
              WHERE product_id = ${productId} AND UPPER(size) = UPPER(${oldS})
            );
        `;
      }

      await sql`
        UPDATE product_variants
        SET 
          size = ${newS},
          updated_at = NOW()
        WHERE product_id = ${productId} AND UPPER(size) = UPPER(${oldS});
      `;

      await sql`
        INSERT INTO admin_audit_logs (admin_email, action, target_type, target_id, after_state)
        VALUES (${admin.email}, 'EDIT_PRODUCT_SIZE', 'product', ${productId}, ${JSON.stringify({ oldSize: oldS, newSize: newS })});
      `;

      return NextResponse.json({ success: true, message: `Size updated to "${newS}".` });
    }

    // 5. VARIANT UPDATE / STOCK UPDATE
    if (type === 'variant' || action === 'UPDATE_STOCK' || variantId) {
      const resolvedStock = stockQuantity !== undefined ? Number(stockQuantity) : undefined;

      await sql`
        UPDATE product_variants
        SET 
          stock_quantity = COALESCE(${resolvedStock !== undefined && !isNaN(resolvedStock) ? resolvedStock : null}, stock_quantity),
          is_available = COALESCE(${isAvailable !== undefined ? Boolean(isAvailable) : null}, is_available),
          updated_at = NOW()
        WHERE id = ${variantId};
      `;

      await sql`
        INSERT INTO admin_audit_logs (admin_email, action, target_type, target_id, after_state)
        VALUES (${admin.email}, 'UPDATE_VARIANT_STOCK', 'variant', ${variantId}, ${JSON.stringify({ stockQuantity: resolvedStock, isAvailable })});
      `;

      return NextResponse.json({ success: true, message: 'Variant stock updated successfully.' });
    }

    // 6. PRODUCT UPDATE (Price, Visibility, Name, Description, Category, etc.)
    if (type === 'product' || action === 'TOGGLE_VISIBILITY' || action === 'UPDATE_PRICE' || action === 'UPDATE_PRODUCT' || (productId && (price !== undefined || isVisible !== undefined || isInStock !== undefined || name || description || category))) {
      await sql`
        UPDATE products
        SET 
          name = COALESCE(${name || null}, name),
          category = COALESCE(${category || null}, category),
          description = COALESCE(${description || null}, description),
          is_visible = COALESCE(${isVisible !== undefined ? Boolean(isVisible) : null}, is_visible),
          is_in_stock = COALESCE(${isInStock !== undefined ? Boolean(isInStock) : null}, is_in_stock),
          low_stock_threshold = COALESCE(${lowStockThreshold !== undefined ? Number(lowStockThreshold) : null}, low_stock_threshold),
          price = COALESCE(${resolvedPrice !== undefined && !isNaN(resolvedPrice) ? resolvedPrice : null}, price),
          updated_at = NOW()
        WHERE id = ${productId};
      `;

      await sql`
        INSERT INTO admin_audit_logs (admin_email, action, target_type, target_id, after_state)
        VALUES (${admin.email}, 'UPDATE_PRODUCT_SETTINGS', 'product', ${productId}, ${JSON.stringify({ isVisible, isInStock, price: resolvedPrice, name })});
      `;

      return NextResponse.json({ success: true, message: 'Product updated successfully.' });
    }

    return NextResponse.json({ error: 'Invalid update parameters' }, { status: 400 });
  } catch (error: any) {
    console.error('Update inventory error:', error);
    return NextResponse.json({ error: 'Failed to update inventory' }, { status: 500 });
  }
}

// DELETE: Delete a variant, an entire color, or an entire size
export async function DELETE(req: NextRequest) {
  try {
    const admin = requireAdmin(req);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');
    const variantId = searchParams.get('variantId');
    const productId = searchParams.get('productId');
    const colorName = searchParams.get('colorName');
    const size = searchParams.get('size');

    if (type === 'variant' && variantId) {
      await sql`DELETE FROM product_variants WHERE id = ${variantId};`;
      return NextResponse.json({ success: true, message: 'Variant deleted.' });
    }

    if (type === 'color' && productId && colorName) {
      await sql`
        DELETE FROM product_variants 
        WHERE product_id = ${productId} AND LOWER(color_name) = LOWER(${colorName.trim()});
      `;
      return NextResponse.json({ success: true, message: `Color ${colorName} removed from product.` });
    }

    if (type === 'size' && productId && size) {
      await sql`
        DELETE FROM product_variants 
        WHERE product_id = ${productId} AND UPPER(size) = UPPER(${size.trim()});
      `;
      return NextResponse.json({ success: true, message: `Size ${size} removed from product.` });
    }

    if (type === 'product' && productId) {
      await sql`DELETE FROM product_variants WHERE product_id = ${productId};`;
      await sql`DELETE FROM products WHERE id = ${productId};`;
      return NextResponse.json({ success: true, message: 'Product deleted.' });
    }

    return NextResponse.json({ error: 'Invalid delete request' }, { status: 400 });
  } catch (error: any) {
    console.error('Delete inventory error:', error);
    return NextResponse.json({ error: 'Failed to delete item' }, { status: 500 });
  }
}

// POST: Add new product or new variant
export async function POST(req: NextRequest) {
  try {
    const admin = requireAdmin(req);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { action, productId, name, category, description, price, colorName, colorHex, size, stockQuantity } = body;

    // Add new variant to existing product
    if (action === 'ADD_VARIANT' || (productId && colorName && size)) {
      const sku = `${productId.substring(0, 4).toUpperCase()}-${colorName.substring(0, 3).toUpperCase()}-${size.toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
      
      const newVar = await sql`
        INSERT INTO product_variants (product_id, color_name, color_hex, size, sku, stock_quantity, is_available)
        VALUES (
          ${productId},
          ${colorName.trim()},
          ${colorHex?.trim() || '#000000'},
          ${size.trim().toUpperCase()},
          ${sku},
          ${Number(stockQuantity) || 15},
          true
        )
        RETURNING *;
      `;

      return NextResponse.json({ success: true, message: 'Variant added successfully.', variant: newVar[0] });
    }

    // Add new product
    if (name && price) {
      const prodId = `prod-${Date.now().toString().slice(-6)}`;
      
      const newProd = await sql`
        INSERT INTO products (id, name, category, description, price, is_in_stock, is_visible)
        VALUES (
          ${prodId},
          ${name.trim()},
          ${category?.trim() || 'Round Neck'},
          ${description?.trim() || 'Premium quality 100% bio-washed cotton garment.'},
          ${Number(price) || 499},
          true,
          true
        )
        RETURNING *;
      `;

      // Seed default basic variants (Black & White in S, M, L, XL)
      const defaultColors = [
        { name: 'Black', hex: '#000000' },
        { name: 'White', hex: '#FFFFFF' },
      ];
      const defaultSizes = ['S', 'M', 'L', 'XL'];

      for (const col of defaultColors) {
        for (const sz of defaultSizes) {
          const sku = `${prodId.substring(0, 4).toUpperCase()}-${col.name.substring(0, 3).toUpperCase()}-${sz}-${Math.floor(100 + Math.random() * 900)}`;
          await sql`
            INSERT INTO product_variants (product_id, color_name, color_hex, size, sku, stock_quantity, is_available)
            VALUES (${prodId}, ${col.name}, ${col.hex}, ${sz}, ${sku}, 15, true);
          `;
        }
      }

      return NextResponse.json({ success: true, message: 'Product added successfully with default size variants.', product: newProd[0] });
    }

    return NextResponse.json({ error: 'Name and price are required to create a product.' }, { status: 400 });
  } catch (error: any) {
    console.error('Create product/variant error:', error);
    return NextResponse.json({ error: 'Failed to create item' }, { status: 500 });
  }
}
