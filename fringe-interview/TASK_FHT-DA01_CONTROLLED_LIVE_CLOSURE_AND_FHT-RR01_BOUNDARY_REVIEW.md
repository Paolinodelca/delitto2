# IMAGO — FHT-DA01 Controlled Live Closure
## and FHT-RR01 Representation Value Boundary Review

### Verdict

**A — FHT-DA01 CONTROLLED LIVE VERIFIED AND CLOSED**

Separately:

**FHT-RS02 — DA + QO LIVE STRUCTURAL ACCEPTANCE CONFIRMED**

Next task:

**FHT-RR01 — Professional Representation Semantic Richness Preservation**

No implementation performed. No repository source modified. No commit. No push.

---

## 1. FHT-DA01 live closure

The controlled Marco result is consistent with the repository path.

The current staged journey passes `runtimeKnowledgeResults` into `buildProReportV2()`. That report builds `professionalPerception.authorizedSemanticMaterial` only from current-session results that have:

- an allowed DA/QO semantic policy;
- a canonical Observation;
- a `knowledgeSnapshot`.

At completion, `runProfessionalRepresentationSynthesis()` consumes exactly that authorized material. The UI renders `professionalRepresentation.claims` as the primary final Representation.

For the combined DA + QO case, the deterministic synthesis emits the same semantic shape observed live:

- bounded decision scope;
- personal contribution linked to measurable operational outcome;
- measurable quantity;
- contribution distinct from sole causality/ownership.

The RS02 regression independently asserts the combined DA+QO claim, the `circa 20%` evidence summary, contribution-only limitation, rejection of invented ownership/causality/score, and final UI rendering.

Therefore the displayed live Representation can be derived from authorized current-session DA + QO semantic material through the current RS02 path; no transcript-to-Representation shortcut is required by the repository.

### Closure

**FHT-DA01 is closed.**

The live result also confirms the structural RS02 acceptance condition: both DA and QO can reach the final Professional Representation together.

---

## 2. Trace observability note

`state.session.fhtSemanticExecutionTraces` is accumulated in the current journey state.

The trace is not exposed in the current `publicResult` or Private Beta UI.

Repository authority does not establish operator exposure of this trace as a blocking requirement for FHT-DA01 closure. It is therefore a **separate observability note**, not a reason to repeat the controlled live or reopen DA01.

---

## 3. What canonical DA/QO material currently contains

### Decision Accountability

The canonical DA Observation can contain:

- `decisionAuthority`;
- `consequenceScope`;
- `accountabilityEvidence`;
- `responsibilityContinuity`;
- semantic `context`;
- Evidence IDs;
- limitations;
- semantic provenance.

The DA context is bounded to the represented decision/responsibility/consequence semantics. The Measurement retains context and a lossless specialized result inside the generic Measurement projection.

In the controlled Marco case, the relevant canonical meaning is therefore bounded decision responsibility/shared authority in a concrete professional context, with continuity allowed to remain unknown.

### Quantified Outcome

The canonical QO Observation/Measurement can contain:

- measurable outcome;
- quantitative value/unit/approximation/direction;
- contribution relationship;
- causality boundary;
- semantic context;
- Evidence IDs;
- limitations;
- semantic provenance.

The controlled Marco result therefore canonically supports the ~20% outcome plus bounded personal contribution and non-exclusive causality.

---

## 4. Where richness is lost

The observed product-quality gap is real, but it is not a generic LLM or text-length problem.

### A. Before / inside canonical Knowledge

The generic `DimensionContribution` / `KnowledgeSnapshot` layer intentionally reduces DA/QO into dimension state, direction/estimate, confidence state and provenance references. It does not itself carry the full specialized Observation semantic payload.

The current application compensates for this by keeping the canonical Observation and Measurement alongside the `knowledgeSnapshot` in `runtimeKnowledgeResults`. `buildAuthorizedSemanticMaterial()` reads that authorized result envelope rather than trying to reconstruct semantics from the aggregate Knowledge state.

Therefore this generic Knowledge compression is **not the immediate final-Representation blocker for the current DA/QO slice**, although it is an architectural limitation to remember for future reusable Knowledge richness.

### B. `runtimeKnowledgeResults` → `authorizedSemanticMaterial`

QO projection preserves its current structured Observation fields.

DA projection preserves:

- authority;
- consequence scope;
- context;
- limitations;
- confidence/inference support references.

It currently drops DA `accountabilityEvidence` and `responsibilityContinuity`.

For the controlled Marco run, exact continuity was intentionally unknown, so that omission does not explain the visible loss. If accountability explicitness is known in a future run, it can be lost at this boundary.

### C. `authorizedSemanticMaterial` → synthesis input

The synthesis input keeps:

- DA authority + scope + context + limitations;
- QO measurable outcome + quantity + contribution relationship + causality boundary + context + limitations.

Thus important authorized context reaches the synthesis boundary.

### D. Synthesis input → structured Professional Representation claim

**This is the first failing boundary that explains the controlled live richness gap.**

`buildDeterministicProfessionalRepresentation()` does not construct a richer semantic claim from the available semantic units.

When DA and QO coexist it collapses them into one fixed combined claim and one fixed explanation. The combined claim uses essentially:

- existence of DA;
- existence of QO;
- formatted quantity;
- contribution-only limitation.

It does **not** use the DA semantic `context`, does not express the concrete decision/trade-off/responsibility context, and does not use QO semantic context or contribution relationship to create distinct structured value statements.

The bounded model cannot repair this structural compression: reconciliation requires exactly the pre-existing deterministic claim IDs and count and permits only wording replacement. It cannot add another supported claim or enlarge the semantic claim contract.

The UI is not the bottleneck: it renders all canonical claims, explanations, supporting evidence and limitations it receives.

