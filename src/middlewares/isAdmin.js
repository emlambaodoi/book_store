module.exports = (req, res, next) => {
    // req.user được tạo ra từ file auth.js
    if (!req.user) {
        return res.status(401).json({ message: 'Không tìm thấy thông tin người dùng' });
    }

    if (req.user.role === 'admin') {
        next(); // Là admin thì cho qua
    } else {
        // Ghi log ra để bạn biết ai đang cố truy cập
        console.log(`❌ Tài khoản ${req.user.email} (Role: ${req.user.role}) cố gắng truy cập trang Admin!`);
        res.status(403).json({ message: 'Bạn không có quyền Quản trị viên (Admin)' });
    }
};