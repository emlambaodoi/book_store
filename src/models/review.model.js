const { db } = require('../config/db');

class Review {
    // 1. User viết đánh giá
    static async create({ userId, bookId, rating, comment }) {
        const sql = `INSERT INTO reviews (user_id, book_id, rating, comment, created_at) VALUES (?, ?, ?, ?, NOW())`;
        await db.execute(sql, [userId, bookId, rating, comment]);
    }

    // 2. Lấy đánh giá theo Sách (Hiển thị trang chi tiết)
    static async getByBookId(bookId) {
        const sql = `
            SELECT r.*, u.name as user_name 
            FROM reviews r
            JOIN users u ON r.user_id = u.id
            WHERE r.book_id = ?
            ORDER BY r.created_at DESC
        `;
        const [rows] = await db.execute(sql, [bookId]);
        return rows;
    }

    // 3. [ADMIN] Lấy tất cả đánh giá (Kèm tên sách và user)
    static async getAllForAdmin() {
        const sql = `
            SELECT r.*, u.name as user_name, b.title as book_title 
            FROM reviews r
            JOIN users u ON r.user_id = u.id
            JOIN books b ON r.book_id = b.id
            ORDER BY r.created_at DESC
        `;
        const [rows] = await db.execute(sql);
        return rows;
    }

    // 4. [ADMIN] Xóa đánh giá
    static async delete(id) {
        const sql = 'DELETE FROM reviews WHERE id = ?';
        await db.execute(sql, [id]);
    }
}

module.exports = Review;