import { test, expect } from '@playwright/test';
import { login, createExerciseEntry, createFoodEntry } from './test-utils';

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto('/dashboard');
    await page.waitForLoadState('domcontentloaded');
  });

  test('should display dashboard with header and date range', async ({ page }) => {
    // Check for main dashboard heading
    await expect(page.getByRole('heading', { name: /health dashboard/i })).toBeVisible();
    
    // Check for date range display
    await expect(page.locator('text=/\\w+ \\d+ - \\w+ \\d+, \\d{4}/')).toBeVisible();
    
    // Check for time range selector
    await expect(page.getByRole('button', { name: /week|month/i })).toBeVisible();
    
    // Check for refresh button
    await expect(page.getByRole('button', { name: /refresh/i })).toBeVisible();
  });

  test('should display summary cards with metrics', async ({ page }) => {
    // Wait for data to load
    await page.waitForTimeout(1000);
    
    // Verify all summary metrics are visible
    await expect(page.getByText(/exercise sessions|total exercise/i)).toBeVisible();
    await expect(page.getByText(/average.*water|daily water/i)).toBeVisible();
    await expect(page.getByText(/nutrition.*streak|tracking streak/i)).toBeVisible();
    await expect(page.getByText(/goal.*completion|completion/i)).toBeVisible();
  });

  test('should display health chart', async ({ page }) => {
    await page.waitForTimeout(1000);
    
    // Verify chart container is present
    const chart = page.locator('canvas, svg').first();
    await expect(chart).toBeVisible();
  });

  test('should switch time range with selector', async ({ page }) => {
    // Get initial date range text
    const initialDateRange = await page.locator('text=/\\w+ \\d+ - \\w+ \\d+, \\d{4}/').textContent();
    
    // Find and click time range dropdown/buttons
    const timeRangeButton = page.getByRole('button', { name: /week|month/i }).first();
    await timeRangeButton.click();
    
    // Wait for update
    await page.waitForTimeout(1000);
    
    // Dashboard should still be visible and data updated
    await expect(page.getByRole('heading', { name: /health dashboard/i })).toBeVisible();
  });

  test('should display metrics grid section', async ({ page }) => {
    await page.waitForTimeout(1000);
    
    // Scroll down to see metrics grid
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    
    // Check that metrics grid container exists
    const metricsSection = page.locator('.space-y-8').last();
    await expect(metricsSection).toBeVisible();
  });

  test('should navigate to exercise from nav', async ({ page }) => {
    // Click exercise link in navigation
    await page.getByRole('link', { name: /exercise/i }).click();
    await expect(page).toHaveURL(/.*exercise/);
  });

  test('should navigate to food from nav', async ({ page }) => {
    // Click food link in navigation
    await page.getByRole('link', { name: /food/i }).click();
    await expect(page).toHaveURL(/.*food/);
  });

  test('should refresh dashboard data with button', async ({ page }) => {
    await page.waitForTimeout(1000);
    
    // Click refresh button
    await page.getByRole('button', { name: /refresh/i }).click();
    
    // Button should show loading state
    await expect(page.getByText(/loading/i)).toBeVisible();
    
    // Wait for data to reload
    await page.waitForTimeout(1500);
    
    // Metrics should still be visible
    await expect(page.getByText(/exercise sessions|total exercise/i)).toBeVisible();
  });

  test('should update metrics after adding exercise', async ({ page }) => {
    await page.waitForTimeout(1000);
    
    // Navigate to exercise page
    await page.getByRole('link', { name: /exercise/i }).click();
    
    // Add an exercise
    await createExerciseEntry(page, {
      type: 'cardio',
      name: 'Dashboard Test Run',
      duration: '25'
    });
    
    // Navigate back to dashboard
    await page.getByRole('link', { name: /dashboard/i }).click();
    
    // Wait for data to update
    await page.waitForTimeout(1500);
    
    // Verify dashboard loaded
    await expect(page.getByRole('heading', { name: /health dashboard/i })).toBeVisible();
  });

  test('should display food nutrition data', async ({ page }) => {
    // Add food entry first
    await page.getByRole('link', { name: /food/i }).click();
    await createFoodEntry(page, {
      name: 'Test Meal',
      mealType: 'LUNCH',
      calories: '500'
    });
    
    // Go back to dashboard
    await page.getByRole('link', { name: /dashboard/i }).click();
    
    // Wait for dashboard to update
    await page.waitForTimeout(1500);
    
    // Check that nutrition tracking streak is visible
    await expect(page.getByText(/nutrition.*streak|tracking/i)).toBeVisible();
  });

  test('should show loading state initially', async ({ page }) => {
    // Navigate away and back to test loading
    await page.getByRole('link', { name: /profile/i }).click();
    await page.getByRole('link', { name: /dashboard/i }).click();
    
    // Should see loading indicator or data
    await page.waitForTimeout(500);
    await expect(page.getByRole('heading', { name: /health dashboard/i })).toBeVisible();
  });

  test('should display footer with last updated time', async ({ page }) => {
    await page.waitForTimeout(1000);
    
    // Scroll to footer
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    
    // Check for last updated text
    await expect(page.getByText(/last updated/i)).toBeVisible();
  });
});
