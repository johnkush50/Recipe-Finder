/**
 * AppState Module for Recipe Finder
 * Manages global application state and settings
 */

const AppState = (() => {
    // Default state values
    let searchMode = 'recipe'; // 'recipe' or 'ingredients'
    let ingredients = [];
    let lastSearchQuery = '';
    
    /**
     * Set the search mode
     * @param {string} mode - The search mode ('recipe' or 'ingredients')
     */
    const setSearchMode = (mode) => {
        if (mode !== 'recipe' && mode !== 'ingredients') {
            console.error(`Invalid search mode: ${mode}. Must be 'recipe' or 'ingredients'.`);
            return;
        }
        searchMode = mode;
    };
    
    /**
     * Get the current search mode
     * @returns {string} - The current search mode ('recipe' or 'ingredients')
     */
    const getSearchMode = () => {
        return searchMode;
    };
    
    /**
     * Add an ingredient to the ingredients list
     * @param {string} ingredient - The ingredient to add
     * @returns {boolean} - Whether the ingredient was added successfully
     */
    const addIngredient = (ingredient) => {
        if (!ingredient || ingredient.trim() === '') {
            return false;
        }
        
        const normalizedIngredient = ingredient.trim().toLowerCase();
        
        // Check if ingredient already exists
        if (ingredients.includes(normalizedIngredient)) {
            return false;
        }
        
        ingredients.push(normalizedIngredient);
        return true;
    };
    
    /**
     * Remove an ingredient from the ingredients list
     * @param {string} ingredient - The ingredient to remove
     * @returns {boolean} - Whether the ingredient was removed successfully
     */
    const removeIngredient = (ingredient) => {
        const normalizedIngredient = ingredient.trim().toLowerCase();
        const index = ingredients.indexOf(normalizedIngredient);
        
        if (index === -1) {
            return false;
        }
        
        ingredients.splice(index, 1);
        return true;
    };
    
    /**
     * Clear all ingredients from the list
     */
    const clearIngredients = () => {
        ingredients = [];
    };
    
    /**
     * Set the last search query
     * @param {string} query - The search query
     */
    const setLastSearchQuery = (query) => {
        lastSearchQuery = query;
    };
    
    // Public API
    return {
        get searchMode() {
            return searchMode;
        },
        
        get ingredients() {
            return [...ingredients]; // Return a copy to prevent direct manipulation
        },
        
        get lastSearchQuery() {
            return lastSearchQuery;
        },
        
        getSearchMode,
        setSearchMode,
        addIngredient,
        removeIngredient,
        clearIngredients,
        setLastSearchQuery
    };
})();
