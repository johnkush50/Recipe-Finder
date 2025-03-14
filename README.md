# Recipe Finder

A web application that helps users find delicious recipes based on their ingredients using the Spoonacular API.

## Features

- Search for recipes by ingredients or recipe name
- View detailed recipe information
- Modern and responsive UI

## Deployment with GitHub Pages

This project is configured to deploy automatically to GitHub Pages using GitHub Actions.

### Setting Up API Key Secret

To securely deploy this application with your Spoonacular API key, follow these steps:

1. Go to your GitHub repository settings
2. Click on "Secrets and variables" then "Actions"
3. Click "New repository secret"
4. Name: `SPOONACULAR_API_KEY`
5. Value: `67ae3ee7fefe438e8d2ebbf0db2b8919` (or your actual API key)
6. Click "Add secret"

### How It Works

The GitHub Actions workflow:
1. Checks out your code
2. Creates a `config.js` file with your API key (from GitHub Secrets)
3. Deploys the application to GitHub Pages

## Local Development

1. Clone this repository
2. Copy `config.example.js` to `config.js`
3. In `config.js`, replace the placeholder API keys with your actual keys
4. Open `index.html` in your browser or use a local server

## Important Notes

- Never commit your actual API keys to the repository
- The `config.js` file is in `.gitignore` to prevent accidental commits
- Only the example configuration is version-controlled
