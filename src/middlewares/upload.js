const multer = require('multer');
const path = require('path');
const fs = require('fs');

// 1. Cấu hình nơi lưu trữ
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Tạo đường dẫn: src/public/uploads
        const uploadPath = path.join(__dirname, '../public/uploads');
        
        // Nếu thư mục chưa có thì tự tạo
        if (!fs.existsSync(uploadPath)){
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        // Đặt tên file: thời-gian-hiện-tại + tên-gốc (để tránh bị trùng)
        // Ví dụ: 1705543322-sach-hay.jpg
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

// 2. Bộ lọc (Chỉ cho upload ảnh)
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Chỉ được upload file ảnh!'), false);
    }
};

// 3. Khởi tạo upload
const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // Giới hạn 5MB
});

module.exports = upload;