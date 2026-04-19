/**
 * E2E test helpers: DB lifecycle, fixture import, timing, and diagnostics.
 *
 * Usage in test files:
 *   import { setupDB, teardownDB, importFixtures, time } from './helpers.ts';
 *   beforeAll(async () => { await setupDB(); await importFixtures(); });
 *   afterAll(async () => { await teardownDB(); });
 */

import { readFileSync, existsSync, readdirSync, statSync } from 'fs';
import { join, resolve, relative, dirname, basename, extname } from 'path';
import { PostgresEngine } from '../../src/core/postgres-engine.ts';
import * as db from '../../src/core/db.ts';
import { importFromContent } from '../../src/core/import-file.ts';
import { parseMarkdown } from '../../src/core/markdown.ts';
import { LATEST_VERSION } from '../../src/core/migrate.ts';

// Load .env.testing if present
const envPath = resolve(import.meta.dir, '../../.env.testing');
if (existsSync(envPath)) {
  const lines = readFileSync(envPath, 'utf-8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq);
    const val = trimmed.slice(eq + 1);
    if (!process.env[key]) process.env[key] = val;
    // Back-compat: older .env.testing files used DATABASE_URL directly.
    // Promote that value into the dedicated E2E variable, but DO NOT treat
    // arbitrary ambient DATABASE_URL from the caller shell as safe.
    if (key === 'DATABASE_URL' && !process.env.GBRAIN_E2E_DATABASE_URL) {
      process.env.GBRAIN_E2E_DATABASE_URL = val;
    }
  }
}

