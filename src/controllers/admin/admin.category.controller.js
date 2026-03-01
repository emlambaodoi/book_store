const Category = require('../../models/category.model');

exports.getList = async (req, res) => {
    try {
        const categories = await Category.getAll();
        res.json(categories);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.create = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) return res.status(400).json({ message: 'Tên danh mục không được trống' });
        
        const isExist = await Category.checkNameExists(name);
        if (isExist) return res.status(400).json({ message: 'Tên danh mục này đã tồn tại!' });

        await Category.create(name);
        res.status(201).json({ message: 'Thêm danh mục thành công' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.update = async (req, res) => {
    try {
        const { name } = req.body;
        const { id } = req.params;

        if (!name) return res.status(400).json({ message: 'Tên danh mục không được trống' });

        const isExist = await Category.checkNameExists(name, id);
        if (isExist) return res.status(400).json({ message: 'Tên danh mục này đã tồn tại!' });

        await Category.update(id, name);
        res.json({ message: 'Cập nhật thành công' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.delete = async (req, res) => {
    try {
        const { id } = req.params;
        const hasBooks = await Category.checkHasBooks(id);
        if (hasBooks) {
            return res.status(400).json({ message: 'Không thể khóa! Danh mục này đang chứa sách hoạt động.' });
        }

        await Category.delete(id);
        res.json({ message: 'Đã khóa danh mục' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.restore = async (req, res) => {
    try {
        await Category.restore(req.params.id);
        res.json({ message: 'Đã khôi phục danh mục' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};