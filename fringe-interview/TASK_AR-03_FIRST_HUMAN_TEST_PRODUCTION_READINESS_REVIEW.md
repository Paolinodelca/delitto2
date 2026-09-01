# AR-03 — First Human Test Production Readiness Review

Date: 2026-09-01
Type: Architecture / Product-readiness review
Implementation: none

## 1. Verdict

**A — FIRST HUMAN TEST CAN PROCEED BEFORE FULL KNOWLEDGE PROJECTION.**

The smallest canonically valid, user-observable path is:

`real free-form answer → canonical Evidence → resolved decision_accountability semantic authority → production semantic executor → validated DecisionAccountabilityObservation → bounded Observation explanation`

A full Measurement → DimensionContribution → Knowledge/PKM/Coverage projection is **not required** to obtain the first Product learning requested by AR-03. Product Authority explicitly permits context-scoped Observation without promoting it to a stable person characteristic, and requires explainability, preservation of insufficient observation, and Representation-first user value rather than a score-first result.

The earliest truthful artifact is the existing specialized **`DecisionAccountabilityObservation`**, together with its canonical Evidence/provenance. No new Core artifact or persistent Representation contract is required for the first test.

## 2. Current real-human production path

The repository now contains the production semantic path:

1. accepted Runtime answer can be registered as canonical Evidence;
2. semantic authority is resolved only through the causal acquisition lineage `Evidence → Execution → Plan → CapabilityConfiguration → SolutionDecision → KnowledgeAcquisitionDesign`;
3. `KnowledgeAcquisitionDesign.semanticPolicyRef` owns `professional_semantic_policy:decision_accountability:v1`;
4. the Groq executor receives Evidence text as untrusted data under already-resolved authority;
5. constrained output is converted into the existing specialized `DecisionAccountabilityObservation`;
6. Evidence IDs, Observation identity and semantic/acquisition provenance remain deterministic Application ownership;
7. unknown/not-yet-derived inference-support inputs remain explicit rather than becoming zero.

The production Observation path is therefore structurally complete. The repository has **not** yet demonstrated the semantic executor against the live Groq provider; AR-02D REOPEN explicitly closed only deterministic provider-transport/schema verification.

The existing general Beta journey is not the minimum host for this test. Its staged Runtime can register accepted answers, but the production decision-accountability path requires exact acquisition lineage and the existing Beta path does not automatically construct/attach that controlled lineage to the question/answer. A narrow human-test harness can reuse the existing Runtime/Evidence and semantic components without completing unrelated Beta UX or Knowledge projection.

## 3. Can the first human test stop before Knowledge?

**Yes.**

Product Authority distinguishes an event/context-scoped Observation from broader characterization. One Observation does not automatically establish a stable trait. The first human test can truthfully expose only what the Observation and Evidence establish, without calling it Knowledge, PKM, score, or complete Professional Identity.

The existing canonical artifact is `DecisionAccountabilityObservation`; conceptual labels such as “signal”, “provisional representation” or “representation fragment” are unnecessary and should not become new contracts.

The human can truthfully see, through a bounded presentation layer:

- the episode/Evidence used;
- the observed decision authority (`recommendation`, `shared`, `final`, or explicit contextual `none` when supported);
- the supported consequence scope;
- accountability explicitness when supported, otherwise unknown;
- responsibility continuity when supported, otherwise unknown/qualified;
- sparse decision context and Evidence-local limitations;
- what IMAGO does not know;
- why no stronger conclusion is justified;
- the Evidence/provenance basis for the interpretation.

This is sufficient to test semantic correctness, specificity, explainability, epistemic honesty, useful disagreement, paraphrase stability and perceived value without asserting a stable person characteristic.

## 4. Exact blockers from Observation to Knowledge

Current production free-form execution deliberately sets `evidenceQuality`, `sourceConvergence`, `consistency` and `coverage` to `not_yet_derived`. The specialized Measurement may therefore be valid but inference support remains partial; the generic projection returns `null` unless the specialized result is `draft` **and all four inference-support inputs are known**. Without generic `MeasurementResult`, there is no DimensionContribution and therefore no new Ledger/Snapshot/PKM/Coverage effect.

There is a second independent gate: current specialized strength measurement becomes `insufficient` when required strength semantics such as exact continuity or accountability explicitness are unknown. That behavior is intentional under the corrected contract and must not be “fixed” for the human test.

| Input | Canonical owner | Producer exists now? | Position / fixture status | Minimum conclusion |
| --- | --- | --- | --- | --- |
| `evidenceQuality` | separate Evidence/provenance assessment authority | **No production producer found** | AR-02C deterministic full-path tests can inject known values; production executor does not derive them | implementation/authority boundary remains missing for Knowledge projection, but not for Observation-level human test |
| `sourceConvergence` | cross-Evidence/source epistemic derivation preserving episode independence | **No production producer found** | cannot be produced legitimately from one answer; test/full path may inject it | requires multi-Evidence semantics; not a first-human-test blocker |
| `consistency` | cross-Evidence/Observation derivation over explicit comparison set | **No pre-Measurement producer found** | `aggregateDimensionContributions()` derives a later DimensionKnowledgeState consistency, after Contribution | downstream machinery is too late and cannot be reused upstream without authority |
| `coverage` | canonical Knowledge/acquisition coverage state | **KnowledgeCoverage producer exists**, but no canonical Measurement-input resolver exists | a prior `KnowledgeCoverage` can exist upstream through acquisition lineage; a new `KnowledgeCoverage` is also produced downstream after PKM | exact temporal/layer meaning for Measurement inference support is unresolved; do not wire either direction by assumption |

