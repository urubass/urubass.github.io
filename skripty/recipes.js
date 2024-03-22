document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    const recipeGrid = document.querySelector('.recipe-grid');
    const filterFlags = document.querySelectorAll('.filter-flag');
    const recipeItems = document.querySelectorAll('.recipe-item');
    const loadMoreBtn = document.getElementById('load-more-btn');

    let visibleRecipes = 10;

    // Vyhledávání receptů
    searchButton.addEventListener('click', searchRecipes);
    searchInput.addEventListener('keyup', (event) => {
        if (event.key === 'Enter') searchRecipes();
    });

    // Filtrování podle kategorií
    filterFlags.forEach((flag) => {
        flag.addEventListener('click', () => {
            flag.classList.toggle('active');
            filterRecipes();
        });
    });

    // Načítání dalších receptů
    loadMoreBtn.addEventListener('click', loadMoreRecipes);
    initializeRecipes();

    // Vyhledávání receptů
    function searchRecipes() {
        const searchTerm = searchInput.value.trim().toLowerCase();
        const selectedCategories = Array.from(filterFlags)
            .filter((flag) => flag.classList.contains('active'))
            .map((flag) => flag.dataset.category);

        recipeItems.forEach((recipeItem) => {
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
        });
    }

    // Filtrování podle kategorií
    function filterRecipes() {
        const selectedCategories = Array.from(filterFlags)
            .filter((flag) => flag.classList.contains('active'))
            .map((flag) => flag.dataset.category);

        recipeItems.forEach((item) => {
            if (selectedCategories.length === 0 || selectedCategories.includes(item.dataset.category)) {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        });

        filterFlags.forEach((flag) => {
            flag.classList.toggle('inactive', selectedCategories.length > 0 && !flag.classList.contains('active'));
        });
    }

    // Načítání dalších receptů
    function loadMoreRecipes() {
        const recipes = Array.from(recipeGrid.getElementsByClassName('recipe-item'));
        const selectedCategories = Array.from(filterFlags)
            .filter((flag) => flag.classList.contains('active'))
            .map((flag) => flag.dataset.category);

        const recipesToShow = selectedCategories.length > 0
            ? recipes.filter((recipe) => selectedCategories.includes(recipe.dataset.category))
            : recipes;

        for (let i = visibleRecipes; i < visibleRecipes + 10 && i < recipesToShow.length; i++) {
            recipesToShow[i].style.display = 'block';
        }

        visibleRecipes += 10;
        checkLoadMoreButton();
    }

    function initializeRecipes() {
        const recipes = Array.from(recipeGrid.getElementsByClassName('recipe-item'));
        const selectedCategories = Array.from(filterFlags)
            .filter((flag) => flag.classList.contains('active'))
            .map((flag) => flag.dataset.category);

        const recipesToShow = selectedCategories.length > 0
            ? recipes.filter((recipe) => selectedCategories.includes(recipe.dataset.category))
            : recipes;

        recipesToShow.forEach((recipe, index) => {
            recipe.style.display = index < 10 ? 'block' : 'none';
        });

        visibleRecipes = Math.min(10, recipesToShow.length);
        checkLoadMoreButton();
    }

    function checkLoadMoreButton() {
        const recipes = Array.from(recipeGrid.getElementsByClassName('recipe-item'));
        const selectedCategories = Array.from(filterFlags)
            .filter((flag) => flag.classList.contains('active'))
            .map((flag) => flag.dataset.category);

        const recipesInCategory = selectedCategories.length > 0
            ? recipes.filter((recipe) => selectedCategories.includes(recipe.dataset.category))
            : recipes;

        loadMoreBtn.style.display = recipesInCategory.length > visibleRecipes ? 'block' : 'none';
    }
});