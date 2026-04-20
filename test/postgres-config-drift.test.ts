import { afterEach, beforeEach, describe, expect, test } from 'bun:test';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

const REPO_ROOT = new URL('..', import.meta.url).pathname;
const BUN_BIN = process.execPath;
const CONFIG_MODULE = join(REPO_ROOT, 'src/core/config.ts');

describe('Postgres config drift guards', () => {
  let tempHome: string;
  const originalHome = process.env.HOME;
  const originalUserProfile = process.env.USERPROFILE;
  const originalDatabaseUrl = process.env.DATABASE_URL;
  const originalGbrainDatabaseUrl = process.env.GBRAIN_DATABASE_URL;

  function tempConfigPath() {
    return join(tempHome, '.gbrain', 'config.json');
  }

  function childEnv(extra: NodeJS.ProcessEnv = {}): NodeJS.ProcessEnv {
    return {
      ...process.env,
      ...extra,
      HOME: tempHome,
      USERPROFILE: tempHome,
    };
  }

  function runConfigScript(source: string, extraEnv: NodeJS.ProcessEnv = {}) {
    return Bun.spawnSync({
      cmd: [BUN_BIN, '-e', source],
      cwd: REPO_ROOT,
      env: childEnv(extraEnv),
      timeout: 15_000,
    });
  }

  function writeRawConfig(config: unknown) {
    mkdirSync(join(tempHome, '.gbrain'), { recursive: true });
    writeFileSync(tempConfigPath(), JSON.stringify(config, null, 2) + '\n');
  }

  beforeEach(() => {
    tempHome = mkdtempSync(join(tmpdir(), 'gbrain-config-drift-'));
    delete process.env.DATABASE_URL;
    delete process.env.GBRAIN_DATABASE_URL;
  });

  afterEach(() => {
    if (originalHome === undefined) delete process.env.HOME;
    else process.env.HOME = originalHome;

    if (originalUserProfile === undefined) delete process.env.USERPROFILE;
    else process.env.USERPROFILE = originalUserProfile;

    if (originalDatabaseUrl === undefined) delete process.env.DATABASE_URL;
    else process.env.DATABASE_URL = originalDatabaseUrl;

    if (originalGbrainDatabaseUrl === undefined) delete process.env.GBRAIN_DATABASE_URL;
    else process.env.GBRAIN_DATABASE_URL = originalGbrainDatabaseUrl;

    rmSync(tempHome, { recursive: true, force: true });
  });

  test('saveConfig persists Postgres as engine-only config', () => {
    const result = runConfigScript(`
      import { saveConfig } from ${JSON.stringify(CONFIG_MODULE)};
      saveConfig({
        engine: 'postgres',
        database_url: 'postgresql://postgres:secret@127.0.0.1:55433/stale_brain',
      });
    `);

    expect(result.exitCode).toBe(0);
    const stored = JSON.parse(readFileSync(tempConfigPath(), 'utf-8'));
    expect(stored).toEqual({ engine: 'postgres' });
  });

  test('loadConfig ignores stale Postgres file URL when env is missing', () => {
    writeRawConfig({
      engine: 'postgres',
      database_url: 'postgresql://postgres:secret@127.0.0.1:55433/stale_brain',
      openai_api_key: 'test-openai-key',
    });

    const result = runConfigScript(`
      import { loadConfig } from ${JSON.stringify(CONFIG_MODULE)};
      process.stdout.write(JSON.stringify(loadConfig()));
    `);

    expect(result.exitCode).toBe(0);
    const stdout = new TextDecoder().decode(result.stdout);
    expect(JSON.parse(stdout)).toEqual({
      engine: 'postgres',
      openai_api_key: 'test-openai-key',
    });
  });

  test('loadConfig prefers env Postgres URL over stale file URL', () => {
    writeRawConfig({
      engine: 'postgres',
      database_url: 'postgresql://postgres:secret@127.0.0.1:55433/stale_brain',
    });

    const result = runConfigScript(`
      import { loadConfig } from ${JSON.stringify(CONFIG_MODULE)};
      process.stdout.write(JSON.stringify(loadConfig()));
    `, {
      GBRAIN_DATABASE_URL: 'postgresql://postgres:secret@127.0.0.1:5432/live_brain',
    });

    expect(result.exitCode).toBe(0);
    const stdout = new TextDecoder().decode(result.stdout);
    expect(JSON.parse(stdout)).toEqual({
      engine: 'postgres',
      database_url: 'postgresql://postgres:secret@127.0.0.1:5432/live_brain',
    });
  });

  test('unsourced Postgres CLI fails clearly instead of using stale file URL', () => {
    writeRawConfig({
      engine: 'postgres',
      database_url: 'postgresql://postgres:secret@127.0.0.1:55433/stale_brain',
    });

    const result = Bun.spawnSync({
      cmd: [BUN_BIN, 'run', 'src/cli.ts', 'stats'],
      cwd: REPO_ROOT,
      env: childEnv(),
      timeout: 15_000,
    });

    const stderr = new TextDecoder().decode(result.stderr);
    expect(result.exitCode).toBe(1);
    expect(stderr).toContain('GBRAIN_DATABASE_URL');
    expect(stderr).toContain('stores only {"engine":"postgres"}');
    expect(stderr).not.toContain('127.0.0.1:55433');
  });
});
