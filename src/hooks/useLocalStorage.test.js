import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLocalStorage } from './useLocalStorage';

describe('useLocalStorage', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('returns the initial value when nothing is stored', () => {
    const { result } = renderHook(() => useLocalStorage('missing-key', 'default'));
    expect(result.current[0]).toBe('default');
  });

  it('reads an existing value from localStorage', () => {
    window.localStorage.setItem('existing-key', JSON.stringify({ a: 1 }));
    const { result } = renderHook(() => useLocalStorage('existing-key', null));
    expect(result.current[0]).toEqual({ a: 1 });
  });

  it('persists updates to localStorage', () => {
    const { result } = renderHook(() => useLocalStorage('counter', 0));

    act(() => {
      result.current[1](5);
    });

    expect(result.current[0]).toBe(5);
    expect(JSON.parse(window.localStorage.getItem('counter'))).toBe(5);
  });

  it('falls back to the initial value when stored JSON is corrupted', () => {
    window.localStorage.setItem('broken-key', '{not valid json');
    const { result } = renderHook(() => useLocalStorage('broken-key', 'fallback'));
    expect(result.current[0]).toBe('fallback');
  });
});
