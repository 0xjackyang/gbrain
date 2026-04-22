# Packet S1 — Electrum-to-Brain Sense Lane Inventory

Status: `review_ready`
Date: 2026-04-23
Scope: current daily bottleneck wedge only; freezes the GBrain-side sense boundary before implementation or cron cutover

## 1. Purpose and scope

Packet S1 freezes the **minimum GBrain-side electrum-to-brain sense lane contract** for the current daily bottleneck wedge.

This packet is **planning/spec only**:
- take Packet A-E truth-shaping canon as fixed input
- freeze the exact live Electrum source set for the wedge
- freeze grain, stable-ID, time-basis, and freshness semantics per source
- define the minimum sense-only artifact contract that GBrain collection must materialize
- define how blocked or unresolved surfaces are carried forward without being silently solved
- crosswalk the current report trio plus CTO brief as downstream consumers and rollback path
- stop before collector code, cron changes, report rewrites, or runtime mutation

Packet S1 preserves the approved order:
1. **coverage / disposition / promotion** stay governed by Packets A-C
2. **downstream object and rendering order** stay governed by Packets D-E
3. **sense-lane inventory/contract** now freezes the missing operational seam between live Electrum source access and those downstream consumers

## 2. Fixed inputs and invariants

Packet S1 is valid only if it keeps these inputs and invariants intact:
- Electrum remains the **source-side equivalent**, not the sense/reflex home.
- GBrain remains the **sense/reflex home**.
- The wedge stays bounded to the **current daily bottleneck problem** only.
- The frozen minimum live source set is:
  - `aggregating_layer.daily_vehicle`
  - `aggregating_layer.daily_company_infra` (**parity only when needed**)
  - `remote(analytics.default.fact_order_swaps)`
  - `remote(analytics_iot.default.svr_battery_health)`
  - `remote(analytics_iot.default.iot_bss_door_metric)`
  - `remote(analytics_iot.asset_monitor.v_bss_doors_latest)`
- The current `06:30 WIB` report trio and `07:30 WIB` CTO integrated brief remain the **live rollback path** while the sense lane is only being specified.
- No customer-service integration, no Electrum-side service invention, no collector implementation, no cron mutation, and no repo-home decision happen in this packet.
- Current report pages and brief pages remain **downstream carriers/readouts**, not the source authority Packet S1 is trying to freeze.

## 3. Frozen live source set and role in the wedge

### 3.1 Exact included source set

| Source | Packet S1 role | Why it is in the minimum set |
| --- | --- | --- |
| `aggregating_layer.daily_vehicle` | Primary bike/operator snapshot | It is the current same-day bike ops truth surface for operator, status, and activity at bike grain. |
| `aggregating_layer.daily_company_infra` | Aggregate parity/supporting surface | It is the current dashboard-style cross-check for swap and infra aggregate counts, but not the primary truth surface. |
| `remote(analytics.default.fact_order_swaps)` | Canonical transaction/user-flow fact | It is the primary same-day swap truth and the main transaction-backed denominator anchor for the wedge. |
| `remote(analytics_iot.default.svr_battery_health)` | Primary battery snapshot | It is the current daily telemetry-covered battery spine for deployed-universe, SoH, and related battery-state reporting. |
| `remote(analytics_iot.default.iot_bss_door_metric)` | Diagnostic slot/event surface | It is the current slot-state and physical-slot-proof surface used for EOD slot diagnosis and battery dark-pool proof. |
| `remote(analytics_iot.asset_monitor.v_bss_doors_latest)` | Raw disabled-slot parity surface | It is the current raw latest-slot snapshot used for board-facing disabled-slot parity, not a historical day-level activity surface. |

### 3.2 Explicitly not part of the frozen minimum source set

These surfaces are live and useful today, but Packet S1 does **not** promote them into the minimum frozen source set:
- `view_battery_in_bss`
- `v_battery_latest`
- `battery_status_quarantine`
- `remote_command_audit_logs`
- customer-service or service-level join surfaces

