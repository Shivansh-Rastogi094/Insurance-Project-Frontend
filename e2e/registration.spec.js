// @ts-check
import { test, expect } from '@playwright/test';

/**
 * E2E Tests — Registration Flow
 * Tests customer self-registration and form validation.
 */

test.describe('Registration', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
  });

  test('Navigate to registration page', async ({ page }) => {
    await page.goto('/register');
    await expect(page).toHaveURL('/register');
    await expect(page.getByText('Create Account')).toBeVisible();
  });

  test('Form validation errors on empty submit', async ({ page }) => {
    await page.goto('/register');

    await page.getByText('Create Account').click();

    await expect(page.getByText('Full name is required')).toBeVisible();
    await expect(page.getByText('Email is required')).toBeVisible();
    await expect(page.getByText('Password is required')).toBeVisible();
    await expect(page.getByText('Phone number is required')).toBeVisible();
  });

  test('Email format validation', async ({ page }) => {
    await page.goto('/register');

    await page.getByPlaceholder('Enter your full name').fill('Test User');
    await page.getByPlaceholder('Enter your email').fill('invalid-email');
    await page.getByPlaceholder(/Min 8 chars/).fill('ValidPass@123');
    await page.getByPlaceholder('10-digit mobile number').fill('9876543210');

    await page.getByText('Create Account').click();

    await expect(page.getByText('Invalid email format')).toBeVisible();
  });

  test('Password complexity validation', async ({ page }) => {
    await page.goto('/register');

    await page.getByPlaceholder('Enter your full name').fill('Test User');
    await page.getByPlaceholder('Enter your email').fill('test@test.com');
    await page.getByPlaceholder(/Min 8 chars/).fill('simplepassword');
    await page.getByPlaceholder('10-digit mobile number').fill('9876543210');

    await page.getByText('Create Account').click();

    await expect(page.getByText(/Password must include uppercase/)).toBeVisible();
  });

  test('Phone number must be exactly 10 digits', async ({ page }) => {
    await page.goto('/register');

    await page.getByPlaceholder('Enter your full name').fill('Test User');
    await page.getByPlaceholder('Enter your email').fill('test@test.com');
    await page.getByPlaceholder(/Min 8 chars/).fill('ValidPass@123');
    await page.getByPlaceholder('10-digit mobile number').fill('12345');

    await page.getByText('Create Account').click();

    await expect(page.getByText('Phone number must be exactly 10 digits')).toBeVisible();
  });

  test('Successful registration navigates to OTP verification', async ({ page }) => {
    await page.goto('/register');

    // Use a unique email to avoid duplicates
    const uniqueEmail = `testuser${Date.now()}@test.com`;

    await page.getByPlaceholder('Enter your full name').fill('Test User');
    await page.getByPlaceholder('Enter your email').fill(uniqueEmail);
    await page.getByPlaceholder(/Min 8 chars/).fill('ValidPass@123');
    await page.getByPlaceholder('10-digit mobile number').fill('9876543210');

    await page.getByText('Create Account').click();

    // On success, should navigate to /verify-otp
    await page.waitForURL('**/verify-otp', { timeout: 10000 });
    await expect(page).toHaveURL(/verify-otp/);
  });

  test('Password toggle shows/hides password', async ({ page }) => {
    await page.goto('/register');

    const passwordInput = page.getByPlaceholder(/Min 8 chars/);
    await passwordInput.fill('TestPass@123');

    await expect(passwordInput).toHaveAttribute('type', 'password');

    await page.locator('.password-toggle-btn').click();
    await expect(passwordInput).toHaveAttribute('type', 'text');
  });

  test('Login link navigates to login page', async ({ page }) => {
    await page.goto('/register');

    await page.getByText('Sign in here').click();
    await expect(page).toHaveURL(/login/);
  });

  test('Back to Landing Page link works', async ({ page }) => {
    await page.goto('/register');

    await page.getByText(/Back to Landing Page/).click();
    await expect(page).toHaveURL('/');
  });
});
