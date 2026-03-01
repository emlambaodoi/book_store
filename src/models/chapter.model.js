const { db } = require('../config/db');

const Chapter = {
    findByBookId: async (bookId) => {
        const [rows] = await db.query(
            'SELECT id, book_id, chapter_number, title, created_at FROM chapters WHERE book_id = ? ORDER BY chapter_number ASC', 
            [bookId]
        );
        return rows;
    },
    
    findById: async (id) => {
        const [rows] = await db.query('SELECT * FROM chapters WHERE id = ?', [id]);
        return rows[0];
    },

    // [HÀM MỚI]: Kiểm tra xem chương đã tồn tại chưa
    checkExists: async (bookId, chapterNumber, excludeId = null) => {
        let query = 'SELECT id FROM chapters WHERE book_id = ? AND chapter_number = ?';
        let params = [bookId, chapterNumber];
        
        // Nếu đang sửa (update), loại trừ ID của chính nó ra để không bị tự báo trùng
        if (excludeId) {
            query += ' AND id != ?';
            params.push(excludeId);
        }
        
        const [rows] = await db.query(query, params);
        return rows.length > 0;
    },

    create: async (chapterData) => {
        const { book_id, chapter_number, title, content } = chapterData;
        const [result] = await db.query(
            'INSERT INTO chapters (book_id, chapter_number, title, content) VALUES (?, ?, ?, ?)',
            [book_id, chapter_number, title, content]
        );
        return result.insertId;
    },

    update: async (id, chapterData) => {
        const { chapter_number, title, content } = chapterData;
        const [result] = await db.query(
            'UPDATE chapters SET chapter_number = ?, title = ?, content = ? WHERE id = ?',
            [chapter_number, title, content, id]
        );
        return result.affectedRows > 0;
    },

    delete: async (id) => {
        const [result] = await db.query('DELETE FROM chapters WHERE id = ?', [id]);
        return result.affectedRows > 0;
    }
};

module.exports = Chapter;