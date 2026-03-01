const Chapter = require('../../models/chapter.model');

const clientChapterController = {
    getChapters: async (req, res) => {
        try {
            const chapters = await Chapter.findByBookId(req.params.bookId);
            res.json(chapters);
        } catch (error) {
            res.status(500).json({ message: "Lỗi tải danh sách chương" });
        }
    },
    readChapter: async (req, res) => {
        try {
            const chapter = await Chapter.findById(req.params.id);
            if (!chapter) return res.status(404).json({ message: "Chương này không tồn tại" });
            res.json(chapter);
        } catch (error) {
            res.status(500).json({ message: "Lỗi tải nội dung chương" });
        }
    }
};

module.exports = clientChapterController;