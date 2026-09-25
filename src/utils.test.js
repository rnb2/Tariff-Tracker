import { describe, it, expect, vi, afterEach } from 'vitest';
import { calculateUtilitySum, formatCurrency, exportToCSV, buildDraftFromEntry, buildEntryDetailRows } from './utils';

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
    // Blob#text() decodes as UTF-8 per spec, which strips a leading BOM,
    // so the BOM itself is verified separately via the raw bytes below.
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

  it('prepends a UTF-8 BOM so Excel renders Cyrillic correctly', async () => {
    const blob = captureCSV([{ 'Услуга': 'Отопление', 'Сумма': 100 }]);
    const bytes = new Uint8Array(await blob.arrayBuffer());
    expect([bytes[0], bytes[1], bytes[2]]).toEqual([0xEF, 0xBB, 0xBF]);

    const text = await blob.text();
    expect(text).toContain('Отопление');
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

describe('buildEntryDetailRows', () => {
  const labels = { gas: 'Газ', PARKING: 'Паркоместо', MORTGAGE: 'Ипотека' };

  it('includes one row per utility with its readings and sum', () => {
    const entry = { utilities: { gas: { previous: 10, current: 25, sum: 45 } } };
    const rows = buildEntryDetailRows(entry, labels);
    expect(rows[0]).toEqual({ 'Услуга': 'Газ', 'Пред. показ.': 10, 'Тек. показ.': 25, 'Сумма': 45 });
  });

  it('adds parking, mortgage, and credit card rows only when their amount is non-zero', () => {
    const entry = {
      utilities: {},
      parking: 500,
      mortgages: [{ name: 'ДержМолодь', amount: 3000 }, { name: 'Empty', amount: 0 }],
      creditCards: [{ name: 'Моно', amount: 1200 }, { name: 'ПУМБ', amount: 0 }],
      total: 4700,
    };
    const rows = buildEntryDetailRows(entry, labels);
    const names = rows.map((r) => r['Услуга']);
    expect(names).toEqual(['Паркоместо', 'ДержМолодь', 'Моно', 'ИТОГО']);
  });

  it('always appends a final ИТОГО row with the entry total', () => {
    const entry = { utilities: {}, total: 1234.56 };
    const rows = buildEntryDetailRows(entry, labels);
    expect(rows[rows.length - 1]).toEqual({ 'Услуга': 'ИТОГО', 'Пред. показ.': '', 'Тек. показ.': '', 'Сумма': 1234.56 });
  });
});
