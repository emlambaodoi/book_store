const jwt = require('jsonwebtoken');
require('dotenv').config();

module.exports = (req, res, next) => {
    try {
        // Kiểm tra xem frontend có gửi header Authorization không
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Bạn chưa đăng nhập hoặc sai định dạng Token (Cần có Bearer)' });
        }

        // Tách lấy chuỗi token
        const token = authHeader.split(' ')[1];

        // Giải mã
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key');
        
        // Gán vào req để file isAdmin.js dùng
        req.user = decoded; 
        next();
    } catch (error) {
        console.error("🔥 Lỗi Auth:", error.message);
        
        // Phân biệt rõ lỗi hết hạn và lỗi token bậy bạ
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại' });
        }
        return res.status(401).json({ message: 'Token không hợp lệ hoặc đã bị thay đổi' });
    }
};