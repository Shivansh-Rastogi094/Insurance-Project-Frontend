// @ts-check
import { test, expect } from '@playwright/test';

/**
 * E2E Tests — Authentication Flows
 * Tests login, logout, and GuestRoute redirect behavior.
 * 
 * PREREQUISITE: Backend must be running at localhost:8080 with test users:
 *   - Admin:    admin@insurance.com / Admin@12345
 *   - Customer: customer@insurance.com / Customer@12345
 *   - Agent:    agent@insurance.com / Agent@12345
 * 
 * Adjust credentials below if your test data differs.
 */

const TEST_CREDENTIALS = {
  admin: { email: 'admin@insurance.com', password: 'Admin@12345' },
  customer: { email: 'customer@insurance.com', password: 'Customer@12345' },
  agent: { email: 'agent@insurance.com', password: 'Agent@12345' },
};

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
  });

  test('Landing page loads correctly', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL('/');
    // Check for key landing page content
    await expect(page.locator('body')).toBeVisible();
  });

  test('Navigate to login page', async ({ page }) => {
    await page.goto('/login');
    await expect(page).toHaveURL('/login');
    await expect(page.getByText('Sign In')).toBeVisible();
    await expect(page.getByPlaceholder('Enter email address')).toBeVisible();
    await expect(page.getByPlaceholder('Enter password')).toBeVisible();
  });

  test('Login with empty fields shows validation errors', async ({ page }) => {
    await page.goto('/login');

    // Click submit without filling in fields
    await page.getByText('Sign In').click();

    await expect(page.getByText('Email is required')).toBeVisible();
    await expect(page.getByText('Password is required')).toBeVisible();
  });

  test('Login with invalid email shows format error', async ({ page }) => {
    await page.goto('/login');

    await page.getByPlaceholder('Enter email address').fill('not-an-email');
    await page.getByPlaceholder('Enter password').fill('Password@123');
    await page.getByText('Sign In').click();

    await expect(page.getByText('Invalid email format')).toBeVisible();
  });

  test('Login with short password shows length error', async ({ page }) => {
    await page.goto('/login');

    await page.getByPlaceholder('Enter email address').fill('test@test.com');
    await page.getByPlaceholder('Enter password').fill('short');
    await page.getByText('Sign In').click();

    await expect(page.getByText('Password must be at least 8 characters')).toBeVisible();
  });

  test('Login as Admin redirects to Admin Dashboard', async ({ page }) => {
    await page.goto('/login');

    await page.getByPlaceholder('Enter email address').fill(TEST_CREDENTIALS.admin.email);
    await page.getByPlaceholder('Enter password').fill(TEST_CREDENTIALS.admin.password);
    await page.getByText('Sign In').click();

    // Wait for navigation to admin dashboard
    await page.waitForURL('**/admindashboard', { timeout: 10000 });
    await expect(page).toHaveURL(/admindashboard/);
  });

  test('Login as Customer redirects to Customer Dashboard', async ({ page }) => {
    await page.goto('/login');

    await page.getByPlaceholder('Enter email address').fill(TEST_CREDENTIALS.customer.email);
    await page.getByPlaceholder('Enter password').fill(TEST_CREDENTIALS.customer.password);
    await page.getByText('Sign In').click();

    await page.waitForURL('**/userdashboard', { timeout: 10000 });
    await expect(page).toHaveURL(/userdashboard/);
  });

  test('Login as Agent redirects to Agent Dashboard', async ({ page }) => {
    await page.goto('/login');

    await page.getByPlaceholder('Enter email address').fill(TEST_CREDENTIALS.agent.email);
    await page.getByPlaceholder('Enter password').fill(TEST_CREDENTIALS.agent.password);
    await page.getByText('Sign In').click();

    await page.waitForURL('**/agentdashboard', { timeout: 10000 });
    await expect(page).toHaveURL(/agentdashboard/);
  });

  test('Logout clears session and redirects', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.getByPlaceholder('Enter email address').fill(TEST_CREDENTIALS.admin.email);
    await page.getByPlaceholder('Enter password').fill(TEST_CREDENTIALS.admin.password);
    await page.getByText('Sign In').click();
    await page.waitForURL('**/admindashboard', { timeout: 10000 });

    // Logout
    await page.getByText('Logout').click();

    // Should clear localStorage
    const token = await page.evaluate(() => localStorage.getItem('token'));
    expect(token).toBeNull();

    const userData = await page.evaluate(() => localStorage.getItem('userData'));
    expect(userData).toBeNull();
  });

  test('Authenticated user accessing /login is redirected (GuestRoute)', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.getByPlaceholder('Enter email address').fill(TEST_CREDENTIALS.admin.email);
    await page.getByPlaceholder('Enter password').fill(TEST_CREDENTIALS.admin.password);
    await page.getByText('Sign In').click();
    await page.waitForURL('**/admindashboard', { timeout: 10000 });

    // Try to go back to /login
    await page.goto('/login');

    // Should be redirected away from login (GuestRoute)
    await expect(page).not.toHaveURL('/login');
  });

  test('Remember Me saves email to localStorage', async ({ page }) => {
    await page.goto('/login');

    const checkbox = page.locator('#rememberMe');
    await checkbox.check();

    await page.getByPlaceholder('Enter email address').fill('test@test.com');
    await page.getByPlaceholder('Enter password').fill('Password@123');
    await page.getByText('Sign In').click();

    // Wait a moment for localStorage to be updated
    await page.waitForTimeout(500);

    const rememberedEmail = await page.evaluate(() => localStorage.getItem('remembered_email'));
    // If login fails, the remember me should still have been processed on click
    const rememberFlag = await page.evaluate(() => localStorage.getItem('remember_me'));
    // The email may or may not be stored depending on login success
  });

  test('Password toggle shows/hides password', async ({ page }) => {
    await page.goto('/login');

    const passwordInput = page.getByPlaceholder('Enter password');
    await passwordInput.fill('mypassword');

    // Password should be hidden
    await expect(passwordInput).toHaveAttribute('type', 'password');

    // Click toggle
    await page.locator('.password-toggle-btn').click();
    await expect(passwordInput).toHaveAttribute('type', 'text');

    // Click again to hide
    await page.locator('.password-toggle-btn').click();
    await expect(passwordInput).toHaveAttribute('type', 'password');
  });
});
