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
        saveLanguage(selectedLanguage); // Uložení vybraného jazyka do localStorage

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

// Vyhledávání receptů
const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');
const recipeGrid = document.querySelector('.recipe-grid');

function searchRecipes() {
    const searchTerm = searchInput.value.toLowerCase();
    const selectedCategory = categoryFilter.value;
    const recipes = recipeGrid.getElementsByClassName('recipe-item');

    if (searchTerm === '') {
        // Pokud je vyhledávací pole prázdné, zobrazit recepty podle vybrané kategorie
        for (let i = 0; i < recipes.length; i++) {
            const recipeCategory = recipes[i].dataset.category;
            if (selectedCategory === '' || recipeCategory === selectedCategory) {
                recipes[i].style.display = 'block';
            } else {
                recipes[i].style.display = 'none';
            }
        }
        return;
    }

    for (let i = 0; i < recipes.length; i++) {
        const recipeName = recipes[i].querySelector('h3').textContent.toLowerCase();
        const recipeCategory = recipes[i].dataset.category;

        if (recipeName.includes(searchTerm) && (selectedCategory === '' || recipeCategory === selectedCategory)) {
            recipes[i].style.display = 'block';
        } else {
            recipes[i].style.display = 'none';
        }
    }
}

searchButton.addEventListener('click', searchRecipes);
searchInput.addEventListener('keyup', function(event) {
    if (event.key === 'Enter') {
        searchRecipes();
    }
});

// Fuzzy vyhledávání
function getFuzzySearchScore(searchTerm, recipeName) {
    let score = 0;
    let searchIndex = 0;
    for (let i = 0; i < recipeName.length; i++) {
        if (searchTerm[searchIndex] === recipeName[i]) {
            score++;
            searchIndex++;
            if (searchIndex === searchTerm.length) {
                break;
            }
        }
    }
    return score;
}

function fuzzySearchRecipes() {
    const searchTerm = searchInput.value.toLowerCase();
    const recipes = recipeGrid.getElementsByClassName('recipe-item');

    if (searchTerm === '') {
        // Pokud je vyhledávací pole prázdné, zobrazit všechny recepty
        for (let i = 0; i < recipes.length; i++) {
            recipes[i].style.display = 'block';
        }
        return;
    }

    for (let i = 0; i < recipes.length; i++) {
        const recipeName = recipes[i].querySelector('h3').textContent.toLowerCase();
        const score = getFuzzySearchScore(searchTerm, recipeName);
        if (score > 0) {
            recipes[i].style.display = 'block';
        } else {
            recipes[i].style.display = 'none';
        }
    }
}

// Odstranění Fuzzy vyhledávání
searchButton.removeEventListener('click', fuzzySearchRecipes);
searchButton.addEventListener('click', searchRecipes);
searchInput.removeEventListener('keyup', function(event) {
    if (event.key === 'Enter') {
        fuzzySearchRecipes();
    }
});
searchInput.addEventListener('keyup', function(event) {
    if (event.key === 'Enter') {
        searchRecipes();
    }
});

// Filtrování podle kategorií
const categoryFilter = document.querySelector('.filter-bar select');

function filterRecipes() {
    const selectedCategory = categoryFilter.value;
    const recipes = recipeGrid.getElementsByClassName('recipe-item');

    for (let i = 0; i < recipes.length; i++) {
        const recipeCategory = recipes[i].dataset.category;
        if (selectedCategory === '' || recipeCategory === selectedCategory) {
            recipes[i].style.display = 'block';
        } else {
            recipes[i].style.display = 'none';
        }
    }
}

categoryFilter.addEventListener('change', filterRecipes);