import { afterEach, describe, expect, it, vi } from 'vitest';
import { buildServer, getAllowedOrigins } from '../../backend/src/server.js';

describe('server security configuration', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('parses and normalizes a comma-separated exact origin allowlist', () => {
    vi.stubEnv('CORS_ORIGIN', 'https://pdfkit.example.com/, https://admin.example.com,https://pdfkit.example.com');
    expect(getAllowedOrigins()).toEqual([
      'https://pdfkit.example.com',
      'https://admin.example.com',
    ]);
  });

  it('rejects wildcard origins and URL paths', () => {
    vi.stubEnv('CORS_ORIGIN', '*');
    expect(() => getAllowedOrigins()).toThrow(/exact http\(s\) origins/);

    vi.stubEnv('CORS_ORIGIN', 'https://example.com/app');
    expect(() => getAllowedOrigins()).toThrow(/exact http\(s\) origins/);
  });

  it('returns CORS headers only for configured origins', async () => {
    vi.stubEnv('CORS_ORIGIN', 'https://frontend.example.com');
    const server = await buildServer();

    try {
      const allowed = await server.inject({
        method: 'GET',
        url: '/api/health',
        headers: { origin: 'https://frontend.example.com' },
      });
      expect(allowed.statusCode).toBe(200);
      expect(allowed.headers['access-control-allow-origin']).toBe('https://frontend.example.com');

      const denied = await server.inject({
        method: 'GET',
        url: '/api/health',
        headers: { origin: 'https://attacker.example' },
      });
      expect(denied.statusCode).toBe(200);
      expect(denied.headers['access-control-allow-origin']).toBeUndefined();
    } finally {
      await server.close();
    }
  });

  it('rejects invalid upload size configuration during startup', async () => {
    vi.stubEnv('MAX_FILE_SIZE_MB', '0');
    await expect(buildServer()).rejects.toThrow(/MAX_FILE_SIZE_MB/);
  });
  it('does not return unhandled internal exception details to clients', async () => {
    vi.stubEnv('CORS_ORIGIN', 'https://frontend.example.com');
    const server = await buildServer();

    try {
      server.get('/__test/internal-error', async () => {
        throw new Error('private filesystem path /srv/private/document.pdf');
      });

      const response = await server.inject({
        method: 'GET',
        url: '/__test/internal-error',
      });

      expect(response.statusCode).toBe(500);
      expect(response.body).not.toContain('/srv/private/document.pdf');
      expect(response.json().error).toBe('An unexpected internal error occurred.');
    } finally {
      await server.close();
    }
  });

});
