const checkAdmin = () => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!token || user.role !== 'admin') window.location.href = '../login.html';
};
checkAdmin();

const tableBody = document.getElementById('category-list');
let myModal = null;

const fetchCategories = async () => {
    try {
        // Thêm ?_t=... để chống lưu cache cũ
        const res = await fetch(`${API_BASE_URL}/admin/categories?_t=${new Date().getTime()}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if(!res.ok) throw new Error("Lỗi server");
        const categories = await res.json();
        renderTable(categories);
    } catch (error) {
        console.error(error);
        tableBody.innerHTML = '<tr><td colspan="3" class="text-danger text-center">Không tải được danh mục</td></tr>';
    }
};

const renderTable = (categories) => {
    tableBody.innerHTML = '';
    
    if (!categories || categories.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="3" class="text-center py-4 text-muted">Chưa có danh mục nào.</td></tr>';
        return;
    }

    // Vẽ trực tiếp từng hàng dữ liệu
    categories.forEach((cat, index) => {
        const isBlocked = cat.status === 'blocked';
        const rowClass = isBlocked ? 'bg-light' : '';
        const nameStyle = isBlocked ? 'text-decoration-line-through text-muted' : 'text-primary';

        let actionButtons = '';
        if (isBlocked) {
            // NẾU BỊ KHÓA -> CHỈ HIỆN NÚT KHÔI PHỤC
            actionButtons = `<button class="btn btn-sm btn-success fw-bold px-3" onclick="restoreCategory(${cat.id})" title="Khôi phục"><i class="fas fa-undo me-1"></i> Khôi phục</button>`;
        } else {
            // NẾU BÌNH THƯỜNG -> HIỆN NÚT SỬA VÀ KHÓA
            actionButtons = `
                <button class="btn btn-sm btn-outline-warning me-2" onclick="editCategory(${cat.id}, '${cat.name}')" title="Sửa"><i class="fas fa-edit"></i></button>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteCategory(${cat.id})" title="Khóa"><i class="fas fa-lock me-1"></i> Ẩn</button>
            `;
        }

        tableBody.innerHTML += `
            <tr class="${rowClass}">
                <td class="align-middle ${isBlocked ? 'text-muted' : ''}">${index + 1}</td>
                <td class="align-middle fw-bold ${nameStyle}">${cat.name}</td>
                <td class="align-middle text-end">${actionButtons}</td>
            </tr>`;
    });
};

window.openModal = () => {
    document.getElementById('cat-form').reset();
    document.getElementById('cat-id').value = '';
    document.getElementById('modal-title').textContent = 'Thêm danh mục';
    if (!myModal) myModal = new bootstrap.Modal(document.getElementById('categoryModal'));
    myModal.show();
};

window.saveCategory = async () => {
    const id = document.getElementById('cat-id').value;
    const name = document.getElementById('cat-name').value.trim();
    if (!name) return alert('Tên không được trống');

    try {
        const url = id ? `${API_BASE_URL}/admin/categories/${id}` : `${API_BASE_URL}/admin/categories`;
        const method = id ? 'PUT' : 'POST';

        const res = await fetch(url, {
            method,
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}` 
            },
            body: JSON.stringify({ name })
        });
        
        const data = await res.json();
        
        if (res.ok) {
            alert('Thành công!');
            myModal.hide();
            fetchCategories();
        } else {
            // Đã sửa: Bắt lỗi nếu trùng tên
            alert(data.message || 'Lỗi khi lưu');
        }
    } catch (e) { 
        console.error(e); 
        alert('Lỗi kết nối Server');
    }
};

window.editCategory = (id, name) => {
    document.getElementById('cat-id').value = id;
    document.getElementById('cat-name').value = name;
    document.getElementById('modal-title').textContent = 'Cập nhật danh mục';
    if (!myModal) myModal = new bootstrap.Modal(document.getElementById('categoryModal'));
    myModal.show();
};

window.deleteCategory = async (id) => {
    // ĐÃ SỬA: Lời nhắc
    if (!confirm('Bạn có chắc chắn muốn KHÓA danh mục này không?')) return;
    try {
        const res = await fetch(`${API_BASE_URL}/admin/categories/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        
        const data = await res.json().catch(() => ({}));
        
        if (res.ok) {
            alert('Đã khóa danh mục thành công!');
            fetchCategories();
        } else {
            // Đã sửa: Hiện thông báo nếu danh mục đang chứa sách
            alert(data.message || 'Lỗi khóa danh mục');
        }
    } catch (e) { 
        console.error(e); 
        alert('Lỗi kết nối');
    }
};
// --- HÀM KHÔI PHỤC DANH MỤC ---
window.restoreCategory = async (id) => {
    if (!confirm('Bạn muốn khôi phục danh mục này?')) return;
    try {
        const res = await fetch(`${API_BASE_URL}/admin/categories/${id}/restore`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        
        if (res.ok) {
            alert('Đã khôi phục danh mục thành công!');
            fetchCategories(); // Tự động tải lại bảng
        } else {
            const data = await res.json().catch(() => ({}));
            alert(data.message || 'Lỗi khôi phục danh mục');
        }
    } catch (e) { 
        console.error(e);
        alert('Lỗi kết nối đến máy chủ'); 
    }
};

document.addEventListener('DOMContentLoaded', fetchCategories);