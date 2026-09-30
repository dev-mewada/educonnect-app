const path = require('path');
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

// Load environment variables reliably from backend/.env
dotenv.config({ path: path.resolve(__dirname, '../.env') });

let pool = null;
let isConnected = false;

try {
  const poolConfig = process.env.DATABASE_URL
    ? {
        uri: process.env.DATABASE_URL,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        ...(process.env.DB_SSL === 'false' ? {} : { ssl: { rejectUnauthorized: false } })
      }
    : {
        host: process.env.DB_HOST || 'localhost',
        port: Number(process.env.DB_PORT) || 3306,
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME || 'educonnect_pro',
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        ...(process.env.DB_SSL === 'true' ? { ssl: { rejectUnauthorized: false } } : {})
      };

  pool = mysql.createPool(poolConfig);

  // Test initial connection on module load
  pool.getConnection()
    .then(connection => {
      console.log(`✅ MySQL Database connected successfully to '${process.env.DB_NAME || 'educonnect_pro'}' on port ${process.env.DB_PORT || 3306}`);
      isConnected = true;
      connection.release();
    })
    .catch(err => {
      console.error('❌ MySQL connection failed:', err.message);
      isConnected = false;
    });
} catch (error) {
  console.error('❌ Failed to initialize MySQL pool:', error.message);
  isConnected = false;
}

module.exports = {
  pool,
  isDbConnected: () => isConnected,
  query: async (sql, params) => {
    if (!pool) {
      throw new Error('Database connection pool is not initialized');
    }
    return pool.query(sql, params);
  },
  getConnection: async () => {
    if (!pool) {
      throw new Error('Database connection pool is not initialized');
    }
    return pool.getConnection();
  }
};
