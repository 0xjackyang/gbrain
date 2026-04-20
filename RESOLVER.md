# GBrain Resolver

## Routes
- repo-local fast governance check -> `./ops/verify fast --json`
- repo-local full regression check -> `./ops/verify standard --json`
- live CLI + database health -> `./ops/verify live --json`
- schema version / migration path -> `src/core/migrate.ts`, `src/commands/migrate-schema-version.ts`, `src/commands/doctor.ts`
- engine/config/runtime boundary -> `src/core/config.ts`, `src/core/db.ts`, `src/core/postgres-engine.ts`, `src/core/pglite-engine.ts`
- CLI / MCP contract wiring -> `src/cli.ts`, `src/core/operations.ts`, `src/mcp/server.ts`
- deterministic import/search/file flows -> `src/core/import-file.ts`, `src/core/search/`, `src/commands/files.ts`

## Rules
- Read `CLAUDE.md` before deep changes; it is the architecture map for this repo.
- Treat Postgres engine, schema migration, and CLI/MCP contract changes as high-risk surfaces.
- Use isolated branches/worktrees; do not hot-edit the base checkout.
- For Spark-governed work, follow the repo-local `ops/lane-policy.yaml` plus Spark change-packet doctrine.
