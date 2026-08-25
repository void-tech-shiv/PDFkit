import { describe, it, expect } from 'vitest';
import { parsePageRangeString, parsePageNumbersList } from '../../backend/src/utils/validator.js';

describe('Validation and Page Parsing Unit Tests', () => {
  it('should parse simple comma-separated numbers correctly', () => {
    const parsed = parsePageNumbersList('1, 3, 5', 10);
    expect(parsed).toEqual([0, 2, 4]);
  });

  it('should parse mixed ranges and discrete numbers into 0-indexed sorted arrays', () => {
    const parsed = parsePageRangeString('1-3, 5, 8-10', 12);
    expect(parsed).toEqual([0, 1, 2, 4, 7, 8, 9]);
  });

  it('should clamp out-of-bounds page numbers to document limits', () => {
    const parsed = parsePageRangeString('1-20', 5);
    expect(parsed).toEqual([0, 1, 2, 3, 4]);
  });

  it('should ignore non-numeric invalid range tokens gracefully', () => {
    const parsed = parsePageRangeString('abc, 2, xyz-99, 4', 10);
    expect(parsed).toEqual([1, 3]);
  });
});
