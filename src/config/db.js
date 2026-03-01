// src/config/db.js
const mysql = require('mysql2');
require('dotenv').config();

// Tạo Connection Pool (Hồ kết nối)
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'book_store', // Đảm bảo đúng tên DB của bạn
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Chuyển sang dạng Promise Wrapper để dùng async/await
const db = pool.promise();

// Export dạng Object { db } để khớp với lệnh require trong Model
module.exports = { db };