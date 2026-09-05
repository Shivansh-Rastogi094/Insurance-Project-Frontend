import { describe, it, expect, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useFetch } from '../useFetch';

describe('useFetch', () => {
  it('has correct initial state', () => {
    const apiFunc = vi.fn();
    const { result } = renderHook(() => useFetch(apiFunc));

    expect(result.current.data).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(typeof result.current.execute).toBe('function');
  });

  it('execute() sets loading=true then resolves with data', async () => {
    const mockData = { id: 1, name: 'Test' };
    const apiFunc = vi.fn().mockResolvedValue({ data: mockData });

    const { result } = renderHook(() => useFetch(apiFunc));

    let returnedData;
    await act(async () => {
      returnedData = await result.current.execute();
    });

    expect(apiFunc).toHaveBeenCalledOnce();
    expect(result.current.data).toEqual(mockData);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(returnedData).toEqual(mockData);
  });

  it('unwraps response.data correctly', async () => {
    const items = [{ id: 1 }, { id: 2 }];
    const apiFunc = vi.fn().mockResolvedValue({ data: items });

    const { result } = renderHook(() => useFetch(apiFunc));

    await act(async () => {
      await result.current.execute();
    });

    expect(result.current.data).toEqual(items);
  });

  it('handles response without .data property', async () => {
    const rawResponse = [{ id: 1 }, { id: 2 }];
    const apiFunc = vi.fn().mockResolvedValue(rawResponse);

    const { result } = renderHook(() => useFetch(apiFunc));

    await act(async () => {
      await result.current.execute();
    });

    // When response.data is undefined, should use the whole response
    expect(result.current.data).toEqual(rawResponse);
  });

  it('passes arguments to the API function', async () => {
    const apiFunc = vi.fn().mockResolvedValue({ data: 'ok' });
    const { result } = renderHook(() => useFetch(apiFunc));

    await act(async () => {
      await result.current.execute('arg1', 'arg2', 42);
    });

    expect(apiFunc).toHaveBeenCalledWith('arg1', 'arg2', 42);
  });

  it('sets error message on API failure', async () => {
    const apiFunc = vi.fn().mockRejectedValue({
      response: { data: { message: 'Server error' } },
    });

    const { result } = renderHook(() => useFetch(apiFunc));

    await act(async () => {
      try {
        await result.current.execute();
      } catch {
        // expected
      }
    });

    expect(result.current.error).toBe('Server error');
    expect(result.current.loading).toBe(false);
  });

  it('uses err.message when response.data.message is not available', async () => {
    const apiFunc = vi.fn().mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useFetch(apiFunc));

    await act(async () => {
      try {
        await result.current.execute();
      } catch {
        // expected
      }
    });

    expect(result.current.error).toBe('Network error');
  });

  it('falls back to generic error message', async () => {
    const apiFunc = vi.fn().mockRejectedValue({});

    const { result } = renderHook(() => useFetch(apiFunc));

    await act(async () => {
      try {
        await result.current.execute();
      } catch {
        // expected
      }
    });

    expect(result.current.error).toBe('An error occurred');
  });

  it('ignores AbortError silently', async () => {
    const abortError = new Error('Aborted');
    abortError.name = 'AbortError';
    const apiFunc = vi.fn().mockRejectedValue(abortError);

    const { result } = renderHook(() => useFetch(apiFunc));

    await act(async () => {
      // AbortError should not throw and not set error state
      await result.current.execute();
    });

    expect(result.current.error).toBeNull();
  });

  it('ignores ERR_CANCELED errors silently', async () => {
    const cancelError = { code: 'ERR_CANCELED', message: 'canceled' };
    const apiFunc = vi.fn().mockRejectedValue(cancelError);

    const { result } = renderHook(() => useFetch(apiFunc));

    await act(async () => {
      await result.current.execute();
    });

    expect(result.current.error).toBeNull();
  });

  it('setData allows manual data override', () => {
    const apiFunc = vi.fn();
    const { result } = renderHook(() => useFetch(apiFunc));

    act(() => {
      result.current.setData([{ id: 99, name: 'Manual' }]);
    });

    expect(result.current.data).toEqual([{ id: 99, name: 'Manual' }]);
  });

  it('re-execute clears previous error', async () => {
    let callCount = 0;
    const apiFunc = vi.fn().mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        return Promise.reject({ response: { data: { message: 'First call error' } } });
      }
      return Promise.resolve({ data: 'success' });
    });

    const { result } = renderHook(() => useFetch(apiFunc));

    // First call fails
    await act(async () => {
      try { await result.current.execute(); } catch {}
    });
    expect(result.current.error).toBe('First call error');

    // Second call succeeds — error should be cleared
    await act(async () => {
      await result.current.execute();
    });
    expect(result.current.error).toBeNull();
    expect(result.current.data).toBe('success');
  });
});
