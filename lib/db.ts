import { neon, neonConfig } from '@neondatabase/serverless';

// Cache connections across hot reloads in serverless environments
neonConfig.fetchConnectionCache = true;

const connectionString = process.env.DATABASE_URL || process.env.DATABASE_URL_UNPOOLED;

if (!connectionString) {
  console.warn('DATABASE_URL is not defined in environment variables. Using fallback or dev settings.');
}

export const sql = neon(connectionString || '');

export async function query<T = any>(queryString: string, params: any[] = []): Promise<T[]> {
  try {
    const result = await (sql as any).query(queryString, params);
    return result as T[];
  } catch (error) {
    console.error('Neon DB Query Error:', error);
    throw error;
  }
}

export const db = {
  sql,
  query,
};

export default db;
