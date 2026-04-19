# Reliability repair reference (upstream v0.12.2)

If you ran v0.12.0 on real Postgres or Supabase, two bugs may have corrupted
data already in your brain. v0.12.1 fixed the code going forward.
This fork backport adds `gbrain doctor` detection, future-write hardening,
and the operator-run `gbrain repair-jsonb [--dry-run] [--json]` command.
PGLite users are not affected.

## What got corrupted

**JSONB double-encode.** Four primary write sites used
`${JSON.stringify(x)}::jsonb` with postgres.js, which stored a JSONB
*string literal* instead of an object. `frontmatter ->> 'key'` returns NULL;
GIN indexes are ineffective. Primary affected columns: `pages.frontmatter`,
`raw_data.data`, `ingest_log.pages_updated`, `files.metadata`. On this fork,
the operator repair also rewrites mirrored `page_versions.frontmatter`, so the
repair target set is five columns total.

**Markdown body truncation.** `splitBody()` treated `---` horizontal rules
as a body/timeline delimiter, dropping everything after the first rule.
Wiki-style pages with multiple `##`/`###` sections lost the bulk of their
content at import time.

## Detect

```
gbrain doctor
```

Reports two new checks:

- `jsonb_integrity` — counts double-encoded rows per table and points you
  at `gbrain repair-jsonb`.
- `markdown_body_completeness` — heuristic for pages whose `compiled_truth`
  is suspiciously short compared to `raw_data.data ->> 'content'`.

## Repair

For JSONB (mechanically fixable):

```bash
gbrain repair-jsonb --dry-run --json
# inspect counts, then run without --dry-run when authorized
gbrain repair-jsonb --json
```

Upstream runs `UPDATE <table> SET <col> = (<col>#>>'{}')::jsonb WHERE jsonb_typeof(<col>) = 'string'`
across every affected column. Idempotent. This fork now ships the command as an
explicit operator action; it is intentionally command-only here rather than an
auto-run post-upgrade migration.

For truncated markdown bodies (source-dependent):

```
gbrain sync --force
# or per-page
gbrain import <slug> --force
```

v0.12.2 cannot recover content that was already lost if you no longer have
the source markdown file. `gbrain doctor` tells you which pages look short;
you decide whether to re-import from source or accept the truncation.

## Verify

```
gbrain doctor
gbrain repair-jsonb --dry-run --json
```

`gbrain doctor` should report `jsonb_integrity` as OK, and
`gbrain repair-jsonb --dry-run --json` should show zero rows across all five
repair targets. `markdown_body_completeness` should match your expectations for
the corpus.
