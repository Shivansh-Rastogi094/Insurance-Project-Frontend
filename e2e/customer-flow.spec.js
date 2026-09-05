// @ts-check
import { test, expect } from '@playwright/test';

/**
 * E2E Tests — Customer Journey
 * Full customer lifecycle: login → browse → purchase → claims → payments → profile → support
 * 
 * PREREQUISITE: Backend running with customer: customer@insurance.com / Customer@12345
 */

const CUSTOMER = { email: 'customer@insurance.com', password: 'Customer@12345' };

/** Helper: Login as customer */
async function loginAsCustomer(page) {
  await page.goto('/login');
  await page.getByPlaceholder('Enter email address').fill(CUSTOMER.email);
  await page.getByPlaceholder('Enter password').fill(CUSTOMER.password);
  await page.getByText('Sign In').click();
  await page.waitForURL('**/userdashboard', { timeout: 10000 });
}

test.describe('Customer Journey', () => {
  test('Login and view dashboard', async ({ page }) => {
    await loginAsCustomer(page);

    await expect(page).toHaveURL(/userdashboard/);
    // Dashboard should show some statistics or welcome content
    await expect(page.locator('body')).toBeVisible();
  });

  test('Browse policy types', async ({ page }) => {
    await loginAsCustomer(page);

    // Navigate to Products & Plans
    await page.getByText('Products & Plans').click();
    await page.waitForURL('**/policy', { timeout: 10000 });
    await expect(page).toHaveURL(/\/policy$/);
  });

  test('Browse products within a policy type', async ({ page }) => {
    await loginAsCustomer(page);

    // Navigate to Products
    await page.getByText('Products & Plans').click();
    await page.waitForURL('**/policy', { timeout: 10000 });

    // Click on a product type card (e.g., Life Insurance)
    const productCard = page.locator('[class*="card"]').first();
    if (await productCard.isVisible()) {
      await productCard.click();
      // Should navigate to product catalog
      await page.waitForTimeout(1000);
    }
  });

  test('View My Policies & Payments', async ({ page }) => {
    await loginAsCustomer(page);

    await page.getByText('My Policies & Payments').click();
    await page.waitForURL('**/payments', { timeout: 10000 });
    await expect(page).toHaveURL(/payments/);
  });

  test('View My Claims', async ({ page }) => {
    await loginAsCustomer(page);

    await page.getByText('My Claims').click();
    await page.waitForURL('**/claims', { timeout: 10000 });
    await expect(page).toHaveURL(/claims/);
  });

  test('Navigate to Contact Us', async ({ page }) => {
    await loginAsCustomer(page);

    await page.getByText('Contact Us').click();
    await page.waitForURL('**/contact', { timeout: 10000 });
    await expect(page).toHaveURL(/contact/);
  });

  test('View My Queries', async ({ page }) => {
    await loginAsCustomer(page);

    await page.getByText('My Queries').click();
    await page.waitForURL('**/queries', { timeout: 10000 });
    await expect(page).toHaveURL(/queries/);
  });

  test('View and access Profile', async ({ page }) => {
    await loginAsCustomer(page);

    await page.getByText('Profile').click();
    await page.waitForURL('**/profile', { timeout: 10000 });
    await expect(page).toHaveURL(/profile/);
  });

  test('Contact form is accessible', async ({ page }) => {
    await loginAsCustomer(page);

    await page.goto('/contact');
    await expect(page).toHaveURL(/contact/);
    // Contact page should be loaded
    await expect(page.locator('body')).toBeVisible();
  });

  test('Sidebar shows correct customer navigation', async ({ page }) => {
    await loginAsCustomer(page);

    // Verify customer-specific sidebar links
    await expect(page.getByText('Dashboard')).toBeVisible();
    await expect(page.getByText('Products & Plans')).toBeVisible();
    await expect(page.getByText('My Policies & Payments')).toBeVisible();
    await expect(page.getByText('My Claims')).toBeVisible();
    await expect(page.getByText('Contact Us')).toBeVisible();
    await expect(page.getByText('My Queries')).toBeVisible();
    await expect(page.getByText('Profile')).toBeVisible();
  });

  test('Customer cannot access admin dashboard', async ({ page }) => {
    await loginAsCustomer(page);

    await page.goto('/admindashboard');

    // Should see Access Restricted
    await expect(page.getByText('Access Restricted')).toBeVisible();
  });

  test('Customer cannot access /users (admin-only)', async ({ page }) => {
    await loginAsCustomer(page);

    await page.goto('/users');

    await expect(page.getByText('Access Restricted')).toBeVisible();
  });
});
