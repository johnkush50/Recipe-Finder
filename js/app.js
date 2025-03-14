/**
 * Main application logic for Recipe Finder
 */

// Initialize the application when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize the UI components
    initializeUI();
    
    // Set up event listeners for search form and toggle switch
    setupEventListeners();
});

/**
 * Initialize the UI components
 */
function initializeUI() {
    // Set the default search mode to 'recipe'
    AppState.setSearchMode('recipe');
    
    // Show the default search interface
    toggleSearchInterface('recipe');
}

/**
 * Set up event listeners for the application
 */
function setupEventListeners() {
    // Search form submission for recipe name search
    const searchForm = document.getElementById('search-form');
    if (searchForm) {
        searchForm.addEventListener('submit', handleRecipeNameSearch);
    }
    
    // Toggle switch for changing search mode
    const searchToggle = document.getElementById('search-toggle');
    if (searchToggle) {
        searchToggle.addEventListener('change', toggleSearchMode);
    }
    
    // Add ingredient button
    const addIngredientBtn = document.getElementById('add-ingredient');
    if (addIngredientBtn) {
        addIngredientBtn.addEventListener('click', addIngredient);
    }
    
    // Ingredient input keypress event (for enter key)
    const ingredientInput = document.getElementById('ingredient-input');
    if (ingredientInput) {
        ingredientInput.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                addIngredient();
            }
        });
    }
    
    // Search ingredients button
    const searchIngredientsBtn = document.getElementById('search-ingredients');
    if (searchIngredientsBtn) {
        searchIngredientsBtn.addEventListener('click', handleIngredientsSearch);
    }
}

/**
 * Toggle between recipe name search and ingredients search
 * @param {Event} event - The change event from the toggle switch
 */
function toggleSearchMode(event) {
    const isIngredientMode = event.target.checked;
    const mode = isIngredientMode ? 'ingredients' : 'recipe';
    
    // Update app state
    AppState.setSearchMode(mode);
    
    // Toggle the UI
    toggleSearchInterface(mode);
}

/**
 * Update the search interface based on the selected mode
 * @param {string} mode - The search mode ('recipe' or 'ingredients')
 */
function toggleSearchInterface(mode) {
    const recipeNameSearch = document.getElementById('recipe-name-search');
    const ingredientsSearch = document.getElementById('ingredients-search');
    const recipeLabel = document.querySelectorAll('.toggle-label')[0];
    const ingredientsLabel = document.querySelectorAll('.toggle-label')[1];
    
    if (mode === 'ingredients') {
        // Switch to ingredients search
        recipeNameSearch.classList.add('hidden');
        ingredientsSearch.classList.remove('hidden');
        recipeLabel.classList.remove('active');
        ingredientsLabel.classList.add('active');
    } else {
        // Switch to recipe name search
        recipeNameSearch.classList.remove('hidden');
        ingredientsSearch.classList.add('hidden');
        recipeLabel.classList.add('active');
        ingredientsLabel.classList.remove('active');
    }
}

/**
 * Add an ingredient to the ingredients list
 */
function addIngredient() {
    const ingredientInput = document.getElementById('ingredient-input');
    const ingredientText = ingredientInput.value.trim();
    
    // Don't add empty ingredients
    if (!ingredientText) return;
    
    // Try to add to the app state
    const added = AppState.addIngredient(ingredientText);
    
    // If ingredient wasn't added (likely a duplicate), show feedback
    if (!added) {
        // Flash the input field to indicate duplicate
        ingredientInput.classList.add('duplicate');
        setTimeout(() => {
            ingredientInput.classList.remove('duplicate');
        }, 1000);
        return;
    }
    
    // Create and append the ingredient tag
    renderIngredientsList();
    
    // Clear the input field
    ingredientInput.value = '';
    ingredientInput.focus();
    
    // Enable the search button if we have at least one ingredient
    updateSearchButtonState();
}

/**
 * Render the current list of ingredients as tags
 */
function renderIngredientsList() {
    const ingredientsList = document.getElementById('ingredients-list');
    ingredientsList.innerHTML = ''; // Clear current list
    
    // Create and append tags for each ingredient
    AppState.ingredients.forEach(ingredient => {
        const tag = createIngredientTag(ingredient);
        ingredientsList.appendChild(tag);
    });
}

/**
 * Create an HTML element for an ingredient tag
 * @param {string} ingredient - The ingredient text
 * @returns {HTMLElement} The ingredient tag element
 */
function createIngredientTag(ingredient) {
    const tag = document.createElement('div');
    tag.className = 'ingredient-tag';
    tag.dataset.ingredient = ingredient;
    
    const text = document.createElement('span');
    text.textContent = ingredient;
    
    const removeBtn = document.createElement('button');
    removeBtn.className = 'remove-ingredient';
    removeBtn.innerHTML = '<i class="fas fa-times"></i>';
    removeBtn.addEventListener('click', () => {
        removeIngredient(ingredient);
    });
    
    tag.appendChild(text);
    tag.appendChild(removeBtn);
    
    return tag;
}

/**
 * Remove an ingredient from the ingredients list
 * @param {string} ingredient - The ingredient to remove
 */
function removeIngredient(ingredient) {
    // Remove from app state
    AppState.removeIngredient(ingredient);
    
    // Update the UI
    renderIngredientsList();
    
    // Update search button state
    updateSearchButtonState();
}

/**
 * Update the state of the search button based on ingredients count
 */
function updateSearchButtonState() {
    const searchBtn = document.getElementById('search-ingredients');
    searchBtn.disabled = AppState.ingredients.length === 0;
}

/**
 * Handle the recipe name search form submission
 * @param {Event} event - The form submit event
 */
async function handleRecipeNameSearch(event) {
    event.preventDefault();
    
    const searchInput = document.getElementById('search-query');
    const query = searchInput.value.trim();
    
    if (!query) return;
    
    try {
        // Show loading state
        UI.showLoading();
        
        // Store the search query
        AppState.setLastSearchQuery(query);
        
        // Fetch recipes by name
        const recipes = await RecipeAPI.searchRecipesByName(query);
        
        // Display results
        UI.renderRecipes(recipes);
    } catch (error) {
        console.error('Error searching recipes:', error);
        UI.showError('An error occurred while searching for recipes. Please try again.');
    } finally {
        UI.hideLoading();
    }
}

/**
 * Handle the ingredients search button click
 */
async function handleIngredientsSearch() {
    // Get ingredients from app state
    const ingredients = AppState.ingredients;
    
    if (ingredients.length === 0) return;
    
    try {
        // Show loading state
        UI.showLoading();
        
        // Convert ingredients array to comma-separated string
        const ingredientsString = ingredients.join(',');
        
        // Store the search query
        AppState.setLastSearchQuery(ingredientsString);
        
        // Fetch recipes by ingredients
        const recipes = await RecipeAPI.searchRecipesByIngredients(ingredients);
        
        // Display results
        UI.renderRecipes(recipes);
    } catch (error) {
        console.error('Error searching recipes by ingredients:', error);
        UI.showError('An error occurred while searching for recipes. Please try again.');
    } finally {
        UI.hideLoading();
    }
}
