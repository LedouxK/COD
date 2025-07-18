#!/bin/bash
set -e

# Créer la configuration Playwright si elle n'existe pas
if [ ! -f /app/playwright.config.js ]; then
  echo "Création du fichier de configuration Playwright..."
  cat > /app/playwright.config.js << 'EOL'
// @ts-check
const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  timeout: 30 * 1000,
  expect: { timeout: 5000 },
  fullyParallel: true,
  reporter: [['html'], ['allure-playwright']],
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] }},
    { name: 'firefox', use: { ...devices['Desktop Firefox'] }}
  ],
  outputDir: 'playwright-results/',
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3001',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure'
  }
});
EOL
fi

# Exécuter la commande fournie ou la commande par défaut
exec "$@"
