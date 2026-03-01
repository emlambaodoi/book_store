const User = require('../models/user.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer'); 
const { db } = require('../config/db');

// 1. Chức năng Đăng ký
exports.register = async (req, res) => {
    try {
        const { fullName, email, password } = req.body;
        
        // Đã xóa bỏ các lệnh if check rỗng ở đây vì file validator.js đã chặn ngay từ đầu.

        const exists = await User.findByEmail(email);
        if (exists) return res.status(400).json({ message: 'Email đã tồn tại' });

        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Trim khoảng trắng thừa một lần nữa trước khi lưu vào DB cho sạch sẽ
        await User.create(fullName.trim(), email.trim(), hashedPassword, 'user');

        res.status(201).json({ message: 'Đăng ký thành công' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 2. Chức năng Đăng nhập
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findByEmail(email);

        if (!user) return res.status(400).json({ message: 'Sai email hoặc mật khẩu' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Sai email hoặc mật khẩu' });

        // [MỚI]: KIỂM TRA NẾU TÀI KHOẢN ĐANG BỊ YÊU CẦU ĐỔI MẬT KHẨU
        if (user.require_change === 1) {
            // Cấp một Token tạm thời (chỉ có tác dụng 15 phút để đổi mật khẩu)
            const tempToken = jwt.sign(
                { id: user.id, email: user.email }, 
                process.env.JWT_SECRET || 'secret_key', 
                { expiresIn: '15m' }
            );
            
            return res.json({ 
                requireChange: true, // Cờ báo cho Frontend biết để hiện Modal
                message: 'Vui lòng đổi mật khẩu mới để bảo mật tài khoản!',
                tempToken 
            });
        }

        // Đăng nhập bình thường
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role }, 
            process.env.JWT_SECRET || 'secret_key', 
            { expiresIn: '24h' }
        );

        res.json({ 
            message: 'Đăng nhập thành công', 
            token,
            user: { id: user.id, name: user.name, role: user.role }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 3. Chức năng Quên mật khẩu
exports.forgotPassword = async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Vui lòng cung cấp email' });

    try {
        const user = await User.findByEmail(email);
        if (!user) return res.status(404).json({ message: 'Email không tồn tại trên hệ thống' });

        const newPassword = Math.random().toString(36).slice(-6);
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // [SỬA TẠI ĐÂY]: Thêm require_change = 1 để hệ thống biết đây là pass tạm thời
        await db.query("UPDATE users SET password = ?, require_change = 1 WHERE email = ?", [hashedPassword, email]);

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER, 
                pass: process.env.EMAIL_PASS  
            }
        });

        const mailOptions = {
            from: `"PolyBook Support" <${process.env.EMAIL_USER}>`, 
            to: email, 
            subject: 'Khôi phục mật khẩu tài khoản PolyBook',
            html: `
                <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                    <h3>Xin chào ${user.name},</h3>
                    <p>Bạn đã yêu cầu khôi phục mật khẩu tại <b>PolyBook Review</b>.</p>
                    <p>Mật khẩu tạm thời mới của bạn là: <b style="color: #0d6efd; font-size: 1.2rem;">${newPassword}</b></p>
                    <p>Vui lòng đăng nhập và tiến hành đổi mật khẩu ngay để bảo mật tài khoản.</p>
                    <hr>
                    <small>Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email này.</small>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        res.json({ message: 'Mật khẩu mới đã được gửi vào Gmail của bạn!' });

    } catch (error) {
        console.error("CHI TIẾT LỖI TỪ GOOGLE:", error.message); 
        res.status(500).json({ message: 'Lỗi: ' + error.message });
    }
};

// 4. [MỚI] Chức năng Đổi mật khẩu bắt buộc
exports.changeTempPassword = async (req, res) => {
    try {
        const { newPassword } = req.body;
        const userId = req.user.id; // req.user được lấy từ middleware auth.js

        if (!newPassword || newPassword.length < 6) {
            return res.status(400).json({ message: 'Mật khẩu phải có ít nhất 6 ký tự' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        
        // Cập nhật mật khẩu mới và TẮT CỜ require_change (trả về 0)
        await db.query("UPDATE users SET password = ?, require_change = 0 WHERE id = ?", [hashedPassword, userId]);

        // Lấy lại thông tin user để tạo Token chính thức
        const [[user]] = await db.query("SELECT * FROM users WHERE id = ?", [userId]);

        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role }, 
            process.env.JWT_SECRET || 'secret_key', 
            { expiresIn: '24h' }
        );

        res.json({ 
            message: 'Đổi mật khẩu thành công! Chào mừng bạn quay lại.', 
            token, 
            user: { id: user.id, name: user.name, role: user.role } 
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};