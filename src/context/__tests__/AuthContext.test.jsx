import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '../AuthContext';
import { MOCK_VALID_TOKEN, MOCK_EXPIRED_TOKEN, mockCustomerUser } from '../../test/mocks/data';

const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('provides default unauthenticated state', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.userData).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(typeof result.current.login).toBe('function');
    expect(typeof result.current.logout).toBe('function');
  });

  it('login() sets userData and stores token in localStorage', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    act(() => {
      result.current.login(mockCustomerUser);
    });

    expect(result.current.userData).toEqual(mockCustomerUser);
    expect(result.current.isAuthenticated).toBe(true);
    expect(localStorage.getItem('token')).toBe(mockCustomerUser.token);
    expect(JSON.parse(localStorage.getItem('userData'))).toEqual(mockCustomerUser);
  });

  it('logout() clears state and localStorage', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    // Login first
    act(() => {
      result.current.login(mockCustomerUser);
    });
    expect(result.current.isAuthenticated).toBe(true);

    // Logout
    await act(async () => {
      await result.current.logout();
    });

    expect(result.current.userData).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('userData')).toBeNull();
  });

  it('restores session from localStorage on mount', () => {
    // Pre-populate localStorage
    localStorage.setItem('userData', JSON.stringify(mockCustomerUser));
    localStorage.setItem('token', MOCK_VALID_TOKEN);

    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.userData).toEqual(mockCustomerUser);
    expect(result.current.isAuthenticated).toBe(true);
  });

  it('clears expired tokens on mount', () => {
    // Pre-populate with expired token
    const expiredUser = { ...mockCustomerUser, token: MOCK_EXPIRED_TOKEN };
    localStorage.setItem('userData', JSON.stringify(expiredUser));
    localStorage.setItem('token', MOCK_EXPIRED_TOKEN);

    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.userData).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('userData')).toBeNull();
  });

  it('handles malformed token gracefully on mount', () => {
    localStorage.setItem('userData', JSON.stringify(mockCustomerUser));
    localStorage.setItem('token', 'not.a.valid.jwt');

    const { result } = renderHook(() => useAuth(), { wrapper });

    // Malformed token → treated as expired → cleared
    expect(result.current.userData).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('handles missing token with saved userData on mount', () => {
    localStorage.setItem('userData', JSON.stringify(mockCustomerUser));
    // No token stored

    const { result } = renderHook(() => useAuth(), { wrapper });

    // No token → treated as expired → cleared
    expect(result.current.userData).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('throws error when useAuth is used outside AuthProvider', () => {
    // Suppress console.error for this test
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      renderHook(() => useAuth());
    }).toThrow('useAuth must be used within an AuthProvider');

    spy.mockRestore();
  });
});
