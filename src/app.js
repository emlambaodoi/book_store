const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

// Load biến môi trường
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// --- IMPORT ROUTES ---
const authRoutes = require('./routes/auth.route');
const adminRoutes = require('./routes/admin/index.route');
const clientBookRoutes = require('./routes/client/client.book.route');
const clientCategoryRoutes = require('./routes/client/client.category.route');
const clientReviewRoutes = require('./routes/client/client.review.route');
const clientChapterRoutes = require('./routes/client/client.chapter.route'); 
const clientBookController = require('./controllers/client/client.book.controller');

// --- SETUP ROUTES API ---
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/books', clientBookRoutes);
app.use('/api/categories', clientCategoryRoutes);
app.use('/api', clientReviewRoutes); 
app.use('/api/chapters', clientChapterRoutes); 

// [WILDCARD] API Public ISBN (Để cuối cùng của cụm API)
app.get('/api/:isbn', clientBookController.getByISBN);

// --- ROUTE FRONTEND ---
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Bỏ qua yêu cầu favicon.ico để không bị rác Terminal
app.get('/favicon.ico', (req, res) => res.status(204).end());

// --- BỔ SUNG: XỬ LÝ LỖI TOÀN CỤC (GLOBAL ERROR HANDLER) ---
// Giúp server không bị sập khi có lỗi bất ngờ (ví dụ: lỗi gửi mail)
app.use((err, req, res, next) => {
    console.error("🔥 Server Error:", err.stack);
    res.status(500).json({ 
        message: "Đã có lỗi xảy ra từ phía Server!",
        error: process.env.NODE_ENV === 'development' ? err.message : {} 
    });
});

// 404 Handler
app.use((req, res) => {
    console.log(`❌ 404 Not Found: ${req.originalUrl}`);
    res.status(404).json({ message: `Không tìm thấy đường dẫn: ${req.originalUrl}` });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server đang chạy tại: http://localhost:${PORT}`);
});