// @ts-check
import { test, expect } from '@playwright/test';

/**
 * E2E Tests — Agent Journey
 * Agent lifecycle: login → dashboard → review claims → view customers → view policies
 * 
 * PREREQUISITE: Backend running with agent: agent@insurance.com / Agent@12345
 */

const AGENT = { email: 'agent@insurance.com', password: 'Agent@12345' };

/** Helper: Login as agent */
async function loginAsAgent(page) {
  await page.goto('/login');
  await page.getByPlaceholder('Enter email address').fill(AGENT.email);
  await page.getByPlaceholder('Enter password').fill(AGENT.password);
  await page.getByText('Sign In').click();
  await page.waitForURL('**/agentdashboard', { timeout: 10000 });
}

test.describe('Agent Journey', () => {
  test('Login and view agent dashboard', async ({ page }) => {
    await loginAsAgent(page);

    await expect(page).toHaveURL(/agentdashboard/);
    await expect(page.locator('body')).toBeVisible();
  });

  test('Sidebar shows agent navigation links', async ({ page }) => {
    await loginAsAgent(page);

    await expect(page.getByText('Dashboard')).toBeVisible();
    await expect(page.getByText('Products & Plans')).toBeVisible();
    await expect(page.getByText('Policies')).toBeVisible();
    await expect(page.getByText('Payments')).toBeVisible();
    await expect(page.getByText('Claims')).toBeVisible();
    await expect(page.getByText('Customers')).toBeVisible();
    await expect(page.getByText('Customer Queries')).toBeVisible();
  });

  test('Agent does NOT see Users link (admin-only)', async ({ page }) => {
    await loginAsAgent(page);

    // "Users" should not be in agent sidebar
    const usersLink = page.locator('.sidebar').getByText('Users', { exact: true });
    await expect(usersLink).not.toBeVisible();
  });

  test('Navigate to Claims', async ({ page }) => {
    await loginAsAgent(page);

    await page.getByText('Claims').click();
    await page.waitForURL('**/claims', { timeout: 10000 });
    await expect(page).toHaveURL(/claims/);
  });

  test('Navigate to Customers', async ({ page }) => {
    await loginAsAgent(page);

    await page.getByText('Customers').click();
    await page.waitForURL('**/customers', { timeout: 10000 });
    await expect(page).toHaveURL(/customers/);
  });

  test('Navigate to Policies', async ({ page }) => {
    await loginAsAgent(page);

    await page.getByText('Policies').click();
    await page.waitForURL('**/policies', { timeout: 10000 });
    await expect(page).toHaveURL(/policies/);
  });

  test('Navigate to Payments', async ({ page }) => {
    await loginAsAgent(page);

    await page.getByText('Payments').click();
    await page.waitForURL('**/payments', { timeout: 10000 });
    await expect(page).toHaveURL(/payments/);
  });

  test('Navigate to Customer Queries', async ({ page }) => {
    await loginAsAgent(page);

    await page.getByText('Customer Queries').click();
    await page.waitForURL('**/queries', { timeout: 10000 });
    await expect(page).toHaveURL(/queries/);
  });

  test('Agent cannot access /users (admin-only)', async ({ page }) => {
    await loginAsAgent(page);

    await page.goto('/users');
    await expect(page.getByText('Access Restricted')).toBeVisible();
  });

  test('Agent cannot access /admindashboard', async ({ page }) => {
    await loginAsAgent(page);

    await page.goto('/admindashboard');
    await expect(page.getByText('Access Restricted')).toBeVisible();
  });

  test('Agent has logout button', async ({ page }) => {
    await loginAsAgent(page);

    await expect(page.getByText('Logout')).toBeVisible();
  });
});
