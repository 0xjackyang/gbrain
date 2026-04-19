import { describe, test, expect, beforeAll, afterAll } from 'bun:test';
import { join } from 'path';
import { hasDatabase, setupDB, teardownDB, getConn, getDatabaseSkipReason } from './helpers.ts';

const skip = !hasDatabase();
const describeE2E = skip ? describe.skip : describe;

if (skip) {
  console.log(`Skipping E2E schema-version migration tests (${getDatabaseSkipReason()})`);
}

describeE2E('E2E: schema-version migration lane', () => {
  beforeAll(async () => {
    await setupDB();
  });

  afterAll(async () => {
    await teardownDB();
  });

  const cliCwd = join(import.meta.dir, '../..');
  const cliEnv = () => ({ ...process.env, DATABASE_URL: process.env.DATABASE_URL!, GBRAIN_DATABASE_URL: process.env.DATABASE_URL! });

  function initCli() {
    const result = Bun.spawnSync({
      cmd: ['bun', 'run', 'src/cli.ts', 'init', '--non-interactive', '--url', process.env.DATABASE_URL!],
      cwd: cliCwd,
      env: cliEnv(),
      timeout: 15_000,
    });
    expect(result.exitCode).toBe(0);
  }

  test('migrate-schema-version dry-run previews legacy key adoption, and real run canonicalizes to latest', async () => {
    initCli();

    const conn = getConn();
    await conn.unsafe(`DELETE FROM config WHERE key IN ('version', 'schema_version')`);
    await conn.unsafe(`INSERT INTO config (key, value) VALUES ('schema_version', '1')`);

    const dryRun = Bun.spawnSync({
      cmd: ['bun', 'run', 'src/cli.ts', 'migrate-schema-version', '--dry-run', '--json'],
      cwd: cliCwd,
      env: cliEnv(),
      timeout: 15_000,
    });
    expect(dryRun.exitCode).toBe(0);
    const dryParsed = JSON.parse(new TextDecoder().decode(dryRun.stdout));
    expect(dryParsed.before.version).toBe(1);
    expect(dryParsed.before.source).toBe('schema_version');
    expect(dryParsed.would_canonicalize).toBe(true);
    expect(dryParsed.after_version).toBe(4);
    expect(dryParsed.pending.map((m: any) => m.version)).toEqual([2, 3, 4]);

    const beforeRows = await conn.unsafe(`SELECT key, value FROM config WHERE key IN ('version', 'schema_version') ORDER BY key`);
    expect(beforeRows).toEqual([{ key: 'schema_version', value: '1' }]);

    const migrate = Bun.spawnSync({
      cmd: ['bun', 'run', 'src/cli.ts', 'migrate-schema-version', '--json'],
      cwd: cliCwd,
      env: cliEnv(),
      timeout: 15_000,
    });
    expect(migrate.exitCode).toBe(0);
    const migrateParsed = JSON.parse(new TextDecoder().decode(migrate.stdout));
    expect(migrateParsed.canonicalized).toBe(true);
    expect(migrateParsed.migrations_applied).toBe(3);
    expect(migrateParsed.after.version).toBe(4);
    expect(migrateParsed.after.source).toBe('version');
    expect(migrateParsed.legacy_synced).toBe(true);

    const afterRows = await conn.unsafe(`SELECT key, value FROM config WHERE key IN ('version', 'schema_version') ORDER BY key`);
    expect(afterRows).toEqual([
      { key: 'schema_version', value: '4' },
      { key: 'version', value: '4' },
    ]);

    const doctor = Bun.spawnSync({
      cmd: ['bun', 'run', 'src/cli.ts', 'doctor', '--json'],
      cwd: cliCwd,
      env: cliEnv(),
      timeout: 15_000,
    });
    expect(doctor.exitCode).toBe(0);
    const doctorParsed = JSON.parse(new TextDecoder().decode(doctor.stdout));
    const schemaCheck = doctorParsed.checks.find((check: any) => check.name === 'schema_version');
    expect(schemaCheck.status).toBe('ok');
    expect(schemaCheck.message).toContain('Version 4');
  }, 60_000);
});
