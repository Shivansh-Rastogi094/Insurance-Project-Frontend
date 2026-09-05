import React from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import { ThemeProvider } from '../context/ThemeContext';
import { ToastProvider } from '../components/ToastProvider';

/**
 * Custom render that wraps component in all required providers.
 * Use this instead of RTL's default render for any component that needs context.
 */
export function renderWithProviders(ui, options = {}) {
  const { route = '/', ...renderOptions } = options;

  // Set the initial route
  window.history.pushState({}, 'Test page', route);

  function AllProviders({ children }) {
    return (
      <BrowserRouter>
        <AuthProvider>
          <ThemeProvider>
            <ToastProvider>
              {children}
            </ToastProvider>
          </ThemeProvider>
        </AuthProvider>
      </BrowserRouter>
    );
  }

  return {
    ...render(ui, { wrapper: AllProviders, ...renderOptions }),
  };
}

/**
 * Set up localStorage to simulate an authenticated session.
 * Call this before rendering to test "logged-in" scenarios.
 */
export function setupAuthenticatedUser(userData) {
  localStorage.setItem('userData', JSON.stringify(userData));
  localStorage.setItem('token', userData.token);
}

/**
 * Clear auth from localStorage.
 */
export function clearAuth() {
  localStorage.removeItem('userData');
  localStorage.removeItem('token');
}

// Re-export everything from RTL
export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';
