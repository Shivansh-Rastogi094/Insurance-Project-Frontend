import { describe, it, expect, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders, setupAuthenticatedUser } from '../../test/test-utils';
import { ProtectedRoute } from '../ProtectedRoute';
import { mockAdminUser, mockCustomerUser, mockAgentUser } from '../../test/mocks/data';

describe('ProtectedRoute', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('redirects to /login when not authenticated', () => {
    renderWithProviders(
      <ProtectedRoute allowedRoles={['ADMIN']}>
        <div>Admin Content</div>
      </ProtectedRoute>,
      { route: '/admindashboard' }
    );

    // Should not show the protected content
    expect(screen.queryByText('Admin Content')).not.toBeInTheDocument();
  });

  it('renders children when role is authorized', () => {
    setupAuthenticatedUser(mockAdminUser);

    renderWithProviders(
      <ProtectedRoute allowedRoles={['ADMIN']}>
        <div>Admin Content</div>
      </ProtectedRoute>,
      { route: '/admindashboard' }
    );

    expect(screen.getByText('Admin Content')).toBeInTheDocument();
  });

  it('shows AccessDenied when role is not in allowedRoles', () => {
    setupAuthenticatedUser(mockCustomerUser);

    renderWithProviders(
      <ProtectedRoute allowedRoles={['ADMIN']}>
        <div>Admin Only Content</div>
      </ProtectedRoute>,
      { route: '/admindashboard' }
    );

    // Should not show protected content
    expect(screen.queryByText('Admin Only Content')).not.toBeInTheDocument();
    // Should show access denied message
    expect(screen.getByText('Access Restricted')).toBeInTheDocument();
  });

  it('shows customer dashboard link in AccessDenied for customer role', () => {
    setupAuthenticatedUser(mockCustomerUser);

    renderWithProviders(
      <ProtectedRoute allowedRoles={['ADMIN']}>
        <div>Admin Only</div>
      </ProtectedRoute>,
      { route: '/admindashboard' }
    );

    expect(screen.getByText(/Customer Dashboard/i)).toBeInTheDocument();
  });

  it('shows agent dashboard link in AccessDenied for agent role', () => {
    setupAuthenticatedUser(mockAgentUser);

    renderWithProviders(
      <ProtectedRoute allowedRoles={['ADMIN']}>
        <div>Admin Only</div>
      </ProtectedRoute>,
      { route: '/admindashboard' }
    );

    expect(screen.getByText(/Agent Dashboard/i)).toBeInTheDocument();
  });

  it('allows access for CUSTOMER when CUSTOMER is in allowedRoles', () => {
    setupAuthenticatedUser(mockCustomerUser);

    renderWithProviders(
      <ProtectedRoute allowedRoles={['ADMIN', 'CUSTOMER']}>
        <div>Shared Content</div>
      </ProtectedRoute>,
      { route: '/payments' }
    );

    expect(screen.getByText('Shared Content')).toBeInTheDocument();
  });

  it('allows access for AGENT when AGENT is in allowedRoles', () => {
    setupAuthenticatedUser(mockAgentUser);

    renderWithProviders(
      <ProtectedRoute allowedRoles={['AGENT', 'SUPER_AGENT']}>
        <div>Agent Content</div>
      </ProtectedRoute>,
      { route: '/agentdashboard' }
    );

    expect(screen.getByText('Agent Content')).toBeInTheDocument();
  });
});
