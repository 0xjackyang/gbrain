import { describe, test, expect } from 'bun:test';
import type { BrainEngine } from '../src/core/engine.ts';
import {
  LATEST_VERSION,
  getPendingMigrations,
  getSchemaVersionState,
  canonicalizeLegacySchemaVersion,
  runMigrations,
} from '../src/core/migrate.ts';
import { runMigrateSchemaVersion } from '../src/commands/migrate-schema-version.ts';

function makeMockEngine(seed: Record<string, string> = {}): BrainEngine {
  const store = new Map(Object.entries(seed));
  return {
    async connect() {},
    async disconnect() {},
    async initSchema() {},
    async transaction<T>(fn: (engine: BrainEngine) => Promise<T>) { return fn(this as BrainEngine); },
    async getPage() { return null; },
    async putPage() { throw new Error('not implemented'); },
    async deletePage() {},
    async listPages() { return []; },
    async resolveSlugs() { return []; },
    async searchKeyword() { return []; },
    async searchVector() { return []; },
    async getEmbeddingsByChunkIds() { return new Map(); },
    async upsertChunks() {},
    async getChunks() { return []; },
    async deleteChunks() {},
    async addLink() {},
    async removeLink() {},
    async getLinks() { return []; },
    async getBacklinks() { return []; },
    async traverseGraph() { return []; },
    async addTag() {},
    async removeTag() {},
    async getTags() { return []; },
    async addTimelineEntry() {},
    async getTimeline() { return []; },
    async putRawData() {},
    async getRawData() { return []; },
    async createVersion() { throw new Error('not implemented'); },
    async getVersions() { return []; },
    async revertToVersion() {},
    async getStats() { throw new Error('not implemented'); },
    async getHealth() { throw new Error('not implemented'); },
    async logIngest() {},
    async getIngestLog() { return []; },
    async updateSlug() {},
    async rewriteLinks() {},
    async getConfig(key: string) { return store.get(key) ?? null; },
    async setConfig(key: string, value: string) { store.set(key, value); },
    async runMigration() {},
    async getChunksWithEmbeddings() { return []; },
  } as unknown as BrainEngine;
}

describe('schema-version helpers', () => {
  test('falls back to legacy schema_version when version is missing', async () => {
    const engine = makeMockEngine({ schema_version: '1' });
    const state = await getSchemaVersionState(engine, { fallbackVersion: 0 });
    expect(state).toEqual({
      version: 1,
      source: 'schema_version',
      canonical_present: false,
      legacy_present: true,
    });
  });

  test('canonicalizes legacy schema_version into version', async () => {
    const engine = makeMockEngine({ schema_version: '3' });
    const changed = await canonicalizeLegacySchemaVersion(engine);
    const state = await getSchemaVersionState(engine, { fallbackVersion: 0 });
    expect(changed).toBe(true);
    expect(state.version).toBe(3);
    expect(state.source).toBe('version');
    expect(state.canonical_present).toBe(true);
    expect(state.legacy_present).toBe(true);
  });

  test('invalid canonical version falls back to legacy schema_version and is canonicalized', async () => {
    const engine = makeMockEngine({ version: 'oops', schema_version: '2' });
    const before = await getSchemaVersionState(engine, { fallbackVersion: 0 });
    const changed = await canonicalizeLegacySchemaVersion(engine);
    const after = await getSchemaVersionState(engine, { fallbackVersion: 0 });
    expect(before.source).toBe('schema_version');
    expect(changed).toBe(true);
    expect(after.source).toBe('version');
    expect(after.version).toBe(2);
  });

  test('runMigrations does not advance version when slug rewrite fails', async () => {
    const store = new Map<string, string>([['schema_version', '1']]);
    const engine = {
      async getConfig(key: string) { return store.get(key) ?? null; },
      async setConfig(key: string, value: string) { store.set(key, value); },
      async listPages() { return [{ slug: 'Needs Rename' }]; },
      async updateSlug() { throw new Error('duplicate slug'); },
      async rewriteLinks() {},
      async transaction<T>(fn: (engine: BrainEngine) => Promise<T>) { return fn(this as BrainEngine); },
      async runMigration() {},
    } as unknown as BrainEngine;

    await expect(runMigrations(engine)).rejects.toThrow('slugify_existing_pages failed');
    expect(store.get('version')).toBe('1');
  });

  test('returns pending migrations above the current version', () => {
    expect(getPendingMigrations(1)).toEqual([
      { version: 2, name: 'slugify_existing_pages' },
      { version: 3, name: 'unique_chunk_index' },
      { version: 4, name: 'access_tokens_and_mcp_log' },
    ]);
    expect(getPendingMigrations(LATEST_VERSION)).toEqual([]);
  });

  test('runMigrateSchemaVersion --help short-circuits before touching the engine', async () => {
    let touched = false;
    const engine = {
      async initSchema() { touched = true; },
      async getConfig() { touched = true; return null; },
      async setConfig() { touched = true; },
    } as unknown as BrainEngine;

    const logs: string[] = [];
    const originalLog = console.log;
    console.log = (...args: unknown[]) => {
      logs.push(args.map((arg) => String(arg)).join(' '));
    };

    try {
      await runMigrateSchemaVersion(engine, ['--help']);
    } finally {
      console.log = originalLog;
    }

    expect(touched).toBe(false);
    expect(logs.join('\n')).toContain('Usage: gbrain migrate-schema-version');
  });
});