Why they stay out of the minimum set here:
- Packet S1 is freezing the **minimum viable current wedge seam**, not the full battery-report methodology tree.
- Some of those surfaces remain report-local or proof-gap/external-needed dependencies in the current runtime.
- Freezing them here would falsely imply that Packet S1 already settles deeper battery or service-level implementation scope.

## 4. Per-source contract: grain, stable IDs, time basis, freshness, and caveats

| Source | Access path / query family | Grain frozen by S1 | Stable-ID basis frozen by S1 | Time basis / window rule | Freshness semantics | Allowed sense-lane contribution | Hard caveat |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `daily_vehicle` | `aggregating_layer.daily_vehicle` | `business_date + vehicle_vin` | `business_date + vehicle_vin` | Use the explicit `business_date` daily snapshot for the target WIB day | Daily same-day bike snapshot | Bike/operator/accountability facts; bike readiness/activity snapshot; downstream bike-branch carrier | Snapshot truth, not an event log. Contract/assignment/customer surfaces remain triangulation or later-layer context. |
| `daily_company_infra` | `aggregating_layer.daily_company_infra` only, using the business-date aggregate parity cut already exercised by current reports | business-date aggregate slice | `business_date + locked parity envelope` where the envelope is limited to completed-swap, miss-event, and network-level infra aggregate parity checks against primary fact/snapshot surfaces | Use explicit `business_date`; safe to derive target day with WIB business-date logic on aggregate views only | Daily aggregate parity surface | Aggregate parity deltas for completed swaps, miss events, and named network-level infra totals only | Not entity-level truth. Never silently replace `fact_order_swaps`; any use beyond the locked aggregate parity envelope is out of scope for Packet S1. |
| `fact_order_swaps` | `remote(analytics, database='default', table='fact_order_swaps')` | swap/order event | `order_id`, bucketed by `completed_at` for daily collection | Use raw local-date `created_at` / `completed_at`; do **not** blindly apply `+7` | Same-day event fact | Canonical swap counts, miss-rate numerator/denominator support, transacting denominators, active-slot derivation via `(charging_station_sn, output_batteriesMap.door_number)` | It is canonical transaction truth, but not by itself a fully frozen cross-asset attribution layer for every bike/BSS/battery claim. |
| `svr_battery_health` | `remote(analytics_iot, database='default', table='svr_battery_health')` | `date_at + battery_sn` daily battery snapshot | `date_at + battery_sn` | Use `date_at = target_date` for the target WIB business day | Daily telemetry-covered operational snapshot | Deployed battery universe, low-SoH and related battery-state facts, battery branch carrier | Telemetry-covered operational universe is **not** automatically the full battery estate, and business quarantine truth should not be inferred from `deployed_status` alone. |
| `iot_bss_door_metric` | `remote(analytics_iot, database='default', table='iot_bss_door_metric')` | per-slot observation/event | `time_unix + charging_station_sn + door_number` | Treat `time_unix` as local-looking raw timestamp; use explicit WIB windows, especially `23:00:00-23:59:59` WIB for EOD proof | Near-real-time / latest-event diagnostic surface | EOD slot state, quiet-slot logic, readiness, physical-slot proof, and other explicitly diagnostic BSS/battery support | Diagnostic only for slot/battery proof. Do not treat raw IoT movement as canonical real user-swap truth. |
| `v_bss_doors_latest` | `remote(analytics_iot, database='asset_monitor', table='v_bss_doors_latest')` | latest row per slot | `last_time_unix + charging_station_sn + door_number` | Latest snapshot only; do not reinterpret as historical day-series truth | Current/latest snapshot parity surface | Raw disabled-slot parity for the board-facing disabled row | Latest snapshot, not full-day activity truth and not the inactive-slot diagnosis surface. |

## 5. Frozen time and freshness rules across the six-source set

### 5.1 Business-date snapshot sources

