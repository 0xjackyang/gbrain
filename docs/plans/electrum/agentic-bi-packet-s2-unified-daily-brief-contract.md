# Packet S2 — Unified Daily Brief Contract

Status: `review_ready`
Date: 2026-04-23
Scope: one Jack-facing daily attention object for the current Electrum bottleneck wedge; planning/spec only

## 1. Purpose and scope

Packet S2 freezes the **future unified Jack-facing daily brief contract** so the daily lane stops making Jack read multiple top-level artifacts that can compete or drift on the same day.

This packet is **planning/spec only**:
- take the approved office-hours direction as fixed input
- take Packet S1's upstream sense-lane boundary as fixed input
- freeze the exact two-page main brief contract plus appendix boundary
- freeze Page 1 as the truth page and Page 2 as the bottleneck-analysis page with no role leakage
- classify current fleet, BSS-slot, battery, and CTO daily materials as `recycle` (to Page 1 or Page 2), `appendix_only`, or `do_not_recycle`
- freeze the CTO daily brief's future daily-lane status as paused for Jack-facing daily use, with a later repurpose path noted
- stop before runtime implementation, cron mutation, report deletion, or upstream Electrum-to-brain contract change

Packet S2 is a **selective reduction packet**, not a merge-everything packet:
- the goal is one better daily attention object
- the goal is **not** to preserve every existing section by stuffing all current reports into one document

## 2. Fixed inputs and invariants

Packet S2 is valid only if it keeps all of the following fixed:
- There will be **one Jack-facing daily brief only** for this wedge after a later cutover packet.
- The approved target runtime shape is:
  - `06:30 WIB` electrum-to-brain daily sense / data collect
  - `07:30 WIB` one report only
- The current live rollback path remains unchanged in this packet:
  - `electrum-daily-board-report` at `06:30 WIB`
  - `electrum-bss-slot-daily-report` at `06:30 WIB`
  - `electrum-battery-daily-report` at `06:30 WIB`
  - `electrum-ai-cto-integrated-brief-daily` at `07:30 WIB`
- Packet S1 remains the upstream boundary for the minimum sense lane; Packet S2 does **not** widen or rewrite that source contract.
- Blank-slate default: **nothing** from the current branch reports or CTO brief is inherited automatically.
- A current section or metric earns reuse only if it materially improves one of:
  1. Page 1 truth clarity
  2. Page 2 bottleneck reasoning
  3. appendix drill-down utility
- Rendered prose from existing reports and briefs is not truth authority.
- The packet stays bounded to the current daily bottleneck wedge only.
- No runtime cutover, cron mutation, report deletion, or repo-home change happens here.

## 3. Current rollback path versus future unified target

### 3.1 Frozen downstream shape

| Lane stage | Current live state | Future unified target frozen by Packet S2 | Packet S2 rule |
| --- | --- | --- | --- |
| `06:30 WIB` | three Jack-visible branch jobs (`board`, `bss-slot`, `battery`) | one electrum-to-brain daily sense/data collect | freeze as target only; do not mutate now |
| `07:30 WIB` | one CTO integrated brief built from the report trio | one unified Jack-facing daily brief only | freeze as target only; do not mutate now |
| Branch carriers | separate top-level daily artifacts | no longer primary Jack-facing daily objects after later cutover | current branch reports remain rollback path until later packet |
| CTO daily brief | current Jack-facing integrated artifact | **paused for Jack-facing daily use** after later cutover | note later repurpose path only; do not repurpose now |

### 3.2 CTO future status frozen here

Packet S2 freezes one explicit future-status rule:

> The current CTO daily integrated brief is **paused as a Jack-facing daily artifact** in the future unified daily lane. It may later be repurposed as a compact digital-team / internal consequence-and-trust digest, but it is no longer the top-level Jack daily object once the unified brief exists.

That rule matters because Packet S2 is choosing a single daily attention object, not creating a second integrated summary that still competes with it.

## 4. Selective-reduction decision rules

Apply these rules in order. The first matching rule wins.

