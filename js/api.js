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
            // Check if CONFIG and API key are properly loaded
            if (!CONFIG || !CONFIG.API || !CONFIG.API.SPOONACULAR || !CONFIG.API.SPOONACULAR.API_KEY) {
                console.error('API configuration missing or invalid:', CONFIG);
                throw new Error('API configuration is missing or invalid');
            }
            
            const apiKey = CONFIG.API.SPOONACULAR.API_KEY;
            const baseUrl = CONFIG.API.SPOONACULAR.BASE_URL;
            
            console.log('Using API key:', apiKey ? 'Key available (hidden for security)' : 'No key available');
            
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
            
            // Step 1: First find recipes by ingredients with detailed information
            const ingredientEndpoint = '/findByIngredients';
            const ingredientParams = {
                ingredients: ingredients.join(',+'),  // Use + for better URL encoding
                number: MAX_RESULTS * 2,  // Get more results initially, we'll filter later
                ranking: 1,  // 1 = maximize used ingredients, minimize missing ingredients
                ignorePantry: true,  // Don't count pantry items as "missing"
                apiKey: apiKey
            };
            
            // Build URL with parameters
            const ingredientUrl = new URL(`${baseUrl}${ingredientEndpoint}`);
            Object.keys(ingredientParams).forEach(key => ingredientUrl.searchParams.append(key, ingredientParams[key]));
            
            // Hide API key in logs
            const logUrl = ingredientUrl.toString().replace(apiKey, '********');
            console.log('Fetching from:', logUrl);
            
            // Fetch data from API
            const ingredientResponse = await fetch(ingredientUrl);
            
            // Check if the request was successful
            if (!ingredientResponse.ok) {
                const errorData = await ingredientResponse.json().catch(() => ({ message: 'Unknown API error' }));
                throw new Error(`${ingredientResponse.status}: ${errorData.message || ingredientResponse.statusText}`);
            }
            
            const ingredientData = await ingredientResponse.json();
            console.log('Initial ingredient search returned', ingredientData.length, 'recipes');
            
            if (!Array.isArray(ingredientData) || ingredientData.length === 0) {
                return [];
            }
            
            // Step 2: Get recipe information for the top matches
            // Filter to recipes that use at least half of the provided ingredients or have few missing ingredients
            const filteredResults = ingredientData
                .filter(recipe => {
                    // Calculate the percentage of provided ingredients used
                    const usedPercentage = recipe.usedIngredientCount / ingredients.length;
                    // Look for recipes that use at least 50% of provided ingredients
                    // OR have fewer than 3 missing ingredients if multiple ingredients were provided
                    return usedPercentage >= 0.5 || 
                           (ingredients.length > 1 && recipe.missedIngredientCount <= 3);
                })
                .slice(0, MAX_RESULTS); // Limit to requested number of results
            
            // Extract the recipe IDs to fetch full details
            const recipeIds = filteredResults.map(recipe => recipe.id);
            
            if (recipeIds.length === 0) {
                return [];
            }
            
            // Step 3: Get bulk recipe information for the filtered recipes
            const infoEndpoint = '/informationBulk';
            const infoParams = {
                ids: recipeIds.join(','),
                includeNutrition: true,
                apiKey: apiKey
            };
            
            const infoUrl = new URL(`${baseUrl}${infoEndpoint}`);
            Object.keys(infoParams).forEach(key => infoUrl.searchParams.append(key, infoParams[key]));
            
            const infoResponse = await fetch(infoUrl);
            
            if (!infoResponse.ok) {
                const errorData = await infoResponse.json().catch(() => ({ message: 'Unknown API error' }));
                throw new Error(`${infoResponse.status}: ${errorData.message || infoResponse.statusText}`);
            }
            
            const recipesWithDetails = await infoResponse.json();
            console.log('Retrieved full details for', recipesWithDetails.length, 'recipes');
            
            // Step 4: Combine the data from both API calls
            const enhancedResults = recipesWithDetails.map(detailedRecipe => {
                // Find the matching recipe from the ingredient search
                const ingredientMatch = filteredResults.find(r => r.id === detailedRecipe.id);
                
                // Return a combined object with the best data from both
                return {
                    id: detailedRecipe.id,
                    title: detailedRecipe.title,
                    image: detailedRecipe.image,
                    readyInMinutes: detailedRecipe.readyInMinutes,
                    servings: detailedRecipe.servings,
                    calories: detailedRecipe.nutrition ? 
                              Math.round(detailedRecipe.nutrition.nutrients.find(n => n.name === 'Calories')?.amount || 0) : 
                              null,
                    // Include both used and missed ingredients from the ingredient search
                    ingredients: detailedRecipe.extendedIngredients ? 
                                 detailedRecipe.extendedIngredients.map(ing => ing.original) : 
                                 [],
                    // Add match information from the ingredient search
                    usedIngredientCount: ingredientMatch ? ingredientMatch.usedIngredientCount : 0,
                    missedIngredientCount: ingredientMatch ? ingredientMatch.missedIngredientCount : 0,
                    // Calculate a match score for better sorting (higher is better)
                    matchScore: ingredientMatch ? 
                                (ingredientMatch.usedIngredientCount * 2) - ingredientMatch.missedIngredientCount : 
                                0,
                    // Add information about which ingredients were used
                    usedIngredients: ingredientMatch ? 
                                     ingredientMatch.usedIngredients.map(ing => ing.original) : 
                                     [],
                    missedIngredients: ingredientMatch ? 
                                       ingredientMatch.missedIngredients.map(ing => ing.original) : 
                                       [],
                    summary: detailedRecipe.summary,
                    instructions: detailedRecipe.instructions,
                    sourceUrl: detailedRecipe.sourceUrl
                };
            });
            
            // Sort by match score (highest first)
            enhancedResults.sort((a, b) => b.matchScore - a.matchScore);
            
            return enhancedResults;
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
     * This function is kept for backward compatibility but no longer used with the improved search
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
        fetchRecipeDetails
    };
})();
