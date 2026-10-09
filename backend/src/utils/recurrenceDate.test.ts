import { describe, expect, it } from 'vitest';
import { getMonthlyOccurrenceDate } from './recurrenceDate';

describe('getMonthlyOccurrenceDate', () => {
  it('keeps salary on the last business day of shorter months', () => {
    const januaryLastBusinessDay = new Date('2026-01-30T00:00:00.000Z');
    const february = getMonthlyOccurrenceDate(januaryLastBusinessDay, 1);

    expect(february.toISOString().substring(0, 10)).toBe('2026-02-27');
  });

  it('clamps regular dates to the last calendar day when needed', () => {
    const date = new Date('2026-01-31T00:00:00.000Z');
    const february = getMonthlyOccurrenceDate(date, 1);

    expect(february.toISOString().substring(0, 10)).toBe('2026-02-28');
  });
});
