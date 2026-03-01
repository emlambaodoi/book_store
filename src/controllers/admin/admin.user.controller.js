const User = require('../../models/user.model');

exports.getList = async (req, res) => {
    try {
        const users = await User.getAll();
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.delete = async (req, res) => {
    try {
        await User.delete(req.params.id);
        res.json({ message: 'Đã khóa tài khoản thành công' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.restore = async (req, res) => {
    try {
        await User.restore(req.params.id);
        res.json({ message: 'Đã mở khóa tài khoản' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};