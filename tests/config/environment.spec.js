import { describe, expect, it, vi } from 'vitest';

describe('config/environment', () => {
  it('provides defaults when env vars missing', async () => {
    vi.resetModules();
    vi.unstubAllEnvs();
    const { env } = await import('~config/environment');
    expect(env.SITE_URL).toBe('https://localhost:4321');
    expect(env.SITE_TITLE).toBe('Occasional Word of the Day');
  });

  it('uses provided environment variables', async () => {
    vi.resetModules();
    vi.stubEnv('SITE_URL', 'https://example.com');
    vi.stubEnv('SITE_TITLE', 'My Site');
    vi.stubEnv('SITE_DESCRIPTION', 'Desc');
    vi.stubEnv('SITE_ID', 'my-site');
    const { env } = await import('~config/environment');
    expect(env.SITE_URL).toBe('https://example.com');
    expect(env.SITE_TITLE).toBe('My Site');
    expect(env.SITE_DESCRIPTION).toBe('Desc');
    expect(env.SITE_ID).toBe('my-site');
  });
});
