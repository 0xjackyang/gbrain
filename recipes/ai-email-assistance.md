---
id: ai-email-assistance
name: AI Email Assistance
version: 0.1.0
description: Board-style inbox briefing and optional low-risk inbox actions built on top of Email-to-Brain.
category: reflex
requires: [email-to-brain]
secrets:
  - name: AI_EMAIL_ASSISTANCE_MODE
    description: Operating mode for the reflex (briefing-only, suggest-actions, or write-mode)
    where: Set this in your shell, cron, or local runtime env after Email-to-Brain is healthy
health_checks:
  - type: env_exists
    name: AI_EMAIL_ASSISTANCE_MODE
    label: "Reflex mode"
setup_time: 15 min
cost_estimate: "$0"
---

# AI Email Assistance: The Reflex That Runs After Email-to-Brain

This recipe is the **reflex** companion to [Email-to-Brain](email-to-brain.md).
It does not collect Gmail mechanically. It reads the inbox in the context of the
brain, briefs the user, recommends actions, and can optionally perform a bounded
set of low-risk mailbox actions.

## IMPORTANT: Instructions for the Agent

**You are the installer.** Follow these steps precisely.

**Boundary first:**
- **Email-to-Brain** is the **sense**. It collects Gmail data deterministically,
  produces reliable links and timestamps, and feeds brain enrichment.
- **AI Email Assistance** is the **reflex**. It reads the current inbox plus the
  fresh brain context produced by the sense, then decides how to brief or act.

Do **not** merge both roles into one runtime. The reflex should run **after** the
sense succeeds, not instead of it.

## What this recipe does

- Reads the current inbox with brain context already available
- Produces a board-style briefing for the user
- Classifies threads into keep / archive / review
- Optionally performs low-risk inbox actions in **write mode**
- Surfaces decisions and reasons so the user can audit the reflex

## What this recipe does not do

- Pull Gmail mechanically with pagination and deduplication
- Generate Gmail links in the first place
- Replace the deterministic collector
- Perform historical ingest or backfill by itself
- Own the canonical truth of what email has been ingested

## Architecture

```
Gmail
  ↓
Email-to-Brain (sense)
  ├── deterministic collection
  ├── digest artifacts
  └── brain enrichment
  ↓
AI Email Assistance (reflex)
  ├── board-style inbox briefing
  ├── keep / archive / review decisions
  └── optional low-risk mailbox mutation
```

The reflex depends on the sense because briefing quality is much higher when the
brain already knows who the people and companies are.

## Prerequisites

1. **Email-to-Brain is already installed** and producing fresh outputs
2. **GBrain is installed and configured** (`gbrain doctor` passes)
3. The user has decided whether the reflex is:
   - **briefing-only** (default)
   - **suggest-actions** (still no mailbox mutation)
   - **write-mode** (bounded archive / restore actions allowed)

## Setup Flow

### Step 1: Verify the sense is already healthy

Before installing this reflex, confirm Email-to-Brain is working.

Check:
- `gbrain integrations status email-to-brain`
- a recent digest exists
- the latest Email-to-Brain run produced usable Gmail links

**STOP if Email-to-Brain is not healthy.** This reflex is downstream of the
sense and should not be used as a substitute collector.

### Step 2: Ask the user which operating mode they want

Tell the user:

"AI Email Assistance can run in three modes:
1. **briefing-only** — read inbox, brief me, do not mutate Gmail
2. **suggest-actions** — add explicit keep / archive / review recommendations, still no mutation
3. **write-mode** — perform bounded low-risk actions automatically after briefing

My recommendation: start with **briefing-only**, then move to **suggest-actions**,
then enable **write-mode** only after you trust the reflex."

Record that choice in the environment as:

```bash
export AI_EMAIL_ASSISTANCE_MODE=briefing-only
```

Replace `briefing-only` with `suggest-actions` or `write-mode` only when the
user explicitly wants that behavior. The recipe should not count as configured
until this operating mode is set.

### Step 3: Define the risk policy

Document the initial policy in plain language. Defaults:
- always keep explicit asks, signatures, and ambiguous executive threads for review
- only auto-archive obvious low-risk noise in write mode
- never let the reflex become the system of record for what was ingested
- historical ingest remains owned by Email-to-Brain

### Step 4: Wire the reflex to run after the sense

Run order:
1. Email-to-Brain succeeds
2. AI Email Assistance reads the fresh digest + brain context
3. AI Email Assistance emits a briefing
4. Optional write mode runs only after the briefing policy is established

Do not schedule the reflex before the sense.

### Step 5: Smoke test in dry-run first

The first magical moment should be:
- the user gets a clean board-style briefing
- no Gmail mutation happens
- every recommendation has a reason

Only after that should the user consider suggest-actions or write mode.

## Opinionated Defaults

- **Default mode:** briefing-only
- **Default delivery:** one compact digest, not a flood of thread-by-thread spam
- **Default write posture:** off
- **Recommended sequence:** credential-gateway → email-to-brain → ai-email-assistance

## Pitfalls

1. **Do not blur sense and reflex.** If the reflex starts owning collection,
   pagination, deduplication, or ingest truth, the architecture is wrong.
2. **Do not enable write mode first.** Start dry-run.
3. **Do not let inbox actioning redefine historical ingest coverage.** Historical
   coverage remains an Email-to-Brain concern.
4. **Do not hide reasoning.** The user should be able to audit why a thread was
   kept, archived, or flagged.

## Troubleshooting

**Briefing is weak or context-poor:**
- Check Email-to-Brain ran first
- Check entity enrichment exists in the brain
- Check the reflex is reading current inbox state, not stale artifacts only

**Too many false archive suggestions:**
- Move back to briefing-only or suggest-actions mode
- Tighten low-risk policy before enabling write mode again

**User wants historical email coverage:**
- Do not solve that here. Run Email-to-Brain historical ingest first, then let the
  reflex operate on the current inbox.
