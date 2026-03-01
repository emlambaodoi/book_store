const { db } = require('../config/db');

class Category {
    static async getAll() {
        const [rows] = await db.query("SELECT * FROM categories ORDER BY CASE WHEN status = 'blocked' THEN 1 ELSE 0 END, id DESC");
        return rows;
    }

    static async checkNameExists(name, excludeId = null) {
        let sql = "SELECT id FROM categories WHERE name = ? AND (status = 'active' OR status IS NULL)";
        const params = [name];
        if (excludeId) {
            sql += ' AND id != ?';
            params.push(excludeId);
        }
        const [rows] = await db.query(sql, params);
        return rows.length > 0;
    }

    static async checkHasBooks(id) {
        const [rows] = await db.query("SELECT id FROM books WHERE category_id = ? AND (status = 'active' OR status IS NULL) LIMIT 1", [id]);
        return rows.length > 0;
    }

    static async create(name) {
        const [result] = await db.query("INSERT INTO categories (name, status) VALUES (?, 'active')", [name]);
        return result.insertId;
    }

    static async update(id, name) {
        await db.query('UPDATE categories SET name = ? WHERE id = ?', [name, id]);
    }

    static async delete(id) {
        await db.query("UPDATE categories SET status = 'blocked' WHERE id = ?", [id]);
    }

    static async restore(id) {
        await db.query("UPDATE categories SET status = 'active' WHERE id = ?", [id]);
    }
}

module.exports = Category;