The following are frozen as **business-date snapshot** surfaces for Packet S1:
- `daily_vehicle`
- `daily_company_infra`
- `svr_battery_health`

Contract rules:
- collect them against one explicit WIB `business_date` / `date_at`
- treat them as day-scoped snapshots, not event logs
- materialize them with source-level freshness/caveat metadata so later builders do not confuse them with latest/live event streams

### 5.2 Raw event / latest snapshot sources

The following are frozen as **raw event or latest snapshot** surfaces for Packet S1:
- `fact_order_swaps`
- `iot_bss_door_metric`
- `v_bss_doors_latest`

Contract rules:
- `fact_order_swaps.created_at` / `completed_at` already behave as Jakarta-local dates for current daily reporting; Packet S1 forbids blind `addHours(..., 7)` shifting on those raw timestamps
- `iot_bss_door_metric.time_unix` is local-looking and should be queried with explicit raw WIB windows; for battery physical-slot proof the frozen window is the **final WIB hour before EOD**
- `v_bss_doors_latest` is explicitly a **latest snapshot** surface and must carry that caveat forward in the sense artifact

### 5.3 Mixed-semantics warning that must stay explicit

Packet S1 freezes one non-negotiable warning for later builders and reviewers:

> The minimum source set mixes **business-date daily snapshots** with **raw event/latest-snapshot surfaces**. The sense lane may collect both, but it must label that difference explicitly and must not flatten them into one fake uniform “same-day” semantic.

## 6. Minimum sense-only artifact contract

The sense lane is allowed to materialize **one business-date artifact** for the wedge. It is not allowed to jump straight to a brief, memo, or bottleneck narrative.

### 6.1 Required field families

| Field family | Required contents | Why it is required | Not allowed |
| --- | --- | --- | --- |
| `artifact_header` | `artifact_family`, `business_date`, `collected_at`, `scope`, `packet_ref` | Freezes what day and wedge the collection belongs to | No brief prose or managerial framing |
| `source_status` | For each source: `source_name`, `access_path`, `grain`, `stable_id_basis`, `query_window`, `freshness_status`, `collection_caveat`, `provenance_ref` | Keeps source semantics and freshness explicit | No hidden time-basis assumptions |
| `branch_facts.bike` | minimally-shaped bike/operator facts from `daily_vehicle` | Preserves bike branch truth before report rendering | No audience-facing summary language |
| `branch_facts.transactions` | minimally-shaped transaction and transacting-denominator facts from `fact_order_swaps` plus named `daily_company_infra` parity deltas when used | Preserves the canonical transaction-backed branch | No silent parity substitution |
| `branch_facts.battery` | minimally-shaped battery facts from `svr_battery_health` | Preserves battery branch truth at source level | No overclaim that telemetry snapshot equals full battery estate |
| `branch_facts.bss_slot` | minimally-shaped BSS/slot facts from `fact_order_swaps`, `iot_bss_door_metric`, and `v_bss_doors_latest` with source roles kept separate | Preserves canonical-vs-diagnostic-vs-parity distinctions | No collapse of disabled parity, slot diagnosis, and swap truth into one number family |
| `branch_fact_entry` | Every `branch_facts.*.facts[]` item must carry at minimum `fact_id`, `source_surface`, `packet_a_surface`, `source_role`, `value_or_observation`, `time_basis`, `stable_id_basis`, `collection_caveat`, and `provenance_ref` | Prevents later builders from flattening canonical, diagnostic, and parity facts into one untyped bucket | No anonymous fact rows and no source-free branch summaries |
| `blocked_or_unresolved` | explicit blocker rows with `surface`, `packet_b_disposition`, `question_blocked`, `carry_forward_rule`, `required_authority_if_any` | Keeps missing proof visible instead of inferred away | No blocker disguised as fact |
| `provenance_trace` | source-to-field mapping for every materialized branch block using `field_family`, `field_id_or_name`, `source_surface`, `source_role`, `time_window`, `stable_id_basis`, and `provenance_ref` | Makes later object/report consumers auditable | No opaque field origin |

