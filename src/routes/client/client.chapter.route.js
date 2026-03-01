const express = require('express');
const router = express.Router();
const clientChapterController = require('../../controllers/client/client.chapter.controller');

// Lấy danh sách chương của 1 cuốn sách
router.get('/book/:bookId', clientChapterController.getChapters);

// Đọc nội dung chi tiết của 1 chương
router.get('/:id', clientChapterController.readChapter);

module.exports = router;