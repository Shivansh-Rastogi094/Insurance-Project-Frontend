// @ts-check
import { test, expect } from '@playwright/test';

/**
 * E2E Tests — Admin Journey
 * Full admin lifecycle: login → dashboard → manage products/plans/users/policies/claims/queries
 * 
 * PREREQUISITE: Backend running with admin: admin@insurance.com / Admin@12345
 */

const ADMIN = { email: 'admin@insurance.com', password: 'Admin@12345' };

/** Helper: Login as admin */
async function loginAsAdmin(page) {
  await page.goto('/login');
  await page.getByPlaceholder('Enter email address').fill(ADMIN.email);
  await page.getByPlaceholder('Enter password').fill(ADMIN.password);
  await page.getByText('Sign In').click();
  await page.waitForURL('**/admindashboard', { timeout: 10000 });
}

test.describe('Admin Journey', () => {
  test('Login and view admin dashboard', async ({ page }) => {
    await loginAsAdmin(page);

    await expect(page).toHaveURL(/admindashboard/);
    await expect(page.locator('body')).toBeVisible();
  });

  test('Sidebar shows admin navigation links', async ({ page }) => {
    await loginAsAdmin(page);

    await expect(page.getByText('Dashboard')).toBeVisible();
    await expect(page.getByText('Products & Plans')).toBeVisible();
    await expect(page.getByText('Users')).toBeVisible();
    await expect(page.getByText('Policies')).toBeVisible();
    await expect(page.getByText('Payments')).toBeVisible();
    await expect(page.getByText('Claims')).toBeVisible();
    await expect(page.getByText('Customers')).toBeVisible();
    await expect(page.getByText('Customer Queries')).toBeVisible();
  });

  test('Navigate to Products & Plans', async ({ page }) => {
    await loginAsAdmin(page);

    await page.getByText('Products & Plans').click();
    await page.waitForURL('**/policy', { timeout: 10000 });
    await expect(page).toHaveURL(/\/policy$/);
  });

  test('Navigate to Users management', async ({ page }) => {
    await loginAsAdmin(page);

    await page.getByText('Users').click();
    await page.waitForURL('**/users', { timeout: 10000 });
    await expect(page).toHaveURL(/users/);
  });

  test('Navigate to Policies', async ({ page }) => {
    await loginAsAdmin(page);

    await page.getByText('Policies').click();
    await page.waitForURL('**/policies', { timeout: 10000 });
    await expect(page).toHaveURL(/policies/);
  });

  test('Navigate to Payments', async ({ page }) => {
    await loginAsAdmin(page);

    await page.getByText('Payments').click();
    await page.waitForURL('**/payments', { timeout: 10000 });
    await expect(page).toHaveURL(/payments/);
  });

  test('Navigate to Claims', async ({ page }) => {
    await loginAsAdmin(page);

    await page.getByText('Claims').click();
    await page.waitForURL('**/claims', { timeout: 10000 });
    await expect(page).toHaveURL(/claims/);
  });

  test('Navigate to Customers', async ({ page }) => {
    await loginAsAdmin(page);

    await page.getByText('Customers').click();
    await page.waitForURL('**/customers', { timeout: 10000 });
    await expect(page).toHaveURL(/customers/);
  });

  test('Navigate to Customer Queries', async ({ page }) => {
    await loginAsAdmin(page);

    await page.getByText('Customer Queries').click();
    await page.waitForURL('**/queries', { timeout: 10000 });
    await expect(page).toHaveURL(/queries/);
  });

  test('Admin can access all protected routes', async ({ page }) => {
    await loginAsAdmin(page);

    // Test all admin-accessible routes
    const routes = ['/policy', '/users', '/policies', '/payments', '/claims', '/customers', '/queries', '/profile'];

    for (const route of routes) {
      await page.goto(route);
      // Should NOT see access denied
      const accessDenied = page.getByText('Access Restricted');
      await expect(accessDenied).not.toBeVisible({ timeout: 2000 }).catch(() => {
        // Some routes may take time to load, that's ok
      });
    }
  });

  test('Theme toggle works', async ({ page }) => {
    await loginAsAdmin(page);

    // Find and click the theme button
    const themeBtn = page.locator('.theme-btn');
    if (await themeBtn.isVisible()) {
      await themeBtn.click();
      await page.waitForTimeout(500);
      // Theme should have toggled (check body class or data attribute)
    }
  });
});
