/**
 * `gbrain repair-jsonb` — repair JSONB columns that were stored as string
 * literals due to the v0.12.0-and-earlier double-encode bug.
 *
 * Background: postgres-engine.ts wrote frontmatter and other JSONB columns
 * via the buggy `JSON.stringify(value)`-then-cast-to-jsonb interpolation
 * pattern, which postgres.js v3 stringified again on the wire. Result: every
 * `frontmatter->>'key'` query returned NULL on Postgres-backed brains; GIN
 * indexes were inert. PGLite was unaffected (different driver path).
 * `sql.json(...)` hardening prevents new damage, but existing rows stay broken
 * until rewritten — that is what this command does.
 *
 * Strategy: for each affected JSONB column, detect rows where
 * `jsonb_typeof(col) = 'string'` and rewrite them via `(col #>> '{}')::jsonb`,
 * which extracts the string payload and re-parses it as JSONB. Idempotent:
 * re-running is a no-op because no rows match the guard after a successful
 * repair. PGLite is a clean no-op because it never wrote string-typed JSONB.
 */

import { loadConfig, toEngineConfig } from '../core/config.ts';
import type { EngineConfig } from '../core/types.ts';
import * as db from '../core/db.ts';

export const REPAIR_JSONB_HELP = `Usage: gbrain repair-jsonb [--dry-run] [--json]

Repair legacy Postgres JSONB rows that were double-encoded as string literals.

Options:
  --dry-run   Preview how many rows would be repaired without writing
  --json      Emit machine-readable JSON output`;

export function printRepairJsonbHelp(): void {
  console.log(REPAIR_JSONB_HELP);
}

export interface RepairTarget {
  table: string;
  column: string;
  keyCol?: string;
}

export const TARGETS: RepairTarget[] = [
  { table: 'pages', column: 'frontmatter', keyCol: 'slug' },
  { table: 'raw_data', column: 'data', keyCol: 'source' },
  { table: 'ingest_log', column: 'pages_updated', keyCol: 'source_ref' },
  { table: 'files', column: 'metadata', keyCol: 'storage_path' },
  { table: 'page_versions', column: 'frontmatter', keyCol: 'snapshot_at' },
];

export interface RepairResult {
  engine: string;
  per_target: Array<{
    table: string;
    column: string;
    rows_repaired: number;
  }>;
  total_repaired: number;
}

export interface RepairOpts {
  dryRun: boolean;
  engineConfig?: EngineConfig;
}

function buildKnownSchemaGuardQuery(): string {
  const clauses = TARGETS.map(
    (t) => `(table_name = '${t.table}' AND column_name = '${t.column}')`,
  ).join(' OR ');
  return `
    SELECT table_name, column_name
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND (${clauses})
  `;
}

async function assertKnownSchema(sql: ReturnType<typeof db.getConnection>): Promise<void> {
  const rows = await sql.unsafe(buildKnownSchemaGuardQuery()) as Array<{
    table_name: string;
    column_name: string;
  }>;
  const present = new Set(rows.map((r) => `${r.table_name}.${r.column_name}`));
  const missing = TARGETS
    .map((t) => `${t.table}.${t.column}`)
    .filter((key) => !present.has(key));

  if (missing.length > 0) {
    throw new Error(
      `Refusing repair-jsonb: database is missing expected gbrain JSONB targets (${missing.join(', ')}). ` +
      'Point GBRAIN_DATABASE_URL at a known gbrain Postgres schema.',
    );
  }
}

export async function repairJsonb(opts: RepairOpts = { dryRun: false }): Promise<RepairResult> {
  let engineCfg = opts.engineConfig;
  if (!engineCfg) {
    const config = loadConfig();
    if (!config) {
      throw new Error('No brain configured. Run: gbrain init');
    }
    engineCfg = toEngineConfig(config);
  }

  const engineKind = engineCfg.engine || 'postgres';
  const result: RepairResult = {
    engine: engineKind,
    per_target: [],
    total_repaired: 0,
  };

  if (engineKind === 'pglite') {
    for (const t of TARGETS) {
      result.per_target.push({ table: t.table, column: t.column, rows_repaired: 0 });
    }
    return result;
  }

  await db.connect(engineCfg);
  const sql = db.getConnection();
  await assertKnownSchema(sql);

  for (const t of TARGETS) {
    let repaired = 0;

    if (opts.dryRun) {
      const rows = await sql.unsafe(
        `SELECT count(*)::int AS n FROM ${t.table} WHERE jsonb_typeof(${t.column}) = 'string'`,
      ) as Array<{ n: number }>;
      repaired = rows[0]?.n ?? 0;
    } else {
      const rows = await sql.unsafe(
        `UPDATE ${t.table}
         SET ${t.column} = (${t.column} #>> '{}')::jsonb
         WHERE jsonb_typeof(${t.column}) = 'string'
         RETURNING 1`,
      );
      repaired = rows.length;
    }

    result.per_target.push({ table: t.table, column: t.column, rows_repaired: repaired });
    result.total_repaired += repaired;
  }

  return result;
}

export async function runRepairJsonbCli(args: string[]): Promise<void> {
  if (args.includes('--help') || args.includes('-h')) {
    printRepairJsonbHelp();
    return;
  }

  const dryRun = args.includes('--dry-run');
  const jsonMode = args.includes('--json');
  const result = await repairJsonb({ dryRun });

  if (jsonMode) {
    console.log(JSON.stringify({ status: 'ok', dry_run: dryRun, ...result }));
    return;
  }

  if (result.engine === 'pglite') {
    console.log('Engine: pglite — JSONB double-encode bug never affected this path. No-op.');
    return;
  }

  console.log(`${dryRun ? '[dry-run] ' : ''}Engine: postgres`);
  console.log(`${dryRun ? '[dry-run] ' : ''}JSONB repair across ${TARGETS.length} columns:`);
  for (const t of result.per_target) {
    const verb = dryRun ? 'would repair' : 'repaired';
    console.log(`  ${t.table}.${t.column}: ${verb} ${t.rows_repaired} rows`);
  }
  console.log(`${dryRun ? '[dry-run] ' : ''}Total ${dryRun ? 'to repair' : 'repaired'}: ${result.total_repaired} rows`);
  if (!dryRun && result.total_repaired === 0) {
    console.log('Nothing to repair (already-valid JSONB or fresh install).');
  }
}
