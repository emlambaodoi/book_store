/**
 * src/public/assets/js/profile.js
 * Logic Hồ sơ cá nhân: Thông tin User, Sách đang đọc dở, Sách yêu thích
 */

// 1. Kiểm tra trạng thái đăng nhập
const checkProfileAuth = () => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    if (!token || !userStr) {
        alert("Bạn cần đăng nhập để xem trang này!");
        window.location.href = 'login.html';
        return null;
    }
    try {
        return JSON.parse(userStr);
    } catch (e) {
        return null;
    }
};

const currentUser = checkProfileAuth();

document.addEventListener('DOMContentLoaded', () => {
    if (!currentUser) return;

    // Hiển thị thông tin cá nhân
    document.getElementById('profile-name').textContent = currentUser.name || 'Người dùng ẩn danh';
    document.getElementById('profile-role').textContent = currentUser.role === 'admin' ? 'Quản trị viên' : 'Độc giả';
    
    // Tự động tạo Avatar dựa vào chữ cái đầu của Tên
    const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name || 'U')}&background=0D8ABC&color=fff&size=128&bold=true`;
    document.getElementById('avatar-img').src = avatarUrl;

    // Tải dữ liệu lịch sử và yêu thích
    loadReadingHistory();
    loadFavoriteBooks();
});

// 2. Hàm tải danh sách Sách đang đọc dở
const loadReadingHistory = async () => {
    const container = document.getElementById('reading-history-list');
    const userId = currentUser.id ? `user_${currentUser.id}` : 'guest';
    
    const allProgressData = JSON.parse(localStorage.getItem('reading_progress') || '{}');
    const myProgress = allProgressData[userId] || {};
    const bookIds = Object.keys(myProgress);

    if (bookIds.length === 0) {
        container.innerHTML = `
            <div class="text-center text-muted py-5">
                <i class="fas fa-book-open fs-1 mb-3 opacity-25"></i>
                <h5>Bạn chưa đọc cuốn sách nào.</h5>
                <a href="index.html" class="btn btn-primary mt-3 px-4 rounded-pill fw-bold">Khám phá ngay</a>
            </div>`;
        return;
    }

    container.innerHTML = ''; 
    const row = document.createElement('div');
    row.className = 'row row-cols-1 row-cols-md-2 g-3';

    for (const bookId of bookIds) {
        const progress = myProgress[bookId];
        try {
            const res = await fetch(`${API_BASE_URL}/books/${bookId}`);
            if (!res.ok) continue; 
            const book = await res.json();

            const col = document.createElement('div');
            col.className = 'col';
            col.innerHTML = `
                <div class="card h-100 border shadow-sm flex-row align-items-center p-2 rounded-3 hover-lift" style="transition: transform 0.2s;">
                    <img src="${book.image ? UPLOAD_BASE_URL + book.image : 'https://placehold.co/100x150'}" class="rounded" style="width: 80px; height: 115px; object-fit: cover;" alt="${book.title}">
                    <div class="card-body py-1 px-3 d-flex flex-column justify-content-center">
                        <h6 class="card-title fw-bold text-dark mb-1 text-truncate" style="max-width: 150px;">${book.title}</h6>
                        <small class="text-muted d-block mb-3"><i class="fas fa-bookmark text-warning me-1"></i>Chương ${progress.chapterNumber}</small>
                        <a href="read.html?chapterId=${progress.chapterId}&bookId=${bookId}" class="btn btn-outline-primary btn-sm fw-bold rounded-pill w-100">
                            Đọc tiếp <i class="fas fa-arrow-right ms-1"></i>
                        </a>
                    </div>
                </div>`;
            row.appendChild(col);
        } catch (error) {
            console.error(`Lỗi tải sách ${bookId}:`, error);
        }
    }

    if (row.children.length === 0) {
        container.innerHTML = '<p class="text-center text-muted py-4">Tất cả sách bạn đang đọc đã bị gỡ.</p>';
    } else {
        container.appendChild(row);
    }
};

// 3. [MỚI]: Hàm tải danh sách Sách yêu thích
const loadFavoriteBooks = async () => {
    const container = document.getElementById('favorite-books-list');
    const favKey = currentUser.id ? `fav_user_${currentUser.id}` : 'fav_guest';
    const favorites = JSON.parse(localStorage.getItem(favKey) || '[]');

    if (favorites.length === 0) {
        container.innerHTML = `
            <div class="text-center text-muted py-5">
                <i class="far fa-heart fs-1 mb-3 opacity-25"></i>
                <p>Bạn chưa yêu thích cuốn sách nào.</p>
            </div>`;
        return;
    }

    container.innerHTML = '';
    const row = document.createElement('div');
    row.className = 'row row-cols-2 row-cols-md-4 g-3';

    for (const bookId of favorites) {
        try {
            const res = await fetch(`${API_BASE_URL}/books/${bookId}`);
            if (!res.ok) continue;
            const book = await res.json();

            const col = document.createElement('div');
            col.className = 'col';
            col.innerHTML = `
                <div class="card h-100 border-0 shadow-sm text-center p-2 rounded-3" onclick="window.location.href='detail.html?id=${book.id}'" style="cursor: pointer; transition: transform 0.2s;">
                    <img src="${book.image ? UPLOAD_BASE_URL + book.image : 'https://placehold.co/100x150'}" class="rounded mb-2 shadow-sm" style="height: 150px; width: 100%; object-fit: cover;" alt="${book.title}">
                    <h6 class="fw-bold small mb-0 text-dark text-truncate" title="${book.title}">${book.title}</h6>
                    <small class="text-muted text-truncate d-block" style="font-size: 0.75rem;">${book.author}</small>
                </div>`;
            
            // Thêm hiệu ứng hover nhẹ
            const card = col.querySelector('.card');
            card.addEventListener('mouseenter', () => card.style.transform = 'translateY(-5px)');
            card.addEventListener('mouseleave', () => card.style.transform = 'translateY(0)');
            
            row.appendChild(col);
        } catch (e) {
            console.error("Lỗi tải sách yêu thích:", e);
        }
    }
    container.appendChild(row);
};