Therefore the four missing values are **not four automatically authorized tasks**.

## 5. Circularity / repeated-concept findings

### Coverage

There is a real architectural ambiguity and potential circularity.

`projectDecisionAccountabilityMeasureResult()` requires known inference-support `coverage` before it can create the generic MeasurementResult. Yet the AR-02C downstream path creates new `KnowledgeCoverage` only after DimensionContribution → Snapshot → PKM. At the same time, the acquisition chain itself originates from an earlier `KnowledgeCoverage` and preserves `sourceCoverageRef` into Design traceability.

The repository does not establish that either the prior acquisition coverage or the downstream post-contribution coverage is the exact canonical value intended by Measurement inference support. Consequently AR-03 must **not** connect these artifacts. This is an unresolved boundary for full Knowledge projection, not a blocker for Observation-level human testing.

### Consistency

`aggregateDimensionContributions()` calculates a `DimensionKnowledgeState.consistency` only after DimensionContributions exist. It is therefore too late to satisfy the pre-projection consistency required by the specialized Measurement. No authority permits feeding this later value backward.

### Evidence quality / source convergence

No legitimate production producer was found. Source convergence additionally requires cross-Evidence comparison and professional-episode independence, so a single-answer interpreter cannot own it.

## 6. Existing downstream machinery

Existing downstream machinery is useful **after** a generic MeasurementResult exists:

`MeasurementResult → DimensionContribution → KnowledgeLedger → KnowledgeSnapshot → aggregateDimensionContributions() → DimensionKnowledgeState → PersonKnowledgeMatrix → KnowledgeCoverage`.

It already derives concepts including Dimension-state confidence, consistency and conservative coverage. These values occur at a later epistemic layer. They cannot canonically be moved upstream to satisfy the specialized Measurement's inference-support inputs without a separate authority decision/resolution.

The existing `buildRepresentationValueProofProjection()` is also not the right canonical artifact for this first semantic test: it is a dynamic projection over Professional Perception/parser outputs and explicitly states that deep Core Evidence/Knowledge provenance is not propagated claim-by-claim. The specialized Observation is more truthful and more directly explainable for the learning sought here.

## 7. Live Groq gate

**Live Groq semantic verification is the next mandatory gate before exposing this interpretation to a real human.**

The architecture and deterministic constraints are already demonstrated. The largest remaining uncertainty closest to the human-test value is whether the real provider obeys the constrained semantic contract on natural free-form language.

Minimum live verification set:

- clearly supported decision-accountability episode;
- recommendation authority;
- shared authority;
- final authority;
- insufficient/vague episode;
- explicit contextual non-authority;
- ambiguous consequence scope;
- temporal exact / approximate / bounded / unknown cases;
- prompt-like hostile text treated as data;
- paraphrases of the same episode checked for materially coherent semantics.

This gate should verify semantic outputs and failure behavior, not invent statistical validation, Knowledge scores, or new Product semantics.

## 8. Minimum human-test shape

After the live gate passes, the first human test can remain very small:

1. one controlled decision-accountability question backed by a canonical acquisition Design/Execution lineage;
2. one free-form human answer;
3. optional one follow-up only when the episode is too vague to support a valid Observation;
4. direct bounded presentation of the Evidence and resulting `DecisionAccountabilityObservation`;
5. a simple disagreement capture that records whether the user disputes the source Evidence reading or the semantic interpretation, without modifying Professional Identity.

No final IMAGO UX, full report, percentage, complete PKM or complete Representation is required.

## 9. Observable success criteria

- **Semantic correctness:** the Observation faithfully represents the described episode and does not promote consultation/collaboration into authority.
- **Specificity:** the result contains episode-specific authority/scope/accountability/context rather than generic coaching language.
- **Explainability:** the person can identify the Evidence supporting each exposed semantic conclusion.
- **Epistemic honesty:** unknown, unsupported and contextual non-authority remain visibly distinct from deficiency or zero.
- **Useful disagreement:** disagreement can be localized to Evidence meaning versus semantic interpretation.
- **Stability:** reasonable paraphrases produce materially coherent authority/scope semantics while preserving legitimate ambiguity.
- **Surprise/value:** the person reports that the external reading is meaningful enough to justify continuing, ideally reaching the intended “I understand why I might appear this way from the outside” effect.

## 10. Exactly one next task

**AR-03A — Live Groq Decision-Accountability Semantic Verification**

Scope: execute a small controlled live-provider verification of the existing production executor against the minimum cases above, using canonical Evidence and valid acquisition lineage; record pass/fail and semantic deviations; do not add new semantic policy, Knowledge producer, scoring framework, or UI.

Why this minimizes distance to the First Human Test: all deterministic architecture needed to obtain a truthful Observation already exists, while the only untested component directly on the real-human semantic path is the live provider behavior. Building evidence-quality/convergence/consistency/coverage producers first would increase architectural completeness but would not answer the first Product question sooner.

## 11. Verification performed for this review

Repository-first inspection covered all `docs/20-product/`, pertinent `docs/00-continuity/`, the accepted-answer Evidence path, semantic authority resolution, production Groq semantic executor, specialized Observation/Measurement, projection, Dimension/Knowledge/PKM/Coverage machinery, Representation projection, and staged Beta integration.

Executed without source changes:

- `node scripts/test_ar02d_reopen_decision_accountability_production_semantic_executor.js` — PASS;
- `node scripts/test_ar02c_decision_accountability_semantic_integration.js` — PASS;
- `node scripts/fringe_health_check.js` — PASS, all health checks passed.

No live Groq call was executed by this review. No production code, Product Authority, scripts or config were modified.
