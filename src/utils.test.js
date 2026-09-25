import { describe, it, expect, vi, afterEach } from 'vitest';
import { calculateUtilitySum, formatCurrency, exportToCSV } from './utils';

describe('calculateUtilitySum', () => {
  it('multiplies the positive difference by the rate', () => {
    expect(calculateUtilitySum(150, 100, 4.32)).toBe(216);
  });

  it('clamps negative differences to zero', () => {
    expect(calculateUtilitySum(50, 100, 4.32)).toBe(0);
  });

  it('rounds the result to two decimal places', () => {
    expect(calculateUtilitySum(10.333, 0, 3)).toBe(31);
    expect(calculateUtilitySum(3, 0, 1.111)).toBe(3.33);
  });

  it('returns 0 for non-numeric inputs instead of NaN', () => {
    expect(calculateUtilitySum('abc', 100, 4.32)).toBe(0);
    expect(calculateUtilitySum(150, undefined, 4.32)).toBe(0);
    expect(calculateUtilitySum(150, 100, null)).toBe(0);
    expect(calculateUtilitySum(NaN, 100, 4.32)).toBe(0);
  });

  it('accepts numeric strings', () => {
    expect(calculateUtilitySum('150', '100', '4.32')).toBe(216);
  });
});

describe('formatCurrency', () => {
  it('formats a number as UAH currency', () => {
    const result = formatCurrency(1234.5);
    expect(result).toContain('1');
    expect(result).toMatch(/₴|UAH/);
  });
});

describe('exportToCSV', () => {
  const originalCreateObjectURL = globalThis.URL.createObjectURL;
  const originalRevokeObjectURL = globalThis.URL.revokeObjectURL;

  afterEach(() => {
    vi.restoreAllMocks();
    globalThis.URL.createObjectURL = originalCreateObjectURL;
    globalThis.URL.revokeObjectURL = originalRevokeObjectURL;
  });

  const captureCSV = (data) => {
    let capturedBlob;
    globalThis.URL.createObjectURL = vi.fn((blob) => {
      capturedBlob = blob;
      return 'blob:mock-url';
    });
    globalThis.URL.revokeObjectURL = vi.fn();

    exportToCSV(data);
    return capturedBlob;
  };

  it('does nothing when data is empty', () => {
    const spy = vi.fn();
    globalThis.URL.createObjectURL = spy;
    exportToCSV([]);
    exportToCSV(null);
    expect(spy).not.toHaveBeenCalled();
  });

  it('escapes values containing commas', async () => {
    const blob = captureCSV([{ name: 'Rent, Utilities', amount: 100 }]);
    const text = await blob.text();
    expect(text).toBe('name,amount\n"Rent, Utilities",100');
  });

  it('escapes and doubles embedded quotes', async () => {
    const blob = captureCSV([{ note: 'He said "hi"' }]);
    const text = await blob.text();
    expect(text).toBe('note\n"He said ""hi"""');
  });

  it('escapes values containing newlines', async () => {
    const blob = captureCSV([{ note: 'line1\nline2' }]);
    const text = await blob.text();
    expect(text).toBe('note\n"line1\nline2"');
  });

  it('leaves plain values unquoted', async () => {
    const blob = captureCSV([{ name: 'Gas', amount: 42 }]);
    const text = await blob.text();
    expect(text).toBe('name,amount\nGas,42');
  });
});
