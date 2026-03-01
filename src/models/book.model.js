const { db } = require('../config/db');

class Book {
    static async findWithFilter({ keyword, categoryId, limit, offset, isAdmin = false }) {
        let sql = `
            SELECT b.*, c.name as category_name 
            FROM books b
            LEFT JOIN categories c ON b.category_id = c.id
            WHERE 1=1
        `;
        const params = [];

        if (!isAdmin) {
            sql += " AND (b.status = 'active' OR b.status IS NULL)";
        }

        if (keyword) {
            sql += ' AND (b.title LIKE ? OR b.author LIKE ? OR b.isbn LIKE ?)';
            const k = `%${keyword}%`;
            params.push(k, k, k);
        }

        if (categoryId) {
            sql += ' AND b.category_id = ?';
            params.push(categoryId);
        }

        if (isAdmin) {
            sql += " ORDER BY CASE WHEN b.status = 'blocked' THEN 1 ELSE 0 END, b.id DESC";
        } else {
            sql += " ORDER BY b.id DESC";
        }

        if (limit && offset !== undefined) {
            sql += ` LIMIT ${Number(limit)} OFFSET ${Number(offset)}`;
        }

        const [rows] = await db.query(sql, params);
        return rows;
    }

    static async getById(id) {
        const [rows] = await db.query("SELECT * FROM books WHERE id = ? AND (status = 'active' OR status IS NULL)", [id]);
        return rows[0];
    }

    static async checkDuplicateIsbn(isbn, excludeId = null) {
        if (!isbn) return false;
        let sql = "SELECT id FROM books WHERE isbn = ? AND (status = 'active' OR status IS NULL)";
        const params = [isbn];
        if (excludeId) {
            sql += ' AND id != ?';
            params.push(excludeId);
        }
        const [rows] = await db.query(sql, params);
        return rows.length > 0;
    }

    static async getByIsbnWithStats(isbn) {
        const sql = `
            SELECT b.*, c.name as category_name,
                   COUNT(r.id) as review_count, COALESCE(AVG(r.rating), 0) as average_score
            FROM books b
            LEFT JOIN reviews r ON b.id = r.book_id
            LEFT JOIN categories c ON b.category_id = c.id
            WHERE b.isbn = ? AND (b.status = 'active' OR b.status IS NULL)
            GROUP BY b.id
        `;
        const [rows] = await db.query(sql, [isbn]);
        return rows[0];
    }

    static async create({ title, author, year, isbn, description, content, image, category_id }) {
        const sql = `
            INSERT INTO books (title, author, year, isbn, description, content, image, category_id, status) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active')
        `;
        const [result] = await db.query(sql, [
            title, author, year || null, isbn || null, 
            description || '', content || '', image || null, category_id || null
        ]);
        return result.insertId;
    }

    static async update(id, { title, author, year, isbn, description, content, image, category_id }) {
        const sql = `
            UPDATE books 
            SET title=?, author=?, year=?, isbn=?, description=?, content=?, image=?, category_id=? 
            WHERE id=?
        `;
        await db.query(sql, [title, author, year, isbn, description, content, image, category_id, id]);
    }

    static async delete(id) {
        await db.query("UPDATE books SET status = 'blocked' WHERE id = ?", [id]);
    }

    static async restore(id) {
        await db.query("UPDATE books SET status = 'active' WHERE id = ?", [id]);
    }
    // [MỚI]: Hàm tăng lượt xem lên 1 mỗi khi có người click vào xem chi tiết
    static async incrementViews(id) {
        await db.query("UPDATE books SET views = views + 1 WHERE id = ?", [id]);
    }

    // [MỚI]: Hàm lấy Top 5 cuốn sách có lượt xem cao nhất
    static async getTopBooks(limit = 5) {
        const sql = `
            SELECT id, title, author, image, views 
            FROM books 
            WHERE status = 'active' OR status IS NULL 
            ORDER BY views DESC 
            LIMIT ?
        `;
        const [rows] = await db.query(sql, [limit]);
        return rows;
    }
}

module.exports = Book;