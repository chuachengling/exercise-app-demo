# E2E Testing with Playwright

This directory contains end-to-end tests for the Exercise App using Playwright.

## Test Structure

```
e2e/
├── auth.spec.ts          # Authentication tests (login, signup, logout)
├── dashboard.spec.ts     # Dashboard functionality and metrics
├── exercise.spec.ts      # Exercise tracking CRUD operations
├── food.spec.ts          # Food tracking and nutrition features
├── profile.spec.ts       # User profile management
├── navigation.spec.ts    # Navigation, responsive design, accessibility
└── test-utils.ts         # Shared utilities and helper functions
```

## Running Tests

### Run all tests
```bash
npm run test:e2e
```

### Run with UI mode (recommended for development)
```bash
npm run test:e2e:ui
```

### Run in headed mode (see browser)
```bash
npm run test:e2e:headed
```

### Run specific test file
```bash
npx playwright test auth.spec.ts
```

### Run tests matching a pattern
```bash
npx playwright test --grep "should login"
```

### Debug mode
```bash
npm run test:e2e:debug
```

### View test report
```bash
npm run test:e2e:report
```

## Test Coverage

### Authentication (`auth.spec.ts`)
- ✅ Display login page for unauthenticated users
- ✅ Display demo mode banner
- ✅ Login with valid credentials
- ✅ Toggle password visibility
- ✅ Show validation error for invalid email
- ✅ Navigate to signup page
- ✅ Signup with valid data
- ✅ Logout successfully

### Dashboard (`dashboard.spec.ts`)
- ✅ Display dashboard with header and date range
- ✅ Display summary cards with metrics (exercise, water, nutrition, goals)
- ✅ Display health chart
- ✅ Switch time range with selector
- ✅ Display metrics grid section
- ✅ Navigate to exercise/food from nav
- ✅ Refresh dashboard data with button
- ✅ Update metrics after adding exercise
- ✅ Display food nutrition data
- ✅ Show loading state initially
- ✅ Display footer with last updated time

### Exercise Tracking (`exercise.spec.ts`)
- ✅ Display exercise page with tabs (overview, add, history, timer)
- ✅ Display quick start cards on overview tab
- ✅ Add new exercise entry from quick start
- ✅ Switch to history tab and see search/filter
- ✅ Filter exercises by type in history
- ✅ Search exercises
- ✅ Display timer tab

### Food Tracking (`food.spec.ts`)
- ✅ Display food tracking page with tabs (log, stats, history)
- ✅ Show empty state on log tab
- ✅ Add food entry using search autocomplete
- ✅ Add custom food entry with macros
- ✅ View food history tab
- ✅ Show filters in history tab (date, search, meal type)
- ✅ Filter food by meal type
- ✅ Search food entries in history
- ✅ Edit food entry from history
- ✅ Delete food entry from history
- ✅ Show daily stats with macros on stats tab
- ✅ Filter stats by date
- ✅ Display meal breakdown in stats

### Profile Management (`profile.spec.ts`)
- ✅ Display user profile information
- ✅ Edit personal information (name, height, weight)
- ✅ Toggle notification preferences
- ✅ Toggle data sharing preference
- ✅ Change theme preference
- ✅ Change unit preferences
- ✅ Cancel edit operation
- ✅ Display member since date

### Navigation & Accessibility (`navigation.spec.ts`)
- ✅ Display HealthApp branding in navigation
- ✅ Navigate between pages (dashboard, goals, exercise, food, profile)
- ✅ Highlight active navigation item with bg-blue-100
- ✅ Show user info when authenticated
- ✅ Navigate back from pages
- ✅ Persist authentication across navigation
- ✅ Responsive design (mobile, tablet, desktop viewports)
- ✅ Accessibility features (heading hierarchy, form labels, keyboard navigation, accessible buttons)

## Test Utilities

The `test-utils.ts` file provides helper functions:

### Authentication
```typescript
await login(page, 'test@example.com', 'password');
await logout(page);
```

### Data Creation
```typescript
await createExerciseEntry(page, {
  type: 'cardio',
  name: 'Morning Run',
  duration: '30'
});

await createFoodEntry(page, {
  name: 'Chicken Salad',
  calories: '350'
});
```

### Storage Management
```typescript
await clearLocalStorage(page);
await setLocalStorageItem(page, 'key', 'value');
const value = await getLocalStorageItem(page, 'key');
```

### UI Helpers
```typescript
await waitForToast(page, 'Success');
await takeTimestampedScreenshot(page, 'error-state');
const isVisible = await isInViewport(page, '.element');
```

## Configuration

The tests are configured in `playwright.config.ts`:

- **Base URL**: http://localhost:3001
- **Browser**: Chromium
- **Retries**: 2 on CI, 0 locally
- **Screenshots**: On failure only
- **Traces**: On first retry
- **Web Server**: Automatically starts dev server

## Best Practices

1. **Use semantic selectors**: Prefer `getByRole`, `getByLabel`, `getByText` over CSS selectors
2. **Wait for navigation**: Use `waitForURL` after navigation actions
3. **Check visibility**: Use `toBeVisible()` to ensure elements are rendered
4. **Isolate tests**: Each test should be independent and clean up after itself
5. **Mock data**: Use consistent test data from `test-utils.ts`
6. **Screenshots**: Captured automatically on failure for debugging

## CI/CD Integration

Tests can be integrated into CI/CD pipelines:

```yaml
# Example GitHub Actions workflow
- name: Install dependencies
  run: npm ci

- name: Install Playwright Browsers
  run: npx playwright install --with-deps

- name: Run Playwright tests
  run: npm run test:e2e

- name: Upload test results
  if: always()
  uses: actions/upload-artifact@v3
  with:
    name: playwright-report
    path: playwright-report/
```

## Debugging

### Using Playwright Inspector
```bash
npm run test:e2e:debug
```

### Using UI Mode
```bash
npm run test:e2e:ui
```

### Console logs
Tests automatically capture console logs and include them in reports.

### Screenshots
Failed tests automatically capture screenshots in `test-results/` directory.

## Known Issues

1. **Authentication**: Tests use demo mode - any email/password creates an account automatically
2. **Data cleanup**: Tests call `clearLocalStorage()` before each test suite to ensure clean state
3. **Timing**: Some tests use `waitForTimeout()` for async operations - may need adjustment for slower systems
4. **Navigation**: Tests updated to match actual app structure with HealthApp branding and bg-blue-100 active states

## Future Improvements

- [ ] Add visual regression testing
- [ ] Add API mocking for consistent test data
- [ ] Add performance testing
- [ ] Add cross-browser testing (Firefox, Safari)
- [ ] Add mobile device emulation tests
- [ ] Add accessibility audit automation
- [ ] Add test data factories
- [ ] Add parallel execution optimization
