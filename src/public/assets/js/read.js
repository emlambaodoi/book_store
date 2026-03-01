const urlParams = new URLSearchParams(window.location.search);
const chapterId = urlParams.get('chapterId');
const bookId = urlParams.get('bookId');

let allChapters = [];
let currentFontSize = parseInt(localStorage.getItem('readingFontSize')) || 20;
let currentTheme = localStorage.getItem('readingTheme') || 'theme-light';
let isInitialLoad = true; 
let scrollTimeout;

// [MỚI]: Hàm lấy ID người dùng hiện tại
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

document.addEventListener('DOMContentLoaded', () => {
    if (!chapterId || !bookId) {
        alert("Không tìm thấy thông tin chương!");
        window.location.href = 'index.html';
        return;
    }
    
    document.getElementById('back-to-book').href = `detail.html?id=${bookId}`;

    applyTheme(currentTheme);
    applyFontSize();
    setupToolbar();

    fetchAllChapters();
    fetchChapterContent();
    setupReviewSystem(); 
});

const fetchAllChapters = async () => {
    try {
        const res = await fetch(`${API_BASE_URL}/chapters/book/${bookId}`);
        if (res.ok) {
            allChapters = await res.json();
            updateNavigationButtons();
        }
    } catch (e) {
        console.error("Lỗi lấy danh sách chương:", e);
    }
};

const updateNavigationButtons = () => {
    const currentIndex = allChapters.findIndex(c => c.id == chapterId);
    const btnPrev = document.getElementById('btn-prev');
    const btnNext = document.getElementById('btn-next');
    const reviewSection = document.getElementById('review-section');

    if (currentIndex > 0) {
        btnPrev.disabled = false;
        btnPrev.onclick = () => window.location.href = `read.html?chapterId=${allChapters[currentIndex - 1].id}&bookId=${bookId}`;
    } else {
        btnPrev.disabled = true;
    }

    if (currentIndex !== -1 && currentIndex < allChapters.length - 1) {
        btnNext.disabled = false;
        btnNext.onclick = () => window.location.href = `read.html?chapterId=${allChapters[currentIndex + 1].id}&bookId=${bookId}`;
        reviewSection.style.display = 'none'; 
    } else {
        btnNext.disabled = true;
        reviewSection.style.display = 'block';
    }
};

const fetchChapterContent = async () => {
    try {
        const res = await fetch(`${API_BASE_URL}/chapters/${chapterId}`);
        if (!res.ok) throw new Error("Lỗi tải chương");
        
        const chapter = await res.json();
        
        document.title = `Chương ${chapter.chapter_number}: ${chapter.title} - PolyBook`;
        document.getElementById('nav-chapter-title').textContent = `Chương ${chapter.chapter_number}`;
        document.getElementById('chapter-title').textContent = `Chương ${chapter.chapter_number}: ${chapter.title}`;
        document.getElementById('chapter-content').textContent = chapter.content;

        // [ĐÃ SỬA]: LƯU THÔNG TIN ĐỌC THEO NGƯỜI DÙNG
        const userId = getCurrentUserId();
        let allProgressData = JSON.parse(localStorage.getItem('reading_progress') || '{}');
        
        // Khởi tạo ngăn chứa riêng cho User này nếu chưa có
        if (!allProgressData[userId]) allProgressData[userId] = {};
        
        let userProgress = allProgressData[userId];
        const oldScroll = (userProgress[bookId] && userProgress[bookId].chapterId == chapter.id) ? userProgress[bookId].scroll : 0;
        
        userProgress[bookId] = {
            chapterId: chapter.id,
            chapterNumber: chapter.chapter_number,
            scroll: oldScroll 
        };
        
        // Cập nhật lại vào ngăn của User hiện tại và lưu trữ chung
        allProgressData[userId] = userProgress;
        localStorage.setItem('reading_progress', JSON.stringify(allProgressData));

        setTimeout(() => {
            if (oldScroll > 0) {
                window.scrollTo({ top: oldScroll, behavior: 'smooth' });
            }
            isInitialLoad = false; 
        }, 300); 

    } catch (error) {
        console.error(error);
        document.getElementById('chapter-content').innerHTML = '<p class="text-danger text-center mt-5">Không thể tải nội dung.</p>';
    }
};

