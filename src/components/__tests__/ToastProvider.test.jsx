import { describe, it, expect, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { ToastProvider, useToast } from '../ToastProvider';

// Helper component that exposes toast methods
const ToastTrigger = ({ type = 'success', message = 'Test message' }) => {
  const toast = useToast();
  return (
    <div>
      <button onClick={() => toast.success(message)}>Success</button>
      <button onClick={() => toast.error(message)}>Error</button>
      <button onClick={() => toast.info(message)}>Info</button>
      <button onClick={() => toast.warning(message)}>Warning</button>
    </div>
  );
};

describe('ToastProvider', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders children', () => {
    render(
      <ToastProvider>
        <p>Child Content</p>
      </ToastProvider>
    );

    expect(screen.getByText('Child Content')).toBeInTheDocument();
  });

  it('toast.success() displays a success message', () => {
    render(
      <ToastProvider>
        <ToastTrigger message="Operation successful!" />
      </ToastProvider>
    );

    act(() => {
      screen.getByText('Success').click();
    });

    expect(screen.getByText('Operation successful!')).toBeInTheDocument();
    // Check for success class
    const toastEl = document.querySelector('.toast-success');
    expect(toastEl).toBeTruthy();
  });

  it('toast.error() displays an error message', () => {
    render(
      <ToastProvider>
        <ToastTrigger message="Something went wrong!" />
      </ToastProvider>
    );

    act(() => {
      screen.getByText('Error').click();
    });

    expect(screen.getByText('Something went wrong!')).toBeInTheDocument();
    const toastEl = document.querySelector('.toast-error');
    expect(toastEl).toBeTruthy();
  });

  it('toast.info() displays an info message', () => {
    render(
      <ToastProvider>
        <ToastTrigger message="Info notice" />
      </ToastProvider>
    );

    act(() => {
      screen.getByText('Info').click();
    });

    expect(screen.getByText('Info notice')).toBeInTheDocument();
    const toastEl = document.querySelector('.toast-info');
    expect(toastEl).toBeTruthy();
  });

  it('toast.warning() displays a warning message', () => {
    render(
      <ToastProvider>
        <ToastTrigger message="Warning alert" />
      </ToastProvider>
    );

    act(() => {
      screen.getByText('Warning').click();
    });

    expect(screen.getByText('Warning alert')).toBeInTheDocument();
    const toastEl = document.querySelector('.toast-warning');
    expect(toastEl).toBeTruthy();
  });

  it('toast auto-dismisses after 4 seconds', () => {
    render(
      <ToastProvider>
        <ToastTrigger message="Temporary toast" />
      </ToastProvider>
    );

    act(() => {
      screen.getByText('Success').click();
    });

    expect(screen.getByText('Temporary toast')).toBeInTheDocument();

    // Fast-forward 4 seconds
    act(() => {
      vi.advanceTimersByTime(4000);
    });

    expect(screen.queryByText('Temporary toast')).not.toBeInTheDocument();
  });

  it('toast can be manually dismissed via close button', () => {
    render(
      <ToastProvider>
        <ToastTrigger message="Closable toast" />
      </ToastProvider>
    );

    act(() => {
      screen.getByText('Success').click();
    });

    expect(screen.getByText('Closable toast')).toBeInTheDocument();

    // Click the close button
    const closeBtn = document.querySelector('.toast-close');
    act(() => {
      closeBtn.click();
    });

    expect(screen.queryByText('Closable toast')).not.toBeInTheDocument();
  });

  it('displays multiple toasts simultaneously', () => {
    render(
      <ToastProvider>
        <ToastTrigger />
      </ToastProvider>
    );

    act(() => {
      screen.getByText('Success').click();
      screen.getByText('Error').click();
    });

    const toasts = document.querySelectorAll('.toast-message');
    expect(toasts.length).toBe(2);
  });

  it('throws error when useToast is used outside ToastProvider', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const BadComponent = () => {
      useToast();
      return <div />;
    };

    expect(() => render(<BadComponent />)).toThrow(
      'useToast must be used within a ToastProvider'
    );

    spy.mockRestore();
  });
});
