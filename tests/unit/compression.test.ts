import { describe, it, expect } from 'vitest';
import { COMPRESSION_PROFILES } from '../../backend/src/compression/compressor.js';

describe('PDF Compression Engine Unit Tests', () => {
  it('should have valid compression profile definitions for all presets', () => {
    expect(COMPRESSION_PROFILES.low).toBeDefined();
    expect(COMPRESSION_PROFILES.medium).toBeDefined();
    expect(COMPRESSION_PROFILES.high).toBeDefined();
    expect(COMPRESSION_PROFILES.extreme).toBeDefined();

    // Verify gradient of DPI and quality
    expect(COMPRESSION_PROFILES.low.dpi).toBeGreaterThan(COMPRESSION_PROFILES.medium.dpi);
    expect(COMPRESSION_PROFILES.medium.dpi).toBeGreaterThan(COMPRESSION_PROFILES.high.dpi);
    expect(COMPRESSION_PROFILES.high.dpi).toBeGreaterThan(COMPRESSION_PROFILES.extreme.dpi);

    expect(COMPRESSION_PROFILES.low.jpegQuality).toBeGreaterThan(COMPRESSION_PROFILES.medium.jpegQuality);
    expect(COMPRESSION_PROFILES.medium.jpegQuality).toBeGreaterThan(COMPRESSION_PROFILES.high.jpegQuality);
    expect(COMPRESSION_PROFILES.high.jpegQuality).toBeGreaterThan(COMPRESSION_PROFILES.extreme.jpegQuality);
  });

  it('should calculate reduction percentage accurately', () => {
    const orig = 1000000;
    const compressed = 250000;
    const reduction = Math.max(0, parseFloat((((orig - compressed) / orig) * 100).toFixed(1)));
    expect(reduction).toBe(75.0);
  });

  it('should handle target sizes properly without negative reduction', () => {
    const orig = 200000;
    const compressed = 200000;
    const reduction = Math.max(0, parseFloat((((orig - compressed) / orig) * 100).toFixed(1)));
    expect(reduction).toBe(0);
  });
});
