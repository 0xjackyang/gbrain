# Packet C — Daily Bottleneck Canonical-Object Promotion Contract

Status: `review_ready`
Date: 2026-04-23
Scope: current daily bottleneck wedge only; Packet A denominator and Packet B disposition baseline

## 1. Purpose and scope

Packet C defines the **promotion contract** into the canonical bottleneck object for the current daily bottleneck wedge.

This packet is **planning/spec only**:
- take Packet A surface coverage as fixed input
- take Packet B dispositions as fixed input
- define what may be promoted into the canonical bottleneck object
- define what evidence, provenance, and proof-status must accompany promoted fields
- define what must remain outside the object
- show concrete promotion outcomes using Packet A surfaces and Packet B dispositions
- stop before storage implementation, API contract, customer-service integration, or broader BI ontology work

Packet C preserves the approved order:
1. **coverage** — Packet A names the surfaces
2. **disposition** — Packet B assigns each named surface one role
3. **promotion** — Packet C defines what dispositions may enter the canonical object and in what way
4. **rendering** — later work may format promoted truth for briefs, dashboards, or other outputs

## 2. Fixed inputs and invariants

Packet C is valid only if it keeps these inputs and invariants intact:
- Packet A remains the authoritative denominator for the wedge and names the full surface universe.
- Packet B remains the authoritative disposition layer and assigns exactly one disposition to each Packet A surface.
- Packet C does **not** add, remove, rename, or merge Packet A surfaces.
- Packet C does **not** reinterpret Packet B dispositions into hidden analyst judgment.
- The wedge remains **transaction-first**: bike, BSS/slot, and battery claims stay anchored to same-day transaction-backed truth where relevant.
- Contradictions stay visible; they are not silently collapsed into a clean narrative.
- Missing proof stays visible; it is not promoted as if already proved.
- The canonical bottleneck object stays **principal-neutral** and carries truth, proof, and gaps rather than recommendations or audience-specific prose.

## 3. What the canonical bottleneck object is allowed to do

The canonical bottleneck object is the minimum same-day object that lets a later builder answer all of the following without hidden judgment:
- what the current bottleneck call is, or whether a call is still not proven
- which promoted facts support that call
- which promoted facts challenge or qualify that call
- which metrics define the call and its thresholds
- which truth gaps or external dependencies still prevent stronger claims
- exactly which Packet A surfaces and Packet B dispositions authorized each promoted field

The canonical bottleneck object is therefore an **evidence-bearing object**, not a memo, recommendation engine, or CEO brief.

## 4. Promotion eligibility by Packet B disposition

### 4.1 Disposition-level contract

| Packet B disposition | Promotion eligibility | Allowed role inside canonical object | Not allowed |
| --- | --- | --- | --- |
| `canonical_truth` | **Eligible for direct promotion** | May anchor `bottleneck_call`; may populate `evidence_for`, `counter_evidence`, `key_metrics`, and `provenance_trace`. | Cannot bypass provenance or formula requirements; cannot become recommendation language. |
| `supporting_truth` | **Eligible for contextual promotion** | May populate `evidence_for`, `counter_evidence`, `key_metrics`, and `provenance_trace` as qualifying or denominator-setting truth. | Cannot stand alone as the sole bottleneck anchor when a primary branch-state anchor is required. |
| `contradiction_surface` | **Eligible for comparative promotion** | May populate `evidence_for`, `counter_evidence`, `key_metrics`, and `provenance_trace` to keep mismatch, denominator drift, or branch conflict explicit. | Cannot stand alone as the sole branch source-of-record for `bottleneck_call`. |
| `proof_gap` | **Ineligible for truth promotion** | May populate `blockers_truth_gaps` with explicit unmet proof requirements and provenance references. | Cannot populate `bottleneck_call`, `evidence_for`, `counter_evidence`, or `key_metrics` as if already true. |
| `external_needed` | **Ineligible for truth promotion** | May populate `blockers_truth_gaps` with the missing authority, external dependency, or join requirement. | Cannot populate truth-bearing fields until the external authority exists and is frozen in a later packet. |
| `render_only` | **Never eligible** | None. | Cannot appear anywhere as evidence, proof, metric, or call basis. |

