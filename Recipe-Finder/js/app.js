/**
 * Main Application Module for the Recipe Finder app
 * Initializes the application and sets up event listeners
 */

const App = (() => {
    // Private variables
    const searchForm = document.getElementById('search-form');
    const searchInput = document.getElementById('search-query');
    
    /**
     * Handles the search form submission
     * @param {Event} event - The form submission event
     */
    const handleSearch = async (event) => {
        event.preventDefault();
        
        const query = searchInput.value.trim();
        
        // Validate the search query
        if (!query) {
            UI.showError('Please enter ingredients or a recipe name to search.');
            return;
        }
        
        // Show loading state
        UI.showLoading();
        
        try {
            // Call the API service to search for recipes
            const recipes = await RecipeAPI.searchRecipes(query);
            
            // Hide loading and render results
            UI.hideLoading();
            UI.renderRecipes(recipes, query);
            
            // Scroll to results section
            document.getElementById('results-section').scrollIntoView({ behavior: 'smooth' });
        } catch (error) {
            // Handle errors
            UI.hideLoading();
            UI.showError('An error occurred while searching for recipes. Please try again later.');
            console.error('Search error:', error);
        }
    };
    
    /**
     * Initializes the application
     */
    const init = () => {
        // Set up event listeners
        searchForm.addEventListener('submit', handleSearch);
        
        // Initial UI setup
        loadingIndicator = document.getElementById('loading');
        errorMessage = document.getElementById('error-message');
        
        // Hide loading and error indicators initially
        loadingIndicator.style.display = 'none';
        errorMessage.style.display = 'none';
        
        console.log('Recipe Finder App initialized!');
    };
    
    // Public API
    return {
        /**
         * Initializes the application
         */
        init
    };
})();

// Initialize the app when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', App.init);
