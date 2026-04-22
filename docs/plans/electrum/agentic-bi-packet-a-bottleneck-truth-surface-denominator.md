# Packet A — Daily Bottleneck Truth-Surface Denominator

Status: `review_ready`
Date: 2026-04-22
Scope: current daily bottleneck wedge only

## 1. Purpose and scope

Packet A freezes the minimum truth-surface denominator for the **current daily bottleneck wedge** so later BI registry, judgment, or rendering work does not smuggle in hidden intelligence.

This packet is **planning/spec only**:
- define the surfaces that must be visible
- define how each surface is treated in the wedge
- keep proof boundaries explicit
- stop before integration, promotion, rendering, or broader BI expansion

Working order for this wedge:
1. **coverage** — name the surfaces that matter
2. **disposition** — mark each surface as required, assumed, blocked, or excluded
3. **promotion** — later packets decide what can support a canonical bottleneck claim
4. **rendering** — later packets may turn promoted truth into a brief/dashboard/output

The wedge is transaction-first. Bike, BSS/slot, and battery views are branches off that spine. Contradictions and blocked surfaces stay visible instead of being silently patched over.

## 2. Explicit denominator for the daily bottleneck wedge

The explicit denominator for this wedge is **17 named surfaces**:
- **14 operative / derived wedge surfaces** that can directly explain same-day bottleneck conditions
- **3 blocked / external-needed surfaces** that must remain visible so the system can say `not proven yet` instead of guessing

A surface belongs in this denominator if it does at least one of the following:
- anchors same-day business outcome in transaction-backed truth
- explains bike-side serviceability or deployability
- explains BSS / slot exchange-layer capacity
- explains battery readiness or battery health
- exposes contradictions between those reads
- marks a required-but-missing proof surface explicitly

**Not part of the denominator:**
- prompt templates, dashboard tiles, narrative ordering, or other render-only outputs
- customer-service joins unless a real joined truth surface exists
- weekly/monthly registry design or broader BI denominator work
- unrelated finance, HR, marketing, or non-wedge planning surfaces

## 3. Proof status legend

| Status | Meaning |
| --- | --- |
| `required` | Must be visible for the current wedge; omission would hide a critical truth path. |
| `assumed` | Belongs in the wedge, but exact authoritative implementation/source still needs later confirmation. |
| `blocked` | Known needed surface, but not yet integrated or not yet proven as queryable truth. |
| `excluded` | Deliberately outside the denominator; may exist only as renderer or adjacent context. |

## 4. Transaction spine surfaces

| Surface | Business role | Grain | Freshness | Owner / system of record | Proof status | Why it belongs |
| --- | --- | --- | --- | --- | --- | --- |
| `daily_transaction_fact` | Canonical same-day record of completed swaps, misses, and transaction attempts | transaction attempt / swap event; daily rollup derived from event grain | same-day intraday -> EOD | transaction system -> canonical warehouse fact | `required` | Establishes what business did or did not happen today. |
| `transaction_asset_linkage` | Associates each transaction with bike, BSS, slot, battery, and location identifiers | one transaction-event -> asset key mapping | same-day | transaction system plus operational event linkage | `assumed` | Converts bike/BSS/battery reads from parallel reporting into branch evidence off the same spine. |
| `transacting_denominator_rollup` | Produces transacting bikes, batteries, slots, BSS, and locations from the spine | business_date x asset class (optionally region/city) | same-day / daily | BI or warehouse derivation from transaction fact | `required` | Keeps the wedge on transacting denominators instead of static deployed counts. |

## 5. Bike branch surfaces

| Surface | Business role | Grain | Freshness | Owner / system of record | Proof status | Why it belongs |
| --- | --- | --- | --- | --- | --- | --- |
| `bike_serviceability_snapshot` | Shows up / serviceable / deployable bike stock | bike-day snapshot or latest bike state | same-day | fleet or vehicle operations system | `required` | Daily bottleneck claims cannot separate real bike capacity from theoretical fleet size without it. |
| `bike_unavailability_reason_surface` | Explains why bikes are not serviceable (repair, maintenance, retrieval, other downtime classes) | bike-state reason event or bike-day reason snapshot | same-day | fleet operations / maintenance workflow | `assumed` | Distinguishes a simple stock shortfall from an operational bottleneck inside bike readiness. |
| `bike_activation_deployment_surface` | Tracks newly activated, deployed, or onboarded bikes as the near-term absorption / rollout proxy | activation or deployment event; daily rollup | daily | deployment or field operations tracker | `assumed` | Needed when the wedge shifts from current stock to whether available bikes can actually be brought into service. |

## 6. BSS / slot branch surfaces

| Surface | Business role | Grain | Freshness | Owner / system of record | Proof status | Why it belongs |
| --- | --- | --- | --- | --- | --- | --- |
| `bss_capacity_snapshot` | Shows commissioned vs usable BSS capacity | BSS-day snapshot | same-day | BSS operations system | `required` | The exchange layer cannot be judged from bike stock alone. |
| `slot_capacity_state_surface` | Shows active, disabled, and usable slot capacity plus slot-state changes | slot-state event or slot-day snapshot | same-day / near-real-time | slot telemetry or BSS controller surface | `required` | Slot count is the cleanest cross-generation denominator when BSS generations differ in slot count. |
| `bss_location_coverage_surface` | Shows which locations are transacting / usable vs merely installed | location-day or site-day snapshot | daily | BSS/location master plus transaction-derived activity | `assumed` | Distinguishes local saturation from network-wide exchange readiness. |

