/**
 * UI Module for Recipe Finder
 * Handles all DOM manipulation and UI rendering
 */

const UI = (() => {
    // DOM element references
    const resultsContainer = document.getElementById('results-container');
    const loadingIndicator = document.getElementById('loading');
    const errorMessage = document.getElementById('error-message');
    
    /**
     * Create a recipe card element
     * @param {Object} recipe - Recipe data object
     * @returns {HTMLElement} The recipe card element
     */
    const createRecipeCard = (recipe) => {
        const card = document.createElement('div');
        card.className = 'recipe-card';
        card.dataset.recipeId = recipe.id;
        
        // Check for missing image and use placeholder if needed
        const imageUrl = recipe.image 
            ? recipe.image 
            : 'https://via.placeholder.com/300x200?text=No+Image+Available';
        
        // Build meta information (cooking time, servings, etc.)
        let metaHtml = '';
        
        // Add cooking time if available
        if (recipe.readyInMinutes) {
            metaHtml += `
                <div class="recipe-time">
                    <i class="fas fa-clock"></i> ${recipe.readyInMinutes} min
                </div>
            `;
        }
        
        // Add servings if available
        if (recipe.servings) {
            metaHtml += `
                <div class="recipe-servings">
                    <i class="fas fa-user-friends"></i> ${recipe.servings} servings
                </div>
            `;
        }
        
        // Add ingredient usage counts for ingredient search results
        if (recipe.usedIngredientCount !== undefined) {
            // Show ingredient match score with a progress bar
            const totalIngredients = recipe.usedIngredientCount + recipe.missedIngredientCount;
            const matchPercentage = totalIngredients > 0 
                ? Math.round((recipe.usedIngredientCount / totalIngredients) * 100) 
                : 0;
            
            metaHtml += `
                <div class="recipe-match-container">
                    <div class="recipe-match-progress">
                        <div class="recipe-match-bar" style="width: ${matchPercentage}%;"></div>
                    </div>
                    <div class="recipe-match-text">
                        <span class="match-used"><i class="fas fa-check-circle"></i> ${recipe.usedIngredientCount} matched</span>
                        <span class="match-missed"><i class="fas fa-times-circle"></i> ${recipe.missedIngredientCount} missing</span>
                    </div>
                </div>
            `;
        }
        
        // Build HTML for recipe card
        card.innerHTML = `
            <img src="${imageUrl}" alt="${recipe.title}">
            <div class="recipe-info">
                <h3>${recipe.title}</h3>
                ${metaHtml ? `<div class="recipe-meta">${metaHtml}</div>` : ''}
                <button class="view-recipe-btn" data-recipe-id="${recipe.id}">View Recipe</button>
            </div>
        `;
        
        // Add event listener to view recipe button
        card.querySelector('.view-recipe-btn').addEventListener('click', () => {
            Modal.openRecipeModal(recipe.id);
        });
        
        return card;
    };
    
    /**
     * Render recipe details in the modal
     * @param {Object} recipe - The recipe details object
     */
    const renderRecipeDetails = (recipe) => {
        const recipeDetails = document.getElementById('recipe-details');
        
        // Check if we have used/missed ingredients from ingredient search
        let ingredientsHtml = '';
        
        if (recipe.usedIngredients && recipe.missedIngredients) {
            // Create two sections: matched and missing ingredients
            const usedIngredientsList = recipe.usedIngredients.map(ingredient => 
                `<li class="used-ingredient"><i class="fas fa-check-circle"></i> ${ingredient}</li>`
            ).join('');
            
            const missedIngredientsList = recipe.missedIngredients.map(ingredient => 
                `<li class="missed-ingredient"><i class="fas fa-times-circle"></i> ${ingredient}</li>`
            ).join('');
            
            ingredientsHtml = `
                <div class="ingredient-match-info">
                    <h4>Matched Ingredients</h4>
                    <ul class="ingredients-list matched-list">
                        ${usedIngredientsList || '<li>No matched ingredients</li>'}
                    </ul>
                    <h4>Additional Ingredients Needed</h4>
                    <ul class="ingredients-list missing-list">
                        ${missedIngredientsList || '<li>No additional ingredients needed</li>'}
                    </ul>
                </div>
            `;
        } else {
            // Standard ingredient list from recipe search
            ingredientsHtml = `
                <ul class="ingredients-list">
                    ${recipe.ingredients.map(ingredient => `<li>${ingredient}</li>`).join('')}
                </ul>
            `;
        }
        
        let instructionsHtml = '';
        if (recipe.analyzedInstructions && recipe.analyzedInstructions.length > 0) {
            // Use structured instructions if available
            const steps = recipe.analyzedInstructions[0].steps;
            instructionsHtml = steps.map(step => 
                `<li>${step.step}</li>`
            ).join('');
        } else if (recipe.instructions) {
            // Otherwise use text instructions, clean up html
            const cleanInstructions = recipe.instructions.replace(/<[^>]*>/g, '');
            instructionsHtml = `<li>${cleanInstructions}</li>`;
        } else {
            instructionsHtml = '<li>No instructions available. Check the source website.</li>';
        }
        
        // Format meta information if available
        let metaHtml = '';
        if (recipe.readyInMinutes) {
            metaHtml += `<span><i class="fas fa-clock"></i> ${recipe.readyInMinutes} min</span>`;
        }
        if (recipe.servings) {
            metaHtml += `<span><i class="fas fa-user-friends"></i> ${recipe.servings} servings</span>`;
        }
        if (recipe.calories) {
            metaHtml += `<span><i class="fas fa-fire"></i> ${recipe.calories} calories</span>`;
        }
        if (recipe.diets && recipe.diets.length > 0) {
            metaHtml += `<span><i class="fas fa-leaf"></i> ${recipe.diets.join(', ')}</span>`;
        }
        
        // Build HTML for recipe details
        recipeDetails.innerHTML = `
            <div class="recipe-details-header">
                <h2>${recipe.title}</h2>
                ${metaHtml ? `<div class="recipe-details-meta">${metaHtml}</div>` : ''}
                <img src="${recipe.image}" alt="${recipe.title}">
            </div>
            
            <div class="recipe-content">
                <div class="recipe-ingredients">
                    <h3><i class="fas fa-list"></i> Ingredients</h3>
                    ${ingredientsHtml}
                </div>
                
                <div class="recipe-instructions">
                    <h3><i class="fas fa-utensils"></i> Instructions</h3>
                    <ol>${instructionsHtml}</ol>
                </div>
            </div>
            
            ${recipe.sourceUrl ? `
                <div class="recipe-source">
                    <a href="${recipe.sourceUrl}" target="_blank" rel="noopener noreferrer">
                        <i class="fas fa-external-link-alt"></i> View Original Recipe
                    </a>
                </div>
            ` : ''}
        `;
    };
    
    /**
     * Create a message for no results
     * @param {string} searchQuery - The search query that yielded no results
     * @returns {HTMLElement} - The no results message element
     */
    const createNoResultsMessage = (searchMode) => {
        const noResults = document.createElement('div');
        noResults.className = 'no-results';
        
        if (searchMode === 'ingredients') {
            noResults.innerHTML = `
                <p>No recipes found with those ingredients.</p>
                <p>Try adding more ingredients or using different ones.</p>
            `;
        } else {
            noResults.innerHTML = `
                <p>No recipes found for that search term.</p>
                <p>Try a different search term or check your spelling.</p>
            `;
        }
        
        return noResults;
    };
    
    /**
     * Show loading indicator
     */
    const showLoading = () => {
        if (loadingIndicator) {
            loadingIndicator.style.display = 'flex';
        }
        
        // Hide any existing error message
        hideError();
    };
    
    /**
     * Hide loading indicator
     */
    const hideLoading = () => {
        if (loadingIndicator) {
            loadingIndicator.style.display = 'none';
        }
    };
    
    /**
     * Show error message
     * @param {string} message - Error message to display
     */
    const showError = (message) => {
        if (errorMessage) {
            errorMessage.textContent = message;
            errorMessage.style.display = 'block';
        }
    };
    
    /**
     * Hide error message
     */
    const hideError = () => {
        if (errorMessage) {
            errorMessage.style.display = 'none';
        }
    };
    
    /**
     * Render recipes to the page
     * @param {Array} recipes - Array of recipe objects
     */
    const renderRecipes = (recipes) => {
        // Clear previous results
        resultsContainer.innerHTML = '';
        
        // Handle empty results
        if (!recipes || recipes.length === 0) {
            const searchMode = AppState.getSearchMode();
            resultsContainer.appendChild(createNoResultsMessage(searchMode));
            return;
        }
        
        // Create a document fragment for efficient DOM manipulation
        const fragment = document.createDocumentFragment();
        
        // Create and append recipe cards
        recipes.forEach(recipe => {
            fragment.appendChild(createRecipeCard(recipe));
        });
        
        // Add all cards to the results container
        resultsContainer.appendChild(fragment);
        
        // Scroll to results section
        document.getElementById('results-section').scrollIntoView({ behavior: 'smooth' });
    };
    
    // Public API
    return {
        renderRecipes,
        renderRecipeDetails,
        showLoading,
        hideLoading,
        showError,
        hideError,
        createNoResultsMessage
    };
})();