### 6.2 Minimal artifact shape

```yaml
artifact_family: electrum_to_brain_sense_lane_daily
business_date: YYYY-MM-DD
collected_at: 2026-04-23T06:35:00+07:00
scope: current daily bottleneck wedge
packet_ref: agentic-bi-packet-s1

source_status:
  - source_name: daily_vehicle
    access_path: aggregating_layer.daily_vehicle
    grain: business_date_vehicle_vin
    stable_id_basis: business_date + vehicle_vin
    query_window: business_date = YYYY-MM-DD
    freshness_status: fresh|stale|partial
    collection_caveat: daily snapshot, not event history
    provenance_ref: live source query ref
  - source_name: fact_order_swaps
    access_path: remote(analytics.default.fact_order_swaps)
    grain: order_event
    stable_id_basis: order_id + completed_at
    query_window: raw local-date completed_at/created_at for YYYY-MM-DD WIB
    freshness_status: fresh|stale|partial
    collection_caveat: do not apply +7 to raw timestamps
    provenance_ref: live source query ref

branch_facts:
  bike:
    source_surface: daily_vehicle
    grain: business_date_vehicle_vin
    facts:
      - fact_id: bike_serviceability_snapshot
        source_surface: daily_vehicle
        packet_a_surface: bike_serviceability_snapshot
        source_role: canonical_snapshot
        value_or_observation: <bike/operator fact>
        time_basis: business_date snapshot for YYYY-MM-DD WIB
        stable_id_basis: business_date + vehicle_vin
        collection_caveat: snapshot truth, not event history
        provenance_ref: live source query ref
  transactions:
    canonical_source: fact_order_swaps
    parity_source: daily_company_infra
    facts:
      - fact_id: completed_swaps
        source_surface: fact_order_swaps
        packet_a_surface: daily_transaction_fact
        source_role: canonical_event_fact
        value_or_observation: <completed swap count or event-derived fact>
        time_basis: raw local-date completed_at for YYYY-MM-DD WIB
        stable_id_basis: order_id + completed_at
        collection_caveat: no blind +7 shift
        provenance_ref: live source query ref
      - fact_id: completed_swaps_parity
        source_surface: daily_company_infra
        packet_a_surface: daily_transaction_fact
        source_role: aggregate_parity
        value_or_observation: <aggregate parity delta when used>
        time_basis: business_date aggregate for YYYY-MM-DD WIB
        stable_id_basis: business_date + locked parity envelope
        collection_caveat: parity only; may not replace canonical fact output
        provenance_ref: live source query ref
  battery:
    source_surface: svr_battery_health
    grain: date_at_battery_sn
    facts:
      - fact_id: battery_ready_stock_snapshot
        source_surface: svr_battery_health
        packet_a_surface: battery_ready_stock_snapshot
        source_role: telemetry_snapshot
        value_or_observation: <battery snapshot fact>
        time_basis: date_at snapshot for YYYY-MM-DD WIB
        stable_id_basis: date_at + battery_sn
        collection_caveat: telemetry-covered operational universe only
        provenance_ref: live source query ref
  bss_slot:
    canonical_activity_source: fact_order_swaps
    diagnostic_source: iot_bss_door_metric
    disabled_parity_source: v_bss_doors_latest
    facts:
      - fact_id: active_slot_activity
        source_surface: fact_order_swaps
        packet_a_surface: slot_capacity_state_surface
        source_role: canonical_activity
        value_or_observation: <activity-derived slot fact>
        time_basis: raw local-date completed_at for YYYY-MM-DD WIB
        stable_id_basis: charging_station_sn + output door_number + completed_at bucket
        collection_caveat: canonical real-user swap activity only
        provenance_ref: live source query ref
      - fact_id: eod_slot_diagnostic
        source_surface: iot_bss_door_metric
        packet_a_surface: slot_capacity_state_surface
        source_role: diagnostic_eod_proof
        value_or_observation: <diagnostic slot or physical-proof fact>
        time_basis: explicit WIB window, including final EOD hour when required
        stable_id_basis: time_unix + charging_station_sn + door_number
        collection_caveat: diagnostic only, not canonical user-flow truth
        provenance_ref: live source query ref
      - fact_id: disabled_slot_parity
        source_surface: v_bss_doors_latest
        packet_a_surface: slot_capacity_state_surface
        source_role: latest_snapshot_parity
        value_or_observation: <raw disabled-slot parity fact>
        time_basis: latest snapshot at collection time
        stable_id_basis: last_time_unix + charging_station_sn + door_number
        collection_caveat: latest parity snapshot, not historical day truth
        provenance_ref: live source query ref

blocked_or_unresolved:
  - surface: customer_service_join_surface
    packet_b_disposition: external_needed
    question_blocked: service-level rider impact
    carry_forward_rule: explicit_blocker_only
    required_authority_if_any: customer service system + joined transaction truth

provenance_trace:
  - field_family: branch_facts.transactions
    field_id_or_name: completed_swaps
    source_surface: fact_order_swaps
    source_role: canonical_event_fact
    time_window: raw local-date completed_at for YYYY-MM-DD WIB
    stable_id_basis: order_id + completed_at
    provenance_ref: live source query ref
```

