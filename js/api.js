/**
 * API Module for Recipe Finder
 * Handles all interactions with the recipe API services
 */

const RecipeAPI = (() => {
    // Default API to use
    const DEFAULT_API = 'SPOONACULAR';
    
    // Maximum number of results to return
    const MAX_RESULTS = CONFIG.DEFAULT_PARAMS.MAX_RESULTS || 12;
    
    /**
     * Search for recipes by name
     * @param {string} query - Recipe name query
     * @returns {Promise<Array>} Array of recipe objects
     */
    const searchRecipesByName = async (query) => {
        console.log('Searching recipes by name:', query);
        
        try {
            const apiKey = CONFIG.API.SPOONACULAR.API_KEY;
            const baseUrl = CONFIG.API.SPOONACULAR.BASE_URL;
            
            // Set up endpoint and parameters
            const endpoint = '/complexSearch';
            const params = {
                query: query,
                number: MAX_RESULTS,
                addRecipeInformation: true,
                fillIngredients: true,
                apiKey: apiKey
            };
            
            // Build URL with parameters
            const url = new URL(`${baseUrl}${endpoint}`);
            Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
            
            console.log('Fetching from:', url.toString());
            
            // Fetch data from API
            const response = await fetch(url);
            
            // Check if the request was successful
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'Unknown API error' }));
                throw new Error(`${response.status}: ${errorData.message || response.statusText}`);
            }
            
            const data = await response.json();
            return processRecipeSearchResults(data);
        } catch (error) {
            console.error('API error:', error);
            throw new Error(`API error: ${error.message}`);
        }
    };
    
    /**
     * Search for recipes by ingredients
     * @param {Array} ingredients - Array of ingredient names
     * @returns {Promise<Array>} Array of recipe objects
     */
    const searchRecipesByIngredients = async (ingredients) => {
        console.log('Searching recipes by ingredients:', ingredients);
        
        try {
            const apiKey = CONFIG.API.SPOONACULAR.API_KEY;
            const baseUrl = CONFIG.API.SPOONACULAR.BASE_URL;
            
            // Set up endpoint and parameters
            const endpoint = '/findByIngredients';
            const params = {
                ingredients: ingredients.join(','),
                number: MAX_RESULTS,
                ranking: 2, // maximize used ingredients
                ignorePantry: true,
                apiKey: apiKey
            };
            
            // Build URL with parameters
            const url = new URL(`${baseUrl}${endpoint}`);
            Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
            
            console.log('Fetching from:', url.toString());
            
            // Fetch data from API
            const response = await fetch(url);
            
            // Check if the request was successful
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'Unknown API error' }));
                throw new Error(`${response.status}: ${errorData.message || response.statusText}`);
            }
            
            const data = await response.json();
            return processIngredientSearchResults(data);
        } catch (error) {
            console.error('API error:', error);
            throw new Error(`API error: ${error.message}`);
        }
    };
    
    /**
     * Process results from recipe name search
     * @param {Object} data - API response data
     * @returns {Array} Processed recipe results
     */
    const processRecipeSearchResults = (data) => {
        if (!data.results || !Array.isArray(data.results)) {
            return [];
        }
        
        return data.results.map(recipe => ({
            id: recipe.id,
            title: recipe.title,
            image: recipe.image,
            readyInMinutes: recipe.readyInMinutes,
            servings: recipe.servings,
            calories: recipe.nutrition ? Math.round(recipe.nutrition.nutrients.find(n => n.name === 'Calories')?.amount || 0) : null,
            ingredients: recipe.extendedIngredients ? recipe.extendedIngredients.map(ing => ing.original) : [],
            summary: recipe.summary,
            instructions: recipe.instructions,
            sourceUrl: recipe.sourceUrl
        }));
    };
    
    /**
     * Process results from ingredient search
     * @param {Array} data - API response data
     * @returns {Array} Processed recipe results
     */
    const processIngredientSearchResults = (data) => {
        if (!Array.isArray(data)) {
            return [];
        }
        
        return data.map(recipe => ({
            id: recipe.id,
            title: recipe.title,
            image: recipe.image,
            usedIngredientCount: recipe.usedIngredientCount,
            missedIngredientCount: recipe.missedIngredientCount,
            likes: recipe.likes,
            // These will be populated when viewing details
            readyInMinutes: null,
            servings: null,
            ingredients: recipe.usedIngredients.concat(recipe.missedIngredients).map(ing => ing.original),
            summary: null,
            instructions: null,
            sourceUrl: null
        }));
    };
    
    /**
     * Fetch detailed information for a specific recipe
     * @param {number} recipeId - The recipe ID to fetch details for
     * @returns {Promise<Object>} Detailed recipe information
     */
    const fetchRecipeDetails = async (recipeId) => {
        const apiKey = CONFIG.API.SPOONACULAR.API_KEY;
        const baseUrl = CONFIG.API.SPOONACULAR.BASE_URL;
        
        // Build URL for recipe information
        const url = new URL(`${baseUrl}/${recipeId}/information`);
        url.searchParams.append('apiKey', apiKey);
        url.searchParams.append('includeNutrition', 'true');
        
        console.log('Fetching recipe details from:', url.toString());
        
        // Fetch data from API
        const response = await fetch(url);
        
        // Check if the request was successful
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Unknown API error' }));
            throw new Error(`${response.status}: ${errorData.message || response.statusText}`);
        }
        
        const data = await response.json();
        
        // Process and return the recipe details
        return {
            id: data.id,
            title: data.title,
            image: data.image,
            readyInMinutes: data.readyInMinutes,
            servings: data.servings,
            calories: data.nutrition ? Math.round(data.nutrition.nutrients.find(n => n.name === 'Calories')?.amount || 0) : null,
            ingredients: data.extendedIngredients ? data.extendedIngredients.map(ing => ing.original) : [],
            summary: data.summary,
            instructions: data.instructions,
            sourceUrl: data.sourceUrl,
            diets: data.diets || [],
            dishTypes: data.dishTypes || [],
            analyzedInstructions: data.analyzedInstructions || []
        };
    };
    
    // Public API
    return {
        searchRecipesByName,
        searchRecipesByIngredients,
        fetchRecipeDetails
    };
})();
