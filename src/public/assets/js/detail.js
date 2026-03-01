const detailContainer = document.getElementById('detail-container');
const detailTemplate = document.getElementById('detail-template');
let currentBookId = null;

// [MỚI]: Hàm lấy ID người dùng hiện tại (hoặc 'guest' nếu chưa đăng nhập)
const getCurrentUserId = () => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
        try {
            const user = JSON.parse(userStr);
            return user.id ? `user_${user.id}` : 'guest';
        } catch (e) {}
    }
    return 'guest';
};

const getBookIdFromUrl = () => {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
};

const fetchBookDetail = async () => {
    const bookId = getBookIdFromUrl();
    if (!bookId) {
        window.location.href = 'index.html';
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/books/${bookId}`);
        if (!response.ok) throw new Error('Không tìm thấy sách');

        const book = await response.json();
        renderDetail(book);
    } catch (error) {
        console.error(error);
        detailContainer.innerHTML = `<div class="alert alert-danger text-center"><h3>Lỗi tải sách</h3><a href="index.html" class="btn btn-outline-danger">Về trang chủ</a></div>`;
    }
};

const renderDetail = (book) => {
    currentBookId = book.id; 
    detailContainer.innerHTML = ''; 
    const node = detailTemplate.content.cloneNode(true);

    const img = node.querySelector('.book-img');
    img.src = book.image ? `${UPLOAD_BASE_URL}${book.image}` : 'https://placehold.co/500x600?text=PolyBook';
    
    node.querySelector('.book-breadcrumb').textContent = book.title;
    node.querySelector('.book-title').textContent = book.title;
    
    let metaInfo = `Tác giả: <b>${book.author}</b>`;
    if (book.year) metaInfo += ` <span class="mx-2 text-muted">|</span> Năm XB: <b>${book.year}</b>`;
    if (book.isbn) metaInfo += ` <span class="mx-2 text-muted">|</span> ISBN: <b>${book.isbn}</b>`;

    node.querySelector('.book-author').innerHTML = metaInfo;
    
    const contentDiv = node.querySelector('.book-content');
    if(contentDiv) {
        contentDiv.textContent = book.description || "Đang cập nhật...";
        contentDiv.style.whiteSpace = 'pre-wrap';
    }

    const chapterContainer = node.querySelector('#chapter-list-client');
    const readActionsContainer = node.querySelector('.read-actions');
    
    if (chapterContainer) {
        fetchClientChapters(book.id, chapterContainer, readActionsContainer);
    }

    const reviewListContainer = node.querySelector('.review-list');
    fetchReviews(book.id, reviewListContainer);

    const relatedBooksContainer = node.querySelector('#related-books-list');
    if (relatedBooksContainer && book.category_id) {
        fetchRelatedBooks(book.category_id, book.id, relatedBooksContainer);
    }

    detailContainer.appendChild(node);
};

const fetchRelatedBooks = async (categoryId, currentId, container) => {
    try {
        const res = await fetch(`${API_BASE_URL}/books?categoryId=${categoryId}`);
        if (!res.ok) return;
        const result = await res.json();
        let books = Array.isArray(result) ? result : (result.data || []);

        const relatedBooks = books
            .filter(b => b.category_id == categoryId && b.id != currentId)
            .slice(0, 4);

        if (relatedBooks.length === 0) {
            container.innerHTML = '<div class="col-12"><p class="text-muted fst-italic">Chưa có sách nào khác trong danh mục này.</p></div>';
            return;
        }

        container.innerHTML = relatedBooks.map(b => `
            <div class="col">
                <div class="card h-100 border-0 shadow-sm book-card" onclick="window.location.href='detail.html?id=${b.id}'" style="cursor: pointer; transition: transform 0.2s; background-color: #f8f9fa;">
                    <img src="${b.image ? UPLOAD_BASE_URL + b.image : 'https://placehold.co/200x300'}" class="card-img-top rounded p-1" alt="${b.title}" style="height: 180px; object-fit: cover;" onerror="this.src='https://placehold.co/200x300'">
                    <div class="card-body p-2 text-center">
                        <h6 class="card-title fw-bold text-dark text-truncate mb-1" style="font-size: 0.9rem;" title="${b.title}">${b.title}</h6>
                        <small class="text-muted text-truncate d-block" style="font-size: 0.8rem;">${b.author}</small>
                    </div>
                </div>
            </div>
        `).join('');

        const cards = container.querySelectorAll('.book-card');
        cards.forEach(card => {
            card.addEventListener('mouseenter', () => card.style.transform = 'translateY(-5px)');
            card.addEventListener('mouseleave', () => card.style.transform = 'translateY(0)');
        });

    } catch (error) {
        console.error("Lỗi tải sách liên quan:", error);
    }
};

const fetchClientChapters = async (bookId, container, actionContainer) => {
    try {
        const res = await fetch(`${API_BASE_URL}/chapters/book/${bookId}`);
        if (!res.ok) throw new Error("Lỗi tải chương");
        const chapters = await res.json();

        if (!chapters || chapters.length === 0) {
            container.innerHTML = '<p class="text-muted fst-italic">Sách này chưa có chương nào.</p>';
            if (actionContainer) actionContainer.innerHTML = '';
            return;
        }

        // [ĐÃ SỬA]: Kiểm tra bộ nhớ theo từng User cụ thể
        if (actionContainer) {
            const userId = getCurrentUserId();
            const allProgressData = JSON.parse(localStorage.getItem('reading_progress') || '{}');
            const userProgress = allProgressData[userId] || {};
            const savedBook = userProgress[bookId];

            if (savedBook) {
                actionContainer.innerHTML = `
                    <a href="read.html?chapterId=${savedBook.chapterId}&bookId=${bookId}" class="btn btn-warning px-4 py-2 fw-bold shadow-sm text-dark rounded-pill">
                        <i class="fas fa-bookmark me-2"></i> Đọc tiếp (Chương ${savedBook.chapterNumber})
                    </a>
                `;
            } else {
                actionContainer.innerHTML = `
                    <a href="read.html?chapterId=${chapters[0].id}&bookId=${bookId}" class="btn btn-primary px-4 py-2 fw-bold shadow-sm rounded-pill">
                        <i class="fas fa-book-open me-2"></i> Bắt đầu đọc (Chương ${chapters[0].chapter_number})
                    </a>
                `;
            }
        }

        container.innerHTML = `
            <h5 class="fw-bold text-primary mb-3"><i class="fas fa-list-ul me-2"></i>Danh sách chương</h5>
            <div class="list-group shadow-sm border-0">
                ${chapters.map(chap => `
                    <a href="read.html?chapterId=${chap.id}&bookId=${bookId}" class="list-group-item list-group-item-action d-flex justify-content-between align-items-center py-3 border-start-0 border-end-0">
                        <span class="fw-bold text-dark">Chương ${chap.chapter_number}: ${chap.title}</span>
                        <span class="badge bg-primary rounded-pill px-3 py-2"><i class="fas fa-book-reader me-1"></i> Đọc</span>
                    </a>
                `).join('')}
            </div>
        `;
    } catch (error) {
        console.error(error);
        container.innerHTML = '<p class="text-danger">Không tải được chương.</p>';
    }
};

const fetchReviews = async (bookId, container) => {
    try {
        const res = await fetch(`${API_BASE_URL}/books/${bookId}/reviews`);
        if(!res.ok) return;

        const reviews = await res.json();

        if (!reviews || reviews.length === 0) {
            container.innerHTML = '<p class="text-muted fst-italic">Chưa có đánh giá nào. Hãy đọc hết sách để là người đầu tiên!</p>';
            return;
        }

        container.innerHTML = reviews.map(r => `
            <div class="border-bottom pb-3 mb-3">
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <span class="fw-bold me-2"><i class="fas fa-user-circle text-secondary"></i> ${r.user_name}</span>
                        <span class="text-warning small">
                            ${'<i class="fas fa-star"></i>'.repeat(r.rating)}
                            ${'<i class="far fa-star"></i>'.repeat(5 - r.rating)}
                        </span>
                    </div>
                    <small class="text-muted" style="font-size: 0.8rem">
                        ${new Date(r.created_at).toLocaleDateString('vi-VN')}
                    </small>
                </div>
                <p class="mb-1 mt-2 text-secondary">${r.comment}</p>
            </div>
        `).join('');

    } catch (error) {
        console.error(error);
    }
};

fetchBookDetail();