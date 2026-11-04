import { describe, expect, it } from 'vitest';
import { buildAttachmentDisposition } from '../../backend/src/utils/download.js';

describe('buildAttachmentDisposition', () => {
  it('removes path traversal and control characters from uploaded names', () => {
    const value = buildAttachmentDisposition('../../private\\report\r\n.pdf');
    expect(value).toContain('filename="report.pdf"');
    expect(value).not.toContain('private');
    expect(value).not.toContain('\r');
    expect(value).not.toContain('\n');
  });

  it('provides an encoded UTF-8 filename and a safe ASCII fallback', () => {
    const value = buildAttachmentDisposition('résumé.pdf');
    expect(value).toContain('filename="r_sum_.pdf"');
    expect(value).toContain("filename*=UTF-8''r%C3%A9sum%C3%A9.pdf");
  });

  it('uses a fallback when the supplied name is empty or unsafe', () => {
    expect(buildAttachmentDisposition('...')).toContain('filename="download"');
  });
});
