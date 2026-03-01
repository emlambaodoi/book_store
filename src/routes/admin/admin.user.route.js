const express = require('express');
const router = express.Router();
const adminUserController = require('../../controllers/admin/admin.user.controller');

router.get('/', adminUserController.getList);
router.delete('/:id', adminUserController.delete);
router.put('/:id/restore', adminUserController.restore); // Route Khôi phục

module.exports = router;