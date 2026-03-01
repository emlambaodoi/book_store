const express = require('express');
const router = express.Router();
const controller = require('../../controllers/client/client.book.controller');

// URL gốc: /api/books

router.get('/', controller.getAll);

// [MỚI]: Route lấy Top Sách (BẮT BUỘC PHẢI ĐỂ TRÊN ROUTE /:id)
router.get('/top', controller.getTopBooks); 

router.get('/:id', controller.getDetail);

module.exports = router;