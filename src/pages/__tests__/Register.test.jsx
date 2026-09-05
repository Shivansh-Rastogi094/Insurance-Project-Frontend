import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../../test/test-utils';
import Register from '../Register';

// Mock navigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('Register Page', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it('renders registration form with all fields', () => {
    renderWithProviders(<Register />, { route: '/register' });

    expect(screen.getByPlaceholderText('Enter your full name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Min 8 chars/)).toBeInTheDocument();
    expect(screen.getByPlaceholderText('10-digit mobile number')).toBeInTheDocument();
    // "Create Account" appears in both heading and submit button
    expect(screen.getAllByText(/Create Account/i).length).toBeGreaterThanOrEqual(1);
  });

  it('renders Crown Assurance branding', () => {
    renderWithProviders(<Register />, { route: '/register' });
    expect(screen.getAllByText(/Crown Assurance/i).length).toBeGreaterThan(0);
  });

  it('shows validation error for empty full name', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Register />, { route: '/register' });

    const emailInput = screen.getByPlaceholderText('Enter your email');
    const passwordInput = screen.getByPlaceholderText(/Min 8 chars/);
    const phoneInput = screen.getByPlaceholderText('10-digit mobile number');

    await user.type(emailInput, 'test@test.com');
    await user.type(passwordInput, 'ValidPass@123');
    await user.type(phoneInput, '9876543210');

    const submitBtn = screen.getByRole('button', { name: /Create Account/i });
    await user.click(submitBtn);

    expect(screen.getByText('Full name is required')).toBeInTheDocument();
  });

  it('shows email validation error', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Register />, { route: '/register' });

    const nameInput = screen.getByPlaceholderText('Enter your full name');
    const emailInput = screen.getByPlaceholderText('Enter your email');
    const passwordInput = screen.getByPlaceholderText(/Min 8 chars/);
    const phoneInput = screen.getByPlaceholderText('10-digit mobile number');

    await user.type(nameInput, 'Test User');
    await user.type(emailInput, 'bademail');
    await user.type(passwordInput, 'ValidPass@123');
    await user.type(phoneInput, '9876543210');

    const submitBtn = screen.getByRole('button', { name: /Create Account/i });
    await user.click(submitBtn);

    expect(screen.getByText('Invalid email format')).toBeInTheDocument();
  });

  it('shows password complexity error', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Register />, { route: '/register' });

    const nameInput = screen.getByPlaceholderText('Enter your full name');
    const emailInput = screen.getByPlaceholderText('Enter your email');
    const passwordInput = screen.getByPlaceholderText(/Min 8 chars/);
    const phoneInput = screen.getByPlaceholderText('10-digit mobile number');

    await user.type(nameInput, 'Test User');
    await user.type(emailInput, 'test@test.com');
    await user.type(passwordInput, 'simplepassword');
    await user.type(phoneInput, '9876543210');

    const submitBtn = screen.getByRole('button', { name: /Create Account/i });
    await user.click(submitBtn);

    expect(screen.getByText(/Password must include uppercase/)).toBeInTheDocument();
  });

  it('shows phone number validation error for non-10-digit input', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Register />, { route: '/register' });

    const nameInput = screen.getByPlaceholderText('Enter your full name');
    const emailInput = screen.getByPlaceholderText('Enter your email');
    const passwordInput = screen.getByPlaceholderText(/Min 8 chars/);
    const phoneInput = screen.getByPlaceholderText('10-digit mobile number');

    await user.type(nameInput, 'Test User');
    await user.type(emailInput, 'test@test.com');
    await user.type(passwordInput, 'ValidPass@123');
    await user.type(phoneInput, '12345');

    const submitBtn = screen.getByRole('button', { name: /Create Account/i });
    await user.click(submitBtn);

    expect(screen.getByText('Phone number must be exactly 10 digits')).toBeInTheDocument();
  });

  it('toggles password visibility', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Register />, { route: '/register' });

    const passwordInput = screen.getByPlaceholderText(/Min 8 chars/);
    expect(passwordInput).toHaveAttribute('type', 'password');

    const toggleBtn = document.querySelector('.password-toggle-btn');
    await user.click(toggleBtn);

    expect(passwordInput).toHaveAttribute('type', 'text');
  });

  it('has "Sign in here" link for existing users', () => {
    renderWithProviders(<Register />, { route: '/register' });
    expect(screen.getByText('Sign in here')).toBeInTheDocument();
  });

  it('has "Back to Landing Page" link', () => {
    renderWithProviders(<Register />, { route: '/register' });
    expect(screen.getByText(/Back to Landing Page/)).toBeInTheDocument();
  });

  it('shows stats section', () => {
    renderWithProviders(<Register />, { route: '/register' });

    expect(screen.getByText('10M+')).toBeInTheDocument();
    expect(screen.getByText('98%')).toBeInTheDocument();
  });
});
