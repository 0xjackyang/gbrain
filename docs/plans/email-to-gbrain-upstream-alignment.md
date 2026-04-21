# Email-to-GBrain Upstream Alignment Plan

## Purpose

Align the email integration contract with GBrain's intended architecture:

- **Email-to-Brain / Email-to-GBrain** = the **sense**
- **AI Email Assistance** = the **reflex** that runs after the sense

This document is the repo-side planning artifact for the contract split. It does
**not** claim the live runtime refactor or cron cutover is already complete.

## Why the split is necessary

The local Electrum implementation currently overloads one runtime with two jobs:

1. deterministic Gmail collection and brain ingestion
2. inbox briefing, keep/archive/review decisions, and optional mailbox mutation

That breaks the boundary described in GBrain's integration docs:

- **senses** get data in
- **reflexes** act on patterns after the data is already reliable

## Target architecture

```text
Gmail
  ↓
Email-to-Brain (sense)
  ├── deterministic collection
  ├── digest artifacts
  ├── reliable Gmail links
  ├── enrichment into brain pages
  └── optional historical ingest
  ↓
AI Email Assistance (reflex)
  ├── board-style inbox briefing
  ├── keep / archive / review decisions
  └── optional bounded mailbox mutation
```

## Boundary rules

### Email-to-Brain owns
- Gmail collection
- pagination and deduplication
- Gmail link generation
- deterministic noise / signature detection
- digest generation
- source packet creation
- brain enrichment
- historical ingest / backfill semantics

### AI Email Assistance owns
- inbox briefing
- keep / archive / review decisions
- mailbox mutation in bounded write mode
- restore / audit of inbox actions

### Explicit non-goals for the sense
- not the inbox assistant
- not the keep/archive policy engine
- not the source of truth for executive actioning

## Packet sequence

### Packet 1 — repo contract split (this packet)
Scope:
- `recipes/email-to-brain.md`
- `recipes/ai-email-assistance.md`
- `docs/integrations/README.md`
- `README.md`
- `test/integrations.test.ts`
- this plan doc

Definition of done:
- the repo clearly describes the sense/reflex split
- the new reflex recipe parses and is discoverable
- docs no longer imply inbox cleanup belongs inside Email-to-Brain

### Packet 2 — shadow core sense runtime
Create a shadow runtime at `~/.gbrain/integrations/email-to-brain-v2/`.

Definition of done:
- daily core flow is collect + digest + enrich only
- no mailbox mutation in the sense
- auth/config truth is cleaned up

### Packet 3 — shadow enrichment stage
Add a first-class enrichment stage to the shadow sense runtime.

Definition of done:
- sender/company updates and timeline entries can be written with provenance

### Packet 4 — shadow historical realignment
Realign historical ingest so coverage is about brain-ingest outcomes, not inbox state.

Definition of done:
- history coverage no longer depends on `active_inbox`

### Packet 5 — shadow AI email assistance runtime
Create a shadow runtime at `~/.gbrain/integrations/ai-email-assistance/`.

Definition of done:
- assistant runs as a dry-run reflex first
- assistant owns keep/archive/review behavior

### Packet 6 — cron cutover
Cut over only after shadow sense + shadow reflex both prove out.

Definition of done:
- sense runs first
- assistant runs second
- rollback is pausing new jobs and resuming the old ones

## Cron migration rule

The old overloaded daily job must not be replaced until the shadow split is
proven. The final sequencing should be:

1. Email-to-Brain daily sense
2. AI Email Assistance daily reflex
3. historical ingest on its own cadence

## Rollback rule

If the split regresses behavior:

1. pause the new split jobs
2. resume the old overloaded jobs
3. keep the shadow runtimes for investigation only

## What this packet proves

This packet proves only that the **repo contract** is now aligned with the
intended architecture.

It does **not** prove:
- the live runtime has been refactored
- the assistant has been split in production
- the cron cutover has happened
- mailbox mutation behavior has changed safely
