/**
 * src/public/assets/js/home.js
 * Logic Trang Chủ: Load sách, Tìm kiếm, Lọc danh mục, Sách yêu thích, Top sách
 */

const listBooksElement = document.getElementById('list-books');
const categorySelect = document.getElementById('category-filter');
const keywordInput = document.getElementById('keyword');
const searchBtn = document.getElementById('btn-search');
const listTitleElement = document.getElementById('list-title');

// Hàm lấy Key lưu trữ yêu thích riêng biệt cho từng User
const getFavKey = () => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
        try {
            const user = JSON.parse(userStr);
            return user.id ? `fav_user_${user.id}` : 'fav_guest';
        } catch (e) {}
    }
    return 'fav_guest';
};

// 1. Tải Danh mục vào Select box
const loadCategories = async () => {
    if (!categorySelect) return;
    try {
        const res = await fetch(`${API_BASE_URL}/categories`);
        if (!res.ok) throw new Error("Lỗi tải danh mục");
        const categories = await res.json();
        categorySelect.innerHTML = '<option value="">🌟 Tất cả Sách 🌟</option>';
        categories.forEach(cat => {
            const opt = document.createElement('option');
            opt.value = cat.id;
            opt.textContent = cat.name;
            categorySelect.appendChild(opt);
        });
    } catch (error) {
        console.error("Home Categories Error:", error);
    }
};

// 2. Tải Sách (Có tìm kiếm & Lọc)
const fetchBooks = async (queryParams = '') => {
    try {
        if(listBooksElement) {
            listBooksElement.innerHTML = '<div class="col-12 text-center py-5"><div class="spinner-border text-primary"></div></div>';
        }

        const response = await fetch(`${API_BASE_URL}/books${queryParams}`);
        
        if (!response.ok) {
            if (response.status === 401) throw new Error("Phiên đăng nhập hết hạn");
            throw new Error(`Lỗi Server (${response.status})`);
        }

        const result = await response.json(); 
        const books = Array.isArray(result) ? result : (result.data || []);
        
        renderBooks(books);

    } catch (error) {
        console.error("Home Fetch Error:", error);
        if(listBooksElement) {
            listBooksElement.innerHTML = `
                <div class="col-12 text-center py-5 text-danger">
                    <i class="fas fa-exclamation-triangle fa-2x mb-3"></i>
                    <p>Không thể tải dữ liệu sách!</p>
                    <small>${error.message}</small>
                </div>`;
        }
    }
};

// 3. Render Sách ra HTML
const renderBooks = (books) => {
    if (!listBooksElement) return;
    listBooksElement.innerHTML = '';

    if (!books || books.length === 0) {
        listBooksElement.innerHTML = '<div class="col-12 text-center py-5"><p class="text-muted">Không tìm thấy sách nào khớp với từ khóa!</p></div>';
        return;
    }

    const template = document.getElementById('book-template');
    if (!template) return;

    const favKey = getFavKey();
    let favorites = JSON.parse(localStorage.getItem(favKey) || '[]');

    const fragment = document.createDocumentFragment();
    books.forEach(book => {
        const node = template.content.cloneNode(true);
        const img = node.querySelector('.book-img');
        const title = node.querySelector('.book-title');
        const author = node.querySelector('.book-author');
        const catBadge = node.querySelector('.category-badge');
        const favBtn = node.querySelector('.btn-favorite'); 

        if (img) img.src = book.image ? `${UPLOAD_BASE_URL}${book.image}` : 'https://placehold.co/300x450?text=No+Image';
        if (title) title.textContent = book.title;
        if (author) author.innerHTML = `<i class="fas fa-pen-nib me-1"></i> ${book.author}`;
        if (catBadge && book.category_name) catBadge.textContent = book.category_name;

        if (favBtn) {
            const heartIcon = favBtn.querySelector('i');
            if (favorites.includes(book.id)) {
                heartIcon.classList.replace('far', 'fas');
            }

            favBtn.onclick = (e) => {
                e.stopPropagation(); 
                
                let currentFavs = JSON.parse(localStorage.getItem(favKey) || '[]');
                
                if (currentFavs.includes(book.id)) {
                    currentFavs = currentFavs.filter(id => id !== book.id);
                    heartIcon.classList.replace('fas', 'far');
                } else {
                    currentFavs.push(book.id);
                    heartIcon.classList.replace('far', 'fas');
                }
                
                localStorage.setItem(favKey, JSON.stringify(currentFavs));
            };
        }

        const basePath = window.location.pathname.includes('/admin/') ? '../' : '';
        const goToDetail = () => window.location.href = `${basePath}detail.html?id=${book.id}`;
        
        if (img) img.addEventListener('click', goToDetail);
        if (title) title.addEventListener('click', goToDetail);
        const btn = node.querySelector('.btn-detail');
        if (btn) btn.addEventListener('click', goToDetail);

        fragment.appendChild(node);
    });
    listBooksElement.appendChild(fragment);
};