The sample rows above are intentionally illustrative, but the entry keys are mandatory whenever a later builder materializes real sense artifacts.

The artifact is deliberately **minimally shaped**:
- enough to freeze collection boundaries and downstream provenance
- not enough to smuggle in promotion, judgment, recommendation, or rendering logic

## 7. Stop boundary for the sense lane

| Capability | Packet S1 allows it? | Boundary rule |
| --- | --- | --- |
| Live source collection | Yes | Collect the six frozen sources only, with explicit source semantics. |
| Raw/minimally-shaped source artifact materialization | Yes | Materialize one business-date sense artifact with source status, branch facts, blockers, and provenance. |
| Freshness and caveat labeling | Yes | Every included source must carry freshness and caveat metadata. |
| Blocked-surface carry-forward | Yes | Carry blockers forward explicitly using Packet B language. |
| Mechanical parity deltas | Yes | Allowed only when the parity role is explicit, especially `daily_company_infra` vs `fact_order_swaps`. |
| Bottleneck call / promotion | No | Packet C promotion and Packet E-style call formation stay downstream. |
| Daily brief prose | No | Report wording is downstream rendering. |
| CTO integrated memo prose | No | The integrated brief remains a downstream reflex/render consumer. |
| Recommendation ranking / management posture | No | No principal-shaped or action-ranking language inside the sense artifact. |
| Cron cutover / runtime mutation | No | Keep the live report-first flow unchanged in this packet. |

## 8. Blocked-surface carry-forward rules

### 8.1 Packet A/B blocked or proof-gap surfaces that must remain explicit

| Surface | Packet B disposition | Sense-lane handling | Not allowed |
| --- | --- | --- | --- |
| `transaction_asset_linkage` | `proof_gap` | Carry forward as an unresolved attribution gap whenever a downstream consumer wants exact bike/BSS/battery assignment from transaction fact | Do not claim misses or swaps are already causally assigned to exact bike/BSS cohorts |
| `bss_location_coverage_surface` | `proof_gap` | Carry forward as a location-coverage gap when only network totals are available for the business date | Do not infer site-level readiness from network-level counts alone |
| `battery_replenishment_coverage_surface` | `proof_gap` | Carry forward as a station/lane replenishment gap whenever the downstream question needs battery-delivery sufficiency | Do not claim batteries failed to reach the right stations or lanes without the surface |
| `customer_service_join_surface` | `external_needed` | Carry forward as an external dependency blocker | Do not infer tickets, complaints, CSAT, NPS, or SLA impact |
| `assignment_contract_authority` | `external_needed` | Carry forward only when a downstream consumer asks for contract-assigned denominator or surplus logic | Do not claim assigned-bike shortage/surplus from adjacent ops truth |
| `deployment_plan_authority` | `external_needed` | Carry forward only when a downstream consumer asks about rollout pace or absorption timing | Do not claim deployment pace or time-to-absorb from the minimum six-source set |

