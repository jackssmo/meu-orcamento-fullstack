import { describe, expect, it } from 'vitest';
import { splitAmountInCents } from './money';

describe('splitAmountInCents', () => {
  it('distributes remaining cents without changing the total', () => {
    const values = splitAmountInCents(100, 3);
    expect(values).toEqual([3334, 3333, 3333]);
    expect(values.reduce((sum, value) => sum + value, 0)).toBe(10000);
  });

  it('supports exact divisions', () => {
    expect(splitAmountInCents(120, 3)).toEqual([4000, 4000, 4000]);
  });
});