1. **Page 1 truth test** — If the material is compact same-day truth that makes the future Page 1 clearer without requiring long explanation, classify it `recycle` to Page 1.
2. **Page 2 reasoning test** — If the material is not a Page 1 truth row but directly sharpens the future five-step bottleneck reasoning or trust boundary, classify it `recycle` to Page 2.
3. **Appendix drill-down test** — If the material is useful only when a reviewer wants decomposition, hotspot detail, watchlists, or methodology behind a main-page claim, classify it `appendix_only`.
4. **Otherwise** — If the material mainly duplicates existing prose, delivery metadata, full YAML, broad taxonomy, or creates a second competing report inside the unified brief, classify it `do_not_recycle`.

### 4.1 Sharp rules that stay non-negotiable

- `recycle` to Page 1 must remain **numbers / truth only**.
- `recycle` to Page 2 must remain **reasoning only**; it does not become a second truth table.
- `appendix_only` is bounded supporting detail, not a hidden third main page.
- `do_not_recycle` means the future unified brief should not carry that material forward merely to preserve familiarity.

## 5. Exact unified daily brief contract

### 5.1 Exact top-level shape

The future artifact is frozen as:
- **exactly two main pages** for the Jack-facing daily read
- followed by an **appendix** for bounded branch drill-downs only

Canonical main-page order:
1. **Page 1 — Truth**
2. **Page 2 — Bottleneck analysis**
3. **Appendix — bounded branch drill-downs**

Suggested canonical heading skeleton:

```markdown
# Electrum Unified Daily Brief — YYYY-MM-DD

## Page 1 — Truth
### Context strip
### Truth scoreboard
### Truth caveats / blockers

## Page 2 — Bottleneck analysis
### 1. Integrated report snapshot
### 2. Growth stock / deployable bike question
### 3. Infra readiness for growth absorption
### 4. Efficiency / unit-economics readiness
### 5. Service-level readiness / blind spots
### Bottom line

## Appendix
### A. Bike drill-down
### B. BSS / slot drill-down
### C. Battery drill-down
```

The heading labels above may later be rendered in Google Docs, markdown, or email format, but the **content order and role boundary are frozen here**.

### 5.2 Page 1 contract — truth only

Page 1 exists to answer one question:

> What same-day truth should Jack see before any bottleneck reasoning starts?

| Page 1 block | Required contents | Why it exists | Hard not-allowed boundary |
| --- | --- | --- | --- |
| Context strip | `business_date`, `collected_at/report_at`, freshness note, and any material time-basis caveat | Freezes what day and freshness the brief refers to | No bottleneck call, no recommendation, no managerial interpretation |
| Transaction outcome block | `completed_swaps`, `miss_rate` | Keeps the lead network outcome visible before interpretation | No causal story on this page |
| Bike truth block | one compact bike readiness / deployable-bike block with: denominator, ready/deployable bikes, same-day active bikes, and one gap/rate read | Gives the raw bike-side growth-stock truth for Page 2 Step 2 | No assignment-coverage essay, no owner/operator narrative, no long bike prose |
| BSS truth block | `transacting_bss`, `active_slots`, `disabled_slots`, `enabled_not_ready_slots` | Gives the raw exchange-layer readiness truth for Page 2 Step 3 | No site tables, no bucket decompositions on main page |
| Battery truth block | future-safe main-page rows: `deployed`, health-side `in_bike`, `low_SoH`; additional carried rows only with explicit status labels from §5.2.3: `swap_active`, `in_bss`, `R2R`, `offline`, `unresolved_dark` | Preserves the intended battery-buffer / battery-quality block while keeping non-S1-settled rows visibly provisional for Page 2 Step 4 | No watchlists, no quarantine ledger tables, no recharge-loop essay, no methodology dump |
| Truth caveats / blockers strip | only compact truth caveats that materially change interpretation, including blocked service-level joins or current-snapshot caveats when applicable | Prevents Page 2 from pretending the truth surface is cleaner than it is | No action list, no escalation list, no ownership list |

#### 5.2.1 Page 1 role-freeze rules

Page 1 must stay all of the following:
- compact
- table-first
- metric-first
- provenance-aware
- free of bottleneck narrative except for minimal caveat labels

Page 1 must **not** contain:
- the daily bottleneck call
- a consequence-if-unchanged sentence
- action or escalation bullets
- owner routing
- hotspot site tables
- anomaly footers copied wholesale from current reports
- methodology prose beyond a compact caveat label when needed for truth hygiene

