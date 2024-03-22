document.addEventListener('DOMContentLoaded', () => {
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
            saveLanguage(selectedLanguage);

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
        const searchTerm = searchInput.value.trim().toLowerCase();
        const selectedCategories = Array.from(filterFlags)
            .filter(flag => flag.classList.contains('active'))
            .map(flag => flag.dataset.category);
    
        for (let i = 0; i < recipeItems.length; i++) {
            const recipeItem = recipeItems[i];
            const recipeName = recipeItem.querySelector('h3').textContent.toLowerCase();
            const recipeNameTranslated = recipeItem.querySelector('h3').dataset.text.toLowerCase();
            const recipeCategory = recipeItem.dataset.category;
    
            if (
                (recipeName.includes(searchTerm) || recipeNameTranslated.includes(searchTerm)) &&
                (selectedCategories.length === 0 || selectedCategories.includes(recipeCategory))
            ) {
                recipeItem.style.display = 'block';
            } else {
                recipeItem.style.display = 'none';
            }
        }
    }

    searchButton.addEventListener('click', searchRecipes);
    searchInput.addEventListener('keyup', event => {
        if (event.key === 'Enter') {
            searchRecipes();
        }
    });

    // Filtrování podle kategorií
    const filterFlags = document.querySelectorAll('.filter-flag');
    const recipeItems = document.querySelectorAll('.recipe-item');

    filterFlags.forEach(flag => {
        flag.addEventListener('click', () => {
            flag.classList.toggle('active');
            filterRecipes();
        });
    });

    function filterRecipes() {
        const selectedCategories = Array.from(filterFlags)
            .filter(flag => flag.classList.contains('active'))
            .map(flag => flag.dataset.category);
    
        recipeItems.forEach(item => {
            if (selectedCategories.length === 0 || selectedCategories.includes(item.dataset.category)) {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        });
    
        if (selectedCategories.length > 0) {
            filterFlags.forEach(flag => {
                if (!flag.classList.contains('active')) {
                    flag.classList.add('inactive');
                }
            });
        } else {
            filterFlags.forEach(flag => {
                flag.classList.remove('inactive');
            });
        }
    }

    // Další tlačítko
    const loadMoreBtn = document.getElementById('load-more-btn');
    const recipesPerLoad = 10;
    let visibleRecipes = recipesPerLoad;

    function loadMoreRecipes() {
        const recipes = Array.from(recipeGrid.getElementsByClassName('recipe-item'));
        const totalRecipes = recipes.length;
    
        for (let i = visibleRecipes; i < visibleRecipes + recipesPerLoad; i++) {
            if (i < totalRecipes) {
                recipes[i].style.display = 'block';
            }
        }
    
        visibleRecipes += recipesPerLoad;
    
        if (visibleRecipes >= totalRecipes) {
            loadMoreBtn.style.display = 'none';
        }
    }
    
    loadMoreBtn.addEventListener('click', loadMoreRecipes);
});