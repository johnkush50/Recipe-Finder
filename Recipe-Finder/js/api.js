/**
 * API Service for the Recipe Finder app
 * Handles all API calls and data processing
 */

const RecipeAPI = (() => {
    // Private variables and methods
    const apiInUse = 'EDAMAM'; // Set which API to use ('EDAMAM' or 'SPOONACULAR')
    
    /**
     * Constructs the API URL based on the search query and configuration
     * @param {string} query - The search query entered by user
     * @returns {string} The complete API URL for the request
     */
    const buildApiUrl = (query) => {
        if (apiInUse === 'EDAMAM') {
            return `${CONFIG.API.EDAMAM.BASE_URL}?type=${CONFIG.API.EDAMAM.TYPE}&q=${encodeURIComponent(query)}&app_id=${CONFIG.API.EDAMAM.APP_ID}&app_key=${CONFIG.API.EDAMAM.APP_KEY}`;
        } else {
            return `${CONFIG.API.SPOONACULAR.BASE_URL}/complexSearch?query=${encodeURIComponent(query)}&number=${CONFIG.DEFAULT_PARAMS.MAX_RESULTS}&apiKey=${CONFIG.API.SPOONACULAR.API_KEY}`;
        }
    };
    
    /**
     * Standardizes the recipe data format from different APIs
     * @param {Object} data - The raw API response
     * @returns {Array} Array of standardized recipe objects
     */
    const normalizeRecipeData = (data) => {
        if (apiInUse === 'EDAMAM') {
            return data.hits.map(hit => ({
                id: hit.recipe.uri.split('#recipe_')[1],
                title: hit.recipe.label,
                image: hit.recipe.image,
                source: hit.recipe.source,
                url: hit.recipe.url,
                ingredients: hit.recipe.ingredientLines,
                calories: Math.round(hit.recipe.calories),
                totalTime: hit.recipe.totalTime,
                cuisineType: hit.recipe.cuisineType,
                mealType: hit.recipe.mealType,
                dietLabels: hit.recipe.dietLabels,
                healthLabels: hit.recipe.healthLabels
            }));
        } else {
            // For Spoonacular API
            return data.results.map(recipe => ({
                id: recipe.id,
                title: recipe.title,
                image: recipe.image,
                imageType: recipe.imageType,
                calories: null, // Would need additional API call for details in Spoonacular
                ingredients: [] // Would need additional API call for details in Spoonacular
            }));
        }
    };
    
    /**
     * Fetches detailed information for a specific recipe
     * @param {string|number} recipeId - The ID of the recipe to fetch details for
     * @returns {Promise} Promise that resolves to the detailed recipe data
     */
    const fetchRecipeDetails = async (recipeId) => {
        try {
            if (apiInUse === 'EDAMAM') {
                // For Edamam, we already have detailed info from the search results
                // Just fetch the recipe from the current results
                const recipe = UI.getStoredRecipes().find(r => r.id === recipeId);
                return recipe;
            } else {
                // For Spoonacular, we need a separate API call
                const response = await fetch(
                    `${CONFIG.API.SPOONACULAR.BASE_URL}/${recipeId}/information?apiKey=${CONFIG.API.SPOONACULAR.API_KEY}`
                );
                
                if (!response.ok) {
                    throw new Error(`API error: ${response.status}`);
                }
                
                const data = await response.json();
                return {
                    id: data.id,
                    title: data.title,
                    image: data.image,
                    summary: data.summary,
                    ingredients: data.extendedIngredients.map(ing => ing.original),
                    instructions: data.instructions,
                    sourceUrl: data.sourceUrl,
                    readyInMinutes: data.readyInMinutes,
                    servings: data.servings,
                    cuisines: data.cuisines,
                    dishTypes: data.dishTypes
                };
            }
        } catch (error) {
            console.error('Error fetching recipe details:', error);
            throw error;
        }
    };

    // Public API
    return {
        /**
         * Searches for recipes based on user query
         * @param {string} query - The search query entered by user
         * @returns {Promise} Promise that resolves to normalized recipe data
         */
        searchRecipes: async (query) => {
            try {
                const apiUrl = buildApiUrl(query);
                
                const response = await fetch(apiUrl);
                
                if (!response.ok) {
                    throw new Error(`API error: ${response.status}`);
                }
                
                const data = await response.json();
                return normalizeRecipeData(data);
            } catch (error) {
                console.error('Error fetching recipes:', error);
                throw error;
            }
        },
        
        // Expose the fetchRecipeDetails function
        fetchRecipeDetails,
        
        /**
         * Get the currently active API name
         * @returns {string} The name of the API currently in use
         */
        getActiveAPI: () => apiInUse
    };
})();
