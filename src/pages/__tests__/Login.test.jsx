import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../../test/test-utils';
import Login from '../Login';

// Mock navigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('Login Page', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    localStorage.clear();
  });

  it('renders login form with email and password fields', () => {
    renderWithProviders(<Login />, { route: '/login' });

    expect(screen.getByPlaceholderText('Enter email address')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter password')).toBeInTheDocument();
    // "Sign In" appears in both h2 heading and submit button
    expect(screen.getAllByText(/Sign In/i).length).toBeGreaterThanOrEqual(1);
  });

  it('renders Crown Assurance branding', () => {
    renderWithProviders(<Login />, { route: '/login' });

    expect(screen.getAllByText(/Crown Assurance/i).length).toBeGreaterThan(0);
  });

  it('shows validation error for empty email', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Login />, { route: '/login' });

    const passwordInput = screen.getByPlaceholderText('Enter password');
    await user.type(passwordInput, 'ValidPass@123');

    const submitBtn = screen.getByRole('button', { name: /Sign In/i });
    await user.click(submitBtn);

    expect(screen.getByText('Email is required')).toBeInTheDocument();
  });

  it('shows validation error for invalid email format', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Login />, { route: '/login' });

    const emailInput = screen.getByPlaceholderText('Enter email address');
    const passwordInput = screen.getByPlaceholderText('Enter password');

    await user.type(emailInput, 'invalid-email');
    await user.type(passwordInput, 'ValidPass@123');

    const submitBtn = screen.getByRole('button', { name: /Sign In/i });
    await user.click(submitBtn);

    expect(screen.getByText('Invalid email format')).toBeInTheDocument();
  });

  it('shows validation error for empty password', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Login />, { route: '/login' });

    const emailInput = screen.getByPlaceholderText('Enter email address');
    await user.type(emailInput, 'test@test.com');

    const submitBtn = screen.getByRole('button', { name: /Sign In/i });
    await user.click(submitBtn);

    expect(screen.getByText('Password is required')).toBeInTheDocument();
  });

  it('shows password length error', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Login />, { route: '/login' });

    const emailInput = screen.getByPlaceholderText('Enter email address');
    const passwordInput = screen.getByPlaceholderText('Enter password');

    await user.type(emailInput, 'test@test.com');
    await user.type(passwordInput, 'short');

    const submitBtn = screen.getByRole('button', { name: /Sign In/i });
    await user.click(submitBtn);

    expect(screen.getByText('Password must be at least 8 characters')).toBeInTheDocument();
  });

  it('toggles password visibility', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Login />, { route: '/login' });

    const passwordInput = screen.getByPlaceholderText('Enter password');
    expect(passwordInput).toHaveAttribute('type', 'password');

    // Click the toggle button
    const toggleBtn = document.querySelector('.password-toggle-btn');
    await user.click(toggleBtn);

    expect(passwordInput).toHaveAttribute('type', 'text');
  });

  it('has Register link', () => {
    renderWithProviders(<Login />, { route: '/login' });
    expect(screen.getByText('Register here')).toBeInTheDocument();
  });

  it('has Forgot password link', () => {
    renderWithProviders(<Login />, { route: '/login' });
    expect(screen.getByText('Forgot password?')).toBeInTheDocument();
  });

  it('has Remember Me checkbox', () => {
    renderWithProviders(<Login />, { route: '/login' });
    expect(screen.getByLabelText('Remember me')).toBeInTheDocument();
  });

  it('shows session expired toast when flag is set', () => {
    localStorage.setItem('session_expired_toast', 'true');

    renderWithProviders(<Login />, { route: '/login' });

    // The toast should have been triggered (flag cleared)
    expect(localStorage.getItem('session_expired_toast')).toBeNull();
  });

  it('shows stats section', () => {
    renderWithProviders(<Login />, { route: '/login' });

    expect(screen.getByText('10M+')).toBeInTheDocument();
    expect(screen.getByText('98%')).toBeInTheDocument();
    expect(screen.getByText('24/7')).toBeInTheDocument();
  });
});