### 4.2 Packet A proof-status implications

Packet A proof status does not itself decide promotion, but it constrains what Packet C may do:
- Packet A `required` surfaces may promote only according to their Packet B dispositions.
- Packet A `assumed` surfaces land in Packet B `proof_gap` and therefore stay out of truth-bearing promoted fields.
- Packet A `blocked` surfaces land in Packet B `external_needed` and therefore stay out of truth-bearing promoted fields.
- Packet A `excluded` surfaces land in Packet B `render_only` and therefore never enter the canonical object.

## 5. Required proof, evidence, and provenance envelope

Every promoted field family entry must carry a minimum audit envelope so a reviewer can explain why it is inside the canonical object.

### 5.1 Minimum required metadata for every promoted entry

| Required attribute | Why it is required |
| --- | --- |
| `source_surface` or `source_surfaces` | Names the Packet A surface(s) authorizing the promoted entry. |
| `packet_a_group` | Shows whether the entry came from the transaction spine, a branch, contradiction layer, or blocked/external layer. |
| `packet_a_proof_status` | Preserves the Packet A proof boundary. |
| `packet_b_disposition` | Shows the promotion rule that authorized or disqualified the entry. |
| `business_date` / `as_of` | Keeps the object tied to a same-day wedge read. |
| `grain` | Prevents hidden aggregation drift. |
| `owner_system_of_record` | Makes the authority path explicit. |
| `freshness_or_cadence` | Shows whether the source is same-day, daily, near-real-time, or other approved cadence. |
| `formula_or_measurement_basis` | Required for any metric or derived statement so later builders know how the number was formed. |
| `proof_status` | States whether the promoted entry is `direct_proven`, `contextual_proven`, `comparison_proven`, or `not_proven`. |
| `provenance_ref` | Gives the traceable path back to the source surface and any derivation layer. |

### 5.2 Allowed promoted proof-status values

| Promoted `proof_status` | When it may be used |
| --- | --- |
| `direct_proven` | Entry comes directly from `canonical_truth` and is used as first-order evidence. |
| `contextual_proven` | Entry comes from `supporting_truth` and qualifies or frames a direct claim. |
| `comparison_proven` | Entry comes from `contradiction_surface` and keeps disagreement or pinch-point logic explicit. |
| `not_proven` | Entry is a blocker/truth-gap item sourced from `proof_gap` or `external_needed`; it never appears as promoted truth. |

If a proposed field cannot satisfy this envelope, it does **not** belong in the canonical bottleneck object yet.

## 6. Minimum promoted field families and contract

| Field family | What may be promoted | Minimum required contents | Hard exclusions |
| --- | --- | --- | --- |
| `bottleneck_call` | A single principal-neutral same-day bottleneck statement, or an explicit `not_proven` state if the wedge cannot yet support a call. | `call_statement`, `business_date`, `scope`, `source_surfaces`, `packet_b_dispositions`, `proof_status`, `why_this_call_is_allowed`, `why_stronger_claims_are_not_allowed_if_applicable`, `provenance_ref`. | No recommendation language, no audience-targeted memo prose, no Jack/Satori-shaped prioritization logic. |
| `evidence_for` | Truth entries that support the current call. | For each entry: `claim`, `source_surface`, `packet_b_disposition`, `value_or_observation`, `formula_or_measurement_basis`, `owner_system_of_record`, `freshness_or_cadence`, `proof_status`, `provenance_ref`. | No `proof_gap`, `external_needed`, or `render_only` sources. |
| `counter_evidence` | Truth entries that challenge, qualify, or narrow the current call. | Same minimum fields as `evidence_for`. Contradiction surfaces are explicitly allowed here. | No hidden suppression of conflicting surfaces; no unproved gaps framed as counter-facts. |
| `key_metrics` | Metrics that define or bound the call. | For each metric: `metric_name`, `value`, `unit_if_any`, `formula`, `source_surface`, `owner_system_of_record`, `cadence`, `threshold_or_decision_bound`, `proof_status`, `provenance_ref`. | No metric without formula; no threshold without named source or owner. |
| `blockers_truth_gaps` | Missing proof surfaces, blocked authorities, stale truth, or unresolved linkage that materially limits the call. | For each blocker: `missing_or_unsettled_surface`, `packet_b_disposition`, `question_blocked`, `what_is_missing`, `required_authority_or_integration`, `current_packet_boundary`, `proof_status`, `provenance_ref`. | No gap disguised as proved causal truth. |
| `provenance_trace` | Object-level trace showing why each promoted field is inside the object. | For each promoted field: `field_family`, `field_id_or_name`, `source_surfaces`, `packet_a_proof_status`, `packet_b_disposition`, `derivation_type`, `business_date`, `owner_system_of_record`, `provenance_ref`. | No opaque or implicit field origin. |

