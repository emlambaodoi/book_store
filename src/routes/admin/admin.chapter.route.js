const express = require('express');
const router = express.Router();
const adminChapterController = require('../../controllers/admin/admin.chapter.controller');

router.get('/book/:bookId', adminChapterController.getChaptersByBook);
router.get('/:id', adminChapterController.getChapterDetail);
router.post('/', adminChapterController.createChapter);
router.put('/:id', adminChapterController.updateChapter);
router.delete('/:id', adminChapterController.deleteChapter);

module.exports = router;