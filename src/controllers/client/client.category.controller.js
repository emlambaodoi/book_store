const Category = require('../../models/category.model');

// [CLIENT] Lấy danh sách để hiển thị menu/filter
exports.getAll = async (req, res) => {
    try {
        const categories = await Category.getAll();
        res.json(categories);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};