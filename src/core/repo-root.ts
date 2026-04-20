import { existsSync } from 'fs';
import { join } from 'path';

/**
 * Walk up from `startDir` looking for `skills/RESOLVER.md` — the marker of a
 * gbrain repo root. Returns the absolute directory containing `skills/` or
 * null if no such directory is found within 10 levels.
 *
 * `startDir` is parameterized so tests can run hermetically against fixtures.
 * Default matches the prior `doctor.ts`-private implementation.
 */
export function findRepoRoot(startDir: string = process.cwd()): string | null {
  let dir = startDir;
  for (let i = 0; i < 10; i++) {
    if (existsSync(join(dir, 'skills', 'RESOLVER.md'))) return dir;
    const parent = join(dir, '..');
    if (parent === dir) break;
    dir = parent;
  }
  // Fork fallback (from 0781a18): for bundled installs (e.g. bun-link from
  // ~/gbrain), cwd may not be inside the repo. Fall back to the binary's
  // own installation tree.
  try {
    const { fileURLToPath } = require('url');
    const { dirname } = require('path');
    const bundledRoot = dirname(dirname(fileURLToPath(import.meta.url)));
    if (existsSync(join(bundledRoot, 'skills', 'RESOLVER.md'))) return bundledRoot;
  } catch {}
  return null;
}
