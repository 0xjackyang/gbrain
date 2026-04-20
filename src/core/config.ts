import { readFileSync, writeFileSync, mkdirSync, chmodSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import type { EngineConfig } from './types.ts';

// Lazy-evaluated to avoid calling homedir() at module scope (breaks in serverless/bundled environments)
function getConfigDir() { return join(homedir(), '.gbrain'); }
function getConfigPath() { return join(getConfigDir(), 'config.json'); }

export const POSTGRES_DATABASE_URL_CAUSE =
  'Postgres engine selected but GBRAIN_DATABASE_URL/DATABASE_URL is not set';
export const POSTGRES_DATABASE_URL_FIX =
  'Export GBRAIN_DATABASE_URL=postgresql://... (or DATABASE_URL=...) and rerun. ~/.gbrain/config.json stores only {"engine":"postgres"} for Postgres brains.';

export interface GBrainConfig {
  engine: 'postgres' | 'pglite';
  database_url?: string;
  database_path?: string;
  openai_api_key?: string;
  anthropic_api_key?: string;
}

function getEnvDatabaseUrl(): string | undefined {
  return process.env.GBRAIN_DATABASE_URL || process.env.DATABASE_URL || undefined;
}

function sanitizeLoadedConfig(fileConfig: GBrainConfig | null): GBrainConfig | null {
  const dbUrl = getEnvDatabaseUrl();
  if (!fileConfig && !dbUrl) return null;

  // Infer engine type if not explicitly set
  const inferredEngine: 'postgres' | 'pglite' = fileConfig?.engine
    || (fileConfig?.database_path ? 'pglite' : 'postgres');

  const merged: GBrainConfig & Record<string, unknown> = {
    ...(fileConfig || {}),
    engine: inferredEngine,
    ...(process.env.OPENAI_API_KEY ? { openai_api_key: process.env.OPENAI_API_KEY } : {}),
  };

  if (inferredEngine === 'postgres') {
    // Postgres URLs are env-authoritative. Ignore any stale on-disk database_url so
    // unsourced CLIs fail clearly instead of silently targeting the wrong database.
    delete merged.database_path;
    delete merged.database_url;
    if (dbUrl) merged.database_url = dbUrl;
  } else {
    delete merged.database_url;
  }

  return merged as GBrainConfig;
}

function sanitizePersistedConfig(config: GBrainConfig): GBrainConfig {
  const persisted: GBrainConfig & Record<string, unknown> = {
    ...(config as GBrainConfig & Record<string, unknown>),
  };

  if (persisted.engine === 'postgres') {
    delete persisted.database_url;
    delete persisted.database_path;
  } else {
    delete persisted.database_url;
  }

  return persisted as GBrainConfig;
}

/**
 * Load config with credential precedence: env vars > config file.
 * Plugin config is handled by the plugin runtime injecting env vars.
 */
export function loadConfig(): GBrainConfig | null {
  let fileConfig: GBrainConfig | null = null;
  try {
    const raw = readFileSync(getConfigPath(), 'utf-8');
    fileConfig = JSON.parse(raw) as GBrainConfig;
  } catch { /* no config file */ }

  return sanitizeLoadedConfig(fileConfig);
}

export function saveConfig(config: GBrainConfig): void {
  mkdirSync(getConfigDir(), { recursive: true });
  const persisted = sanitizePersistedConfig(config);
  writeFileSync(getConfigPath(), JSON.stringify(persisted, null, 2) + '\n', { mode: 0o600 });
  try {
    chmodSync(getConfigPath(), 0o600);
  } catch {
    // chmod may fail on some platforms
  }
}

export function toEngineConfig(config: GBrainConfig): EngineConfig {
  return {
    engine: config.engine,
    ...(config.database_url ? { database_url: config.database_url } : {}),
    ...(config.database_path ? { database_path: config.database_path } : {}),
  };
}

export function configDir(): string {
  return join(homedir(), '.gbrain');
}

export function configPath(): string {
  return join(configDir(), 'config.json');
}
