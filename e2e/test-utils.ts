import { Page } from '@playwright/test';

/**
 * Test utilities and helper functions
 */

export async function login(page: Page, email = 'test@example.com', password = 'Test123!@#') {
  await page.goto('/auth/login');
  await page.waitForLoadState('networkidle');
  await page.getByLabel(/email address/i).fill(email);
  await page.getByLabel(/^password$/i).fill(password);
  await page.getByRole('button', { name: /sign in/i }).click();
  await page.waitForURL(/.*dashboard/);
  await page.waitForLoadState('domcontentloaded');
}

export async function logout(page: Page) {
  await page.getByRole('button', { name: /logout|sign out/i }).click();
  await page.waitForURL(/.*login/);
}

export async function createExerciseEntry(
  page: Page,
  data: {
    type?: string;
    name?: string;
    duration?: string;
    intensity?: string;
    calories?: string;
    notes?: string;
  } = {}
) {
  const {
    type = 'cardio',
    name = 'Test Exercise',
    duration = '30',
    intensity = 'moderate',
    calories = '200',
    notes = 'Test notes'
  } = data;

  // Navigate to exercise page if not already there
  const currentUrl = page.url();
  if (!currentUrl.includes('/exercise')) {
    await page.goto('/exercise');
  }

  // Click Add Exercise tab/button
  await page.getByRole('button', { name: /add exercise/i }).click();
  
  // Fill form
  await page.getByLabel(/name/i).fill(name);
  await page.getByLabel(/duration/i).fill(duration);
  
  // Submit
  await page.getByRole('button', { name: /save|submit/i }).click();
  
  // Wait for success
  await page.waitForTimeout(500);
}

export async function createFoodEntry(
  page: Page,
  data: {
    name?: string;
    mealType?: string;
    portionSize?: string;
    calories?: string;
    protein?: string;
    carbs?: string;
    fats?: string;
  } = {}
) {
  const {
    name = 'Test Food',
    mealType = 'BREAKFAST',
    portionSize = '1',
    calories = '200',
    protein = '10',
    carbs = '20',
    fats = '5'
  } = data;

  // Navigate to food page if not already there
  const currentUrl = page.url();
  if (!currentUrl.includes('/food')) {
    await page.goto('/food');
  }

  // Click start logging button
  await page.getByRole('button', { name: /start logging/i }).click();
  
  // Fill form
  await page.getByLabel(/food name/i).fill(name);
  await page.getByLabel(/meal type/i).selectOption(mealType);
  await page.getByLabel(/calories/i).fill(calories);
  
  if (protein) await page.getByLabel(/protein/i).fill(protein);
  if (carbs) await page.getByLabel(/carbs/i).fill(carbs);
  if (fats) await page.getByLabel(/fat/i).fill(fats);
  
  // Save
  await page.getByRole('button', { name: /save/i }).click();
  
  // Wait for success
  await page.waitForTimeout(500);
}

export async function waitForToast(page: Page, text?: string) {
  const toast = text 
    ? page.getByText(new RegExp(text, 'i'))
    : page.locator('[role="alert"], .toast, [data-testid="toast"]');
  
  await toast.waitFor({ state: 'visible', timeout: 5000 });
  return toast;
}

export async function clearLocalStorage(page: Page) {
  // Navigate to the app first to ensure localStorage is accessible
  // Note: Each test runs in an isolated browser context, so this is rarely needed
  const currentUrl = page.url();
  if (!currentUrl || currentUrl === 'about:blank') {
    await page.goto('/');
  }
  await page.evaluate(() => {
    localStorage.clear();
  });
}

export async function getLocalStorageItem(page: Page, key: string) {
  return await page.evaluate((k) => {
    return localStorage.getItem(k);
  }, key);
}

export async function setLocalStorageItem(page: Page, key: string, value: string) {
  await page.evaluate(({ k, v }) => {
    localStorage.setItem(k, v);
  }, { k: key, v: value });
}

export const TEST_USER = {
  email: 'test@example.com',
  password: 'Test123!@#',
  firstName: 'Test',
  lastName: 'User'
};

export const MOCK_EXERCISE = {
  type: 'cardio',
  name: 'Morning Run',
  duration: '30',
  intensity: 'moderate',
  calories: '300',
  notes: 'Great workout!'
};

export const MOCK_FOOD = {
  name: 'Chicken Salad',
  mealType: 'LUNCH',
  portionSize: '1',
  calories: '350',
  protein: '30',
  carbs: '25',
  fats: '15'
};

/**
 * Wait for network requests to settle
 */
export async function waitForNetworkIdle(page: Page, timeout = 2000) {
  await page.waitForTimeout(timeout);
}

/**
 * Take a screenshot with timestamp
 */
export async function takeTimestampedScreenshot(page: Page, name: string) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  await page.screenshot({ 
    path: `screenshots/${name}-${timestamp}.png`,
    fullPage: true 
  });
}

/**
 * Check if element is in viewport
 */
export async function isInViewport(page: Page, selector: string): Promise<boolean> {
  return await page.evaluate((sel) => {
    const element = document.querySelector(sel);
    if (!element) return false;
    
    const rect = element.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  }, selector);
}