### 6.1 Hard object-boundary rules

The following boundary rules are mandatory:
- A `bottleneck_call` must be anchored by at least one `canonical_truth` surface.
- A `supporting_truth` entry may strengthen or qualify a call, but not replace the required primary anchor.
- A `contradiction_surface` may support or challenge a call, but it must cite the underlying compared surfaces in `provenance_trace`.
- A `proof_gap` or `external_needed` surface may justify a `not_proven` state or a limited-scope call, but it may not be promoted as if it were observed truth.
- If a stronger causal statement depends on a `proof_gap` or `external_needed` surface, the causal statement stays out of `bottleneck_call` and moves to `blockers_truth_gaps` as an unmet proof requirement.
- If the only available support for a claim is a render surface, the claim stays out of the canonical object entirely.

## 7. Complete surface-by-surface promotion crosswalk

| Surface | Packet B disposition | Promotion eligibility | Allowed field families | Prohibited use inside canonical object |
| --- | --- | --- | --- | --- |
| `daily_transaction_fact` | `canonical_truth` | Directly eligible | `bottleneck_call`, `evidence_for`, `counter_evidence`, `key_metrics`, `provenance_trace` | Cannot be replaced by a renderer summary. |
| `transaction_asset_linkage` | `proof_gap` | Not eligible as truth | `blockers_truth_gaps`, `provenance_trace` | Cannot be used to assert bike/BSS/battery attribution as already proved. |
| `transacting_denominator_rollup` | `supporting_truth` | Contextually eligible | `evidence_for`, `counter_evidence`, `key_metrics`, `provenance_trace` | Cannot be the sole bottleneck anchor without primary branch truth. |
| `bike_serviceability_snapshot` | `canonical_truth` | Directly eligible | `bottleneck_call`, `evidence_for`, `counter_evidence`, `key_metrics`, `provenance_trace` | Cannot imply causal reason categories not separately proved. |
| `bike_unavailability_reason_surface` | `proof_gap` | Not eligible as truth | `blockers_truth_gaps`, `provenance_trace` | Cannot be used to claim maintenance, repair, or retrieval is definitively the cause. |
| `bike_activation_deployment_surface` | `proof_gap` | Not eligible as truth | `blockers_truth_gaps`, `provenance_trace` | Cannot be used to claim absorption pace as proved same-day bottleneck logic. |
| `bss_capacity_snapshot` | `canonical_truth` | Directly eligible | `bottleneck_call`, `evidence_for`, `counter_evidence`, `key_metrics`, `provenance_trace` | Cannot hide slot-state disagreement if slot truth says otherwise. |
| `slot_capacity_state_surface` | `canonical_truth` | Directly eligible | `bottleneck_call`, `evidence_for`, `counter_evidence`, `key_metrics`, `provenance_trace` | Cannot be promoted without same-day provenance. |
| `bss_location_coverage_surface` | `proof_gap` | Not eligible as truth | `blockers_truth_gaps`, `provenance_trace` | Cannot be used to claim transacting-vs-installed site coverage as already settled. |
| `battery_ready_stock_snapshot` | `canonical_truth` | Directly eligible | `bottleneck_call`, `evidence_for`, `counter_evidence`, `key_metrics`, `provenance_trace` | Cannot by itself prove replenishment reach or health quality. |
| `battery_health_serviceability_surface` | `supporting_truth` | Contextually eligible | `evidence_for`, `counter_evidence`, `key_metrics`, `provenance_trace` | Cannot stand alone as the sole bottleneck anchor without ready-stock or other primary branch truth. |
| `battery_replenishment_coverage_surface` | `proof_gap` | Not eligible as truth | `blockers_truth_gaps`, `provenance_trace` | Cannot be used to assert route/station replenishment sufficiency as proved fact. |
| `static_vs_transacting_comparison` | `contradiction_surface` | Comparatively eligible | `evidence_for`, `counter_evidence`, `key_metrics`, `provenance_trace` | Cannot stand alone as the sole branch source-of-record. |
| `cross_branch_capacity_mismatch` | `contradiction_surface` | Comparatively eligible | `evidence_for`, `counter_evidence`, `key_metrics`, `provenance_trace` | Cannot stand alone as the sole branch source-of-record. |
| `assignment_contract_authority` | `external_needed` | Not eligible as truth | `blockers_truth_gaps`, `provenance_trace` | Cannot be used to claim contract-assigned denominator or surplus as already known. |
| `customer_service_join_surface` | `external_needed` | Not eligible as truth | `blockers_truth_gaps`, `provenance_trace` | Cannot be used to inject complaint/ticket logic into the canonical object. |
| `deployment_plan_authority` | `external_needed` | Not eligible as truth | `blockers_truth_gaps`, `provenance_trace` | Cannot be used to claim rollout pace or site activation authority as already proved. |
| `daily_brief_renderer` | `render_only` | Never eligible | None | Cannot appear as evidence, metric, call basis, or provenance authority. |
| `dashboard_tile_pack` | `render_only` | Never eligible | None | Cannot appear as evidence, metric, call basis, or provenance authority. |

