// Přepínač motivů
const themeToggle = document.getElementById('theme-toggle');
const body = document.body;

themeToggle.addEventListener('change', function() {
    body.classList.toggle('dark-theme');
    localStorage.setItem('theme', body.classList.contains('dark-theme') ? 'dark' : 'light');
});

// Načtení uloženého motivu při načtení stránky
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'dark') {
    body.classList.add('dark-theme');
    themeToggle.checked = true;
}