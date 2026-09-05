import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../../test/test-utils';
import NotFound from '../NotFound';

// Mock navigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('NotFound Page', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it('renders 404 code', () => {
    renderWithProviders(<NotFound />, { route: '/nonexistent' });
    expect(screen.getByText('404')).toBeInTheDocument();
  });

  it('renders page title', () => {
    renderWithProviders(<NotFound />, { route: '/nonexistent' });
    expect(screen.getByText('Oops! Page Lost in Space')).toBeInTheDocument();
  });

  it('renders description message', () => {
    renderWithProviders(<NotFound />, { route: '/nonexistent' });
    expect(screen.getByText(/couldn't find the page/i)).toBeInTheDocument();
  });

  it('renders "Page Not Found" badge', () => {
    renderWithProviders(<NotFound />, { route: '/nonexistent' });
    expect(screen.getByText(/Page Not Found/)).toBeInTheDocument();
  });

  it('has "Back to Home" button that navigates to /', async () => {
    const user = userEvent.setup();
    renderWithProviders(<NotFound />, { route: '/nonexistent' });

    const homeBtn = screen.getByText('Back to Home');
    await user.click(homeBtn);

    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('has "Retry Page" button', () => {
    renderWithProviders(<NotFound />, { route: '/nonexistent' });
    expect(screen.getByText('Retry Page')).toBeInTheDocument();
  });

  it('Retry button shows loading state when clicked', async () => {
    const user = userEvent.setup();
    // Mock window.location.reload
    const reloadMock = vi.fn();
    Object.defineProperty(window, 'location', {
      value: { ...window.location, reload: reloadMock },
      writable: true,
    });

    renderWithProviders(<NotFound />, { route: '/nonexistent' });

    const retryBtn = screen.getByText('Retry Page');
    await user.click(retryBtn);

    expect(screen.getByText('Retrying...')).toBeInTheDocument();
  });
});
