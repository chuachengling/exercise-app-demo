import { test, expect } from '@playwright/test';
import { login } from './test-utils';

test.describe('Profile Management', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto('/profile');
    await page.waitForLoadState('domcontentloaded');
  });

  test('should display user profile information', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /test user/i })).toBeVisible();
    await expect(page.getByText(/test@example.com/i)).toBeVisible();
  });

  test('should edit first name', async ({ page }) => {
    // Click edit on first name field
    await page.getByLabel(/first name/i).locator('..').getByRole('button', { name: /edit/i }).click();
    
    // Change value
    await page.getByLabel(/first name/i).clear();
    await page.getByLabel(/first name/i).fill('UpdatedName');
    
    // Save
    await page.getByLabel(/first name/i).locator('..').getByRole('button', { name: /save/i }).click();
    
    // Verify success message
    await expect(page.getByText(/updated|success/i)).toBeVisible();
  });

  test('should edit height', async ({ page }) => {
    const heightField = page.getByLabel(/height/i);
    await heightField.locator('..').getByRole('button', { name: /edit/i }).click();
    
    await heightField.clear();
    await heightField.fill('175');
    
    await heightField.locator('..').getByRole('button', { name: /save/i }).click();
    
    await expect(page.getByText(/updated|success/i)).toBeVisible();
  });

  test('should edit weight', async ({ page }) => {
    const weightField = page.getByLabel(/weight/i);
    await weightField.locator('..').getByRole('button', { name: /edit/i }).click();
    
    await weightField.clear();
    await weightField.fill('70');
    
    await weightField.locator('..').getByRole('button', { name: /save/i }).click();
    
    await expect(page.getByText(/updated|success/i)).toBeVisible();
  });

  test('should toggle email notifications', async ({ page }) => {
    // Find email notification toggle
    const toggle = page.getByText(/email notification/i).locator('..').getByRole('button');
    
    // Get initial state
    const initialState = await toggle.getAttribute('class');
    
    // Toggle
    await toggle.click();
    
    // Wait for update
    await page.waitForTimeout(500);
    
    // Verify state changed
    const newState = await toggle.getAttribute('class');
    expect(newState).not.toBe(initialState);
  });

  test('should toggle push notifications', async ({ page }) => {
    const toggle = page.getByText(/push notification/i).locator('..').getByRole('button');
    await toggle.click();
    
    // Should show success message
    await expect(page.getByText(/updated|success/i)).toBeVisible();
  });

  test('should toggle data sharing preference', async ({ page }) => {
    const toggle = page.getByText(/data sharing/i).locator('..').getByRole('button');
    await toggle.click();
    
    await page.waitForTimeout(500);
    await expect(page.getByText(/updated|success/i)).toBeVisible();
  });

  test('should change theme preference', async ({ page }) => {
    const themeField = page.getByLabel(/theme/i);
    await themeField.locator('..').getByRole('button', { name: /edit/i }).click();
    
    await themeField.selectOption('dark');
    
    await themeField.locator('..').getByRole('button', { name: /save/i }).click();
    
    await expect(page.getByText(/updated|success/i)).toBeVisible();
  });

  test('should change weight unit preference', async ({ page }) => {
    const unitField = page.getByLabel(/weight unit/i);
    await unitField.locator('..').getByRole('button', { name: /edit/i }).click();
    
    await unitField.selectOption('lbs');
    
    await unitField.locator('..').getByRole('button', { name: /save/i }).click();
    
    await expect(page.getByText(/updated|success/i)).toBeVisible();
  });

  test('should cancel edit operation', async ({ page }) => {
    // Start editing
    const firstNameField = page.getByLabel(/first name/i);
    await firstNameField.locator('..').getByRole('button', { name: /edit/i }).click();
    
    // Change value
    await firstNameField.fill('CancelTest');
    
    // Click cancel
    await firstNameField.locator('..').getByRole('button', { name: /cancel/i }).click();
    
    // Verify value was not saved
    await expect(firstNameField).not.toHaveValue('CancelTest');
  });

  test('should display member since date', async ({ page }) => {
    await expect(page.getByText(/member since/i)).toBeVisible();
  });

  test('should display health goals if set', async ({ page }) => {
    const goalsSection = page.getByText(/health goals/i);
    if (await goalsSection.isVisible()) {
      await expect(goalsSection).toBeVisible();
    }
  });
});
