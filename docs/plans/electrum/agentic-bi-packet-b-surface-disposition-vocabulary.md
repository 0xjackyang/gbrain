# Packet B — Daily Bottleneck Surface Disposition Vocabulary

Status: `review_ready`
Date: 2026-04-23
Scope: current daily bottleneck wedge only; Packet A denominator baseline

## 1. Purpose and scope

Packet B assigns a **single disposition** to every Packet A surface so later builder work can classify surfaces without hidden analyst judgment.

This packet is **planning/spec only**:
- take Packet A coverage as fixed input
- define the disposition vocabulary used inside the current daily bottleneck wedge
- give decision rules so one surface lands in exactly one disposition
- show concrete mappings using Packet A surfaces
- stop before promotion rules, rendering logic, integration work, or broader BI ontology expansion

Packet B stays principal-neutral and preserves the approved order:
1. **coverage** — Packet A names the surfaces
2. **disposition** — Packet B assigns each named surface one role
3. **promotion** — later packets decide what dispositions may support a canonical bottleneck claim
4. **rendering** — later packets may format promoted truth for briefs or dashboards

## 2. Packet A baseline and invariants

Packet A remains the authoritative **coverage denominator** for this wedge. Packet B does **not** add, remove, or rename surfaces from that baseline.

Packet A and Packet B answer different questions:
- **Packet A proof status** asks how settled or blocked a surface is (`required`, `assumed`, `blocked`, `excluded`)
- **Packet B disposition** asks what role the surface plays in the wedge (`canonical_truth`, `supporting_truth`, `contradiction_surface`, `proof_gap`, `external_needed`, `render_only`)

Those layers are related but not identical:
- a Packet A `required` surface may map to `canonical_truth`, `supporting_truth`, or `contradiction_surface`
- a Packet A `assumed` surface maps to `proof_gap` until an authoritative truth path is frozen
- a Packet A `blocked` surface maps to `external_needed`
- a Packet A `excluded` render surface maps to `render_only`

## 3. Disposition vocabulary

| Disposition | Crisp definition | What it is not |
| --- | --- | --- |
| `canonical_truth` | A first-order same-day truth surface whose own records or counts can later be promoted as direct evidence of bottleneck reality or branch capacity. | Not a renderer, not a contradiction check, not an unresolved placeholder. |
| `supporting_truth` | A direct truth surface that explains, qualifies, or computes context for canonical truth, but is not itself the primary branch anchor. | Not merely presentation, and not a blocked or still-unproven surface. |
| `contradiction_surface` | A surface whose job is to compare already-in-scope truth surfaces so disagreement, denominator drift, or cross-branch pinch points stay explicit. | Not a primary source-of-record surface for one branch by itself. |
| `proof_gap` | A surface that belongs in the wedge and has a clear business role, but Packet A does not yet freeze a trustworthy internal truth path, authoritative implementation, or settled query surface for it. | Not an external-system dependency by default; do not promote it as if it were already proved. |
| `external_needed` | A surface whose authoritative answer depends on an external authority, separate system, or not-yet-integrated cross-system join outside the current proved wedge. | Not an invitation to infer the answer from adjacent data already in hand. |
| `render_only` | An output that formats, narrates, orders, or displays already-judged truth after disposition and promotion. | Not a truth surface, not part of the Packet A denominator, and never evidence by itself. |

## 4. Decision rules for assigning exactly one disposition

Apply the rules in this order. The **first matching rule wins**.

1. **Renderer check** — If the surface only packages, displays, narrates, or orders truth already decided elsewhere, assign `render_only`.
2. **Comparison check** — If the surface primarily reconciles, compares, or exposes disagreement across other truth surfaces, assign `contradiction_surface`.
3. **External authority check** — If the needed answer depends on a separate authority, contract roster, customer-service system, rollout planner, or other not-yet-integrated external source, assign `external_needed`.
4. **Unfrozen proof-path check** — If the surface clearly belongs in the wedge but Packet A does not yet lock its authoritative internal implementation, settled grain, or trustworthy query path, assign `proof_gap`.
5. **Primary branch-state check** — If the surface is a first-order same-day business, stock, serviceability, or capacity surface that can itself anchor a later bottleneck claim, assign `canonical_truth`.
6. **Otherwise** — If it is still direct truth but mainly contextual, qualifying, or derived support for canonical truth, assign `supporting_truth`.

