import { Pool } from 'pg';

/**
 * Singleton PostgreSQL connection pool.
 * Lazy initialization — pool is only created when the first query runs.
 * This prevents build-time errors when DATABASE_URL is not available.
 */

let _pool = null;

function getPool() {
  if (_pool) return _pool;

  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error(
      'DATABASE_URL environment variable is not set. ' +
      'Copy .env.example to .env.local and fill in your PostgreSQL connection string.'
    );
  }

  const config = {
    connectionString,
    max: 10,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 5_000,
  };

  // Enable SSL for production (e.g. Vercel → managed Postgres like Neon, Supabase, RDS).
  if (process.env.NODE_ENV === 'production') {
    config.ssl = { rejectUnauthorized: false };
  }

  // In development, reuse across hot reloads via global to avoid exhausting connections.
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
  const pool = getPool();
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;

  if (process.env.NODE_ENV === 'development') {
    console.log('[db]', { query: text.slice(0, 80), duration, rows: res.rowCount });
  }

  return res;
}
