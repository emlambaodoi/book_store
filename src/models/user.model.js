const { db } = require('../config/db');

class User {
    static async getAll() {
        const [rows] = await db.query("SELECT id, name, email, role, status, created_at FROM users ORDER BY CASE WHEN status = 'blocked' THEN 1 ELSE 0 END, id DESC");
        return rows;
    }

    static async findByEmail(email) {
        const [rows] = await db.query("SELECT * FROM users WHERE email = ? AND (status = 'active' OR status IS NULL)", [email]);
        return rows[0];
    }

static async create(name, email, password, role = 'user') {
    // Đảm bảo truyền đủ 5 giá trị cho 5 cột: name, email, password, role, status
    const [result] = await db.query(
        "INSERT INTO users (name, email, password, role, status) VALUES (?, ?, ?, ?, 'active')", 
        [name, email, password, role]
    );
    return result.insertId;
}

    static async delete(id) {
        await db.query("UPDATE users SET status = 'blocked' WHERE id = ?", [id]);
    }

    static async restore(id) {
        await db.query("UPDATE users SET status = 'active' WHERE id = ?", [id]);
    }
}

module.exports = User;