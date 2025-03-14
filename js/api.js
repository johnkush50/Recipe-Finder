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
     * Test the API connection directly
     * This function is purely for debugging API key issues
     */
    const testApiConnection = async () => {
        try {
            console.log('=== TESTING API CONNECTION ===');
            console.log('Current CONFIG:', JSON.stringify({
                hasConfig: !!CONFIG,
                hasAPI: CONFIG && !!CONFIG.API,
                hasSpoonacular: CONFIG && CONFIG.API && !!CONFIG.API.SPOONACULAR,
                hasAPIKey: CONFIG && CONFIG.API && CONFIG.API.SPOONACULAR && !!CONFIG.API.SPOONACULAR.API_KEY,
                keyLength: CONFIG && CONFIG.API && CONFIG.API.SPOONACULAR && CONFIG.API.SPOONACULAR.API_KEY ? 
                          CONFIG.API.SPOONACULAR.API_KEY.length : 0
            }));
            
            if (!CONFIG || !CONFIG.API || !CONFIG.API.SPOONACULAR || !CONFIG.API.SPOONACULAR.API_KEY) {
                throw new Error('API configuration is missing');
            }
            
            const apiKey = CONFIG.API.SPOONACULAR.API_KEY;
            console.log('Using API key:', apiKey);
            
            // Make a very simple test request
            const testUrl = `https://api.spoonacular.com/recipes/complexSearch?query=pasta&number=1&apiKey=${apiKey}`;
            console.log('Testing with URL:', testUrl);
            
            const response = await fetch(testUrl);
            console.log('Response status:', response.status, response.statusText);
            
            const text = await response.text();
            console.log('Response text:', text);
            
            try {
                const data = JSON.parse(text);
                console.log('Parsed response:', data);
                if (data.results && data.results.length > 0) {
                    console.log('✅ API TEST SUCCESSFUL');
                    return true;
                } else if (data.status === 'failure') {
                    console.error('❌ API TEST FAILED:', data.message || 'Unknown error');
                    return false;
                }
            } catch (e) {
                console.error('❌ Failed to parse response:', e);
                return false;
            }
        } catch (error) {
            console.error('❌ API TEST ERROR:', error);
            return false;
        }
    };
    
    /**
     * Search for recipes by name
     * @param {string} query - Recipe name query
     * @returns {Promise<Array>} Array of recipe objects
     */
    const searchRecipesByName = async (query) => {
        console.log('Searching recipes by name:', query);
        
        // First test the API connection
        const apiTest = await testApiConnection();
        if (!apiTest) {
            throw new Error('API connection test failed. Please check your API key.');
        }
        
        try {
            // Display current CONFIG values to debug
            console.log('CONFIG object:', JSON.stringify({
                hasConfig: !!CONFIG,
                hasAPI: CONFIG && !!CONFIG.API,
                hasSpoonacular: CONFIG && CONFIG.API && !!CONFIG.API.SPOONACULAR,
                hasAPIKey: CONFIG && CONFIG.API && CONFIG.API.SPOONACULAR && !!CONFIG.API.SPOONACULAR.API_KEY,
                keyLength: CONFIG && CONFIG.API && CONFIG.API.SPOONACULAR && CONFIG.API.SPOONACULAR.API_KEY ? 
                          CONFIG.API.SPOONACULAR.API_KEY.length : 0
            }));
            
            // Check if CONFIG and API key are properly loaded
            if (!CONFIG || !CONFIG.API || !CONFIG.API.SPOONACULAR || !CONFIG.API.SPOONACULAR.API_KEY) {
                console.error('API configuration missing or invalid:', CONFIG);
                throw new Error('API configuration is missing or invalid');
            }
            
            const apiKey = CONFIG.API.SPOONACULAR.API_KEY;
            const baseUrl = CONFIG.API.SPOONACULAR.BASE_URL;
            
            // Check if the API key has the correct format (hex string)
            const hasValidFormat = /^[0-9a-f]{24,}$/.test(apiKey);
            if (!hasValidFormat) {
                console.warn('API key may not be valid format:', apiKey);
            }
            
            console.log('Using API key:', apiKey);
            
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
            console.log('Starting fetch request...');
            const response = await fetch(url);
            console.log('Fetch response received:', response.status, response.statusText);
            
            // Check if the request was successful
            if (!response.ok) {
                const errorText = await response.text();
                let errorMessage = `HTTP Error ${response.status}: ${response.statusText}`;
                
                try {
                    // Try to parse the error response as JSON
                    const errorData = JSON.parse(errorText);
                    errorMessage = `API Error: ${errorData.message || errorData.status || errorText}`;
                    console.error('API error details:', errorData);
                } catch (e) {
                    // If parsing fails, use the raw text
                    console.error('Raw API error response:', errorText);
                }
                
                throw new Error(errorMessage);
            }
            
            const data = await response.json();
            console.log('API response received with', data.results ? data.results.length : 0, 'recipes');
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
            // Check if CONFIG and API key are properly loaded
            if (!CONFIG || !CONFIG.API || !CONFIG.API.SPOONACULAR || !CONFIG.API.SPOONACULAR.API_KEY) {
                console.error('API configuration missing or invalid:', CONFIG);
                throw new Error('API configuration is missing or invalid');
            }
            
            const apiKey = CONFIG.API.SPOONACULAR.API_KEY;
            const baseUrl = CONFIG.API.SPOONACULAR.BASE_URL;
            
            console.log('Using API key:', apiKey ? 'Key available (hidden for security)' : 'No key available');
            
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
            
            // Hide API key in logs
            const logUrl = url.toString().replace(apiKey, '********');
            console.log('Fetching from:', logUrl);
            
            // Fetch data from API
            const response = await fetch(url);
            
            // Check if the request was successful
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'Unknown API error' }));
                throw new Error(`${response.status}: ${errorData.message || response.statusText}`);
            }
            
            const data = await response.json();
            console.log('API response received with', data.length, 'recipes');
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
        try {
            // Check if CONFIG and API key are properly loaded
            if (!CONFIG || !CONFIG.API || !CONFIG.API.SPOONACULAR || !CONFIG.API.SPOONACULAR.API_KEY) {
                console.error('API configuration missing or invalid:', CONFIG);
                throw new Error('API configuration is missing or invalid');
            }
            
            const apiKey = CONFIG.API.SPOONACULAR.API_KEY;
            const baseUrl = CONFIG.API.SPOONACULAR.BASE_URL;
            
            // Build URL for recipe information
            const url = new URL(`${baseUrl}/${recipeId}/information`);
            url.searchParams.append('apiKey', apiKey);
            url.searchParams.append('includeNutrition', 'true');
            
            // Hide API key in logs
            const logUrl = url.toString().replace(apiKey, '********');
            console.log('Fetching recipe details from:', logUrl);
            
            // Fetch data from API
            const response = await fetch(url);
            
            // Check if the request was successful
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'Unknown API error' }));
                throw new Error(`${response.status}: ${errorData.message || response.statusText}`);
            }
            
            const data = await response.json();
            console.log('Recipe details received');
            
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
        } catch (error) {
            console.error('Error fetching recipe details:', error);
            throw new Error(`Error fetching recipe details: ${error.message}`);
        }
    };
    
    // Public API
    return {
        searchRecipesByName,
        searchRecipesByIngredients,
        fetchRecipeDetails,
        testApiConnection // Add this for debugging
    };
})();