### 4.1 Sharp distinctions that prevent overlap

- **`supporting_truth` vs `contradiction_surface`**
  - `supporting_truth` still describes a real business or operational state.
  - `contradiction_surface` exists to compare states and keep mismatch visible.

- **`proof_gap` vs `external_needed`**
  - `proof_gap` means the wedge knows the surface should exist, but the authoritative truth path is not yet frozen inside the current scope.
  - `external_needed` means the authoritative answer sits outside the currently proved wedge and requires a separate authority or integration.

- **`render_only` vs every truth disposition**
  - A render surface may summarize truth, but it never creates, substitutes for, or repairs truth.
  - Render-only outputs are therefore **not truth surfaces**.

## 5. Worked mappings using Packet A surfaces

### 5.1 Transaction spine examples

- **`daily_transaction_fact` -> `canonical_truth`**
  It is the same-day transaction-backed record of what did and did not happen.

- **`transacting_denominator_rollup` -> `supporting_truth`**
  It is real derived truth from the transaction spine, but its role is to keep later judgment on the right denominator rather than to replace the event fact itself.

- **`transaction_asset_linkage` -> `proof_gap`**
  The role is necessary and concrete, but Packet A explicitly leaves the authoritative linkage implementation only assumed rather than frozen.

### 5.2 Bike branch examples

- **`bike_serviceability_snapshot` -> `canonical_truth`**
  It is the first-order same-day bike readiness read for the wedge.

- **`bike_unavailability_reason_surface` -> `proof_gap`**
  It should eventually explain non-serviceable bikes, but Packet A does not yet freeze the authoritative reason surface.

- **`bike_activation_deployment_surface` -> `proof_gap`**
  It belongs in the wedge for near-term absorption questions, but the authoritative deployment truth path is not yet fixed.

### 5.3 BSS / slot branch examples

- **`bss_capacity_snapshot` -> `canonical_truth`**
  It is a first-order read on commissioned versus usable exchange-layer capacity.

- **`slot_capacity_state_surface` -> `canonical_truth`**
  It is still primary branch truth because usable slot state can itself be the pinch point.

- **`bss_location_coverage_surface` -> `proof_gap`**
  It clearly belongs in the wedge, but Packet A leaves the authoritative transacting-vs-installed location truth path at assumed status.

### 5.4 Battery branch examples

- **`battery_ready_stock_snapshot` -> `canonical_truth`**
  It is the first-order same-day stock of ready batteries.

- **`battery_health_serviceability_surface` -> `supporting_truth`**
  It is real truth, but its role is to qualify whether battery stock is truly usable rather than to stand in for the ready-stock count.

- **`battery_replenishment_coverage_surface` -> `proof_gap`**
  It matters for explaining station-level support, but Packet A does not yet freeze the authoritative replenishment surface.

### 5.5 Contradiction and blocked examples

- **`static_vs_transacting_comparison` -> `contradiction_surface`**
  Its job is to expose denominator drift between static counts and actual activity.

- **`cross_branch_capacity_mismatch` -> `contradiction_surface`**
  Its job is to show bikes-vs-slots-vs-batteries mismatch rather than to act as a branch source-of-record.

- **`assignment_contract_authority` -> `external_needed`**
  The answer depends on contract or commercial authority outside the currently proved wedge.

- **`customer_service_join_surface` -> `external_needed`**
  No customer-service truth should be implied before the separate system join actually exists.

- **`deployment_plan_authority` -> `external_needed`**
  The answer depends on rollout planning authority outside the currently frozen wedge truth path.

### 5.6 Render-only examples

- **`daily_brief_renderer` -> `render_only`**
- **`dashboard_tile_pack` -> `render_only`**

Both are explicitly downstream presentation artifacts and are **not truth surfaces**.

## 6. Complete Packet A -> Packet B crosswalk

