const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { validateRegister } = require('../middlewares/validator');

// [MỚI]: Import middleware auth để bảo vệ API đổi mật khẩu
const auth = require('../middlewares/auth'); 

// 1. Route Đăng ký
router.post('/register', validateRegister, authController.register);

// 2. Route Đăng nhập
router.post('/login', authController.login);

// 3. Route Quên mật khẩu
// Đường dẫn API sẽ là: /api/auth/forgot-password
router.post('/forgot-password', authController.forgotPassword);

// 4. [MỚI]: Route Đổi mật khẩu bắt buộc (dành cho mật khẩu tạm)
// Đường dẫn API sẽ là: /api/auth/change-temp-password
// Cần đi qua cổng bảo vệ 'auth' để xác minh token tạm thời
router.post('/change-temp-password', auth, authController.changeTempPassword);

module.exports = router;