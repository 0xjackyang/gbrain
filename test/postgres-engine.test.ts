/**
 * postgres-engine.ts source-level guardrails.
 *
 * Live Postgres coverage for search paths lives in test/e2e/search-quality.test.ts.
 * This file stays fast and DB-free: it inspects the source of
 * src/core/postgres-engine.ts to lock in decisions that protect the
 * shared connection pool from per-request GUC leaks.
 *
 * Regression: R6-F006 / R4-F002.
 * searchKeyword and searchVector used to call bare
 *   await sql`SET statement_timeout = '8s'`
 *   ...query...
 *   finally { await sql`SET statement_timeout = '0'` }
 * against the shared pool. Each tagged template picks an arbitrary
 * connection, so the SET, the query, and the reset could all land on
 * DIFFERENT connections. Worst case: the 8s GUC sticks on some pooled
 * connection and clips the next caller's long-running query; or the
 * reset to 0 lands on a connection that other code expected to be
 * protected. The fix wraps each query in sql.begin() and uses
 * SET LOCAL so the GUC is transaction-scoped and auto-resets on
 * COMMIT/ROLLBACK, regardless of error path.
 */

import { describe, test, expect } from 'bun:test';
import { readFileSync } from 'fs';
import { join } from 'path';

const SRC = readFileSync(
  join(import.meta.dir, '..', 'src', 'core', 'postgres-engine.ts'),
  'utf-8',
);

