// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Basic application tests', () => {
  test('has title', async ({ page }) => {
    await page.goto('/');
    
    // Vérifier que le titre de la page contient "Chat"
    await expect(page).toHaveTitle(/Chat/);
  });

  test('page de connexion est visible', async ({ page }) => {
    await page.goto('/');
    
    // Vérifier que le formulaire de connexion est visible
    await expect(page.locator('form')).toBeVisible();
  });

  test('affiche un message d\'erreur avec identifiants incorrects', async ({ page }) => {
    await page.goto('/');
    
    // Remplir le formulaire avec des identifiants incorrects
    await page.fill('input[type="email"]', 'user@example.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    
    // Cliquer sur le bouton de connexion
    await page.click('button[type="submit"]');
    
    // Vérifier qu'un message d'erreur apparaît
    await expect(page.locator('text=Invalid credentials')).toBeVisible({ timeout: 5000 });
  });
});
