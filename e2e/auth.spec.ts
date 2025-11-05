import { test, expect } from '@playwright/test';
import { login, logout } from './test-utils';

test.describe('Authentication', () => {
  // Each test runs in a fresh browser context, no need to clear localStorage

  test('should display login page for unauthenticated users', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/auth\/login/);
    await expect(page.getByRole('heading', { name: /welcome back/i })).toBeVisible();
  });

  test('should display demo mode banner', async ({ page }) => {
    await page.goto('/auth/login');
    await expect(page.getByText(/demo mode/i)).toBeVisible();
    await expect(page.getByText(/enter any email and password/i)).toBeVisible();
  });

  test('should login with valid credentials', async ({ page }) => {
    await page.goto('/auth/login');
    
    // Fill email and password
    await page.getByLabel(/email address/i).fill('test@example.com');
    await page.getByLabel(/^password$/i).fill('Test123!@#');
    
    // Check remember me checkbox
    await page.getByLabel(/remember me/i).check();
    
    // Click sign in button
    await page.getByRole('button', { name: /sign in/i }).click();

    await page.waitForURL('/dashboard');
    await expect(page.getByRole('heading', { name: /health dashboard/i })).toBeVisible();
  });

  test('should toggle password visibility', async ({ page }) => {
    await page.goto('/auth/login');
    
    const passwordInput = page.getByLabel(/^password$/i);
    await expect(passwordInput).toHaveAttribute('type', 'password');
    
    // Click show password button
    await page.locator('button').filter({ hasText: '' }).nth(0).click(); // Eye icon button
    await expect(passwordInput).toHaveAttribute('type', 'text');
    
    // Click hide password button
    await page.locator('button').filter({ hasText: '' }).nth(0).click(); // EyeOff icon button
    await expect(passwordInput).toHaveAttribute('type', 'password');
  });

  test('should show validation error for invalid email', async ({ page }) => {
    await page.goto('/auth/login');
    
    await page.getByLabel(/email address/i).fill('invalid-email');
    await page.getByLabel(/^password$/i).fill('Test123!@#');
    await page.getByRole('button', { name: /sign in/i }).click();

    await expect(page.getByText(/invalid email/i)).toBeVisible();
  });

  test('should navigate to signup page', async ({ page }) => {
    await page.goto('/auth/login');
    await page.getByRole('link', { name: /sign up/i }).first().click();
    
    await expect(page).toHaveURL(/\/auth\/signup/);
  });

  test('should signup with valid data', async ({ page }) => {
    await page.goto('/auth/signup');
    
    const timestamp = Date.now();
    await page.getByLabel(/first name/i).fill('Test');
    await page.getByLabel(/last name/i).fill('User');
    await page.getByLabel(/email/i).fill(`test${timestamp}@example.com`);
    await page.getByLabel(/^password$/i).fill('Test123!@#');
    await page.getByLabel(/confirm password/i).fill('Test123!@#');
    await page.getByRole('button', { name: /create account/i }).click();

    // Should redirect to profile setup or goals page
    await page.waitForURL(/\/signup\/(profile-setup|goals)|\/dashboard/);
  });

  test('should logout successfully', async ({ page }) => {
    await login(page);
    await logout(page);
    
    await expect(page).toHaveURL('/');
    await expect(page.getByRole('link', { name: /sign in/i })).toBeVisible();
  });
});