#### 5.2.2 Page 1 source-boundary note versus Packet S1

Page 1 freezes the desired truth rows, but not all current rows are equally upstream-settled under Packet S1.

| Page 1 truth family | Packet S1 boundary reading | Packet S2 rule |
| --- | --- | --- |
| Transaction outcome rows | already aligned with the Packet S1 transaction spine | safe as future unified main-page truth |
| BSS truth rows | already aligned with the Packet S1 BSS/slot branch (`fact_order_swaps`, `iot_bss_door_metric`, `v_bss_doors_latest`) | safe as future unified main-page truth |
| Bike truth block | future-safe only if the block is remapped to the Packet S1 `daily_vehicle` bike branch | current fleet-carried bike rows are not automatically frozen as the future upstream canon |
| Battery truth block | row-by-row split required: `deployed`, health-side `in_bike`, and `low_SoH` fit the Packet S1 battery snapshot; `swap_active` is still a carried derived row; `in_bss`, `R2R`, `offline`, and `unresolved_dark` still depend on current battery-carrier logic outside the minimum S1 set | only the S1-settled rows read as future unified main-page truth; all others must stay individually marked `rollback-carried` or `later-packet-needed` per §5.2.3 |

That rule prevents Packet S2 from falsely claiming that Packet S1 already solved every current battery or fleet support surface.

#### 5.2.3 Exact Page 1 battery row status

| Battery row | Desired future Page 1 role | Packet S1 settlement reading | Packet S2 carry rule |
| --- | --- | --- | --- |
| `deployed` | core battery-stock denominator | S1-settled via `svr_battery_health` deployed snapshot | future-safe main-page truth; carry the telemetry-covered-operational-universe caveat |
| `in_bike` | core field-stock row | S1-settled only as the health-side `IN BIKE` snapshot from `svr_battery_health` | future-safe main-page truth when rendered as the snapshot row; do not silently substitute stronger report-local proof counts |
| `low_SoH` | core battery-quality row | S1-settled via `svr_battery_health` | future-safe main-page truth |
| `swap_active` | useful flow-touch row for Step 4 when compactly rendered | still a carried derived row rather than a named Packet S1 battery snapshot fact | `rollback-carried` if shown on Page 1 until a later packet freezes the exact derivation against Packet S1 primitives |
| `in_bss` | useful rack-buffer row | not S1-settled; current board count depends on excluded `view_battery_in_bss` | `rollback-carried` if shown on Page 1; do not present as future-safe upstream truth |
| `R2R` | useful compact buffer proxy | not S1-settled; current proxy depends on excluded `v_battery_latest` plus `view_battery_in_bss` | `later-packet-needed` before it can be future-safe main-page truth |
| `offline` | optional observability qualifier | not S1-settled; current row depends on a run-time connection-status snapshot outside the minimum S1 set | `rollback-carried` only with an explicit current-snapshot caveat, or omit until a later packet freezes a same-day truth surface |
| `unresolved_dark` | optional risk qualifier | not S1-settled; current row depends on dark-pool / quarantine / admin-clear methodology outside the minimum S1 set | `later-packet-needed` before it can be treated as future-safe main-page truth |

### 5.3 Page 2 contract — bottleneck analysis only

Page 2 exists to answer one question:

> Given the Page 1 truth, what is the actual bottleneck reading for the day, using Jack's exact reasoning flow?

The flow is frozen as five ordered steps.

| Step | Frozen question | Required output shape | Allowed inputs | Hard not-allowed boundary |
| --- | --- | --- | --- | --- |
| 1. Integrated report snapshot | What same-day picture emerges when the Page 1 truth blocks are read together? | one compact synthesis paragraph anchored in Page 1 truth rows | Page 1 truth rows + compact caveat strip | No new truth table; no long carrier-report recap |
| 2. Growth stock / deployable bike question | If demand grew, is deployable bike stock the first visible absorber or constraint? | one compact answer using the bike truth block, with explicit `proved` or `not_proven` wording when needed | Page 1 bike rows + appendix bike reference if needed | No fleet scorecard clone and no assignment-coverage detour unless it materially changes the answer |
| 3. Infra readiness for growth absorption | Can the exchange layer absorb more flow cleanly? | one compact answer using BSS readiness rows and any tightly needed battery-buffer anchor | Page 1 BSS rows + bounded appendix BSS reference | No full site tables and no bucket dump on main page |
| 4. Efficiency / unit-economics readiness | Is throughput converting efficiently, or is the system leaking via misses / poor delivered stock? | one compact answer using transaction + battery-quality rows | Page 1 transaction and battery rows + bounded appendix battery reference | No recharge-methodology essay and no dark-pool reconstruction dump on main page |
| 5. Service-level readiness / blind spots | What remains unproved about rider impact, trust, and service-level consequence? | one compact blocker / trust paragraph with explicit blind spots | Page 1 caveat strip + Packet S1 blocked surfaces + at most one compact CTO-derived trust frame if valuable | No invented ticket, SLA, CSAT, or NPS claims |

