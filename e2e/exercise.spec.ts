import { test, expect } from '@playwright/test';
import { login, createExerciseEntry } from './test-utils';

test.describe('Exercise Tracking', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto('/exercise');
    await page.waitForLoadState('domcontentloaded');
  });

  test('should display exercise page with tabs', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /exercise tracker/i })).toBeVisible();
    
    // Check tabs are present
    await expect(page.getByRole('button', { name: /overview/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /add exercise/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /history/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /timer/i })).toBeVisible();
  });

  test('should display quick start cards on overview tab', async ({ page }) => {
    // Check for exercise type cards in Quick Start section
    await expect(page.getByText(/quick start/i)).toBeVisible();
    await expect(page.getByRole('heading', { name: /cardio/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /strength/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /flexibility/i })).toBeVisible();
  });

  test('should add new exercise entry from quick start', async ({ page }) => {
    // Click on cardio quick start card
    await page.getByRole('button').filter({ hasText: /cardio/i }).first().click();
    
    // Should navigate to add exercise tab
    await expect(page.getByRole('button', { name: /add exercise/i })).toHaveClass(/border-blue-500|text-blue-600/);
    
    // Fill form
    await page.getByLabel(/name/i).fill('Morning Run');
    await page.getByLabel(/duration/i).fill('30');
    
    // Save
    await page.getByRole('button', { name: /save|submit/i }).click();
    
    // Should return to overview
    await expect(page.getByText('Morning Run')).toBeVisible();
  });

  test('should switch to history tab and see search/filter', async ({ page }) => {
    // Click history tab
    await page.getByRole('button', { name: /history/i }).click();
    
    // Check for search and filter controls
    await expect(page.getByPlaceholder(/search exercises/i)).toBeVisible();
    await expect(page.getByRole('combobox')).toBeVisible();
  });

  test('should filter exercises by type in history', async ({ page }) => {
    // Create test entries
    await createExerciseEntry(page, { type: 'cardio', name: 'Running', duration: '30' });
    await createExerciseEntry(page, { type: 'strength', name: 'Lifting', duration: '45' });

    // Go to history tab
    await page.getByRole('button', { name: /history/i }).click();
    
    // Filter by cardio
    await page.getByRole('combobox').selectOption('cardio');
    
    await expect(page.getByText('Running')).toBeVisible();
    await expect(page.getByText('Lifting')).not.toBeVisible();
  });

  test('should search exercises', async ({ page }) => {
    // Create test entries
    await createExerciseEntry(page, { type: 'cardio', name: 'Morning Run', duration: '30' });
    await createExerciseEntry(page, { type: 'strength', name: 'Evening Workout', duration: '45' });

    // Go to history tab
    await page.getByRole('button', { name: /history/i }).click();
    
    // Search for "Morning"
    await page.getByPlaceholder(/search exercises/i).fill('Morning');
    
    await expect(page.getByText('Morning Run')).toBeVisible();
    await expect(page.getByText('Evening Workout')).not.toBeVisible();
  });

  test('should display timer tab', async ({ page }) => {
    await page.getByRole('button', { name: /timer/i }).click();
    
    // Timer component should be visible
    await expect(page.locator('.bg-white.rounded-xl')).toBeVisible();
  });
});
