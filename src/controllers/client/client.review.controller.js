const Review = require('../../models/review.model');

// [MỚI]: Import hàm lọc từ bậy từ file utils
const { censorText } = require('../../utils/censor'); 

// [CLIENT] Viết đánh giá
exports.addReview = async (req, res) => {
    try {
        // Lấy bookId từ URL params (khớp với route /books/:bookId/review)
        const { bookId } = req.params;
        const { rating, comment } = req.body;
        const userId = req.user.id;

        if (!rating || !comment) return res.status(400).json({ message: 'Vui lòng nhập đủ thông tin' });

        // [QUAN TRỌNG]: Đưa bình luận qua máy lọc để biến đổi từ thô tục thành ***
        const safeComment = censorText(comment);

        // Lưu bình luận đã được bôi đen (safeComment) vào Database
        await Review.create({ userId, bookId, rating, comment: safeComment });
        
        res.status(201).json({ message: 'Đánh giá thành công' });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: 'Bạn đã đánh giá sách này rồi' });
        }
        res.status(500).json({ message: error.message });
    }
};

// [CLIENT] Xem đánh giá của 1 sách
exports.getByBook = async (req, res) => {
    try {
        const reviews = await Review.getByBookId(req.params.bookId);
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};