// Lấy bookId từ URL: ?bookId=1
const urlParams = new URLSearchParams(window.location.search);
const bookId = urlParams.get('bookId');
const token = localStorage.getItem('token');
let chapterModal;

document.addEventListener('DOMContentLoaded', () => {
    if (!bookId) {
        alert("Không tìm thấy ID sách!");
        window.location.href = 'products.html';
        return;
    }
    chapterModal = new bootstrap.Modal(document.getElementById('chapterModal'));
    fetchChapters();
});

const fetchChapters = async () => {
    try {
        const res = await fetch(`${API_BASE_URL}/admin/chapters/book/${bookId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error("Lỗi tải danh sách chương");
        const chapters = await res.json();
        renderChapters(chapters);
    } catch (error) {
        console.error(error);
        document.getElementById('chapter-list').innerHTML = `<tr><td colspan="4" class="text-center text-danger">Lỗi tải dữ liệu</td></tr>`;
    }
};

const renderChapters = (chapters) => {
    const tbody = document.getElementById('chapter-list');
    if (chapters.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" class="text-center py-4 text-muted">Sách này chưa có chương nào.</td></tr>`;
        return;
    }
    tbody.innerHTML = chapters.map(chap => `
        <tr>
            <td class="fw-bold text-center">${chap.chapter_number}</td>
            <td class="fw-bold text-primary">${chap.title}</td>
            <td>${new Date(chap.created_at).toLocaleDateString('vi-VN')}</td>
            <td class="text-center">
                <button class="btn btn-sm btn-outline-primary me-2" onclick="editChapter(${chap.id})"><i class="fas fa-edit"></i> Sửa</button>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteChapter(${chap.id})"><i class="fas fa-trash"></i> Xóa</button>
            </td>
        </tr>
    `).join('');
};

window.showAddModal = () => {
    document.getElementById('chapter-form').reset();
    document.getElementById('chapter-id').value = '';
    document.getElementById('chapterModalLabel').textContent = 'Thêm Chương Mới';
    chapterModal.show();
};

window.editChapter = async (id) => {
    try {
        const res = await fetch(`${API_BASE_URL}/admin/chapters/${id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const chap = await res.json();
        
        document.getElementById('chapter-id').value = chap.id;
        document.getElementById('chapter-number').value = chap.chapter_number;
        document.getElementById('chapter-title').value = chap.title;
        document.getElementById('chapter-content').value = chap.content;
        
        document.getElementById('chapterModalLabel').textContent = 'Sửa Chương';
        chapterModal.show();
    } catch (error) {
        alert("Lỗi tải chi tiết chương");
    }
};

window.saveChapter = async () => {
    const id = document.getElementById('chapter-id').value;
    const data = {
        book_id: bookId,
        chapter_number: document.getElementById('chapter-number').value,
        title: document.getElementById('chapter-title').value,
        content: document.getElementById('chapter-content').value
    };

    const method = id ? 'PUT' : 'POST';
    const url = id ? `${API_BASE_URL}/admin/chapters/${id}` : `${API_BASE_URL}/admin/chapters`;

    try {
        const res = await fetch(url, {
            method,
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify(data)
        });
        
        // [ĐÃ SỬA]: Lấy chi tiết thông báo lỗi từ Backend để hiển thị ra màn hình
        const responseData = await res.json();
        
        if (!res.ok) {
            throw new Error(responseData.message || "Lỗi lưu chương");
        }
        
        alert("Lưu chương thành công!");
        chapterModal.hide();
        fetchChapters();
    } catch (error) {
        alert(error.message); // Hiển thị popup "Lỗi: Chương X đã tồn tại..."
    }
};

window.deleteChapter = async (id) => {
    if (!confirm("Bạn có chắc muốn xóa chương này?")) return;
    try {
        const res = await fetch(`${API_BASE_URL}/admin/chapters/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error("Lỗi xóa chương");
        fetchChapters();
    } catch (error) {
        alert(error.message);
    }
};