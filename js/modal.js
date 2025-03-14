/**
 * Modal Module for the Recipe Finder app
 * Handles the recipe details modal functionality
 */

const Modal = (() => {
    // Private variables
    const modal = document.getElementById('recipe-modal');
    const closeBtn = modal.querySelector('.close');
    
    /**
     * Opens the modal with a loading state
     */
    const openModal = () => {
        modal.classList.add('show');
        document.body.style.overflow = 'hidden'; // Prevent scrolling of background content
    };
    
    /**
     * Closes the modal
     */
    const closeModal = () => {
        modal.classList.remove('show');
        document.body.style.overflow = ''; // Restore scrolling
    };
    
    // Set up event listeners
    closeBtn.addEventListener('click', closeModal);
    
    // Close modal when clicking outside the modal content
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            closeModal();
        }
    });
    
    // Close modal on escape key press
    window.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && modal.classList.contains('show')) {
            closeModal();
        }
    });
    
    // Public API
    return {
        /**
         * Opens the modal and loads recipe details
         * @param {string|number} recipeId - The ID of the recipe to display
         */
        openRecipeModal: async (recipeId) => {
            try {
                openModal();
                document.getElementById('recipe-details').innerHTML = `
                    <div class="modal-loading">
                        <p>Loading recipe details...</p>
                    </div>
                `;
                
                const recipe = await RecipeAPI.fetchRecipeDetails(recipeId);
                UI.renderRecipeDetails(recipe);
            } catch (error) {
                document.getElementById('recipe-details').innerHTML = `
                    <div class="modal-error">
                        <p>Sorry, we couldn't load the recipe details.</p>
                        <p>Error: ${error.message}</p>
                    </div>
                `;
                console.error('Error loading recipe details:', error);
            }
        },
        
        /**
         * Closes the modal
         */
        closeModal
    };
})();
