# Packet D — First-Slice Spec Amendment for Upstream Truth-Shaping Layers

Status: `review_ready`
Date: 2026-04-23
Scope: current daily bottleneck wedge only; amends `electrum-week-1-first-slice-spec-daily-bottleneck-truth-substrate`

## 1. Purpose and scope

Packet D creates the repo-local amendment path for the GBrain page `electrum-week-1-first-slice-spec-daily-bottleneck-truth-substrate` so the already-approved Week 1 architecture no longer jumps directly from "substrate" into the canonical object/tool/skill/rendering stack.

This packet is **planning/spec only**:
- take Packet A denominator coverage as fixed input
- take Packet B disposition vocabulary as fixed input
- take Packet C promotion contract as fixed input
- amend the existing first-slice spec so those three layers are explicit upstream prerequisites to the canonical object
- preserve the existing canonical object, tool surface, skill library, P8, and rendering architecture where it still holds
- stop before implementation, API/schema work, customer-service integration, broader BI ontology changes, or changing the Week 1 wedge itself

## 2. Amendment premise

The existing first-slice spec already established a valid downstream architecture for the Week 1 wedge:
- canonical object
- tool surface
- skill library
- P8
- rendering

What Packet D changes is **not** that downstream shape. What Packet D changes is the missing pre-object layer.

After Packets A-C, the canonical object in `electrum-week-1-first-slice-spec-daily-bottleneck-truth-substrate` must be read as downstream of the following explicit sequence:
1. **coverage / denominator** — Packet A freezes the surface universe for the daily bottleneck wedge
2. **disposition** — Packet B assigns each named surface exactly one role
3. **promotion contract** — Packet C defines what may enter the canonical bottleneck object and under what proof/provenance rules
4. **canonical object** — the existing first-slice object layer, now explicitly downstream of A-C
5. **tool surface** — the existing downstream tool layer
6. **skill library** — the existing downstream skill layer
7. **P8** — the existing downstream P8 section/layer in the first-slice spec
8. **rendering** — the existing downstream rendering layer

In short: **coverage -> disposition -> promotion -> object -> tools/skills/P8 -> rendering**.

## 3. What remains unchanged from the existing first-slice spec

The following parts of `electrum-week-1-first-slice-spec-daily-bottleneck-truth-substrate` remain valid and should stay in place:
- the **Week 1 wedge** remains the current daily bottleneck wedge only
- the wedge remains **transaction-first**; bike, BSS/slot, and battery reads remain branches off the same-day transaction spine where relevant
- the **canonical bottleneck object** remains the minimum same-day, principal-neutral, evidence-bearing object rather than a memo or recommendation layer
- the existing **tool surface** remains downstream of the canonical object rather than becoming a truth-definition layer
- the existing **skill library** remains downstream of the canonical object/tool layer rather than becoming a hidden judgment layer
- the existing **P8** layer remains downstream and should keep its current role from the first-slice spec
- **rendering** remains downstream of truth adjudication and must not become evidence or truth authority
- contradictions, blockers, and `not_proven` states remain visible rather than being silently collapsed into a clean narrative
- no customer-service integration, broader BI denominator expansion, or principal-specific decision layer is introduced by Packet D

## 4. What changes because of Packets A-C

Packets A-C make previously implicit upstream logic explicit. The first-slice spec must now say all of the following clearly:

### 4.1 Packet A changes the first-slice spec by freezing the denominator

Packet A supplies the upstream coverage denominator for the wedge:
- **17 named denominator surfaces** for the current daily bottleneck wedge
- plus **2 render-only surfaces** that stay explicitly excluded from truth-surface status

The canonical object may no longer be read as the place where the surface universe is implicitly chosen. That choice now happens upstream in Packet A.

### 4.2 Packet B changes the first-slice spec by freezing disposition before object formation

Packet B assigns exactly one disposition to every named Packet A surface:
- `canonical_truth`
- `supporting_truth`
- `contradiction_surface`
- `proof_gap`
- `external_needed`
- `render_only`

The canonical object may no longer be read as the place where hidden analyst judgment decides what kind of surface something is. That judgment now happens upstream in Packet B.

### 4.3 Packet C changes the first-slice spec by freezing promotion before object formation

Packet C defines what may enter the canonical bottleneck object and what must remain outside it.

