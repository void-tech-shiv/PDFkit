/**
 * Build a safe Content-Disposition value for a downloaded file.
 * Treat uploaded filenames as untrusted input: remove path components,
 * control characters and header delimiters before reflecting a name.
 */
export function buildAttachmentDisposition(input: string, fallback = 'download'): string {
  const leaf = String(input || '')
    .split(/[\\/]/)
    .pop() ?? '';
  const cleaned = leaf
    .normalize('NFKC')
    .replace(/[\\u0000-\\u001f\\u007f-\\u009f]/g, '')
    .replace(/[\\"]/g, '')
    .replace(/[^\\p{L}\\p{N}._ -]/gu, '_')
    .replace(/^\\.+/, '')
    .trim()
    .slice(0, 120);

  const filename = cleaned || fallback;
  const asciiFallback = filename.replace(/[^\\x20-\\x7E]/g, '_').replace(/[\\\\"]/g, '_');
  const encoded = encodeURIComponent(filename).replace(/['()*]/g, (char) =>
    `%${char.charCodeAt(0).toString(16).toUpperCase()}`
  );

  return `attachment; filename="${asciiFallback}"; filename*=UTF-8''${encoded}`;
}
