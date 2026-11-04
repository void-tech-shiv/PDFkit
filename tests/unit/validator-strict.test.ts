import { describe, expect, it } from 'vitest';
import {
  isValidRotationAngle,
  parsePageNumbersListStrict,
  parsePageRangeStringStrict,
} from '../../backend/src/utils/validator.js';

describe('strict PDF request validation', () => {
  it('parses valid page ranges and de-duplicates overlapping ranges', () => {
    expect(parsePageRangeStringStrict('1-3, 3, 5', 5)).toEqual([0, 1, 2, 4]);
    expect(parsePageRangeStringStrict('5-3', 5)).toEqual([2, 3, 4]);
  });

  it('rejects malformed, partial, empty and out-of-range page ranges', () => {
    expect(parsePageRangeStringStrict('1,,3', 5)).toBeNull();
    expect(parsePageRangeStringStrict('1-x', 5)).toBeNull();
    expect(parsePageRangeStringStrict('0-2', 5)).toBeNull();
    expect(parsePageRangeStringStrict('1-6', 5)).toBeNull();
    expect(parsePageRangeStringStrict('', 5)).toBeNull();
  });

  it('rejects invalid page lists rather than silently dropping entries', () => {
    expect(parsePageNumbersListStrict('1, 3,5', 5)).toEqual([0, 2, 4]);
    expect(parsePageNumbersListStrict('1,99', 5)).toBeNull();
    expect(parsePageNumbersListStrict('2,nope', 5)).toBeNull();
    expect(parsePageNumbersListStrict('', 5)).toBeNull();
  });

  it('accepts only right-angle rotations', () => {
    for (const angle of [0, 90, 180, 270, -90, -180, -270]) {
      expect(isValidRotationAngle(angle)).toBe(true);
    }
    for (const angle of [45, 360, '90', NaN, Infinity]) {
      expect(isValidRotationAngle(angle)).toBe(false);
    }
  });
});