function getDatabaseName(url: string): string {
  try {
    const parsed = new URL(url);
    return parsed.pathname.replace(/^\//, '');
  } catch {
    return '';
  }
}

export function isSafeE2EDatabaseUrl(url: string): boolean {
  const dbName = getDatabaseName(url);
  return /(test|testing|e2e|ci|tmp)/i.test(dbName);
}

export function getE2EDatabaseUrlFromEnv(env: NodeJS.ProcessEnv): string | null {
  return env.GBRAIN_E2E_DATABASE_URL || null;
}

export function getE2EDatabaseUrl(): string | null {
  return getE2EDatabaseUrlFromEnv(process.env);
}

export function getDatabaseSkipReasonFromEnv(env: NodeJS.ProcessEnv): string {
  if (getE2EDatabaseUrlFromEnv(env)) return '';
  if (env.DATABASE_URL) {
    return 'GBRAIN_E2E_DATABASE_URL not set (ambient DATABASE_URL is ignored for destructive E2E safety)';
  }
  return 'GBRAIN_E2E_DATABASE_URL not set';
}

export function getDatabaseSkipReason(): string {
  return getDatabaseSkipReasonFromEnv(process.env);
}

function assertSafeE2EDatabaseUrl(url: string) {
  if (process.env.GBRAIN_E2E_ALLOW_ANY_DB === '1') return;
  if (isSafeE2EDatabaseUrl(url)) return;
  const dbName = getDatabaseName(url) || '<unknown>';
  throw new Error(
    `Refusing destructive E2E tests against database '${dbName}'. ` +
    'Use GBRAIN_E2E_DATABASE_URL pointing at a dedicated test/e2e/ci/tmp database, ' +
    'or set GBRAIN_E2E_ALLOW_ANY_DB=1 only when you intentionally know it is isolated.',
  );
}

const DATABASE_URL = getE2EDatabaseUrl();
if (DATABASE_URL) {
  assertSafeE2EDatabaseUrl(DATABASE_URL);
  // Force all in-process and child-process DB lookups onto the dedicated E2E DB.
  process.env.DATABASE_URL = DATABASE_URL;
  process.env.GBRAIN_DATABASE_URL = DATABASE_URL;
}
const FIXTURES_DIR = resolve(import.meta.dir, 'fixtures');

let engine: PostgresEngine | null = null;

const ALL_TABLES = [
  'content_chunks',
  'links',
  'tags',
  'raw_data',
  'timeline_entries',
  'page_versions',
  'ingest_log',
  'files',
  'pages',       // last because of foreign keys
  'config',
];

/**
 * Check if a real database is available for E2E tests.
 */
export function hasDatabase(): boolean {
  return !!DATABASE_URL;
}

/**
 * Connect to DB, run schema init, truncate all tables.
 * Call in beforeAll() of each test file.
 */
export async function setupDB(): Promise<PostgresEngine> {
  if (!DATABASE_URL) {
    throw new Error(`${getDatabaseSkipReason()}. Copy .env.testing.example to .env.testing and configure a dedicated E2E DB.`);
  }

  // Disconnect any prior connection (clean slate)
  await db.disconnect();

  // Connect fresh
  await db.connect({ database_url: DATABASE_URL });
  await db.initSchema();

  // Truncate all data tables (preserves schema + extensions)
  const conn = db.getConnection();
  for (const table of ALL_TABLES) {
    await conn.unsafe(`TRUNCATE ${table} CASCADE`);
  }

  // Re-seed config (initSchema inserts default config rows; after truncate, keep
  // the test DB aligned with the latest already-applied schema state).
  await conn.unsafe(`
    INSERT INTO config (key, value) VALUES ('version', '${LATEST_VERSION}')
    ON CONFLICT (key) DO NOTHING
  `);

  engine = new PostgresEngine();
  await engine.connect({ database_url: DATABASE_URL });
  return engine;
}

/**
 * Disconnect from DB. Call in afterAll() of each test file.
 */
export async function teardownDB(): Promise<void> {
  if (engine) {
    await engine.disconnect();
    engine = null;
  }
  await db.disconnect();
}

/**
 * Get the current engine instance.
 */
export function getEngine(): PostgresEngine {
  if (!engine) throw new Error('setupDB() must be called first');
  return engine;
}

/**
 * Get a raw DB connection for direct queries.
 */
export function getConn() {
  return db.getConnection();
}

/**
 * Import all fixture files from test/e2e/fixtures/ into the brain.
 * Returns the list of import results.
 */
export async function importFixtures() {
  const e = getEngine();
  const results: Array<{ slug: string; status: string; chunks: number }> = [];

  const files = findMarkdownFiles(FIXTURES_DIR);
  for (const filePath of files) {
    const relPath = relative(FIXTURES_DIR, filePath);
    const content = readFileSync(filePath, 'utf-8');
    const parsed = parseMarkdown(content, relPath);
    const result = await importFromContent(e, parsed.slug, content, { noEmbed: true });
    results.push(result);
  }

  return results;
}

/**
 * Import a single fixture by its relative path within fixtures/.
 */
export async function importFixture(relativePath: string) {
  const e = getEngine();
  const filePath = join(FIXTURES_DIR, relativePath);
  const content = readFileSync(filePath, 'utf-8');
  const parsed = parseMarkdown(content, relativePath);
  return importFromContent(e, parsed.slug, content, { noEmbed: true });
}

/**
 * Recursively find all .md files in a directory.
 */
function findMarkdownFiles(dir: string): string[] {
  const results: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      results.push(...findMarkdownFiles(full));
    } else if (extname(entry) === '.md') {
      results.push(full);
    }
  }
  return results.sort();
}

/**
 * Time a function and return [result, durationMs].
 */
export async function time<T>(fn: () => Promise<T>): Promise<[T, number]> {
  const start = performance.now();
  const result = await fn();
  const dur = performance.now() - start;
  return [result, dur];
}

/**
 * Dump DB state for debugging on test failure.
 */
export async function dumpDBState(): Promise<string> {
  const conn = db.getConnection();
  const pages = await conn.unsafe(`SELECT slug, type, title FROM pages ORDER BY slug`);
  const chunkCount = await conn.unsafe(`SELECT count(*) as n FROM content_chunks`);
  const linkCount = await conn.unsafe(`SELECT count(*) as n FROM links`);
  const tagCount = await conn.unsafe(`SELECT count(*) as n FROM tags`);

  const lines = [
    `=== DB STATE DUMP ===`,
    `Pages (${pages.length}):`,
    ...pages.map((p: any) => `  ${p.slug} [${p.type}] "${p.title}"`),
    `Chunks: ${chunkCount[0]?.n ?? 0}`,
    `Links: ${linkCount[0]?.n ?? 0}`,
    `Tags: ${tagCount[0]?.n ?? 0}`,
    `=== END DUMP ===`,
  ];
  return lines.join('\n');
}

/**
 * Get the fixtures directory path.
 */
export const FIXTURES_PATH = FIXTURES_DIR;
