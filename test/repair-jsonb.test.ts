/**
 * Unit tests for `gbrain repair-jsonb`.
 *
 * Real repair behavior is validated against scratch Postgres in manual lane
 * verification. These unit tests cover the engine-aware short-circuit and the
 * exact target inventory so the command cannot silently drift away from the
 * doctor-visible JSONB sites.
 */

import { describe, test, expect } from 'bun:test';
import { repairJsonb, TARGETS } from '../src/commands/repair-jsonb.ts';

describe('repairJsonb', () => {
  test('TARGETS matches the five known JSONB repair sites', () => {
    expect(TARGETS.map((t) => `${t.table}.${t.column}`)).toEqual([
      'pages.frontmatter',
      'raw_data.data',
      'ingest_log.pages_updated',
      'files.metadata',
      'page_versions.frontmatter',
    ]);
  });

  test('PGLite short-circuits with zero repaired rows for all targets', async () => {
    const result = await repairJsonb({
      dryRun: false,
      engineConfig: { engine: 'pglite' },
    });

    expect(result.engine).toBe('pglite');
    expect(result.total_repaired).toBe(0);
    expect(result.per_target.length).toBe(5);
    for (const t of result.per_target) {
      expect(t.rows_repaired).toBe(0);
    }
  });

  test('PGLite dry-run is also a clean no-op', async () => {
    const result = await repairJsonb({
      dryRun: true,
      engineConfig: { engine: 'pglite' },
    });

    expect(result.engine).toBe('pglite');
    expect(result.total_repaired).toBe(0);
    expect(result.per_target.map((t) => t.rows_repaired)).toEqual([0, 0, 0, 0, 0]);
  });
});