## 8. Worked examples using Packet A surfaces and Packet B dispositions

### 8.1 Example A — Slot-capacity bottleneck is promotable

Allowed promoted shape:
- `bottleneck_call`: "Usable slot capacity is the current same-day bottleneck for the wedge."
- Primary anchors:
  - `slot_capacity_state_surface` (`canonical_truth`, `direct_proven`)
  - `daily_transaction_fact` (`canonical_truth`, `direct_proven`)
- Qualifying/supporting evidence:
  - `transacting_denominator_rollup` (`supporting_truth`, `contextual_proven`) to show the claim is evaluated on transacting denominators
  - `cross_branch_capacity_mismatch` (`contradiction_surface`, `comparison_proven`) to show slots are the pinch point relative to bikes and batteries
- `key_metrics` must include formula, owner, cadence, and threshold for usable slots and missed/failed transactions.

Not allowed in the same object:
- `bss_location_coverage_surface` may **not** be used to claim station-level coverage is already settled because Packet B marks it `proof_gap`.
- `daily_brief_renderer` may **not** be used as proof or wording authority because Packet B marks it `render_only`.

### 8.2 Example B — Bike bottleneck may be promoted, but causal reason may not

Allowed promoted shape:
- `bottleneck_call`: "Bike serviceability is the current same-day bottleneck for the wedge."
- Primary anchor:
  - `bike_serviceability_snapshot` (`canonical_truth`, `direct_proven`)
- Supporting context:
  - `daily_transaction_fact` (`canonical_truth`, `direct_proven`) for same-day outcome impact
  - `static_vs_transacting_comparison` (`contradiction_surface`, `comparison_proven`) if static deployed counts would otherwise mask the transacting shortfall

Not allowed:
- `bike_unavailability_reason_surface` may **not** be promoted into `evidence_for` to claim that maintenance backlog is definitively the cause because Packet B marks it `proof_gap`.
- That missing causal explanation belongs in `blockers_truth_gaps` with `proof_status: not_proven`.

