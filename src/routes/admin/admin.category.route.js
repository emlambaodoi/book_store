const express = require('express');
const router = express.Router();
const adminCategoryController = require('../../controllers/admin/admin.category.controller');

router.get('/', adminCategoryController.getList);
router.post('/', adminCategoryController.create);
router.put('/:id', adminCategoryController.update);
router.delete('/:id', adminCategoryController.delete);
router.put('/:id/restore', adminCategoryController.restore); // Route Khôi phục

module.exports = router;