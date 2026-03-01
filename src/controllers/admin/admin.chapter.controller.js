const Chapter = require('../../models/chapter.model');

const adminChapterController = {
    getChaptersByBook: async (req, res) => {
        try {
            const chapters = await Chapter.findByBookId(req.params.bookId);
            res.json(chapters);
        } catch (error) {
            res.status(500).json({ message: "Lỗi server", error: error.message });
        }
    },
    getChapterDetail: async (req, res) => {
        try {
            const chapter = await Chapter.findById(req.params.id);
            if (!chapter) return res.status(404).json({ message: "Không tìm thấy chương" });
            res.json(chapter);
        } catch (error) {
            res.status(500).json({ message: "Lỗi server" });
        }
    },
    createChapter: async (req, res) => {
        try {
            const { book_id, chapter_number, title, content } = req.body;
            if (!book_id || !chapter_number || !title || !content) {
                return res.status(400).json({ message: "Vui lòng nhập đủ thông tin chương" });
            }

            // [MỚI]: Chặn trùng chương
            const isExist = await Chapter.checkExists(book_id, chapter_number);
            if (isExist) {
                return res.status(400).json({ message: `Lỗi: Chương ${chapter_number} đã tồn tại trong cuốn sách này!` });
            }

            const chapterId = await Chapter.create({ book_id, chapter_number, title, content });
            res.status(201).json({ message: "Thêm chương thành công", id: chapterId });
        } catch (error) {
            res.status(500).json({ message: "Lỗi thêm chương", error: error.message });
        }
    },
    updateChapter: async (req, res) => {
        try {
            const id = req.params.id;
            const { book_id, chapter_number, title, content } = req.body;

            // [MỚI]: Chặn trùng chương (ngoại trừ chính chương đang sửa)
            const isExist = await Chapter.checkExists(book_id, chapter_number, id);
            if (isExist) {
                return res.status(400).json({ message: `Lỗi: Chương ${chapter_number} đã tồn tại trong cuốn sách này!` });
            }

            const success = await Chapter.update(id, { chapter_number, title, content });
            if (!success) return res.status(404).json({ message: "Không tìm thấy chương" });
            res.json({ message: "Cập nhật thành công" });
        } catch (error) {
            res.status(500).json({ message: "Lỗi cập nhật", error: error.message });
        }
    },
    deleteChapter: async (req, res) => {
        try {
            const success = await Chapter.delete(req.params.id);
            if (!success) return res.status(404).json({ message: "Không tìm thấy chương" });
            res.json({ message: "Xóa chương thành công" });
        } catch (error) {
            res.status(500).json({ message: "Lỗi xóa chương", error: error.message });
        }
    }
};

module.exports = adminChapterController;