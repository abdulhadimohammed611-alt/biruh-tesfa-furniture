const { Pool } = require('pg');
require('dotenv').config();

// Determine if we're connecting to a cloud/Neon database via DATABASE_URL
const isCloudDatabase = !!process.env.DATABASE_URL;

// Create a connection pool to PostgreSQL
const poolConfig = {
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection fails
  // Always enable SSL when using DATABASE_URL (Neon requires it unconditionally)
  // Disable SSL for local PostgreSQL using individual DB_* variables
  ssl: isCloudDatabase ? { rejectUnauthorized: false } : false
};

if (isCloudDatabase) {
  // Neon / Render: use the full connection string
  poolConfig.connectionString = process.env.DATABASE_URL;
  console.log('Using DATABASE_URL connection (SSL enabled)');
} else {
  // Local development: use individual env vars
  poolConfig.user = process.env.DB_USER || 'postgres';
  poolConfig.host = process.env.DB_HOST || 'localhost';
  poolConfig.database = process.env.DB_DATABASE || 'biruh_tesfa_furniture';
  poolConfig.password = process.env.DB_PASSWORD || 'password123';
  poolConfig.port = parseInt(process.env.DB_PORT || '5432');
  console.log('Using local PostgreSQL connection (SSL disabled)');
}

const pool = new Pool(poolConfig);

// Test connection on startup
pool.on('connect', () => {
  console.log('PostgreSQL database pool connected successfully');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle database client', err);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool
};