describe('postgres-engine / search path timeout isolation', () => {
  test('no bare `SET statement_timeout` statement survives', () => {
    // Strip comments so the commentary mentioning the anti-pattern does
    // not trigger a false positive. Block-comment + line-comment strip.
    const stripped = SRC
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/(^|\s)\/\/[^\n]*/g, '$1');

    // Match a tagged-template statement of the form
    //   sql`SET statement_timeout = ...`
    // that is NOT preceded by LOCAL. This is the exact shape that bleeds
    // onto pooled connections; SET LOCAL is safe inside a transaction.
    const bare = stripped.match(
      /sql`\s*SET\s+(?!LOCAL\s)statement_timeout\b[^`]*`/gi,
    );
    expect(bare).toBeNull();
  });

  test('searchKeyword wraps its query in sql.begin()', () => {
    const fn = extractMethod(SRC, 'searchKeyword');
    expect(fn).toMatch(/sql\.begin\s*\(\s*async\s+sql\s*=>/);
  });

  test('searchVector wraps its query in sql.begin()', () => {
    const fn = extractMethod(SRC, 'searchVector');
    expect(fn).toMatch(/sql\.begin\s*\(\s*async\s+sql\s*=>/);
  });

  test('both search methods use SET LOCAL for the timeout', () => {
    const keyword = extractMethod(SRC, 'searchKeyword');
    const vector = extractMethod(SRC, 'searchVector');
    expect(keyword).toMatch(/SET\s+LOCAL\s+statement_timeout/);
    expect(vector).toMatch(/SET\s+LOCAL\s+statement_timeout/);
  });

  test('connect() with poolSize honors resolvePrepare (PgBouncer regression guard)', () => {
    // Regression: worker-instance pools were NOT honoring the prepare decision
    // before v0.15.4. Module singleton connect() in db.ts was fixed by #284 but
    // PostgresEngine.connect({poolSize}) (the branch used by `gbrain jobs work`)
    // silently ignored it — agents running background work against Supabase
    // pooler URLs still hit `prepared statement "..." does not exist` under
    // load. Source-level grep is enough: runtime mocking of postgres.js's
    // tagged-template interface is painful under bun ESM and the wiring is
    // simple enough that if `resolvePrepare` name appears and a conditional
    // `prepare` key appears in the options literal, the wire-up is live.
    const stripped = stripComments(SRC);
    expect(stripped).toMatch(/db\.resolvePrepare\s*\(\s*url\s*\)/);
    expect(stripped).toMatch(/typeof\s+prepare\s*===\s*['"]boolean['"]/);
  });

  test('neither search method clears the timeout with `SET statement_timeout = 0`', () => {
    // The reset-to-zero pattern was the other half of the leak: if SET
    // LOCAL is in play, COMMIT handles the reset and an explicit
    // `SET statement_timeout = '0'` would itself leak the GUC change
    // onto the returned connection. Strip comments first so the
    // commentary in the method itself (which quotes the anti-pattern
    // to explain it) does not trigger a false positive.
    const keyword = stripComments(extractMethod(SRC, 'searchKeyword'));
    const vector = stripComments(extractMethod(SRC, 'searchVector'));
    expect(keyword).not.toMatch(/SET\s+statement_timeout\s*=\s*['"]?0/);
    expect(vector).not.toMatch(/SET\s+statement_timeout\s*=\s*['"]?0/);
  });
});

describe('postgres-engine / embedding integrity', () => {
  test('upsertChunks no longer preserves embedded_at when the stored vector is null', () => {
    const fn = stripComments(extractMethod(SRC, 'upsertChunks'));
    expect(fn).not.toMatch(/embedded_at\s*=\s*COALESCE\s*\(\s*EXCLUDED\.embedded_at\s*,\s*content_chunks\.embedded_at\s*\)/);
    expect(fn).toMatch(/embedded_at\s*=\s*CASE[\s\S]*WHEN\s+EXCLUDED\.chunk_text\s*!=\s*content_chunks\.chunk_text\s+THEN\s+EXCLUDED\.embedded_at[\s\S]*WHEN\s+EXCLUDED\.embedding\s+IS\s+NOT\s+NULL\s+THEN\s+EXCLUDED\.embedded_at[\s\S]*WHEN\s+content_chunks\.embedding\s+IS\s+NOT\s+NULL\s+THEN\s+content_chunks\.embedded_at[\s\S]*ELSE\s+NULL[\s\S]*END/);
  });

  test('getStats counts actual vectors, not embedded_at', () => {
    const fn = stripComments(extractMethod(SRC, 'getStats'));
    expect(fn).toMatch(/content_chunks\s+WHERE\s+embedding\s+IS\s+NOT\s+NULL\)\s+as\s+embedded_count/i);
  });

  test('getHealth counts coverage and missing embeddings from actual vectors', () => {
    const fn = stripComments(extractMethod(SRC, 'getHealth'));
    expect(fn).toMatch(/content_chunks\s+WHERE\s+embedding\s+IS\s+NOT\s+NULL\)::float\s*\/\s*GREATEST\(\(SELECT\s+count\(\*\)\s+FROM\s+content_chunks\),\s*1\)::float\s+as\s+embed_coverage/i);
    expect(fn).toMatch(/content_chunks\s+WHERE\s+embedding\s+IS\s+NULL\)\s+as\s+missing_embeddings/i);
  });
});

function stripComments(s: string): string {
  return s
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|\s)\/\/[^\n]*/g, '$1');
}

// extractMethod grabs the body of a class method by brace-matching from
// its opening line. Returns the method body up to the matching closing
// brace. Good enough for the small number of methods in this file.
function extractMethod(source: string, name: string): string {
  // Find "async <name>(" at method-definition indentation (2 spaces).
  const openRe = new RegExp(`^\\s+async\\s+${name}\\s*\\(`, 'm');
  const match = openRe.exec(source);
  if (!match) {
    throw new Error(`method ${name} not found in postgres-engine.ts`);
  }
  // Scan forward balancing braces.
  let i = source.indexOf('{', match.index);
  if (i < 0) throw new Error(`no opening brace for ${name}`);
  const start = i;
  let depth = 0;
  for (; i < source.length; i++) {
    const c = source[i];
    if (c === '{') depth++;
    else if (c === '}') {
      depth--;
      if (depth === 0) return source.slice(start, i + 1);
    }
  }
  throw new Error(`unbalanced braces in ${name}`);
}