### 8.2 Included-source caveats that must also survive downstream

Packet S1 also freezes these semantic carry-forward rules for included sources:
- `daily_company_infra` always carries the label **parity/supporting aggregate only**.
- `svr_battery_health` always carries the label **telemetry-covered operational snapshot, not automatically the full battery estate**.
- `iot_bss_door_metric` always carries the label **diagnostic/event surface**.
- `v_bss_doors_latest` always carries the label **latest parity snapshot, not historical day truth**.
- `fact_order_swaps` always carries the label **raw local-date event truth; no blind `+7` shift**.

## 9. Current-runtime crosswalk: downstream consumers and rollback path

### 9.1 Current live job schedule frozen by Packet S1

| Job | Current schedule | Packet S1 reading |
| --- | --- | --- |
| `electrum-daily-board-report` | `06:30 WIB` daily | live downstream consumer / rollback path |
| `electrum-bss-slot-daily-report` | `06:30 WIB` daily | live downstream consumer / rollback path |
| `electrum-battery-daily-report` | `06:30 WIB` daily | live downstream consumer / rollback path |
| `electrum-ai-cto-integrated-brief-daily` | `07:30 WIB` daily | live downstream consumer / rollback path |

### 9.2 Job-by-job crosswalk

| Current job | Current carrier/output | What it does today | Packet S1 downstream classification | Why it stays unchanged now |
| --- | --- | --- | --- | --- |
| `electrum-daily-board-report` | Fleet executive summary pages (`electrum-fleet-executive-summary-*`) plus report artifacts | Mixes source querying, metric shaping, and report delivery for the bike/operator lane | Downstream bike-branch consumer; currently also a report renderer | Packet S1 is not replacing bike report runtime behavior yet; it only freezes the upstream collection boundary |
| `electrum-bss-slot-daily-report` | BSS/slot report pages (`electrum-bss-slot-daily-report-*`) plus report artifacts | Mixes canonical swap querying, parity checking, slot diagnosis, and rendered report output | Downstream BSS/slot consumer; currently also a report renderer | It remains the safety-net lane while S1 freezes which parts belong upstream later |
| `electrum-battery-daily-report` | Battery report pages (`electrum-battery-daily-report-*`) plus report artifacts | Mixes battery-source querying, dark-pool methodology, supporting proof lanes, and rendered report output | Downstream battery consumer; currently also a report renderer | Packet S1 intentionally does not claim full replacement of the current battery-report method tree |
| `electrum-ai-cto-integrated-brief-daily` | CTO integrated brief pages/artifacts | Reads completed daily report pages and renders one compact integrated management brief | Pure downstream reflex/render consumer | It already sits downstream of the report trio and should never be treated as source authority |

### 9.3 Crosswalk of source-querying vs sense-adjacent vs render behavior

| Current job | Raw source querying today | Sense-adjacent materialization today | Reflex/render behavior today | Packet S1 future split reading |
| --- | --- | --- | --- | --- |
| `electrum-daily-board-report` | Yes | Yes | Yes | Later separate bike-source materialization from fleet-summary rendering |
| `electrum-bss-slot-daily-report` | Yes | Yes | Yes | Later separate transaction/BSS collection from board report rendering |
| `electrum-battery-daily-report` | Yes | Yes | Yes | Later separate minimum battery/transaction collection from battery report rendering; deeper report-only supports may remain outside the minimum sense artifact until a later packet freezes them |
| `electrum-ai-cto-integrated-brief-daily` | No raw-source querying; reads report pages | No | Yes | Keep as downstream consumer only |

## 10. Explicit exclusions / out of scope