### Exact first failing boundary

**AUTHORIZED DA/QO SYNTHESIS INPUT  
→ STRUCTURED PROFESSIONAL REPRESENTATION CLAIM CONSTRUCTION**

More specifically:

**canonical semantic units with context and bounded relationships  
→ one generic combined DA+QO claim skeleton**

This is primarily a **structured claim-schema / deterministic synthesis projection** problem, with a smaller upstream DA projection loss for `accountabilityEvidence` / `responsibilityContinuity`.

---

## 5. Information that cannot yet be safely recovered downstream

Not every professionally useful detail from the interview is already a canonical structured DA/QO fact.

Examples such as:

- the full trade-off shape;
- progressive intervention strategy;
- detailed prioritization logic;
- named cross-functional coordination pattern;
- KPI identity;
- before/after methodology;
- monitoring over subsequent weeks;
- persistence of the result;

may appear textually inside current semantic context/outcome strings, but the current DA/QO contracts do not normalize all of them into independently typed semantic fields.

They must **not** be recovered by reading the raw Runtime transcript or by allowing a narrative model to reinterpret free text.

FHT-RR01 therefore must preserve and expose richer meaning only where that meaning is already canonically structured/authorized. Any later task that wants additional independently claimable semantic roles must first verify whether existing Product Authority and semantic contracts actually authorize their normalization.

---

## 6. Product Authority

**No new Product Decision is required for the minimal next task.**

Existing authority is sufficient to preserve more of the semantic meaning that is already authorized:

- PD-024 defines a sparse professional semantic grammar including action/contribution, professional relationship, responsibility/accountability scope, context and outcome;
- PD-027 preserves context-scoped Observation without converting it into a stable trait;
- PD-028/029/040 bound DA;
- PD-048 bounds QO;
- Representation remains evidence/knowledge-based and non-score-first.

This authority is sufficient for a bounded downstream preservation task.

It is **not** authority to invent new semantic dimensions or to promote arbitrary transcript detail.

---

# FHT-RR01 — Professional Representation Semantic Richness Preservation

## Objective

Preserve materially more of the already-authorized current-session DA/QO semantic meaning when projecting it into the canonical Professional Representation, without reopening Evidence interpretation and without changing epistemic scope.

## Scope

FHT-RR01 should minimally:

1. make `authorizedSemanticMaterial` lossless for the already-canonical DA fields that are relevant downstream, including known/unknown accountability and continuity semantics where applicable;
2. define a richer bounded synthesis-input/claim contract that can carry authorized DA/QO context and relationships without raw transcript access;
3. allow multiple semantically distinct claims when DA and QO support distinct professional value, rather than forcing one generic combined claim;
4. make deterministic fallback preserve the same semantic richness;
5. allow any optional model only to realize those fixed structured claims linguistically;
6. preserve Evidence/Knowledge provenance, limitations, epistemic state and contribution/causality boundaries;
7. keep the final UI a projection of canonical claims rather than a semantic interpreter.

## Non-scope

Do not:

- read raw Runtime transcript to enrich Representation;
- use question wording, keywords or expected signals as semantic authority;
- introduce new professional dimensions;
- infer leadership, ownership, competence, readiness or target fit;
- turn contribution into causality;
- turn shared authority into sole/final authority;
- turn unknown into weakness or zero;
- add a universal score;
- redesign Adaptive Acquisition or Core timeline;
- fix conversational referential grounding;
- implement Beta feedback persistence;
- implement semantic-trace operator exposure;
- create new persistent Professional Identity architecture.

## Acceptance criteria

FHT-RR01 is acceptable only if deterministic tests prove that:

1. DA-only Representation can preserve supported bounded decision semantics beyond the generic phrase “perimetro decisionale” when those semantics are already canonical.
2. QO-only Representation preserves quantity, contribution relationship, causality boundary and supported semantic context without copying raw transcript.
3. DA + QO may produce more than one structured claim when the authorized semantic units support distinct value.
4. A combined synthesis must not erase the individual DA/QO semantic support.
5. Known DA optional semantics are not silently dropped; unknown remains explicitly unknown/not asserted.
6. The model cannot add claim IDs, facts, quantities, dimensions, ownership, causality, target conclusions or confidence.
7. Deterministic fallback and bounded-model realization have equivalent semantic support/provenance.
8. UI renders the richer canonical claims without interpreting source material.
9. Existing FHT-DA01, KC01, AI01, AS01 and RS02 epistemic guardrails remain PASS.
10. No raw answer/transcript appears in final Representation merely because it exists inside Evidence or a broad context string.

## Stop conditions

Stop with a Product/Architecture blocker if implementation would require any of the following:

- making a professionally useful detail claimable when it is not represented by an existing authorized DA/QO semantic field;
- defining new semantic roles whose truth cannot be established under current DA/QO authority;
- treating generic Observation context text as permission for unrestricted downstream reinterpretation;
- creating broader person characterization from a single event without authority under PD-027;
- changing the meaning of DA or QO rather than preserving already-authorized meaning.

---

## Separate queued findings

Remain separate and are not part of FHT-RR01:

- Conversational Referential Grounding;
- Adaptive Acquisition ↔ Core Timeline redundancy;
- Beta feedback persistence/operator retrieval;
- semantic execution trace operator exposure.

---

## Final review verdict

**A — FHT-DA01 CONTROLLED LIVE VERIFIED AND CLOSED**

**FHT-RS02 — DA + QO LIVE STRUCTURAL ACCEPTANCE CONFIRMED**

**NEXT MINIMAL TASK: FHT-RR01 — Professional Representation Semantic Richness Preservation**

**No new Product Authority required for this bounded task.**

No implementation performed.
