/**
 * UI Module for the Recipe Finder app
 * Handles all DOM manipulation and UI rendering
 */

const UI = (() => {
    // Private variables and methods
    const resultsContainer = document.getElementById('results-container');
    const loadingIndicator = document.getElementById('loading');
    const errorMessage = document.getElementById('error-message');
    
    // Store recipes data locally to use when showing recipe details
    let recipesData = [];
    
    /**
     * Shows the loading indicator and hides error messages
     */
    const showLoading = () => {
        CONFIG.STATE.IS_LOADING = true;
        loadingIndicator.style.display = 'block';
        errorMessage.style.display = 'none';
        errorMessage.textContent = '';
    };
    
    /**
     * Hides the loading indicator
     */
    const hideLoading = () => {
        CONFIG.STATE.IS_LOADING = false;
        loadingIndicator.style.display = 'none';
    };
    
    /**
     * Displays an error message to the user
     * @param {string} message - The error message to display
     */
    const showError = (message) => {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
    };
    
    /**
     * Clears the results container
     */
    const clearResults = () => {
        resultsContainer.innerHTML = '';
    };
    
    /**
     * Creates a recipe card element
     * @param {Object} recipe - The recipe data
     * @returns {HTMLElement} The created recipe card element
     */
    const createRecipeCard = (recipe) => {
        const card = document.createElement('div');
        card.className = 'recipe-card';
        card.dataset.id = recipe.id; // Store recipe ID as a data attribute
        
        // Create image element or placeholder
        const imageHtml = recipe.image 
            ? `<img src="${recipe.image}" alt="${recipe.title}" loading="lazy">` 
            : '<div class="image-placeholder">No image available</div>';
        
        // Create short description from ingredients or cuisine type
        let description = '';
        if (recipe.ingredients && recipe.ingredients.length > 0) {
            // Show first few ingredients
            const ingredientsList = recipe.ingredients.slice(0, 3);
            description = `<p>Ingredients: ${ingredientsList.join(', ')}${recipe.ingredients.length > 3 ? '...' : ''}</p>`;
        } else if (recipe.cuisineType) {
            description = `<p>Cuisine: ${recipe.cuisineType}</p>`;
        } else {
            description = '<p>Click for more details</p>';
        }
        
        // Add additional details if available
        let additionalDetails = '';
        if (recipe.totalTime) {
            additionalDetails += `<span class="recipe-time">⏰ ${recipe.totalTime} min</span>`;
        }
        if (recipe.calories) {
            additionalDetails += `<span class="recipe-calories">🔥 ${recipe.calories} cal</span>`;
        }
        
        card.innerHTML = `
            ${imageHtml}
            <div class="recipe-info">
                <h3>${recipe.title}</h3>
                ${description}
                <div class="recipe-meta">${additionalDetails}</div>
                <button class="view-recipe">View Recipe</button>
            </div>
        `;
        
        // Add event listener to view the recipe details
        card.addEventListener('click', () => {
            Modal.openRecipeModal(recipe.id);
        });
        
        return card;
    };
    
    /**
     * Creates a message when no results are found
     * @param {string} query - The search query
     * @returns {HTMLElement} The no results message element
     */
    const createNoResultsMessage = (query) => {
        const message = document.createElement('div');
        message.className = 'no-results';
        message.innerHTML = `
            <p>No recipes found for "${query}".</p>
            <p>Try searching with different ingredients or a simpler query.</p>
        `;
        return message;
    };
    
    // Public API
    return {
        /**
         * Renders the recipes list to the UI
         * @param {Array} recipes - The array of recipe objects
         * @param {string} query - The search query
         */
        renderRecipes: (recipes, query) => {
            clearResults();
            recipesData = recipes; // Store for later use
            
            if (recipes.length === 0) {
                resultsContainer.appendChild(createNoResultsMessage(query));
                return;
            }
            
            // Create and append recipe cards
            const fragment = document.createDocumentFragment();
            recipes.forEach(recipe => {
                fragment.appendChild(createRecipeCard(recipe));
            });
            
            resultsContainer.appendChild(fragment);
        },
        
        /**
         * Shows the loading indicator and hides error messages
         */
        showLoading,
        
        /**
         * Hides the loading indicator
         */
        hideLoading,
        
        /**
         * Displays an error message to the user
         * @param {string} message - The error message to display
         */
        showError,
        
        /**
         * Retrieves the stored recipe data
         * @returns {Array} The stored recipe data
         */
        getStoredRecipes: () => recipesData,
        
        /**
         * Renders detailed recipe information in the modal
         * @param {Object} recipe - The detailed recipe object
         */
        renderRecipeDetails: (recipe) => {
            const recipeDetails = document.getElementById('recipe-details');
            
            // Format ingredients list
            const ingredientsList = recipe.ingredients
                ? recipe.ingredients.map(ing => `<li>${ing}</li>`).join('')
                : '<li>No ingredients information available</li>';
            
            // Format instructions if available
            let instructionsHtml = '<p>No detailed instructions available. Please check the source website.</p>';
            if (recipe.instructions) {
                // Check if instructions are already in HTML format
                if (recipe.instructions.includes('<ol>') || recipe.instructions.includes('<p>')) {
                    instructionsHtml = recipe.instructions;
                } else {
                    // Convert plain text to HTML with proper formatting
                    const steps = recipe.instructions.split('\n')
                        .filter(step => step.trim() !== '')
                        .map(step => `<li>${step}</li>`);
                    
                    if (steps.length > 0) {
                        instructionsHtml = `<ol>${steps.join('')}</ol>`;
                    }
                }
            }
            
            // Additional recipe metadata
            let metadataHtml = '<div class="recipe-metadata">';
            if (recipe.totalTime) metadataHtml += `<span>⏰ Cook Time: ${recipe.totalTime} minutes</span>`;
            if (recipe.calories) metadataHtml += `<span>🔥 Calories: ${recipe.calories}</span>`;
            if (recipe.servings) metadataHtml += `<span>👥 Servings: ${recipe.servings}</span>`;
            metadataHtml += '</div>';
            
            // Source information
            const sourceInfo = recipe.source || recipe.sourceUrl 
                ? `<p class="recipe-source">Source: ${recipe.source || 'Original Recipe'}
                   ${recipe.url ? `<a href="${recipe.url}" target="_blank">View Original</a>` : ''}</p>`
                : '';
            
            recipeDetails.innerHTML = `
                <h3>${recipe.title}</h3>
                ${metadataHtml}
                <div class="recipe-content">
                    <div class="recipe-image">
                        ${recipe.image ? `<img src="${recipe.image}" alt="${recipe.title}">` : ''}
                    </div>
                    <div class="recipe-text">
                        <div class="recipe-ingredients">
                            <h4>Ingredients</h4>
                            <ul>${ingredientsList}</ul>
                        </div>
                        <div class="recipe-instructions">
                            <h4>Instructions</h4>
                            ${instructionsHtml}
                        </div>
                        ${sourceInfo}
                    </div>
                </div>
            `;
        }
    };
})();
