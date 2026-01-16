# Database Setup Guide

## Quick Database Setup (Choose One)

### Option 1: Neon (Recommended - Easiest)

**Why Neon?**
- ✅ Free tier (0.5GB storage)
- ✅ Serverless PostgreSQL
- ✅ Auto-scaling
- ✅ Perfect for Vercel
- ✅ No credit card needed

**Setup Steps:**

1. **Create Account**
   ```
   Go to: https://neon.tech
   Sign up with GitHub/Google
   ```

2. **Create Project**
   ```
   Click "New Project"
   Name: fun-prints
   Region: Choose closest to your users
   PostgreSQL Version: 15 (default)
   ```

3. **Get Connection String**
   ```
   Dashboard → Connection Details
   Copy the connection string
   Format: postgresql://user:pass@host/dbname
   ```

4. **Add to .env**
   ```env
   DATABASE_URL=postgresql://user:pass@ep-xxx.region.aws.neon.tech/neondb
   ```

5. **Run Schema**
   ```bash
   # Install PostgreSQL client (if not installed)
   # Mac:
   brew install postgresql
   
   # Ubuntu/Debian:
   sudo apt-get install postgresql-client
   
   # Windows: Download from postgresql.org
   
   # Run schema
   psql $DATABASE_URL < database/schema.sql
   ```

6. **Verify**
   ```bash
   psql $DATABASE_URL -c "SELECT * FROM products;"
   ```

---

### Option 2: Supabase (Alternative)

**Why Supabase?**
- ✅ Free tier (500MB storage)
- ✅ Built-in admin panel
- ✅ Real-time features
- ✅ Authentication included

**Setup Steps:**

1. **Create Account**
   ```
   Go to: https://supabase.com
   Sign up with GitHub/Google
   ```

2. **Create Project**
   ```
   Click "New Project"
   Name: fun-prints
   Database Password: (save this!)
   Region: Choose closest
   ```

3. **Run Schema**
   ```
   Dashboard → SQL Editor
   Click "New Query"
   Paste contents of database/schema.sql
   Click "Run"
   ```

4. **Get Connection String**
   ```
   Settings → Database
   Copy "Connection string" (URI format)
   Replace [YOUR-PASSWORD] with your password
   ```

5. **Add to .env**
   ```env
   DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.xxx.supabase.co:5432/postgres
   ```

---

### Option 3: Local PostgreSQL (Development)

**For local development only**

1. **Install PostgreSQL**
   ```bash
   # Mac:
   brew install postgresql
   brew services start postgresql
   
   # Ubuntu/Debian:
   sudo apt-get install postgresql
   sudo service postgresql start
   
   # Windows: Download installer from postgresql.org
   ```

2. **Create Database**
   ```bash
   createdb funprints
   ```

3. **Run Schema**
   ```bash
   psql funprints < database/schema.sql
   ```

4. **Add to .env**
   ```env
   DATABASE_URL=postgresql://localhost:5432/funprints
   ```

---

## Database Schema Overview

### Tables Created

1. **products**
   - Stores product information
   - Includes colors, sizes, pricing
   - Sample products included

2. **orders**
   - Customer orders
   - Payment and order status
   - Delivery information

3. **order_items**
   - Individual items in orders
   - Links to products
   - Quantity and pricing

4. **bulk_enquiries**
   - Bulk order requests
   - Contact information
   - Status tracking

5. **admin_users**
   - Admin authentication
   - Role-based access
   - Sample admin included

### Sample Data Included

The schema includes:
- ✅ 4 sample products
- ✅ 1 admin user (email: admin@funprints.com)
- ✅ All necessary indexes

---

## Connecting from Code

### Install Database Client

```bash
npm install pg
npm install --save-dev @types/pg
```

### Update lib/db.ts

```typescript
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

export const query = async (text: string, params?: any[]) => {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  console.log('Executed query', { text, duration, rows: res.rowCount });
  return res;
};

export default pool;
```

### Example Usage

```typescript
// In API route
import { query } from '@/lib/db';

export async function GET() {
  const result = await query('SELECT * FROM products WHERE is_active = $1', [true]);
  return Response.json(result.rows);
}
```

---

## Testing Database Connection

### Quick Test Script

Create `scripts/test-db.js`:

```javascript
const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

async function testConnection() {
  try {
    const result = await pool.query('SELECT NOW()');
    console.log('✅ Database connected successfully!');
    console.log('Server time:', result.rows[0].now);
    
    const products = await pool.query('SELECT COUNT(*) FROM products');
    console.log('Products in database:', products.rows[0].count);
    
    await pool.end();
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
  }
}

testConnection();
```

Run test:
```bash
node scripts/test-db.js
```

---

## Common Issues & Solutions

### Issue: Connection Refused

**Solution:**
```bash
# Check if DATABASE_URL is set
echo $DATABASE_URL

# Verify database is running
# For Neon/Supabase: Check dashboard
# For local: 
pg_isready
```

### Issue: SSL Error

**Solution:**
```typescript
// Add to connection config
ssl: {
  rejectUnauthorized: false
}
```

### Issue: Authentication Failed

**Solution:**
- Check password in connection string
- Verify user has access
- Check IP whitelist (Neon/Supabase)

### Issue: Schema Not Found

**Solution:**
```bash
# Re-run schema
psql $DATABASE_URL < database/schema.sql

# Or manually:
psql $DATABASE_URL
\i database/schema.sql
```

---

## Database Maintenance

### Backup Database

```bash
# Neon/Supabase: Use dashboard backup feature

# Local:
pg_dump funprints > backup.sql

# Restore:
psql funprints < backup.sql
```

### View Data

```bash
# Connect to database
psql $DATABASE_URL

# List tables
\dt

# View products
SELECT * FROM products;

# View orders
SELECT * FROM orders ORDER BY created_at DESC LIMIT 10;

# Exit
\q
```

### Update Sample Data

```sql
-- Add more products
INSERT INTO products (product_id, name, description, price, category, fabric, gsm, colors, sizes) 
VALUES ('FP005', 'New Product', 'Description', 899, 'Category', '100% Cotton', '180 GSM', 
        ARRAY['White', 'Black'], ARRAY['S', 'M', 'L', 'XL']);

-- Update product
UPDATE products SET price = 799 WHERE product_id = 'FP001';

-- Delete product
DELETE FROM products WHERE product_id = 'FP005';
```

---

## Production Checklist

- [ ] Database created
- [ ] Schema installed
- [ ] Sample data loaded
- [ ] Connection tested
- [ ] Environment variable set
- [ ] Backup configured
- [ ] Monitoring enabled
- [ ] Access restricted

---

## Next Steps

1. **Complete database setup** using one of the options above
2. **Test connection** using the test script
3. **Update API routes** to use database
4. **Test order flow** end-to-end
5. **Set up backups** for production

---

**Need Help?**

- Neon Docs: https://neon.tech/docs
- Supabase Docs: https://supabase.com/docs
- PostgreSQL Docs: https://www.postgresql.org/docs
