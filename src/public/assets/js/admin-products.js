const checkAdmin = () => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    if (!token || !userStr) {
        alert('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!');
        window.location.href = '/login.html'; 
        return;
    }
    try {
        const user = JSON.parse(userStr);
        if (user.role !== 'admin') {
            alert('Tài khoản này không có quyền Admin!');
            window.location.href = '/index.html'; 
        }
    } catch (e) {
        window.location.href = '/login.html';
    }
};
checkAdmin();

let myModal = null; 
const productTemplate = document.getElementById('product-row-template');

const loadCategories = async () => {
    try {
        const res = await fetch(`${API_BASE_URL}/admin/categories`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if(!res.ok) return; 
        const categories = await res.json();
        
        const select = document.getElementById('category_id');
        if(select) {
            select.innerHTML = '<option value="">-- Chọn danh mục --</option>';
            categories.forEach(cat => {
                const opt = document.createElement('option');
                opt.value = cat.id;
                opt.textContent = cat.name;
                select.appendChild(opt);
            });
        }
    } catch (error) { console.error("Lỗi tải danh mục:", error); }
};

const fetchBooks = async () => {
    try {
        // Thêm ?_t=... để ép trình duyệt luôn lấy dữ liệu mới nhất (chống lưu Cache cũ)
        const res = await fetch(`${API_BASE_URL}/admin/books?_t=${new Date().getTime()}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        
        if (!res.ok) throw new Error("Lỗi tải dữ liệu");
        
        const result = await res.json();
        const books = Array.isArray(result) ? result : (result.data || []);
        
        // In ra console để kiểm tra dữ liệu
        console.log("Danh sách sách tải về:", books);
        
        renderTable(books);
    } catch (error) {
        document.getElementById('product-list').innerHTML = `
            <tr><td colspan="6" class="text-center text-danger fw-bold py-5">
                <i class="fas fa-exclamation-triangle me-2"></i> KHÔNG TẢI ĐƯỢC DỮ LIỆU
            </td></tr>`;
    }
};

const renderTable = (books) => {
    const tbody = document.getElementById('product-list');
    tbody.innerHTML = '';

    if (!books || books.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center py-4 text-muted">Chưa có cuốn sách nào.</td></tr>';
        return;
    }

    // Vẽ trực tiếp từng hàng dữ liệu, không dùng Template nữa để tránh lỗi ngầm
    books.forEach((book, index) => {
        const isBlocked = book.status === 'blocked';
        
        // Cấu hình giao diện tùy theo trạng thái
        const rowClass = isBlocked ? 'bg-light' : '';
        const titleClass = isBlocked ? 'text-decoration-line-through text-muted' : 'fw-bold text-primary';
        const imgUrl = book.image ? `${UPLOAD_BASE_URL}${book.image}` : 'https://placehold.co/50';

        // Xử lý nút bấm
        let actionHTML = '';
        if (isBlocked) {
            // Nếu bị khóa -> CHỈ HIỆN NÚT KHÔI PHỤC
            actionHTML = `<button class="btn btn-sm btn-success fw-bold px-3" onclick="restoreBook(${book.id})"><i class="fas fa-undo me-1"></i> Khôi phục</button>`;
        } else {
            // Nếu bình thường -> HIỆN NÚT CHƯƠNG, SỬA, KHÓA
            actionHTML = `
                <a href="chapters.html?bookId=${book.id}" class="btn btn-sm btn-info text-white me-2 fw-bold"><i class="fas fa-list me-1"></i> Chương</a>
                <button class="btn btn-sm btn-outline-warning me-2" onclick="editBook(${book.id})" title="Sửa"><i class="fas fa-edit"></i></button>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteBook(${book.id})" title="Khóa sách"><i class="fas fa-lock me-1"></i> Ẩn</button>
            `;
        }

        // Chèn vào bảng
        tbody.innerHTML += `
            <tr class="${rowClass}">
                <td class="align-middle ${isBlocked ? 'text-muted' : ''}">${index + 1}</td>
                <td class="align-middle">
                    <img src="${imgUrl}" alt="book" style="width: 50px; height: 75px; object-fit: cover;" class="rounded shadow-sm ${isBlocked ? 'opacity-50' : ''}" onerror="this.src='https://placehold.co/50'">
                </td>
                <td class="align-middle ${titleClass}">${book.title}</td>
                <td class="align-middle ${isBlocked ? 'text-muted' : ''}">${book.author}</td>
                <td class="align-middle">
                    <span class="badge ${isBlocked ? 'bg-secondary' : 'bg-primary'}">${book.category_name || '---'}</span>
                </td>
                <td class="align-middle text-end">${actionHTML}</td>
            </tr>
        `;
    });
};

window.openModal = (isEdit = false) => {
    const modalTitle = document.getElementById('modal-title');
    const form = document.getElementById('product-form');
    
    loadCategories().then(() => {
        if (!isEdit) {
            form.reset();
            document.getElementById('book-id').value = '';
            modalTitle.textContent = 'Thêm sách mới';
        } else modalTitle.textContent = 'Cập nhật sách';
    
        if (!myModal) myModal = new bootstrap.Modal(document.getElementById('productModal'));
        myModal.show();
    });
};

window.saveBook = async () => {
    const token = localStorage.getItem('token');
    const id = document.getElementById('book-id').value;
    
    const title = document.getElementById('title').value.trim();
    const author = document.getElementById('author').value.trim();
    const categoryId = document.getElementById('category_id').value;
    const isbn = document.getElementById('isbn').value.trim();
    const year = document.getElementById('year').value;
    const desc = document.getElementById('description').value;
    const content = document.getElementById('content').value;
    const imageFile = document.getElementById('image').files[0];

    if (!title || !author) return alert('Vui lòng nhập Tên sách và Tác giả!');
    if (!categoryId) return alert('Vui lòng chọn Danh mục!');

    const formData = new FormData();
    formData.append('title', title);
    formData.append('author', author);
    formData.append('category_id', categoryId);
    formData.append('isbn', isbn);
    formData.append('year', year);
    formData.append('description', desc);
    formData.append('content', content);
    if (imageFile) formData.append('image', imageFile);

    try {
        const url = id ? `${API_BASE_URL}/admin/books/${id}` : `${API_BASE_URL}/admin/books`;
        const method = id ? 'PUT' : 'POST';

        const res = await fetch(url, {
            method,
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Lỗi lưu dữ liệu');
        
        alert('Thành công!');
        if (myModal) myModal.hide();
        fetchBooks(); 
    } catch (error) { alert(error.message); }
};

window.editBook = async (id) => {
    try {
        await loadCategories();
        const res = await fetch(`${API_BASE_URL}/books/${id}`); 
        if (!res.ok) throw new Error("Không tìm thấy sách");
        const book = await res.json();

        document.getElementById('book-id').value = book.id;
        document.getElementById('title').value = book.title;
        document.getElementById('author').value = book.author;
        document.getElementById('category_id').value = book.category_id || ""; 
        document.getElementById('isbn').value = book.isbn || '';
        document.getElementById('year').value = book.year || '';
        document.getElementById('description').value = book.description || '';
        document.getElementById('content').value = book.content || '';
        
        document.getElementById('modal-title').textContent = 'Cập nhật sách';
        if (!myModal) myModal = new bootstrap.Modal(document.getElementById('productModal'));
        myModal.show();
    } catch (error) { alert(error.message); }
};

// ĐÃ SỬA: Hàm Khóa Sách
window.deleteBook = async (id) => {
    if (!confirm('Bạn có chắc chắn muốn KHÓA cuốn sách này không?')) return;
    try {
        const res = await fetch(`${API_BASE_URL}/admin/books/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });

        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.message || 'Khóa thất bại');
        
        alert('Đã khóa sách thành công!');
        fetchBooks();
    } catch (error) {
        alert(error.message);
    }
};
// --- HÀM KHÔI PHỤC SÁCH ---
window.restoreBook = async (id) => {
    if (!confirm('Bạn muốn khôi phục cuốn sách này để người dùng tiếp tục đọc?')) return;
    try {
        const res = await fetch(`${API_BASE_URL}/admin/books/${id}/restore`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        
        if (res.ok) {
            alert('Đã khôi phục sách thành công!');
            fetchBooks(); // Tự động tải lại bảng
        } else {
            const data = await res.json().catch(() => ({}));
            alert(data.message || 'Lỗi khôi phục sách từ Server');
        }
    } catch (e) { 
        console.error(e);
        alert('Lỗi kết nối đến máy chủ'); 
    }
};

document.addEventListener('DOMContentLoaded', fetchBooks);