### 8.3 Example C — Contract-assignment or deployment claims stay outside promoted truth

Not allowed promoted shape:
- "The real bottleneck is assigned-bike shortage under contract authority."
- "The real bottleneck is deployment pace against the rollout plan."

Why not allowed:
- `assignment_contract_authority` is `external_needed`.
- `deployment_plan_authority` is `external_needed`.
- `bike_activation_deployment_surface` is `proof_gap`.

Allowed canonical-object outcome instead:
- Keep any proven same-day bike/BSS/battery call limited to the surfaces that are actually promotable.
- Add blocker entries explaining that contract-assigned denominator and rollout-plan authority are missing, so stronger surplus or absorption claims remain out of scope.

### 8.4 Example D — Battery branch call can be limited by missing replenishment proof

Allowed promoted shape:
- `battery_ready_stock_snapshot` may populate `evidence_for` and `key_metrics` as direct ready-stock truth.
- `battery_health_serviceability_surface` may populate contextual evidence that qualifies whether nominal stock is truly usable.

Required limitation:
- `battery_replenishment_coverage_surface` is `proof_gap`, so Packet C may **not** promote station-level replenishment sufficiency as proved truth.
- If the bottleneck claim depends on whether batteries are reaching the right stations or lanes, the object must either:
  - narrow the call to what ready-stock and health truth actually prove, or
  - mark the stronger location-specific call as `not_proven` and record the replenishment surface under `blockers_truth_gaps`.

## 9. Explicit exclusions / out of scope

Packet C does **not** do any of the following:
- define storage schema, warehouse tables, ETL, or API contracts
- integrate customer-service systems or imply the customer-service join exists
- expand into broader Electrum BI ontology beyond the current daily bottleneck wedge
- define renderer wording, dashboard composition, or memo layout
- include principal-specific recommendation language
- include CEO-summary prose
- include Jack/Satori-shaped prioritization logic
- rank actions, prescribe interventions, or choose who should care most
- smuggle `proof_gap` or `external_needed` surfaces into evidence-bearing truth fields
- treat render outputs as evidence or provenance authority

## 10. Definition of done

Packet C is done when a reviewer can:
- take any proposed canonical-object field and explain exactly why it is inside or outside the object
- trace that answer back to a named Packet A surface and a single Packet B disposition
- verify that every promoted truth field carries the required proof and provenance envelope
- verify that `proof_gap`, `external_needed`, and `render_only` sources stay out of truth-bearing promoted fields
- verify that contradictions remain visible through `counter_evidence` or comparative evidence rather than being hidden
- verify that the object remains principal-neutral and rendering-neutral
- verify that the packet stopped at promotion contract definition and did not widen into implementation or broader ontology work

## 11. Verify path

Review this artifact against:
1. `.hermes/plans/2026-04-23-agentic-bi-packet-c-approved-office-hours.md`
2. `.hermes/autobuild/packet-c-checkpoint.yaml`
3. `docs/plans/electrum/agentic-bi-packet-a-bottleneck-truth-surface-denominator.md`
4. `docs/plans/electrum/agentic-bi-packet-b-surface-disposition-vocabulary.md`
5. the approved canon refs named in those files, especially:
   - `electrum-agentic-bi-autoplan-packets-a-e-2026-04-22`
   - `electrum-week-1-first-slice-spec-daily-bottleneck-truth-substrate`

Reviewer checks:
- every Packet A surface appears in the Packet C promotion crosswalk with a clear eligibility outcome
- the disposition-level contract matches the Packet B vocabulary and does not collapse distinct dispositions
- the minimum promoted field families are all present and have required contents
- no `proof_gap`, `external_needed`, or `render_only` surface is allowed into truth-bearing promoted fields
- the worked examples demonstrate both inclusion and exclusion using real Packet A surfaces
- principal-specific recommendation language, CEO-summary prose, and Jack/Satori prioritization logic are explicitly excluded
- no scope expansion into storage implementation, API contract, customer-service integration, or broader BI ontology occurred

## 12. Review status

This Packet C artifact stops at **`review_ready`**.
