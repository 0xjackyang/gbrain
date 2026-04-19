  buildSyncManifest,
  isSyncable,
  pathToSlug,
  recordSyncFailures,
  unacknowledgedSyncFailures,
  acknowledgeSyncFailures,
} from '../core/sync.ts';
  adoptLegacySyncState,
  getDefaultSyncRepoPath,
  getScopedSyncState,
  getSyncStatus,
  resolveRepoSyncIdentity,
  saveRepoSyncState,
  type RepoSyncIdentity,
  type RepoSyncStatus,
} from '../core/sync-state.ts';
import { buildSyncManifest, isSyncable, pathToSlug } from '../core/sync.ts';
  const repoPath = opts.repoPath || await readSyncAnchor(engine, opts.sourceId, 'repo_path');
  if (!repoPath) {
    const hint = opts.sourceId
      ? `Source "${opts.sourceId}" has no local_path. Run: gbrain sources add ${opts.sourceId} --path <path>`
      : `No repo path specified. Use --repo or run gbrain init with --repo first.`;
    throw new Error(hint);
  // Read sync state
  let syncState = opts.full ? null : await getScopedSyncState(engine, identity);
  if (!opts.full && !syncState?.lastCommit) {
    syncState = await adoptLegacySyncState(engine, identity, headCommit) || syncState;
  }
  const lastCommit = opts.full ? null : syncState?.lastCommit || null;
    await saveRepoSyncState(engine, identity, { lastCommit: headCommit });
  // Bug 9 — gate the sync bookmark on success. If any per-file parse
  // failed, record it to ~/.gbrain/sync-failures.jsonl and DO NOT advance
  // sync.last_commit. The next sync re-walks the same diff and re-attempts
  // the failed files. Escape hatches: --skip-failed acknowledges the
  // current set, --retry-failed re-parses before running the normal sync.
  if (failedFiles.length > 0) {
    recordSyncFailures(failedFiles, headCommit);
    if (!opts.skipFailed) {
      console.error(
        `\nSync blocked: ${failedFiles.length} file(s) failed to parse. ` +
        `Fix the YAML frontmatter in the files above and re-run, or use ` +
        `'gbrain sync --skip-failed' to acknowledge and move on.`,
      );
      // Update last_run + repo_path (progress on infra) but NOT last_commit.
      // Legacy keys only — scoped last_commit stays pinned to previous value.
      await engine.setConfig('sync.last_run', new Date().toISOString());
      await engine.setConfig('sync.repo_path', identity.repoPath);
      return {
        status: 'blocked_by_failures',
        fromCommit: lastCommit,
        toCommit: headCommit,
        added: filtered.added.length,
        modified: filtered.modified.length,
        deleted: filtered.deleted.length,
        renamed: filtered.renamed.length,
        chunksCreated,
        embedded: 0,
        pagesAffected,
        failedFiles: failedFiles.length,
      };
    }
    // --skip-failed: acknowledge the now-recorded set and proceed.
    const acked = acknowledgeSyncFailures();
    if (acked > 0) {
      console.error(`  Acknowledged ${acked} failure(s) and advancing past them.`);
    }
  }

  // Update sync state AFTER all changes succeed. Use saveRepoSyncState:
  // writes scoped keys (sync.state.<hash>.*) + shadow-writes legacy keys.
  await saveRepoSyncState(engine, identity, { lastCommit: headCommit });
  // Dry-run: walk the repo, count syncable files, return without writing.
  // Fixes the silent-write-on-dry-run bug where performFullSync called
  // runImport unconditionally regardless of opts.dryRun.
  if (opts.dryRun) {
    const { collectMarkdownFiles } = await import('./import.ts');
    const allFiles = collectMarkdownFiles(identity.repoPath);
    const syncableRelPaths = allFiles
      .map(abs => relative(repoPath, abs))
      .filter(rel => isSyncable(rel));
    console.log(
      `Full-sync dry run: ${syncableRelPaths.length} file(s) would be imported ` +
      `from ${identity.repoPath} @ ${headCommit.slice(0, 8)}.`,
    );
    return {
      status: 'dry_run',
      fromCommit: null,
      toCommit: headCommit,
      added: syncableRelPaths.length,
      modified: 0,
      deleted: 0,
      renamed: 0,
      chunksCreated: 0,
      embedded: 0,
      pagesAffected: [],
    };
  }

  console.log(`Running full import of ${repoPath}...`);
  console.log(`Running full import of ${identity.repoPath}...`);
  // Bug 9 — gate the full-sync bookmark on success. runImport already
  // writes its own sync.last_commit conditionally (import.ts), but
  // performFullSync is called on first-sync + force-full paths where
  // the sync module owns the last_commit write. Respect the same gate.
  if (result.failures.length > 0) {
    recordSyncFailures(result.failures, headCommit);
    if (!opts.skipFailed) {
      console.error(
        `\nFull sync blocked: ${result.failures.length} file(s) failed. ` +
        `Fix the YAML in those files and re-run, or use '--skip-failed'.`,
      );
      await engine.setConfig('sync.last_run', new Date().toISOString());
      await engine.setConfig('sync.repo_path', identity.repoPath);
      return {
        status: 'blocked_by_failures',
        fromCommit: null,
        toCommit: headCommit,
        added: 0, modified: 0, deleted: 0, renamed: 0,
        chunksCreated: result.chunksCreated,
        embedded: 0,
        pagesAffected: [],
        failedFiles: result.failures.length,
      };
    }
    const acked = acknowledgeSyncFailures();
    if (acked > 0) console.error(`  Acknowledged ${acked} failure(s) and advancing past them.`);
  }

  // Persist sync state so next sync is incremental.
  // Use saveRepoSyncState: writes scoped + legacy keys in one atomic step.
  await saveRepoSyncState(engine, identity, { lastCommit: headCommit });
  // v0.18.0 Step 5: --source resolves to a sources(id) row. Falls back
  // to pre-v0.17 global config (sync.repo_path + sync.last_commit) when
  // no flag, no env, no dotfile is present.
  const explicitSource = args.find((a, i) => args[i - 1] === '--source') || null;
  let sourceId: string | undefined = undefined;
  if (explicitSource || process.env.GBRAIN_SOURCE) {
    const { resolveSourceId } = await import('../core/source-resolver.ts');
    sourceId = await resolveSourceId(engine, explicitSource);
  }

  const opts: SyncOpts = { repoPath, dryRun, full, noPull, noEmbed, skipFailed, retryFailed, sourceId };

  // Bug 9 — --retry-failed: before running normal sync, clear acknowledgment
  // flags so the sync picks them up as fresh work. The actual re-attempt
  // happens inside the regular incremental/full loop because once the commit
  // pointer is behind the failures, the diff naturally revisits them.
  if (retryFailed) {
    const failures = unacknowledgedSyncFailures();
    if (failures.length === 0) {
      console.log('No unacknowledged sync failures to retry.');
    } else {
      console.log(`Retrying ${failures.length} previously-failed file(s)...`);
      // Don't acknowledge them yet — they must succeed to clear.
    }
  }

  if (!watch) {
    const result = await performSync(engine, opts);
    printSyncResult(result);
    return;
  }

  // Watch mode
  let consecutiveErrors = 0;
  console.log(`Watching for changes every ${interval}s... (Ctrl+C to stop)`);

  while (true) {
    try {
      const result = await performSync(engine, { ...opts, full: false });
      consecutiveErrors = 0;
      if (result.status === 'synced') {
        const ts = new Date().toISOString().slice(11, 19);
        console.log(`[${ts}] Synced: +${result.added} ~${result.modified} -${result.deleted} R${result.renamed}`);
      }
    } catch (e: unknown) {
      consecutiveErrors++;
      const msg = e instanceof Error ? e.message : String(e);
      console.error(`[${new Date().toISOString().slice(11, 19)}] Sync error (${consecutiveErrors}/5): ${msg}`);
      if (consecutiveErrors >= 5) {
        console.error(`5 consecutive sync failures. Stopping watch.`);
        process.exit(1);
      }
    }
    await new Promise(r => setTimeout(r, interval * 1000));
  }
}

