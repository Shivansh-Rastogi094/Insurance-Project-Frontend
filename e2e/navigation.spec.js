// @ts-check
import { test, expect } from '@playwright/test';

/**
 * E2E Tests — Route Protection & Navigation
 * Tests unauthorized access, 404 handling, and public route access.
 */

test.describe('Route Protection & Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
  });

  test('Unauthenticated user is redirected from /admindashboard to /login', async ({ page }) => {
    await page.goto('/admindashboard');

    // Should redirect to login
    await page.waitForURL('**/login', { timeout: 5000 });
    await expect(page).toHaveURL(/login/);
  });

  test('Unauthenticated user is redirected from /userdashboard to /login', async ({ page }) => {
    await page.goto('/userdashboard');
    await page.waitForURL('**/login', { timeout: 5000 });
    await expect(page).toHaveURL(/login/);
  });

  test('Unauthenticated user is redirected from /agentdashboard to /login', async ({ page }) => {
    await page.goto('/agentdashboard');
    await page.waitForURL('**/login', { timeout: 5000 });
    await expect(page).toHaveURL(/login/);
  });

  test('Unauthenticated user is redirected from /profile to /login', async ({ page }) => {
    await page.goto('/profile');
    await page.waitForURL('**/login', { timeout: 5000 });
    await expect(page).toHaveURL(/login/);
  });

  test('Unauthenticated user is redirected from /claims to /login', async ({ page }) => {
    await page.goto('/claims');
    await page.waitForURL('**/login', { timeout: 5000 });
    await expect(page).toHaveURL(/login/);
  });

  test('Unauthenticated user is redirected from /payments to /login', async ({ page }) => {
    await page.goto('/payments');
    await page.waitForURL('**/login', { timeout: 5000 });
    await expect(page).toHaveURL(/login/);
  });

  test('Unauthenticated user is redirected from /users to /login', async ({ page }) => {
    await page.goto('/users');
    await page.waitForURL('**/login', { timeout: 5000 });
    await expect(page).toHaveURL(/login/);
  });

  test('Unauthenticated user is redirected from /policies to /login', async ({ page }) => {
    await page.goto('/policies');
    await page.waitForURL('**/login', { timeout: 5000 });
    await expect(page).toHaveURL(/login/);
  });

  test('404 page for unknown routes', async ({ page }) => {
    await page.goto('/this-route-does-not-exist');

    await expect(page.getByText('404')).toBeVisible();
    await expect(page.getByText('Oops! Page Lost in Space')).toBeVisible();
  });

  test('404 page has "Back to Home" button', async ({ page }) => {
    await page.goto('/unknown-page-xyz');

    const homeBtn = page.getByText('Back to Home');
    await expect(homeBtn).toBeVisible();

    await homeBtn.click();
    await expect(page).toHaveURL('/');
  });

  test('404 page has "Retry Page" button', async ({ page }) => {
    await page.goto('/unknown-route');

    await expect(page.getByText('Retry Page')).toBeVisible();
  });

  test('Contact page is accessible without authentication', async ({ page }) => {
    await page.goto('/contact');
    await expect(page).toHaveURL(/contact/);
    // Should NOT redirect to login
    await expect(page.locator('body')).toBeVisible();
  });

  test('Support page is accessible without authentication', async ({ page }) => {
    await page.goto('/support');
    await expect(page).toHaveURL(/support/);
  });

  test('Landing page is accessible without authentication', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL('/');
    await expect(page.locator('body')).toBeVisible();
  });

  test('Landing page sections are accessible (about, plans, etc.)', async ({ page }) => {
    const sections = ['/about', '/plans', '/pricing', '/features', '/claims-info', '/calculator'];

    for (const section of sections) {
      await page.goto(section);
      // All these routes render LandingPage
      await expect(page.locator('body')).toBeVisible();
    }
  });

  test('Login page is accessible without authentication', async ({ page }) => {
    await page.goto('/login');
    await expect(page).toHaveURL('/login');
    await expect(page.getByText('Sign In')).toBeVisible();
  });

  test('Register page is accessible without authentication', async ({ page }) => {
    await page.goto('/register');
    await expect(page).toHaveURL('/register');
    await expect(page.getByText('Create Account')).toBeVisible();
  });
});
