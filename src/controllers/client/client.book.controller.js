const bookModel = require('../../models/book.model');

exports.getAll = async (req, res) => {
    try {
        const { keyword, categoryId, limit, offset } = req.query;
        const books = await bookModel.findWithFilter({ keyword, categoryId, limit, offset });
        res.json({ data: books });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getDetail = async (req, res) => {
    try {
        const book = await bookModel.getById(req.params.id);
        if (!book) return res.status(404).json({ message: 'Không tìm thấy sách' });
        
        // [MỚI]: Tăng lượt xem lên 1 khi người dùng gọi API lấy chi tiết sách
        await bookModel.incrementViews(req.params.id);

        res.json(book);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getByISBN = async (req, res) => {
    try {
        const { isbn } = req.params;
        const book = await bookModel.getByIsbnWithStats(isbn);

        if (!book) {
            return res.status(404).json({ message: 'Không tìm thấy sách với ISBN này' });
        }

        const responseData = {
            title: book.title,
            author: book.author,
            year: book.year,
            isbn: book.isbn,
            category: book.category_name, 
            review_count: Number(book.review_count),
            // Đã sửa: Kiểm tra nếu score tồn tại mới thực hiện toFixed
            average_score: book.average_score ? Number(Number(book.average_score).toFixed(1)) : 0
        };

        res.json(responseData);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
// [MỚI]: Controller lấy danh sách Top Sách
exports.getTopBooks = async (req, res) => {
    try {
        const books = await bookModel.getTopBooks(5); // Lấy top 5
        res.json(books);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};