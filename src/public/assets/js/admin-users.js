const checkAdmin = () => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!token || user.role !== 'admin') window.location.href = '../login.html';
};
checkAdmin();

const tableBody = document.getElementById('user-list');

const fetchUsers = async () => {
    try {
        // Thêm ?_t=... để chống lưu cache cũ
        const res = await fetch(`${API_BASE_URL}/admin/users?_t=${new Date().getTime()}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if(!res.ok) throw new Error("Lỗi server");
        const users = await res.json();
        renderTable(users);
    } catch (error) {
        console.error(error);
        tableBody.innerHTML = '<tr><td colspan="5" class="text-danger text-center">Không tải được người dùng</td></tr>';
    }
};

const renderTable = (users) => {
    tableBody.innerHTML = '';
    
    if (!users || users.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="5" class="text-center py-4 text-muted">Chưa có người dùng nào.</td></tr>';
        return;
    }

    // Vẽ trực tiếp từng hàng dữ liệu
    users.forEach(user => {
        const isBlocked = user.status === 'blocked';
        const rowClass = isBlocked ? 'bg-light text-muted' : '';
        const nameStyle = isBlocked ? 'text-decoration-line-through' : 'fw-bold';

        let actionButtons = '';
        
        // Không cho phép tự khóa tài khoản Admin
        if (user.role !== 'admin') {
            if (isBlocked) {
                // NẾU BỊ KHÓA -> CHỈ HIỆN NÚT MỞ KHÓA
                actionButtons = `<button class="btn btn-sm btn-success fw-bold px-3" onclick="restoreUser(${user.id})" title="Mở khóa tài khoản"><i class="fas fa-undo me-1"></i> Mở khóa</button>`;
            } else {
                // NẾU BÌNH THƯỜNG -> HIỆN NÚT KHÓA
                actionButtons = `<button class="btn btn-sm btn-outline-danger" onclick="deleteUser(${user.id})" title="Khóa tài khoản"><i class="fas fa-lock me-1"></i> Khóa</button>`;
            }
        } else {
            // Tài khoản Admin thì ẩn nút Khóa
            actionButtons = `<span class="badge bg-secondary opacity-50"><i class="fas fa-shield-alt"></i> Quản trị</span>`;
        }

        tableBody.innerHTML += `
            <tr class="${rowClass}">
                <td class="align-middle">${user.id}</td>
                <td class="align-middle ${nameStyle}">${user.name}</td>
                <td class="align-middle ${isBlocked ? 'text-muted' : ''}">${user.email}</td>
                <td class="align-middle"><span class="badge ${user.role === 'admin' ? 'bg-danger' : (isBlocked ? 'bg-secondary' : 'bg-success')}">${isBlocked ? 'Bị khóa' : user.role}</span></td>
                <td class="align-middle text-end">${actionButtons}</td>
            </tr>`;
    });
};

window.deleteUser = async (id) => {
    // ĐÃ SỬA: Lời nhắc
    if (!confirm('Bạn có chắc chắn muốn KHÓA user này không?')) return;
    try {
        const res = await fetch(`${API_BASE_URL}/admin/users/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        
        const data = await res.json().catch(() => ({}));

        if (res.ok) {
            alert('Đã khóa tài khoản thành công!');
            fetchUsers();
        } else {
            alert(data.message || 'Lỗi khóa user');
        }
    } catch (e) { 
        console.error(e); 
        alert('Lỗi kết nối');
    }
};
// --- HÀM KHÔI PHỤC / MỞ KHÓA USER ---
window.restoreUser = async (id) => {
    if (!confirm('Bạn muốn mở khóa cho tài khoản này?')) return;
    try {
        const res = await fetch(`${API_BASE_URL}/admin/users/${id}/restore`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        
        if (res.ok) {
            alert('Đã mở khóa tài khoản thành công!');
            fetchUsers(); // Tự động tải lại bảng
        } else {
            const data = await res.json().catch(() => ({}));
            alert(data.message || 'Lỗi mở khóa tài khoản');
        }
    } catch (e) { 
        console.error(e);
        alert('Lỗi kết nối đến máy chủ'); 
    }
};

document.addEventListener('DOMContentLoaded', fetchUsers);