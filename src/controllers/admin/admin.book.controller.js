const bookModel = require('../../models/book.model');
const fs = require('fs');
const path = require('path');

exports.getList = async (req, res) => {
    try {
        const { keyword, categoryId, limit, offset } = req.query;
        const books = await bookModel.findWithFilter({ keyword, categoryId, limit, offset, isAdmin: true });
        res.json({ data: books });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.create = async (req, res) => {
    try {
        const { title, author, year, isbn, description, content, category_id } = req.body;
        const image = req.file ? req.file.filename : null;

        const cleanupImage = () => {
            if (image) {
                const imgPath = path.join(__dirname, '../../../public/uploads', image);
                if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
            }
        };

        if (!title || !author) {
            cleanupImage();
            return res.status(400).json({ message: 'Thiếu tên sách hoặc tác giả' });
        }
        if (!category_id) {
            cleanupImage();
            return res.status(400).json({ message: 'Vui lòng chọn danh mục' });
        }

        if (isbn) {
            const isDuplicate = await bookModel.checkDuplicateIsbn(isbn);
            if (isDuplicate) {
                cleanupImage();
                return res.status(400).json({ message: `Mã ISBN ${isbn} đã tồn tại trong hệ thống!` });
            }
        }

        const newId = await bookModel.create({ title, author, year, isbn, description, content, image, category_id });
        res.status(201).json({ message: 'Thêm sách thành công', bookId: newId });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi thêm sách: ' + error.message });
    }
};

exports.update = async (req, res) => {
    try {
        const id = req.params.id;
        const { title, author, year, isbn, description, content, category_id } = req.body;
        
        const oldBook = await bookModel.getById(id);
        const cleanupNewImage = () => {
            if (req.file) {
                const imgPath = path.join(__dirname, '../../../public/uploads', req.file.filename);
                if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
            }
        };

        if (!oldBook) {
            cleanupNewImage();
            return res.status(404).json({ message: 'Sách không tồn tại' });
        }

        if (isbn) {
            const isDuplicate = await bookModel.checkDuplicateIsbn(isbn, id);
            if (isDuplicate) {
                cleanupNewImage();
                return res.status(400).json({ message: `Mã ISBN ${isbn} đã được sử dụng cho cuốn sách khác!` });
            }
        }

        let image = oldBook.image;
        if (req.file) {
            image = req.file.filename;
            if (oldBook.image) {
                const oldPath = path.join(__dirname, '../../../public/uploads', oldBook.image);
                if (fs.existsSync(oldPath)) {
                    try { fs.unlinkSync(oldPath); } catch(e) {}
                }
            }
        }

        await bookModel.update(id, { title, author, year, isbn, description, content, image, category_id });
        res.json({ message: 'Cập nhật thành công' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi cập nhật: ' + error.message });
    }
};

exports.delete = async (req, res) => {
    try {
        const id = req.params.id;
        await bookModel.delete(id);
        res.json({ message: 'Đã khóa sách thành công' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khóa sách: ' + error.message });
    }
};

exports.restore = async (req, res) => {
    try {
        await bookModel.restore(req.params.id);
        res.json({ message: 'Đã khôi phục sách thành công' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khôi phục: ' + error.message });
    }
};