const checkAdmin = () => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!token || user.role !== 'admin') window.location.href = '../login.html';
};
checkAdmin();

const tableBody = document.getElementById('review-list');

const fetchReviews = async () => {
    try {
        const res = await fetch(`${API_BASE_URL}/admin/reviews`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const reviews = await res.json();
        renderTable(reviews);
    } catch (error) {
        console.error(error);
    }
};

const renderTable = (reviews) => {
    tableBody.innerHTML = '';
    if(!reviews.length) {
        tableBody.innerHTML = '<tr><td colspan="6" class="text-center">Chưa có đánh giá nào</td></tr>';
        return;
    }
    reviews.forEach(review => {
        tableBody.innerHTML += `
            <tr>
                <td>${review.id}</td>
                <td class="fw-bold text-primary">${review.book_title}</td>
                <td>${review.user_name}</td>
                <td class="text-warning fw-bold">${review.rating} <i class="fas fa-star"></i></td>
                <td>${review.comment}</td>
                <td class="text-end">
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteReview(${review.id})"><i class="fas fa-trash"></i></button>
                </td>
            </tr>`;
    });
};

window.deleteReview = async (id) => {
    if (!confirm('Xóa đánh giá này?')) return;
    try {
        const res = await fetch(`${API_BASE_URL}/admin/reviews/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (res.ok) fetchReviews();
    } catch (e) { console.error(e); }
};

document.addEventListener('DOMContentLoaded', fetchReviews);