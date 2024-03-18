// Přepínač jazyka
const languageSwitch = document.querySelector('.language-switch');
const flags = document.querySelectorAll('.flag');
const translatableElements = document.querySelectorAll('[data-text]');

languageSwitch.addEventListener('click', () => {
    const activeFlag = document.querySelector('.flag.active');
    const hiddenFlag = document.querySelector('.flag.hidden');

    activeFlag.classList.add('fade-out');
    setTimeout(() => {
        activeFlag.classList.remove('active', 'fade-out');
        activeFlag.classList.add('hidden');
        hiddenFlag.classList.remove('hidden');
        hiddenFlag.classList.add('active', 'fade-in');
        setTimeout(() => {
            hiddenFlag.classList.remove('fade-in');
        }, 200);

        const selectedLanguage = hiddenFlag.dataset.lang;
        translatableElements.forEach(element => {
            const [czechText, englishText] = element.dataset.text.split('|');
            element.textContent = selectedLanguage === 'cs' ? czechText : englishText;
        });
    }, 200);
});

// Přepínač motivů
const themeSwitch = document.querySelector('.theme-switch');
const themeIcons = document.querySelectorAll('.theme-icon');
const body = document.body;

themeSwitch.addEventListener('click', () => {
    const activeIcon = document.querySelector('.theme-icon.active');
    const hiddenIcon = document.querySelector('.theme-icon.hidden');

    activeIcon.classList.add('fade-out');
    setTimeout(() => {
        activeIcon.classList.remove('active', 'fade-out');
        activeIcon.classList.add('hidden');
        hiddenIcon.classList.remove('hidden');
        hiddenIcon.classList.add('active', 'fade-in');
        setTimeout(() => {
            hiddenIcon.classList.remove('fade-in');
        }, 200);

        const selectedTheme = hiddenIcon.dataset.theme;
        body.classList.toggle('dark-theme', selectedTheme === 'dark');
        localStorage.setItem('theme', selectedTheme);
    }, 200);
});

// Načtení uloženého motivu při načtení stránky
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'dark') {
    body.classList.add('dark-theme');
    themeIcons[0].classList.add('hidden');
    themeIcons[0].classList.remove('active');
    themeIcons[1].classList.remove('hidden');
    themeIcons[1].classList.add('active');
}
