/**
 * client/js/register.js
 * Logic Đăng ký (Modern JS)
 */

const registerForm = document.getElementById('register-form');
const submitBtn = document.getElementById('btn-submit');

// Hàm xử lý đăng ký
const handleRegister = async (e) => {
    e.preventDefault(); // Chặn load lại trang

    // 1. Lấy dữ liệu form
    const fullName = document.getElementById('fullname').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    // 2. Disable nút để tránh bấm nhiều lần
    const originalBtnText = submitBtn.textContent;
    submitBtn.textContent = 'Đang xử lý...';
    submitBtn.disabled = true;

    try {
        // 3. Gọi API (Sử dụng API_BASE_URL từ common.js)
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ fullName, email, password })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Đăng ký thất bại');
        }

        // 4. Thành công
        showAlert('register-alert', 'Đăng ký thành công! Đang chuyển hướng...', 'success');
        
        // Chuyển sang trang Login sau 1.5s
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1500);

    } catch (error) {
        // 5. Xử lý lỗi
        showAlert('register-alert', error.message, 'danger');
        
        // Reset nút bấm
        submitBtn.textContent = originalBtnText;
        submitBtn.disabled = false;
    }
};

// Gán sự kiện
if (registerForm) {
    registerForm.addEventListener('submit', handleRegister);
}