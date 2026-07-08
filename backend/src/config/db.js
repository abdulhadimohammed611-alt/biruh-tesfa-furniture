const { Pool } = require('pg');
require('dotenv').config();

// ---------------------------------------------------------------------------
// SSL Strategy
//
// Enable SSL with rejectUnauthorized:false when connecting to a hosted
// PostgreSQL provider (Neon, Render, Supabase, ElephantSQL, etc.).
// Two signals trigger production SSL:
//   1. DATABASE_URL is set   → always a cloud connection string
//   2. NODE_ENV=production   → catch Render/Vercel deployments without DATABASE_URL
//
// Local development with individual DB_* vars gets SSL disabled so a plain
// local PostgreSQL install doesn't need TLS configuration.
// ---------------------------------------------------------------------------
const isCloudDatabase =
  !!process.env.DATABASE_URL || process.env.NODE_ENV === 'production';

const sslConfig = isCloudDatabase ? { rejectUnauthorized: false } : false;

// ---------------------------------------------------------------------------
// Pool configuration
//
// DATABASE_URL (preferred): full connection string provided by Neon/Render.
//   When set, all individual DB_* variables are ignored.
//
// DB_HOST / DB_PORT / DB_USER / DB_PASSWORD / DB_DATABASE (fallback):
//   Used for local development with a plain PostgreSQL instance.
// ---------------------------------------------------------------------------
const poolConfig = {
  max: 20,                       // Maximum concurrent client connections
  idleTimeoutMillis: 30000,      // Release idle clients after 30 s
  connectionTimeoutMillis: 5000, // Fail fast if the DB is unreachable (5 s)
  ssl: sslConfig,
};

if (process.env.DATABASE_URL) {
  // Production / hosted: Neon, Render PostgreSQL, Supabase
  poolConfig.connectionString = process.env.DATABASE_URL;
  console.log('[DB] Mode: cloud  |  SSL: enabled  |  source: DATABASE_URL');
} else {
  // Local development: individual environment variables
  poolConfig.user     = process.env.DB_USER     || 'postgres';
  poolConfig.host     = process.env.DB_HOST     || 'localhost';
  poolConfig.database = process.env.DB_DATABASE || 'biruh_tesfa_furniture';
  poolConfig.password = process.env.DB_PASSWORD || '';
  poolConfig.port     = parseInt(process.env.DB_PORT || '5432', 10);
  const sslLabel = isCloudDatabase ? 'enabled (NODE_ENV=production)' : 'disabled';
  console.log(`[DB] Mode: local  |  SSL: ${sslLabel}  |  host: ${poolConfig.host}:${poolConfig.port}`);
}

const pool = new Pool(poolConfig);

pool.on('connect', () => {
  console.log('[DB] Client connected from pool');
});

pool.on('error', (err) => {
  console.error('[DB] Unexpected idle client error:', err.message);
});

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------
module.exports = {
  /** Run a parameterised query.  Usage: db.query('SELECT $1::text', ['hi']) */
  query: (text, params) => pool.query(text, params),

  /** Returns the pg Pool for transactions that need multiple statements. */
  pool,

  /** Lightweight connectivity check — used by the /health endpoint. */
  testConnection: () => pool.query('SELECT 1'),
};
