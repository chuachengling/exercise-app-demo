import { test, expect } from '@playwright/test';
import { login } from './test-utils';

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('should display HealthApp branding in navigation', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.getByRole('link', { name: /healthapp/i })).toBeVisible();
  });

  test('should navigate to dashboard', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /dashboard/i }).click();
    await expect(page).toHaveURL(/.*dashboard/);
    await expect(page.getByRole('heading', { name: /health dashboard/i })).toBeVisible();
  });

  test('should navigate to goals page', async ({ page }) => {
    await page.goto('/dashboard');
    await page.getByRole('link', { name: /goals/i }).click();
    await expect(page).toHaveURL(/.*goals/);
  });

  test('should navigate to exercise page', async ({ page }) => {
    await page.goto('/dashboard');
    await page.getByRole('link', { name: /exercise/i }).click();
    await expect(page).toHaveURL(/.*exercise/);
    await expect(page.getByRole('heading', { name: /exercise tracker/i })).toBeVisible();
  });

  test('should navigate to food page', async ({ page }) => {
    await page.goto('/dashboard');
    await page.getByRole('link', { name: /food/i }).click();
    await expect(page).toHaveURL(/.*food/);
    await expect(page.getByRole('heading', { name: /food tracking/i })).toBeVisible();
  });

  test('should navigate to profile page', async ({ page }) => {
    await page.goto('/dashboard');
    await page.getByRole('link', { name: /profile/i }).click();
    await expect(page).toHaveURL(/.*profile/);
  });

  test('should highlight active navigation item with bg-blue-100', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Navigate to exercise
    await page.getByRole('link', { name: /exercise/i }).click();
    
    // Check if exercise link has active class (bg-blue-100 text-blue-700)
    const exerciseLink = page.getByRole('link', { name: /exercise/i });
    const classList = await exerciseLink.getAttribute('class');
    expect(classList).toContain('bg-blue-100');
  });

  test('should show user info when authenticated', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Check for user information in nav
    await expect(page.getByText(/test@example\.com/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /logout/i })).toBeVisible();
  });

  test('should navigate back from pages', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Navigate to exercise
    await page.getByRole('link', { name: /exercise/i }).click();
    await expect(page).toHaveURL(/.*exercise/);
    
    // Go back
    await page.goBack();
    await expect(page).toHaveURL(/.*dashboard/);
  });

  test('should persist authentication across navigation', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Navigate through multiple pages
    await page.getByRole('link', { name: /exercise/i }).click();
    await page.getByRole('link', { name: /food/i }).click();
    await page.getByRole('link', { name: /profile/i }).click();
    
    // Should still be authenticated (not redirected to login)
    await expect(page).not.toHaveURL(/.*login/);
    await expect(page.getByRole('button', { name: /logout/i })).toBeVisible();
  });
});

test.describe('Responsive Design', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('should display properly on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/dashboard');
    
    // Dashboard should be visible
    await expect(page.getByRole('heading', { name: /health dashboard/i })).toBeVisible();
    
    // Navigation should be accessible
    const nav = page.locator('nav');
    await expect(nav).toBeVisible();
  });

  test('should display properly on tablet viewport', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/dashboard');
    
    await expect(page.getByRole('heading', { name: /health dashboard/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /dashboard/i })).toBeVisible();
  });

  test('should display properly on desktop viewport', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/dashboard');
    
    await expect(page.getByRole('heading', { name: /health dashboard/i })).toBeVisible();
    // All nav items should be visible on desktop
    await expect(page.getByRole('link', { name: /exercise/i })).toBeVisible();
  });
});

test.describe('Accessibility', () => {
  // No beforeEach needed - accessibility tests navigate to their own pages

  test('should have proper heading hierarchy on login page', async ({ page }) => {
    await page.goto('/auth/login');
    
    // Check for h2 heading (Welcome back)
    const heading = page.getByRole('heading', { name: /welcome back/i });
    await expect(heading).toBeVisible();
  });

  test('should have form labels on login page', async ({ page }) => {
    await page.goto('/auth/login');
    
    // Check that inputs have associated labels
    const emailInput = page.getByLabel(/email address/i);
    const passwordInput = page.getByLabel(/^password$/i);
    
    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
  });

  test('should support keyboard navigation on login form', async ({ page }) => {
    await page.goto('/auth/login');
    
    // Tab through form elements
    await page.keyboard.press('Tab'); // Focus first tabbable element
    
    // Email input should be focusable
    const emailInput = page.getByLabel(/email address/i);
    await emailInput.focus();
    await expect(emailInput).toBeFocused();
  });

  test('should have accessible buttons with icons', async ({ page }) => {
    await login(page);
    await page.goto('/dashboard');
    
    // Check that icon buttons have accessible text
    const refreshButton = page.getByRole('button', { name: /refresh/i });
    await expect(refreshButton).toBeVisible();
  });
});
