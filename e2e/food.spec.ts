import { test, expect } from '@playwright/test';
import { login, createFoodEntry } from './test-utils';

test.describe('Food Tracking', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto('/food');
    await page.waitForLoadState('domcontentloaded');
  });

  test('should display food tracking page with tabs', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /food tracking/i })).toBeVisible();
    
    // Check tabs
    await expect(page.getByRole('button', { name: /log food/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /today's stats/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /history/i })).toBeVisible();
  });

  test('should show empty state on log tab', async ({ page }) => {
    // Log tab should be active by default and show empty state
    await expect(page.getByText(/log a meal/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /start logging/i })).toBeVisible();
  });

  test('should add food entry using search autocomplete', async ({ page }) => {
    // Click start logging
    await page.getByRole('button', { name: /start logging/i }).click();
    
    // Search for food
    await page.getByPlaceholder(/search for food/i).fill('Apple');
    await page.waitForTimeout(500); // Wait for debounce
    
    // Select from autocomplete dropdown
    await page.getByText('Apple').first().click();
    
    // Select meal type
    await page.getByLabel(/meal type/i).selectOption('BREAKFAST');
    
    // Submit
    await page.getByRole('button', { name: /save|add/i }).click();
    
    // Should return to overview
    await page.waitForTimeout(500);
    await expect(page.getByText(/log a meal|recent/i)).toBeVisible();
  });

  test('should add custom food entry with macros', async ({ page }) => {
    await page.getByRole('button', { name: /start logging/i }).click();
    
    // Fill custom food details
    await page.getByLabel(/food name/i).fill('Custom Salad');
    await page.getByLabel(/meal type/i).selectOption('LUNCH');
    await page.getByLabel(/calories/i).fill('350');
    
    // Fill macros
    await page.getByLabel(/protein/i).fill('15');
    await page.getByLabel(/carbs/i).fill('40');
    await page.getByLabel(/fat/i).fill('12');
    
    await page.getByRole('button', { name: /save/i }).click();
    
    // Check stats tab updates
    await page.getByRole('button', { name: /today's stats/i }).click();
    await expect(page.getByText(/350|total calories/i)).toBeVisible();
  });

  test('should view food history tab', async ({ page }) => {
    await page.getByRole('button', { name: /history/i }).click();
    
    // Should show either entries or empty state
    const hasEntries = await page.getByText(/breakfast|lunch|dinner|snack/i).first().isVisible().catch(() => false);
    if (!hasEntries) {
      await expect(page.getByText(/no food entries/i)).toBeVisible();
    }
  });

  test('should show filters in history tab', async ({ page }) => {
    await page.getByRole('button', { name: /history/i }).click();
    
    // Check date picker exists
    await expect(page.getByLabel(/date/i)).toBeVisible();
    
    // Check search input exists
    await expect(page.getByPlaceholder(/search/i)).toBeVisible();
    
    // Check meal type filter exists
    await expect(page.getByLabel(/meal type/i)).toBeVisible();
  });

  test('should filter food by meal type', async ({ page }) => {
    // Add test entries
    await createFoodEntry(page, { name: 'Breakfast Item', mealType: 'BREAKFAST', calories: '200' });
    await createFoodEntry(page, { name: 'Lunch Item', mealType: 'LUNCH', calories: '500' });
    
    // Go to history
    await page.getByRole('button', { name: /history/i }).click();
    
    // Filter by breakfast
    await page.getByLabel(/meal type/i).selectOption('BREAKFAST');
    
    // Should see breakfast item
    await expect(page.getByText('Breakfast Item')).toBeVisible();
    await expect(page.getByText('Lunch Item')).not.toBeVisible();
  });

  test('should search food entries in history', async ({ page }) => {
    // Add test entry
    await createFoodEntry(page, { name: 'Apple Pie', mealType: 'SNACK', calories: '300' });
    
    // Go to history
    await page.getByRole('button', { name: /history/i }).click();
    
    // Search for "apple"
    await page.getByPlaceholder(/search/i).fill('apple');
    
    // Should see matching entry
    await expect(page.getByText('Apple Pie')).toBeVisible();
  });

  test('should edit food entry from history', async ({ page }) => {
    // Add test entry
    await createFoodEntry(page, { name: 'Test Food', mealType: 'LUNCH', calories: '350' });
    
    // Go to history
    await page.getByRole('button', { name: /history/i }).click();
    
    // Click edit button
    await page.getByRole('button').filter({ hasText: /edit|pencil/i }).first().click();
    
    // Should be on log tab with form populated
    await expect(page.getByLabel(/food name/i)).toHaveValue('Test Food');
  });

  test('should delete food entry from history', async ({ page }) => {
    // Add test entry
    await createFoodEntry(page, { name: 'Delete Me', mealType: 'SNACK', calories: '100' });
    
    // Go to history
    await page.getByRole('button', { name: /history/i }).click();
    
    // Click delete button
    await page.getByRole('button').filter({ has: page.locator('svg') }).first().click();
    
    // Entry should be removed
    await page.waitForTimeout(300);
    await expect(page.getByText('Delete Me')).not.toBeVisible();
  });

  test('should show daily stats with macros on stats tab', async ({ page }) => {
    await page.getByRole('button', { name: /today's stats/i }).click();
    
    // Verify stats cards are visible
    await expect(page.getByText(/total calories/i)).toBeVisible();
    await expect(page.getByText(/protein/i)).toBeVisible();
    await expect(page.getByText(/carbs/i)).toBeVisible();
    await expect(page.getByText(/fat/i)).toBeVisible();
  });

  test('should filter stats by date', async ({ page }) => {
    await page.getByRole('button', { name: /today's stats/i }).click();
    
    // Change date
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const dateStr = yesterday.toISOString().split('T')[0];
    
    await page.getByLabel(/date/i).fill(dateStr);
    
    // Stats should still be displayed (may be 0 if no entries)
    await page.waitForTimeout(500);
    await expect(page.getByText(/total calories/i)).toBeVisible();
  });

  test('should display meal breakdown in stats', async ({ page }) => {
    // Add entries for different meals
    await createFoodEntry(page, { name: 'Breakfast', mealType: 'BREAKFAST', calories: '300' });
    await createFoodEntry(page, { name: 'Lunch', mealType: 'LUNCH', calories: '600' });
    
    // Go to stats
    await page.getByRole('button', { name: /today's stats/i }).click();
    
    // Should see meal breakdown
    await expect(page.getByText(/breakfast/i)).toBeVisible();
    await expect(page.getByText(/lunch/i)).toBeVisible();
  });
});
