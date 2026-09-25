import { describe, it, expect, vi, afterEach } from 'vitest';
import { calculateUtilitySum, formatCurrency, exportToCSV, buildDraftFromEntry } from './utils';

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

describe('buildDraftFromEntry', () => {
  const utilityTypes = ['gas', 'water'];

  it('carries the previous entry current readings forward as the new previous readings', () => {
    const entry = {
      utilities: {
        gas: { previous: 10, current: 25, sum: 45 },
        water: { previous: 3, current: 8, sum: 15 },
      },
      parking: 500,
      creditCards: [{ name: 'Моно', amount: 1200 }],
      mortgages: [{ name: 'ДержМолодь', amount: 3000 }],
    };

    const draft = buildDraftFromEntry(entry, utilityTypes);

    expect(draft.utilities.gas).toEqual({ previous: 25, current: '', sum: 0 });
    expect(draft.utilities.water).toEqual({ previous: 8, current: '', sum: 0 });
  });

  it('falls back to the previous entry own previous reading when its current is blank', () => {
    const entry = { utilities: { gas: { previous: 10, current: '', sum: 0 } } };
    const draft = buildDraftFromEntry(entry, ['gas']);
    expect(draft.utilities.gas.previous).toBe(10);
  });

  it('carries recurring payments (parking, credit cards, mortgages) over unchanged', () => {
    const entry = {
      utilities: {},
      parking: 500,
      creditCards: [{ name: 'Моно', amount: 1200 }, { name: 'ПУМБ', amount: 0 }],
      mortgages: [{ name: 'ДержМолодь', amount: 3000 }],
    };

    const draft = buildDraftFromEntry(entry, []);

    expect(draft.parking).toBe(500);
    expect(draft.creditCards).toEqual([
      { name: 'Моно', amount: 1200 },
      { name: 'ПУМБ', amount: 0 },
    ]);
    expect(draft.mortgages).toEqual([{ name: 'ДержМолодь', amount: 3000 }]);
  });

  it('sets a fresh date and defaults missing fields when entry is empty', () => {
    const draft = buildDraftFromEntry(undefined, ['gas']);
    expect(draft.utilities.gas).toEqual({ previous: '', current: '', sum: 0 });
    expect(draft.parking).toBe('');
    expect(draft.creditCards).toEqual([]);
    expect(draft.mortgages).toEqual([]);
    expect(draft.date).toBe(new Date().toISOString().split('T')[0]);
  });
});