The first-slice spec must now treat the canonical object as populated only after Packet C promotion rules have been applied. In particular:
- `proof_gap`, `external_needed`, and `render_only` sources do **not** populate truth-bearing object fields
- `canonical_truth`, `supporting_truth`, and `contradiction_surface` sources may populate the object only according to the Packet C contract
- promoted entries must carry proof/provenance metadata rather than appearing as unexplained object fields
- stronger claims that depend on missing proof remain outside promoted truth and stay visible as blockers or `not_proven`

### 4.4 Net effect on the existing first-slice architecture

The first-slice spec should no longer read as:
- substrate -> canonical object -> tools -> skills -> P8 -> rendering

It should now read as:
- substrate -> Packet A denominator -> Packet B disposition -> Packet C promotion contract -> canonical object -> tools -> skills -> P8 -> rendering

## 5. Canonical amended architecture

| Order | Layer | Governing packet/spec source | Output to next layer |
| --- | --- | --- | --- |
| 1 | Coverage denominator | Packet A | Named surface universe for the wedge |
| 2 | Disposition vocabulary | Packet B | Single role for each named surface |
| 3 | Promotion contract | Packet C | Rules for what may become object truth vs blockers |
| 4 | Canonical bottleneck object | Existing first-slice spec, amended by Packet D | Principal-neutral, evidence-bearing same-day object |
| 5 | Tool surface | Existing first-slice spec, preserved | Tools operating on promoted object truth and provenance |
| 6 | Skill library | Existing first-slice spec, preserved | Skill behavior over the object/tool layer |
| 7 | P8 | Existing first-slice spec, preserved | Existing downstream P8 behavior over the object/tool/skill layer |
| 8 | Rendering | Existing first-slice spec, preserved | Briefs, dashboards, and other outputs downstream of promoted truth |

This table is the core Packet D amendment: the **canonical object now sits downstream of denominator, disposition, and promotion contract**.

## 6. Concrete update path for the GBrain first-slice spec page

Apply the following edits to `electrum-week-1-first-slice-spec-daily-bottleneck-truth-substrate`.

If the page uses slightly different subsection names, apply these edits to the paragraphs that currently introduce the canonical object, tool surface, skill library, P8, and rendering layers.

### 6.1 Insert a new section immediately before the current canonical object section

Suggested section title:

`Upstream truth-shaping layers for the Week 1 daily bottleneck wedge`

Suggested section text:

> Before the canonical bottleneck object is formed, the Week 1 daily bottleneck wedge now passes through three explicit upstream layers. First, Packet A freezes the denominator by naming the required truth surfaces for the wedge and keeping render-only or blocked surfaces explicit. Second, Packet B assigns each named surface a single disposition so hidden analyst judgment does not leak into later layers. Third, Packet C defines the promotion contract that governs what may enter the canonical bottleneck object as promoted truth, what may enter only as blocker/gap state, and what must remain outside the object entirely. The canonical object is therefore the first downstream object **after** coverage, disposition, and promotion — not the place where those judgments are invented.

Add this ordered list directly under that paragraph:

1. Coverage / denominator (`Packet A`)
2. Disposition (`Packet B`)
3. Promotion contract (`Packet C`)
4. Canonical bottleneck object (existing first-slice layer)
5. Tool surface (existing first-slice layer)
6. Skill library (existing first-slice layer)
7. P8 (existing first-slice layer)
8. Rendering (existing first-slice layer)

### 6.2 Amend the opening paragraph of the current canonical object section

Append or replace the lead so it explicitly says:

> The canonical bottleneck object is downstream of the approved denominator, disposition, and promotion layers. It may contain only truth, metrics, counter-evidence, blockers, and provenance that survive the upstream Packet A -> Packet B -> Packet C path for the current daily bottleneck wedge.

Also add this sentence if the current section does not already say it:

> The object is not the place where surface coverage is chosen, dispositions are guessed, or promotion rules are improvised.

If the current section already enumerates object fields, verify that each field maps cleanly to the Packet C field-family contract:
- `bottleneck_call`
- `evidence_for`
- `counter_evidence`
- `key_metrics`
- `blockers_truth_gaps`
- `provenance_trace`

Do not leave a truth-bearing field in the first-slice spec that bypasses the Packet C promotion envelope.

### 6.3 Amend the current tool surface section

Add the following clarification:

> Tools operate on the canonical object and its promoted evidence/provenance envelope. Tooling may inspect blocker and gap state, but it may not silently promote `proof_gap`, `external_needed`, or `render_only` sources into truth-bearing object fields.

