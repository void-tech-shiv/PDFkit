import { describe, expect, it } from 'vitest';
import { getSupportedImageType, isDocxPackageBuffer, isPdfBuffer } from '../../backend/src/utils/file-validation.js';

describe('upload file signature validation', () => {
  it('recognizes PDF headers and rejects plain text', () => {
    expect(isPdfBuffer(Buffer.from('%PDF-1.7\\n'))).toBe(true);
    expect(isPdfBuffer(Buffer.from('not a PDF'))).toBe(false);
    expect(isPdfBuffer(Buffer.alloc(0))).toBe(false);
  });

  it('recognizes supported image signatures', () => {
    expect(getSupportedImageType(Buffer.from([0xff, 0xd8, 0xff, 0x00]))).toBe('image/jpeg');
    expect(getSupportedImageType(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))).toBe('image/png');
    expect(getSupportedImageType(Buffer.from('RIFFxxxxWEBP'))).toBe('image/webp');
    expect(getSupportedImageType(Buffer.from('not-image'))).toBeNull();
  });

  it('checks for a ZIP package signature before DOCX parsing', () => {
    expect(isDocxPackageBuffer(Buffer.from([0x50, 0x4b, 0x03, 0x04, 0x00]))).toBe(true);
    expect(isDocxPackageBuffer(Buffer.from('not-docx'))).toBe(false);
  });
});
