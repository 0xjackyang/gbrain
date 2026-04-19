import { describe, expect, mock, test } from 'bun:test';
import type { BrainEngine } from '../src/core/engine.ts';

let gitResponses = new Map<string, string>();

function responseKey(repoPath: string, args: string[]): string {
  return JSON.stringify([repoPath, args]);
}

function setGitResponse(repoPath: string, args: string[], output: string) {
  gitResponses.set(responseKey(repoPath, args), output);
}

mock.module('child_process', () => ({
  execFileSync: (_command: string, argv: string[]) => {
    const repoPath = argv[1];
    const args = argv.slice(2);
    const key = responseKey(repoPath, args);
    if (!gitResponses.has(key)) {
      throw new Error(`Missing git mock for ${key}`);
    }
    return gitResponses.get(key)!;
  },
}));

const {
  adoptLegacySyncState,
  getSyncStatus,
  resolveRepoSyncIdentity,
  scopedSyncKey,
} = await import('../src/core/sync-state.ts');

function mockEngine(seed: Record<string, string> = {}): BrainEngine & { _store: Map<string, string> } {
  const store = new Map(Object.entries(seed));
  return {
    _store: store,
    async getConfig(key: string) {
      return store.get(key) ?? null;
    },
    async setConfig(key: string, value: string) {
      store.set(key, value);
    },
  } as unknown as BrainEngine & { _store: Map<string, string> };
}

