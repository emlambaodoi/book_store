/**
 * src/public/assets/js/common.js
 * Chứa cấu hình chung và các hàm tiện ích dùng cho toàn trang
 */

// 1. Cấu hình đường dẫn
const API_BASE_URL = 'http://localhost:3000/api';
const UPLOAD_BASE_URL = 'http://localhost:3000/uploads/';

// 2. Hàm hiển thị thông báo (Sửa lỗi showAlert is not defined)
const showAlert = (containerId, message, type = 'info') => {
    const alertPlaceholder = document.getElementById(containerId);
    if (alertPlaceholder) {
        alertPlaceholder.innerHTML = `
            <div class="alert alert-${type} alert-dismissible fade show" role="alert">
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
        `;
    }
};

// 3. Xử lý hiển thị Menu User sau khi đăng nhập
document.addEventListener('DOMContentLoaded', () => {
    const loginNavItem = document.getElementById('login-nav-item');
    if (!loginNavItem) return;

    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');

    if (!token || !userStr) return;

    try {
        const user = JSON.parse(userStr);
        const authTemplate = document.getElementById('auth-template');
        if (!authTemplate) return;

        const node = authTemplate.content.cloneNode(true);
        const nameSpan = node.querySelector('.user-name');
        if (nameSpan) nameSpan.textContent = user.name || user.email;

        if (user.role === 'admin') {
            const adminItem = node.querySelector('.admin-link-item');
            if (adminItem) adminItem.style.display = 'block';
        }

        const logoutBtn = node.querySelector('.btn-logout');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                if (confirm('Bạn muốn đăng xuất?')) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    window.location.href = '/login.html';
                }
            });
        }

        loginNavItem.innerHTML = ''; 
        loginNavItem.appendChild(node);
        loginNavItem.classList.remove('nav-item'); 
        loginNavItem.classList.add('d-flex', 'align-items-center');

    } catch (e) {
        console.error("Lỗi parse user:", e);
        localStorage.clear();
    }
});

// 4. Định dạng tiền tệ
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};