const setupToolbar = () => {
    document.getElementById('btn-font-increase').addEventListener('click', () => {
        if (currentFontSize < 36) { currentFontSize += 2; applyFontSize(); }
    });
    document.getElementById('btn-font-decrease').addEventListener('click', () => {
        if (currentFontSize > 14) { currentFontSize -= 2; applyFontSize(); }
    });
    document.querySelectorAll('.theme-circle').forEach(circle => {
        circle.addEventListener('click', (e) => {
            applyTheme(e.target.getAttribute('data-theme'));
        });
    });
};

const applyFontSize = () => {
    document.getElementById('chapter-content').style.fontSize = `${currentFontSize}px`;
    localStorage.setItem('readingFontSize', currentFontSize);
};

const applyTheme = (themeClass) => {
    document.body.classList.remove('theme-light', 'theme-sepia', 'theme-dark');
    document.body.classList.add(themeClass);
    currentTheme = themeClass;
    localStorage.setItem('readingTheme', themeClass);
};

const setupReviewSystem = () => {
    const btnShowReview = document.getElementById('btn-show-review');
    const ratingStars = document.querySelectorAll('.rating-stars i');
    const ratingInput = document.getElementById('rating-input');
    const reviewForm = document.getElementById('review-form');

    if (btnShowReview) {
        btnShowReview.addEventListener('click', () => {
            const token = localStorage.getItem('token');
            if (!token) {
                if(confirm('Bạn cần đăng nhập để viết đánh giá. Đăng nhập ngay?')) window.location.href = 'login.html';
                return;
            }
            new bootstrap.Modal(document.getElementById('reviewModal')).show();
        });
    }

    if (ratingStars.length > 0) {
        ratingStars.forEach(star => {
            star.addEventListener('click', function() {
                const val = this.getAttribute('data-value');
                ratingInput.value = val;
                ratingStars.forEach(s => {
                    if(s.getAttribute('data-value') <= val) {
                        s.className = 'fas fa-star'; s.style.color = '#ffc107';
                    } else {
                        s.className = 'far fa-star'; s.style.color = '';
                    }
                });
            });
        });
    }

    if (reviewForm) {
        reviewForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const token = localStorage.getItem('token');
            const rating = ratingInput.value;
            const comment = document.getElementById('review-comment').value;

            if (rating == 0) return alert('Vui lòng chọn số sao!'); 

            try {
                const res = await fetch(`${API_BASE_URL}/books/${bookId}/review`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify({ rating, comment })
                });

                const data = await res.json();
                if (res.ok) {
                    alert('Cảm ơn bạn đã đánh giá! Hệ thống sẽ đưa bạn về trang chi tiết sách.');
                    window.location.href = `detail.html?id=${bookId}`; 
                } else {
                    alert(data.message || 'Lỗi khi gửi đánh giá');
                }
            } catch (err) {
                alert('Lỗi kết nối Server');
            }
        });
    }
};

// [ĐÃ SỬA]: LƯU TỌA ĐỘ CUỘN VÀO ĐÚNG NGĂN CỦA USER ĐÓ
window.addEventListener('scroll', () => {
    if (isInitialLoad) return; 
    
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
        const userId = getCurrentUserId();
        let allProgressData = JSON.parse(localStorage.getItem('reading_progress') || '{}');
        
        if (!allProgressData[userId]) allProgressData[userId] = {};
        
        if (allProgressData[userId][bookId] && allProgressData[userId][bookId].chapterId == chapterId) {
            allProgressData[userId][bookId].scroll = window.scrollY; 
            localStorage.setItem('reading_progress', JSON.stringify(allProgressData));
        }
    }, 500); 
});