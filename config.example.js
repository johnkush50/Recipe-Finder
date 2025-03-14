// config.example.js
// Copy this file to a new file named config.js and replace 'YOUR_API_KEY' with your actual API key.
/**
 * Example configuration file for Recipe Finder
 * Copy this file to js/config.js and add your API keys
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
            API_KEY: 'YOUR_SPOONACULAR_API_KEY', // Replace with your own API key
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

// If using modules, you can export it:
// export default CONFIG;
