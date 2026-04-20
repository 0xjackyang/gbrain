import type { BrainEngine } from '../core/engine.ts';
import {
  LATEST_VERSION,
  getPendingMigrations,
  getSchemaVersionState,
} from '../core/migrate.ts';

export const MIGRATE_SCHEMA_VERSION_HELP = `Usage: gbrain migrate-schema-version [--dry-run] [--json]

Canonicalize a legacy schema_version config key into the canonical version key,
then run any pending schema migrations.

Options:
  --dry-run   Preview the detected version state and pending migrations without writing
  --json      Emit machine-readable JSON output`;

export function printMigrateSchemaVersionHelp(): void {
  console.log(MIGRATE_SCHEMA_VERSION_HELP);
}

function detectEngine(engine: BrainEngine): 'postgres' | 'pglite' | 'unknown' {
  const name = engine.constructor?.name || '';
  if (name.includes('Postgres')) return 'postgres';
  if (name.includes('PGLite')) return 'pglite';
  return 'unknown';
}

async function captureConsoleLogs<T>(fn: () => Promise<T>): Promise<{ result: T; logs: string[] }> {
  const originalLog = console.log;
  const logs: string[] = [];
  console.log = (...args: unknown[]) => {
    logs.push(args.map((arg) => String(arg)).join(' '));
  };
  try {
    const result = await fn();
    return { result, logs };
  } finally {
    console.log = originalLog;
  }
}

function countAppliedMigrations(logs: string[]): number {
  const summary = logs.find((line) => /\b\d+ migration\(s\) applied\b/.test(line));
  if (summary) {
    const match = summary.match(/(\d+) migration\(s\) applied/);
    if (match) return parseInt(match[1], 10);
  }
  return logs.filter((line) => /Migration \d+ applied:/.test(line)).length;
}

export async function runMigrateSchemaVersion(engine: BrainEngine, args: string[]) {
  if (args.includes('--help') || args.includes('-h')) {
    printMigrateSchemaVersionHelp();
    return;
  }

  const dryRun = args.includes('--dry-run');
  const jsonOutput = args.includes('--json');

  const before = await getSchemaVersionState(engine, { fallbackVersion: 1 });
  const pending = getPendingMigrations(before.version);
  const legacyExists = await engine.getConfig('schema_version');
  const wouldCanonicalize = before.source === 'schema_version' && !before.canonical_present;
  const wouldSyncLegacy = legacyExists !== null;

  if (dryRun) {
    const result = {
      status: 'ok',
      dry_run: true,
      engine: detectEngine(engine),
      before,
      pending,
      latest_version: LATEST_VERSION,
      would_canonicalize: wouldCanonicalize,
      would_sync_legacy_key: wouldSyncLegacy,
      after_version: pending.length > 0 ? pending[pending.length - 1].version : before.version,
    };
    if (jsonOutput) {
      console.log(JSON.stringify(result));
      return;
    }
    printHuman(result);
    return;
  }

  const canonicalized = wouldCanonicalize;
  const runInitSchema = async () => {
    await engine.initSchema();
    return getSchemaVersionState(engine, { fallbackVersion: 1 });
  };
  const { result: after, logs: migrationLogs } = await captureConsoleLogs(runInitSchema);
  const appliedCount = countAppliedMigrations(migrationLogs);
  let legacySynced = false;
  if (legacyExists !== null) {
    await engine.setConfig('schema_version', String(after.version));
    legacySynced = true;
  }

  const result = {
    status: 'ok',
    dry_run: false,
    engine: detectEngine(engine),
    before,
    pending,
    latest_version: LATEST_VERSION,
    canonicalized,
    migrations_applied: appliedCount,
    migration_logs: migrationLogs,
    after,
    legacy_synced: legacySynced,
  };

  if (jsonOutput) {
    console.log(JSON.stringify(result));
    return;
  }
  for (const line of migrationLogs) {
    console.log(line);
  }
  printHuman(result);
}

function printHuman(result: any) {
  console.log(`${result.dry_run ? '[dry-run] ' : ''}Engine: ${result.engine}`);
  console.log(`${result.dry_run ? '[dry-run] ' : ''}Before: version ${result.before.version} via ${result.before.source}`);
  if (result.pending.length === 0) {
    console.log(`${result.dry_run ? '[dry-run] ' : ''}No pending migrations. Current schema is already at ${result.latest_version}.`);
  } else {
    console.log(`${result.dry_run ? '[dry-run] ' : ''}Pending migrations:`);
    for (const migration of result.pending) {
      console.log(`  v${migration.version}: ${migration.name}`);
    }
  }
  if (result.dry_run) {
    console.log(`[dry-run] Would canonicalize legacy schema_version key: ${result.would_canonicalize ? 'yes' : 'no'}`);
    console.log(`[dry-run] Would sync legacy schema_version key after migration: ${result.would_sync_legacy_key ? 'yes' : 'no'}`);
    console.log(`[dry-run] After: version ${result.after_version}`);
    return;
  }
  console.log(`Canonicalized legacy key: ${result.canonicalized ? 'yes' : 'no'}`);
  console.log(`Migrations applied: ${result.migrations_applied}`);
  console.log(`Legacy key synced: ${result.legacy_synced ? 'yes' : 'no'}`);
  console.log(`After: version ${result.after.version} via ${result.after.source}`);
}
