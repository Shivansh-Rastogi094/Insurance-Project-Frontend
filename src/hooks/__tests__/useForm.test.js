import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useForm } from '../useForm';

describe('useForm', () => {
  const initialValues = { email: '', password: '', name: '' };

  it('initializes with provided values', () => {
    const { result } = renderHook(() => useForm(initialValues));
    expect(result.current.values).toEqual(initialValues);
    expect(result.current.errors).toEqual({});
  });

  it('handleChange updates values on input event', () => {
    const { result } = renderHook(() => useForm(initialValues));

    act(() => {
      result.current.handleChange({
        target: { name: 'email', value: 'test@example.com', type: 'text' },
      });
    });

    expect(result.current.values.email).toBe('test@example.com');
  });

  it('handleChange handles checkbox inputs', () => {
    const { result } = renderHook(() =>
      useForm({ ...initialValues, agree: false })
    );

    act(() => {
      result.current.handleChange({
        target: { name: 'agree', value: '', type: 'checkbox', checked: true },
      });
    });

    expect(result.current.values.agree).toBe(true);
  });

  it('clears field error when that field is changed', () => {
    const { result } = renderHook(() => useForm(initialValues));

    // Manually set an error
    act(() => {
      result.current.setErrors({ email: 'Email is required' });
    });
    expect(result.current.errors.email).toBe('Email is required');

    // Type into the email field → error should clear
    act(() => {
      result.current.handleChange({
        target: { name: 'email', value: 'a', type: 'text' },
      });
    });

    expect(result.current.errors.email).toBe('');
  });

  it('does not clear unrelated field errors on change', () => {
    const { result } = renderHook(() => useForm(initialValues));

    act(() => {
      result.current.setErrors({ email: 'Required', password: 'Too short' });
    });

    // Change email — password error should remain
    act(() => {
      result.current.handleChange({
        target: { name: 'email', value: 'a', type: 'text' },
      });
    });

    expect(result.current.errors.password).toBe('Too short');
  });

  it('validateForm returns true when no validator is provided', () => {
    const { result } = renderHook(() => useForm(initialValues));

    let isValid;
    act(() => {
      isValid = result.current.validateForm();
    });

    expect(isValid).toBe(true);
  });

  it('validateForm sets errors and returns false when validation fails', () => {
    const validate = (values) => {
      const errs = {};
      if (!values.email) errs.email = 'Email is required';
      if (!values.password) errs.password = 'Password is required';
      return errs;
    };

    const { result } = renderHook(() => useForm(initialValues, validate));

    let isValid;
    act(() => {
      isValid = result.current.validateForm();
    });

    expect(isValid).toBe(false);
    expect(result.current.errors.email).toBe('Email is required');
    expect(result.current.errors.password).toBe('Password is required');
  });

  it('validateForm returns true when all validations pass', () => {
    const validate = (values) => {
      const errs = {};
      if (!values.email) errs.email = 'Required';
      return errs;
    };

    const { result } = renderHook(() =>
      useForm({ email: 'test@test.com', password: '12345678', name: 'Test' }, validate)
    );

    let isValid;
    act(() => {
      isValid = result.current.validateForm();
    });

    expect(isValid).toBe(true);
    expect(result.current.errors).toEqual({});
  });

  it('resetForm restores initial values and clears errors', () => {
    const { result } = renderHook(() => useForm(initialValues));

    // Modify values and add errors
    act(() => {
      result.current.handleChange({
        target: { name: 'email', value: 'modified@test.com', type: 'text' },
      });
      result.current.setErrors({ email: 'Some error' });
    });

    expect(result.current.values.email).toBe('modified@test.com');

    act(() => {
      result.current.resetForm();
    });

    expect(result.current.values).toEqual(initialValues);
    expect(result.current.errors).toEqual({});
  });

  it('setValues allows direct state update', () => {
    const { result } = renderHook(() => useForm(initialValues));

    act(() => {
      result.current.setValues({ email: 'direct@set.com', password: 'abc', name: 'Direct' });
    });

    expect(result.current.values.email).toBe('direct@set.com');
    expect(result.current.values.name).toBe('Direct');
  });
});