### 6.4 Amend the current skill library section

Add the following clarification:

> Skills consume the canonical object and approved tool outputs downstream of Packet A/B/C. Skills may summarize, compare, or route promoted truth, but they may not perform hidden denominator selection, hidden disposition assignment, or hidden promotion of unproved surfaces.

### 6.5 Amend the current P8 section

Add the following clarification:

> The existing P8 layer remains downstream of the canonical object/tool/skill stack. Packet D does not change its role; it only makes explicit that P8 is not an upstream truth-adjudication layer and does not backfill denominator, disposition, or promotion logic.

### 6.6 Amend the current rendering section

Add the following clarification:

> Rendering stays strictly downstream of promoted truth. Briefs, dashboards, and other renderers may present the object, evidence, counter-evidence, metrics, and blockers, but they do not define truth, repair proof gaps, or serve as provenance authority.

## 7. First-slice section-by-section change summary

| Existing first-slice section | Keep unchanged | Packet D amendment |
| --- | --- | --- |
| Canonical object | Keep the object as the evidence-bearing same-day object | Make explicit that it is downstream of Packet A denominator, Packet B disposition, and Packet C promotion contract |
| Tool surface | Keep tools downstream of the canonical object | Clarify that tools cannot smuggle unpromoted or render-only sources into truth-bearing fields |
| Skill library | Keep skills downstream of tools/object | Clarify that skills cannot perform hidden coverage/disposition/promotion judgment |
| P8 | Keep existing P8 role and placement | Clarify that P8 is downstream and not a hidden truth-shaping layer |
| Rendering | Keep rendering as the final downstream presentation layer | Clarify that renderers cannot define evidence, truth, or provenance |

## 8. Explicit exclusions / out of scope

Packet D does **not** do any of the following:
- change the Week 1 wedge from the current daily bottleneck problem
- add new business domains beyond the Packet A denominator already approved for this wedge
- change, rename, or broaden Packet A surfaces
- redefine Packet B dispositions
- redefine Packet C promotion rules
- specify storage schema, ETL, API contract, or implementation tasks
- integrate customer-service truth or imply that the customer-service join exists
- expand into a broader Electrum BI ontology or multi-wedge architecture
- redesign the existing tool surface, skill library, P8, or rendering architecture beyond the upstream/downstream clarification above
- introduce audience-specific memo logic, recommendation logic, or principal-specific framing

## 9. Definition of done

Packet D is done when a reviewer can:
- read this artifact and update `electrum-week-1-first-slice-spec-daily-bottleneck-truth-substrate` with minimal guesswork
- see exactly what text needs to be inserted before the current canonical object section
- see exactly what must be clarified in the canonical object, tool surface, skill library, P8, and rendering sections
- confirm that Packets A-C now sit explicitly upstream of the canonical object/tool/skill/P8/rendering stack
- confirm that the existing downstream architecture is preserved where still valid
- confirm that the Week 1 wedge did not widen and no implementation scope was added

## 10. Verify path

Review this artifact against:
1. `.hermes/plans/2026-04-23-agentic-bi-packet-d-approved-office-hours.md`
2. `.hermes/autobuild/packet-d-checkpoint.yaml`
3. `docs/plans/electrum/agentic-bi-packet-a-bottleneck-truth-surface-denominator.md`
4. `docs/plans/electrum/agentic-bi-packet-b-surface-disposition-vocabulary.md`
5. `docs/plans/electrum/agentic-bi-packet-c-promotion-contract.md`
6. the approved canon refs named in those files, especially:
   - `electrum-agentic-bi-autoplan-packets-a-e-2026-04-22`
   - `electrum-week-1-first-slice-spec-daily-bottleneck-truth-substrate`

Reviewer checks:
- the amendment keeps the existing object/tool/skill/P8/rendering stack intact where valid
- the amendment explicitly inserts Packet A, Packet B, and Packet C upstream of the canonical object
- the wording preserves the approved order: coverage -> disposition -> promotion -> object -> tools/skills -> rendering
- the amendment does not widen scope into implementation, customer-service integration, broader BI ontology, or a different Week 1 wedge
- the amendment uses real Packet A/B/C content rather than generic placeholders
- the amendment is concrete enough for a future builder or reviewer to update the GBrain page directly

## 11. Review status

This Packet D artifact stops at **`review_ready`**.
