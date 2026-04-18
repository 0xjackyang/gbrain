import { describe, test, expect, mock, beforeEach, afterEach } from 'bun:test';
import type { BrainEngine } from '../src/core/engine.ts';

const syncResult = {
  status: 'first_sync',
  fromCommit: null,
  toCommit: 'abc12345',
  added: 0,
  modified: 0,
  deleted: 0,
  renamed: 0,
  chunksCreated: 0,
  pagesAffected: [],
};

let performSyncImpl = async () => syncResult;

mock.module('../src/commands/sync.ts', () => ({
  performSync: (...args: any[]) => performSyncImpl(...args),
}));

const { operations } = await import('../src/core/operations.ts');
const syncBrain = operations.find(op => op.name === 'sync_brain');
if (!syncBrain) throw new Error('sync_brain operation not found');

function makeCtx() {
  return {
    engine: {} as BrainEngine,
    config: { engine: 'postgres' as const },
    logger: {
      info: () => {},
      warn: () => {},
      error: () => {},
    },
    dryRun: false,
  };
}

describe('sync_brain stdout hygiene', () => {
  let writes: string[] = [];
  let originalWrite: typeof process.stdout.write;

  beforeEach(() => {
    writes = [];
    originalWrite = process.stdout.write.bind(process.stdout) as typeof process.stdout.write;
    process.stdout.write = ((chunk: any) => {
      writes.push(typeof chunk === 'string' ? chunk : Buffer.from(chunk).toString('utf-8'));
      return true;
    }) as typeof process.stdout.write;
  });

  afterEach(() => {
    process.stdout.write = originalWrite;
  });

  test('suppresses nested stdout chatter during MCP sync', async () => {
    performSyncImpl = async () => {
      console.log('Running full import...');
      process.stdout.write('\r  1/887 pages, 0 chunks embedded');
      return syncResult;
    };

    const result = await syncBrain.handler(makeCtx(), {
      repo: '/tmp/brain',
      no_pull: true,
      no_embed: false,
      full: true,
    });

    expect(result).toEqual(syncResult);
    expect(writes.some(w => w.includes('Running full import'))).toBe(false);
    expect(writes.some(w => w.includes('1/887 pages'))).toBe(false);

    process.stdout.write('restored-marker');
    expect(writes.at(-1)).toContain('restored-marker');
  });

  test('restores stdout after sync failure', async () => {
    performSyncImpl = async () => {
      process.stdout.write('\r contaminated progress');
      throw new Error('boom');
    };

    let thrown: unknown;
    try {
      await syncBrain.handler(makeCtx(), {});
    } catch (error) {
      thrown = error;
    }

    expect(thrown).toBeInstanceOf(Error);
    expect((thrown as Error).message).toBe('boom');
    expect(writes.some(w => w.includes('contaminated progress'))).toBe(false);

    process.stdout.write('restored-after-error');
    expect(writes.at(-1)).toContain('restored-after-error');
  });
});
