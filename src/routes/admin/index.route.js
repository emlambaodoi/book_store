const express = require('express');
const router = express.Router();

const auth = require('../../middlewares/auth');
const isAdmin = require('../../middlewares/isAdmin');

// Import routes con
const bookRoutes = require('./admin.book.route');
const categoryRoutes = require('./admin.category.route');
const userRoutes = require('./admin.user.route');
const reviewRoutes = require('./admin.review.route');
const chapterRoutes = require('./admin.chapter.route');

// --- BẢO VỆ TOÀN BỘ KHU VỰC ADMIN ---
// Mọi request đi vào /api/admin/... đều phải qua 2 chốt chặn này
router.use(auth);
router.use(isAdmin);

// Định nghĩa đường dẫn
router.use('/books', bookRoutes);
router.use('/chapters', chapterRoutes);
router.use('/categories', categoryRoutes);
router.use('/users', userRoutes);
router.use('/reviews', reviewRoutes);

module.exports = router;