#### 5.3.1 Page 2 role-freeze rules

Page 2 is the **only** place where the daily bottleneck call lives.

Page 2 may contain:
- the integrated same-day bottleneck read
- the five-step reasoning flow above
- one compact bottleneck-call statement
- at most one compact consequence-if-unchanged line
- at most one compact trust / blocker line

Page 2 must **not** contain:
- the full Page 1 truth table repeated again
- appendix site tables or watchlists
- the current CTO taxonomy (`Headline`, `Important + Urgent`, `Important + Not Urgent`, `Intelligence`, `Actions`) copied forward
- owner / escalation routing tables
- delivery metadata

#### 5.3.2 Exact bottom-line rule for Page 2

Page 2 closes with exactly three compact outputs in this order:
1. **Current bottleneck call**
2. **Consequence if unchanged** — at most one compact line
3. **What remains not proven** — at most one compact trust / blocker line

That closing triad replaces the current CTO daily brief's larger taxonomy.

### 5.4 Appendix contract — bounded branch drill-downs only

The appendix exists to answer one question:

> If Jack or a reviewer wants to go one layer deeper, what bounded drill-down is worth reading without recreating the old report sprawl?

| Appendix section | Trigger rule | Allowed contents | Hard bound |
| --- | --- | --- | --- |
| A. Bike drill-down | only if Page 1 or Page 2 explicitly references a bike question that needs decomposition | one compact bike decomposition table and, if needed, one compact anomaly / caveat note | No full fleet report clone, no full YAML, no VIN list dump |
| B. BSS / slot drill-down | only if Page 2 Step 3 needs hotspot or bucket proof | one compact inactive-bucket table and up to two bounded top-N hotspot tables | No full site table, no exhaustive BSS list, no raw dashboard dump |
| C. Battery drill-down | only if Page 2 Step 4 or Step 5 needs watchlist, dark-pool, or methodology support | one compact watchlist / method table and up to two bounded supporting tables | No full battery methodology essay, no full source inventory, no delivery artifact block |

#### 5.4.1 Appendix boundedness rules

Every appendix section must:
- reference the exact Page 1 metric or Page 2 question it is supporting
- stay branch-bounded
- stay top-N or compact-table bounded
- stop before becoming a second standalone daily report

The appendix must **not** contain:
- a new top-level bottleneck call
- a new action plan
- a separate executive summary
- copied delivery sections from current reports

## 6. Artifact-by-artifact recycle classification

### 6.1 Fleet report (`electrum-fleet-executive-summary-*`)

| Current fleet material | Packet S2 classification | Why |
| --- | --- | --- |
| Compact bike truth numbers that directly answer the daily deployable-bike / readiness question | `recycle` -> Page 1 | This is the part of the fleet artifact that materially helps Page 1 truth clarity |
| Bike decomposition tables that explain why the bike block looks the way it does | `appendix_only` | Useful drill-down, but too detailed for a two-page main brief |
| Anomaly footer, overrides, and contradiction notes | `appendix_only` | Useful only when the bike truth needs audit detail |
| Long prose, full YAML blocks, timeline, delivery metadata, and the current full fleet-report narrative frame | `do_not_recycle` | They would recreate report sprawl instead of a compact daily brief |

**Important Packet S1 boundary note:** current fleet material is recyclable only where it can later map cleanly to the Packet S1 bike branch. The current fleet report's broader operator/accountability scorecard is **not** automatically frozen as the future unified daily main-page canon.

