/**
 * Configuration settings for the Recipe Finder app
 * Contains API endpoints and keys
 */

const CONFIG = {
    // API configuration
    API: {
        // Edamam Recipe API configuration
        // Replace these with your actual API credentials when in production
        EDAMAM: {
            BASE_URL: 'https://api.edamam.com/api/recipes/v2',
            APP_ID: 'YOUR_APP_ID_HERE',      // Replace with actual App ID
            APP_KEY: 'YOUR_APP_KEY_HERE',     // Replace with actual App Key
            TYPE: 'public',
        },
        
        // Alternative API (Spoonacular)
        SPOONACULAR: {
            BASE_URL: 'https://api.spoonacular.com/recipes',
            API_KEY: '67ae3ee7fefe438e8d2ebbf0db2b8919',     // Replace with actual API Key
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
