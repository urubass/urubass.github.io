const urlParams = new URLSearchParams(window.location.search);
const recipeId = urlParams.get('id');

document.addEventListener('DOMContentLoaded', () => {
  const commentForm = document.getElementById('comment-form');
  const commentList = document.getElementById('comment-list');
  const submitComment = document.getElementById('submit-comment');
  const userId = localStorage.getItem('userId');

  // Zobrazení/skrytí formuláře pro komentáře podle přihlášení
  if (commentForm) {
    commentForm.style.display = userId ? 'flex' : 'none';
  }

  // Načtení komentářů ze serveru při načtení stránky
  fetchComments();
  fetchUserRating(recipeId, userId);

  submitComment.addEventListener('click', (event) => {
    event.preventDefault();
    const commentText = document.getElementById('comment-text').value;
    if (commentText.trim() !== '') {
      // Odeslání komentáře na server
      postComment(commentText);
      document.getElementById('comment-text').value = '';
    }
  });

  // Funkce pro odeslání komentáře na server
  async function postComment(commentText) {
    try {
      const response = await fetch('http://localhost:3000/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          recipeId: recipeId,
          userId: userId,
          comment: commentText,
          rating: rating
        })
      });
  
      if (response.ok) {
        fetchComments();
      } else {
        console.error('Chyba při odesílání komentáře');
      }
    } catch (error) {
      console.error('Chyba při odesílání komentáře:', error);
    }
  }

  // Funkce pro načtení komentářů ze serveru
  async function fetchComments() {
    try {
      const response = await fetch(`http://localhost:3000/comments?recipeId=${recipeId}`);
      if (response.ok) {
        const comments = await response.json();
        displayComments(comments);
      } else {
        console.error('Chyba při načítání komentářů:', response.status);
      }
    } catch (error) {
      console.error('Chyba při načítání komentářů:', error);
    }
  }
  
  // Funkce pro zobrazení komentářů na stránce
  function displayComments(comments) {
    commentList.innerHTML = '';
    comments.forEach(comment => {
      const commentElement = document.createElement('div');
      commentElement.classList.add('comment');
      commentElement.innerHTML = `
        <div class="comment-header">
          <p class="comment-author">${comment.username}</p>
          <p class="comment-date">${comment.created_at}</p>
          ${comment.rating ? `<p class="comment-rating">${'★'.repeat(comment.rating)}</p>` : ''}
        </div>
        <p class="comment-text">${comment.comment}</p>
      `;
      commentList.appendChild(commentElement);
    });
  }

  // Získání prvků hvězdiček
  const stars = document.querySelectorAll('.star');
  let rating = 0;

  // Funkce pro aktualizaci hodnocení
  function updateRating(newRating) {
    rating = newRating;
    stars.forEach((star, index) => {
      if (index < rating) {
        star.classList.add('active');
      } else {
        star.classList.remove('active');
      }
    });
  }

  // Funkce pro uložení hodnocení na server
  async function saveRating(recipeId, userId, rating) {
    if (!recipeId) {
      console.error('Chybějící recipeId při ukládání hodnocení');
      showRatingMessage('Chyba při ukládání hodnocení (chybějící recipeId)', 'error');
      return;
    }

    if (!userId) {
      console.error('Chybějící userId při ukládání hodnocení');
      showRatingMessage('Pro hodnocení se prosím přihlaste', 'error');
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/ratings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          recipeId: parseInt(recipeId),
          userId: parseInt(userId),
          rating: rating
        })
      });

      if (response.ok) {
        showRatingMessage('Hodnocení úspěšně uloženo', 'success');
        await updateRecipeRating(recipeId, rating);
        saveRatingToLocalStorage(recipeId, rating);
      } else {
        console.error('Chyba při ukládání hodnocení');
        showRatingMessage('Chyba při ukládání hodnocení', 'error');
      }
    } catch (error) {
      console.error('Chyba při ukládání hodnocení:', error);
      showRatingMessage('Chyba při ukládání hodnocení', 'error');
    }
  }

  // Funkce pro aktualizaci průměrného hodnocení receptu na serveru
  async function updateRecipeRating(recipeId, newRating) {
    try {
      const response = await fetch(`http://localhost:3000/recipeAverageRating?recipeId=${recipeId}`);
      if (response.ok) {
        const data = await response.json();
        const averageRating = data.averageRating;
        // Aktualizujte zobrazení průměrného hodnocení na stránce recipe-detail.html
        // ...
      } else {
        console.error('Chyba při aktualizaci hodnocení receptu');
      }
    } catch (error) {
      console.error('Chyba při aktualizaci hodnocení receptu:', error);
    }
  }

  // Funkce pro uložení hodnocení do localStorage
  function saveRatingToLocalStorage(recipeId, rating) {
    localStorage.setItem(`rating_${recipeId}`, rating);
  }

  // Přidání posluchače událostí pro hvězdičky
  stars.forEach((star) => {
    star.addEventListener('click', (event) => {
      event.preventDefault();
      const value = parseInt(star.getAttribute('data-value'), 10);
      updateRating(value);
      saveRating(recipeId, userId, value);
    });
  });

  // Funkce pro zobrazení vyskakovacího okna s hodnocením
  function showRatingMessage(message, type) {
    const ratingMessage = document.getElementById('rating-message');
    ratingMessage.textContent = message;
    ratingMessage.classList.remove('success', 'error');
    ratingMessage.classList.add(type, 'show');
    setTimeout(() => {
      ratingMessage.classList.remove('show');
    }, 3000);
  }

  // Funkce pro načtení hodnocení uživatele pro daný recept
  async function fetchUserRating(recipeId, userId) {
    try {
      const response = await fetch(`http://localhost:3000/ratings?recipeId=${recipeId}&userId=${userId}`);
      if (response.ok) {
        const rating = await response.json();
        if (rating && rating.length > 0) {
          updateRating(rating[0].rating);
        } else {
          updateRating(0);
        }
      } else {
        console.error('Chyba při načítání hodnocení uživatele');
      }
    } catch (error) {
      console.error('Chyba při načítání hodnocení uživatele:', error);
    }
  }
});