### 6.2 BSS-slot report (`electrum-bss-slot-daily-report-*`)

| Current BSS-slot material | Packet S2 classification | Why |
| --- | --- | --- |
| `transacting_bss`, `active_slots`, `disabled_slots`, `enabled_not_ready_slots` | `recycle` -> Page 1 | These are the exact compact truth rows that improve Page 1 exchange-layer clarity |
| Inactive-slot bucket breakdown, quiet-empty split, stale-vs-carryover detail | `appendix_only` | Useful drill-down for Page 2 Step 3, but too detailed for the main pages |
| Top location and top-BSS hotspot tables | `appendix_only` | Valuable branch drill-down, but explicitly not for the main pages |
| Anomaly footer and denominator-drift notes | `appendix_only` | Useful only when a reviewer needs trust detail behind a main-page row |
| Artifact-status, delivery metadata, and long contract/method prose | `do_not_recycle` | Not part of the future attention object |

Non-negotiable main-page rule: **no full site tables on Page 1 or Page 2**.

### 6.3 Battery report (`electrum-battery-daily-report-*`)

| Current battery material | Packet S2 classification | Why |
| --- | --- | --- |
| `completed_swaps`, `miss_rate` as currently restated inside the battery report | `recycle` -> Page 1 transaction outcome block | Useful same-day outcome truth, but it belongs in the transaction outcome block rather than the battery block |
| `deployed` | `recycle` -> Page 1 battery block | S1-settled via `svr_battery_health`; safe as future main-page battery denominator truth |
| health-side `in_bike` | `recycle` -> Page 1 battery block | S1-settled via `svr_battery_health`; safe as future main-page truth when kept as the snapshot row rather than stronger report-local proof |
| `low_SoH` | `recycle` -> Page 1 battery block | S1-settled via `svr_battery_health`; safe as future compact battery-quality truth |
| `swap_active` | `recycle` -> Page 1 battery block (`rollback-carried`) | Useful Step 4 row, but the exact derived-row freeze still needs a later packet; do not describe it as already upstream-settled |
| `in_bss` | `recycle` -> Page 1 battery block (`rollback-carried`) | Useful rack-buffer row, but the current board count depends on excluded `view_battery_in_bss` |
| `R2R` | `later-packet-needed` before Page 1 battery recycle is future-safe | The current proxy depends on excluded `v_battery_latest` plus `view_battery_in_bss`, so Packet S2 cannot present it as already upstream-frozen |
| `offline` | `recycle` -> Page 1 battery block (`rollback-carried`) | Can still be carried as a compact observability qualifier only if the row stays explicitly labeled as a current snapshot outside the minimum S1 set |
| `unresolved_dark` | `later-packet-needed` before Page 1 battery recycle is future-safe | The current row depends on dark-pool, quarantine, and admin-clear methodology beyond the minimum S1 set |
| Critical watchlists, quarantine lanes, dark-pool clears/splits, recharge-loop detail, anomaly footer, and methodology notes | `appendix_only` | Useful drill-down and trust support, but too detailed for the two-page main brief |
| Delivery artifacts, Google/Drive/Gmail status, local file paths, and the full source inventory list | `do_not_recycle` | Operational residue, not unified-brief content |

**Important Packet S1 boundary note:** Packet S2 preserves the **desired Page 1 battery block**, but only `deployed`, health-side `in_bike`, and `low_SoH` read as future-safe main-page truth today. Every other carried battery row must keep the explicit `rollback-carried` or `later-packet-needed` label above until a later packet settles the missing upstream support.

### 6.4 CTO daily integrated brief (`electrum-ai-cto-integrated-brief-daily`)

| Current CTO brief material | Packet S2 classification | Why |
| --- | --- | --- |
| One compact consequence-if-unchanged line, if it materially sharpens the final Page 2 close | `recycle` -> Page 2 | This is the one piece of current CTO prose that can still help the unified analysis page |
| One compact blocker / trust framing line, if it materially sharpens the Page 2 blind-spot close | `recycle` -> Page 2 | This preserves useful trust framing without keeping the CTO brief as a parallel artifact |
| Current headline taxonomy, alert buckets, intelligence/actions structure, and larger integrated memo frame | `do_not_recycle` | Packet S2 replaces that structure with the five-step Page 2 reasoning flow |
| Delivery/status metadata and explicit source-page inventory section | `do_not_recycle` | Not part of the future unified Jack-facing read |

