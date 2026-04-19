import { describe, test, expect } from 'bun:test';
import {
  getDatabaseSkipReasonFromEnv,
  getE2EDatabaseUrlFromEnv,
  isSafeE2EDatabaseUrl,
} from './e2e/helpers.ts';

describe('E2E DB safety guards', () => {
  test('ignores ambient DATABASE_URL when dedicated E2E env var is missing', () => {
    const env = {
      DATABASE_URL: 'postgresql://prod:secret@127.0.0.1:5432/gbrain',
    } as NodeJS.ProcessEnv;

    expect(getE2EDatabaseUrlFromEnv(env)).toBeNull();
    expect(getDatabaseSkipReasonFromEnv(env)).toContain('ambient DATABASE_URL is ignored');
  });

  test('accepts dedicated test database names', () => {
    expect(isSafeE2EDatabaseUrl('postgresql://postgres:pw@localhost:5434/gbrain_test')).toBe(true);
    expect(isSafeE2EDatabaseUrl('postgresql://postgres:pw@localhost:5434/my_ci_db')).toBe(true);
    expect(isSafeE2EDatabaseUrl('postgresql://postgres:pw@localhost:5434/tmp_brain')).toBe(true);
  });

  test('rejects production-looking database names', () => {
    expect(isSafeE2EDatabaseUrl('postgresql://gbrain:pw@127.0.0.1:5432/gbrain')).toBe(false);
    expect(isSafeE2EDatabaseUrl('postgresql://postgres:pw@localhost:5432/brain')).toBe(false);
  });
});
