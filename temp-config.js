/**
 * Configuration settings for the Recipe Finder app
 * Contains API endpoints and keys
 */

const CONFIG = {
    // API configuration
    API: {
        // Edamam Recipe API configuration
        EDAMAM: {
            BASE_URL: 'https://api.edamam.com/api/recipes/v2',
            APP_ID: 'YOUR_APP_ID_HERE',
            APP_KEY: 'YOUR_APP_KEY_HERE',
            TYPE: 'public',
        },
        
        // Spoonacular API configuration
        SPOONACULAR: {
            BASE_URL: 'https://api.spoonacular.com/recipes',
            API_KEY: '67ae3ee7fefe438e8d2ebbf0db2b8919',
        }
    },
    
    // Default parameters
    DEFAULT_PARAMS: {
        // Number of results to return
        MAX_RESULTS: 12
    },
    
    // State flags for the application
    STATE: {
        IS_LOADING: false
    }
};
