import { describe, it, expect } from 'vitest';
import { calculateDiff, formatQuantityDiff } from '../src/util/diff.js';

describe('calculateDiff util', () => {
  it('should return empty diff when objects are identical', () => {
    const oldObj = { name: 'Burger', price: 25.5, active: true };
    const newObj = { name: 'Burger', price: 25.5, active: true };

    const diff = calculateDiff(oldObj, newObj);
    expect(diff).toEqual({});
  });

  it('should detect string and boolean changes', () => {
    const oldObj = { name: 'Burger', active: true, category: 'FOOD' };
    const newObj = { name: 'Super Burger', active: false, category: 'FOOD' };

    const diff = calculateDiff(oldObj, newObj);
    expect(diff).toEqual({
      name: { old: 'Burger', new: 'Super Burger' },
      active: { old: true, new: false }
    });
  });

  it('should detect numeric changes with precision', () => {
    const oldObj = { price: 20.00 };
    const newObj = { price: 25.50 };

    const diff = calculateDiff(oldObj, newObj);
    expect(diff).toEqual({
      price: { old: 20.00, new: 25.50 }
    });
  });

  it('should ignore float variations smaller than tolerance', () => {
    const oldObj = { price: 20.00001 };
    const newObj = { price: 20.00002 };

    const diff = calculateDiff(oldObj, newObj);
    expect(diff).toEqual({});
  });

  it('should only check specified fields when fields list is provided', () => {
    const oldObj = { name: 'Burger', price: 20, description: 'Tasty', extra: 'Ignore' };
    const newObj = { name: 'Burger', price: 30, description: 'Very tasty', extra: 'Changed' };

    const diff = calculateDiff(oldObj, newObj, ['name', 'price']);
    expect(diff).toEqual({
      price: { old: 20, new: 30 }
    });
    expect(diff.description).toBeUndefined();
    expect(diff.extra).toBeUndefined();
  });

  it('should handle empty or null objects gracefully', () => {
    expect(calculateDiff(null, null)).toEqual({});
    expect(calculateDiff({}, { name: 'New' })).toEqual({
      name: { old: undefined, new: 'New' }
    });
  });
});

describe('formatQuantityDiff util', () => {
  it('should format positive diff with + sign', () => {
    expect(formatQuantityDiff(1, 2)).toBe('+1');
    expect(formatQuantityDiff(2, 5)).toBe('+3');
  });

  it('should format negative diff with - sign', () => {
    expect(formatQuantityDiff(3, 2)).toBe('-1');
    expect(formatQuantityDiff(5, 1)).toBe('-4');
  });

  it('should format zero difference as 0', () => {
    expect(formatQuantityDiff(2, 2)).toBe('0');
  });
});
