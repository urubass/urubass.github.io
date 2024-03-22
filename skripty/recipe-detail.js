document.addEventListener('DOMContentLoaded', () => {
    const commentForm = document.querySelector('.comment-form');
    const ratingStars = document.querySelectorAll('.rating');
    const userId = localStorage.getItem('userId');

    // Zobrazení/skrytí formuláře pro komentáře a hodnocení podle přihlášení
    if (commentForm) {
        commentForm.style.display = userId ? 'flex' : 'none';
    }

    ratingStars.forEach((rating) => {
        rating.style.display = userId ? 'block' : 'none';
    });
});