## 7. Battery branch surfaces

| Surface | Business role | Grain | Freshness | Owner / system of record | Proof status | Why it belongs |
| --- | --- | --- | --- | --- | --- | --- |
| `battery_ready_stock_snapshot` | Shows ready-to-run batteries available for swapping and deployment support | battery-day or stock snapshot | same-day | battery inventory / ops surface | `required` | A bike/BSS answer is incomplete if battery stock is not actually ready. |
| `battery_health_serviceability_surface` | Shows healthy / usable batteries and health proxies | battery-state event or battery-day snapshot | same-day | battery management / battery operations system | `required` | Efficiency and growth-readiness depend on battery health, not just battery count. |
| `battery_replenishment_coverage_surface` | Shows whether ready batteries are being circulated to the right stations / lanes | station-day, route-day, or replenishment event | same-day / daily | battery replenishment workflow | `assumed` | Separates battery stock that exists somewhere from battery support that reaches the exchange layer. |

## 8. Contradiction surfaces

| Surface | Business role | Grain | Freshness | Owner / system of record | Proof status | Why it belongs |
| --- | --- | --- | --- | --- | --- | --- |
| `static_vs_transacting_comparison` | Compares static deployed / installed counts against transacting counts for the same date | business_date x metric pair | daily | BI-derived reconciliation surface | `required` | Prevents silent denominator swapping when static fleet or installed assets overstate real activity. |
| `cross_branch_capacity_mismatch` | Surfaces bikes-vs-slots-vs-batteries mismatch and identifies the pinch point across branches | business_date x city/ops lane | daily | BI-derived mismatch check from branch surfaces | `required` | The bottleneck is often a branch mismatch, not a shortage visible in one surface alone. |

## 9. Blocked / external-needed surfaces

| Surface | Business role | Grain | Freshness | Owner / system of record | Proof status | Why it belongs |
| --- | --- | --- | --- | --- | --- | --- |
| `assignment_contract_authority` | Gives exact assigned / contract-assigned bike denominator | bike-assignment row or contract allocation snapshot | daily | contract/commercial ops roster or planning authority | `blocked` | Required to prove deployable surplus instead of only reporting serviceable bikes. |
| `customer_service_join_surface` | Gives direct service-level truth such as tickets/complaints joined to transaction volume | joined ticket-to-transaction row or business_date aggregate | daily | customer-service system plus transaction join | `blocked` | Belongs only as an explicit proof boundary; no customer-service join should be implied before it exists. |
| `deployment_plan_authority` | Gives authoritative rollout / onboarding / site-activation pace for time-to-absorb questions | site-day, team-day, or rollout-plan event | daily / weekly | field deployment planner / rollout tracker | `blocked` | Needed when the wedge moves from current capacity to execution pace and growth absorption. |

## 10. Render-only surfaces if needed

These may exist later, but they are **not** part of the denominator.

| Surface | Business role | Grain | Freshness | Owner / system of record | Proof status | Why it does not belong |
| --- | --- | --- | --- | --- | --- | --- |
| `daily_brief_renderer` | Renders the approved bottleneck narrative / memo order | brief-day output | per run | prompt / renderer / report template | `excluded` | Rendering is downstream of coverage, disposition, and promotion; it cannot define truth. |
| `dashboard_tile_pack` | Displays KPI cards, summary tiles, and charts | dashboard-date view | per refresh | BI presentation layer | `excluded` | Presentation can summarize the denominator but must not replace it. |

## 11. Explicit exclusions / out of scope

Packet A does **not** do any of the following:
- build ETL, schema, warehouse, or join logic
- integrate customer-service systems
- define the broader Electrum BI denominator outside the current daily bottleneck wedge
- decide final canonical bottleneck logic beyond naming the surfaces required for later promotion
- treat renderer outputs as evidence
- expand into unrelated operational or corporate domains

## 12. Definition of done

Packet A is done when a reviewer can:
- see the full current wedge surface universe without guessing
- identify the transaction spine, bike branch, BSS/slot branch, battery branch, contradiction surfaces, and blocked surfaces explicitly
- read business role, grain, freshness, owner/system of record, proof status, and inclusion rationale for every surface
- tell which missing answers are true blockers rather than silent omissions
- confirm that rendering has been kept separate from truth-surface definition

## 13. Verify path

Review this artifact against the approved Packet A planning anchors:
1. `.hermes/plans/2026-04-22-agentic-bi-packet-a-approved-office-hours.md`
2. `.hermes/autobuild/packet-a-checkpoint.yaml`
3. the approved canon refs named in those files, especially:
   - `electrum-agentic-bi-autoplan-packets-a-e-2026-04-22`
   - `electrum-week-1-first-slice-spec-daily-bottleneck-truth-substrate`

Reviewer checks:
- all required Packet A groups are present
- every surface row includes the required fields
- transaction-first structure is preserved
- blocked / external-needed surfaces are explicit
- render-only surfaces are separated from the denominator
- no scope expansion into customer-service integration or broader BI registry occurred

## 14. Review status

This Packet A artifact stops at **`review_ready`**.
