const Review = require('../../models/review.model');

// [ADMIN] Xem tất cả review
exports.getAll = async (req, res) => {
    try {
        const reviews = await Review.getAllForAdmin();
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// [ADMIN] Xóa review
exports.delete = async (req, res) => {
    try {
        await Review.delete(req.params.id);
        res.json({ message: 'Đã xóa đánh giá' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};