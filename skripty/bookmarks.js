document.addEventListener('DOMContentLoaded', () => {
    const bookmarkIcons = document.querySelectorAll('.bookmark-icon');
    const bookmarkToggle = document.querySelector('.bookmark-toggle');
    const loginModal = document.getElementById('login-modal');
    const loginForm = document.getElementById('login-form');
    const logoutBtn = document.querySelector('.logout-btn');
  
    // Funkce pro kontrolu, zda je uživatel přihlášen
    function isUserLoggedIn() {
      return localStorage.getItem('isLoggedIn') === 'true';
    }
  
    // Funkce pro získání aktuálně přihlášeného uživatele
    function getCurrentUser() {
      return localStorage.getItem('currentUser');
    }
  
    // Funkce pro přihlášení uživatele
    function loginUser(username) {
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('currentUser', username);
      loginModal.style.display = 'none';
      showBookmarks();
    }
  
    // Funkce pro odhlášení uživatele
    function logoutUser() {
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('currentUser');
      hideBookmarks();
    }
  
    // Funkce pro zobrazení záložek
    function showBookmarks() {
      bookmarkIcons.forEach((icon) => {
        icon.style.display = 'block';
      });
      bookmarkToggle.style.display = 'block';
      loadBookmarks();
    }
  
    // Funkce pro skrytí záložek
    function hideBookmarks() {
      bookmarkIcons.forEach((icon) => {
        icon.style.display = 'none';
      });
      bookmarkToggle.style.display = 'none';
    }
  
    // Skrytí ikon záložek a přepínače záložek pro nepřihlášené uživatele
    if (!isUserLoggedIn()) {
      hideBookmarks();
    } else {
      showBookmarks();
    }
  
    // Přidání posluchače události pro ikony záložek
    bookmarkIcons.forEach((icon) => {
      icon.addEventListener('click', () => {
        const recipeId = icon.dataset.recipeId;
        toggleBookmark(recipeId);
      });
    });
  
    // Přidání posluchače události pro přepínač záložek
    bookmarkToggle.addEventListener('click', () => {
      bookmarkToggle.classList.toggle('active');
      filterRecipes();
    });
  
    // Přidání posluchače události pro formulář přihlášení
    loginForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const username = document.getElementById('login-username').value;
      loginUser(username);
    });
  
    // Přidání posluchače události pro tlačítko odhlášení
    logoutBtn.addEventListener('click', () => {
      logoutUser();
    });
  
    // Načtení uložených záložek z localStorage pro aktuálně přihlášeného uživatele
    function loadBookmarks() {
      const savedBookmarks = JSON.parse(localStorage.getItem(`bookmarks_${getCurrentUser()}`)) || [];
  
      // Aktualizace ikon záložek podle uložených záložek
      bookmarkIcons.forEach((icon) => {
        const recipeId = icon.dataset.recipeId;
        if (savedBookmarks.includes(recipeId)) {
          icon.classList.add('active');
        } else {
          icon.classList.remove('active');
        }
      });
    }
  
    // Funkce pro přepínání záložky
    function toggleBookmark(recipeId) {
      const icon = document.querySelector(`.bookmark-icon[data-recipe-id="${recipeId}"]`);
      icon.classList.toggle('active');
  
      const savedBookmarks = JSON.parse(localStorage.getItem(`bookmarks_${getCurrentUser()}`)) || [];
  
      if (savedBookmarks.includes(recipeId)) {
        savedBookmarks.splice(savedBookmarks.indexOf(recipeId), 1);
      } else {
        savedBookmarks.push(recipeId);
      }
  
      localStorage.setItem(`bookmarks_${getCurrentUser()}`, JSON.stringify(savedBookmarks));
      filterRecipes();
    }
  
    // Funkce pro filtrování receptů podle záložek
    function filterRecipes() {
      const recipeItems = document.querySelectorAll('.recipe-item');
      const savedBookmarks = JSON.parse(localStorage.getItem(`bookmarks_${getCurrentUser()}`)) || [];
  
      recipeItems.forEach((item) => {
        const recipeId = item.dataset.recipeId;
  
        if (bookmarkToggle.classList.contains('active')) {
          if (savedBookmarks.includes(recipeId)) {
            item.style.display = 'block';
          } else {
            item.style.display = 'none';
          }
        } else {
          item.style.display = 'block';
        }
      });
    }
  });