Non-negotiable rule: the CTO brief is **not** the future top-level daily object. Its useful residue is limited to one compact consequence line and one compact trust/blocker line at most.

## 7. Page-role non-overlap and leakage prevention

| Surface | Frozen role | What may enter | What may not leak in |
| --- | --- | --- | --- |
| Page 1 | truth | compact same-day metrics, freshness, caveats | bottleneck call, actions, consequence prose, site tables |
| Page 2 | reasoning | five-step bottleneck analysis, one consequence line, one trust line | full truth table repetition, appendix tables, CTO taxonomy |
| Appendix | bounded drill-down | decompositions, hotspot tables, watchlists, methodology support | new top-level call, new executive summary, full old-report clones |

If a sentence or table does not clearly belong to one row above, Packet S2 treats it as out of scope for the future unified brief.

## 8. Explicit exclusions / out of scope

Packet S2 does **not** do any of the following:
- implement the unified brief
- mutate cron schedules
- delete the current branch reports or CTO brief
- change Packet S1's upstream Electrum-to-brain sense contract
- widen the bike branch into the full current fleet scorecard
- claim that Packet S1 already froze all current battery-carrier support surfaces
- preserve current report section taxonomies just because users have seen them before
- add owner-routing, escalation matrices, or management action plans as part of the two-page contract
- create a second Jack-facing daily summary object

## 9. Definition of done

Packet S2 is done when a reviewer can:
- see the exact two-page main-brief contract plus appendix boundary without guessing
- see that Page 1 and Page 2 have explicit non-overlapping roles
- see the appendix frozen as bounded branch drill-down only
- inspect clear recycle / appendix-only / do-not-recycle decisions across fleet, BSS-slot, battery, and CTO daily artifacts
- see the CTO daily brief frozen as paused for future Jack-facing daily use, with a later repurpose path noted
- understand the future unified brief without rereading all old daily artifacts
- confirm that no runtime implementation, cron mutation, or upstream source-contract change leaked into the packet

## 10. Verify path

Review this artifact against:
1. `.hermes/plans/2026-04-23-agentic-bi-packet-s2-approved-office-hours.md`
2. `.hermes/autobuild/packet-s2-checkpoint.yaml`
3. `docs/plans/electrum/agentic-bi-packet-s1-electrum-to-brain-sense-lane-inventory.md`
4. live cron inventory in `/home/jackyujieyang/.hermes/profiles/satori-hermes/cron/jobs.json`
5. Apr 21 specimen brief: `/home/jackyujieyang/brain/electrum-daily-bottleneck-brief-2026-04-21.md`
6. current carrier artifacts used for recycle classification:
   - `/home/jackyujieyang/brain/electrum-fleet-executive-summary-2026-04-21.md`
   - `/home/jackyujieyang/brain/electrum-bss-slot-daily-report-2026-04-21.md`
   - `/home/jackyujieyang/brain/electrum-battery-daily-report-2026-04-21.md`
   - `/home/jackyujieyang/brain/electrum-ai-cto-integrated-brief-2026-04-21.md`

Reviewer checks:
- the target daily shape is one `06:30` collect plus one `07:30` report only
- Page 1 is frozen as numbers/truth and Page 2 is frozen as the five-step bottleneck-analysis page
- the appendix is bounded and does not recreate the old report trio
- branch-carrier recycle decisions match the approved selective-reduction direction
- the CTO daily brief is paused as a future Jack-facing daily artifact and only has a bounded later repurpose note
- Packet S1 remains the upstream boundary and Packet S2 does not pretend that non-S1-settled fleet/battery rows are already upstream-frozen
- no implementation or runtime-mutation scope leaked into the packet

Bounded repo verify commands:
- `./ops/verify fast --json`
- `./ops/verify live --json`

## 11. Rollback path

Planning-only rollback:
- drop or reset the packet worktree
- keep the current runtime and cron jobs unchanged
- keep the current branch reports plus CTO brief as the live rollback path until a later cutover packet

## 12. Review status

This Packet S2 artifact stops at **`review_ready`**.