// 4. [MỚI] Tải Top Sách Đọc Nhiều
const loadTopBooks = async () => {
    const topBooksList = document.getElementById('top-books-list');
    if (!topBooksList) return;

    try {
        const res = await fetch(`${API_BASE_URL}/books/top`);
        if (!res.ok) throw new Error("Lỗi tải top sách");
        const topBooks = await res.json();

        topBooksList.innerHTML = ''; 
        
        if (topBooks.length === 0) {
            topBooksList.innerHTML = '<li class="list-group-item text-muted text-center py-3">Chưa có dữ liệu</li>';
            return;
        }

        topBooks.forEach((book, index) => {
            let badgeClass = 'bg-secondary';
            if (index === 0) badgeClass = 'bg-danger';
            else if (index === 1) badgeClass = 'bg-warning text-dark';
            else if (index === 2) badgeClass = 'bg-info text-dark';

            const imgSrc = book.image ? `${UPLOAD_BASE_URL}${book.image}` : 'https://placehold.co/50';

            const li = document.createElement('li');
            li.className = 'list-group-item d-flex align-items-center py-3 border-bottom' ;
            li.style.cursor = 'pointer';
            li.style.transition = 'background-color 0.2s';
            li.onclick = () => window.location.href = `detail.html?id=${book.id}`; 
            
            li.innerHTML = `
                <span class="badge ${badgeClass} rounded-pill me-3 fs-6 d-flex align-items-center justify-content-center shadow-sm" style="width: 32px; height: 32px;">${index + 1}</span>
                <img src="${imgSrc}" class="rounded shadow-sm me-3" style="width: 45px; height: 65px; object-fit: cover;" alt="cover">
                <div class="flex-grow-1 overflow-hidden">
                    <h6 class="mb-1 fw-bold text-truncate text-dark" title="${book.title}" style="font-size: 0.95rem;">${book.title}</h6>
                    <small class="text-muted"><i class="far fa-eye me-1 text-primary"></i>${book.views || 0} lượt xem</small>
                </div>
            `;

            li.onmouseover = () => li.style.backgroundColor = '#f8f9fa';
            li.onmouseout = () => li.style.backgroundColor = 'transparent';

            topBooksList.appendChild(li);
        });
    } catch (error) {
        console.error("Home Top Books Error:", error);
    }
};

// 5. Hàm xử lý tìm kiếm chung (Đã tích hợp đổi Tiêu đề động)
const handleSearch = () => {
    const params = new URLSearchParams();
    let titleText = 'Truyện Mới Cập Nhật';

    if (keywordInput?.value.trim()) {
        const keyword = keywordInput.value.trim();
        params.append('keyword', keyword);
        titleText = `Kết quả tìm kiếm: "${keyword}"`;
    }

    if (categorySelect?.value) {
        params.append('categoryId', categorySelect.value);
        if (!keywordInput?.value.trim()) {
            const selectedText = categorySelect.options[categorySelect.selectedIndex].text;
            titleText = `${selectedText}`;
        }
    }

    // Cập nhật thẻ tiêu đề nếu có
    if (listTitleElement) {
        listTitleElement.textContent = titleText;
    }

    fetchBooks(`?${params.toString()}`);
};

// 6. Kỹ thuật Debounce cho ô tìm kiếm
let searchTimeout;
const handleLiveSearch = () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        handleSearch();
    }, 500); 
};

// Khởi tạo trang
document.addEventListener('DOMContentLoaded', () => {
    loadCategories();
    fetchBooks();
    loadTopBooks(); // Khởi chạy hàm tải Top Sách
});

// Gán sự kiện
if(searchBtn) searchBtn.addEventListener('click', handleSearch);
if(categorySelect) categorySelect.addEventListener('change', handleSearch);
if(keywordInput) keywordInput.addEventListener('input', handleLiveSearch);