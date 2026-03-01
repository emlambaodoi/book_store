const express = require('express');
const router = express.Router();
const controller = require('../../controllers/admin/admin.review.controller');

router.get('/', controller.getAll);
router.delete('/:id', controller.delete);

module.exports = router;