describe('repo-scoped sync state', () => {
  test('repo identity distinguishes linked worktrees of the same repo', () => {
    gitResponses = new Map();
    setGitResponse('/repo/main', ['rev-parse', '--show-toplevel'], '/repo/main\n');
    setGitResponse('/repo/main', ['rev-parse', '--git-common-dir'], '/repo/common/.git\n');
    setGitResponse('/repo/main', ['rev-parse', '--git-dir'], '/repo/common/.git\n');
    setGitResponse('/repo/main', ['config', '--get', 'remote.origin.url'], 'https://example.com/repo.git\n');

    setGitResponse('/repo/worktree', ['rev-parse', '--show-toplevel'], '/repo/worktree\n');
    setGitResponse('/repo/worktree', ['rev-parse', '--git-common-dir'], '/repo/common/.git\n');
    setGitResponse('/repo/worktree', ['rev-parse', '--git-dir'], '/repo/common/.git/worktrees/alpha\n');
    setGitResponse('/repo/worktree', ['config', '--get', 'remote.origin.url'], 'https://example.com/repo.git\n');

    const mainIdentity = resolveRepoSyncIdentity('/repo/main');
    const worktreeIdentity = resolveRepoSyncIdentity('/repo/worktree');

    expect(mainIdentity.repoFamily).toBe(worktreeIdentity.repoFamily);
    expect(mainIdentity.worktreeSlot).toBe('main');
    expect(worktreeIdentity.worktreeSlot).toBe('worktrees/alpha');
    expect(mainIdentity.repoKey).not.toBe(worktreeIdentity.repoKey);
  });


  test('repo identity distinguishes separate clones of the same remote', () => {
    gitResponses = new Map();
    setGitResponse('/repo/clone-a', ['rev-parse', '--show-toplevel'], '/repo/clone-a\n');
    setGitResponse('/repo/clone-a', ['rev-parse', '--git-common-dir'], '/repo/clone-a/.git\n');
    setGitResponse('/repo/clone-a', ['rev-parse', '--git-dir'], '/repo/clone-a/.git\n');
    setGitResponse('/repo/clone-a', ['config', '--get', 'remote.origin.url'], 'https://example.com/shared.git\n');

    setGitResponse('/repo/clone-b', ['rev-parse', '--show-toplevel'], '/repo/clone-b\n');
    setGitResponse('/repo/clone-b', ['rev-parse', '--git-common-dir'], '/repo/clone-b/.git\n');
    setGitResponse('/repo/clone-b', ['rev-parse', '--git-dir'], '/repo/clone-b/.git\n');
    setGitResponse('/repo/clone-b', ['config', '--get', 'remote.origin.url'], 'https://example.com/shared.git\n');

    const cloneA = resolveRepoSyncIdentity('/repo/clone-a');
    const cloneB = resolveRepoSyncIdentity('/repo/clone-b');

    expect(cloneA.worktreeSlot).toBe('main');
    expect(cloneB.worktreeSlot).toBe('main');
    expect(cloneA.repoFamily).not.toBe(cloneB.repoFamily);
    expect(cloneA.repoKey).not.toBe(cloneB.repoKey);
  });

  test('adoptLegacySyncState promotes a valid legacy anchor into scoped keys', async () => {
    gitResponses = new Map();
    setGitResponse('/repo/legacy', ['rev-parse', '--show-toplevel'], '/repo/legacy\n');
    setGitResponse('/repo/legacy', ['rev-parse', '--git-common-dir'], '/repo/legacy/.git\n');
    setGitResponse('/repo/legacy', ['rev-parse', '--git-dir'], '/repo/legacy/.git\n');
    setGitResponse('/repo/legacy', ['config', '--get', 'remote.origin.url'], 'https://example.com/legacy.git\n');
    setGitResponse('/repo/legacy', ['cat-file', '-t', 'abc123'], 'commit\n');
    setGitResponse('/repo/legacy', ['merge-base', '--is-ancestor', 'abc123', 'head789'], '');

    const identity = resolveRepoSyncIdentity('/repo/legacy');
    const engine = mockEngine({
      'sync.last_commit': 'abc123',
      'sync.last_run': '2026-04-19T00:00:00.000Z',
      'sync.repo_path': '/repo/legacy',
    });

    const adopted = await adoptLegacySyncState(engine, identity, 'head789');

    expect(adopted?.lastCommit).toBe('abc123');
    expect(engine._store.get(scopedSyncKey(identity.repoKey, 'last_commit'))).toBe('abc123');
    expect(engine._store.get(scopedSyncKey(identity.repoKey, 'last_run'))).toBe('2026-04-19T00:00:00.000Z');
    expect(engine._store.get('sync.repo_path')).toBe(identity.repoPath);
  });


  test('getSyncStatus ignores a legacy anchor from another clone of the same remote', async () => {
    gitResponses = new Map();
    setGitResponse('/repo/clone-a', ['rev-parse', '--show-toplevel'], '/repo/clone-a\n');
    setGitResponse('/repo/clone-a', ['rev-parse', '--git-common-dir'], '/repo/clone-a/.git\n');
    setGitResponse('/repo/clone-a', ['rev-parse', '--git-dir'], '/repo/clone-a/.git\n');
    setGitResponse('/repo/clone-a', ['config', '--get', 'remote.origin.url'], 'https://example.com/shared.git\n');

    setGitResponse('/repo/clone-b', ['rev-parse', '--show-toplevel'], '/repo/clone-b\n');
    setGitResponse('/repo/clone-b', ['rev-parse', '--git-common-dir'], '/repo/clone-b/.git\n');
    setGitResponse('/repo/clone-b', ['rev-parse', '--git-dir'], '/repo/clone-b/.git\n');
    setGitResponse('/repo/clone-b', ['config', '--get', 'remote.origin.url'], 'https://example.com/shared.git\n');
    setGitResponse('/repo/clone-b', ['rev-parse', 'HEAD'], 'head789\n');
    setGitResponse('/repo/clone-b', ['cat-file', '-t', 'abc123'], 'commit\n');
    setGitResponse('/repo/clone-b', ['merge-base', '--is-ancestor', 'abc123', 'head789'], '');

    const cloneB = resolveRepoSyncIdentity('/repo/clone-b');
    const engine = mockEngine({
      'sync.last_commit': 'abc123',
      'sync.last_run': '2026-04-19T01:02:03.000Z',
      'sync.repo_path': '/repo/clone-a',
    });

    const status = await getSyncStatus(engine, '/repo/clone-b');

    expect(status.source).toBe('none');
    expect(status.lastCommit).toBeNull();
    expect(status.repoPath).toBe(cloneB.repoPath);
  });

  test('getSyncStatus reports a compatible legacy anchor without mutating scoped state', async () => {
    gitResponses = new Map();
    setGitResponse('/repo/status', ['rev-parse', '--show-toplevel'], '/repo/status\n');
    setGitResponse('/repo/status', ['rev-parse', '--git-common-dir'], '/repo/status/.git\n');
    setGitResponse('/repo/status', ['rev-parse', '--git-dir'], '/repo/status/.git\n');
    setGitResponse('/repo/status', ['config', '--get', 'remote.origin.url'], 'https://example.com/status.git\n');
    setGitResponse('/repo/status', ['rev-parse', 'HEAD'], 'head789\n');
    setGitResponse('/repo/status', ['cat-file', '-t', 'abc123'], 'commit\n');
    setGitResponse('/repo/status', ['merge-base', '--is-ancestor', 'abc123', 'head789'], '');

    const identity = resolveRepoSyncIdentity('/repo/status');
    const engine = mockEngine({
      'sync.last_commit': 'abc123',
      'sync.last_run': '2026-04-19T01:02:03.000Z',
      'sync.repo_path': '/repo/status',
    });

    const status = await getSyncStatus(engine, '/repo/status');

    expect(status.source).toBe('legacy');
    expect(status.lastCommit).toBe('abc123');
    expect(status.lastRun).toBe('2026-04-19T01:02:03.000Z');
    expect(status.repoPath).toBe(identity.repoPath);
    expect(engine._store.has(scopedSyncKey(identity.repoKey, 'last_commit'))).toBe(false);
  });
});