Packet S1 does **not** do any of the following:
- build collector code or runtime scripts
- create a new repo or choose the final implementation home
- change cron schedules or cut over jobs
- rewrite the current report runners
- redesign the integrated CTO brief
- invent new Electrum-side services
- integrate customer-service or service-level systems
- widen scope beyond the current daily bottleneck wedge
- claim the minimum six-source set already settles every battery-report support dependency

## 11. Definition of done

Packet S1 is done when a reviewer can:
- see the exact six-source live Electrum minimum source set without guessing
- read grain, stable-ID basis, time-basis, freshness semantics, and caveats for every included source
- understand the difference between business-date snapshots and raw/latest event surfaces
- inspect one minimum sense-only artifact contract without finding report prose or management logic inside it
- see exactly how Packet A/B blocked or proof-gap surfaces are carried forward without being inferred away
- see the current report trio and CTO brief treated as downstream consumers and rollback path rather than as source authorities
- confirm that no collector implementation, cron mutation, or runtime mutation leaked into the packet

## 12. Verify path

Review this artifact against:
1. `.hermes/plans/2026-04-23-agentic-bi-packet-s1-approved-office-hours.md`
2. `.hermes/autobuild/packet-s1-checkpoint.yaml`
3. `docs/plans/electrum/agentic-bi-packet-a-bottleneck-truth-surface-denominator.md`
4. `docs/plans/electrum/agentic-bi-packet-b-surface-disposition-vocabulary.md`
5. `docs/plans/electrum/agentic-bi-packet-c-promotion-contract.md`
6. `docs/plans/electrum/agentic-bi-packet-d-first-slice-spec-amendment.md`
7. `docs/plans/electrum/agentic-bi-packet-e-2026-04-21-consequence-check.md`
8. local/live analog and canon pages used to freeze the contract, especially:
   - `/home/jackyujieyang/brain/electrum-agentic-bi-autoplan-packet-s1-sense-lane-2026-04-23.md`
   - `/home/jackyujieyang/brain/electrum-ai-cto-recurring-refresh-loop.md`
   - `/home/jackyujieyang/brain/electrum-analytical-truth-and-metric-lineage.md`
   - `/home/jackyujieyang/brain/electrum-workflow-dossier-otr-deployment-and-activation.md`
   - `/home/jackyujieyang/brain/electrum-report-timestamp-audit-2026-04-17.md`
   - `/home/jackyujieyang/brain/electrum-battery-daily-report-2026-04-21.md`
   - `/home/jackyujieyang/brain/electrum-bss-slot-daily-report-2026-04-21.md`
   - `/home/jackyujieyang/brain/electrum-fleet-executive-summary-2026-04-21.md`
   - `/home/jackyujieyang/.hermes/profiles/satori-hermes/cron/jobs.json`
9. sense analogs:
   - `/home/jackyujieyang/gbrain/docs/plans/email-to-gbrain-upstream-alignment.md`
   - `/home/jackyujieyang/gbrain/recipes/email-to-brain.md`
   - `/home/jackyujieyang/gbrain/recipes/x-to-brain.md`
   - `/home/jackyujieyang/.gbrain/integrations/x-to-brain/RESOLVER.md`
   - `/home/jackyujieyang/.gbrain/integrations/x-to-brain/ops/lane-policy.yaml`

Reviewer checks:
- the six-source set matches the approved S1 autoplan and office-hours framing
- `daily_company_infra` stays parity-only when needed
- every source row has explicit grain, stable-ID basis, time basis, freshness semantics, allowed contribution, and caveat
- the artifact contract is sense-only and stops before bottleneck call or report prose
- blocked/proof-gap surfaces remain explicit and are not reinterpreted as solved
- the current `06:30` report trio and `07:30` integrated brief are treated as downstream consumers / rollback path
- no implementation or runtime mutation scope leaked into the packet

## 13. Review status

This Packet S1 artifact stops at **`review_ready`**.