| Packet A group | Surface | Packet A proof status | Packet B disposition | Why this is the single best fit |
| --- | --- | --- | --- | --- |
| Transaction spine | `daily_transaction_fact` | `required` | `canonical_truth` | First-order same-day business fact. |
| Transaction spine | `transaction_asset_linkage` | `assumed` | `proof_gap` | Needed linkage role is known, but authoritative implementation is not yet frozen. |
| Transaction spine | `transacting_denominator_rollup` | `required` | `supporting_truth` | Derived truth that keeps judgment on transacting denominators. |
| Bike branch | `bike_serviceability_snapshot` | `required` | `canonical_truth` | Primary bike readiness surface. |
| Bike branch | `bike_unavailability_reason_surface` | `assumed` | `proof_gap` | Explanatory bike truth is needed but not yet authoritatively frozen. |
| Bike branch | `bike_activation_deployment_surface` | `assumed` | `proof_gap` | Rollout/activation truth belongs here but current proof path is unresolved. |
| BSS / slot branch | `bss_capacity_snapshot` | `required` | `canonical_truth` | First-order BSS usable-capacity surface. |
| BSS / slot branch | `slot_capacity_state_surface` | `required` | `canonical_truth` | Slot-state truth can directly identify the bottleneck. |
| BSS / slot branch | `bss_location_coverage_surface` | `assumed` | `proof_gap` | Transacting-vs-installed location coverage is needed but not yet frozen. |
| Battery branch | `battery_ready_stock_snapshot` | `required` | `canonical_truth` | Primary ready-battery stock truth. |
| Battery branch | `battery_health_serviceability_surface` | `required` | `supporting_truth` | Qualifies whether stock is actually healthy and usable. |
| Battery branch | `battery_replenishment_coverage_surface` | `assumed` | `proof_gap` | Needed explanatory truth, but current authoritative surface is not yet fixed. |
| Contradiction | `static_vs_transacting_comparison` | `required` | `contradiction_surface` | Reconciliation surface to stop denominator swapping. |
| Contradiction | `cross_branch_capacity_mismatch` | `required` | `contradiction_surface` | Comparison surface for branch mismatch and pinch-point visibility. |
| Blocked / external-needed | `assignment_contract_authority` | `blocked` | `external_needed` | Depends on contract/commercial authority outside current proved wedge. |
| Blocked / external-needed | `customer_service_join_surface` | `blocked` | `external_needed` | Depends on a separate customer-service join not yet integrated. |
| Blocked / external-needed | `deployment_plan_authority` | `blocked` | `external_needed` | Depends on rollout planning authority outside the current wedge proof path. |
| Render-only | `daily_brief_renderer` | `excluded` | `render_only` | Presentation output only. |
| Render-only | `dashboard_tile_pack` | `excluded` | `render_only` | Presentation output only. |

## 7. Explicit exclusions / out of scope

Packet B does **not** do any of the following:
- decide Packet C promotion rules or canonical bottleneck adjudication
- build integrations, joins, schemas, or ETL
- integrate customer-service systems
- expand into broader Electrum BI ontology beyond the current daily bottleneck wedge
- change Packet A coverage scope or rename Packet A surfaces
- treat briefs, dashboards, prompts, or chart packs as truth surfaces
- infer external-needed answers from adjacent internal data without the actual external authority

## 8. Definition of done

Packet B is done when a reviewer can:
- take every named Packet A surface and assign exactly one disposition using the ordered rules above
- explain why a surface is `canonical_truth`, `supporting_truth`, `contradiction_surface`, `proof_gap`, `external_needed`, or `render_only`
- distinguish `proof_gap` from `external_needed` without hand-waving
- confirm that contradiction surfaces remain visible rather than collapsed into a primary branch surface
- confirm that render-only outputs are excluded from truth-surface status
- see that no scope expansion into Packet C, customer-service integration, or broader BI ontology occurred

## 9. Verify path

Review this artifact against:
1. `docs/plans/electrum/agentic-bi-packet-a-bottleneck-truth-surface-denominator.md`
2. `.hermes/plans/2026-04-22-agentic-bi-packet-b-approved-office-hours.md`
3. `.hermes/autobuild/packet-b-checkpoint.yaml`
4. the approved canon refs named in those files, especially:
   - `electrum-agentic-bi-autoplan-packets-a-e-2026-04-22`
   - `electrum-week-1-first-slice-spec-daily-bottleneck-truth-substrate`

Reviewer checks:
- every Packet A surface appears once in the crosswalk and only once
- the decision rules would reproduce the listed dispositions
- `blocked` Packet A surfaces map to `external_needed`
- `assumed` Packet A surfaces stay out of promoted truth by landing in `proof_gap`
- required comparison surfaces map to `contradiction_surface`, not `canonical_truth`
- render-only outputs are explicitly non-truth
- no scope expansion beyond Packet B occurred

## 10. Review status

This Packet B artifact stops at **`review_ready`**.
