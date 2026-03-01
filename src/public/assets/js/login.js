const loginForm = document.getElementById('login-form');    
const submitBtn = document.getElementById('btn-submit');

// Biến lưu trữ token tạm thời khi được yêu cầu đổi mật khẩu
let temporaryToken = ''; 

// ==========================================
// 1. CHỨC NĂNG ĐĂNG NHẬP
// ==========================================
const handleLogin = async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    const originalBtnText = submitBtn.textContent;
    submitBtn.textContent = 'Đang xử lý...';
    submitBtn.disabled = true;

    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Đăng nhập thất bại');
        }

        // [MỚI]: KIỂM TRA CỜ BẮT BUỘC ĐỔI MẬT KHẨU
        if (data.requireChange) {
            temporaryToken = data.tempToken; // Cất token tạm vào biến toàn cục
            
            // Gọi Modal hiển thị yêu cầu đổi mật khẩu lên
            const changeModal = new bootstrap.Modal(document.getElementById('forceChangePasswordModal'));
            changeModal.show();
            
            // Trả lại trạng thái cho nút đăng nhập và dừng luồng chạy tại đây
            submitBtn.textContent = originalBtnText;
            submitBtn.disabled = false;
            return; 
        }

        // --- NẾU ĐĂNG NHẬP BÌNH THƯỜNG ---
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        showAlert('login-alert', 'Đăng nhập thành công! Đang chuyển hướng...', 'success');

        // [ĐÃ SỬA] - Tất cả đều chuyển về trang chủ
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);

    } catch (error) {
        console.error('Lỗi đăng nhập:', error);
        showAlert('login-alert', error.message, 'danger');
        
        submitBtn.textContent = originalBtnText;
        submitBtn.disabled = false;
    }
};

if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
}

// ==========================================
// 2. CHỨC NĂNG QUÊN MẬT KHẨU
// ==========================================
window.submitForgotPassword = async () => {
    const emailInput = document.getElementById('forgot-email');
    const email = emailInput.value.trim();
    const btnSubmitForgot = document.getElementById('btn-confirm-forgot');
    const alertBox = document.getElementById('forgot-alert');

    if (!email) {
        alertBox.innerHTML = '<div class="alert alert-danger py-2 small fw-bold"><i class="fas fa-exclamation-circle me-1"></i> Vui lòng nhập email!</div>';
        return;
    }

    const originalText = btnSubmitForgot.innerHTML;
    btnSubmitForgot.disabled = true;
    btnSubmitForgot.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Đang xử lý...';
    alertBox.innerHTML = ''; 

    try {
        const res = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });

        const data = await res.json();
        
        if (res.ok) {
            alertBox.innerHTML = `<div class="alert alert-success py-2 small fw-bold"><i class="fas fa-check-circle me-1"></i> ${data.message}</div>`;
            emailInput.value = ''; 
            
            setTimeout(() => {
                const modalElement = document.getElementById('forgotPasswordModal');
                const modalInstance = bootstrap.Modal.getInstance(modalElement);
                if (modalInstance) modalInstance.hide();
                alertBox.innerHTML = ''; 
            }, 3000);
            
        } else {
            alertBox.innerHTML = `<div class="alert alert-danger py-2 small fw-bold"><i class="fas fa-exclamation-triangle me-1"></i> ${data.message}</div>`;
        }
    } catch (error) {
        alertBox.innerHTML = '<div class="alert alert-danger py-2 small fw-bold"><i class="fas fa-wifi me-1"></i> Lỗi kết nối đến máy chủ!</div>';
    } finally {
        btnSubmitForgot.disabled = false;
        btnSubmitForgot.innerHTML = originalText;
    }
};

// ==========================================
// 3. CHỨC NĂNG ĐỔI MẬT KHẨU TẠM THỜI
// ==========================================
window.submitForceChangePassword = async () => {
    const newPassword = document.getElementById('new-password').value;
    const alertBox = document.getElementById('force-change-alert');
    const btnSubmitChange = document.getElementById('btn-confirm-change');

    if (newPassword.length < 6) {
        alertBox.innerHTML = '<div class="alert alert-danger py-2 small fw-bold"><i class="fas fa-exclamation-circle me-1"></i> Mật khẩu phải từ 6 ký tự!</div>';
        return;
    }

    const originalText = btnSubmitChange.innerHTML;
    btnSubmitChange.disabled = true;
    btnSubmitChange.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Đang xử lý...';

    try {
        const res = await fetch(`${API_BASE_URL}/auth/change-temp-password`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${temporaryToken}` // Kẹp token tạm vào để server xác thực
            },
            body: JSON.stringify({ newPassword })
        });

        const data = await res.json();
        
        if (!res.ok) throw new Error(data.message);

        // Đổi thành công: Hiện thông báo và lưu Token CHÍNH THỨC
        alertBox.innerHTML = `<div class="alert alert-success py-2 small fw-bold"><i class="fas fa-check-circle me-1"></i> ${data.message}</div>`;
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        // [ĐÃ SỬA] - Tự động chuyển thẳng về trang chủ sau 1.5 giây
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);

    } catch (error) {
        alertBox.innerHTML = `<div class="alert alert-danger py-2 small fw-bold"><i class="fas fa-exclamation-triangle me-1"></i> ${error.message}</div>`;
        btnSubmitChange.disabled = false;
        btnSubmitChange.innerHTML = originalText;
    }
};