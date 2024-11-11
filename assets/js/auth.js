
document.addEventListener('DOMContentLoaded', function () {
    const token = localStorage.getItem('authToken');
    const username = localStorage.getItem('authToken');

    if (!token || !username) {

        window.location.href = '/';
    }
});
