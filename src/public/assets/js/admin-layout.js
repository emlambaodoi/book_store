/**
 * src/public/assets/js/admin-layout.js
 * Nhiệm vụ: Render Sidebar & Navbar chung cho toàn bộ trang Admin
 */

const renderAdminLayout = () => {
    // 1. Tìm container để chèn Sidebar
    const sidebarContainer = document.getElementById('sidebar-container');
    
    if (sidebarContainer) {
        // Lấy tên file hiện tại để active menu
        const currentPage = window.location.pathname.split('/').pop();

        sidebarContainer.innerHTML = `
            <div class="text-center mb-4 pt-3">
                <h5 class="fw-bold text-primary"><i class="fas fa-user-shield me-2"></i>ADMIN CP</h5>
            </div>
            <ul class="nav flex-column px-2">
                <li class="nav-item mb-3">
                    <a class="btn btn-outline-primary w-100 fw-bold shadow-sm" href="../index.html">
                        <i class="fas fa-arrow-left me-2"></i>Về Website
                    </a>
                </li>
                


                <li class="nav-item">
                    <a class="nav-link ${currentPage === 'categories.html' ? 'active' : ''}" href="categories.html">
                        <i class="fas fa-tags me-2"></i> Quản lý Danh mục
                    </a>
                </li>

                <li class="nav-item">
                    <a class="nav-link ${currentPage === 'users.html' ? 'active' : ''}" href="users.html">
                        <i class="fas fa-users me-2"></i> Quản lý Người dùng
                    </a>
                </li>

                <li class="nav-item">
                    <a class="nav-link ${currentPage === 'products.html' ? 'active' : ''}" href="products.html">
                        <i class="fas fa-book me-2"></i> Quản lý Sách
                    </a>
                </li>
                
                <li class="nav-item">
                    <a class="nav-link ${currentPage === 'reviews.html' ? 'active' : ''}" href="reviews.html">
                        <i class="fas fa-star me-2"></i> Quản lý Đánh giá
                    </a>
                </li>

                <li class="nav-item mt-5 pt-5 border-top">
                    <button id="btn-logout-admin" class="nav-link btn text-danger text-start w-100">
                        <i class="fas fa-sign-out-alt me-2"></i> Đăng xuất
                    </button>
                </li>
            </ul>
        `;
    }

    // 2. Xử lý Logout
    const btnLogout = document.getElementById('btn-logout-admin');
    if (btnLogout) {
        btnLogout.addEventListener('click', () => {
            if (confirm('Đăng xuất khỏi trang quản trị?')) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '../login.html';
            }
        });
    }
};

document.addEventListener('DOMContentLoaded', renderAdminLayout);