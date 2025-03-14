/**
 * Modal Module for Recipe Finder
 * Handles the recipe details modal functionality
 */

const Modal = (() => {
    // DOM element references
    const modal = document.getElementById('recipe-modal');
    const closeBtn = modal.querySelector('.close');
    const recipeDetails = document.getElementById('recipe-details');
    
    /**
     * Opens the recipe modal and loads recipe details
     * @param {number} recipeId - The ID of the recipe to display
     */
    const openRecipeModal = async (recipeId) => {
        try {
            // Show modal
            modal.classList.add('show');
            
            // Show loading state in the modal
            recipeDetails.innerHTML = `
                <div class="loading-indicator" style="display: flex;">
                    <div class="spinner"></div>
                    <p>Loading recipe details...</p>
                </div>
            `;
            
            // Fetch recipe details from API
            const recipe = await RecipeAPI.fetchRecipeDetails(recipeId);
            
            // Render recipe details
            UI.renderRecipeDetails(recipe);
            
            // Add body class to prevent scrolling
            document.body.classList.add('modal-open');
        } catch (error) {
            console.error('Error loading recipe details:', error);
            recipeDetails.innerHTML = `
                <div class="error-message" style="display: block;">
                    <p>Sorry, we couldn't load the recipe details.</p>
                    <p>Error: ${error.message}</p>
                </div>
            `;
        }
    };
    
    /**
     * Closes the recipe modal
     */
    const closeRecipeModal = () => {
        modal.classList.remove('show');
        document.body.classList.remove('modal-open');
        
        // Clear recipe details after animation completes
        setTimeout(() => {
            recipeDetails.innerHTML = '';
        }, 300);
    };
    
    // Add event listeners
    closeBtn.addEventListener('click', closeRecipeModal);
    
    // Close when clicking outside the modal content
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            closeRecipeModal();
        }
    });
    
    // Close when pressing Escape key
    window.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && modal.classList.contains('show')) {
            closeRecipeModal();
        }
    });
    
    // Public API
    return {
        openRecipeModal
    };
})();