function printSyncStatus(status: RepoSyncStatus, jsonMode: boolean) {
  if (jsonMode) {
    console.log(JSON.stringify(status, null, 2));
    return;
  }

  console.log(`Sync status for ${status.repoPath}:`);
  console.log(`  Worktree slot: ${status.worktreeSlot}`);
  console.log(`  Source: ${status.source}`);
  console.log(`  Last sync: ${status.lastRun || 'never'}`);
  console.log(`  Last commit: ${status.lastCommit ? status.lastCommit.slice(0, 8) : 'none'}`);
  console.log(`  Default repo: ${status.defaultRepoPath === status.repoPath ? 'yes' : 'no'}`);
}

function printSyncResult(result: SyncResult) {
  switch (result.status) {
    case 'up_to_date':
      console.log('Already up to date.');
      break;
    case 'synced':
      console.log(`Synced ${result.fromCommit?.slice(0, 8)}..${result.toCommit.slice(0, 8)}:`);
      console.log(`  +${result.added} added, ~${result.modified} modified, -${result.deleted} deleted, R${result.renamed} renamed`);
      console.log(`  ${result.chunksCreated} chunks created${result.embedded > 0 ? `, ${result.embedded} pages embedded` : ''}`);
      break;
    case 'first_sync':
      console.log(`First sync complete. Checkpoint: ${result.toCommit.slice(0, 8)}`);
      console.log(`  ${result.added} file(s) imported, ${result.chunksCreated} chunks${result.embedded > 0 ? `, ${result.embedded} pages embedded` : ''}`);
      break;
    case 'dry_run':
      break; // already printed in performSync
    case 'blocked_by_failures':
      console.log(`Sync BLOCKED at ${result.toCommit.slice(0, 8)}: ${result.failedFiles ?? 0} file(s) failed to parse.`);
      console.log(`  See ~/.gbrain/sync-failures.jsonl for details, or run 'gbrain doctor'.`);
      console.log(`  Fix the files then re-run 'gbrain sync', or 'gbrain sync --skip-failed' to move on.`);
      break;
  }
}
