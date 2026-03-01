const { body, validationResult } = require('express-validator');

exports.validateRegister = [
    // 1. Kiểm tra Họ và Tên (Thêm giới hạn độ dài thực tế)
    body('fullName')
        .trim()
        .notEmpty().withMessage('Họ và tên không được để trống')
        .isLength({ min: 3, max: 50 }).withMessage('Họ và tên phải dài từ 3 đến 50 ký tự'),
    
    // 2. Kiểm tra Email (Thêm notEmpty để bắt lỗi rỗng trước)
    body('email')
        .trim()
        .notEmpty().withMessage('Email không được để trống')
        .isEmail().withMessage('Email không đúng định dạng (ví dụ: ten@gmail.com)')
        .normalizeEmail(), // Tự động chuyển thành chữ thường, xóa khoảng trắng thừa

    // 3. Kiểm tra Password (Bắt lỗi chứa khoảng trắng)
    body('password')
        .notEmpty().withMessage('Mật khẩu không được để trống')
        .isLength({ min: 6 }).withMessage('Mật khẩu phải có ít nhất 6 ký tự')
        .custom((value) => {
            if (/\s/.test(value)) {
                throw new Error('Mật khẩu không được chứa khoảng trắng');
            }
            return true;
        }),

    // 4. Hàm xử lý lỗi
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                message: errors.array()[0].msg, // Chỉ lấy câu thông báo rõ ràng nhất
                errors: errors.array() 
            });
        }
        next();
    }
];