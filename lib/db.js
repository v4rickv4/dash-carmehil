import { Pool } from 'pg';

/**
 * Singleton PostgreSQL connection pool.
 * Lazy initialization — pool is only created when the first query runs.
 * Supports DATABASE_URL, POSTGRES_URL, or POSTGRES_PRISMA_URL.
 */

let _pool = null;

function getPool() {
  if (_pool) return _pool;

  const connectionString =
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.POSTGRES_PRISMA_URL;

  if (!connectionString) {
    console.error('[db] CRITICAL ERROR: Neither DATABASE_URL nor POSTGRES_URL environment variable is set.');
    throw new Error(
      'DATABASE_URL environment variable is not set. ' +
      'Please add DATABASE_URL to your Vercel Project Settings > Environment Variables.'
    );
  }

  const config = {
    connectionString,
    max: 10,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000,
  };

  // SSL Configuration:
  // If the connection string explicitly sets sslmode=disable or ssl=false, do NOT force SSL.
  // Otherwise, in production (Vercel / Cloud), enable SSL with rejectUnauthorized: false.
  const isSslDisabled = connectionString.includes('sslmode=disable') || connectionString.includes('ssl=false');

  if (process.env.NODE_ENV === 'production' && !isSslDisabled) {
    config.ssl = { rejectUnauthorized: false };
  }

  if (process.env.NODE_ENV === 'development') {
    if (!global._pgPool) {
      global._pgPool = new Pool(config);
    }
    _pool = global._pgPool;
  } else {
    _pool = new Pool(config);
  }

  return _pool;
}

/**
 * Run a parameterized SQL query.
 * @param {string} text   SQL with $1, $2, … placeholders
 * @param {any[]}  params Parameter values
 */
export async function query(text, params) {
  try {
    const pool = getPool();
    const start = Date.now();
    const res = await pool.query(text, params);
    const duration = Date.now() - start;

    if (process.env.NODE_ENV === 'development') {
      console.log('[db]', { query: text.slice(0, 80), duration, rows: res.rowCount });
    }

    return res;
  } catch (error) {
    const connStr = process.env.DATABASE_URL || process.env.POSTGRES_URL || '';
    const sanitizedUrl = connStr.replace(/:[^:@]+@/, ':****@');

    console.error('[db] Query execution failed:', {
      message: error.message,
      code: error.code,
      detail: error.detail,
      hint: error.hint,
      connectionTarget: sanitizedUrl,
      querySnippet: text ? text.slice(0, 100) : '',
    });

    throw error;
  }
}
