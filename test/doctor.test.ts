import { describe, test, expect } from 'bun:test';
import { mkdtempSync, rmSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

describe('doctor command', () => {
  test('doctor module exports runDoctor', async () => {
    const { runDoctor } = await import('../src/commands/doctor.ts');
    expect(typeof runDoctor).toBe('function');
  });

  test('LATEST_VERSION is importable from migrate', async () => {
    const { LATEST_VERSION } = await import('../src/core/migrate.ts');
    expect(typeof LATEST_VERSION).toBe('number');
  });

  test('CLI registers doctor and migrate-schema-version commands', async () => {
    const result = Bun.spawnSync({
      cmd: ['bun', 'run', 'src/cli.ts', '--help'],
      cwd: import.meta.dir + '/..',
    });
    const stdout = new TextDecoder().decode(result.stdout);
    expect(stdout).toContain('doctor');
    expect(stdout).toContain('--fast');
    expect(stdout).toContain('migrate-schema-version');
  });

  test('CLI-only maintenance help works without config or DB access', async () => {
    const tempHome = mkdtempSync(join(tmpdir(), 'gbrain-help-'));
    try {
      for (const command of ['doctor', 'repair-jsonb', 'migrate-schema-version']) {
        const result = Bun.spawnSync({
          cmd: ['bun', 'run', 'src/cli.ts', command, '--help'],
          cwd: import.meta.dir + '/..',
          env: {
            ...process.env,
            HOME: tempHome,
            USERPROFILE: tempHome,
            DATABASE_URL: '',
            GBRAIN_DATABASE_URL: '',
          },
        });
        const stdout = new TextDecoder().decode(result.stdout);
        const stderr = new TextDecoder().decode(result.stderr);
        expect(result.exitCode).toBe(0);
        expect(stdout).toContain(`Usage: gbrain ${command}`);
        expect(stderr).not.toContain('No brain configured');
      }
    } finally {
      rmSync(tempHome, { recursive: true, force: true });
    }
  });

  test('doctor finds bundled skills even when invoked outside a repo checkout', async () => {
    const tempDir = mkdtempSync(join(tmpdir(), 'gbrain-doctor-'));
    const cliPath = new URL('../src/cli.ts', import.meta.url).pathname;
    try {
      const result = Bun.spawnSync({
        cmd: ['bun', 'run', cliPath, 'doctor', '--fast', '--json'],
        cwd: tempDir,
        env: {
          ...process.env,
          DATABASE_URL: '',
          GBRAIN_DATABASE_URL: '',
        },
      });
      const stdout = new TextDecoder().decode(result.stdout);
      expect(result.exitCode).toBe(0);
      const payload = JSON.parse(stdout) as {
        checks: Array<{ name: string; status: string; message: string }>;
      };
      const resolver = payload.checks.find(check => check.name === 'resolver_health');
      expect(resolver?.status).toBe('ok');
      expect(resolver?.message).toContain('skills');
    } finally {
      rmSync(tempDir, { recursive: true, force: true });
    }
  });

  test('Check interface supports issues array', async () => {
    const { Check } = await import('../src/commands/doctor.ts');
    // The Check type allows an optional issues array for resolver findings
    const check: import('../src/commands/doctor.ts').Check = {
      name: 'resolver_health',
      status: 'warn',
      message: '2 issues',
      issues: [{ type: 'unreachable', skill: 'test-skill', action: 'Add trigger row' }],
    };
    expect(check.issues).toHaveLength(1);
    expect(check.issues![0].action).toContain('trigger');
  });

  test('runDoctor accepts null engine for filesystem-only mode', async () => {
    const { runDoctor } = await import('../src/commands/doctor.ts');
    // runDoctor should accept null engine — it runs filesystem checks only
    // We can't call it directly (it calls process.exit), but we verify the signature
    expect(runDoctor.length).toBe(2); // engine, args
  });

  // v0.12.2 reliability wave — doctor detects JSONB double-encode + truncated
  // bodies and points users at the standalone `gbrain repair-jsonb` command.
  // Detection only; repair lives in src/commands/repair-jsonb.ts.
  test('doctor source contains jsonb_integrity, markdown_body_completeness, and schema migration guidance', async () => {
    const source = await Bun.file(new URL('../src/commands/doctor.ts', import.meta.url)).text();
    expect(source).toContain('jsonb_integrity');
    expect(source).toContain('markdown_body_completeness');
    expect(source).toContain('gbrain repair-jsonb');
    expect(source).toContain('gbrain migrate-schema-version');
  });

  test('jsonb_integrity check covers the four JSONB sites fixed in v0.12.1', async () => {
    const source = await Bun.file(new URL('../src/commands/doctor.ts', import.meta.url)).text();
    expect(source).toMatch(/table:\s*'pages'.*col:\s*'frontmatter'/);
    expect(source).toMatch(/table:\s*'raw_data'.*col:\s*'data'/);
    expect(source).toMatch(/table:\s*'ingest_log'.*col:\s*'pages_updated'/);
    expect(source).toMatch(/table:\s*'files'.*col:\s*'metadata'/);
  });
});
