/**
 * src/public/assets/js/admin.js
 * Logic Dashboard
 */

// Hàm lấy thống kê số lượng sách
const fetchDashboardStats = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
        // Gọi API lấy danh sách sách để đếm số lượng
        const response = await fetch(`${API_BASE_URL}/books`);
        if (!response.ok) throw new Error('Lỗi tải dữ liệu');

        const result = await response.json();
        const books = Array.isArray(result) ? result : (result.data || []);
        
        // Cập nhật giao diện
        const totalBooksEl = document.getElementById('total-books');
        if (totalBooksEl) totalBooksEl.textContent = books.length;

    } catch (error) {
        console.error('Lỗi Dashboard:', error);
    }
};

document.addEventListener('DOMContentLoaded', () => {
    fetchDashboardStats();
});