import { describe, it, expect, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders, setupAuthenticatedUser } from '../../test/test-utils';
import Sidebar from '../Sidebar';
import { mockAdminUser, mockCustomerUser, mockAgentUser, mockSuperAgentUser } from '../../test/mocks/data';

describe('Sidebar', () => {
  describe('Admin role', () => {
    beforeEach(() => {
      setupAuthenticatedUser(mockAdminUser);
    });

    it('renders admin navigation links', () => {
      renderWithProviders(<Sidebar />, { route: '/admindashboard' });

      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Products & Plans')).toBeInTheDocument();
      expect(screen.getByText('Users')).toBeInTheDocument();
      expect(screen.getByText('Policies')).toBeInTheDocument();
      expect(screen.getByText('Payments')).toBeInTheDocument();
      expect(screen.getByText('Claims')).toBeInTheDocument();
      expect(screen.getByText('Customers')).toBeInTheDocument();
      expect(screen.getByText('Customer Queries')).toBeInTheDocument();
    });

    it('shows "Admin Panel" in sidebar brand', () => {
      renderWithProviders(<Sidebar />, { route: '/admindashboard' });
      // "Admin Panel" appears in both h2 and subtitle span
      expect(screen.getAllByText('Admin Panel').length).toBeGreaterThanOrEqual(1);
    });

    it('renders custom title when provided', () => {
      renderWithProviders(<Sidebar title="Custom Title" />, { route: '/admindashboard' });
      expect(screen.getByText('Custom Title')).toBeInTheDocument();
    });
  });

  describe('Customer role', () => {
    beforeEach(() => {
      setupAuthenticatedUser(mockCustomerUser);
    });

    it('renders customer navigation links', () => {
      renderWithProviders(<Sidebar />, { route: '/userdashboard' });

      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Products & Plans')).toBeInTheDocument();
      expect(screen.getByText('My Policies & Payments')).toBeInTheDocument();
      expect(screen.getByText('My Claims')).toBeInTheDocument();
      expect(screen.getByText('Contact Us')).toBeInTheDocument();
      expect(screen.getByText('My Queries')).toBeInTheDocument();
      expect(screen.getByText('Profile')).toBeInTheDocument();
    });

    it('does NOT show admin-specific links', () => {
      renderWithProviders(<Sidebar />, { route: '/userdashboard' });
      expect(screen.queryByText('Users')).not.toBeInTheDocument();
      expect(screen.queryByText('Customers')).not.toBeInTheDocument();
    });

    it('shows "Customer Portal" in sidebar brand', () => {
      renderWithProviders(<Sidebar />, { route: '/userdashboard' });
      // "Customer Portal" appears in both h2 and subtitle span
      expect(screen.getAllByText('Customer Portal').length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Agent role', () => {
    beforeEach(() => {
      setupAuthenticatedUser(mockAgentUser);
    });

    it('renders agent navigation links', () => {
      renderWithProviders(<Sidebar />, { route: '/agentdashboard' });

      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Policies')).toBeInTheDocument();
      expect(screen.getByText('Claims')).toBeInTheDocument();
      expect(screen.getByText('Customers')).toBeInTheDocument();
      expect(screen.getByText('Customer Queries')).toBeInTheDocument();
    });

    it('does NOT show admin-specific Users link', () => {
      renderWithProviders(<Sidebar />, { route: '/agentdashboard' });
      expect(screen.queryByText('Users')).not.toBeInTheDocument();
    });
  });

  describe('Common features', () => {
    it('renders logout button', () => {
      setupAuthenticatedUser(mockAdminUser);
      renderWithProviders(<Sidebar />, { route: '/admindashboard' });

      expect(screen.getByText('Logout')).toBeInTheDocument();
    });

    it('renders theme toggle button', () => {
      setupAuthenticatedUser(mockAdminUser);
      renderWithProviders(<Sidebar />, { route: '/admindashboard' });

      const themeBtn = document.querySelector('.theme-btn');
      expect(themeBtn).toBeTruthy();
    });

    it('renders Insurance Management System footer text', () => {
      setupAuthenticatedUser(mockAdminUser);
      renderWithProviders(<Sidebar />, { route: '/admindashboard' });

      expect(screen.getByText('Insurance Management System')).toBeInTheDocument();
    });
  });
});
