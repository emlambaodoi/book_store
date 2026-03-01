const express = require('express');
const router = express.Router();
const adminBookController = require('../../controllers/admin/admin.book.controller');
const upload = require('../../middlewares/upload');

router.get('/', adminBookController.getList);
router.post('/', upload.single('image'), adminBookController.create);
router.put('/:id', upload.single('image'), adminBookController.update);
router.delete('/:id', adminBookController.delete);
router.put('/:id/restore', adminBookController.restore); // Route Khôi phục

module.exports = router;