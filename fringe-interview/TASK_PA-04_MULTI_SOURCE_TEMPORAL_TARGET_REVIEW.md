# TASK PA-04 — Multi-Source Professional Representation, Temporal Evidence and Target Comparison Review

## 1. Executive verdict

The proposed evolution is substantially aligned with the existing IMAGO Product model. The review does **not** justify a new architecture before the First End-to-End Human Test.

Five Product clarifications/decisions are mature enough to canonize now:

- source time ≠ event/experience time;
- multiple sources ≠ multiple independent professional episodes;
- Professional Evolution ≠ Representation Evolution;
- Person Representation ≠ Target Representation;
- target importance + insufficient Knowledge → acquisition priority, not mismatch.

The multi-source paradigm, heterogeneous acquisition, person ownership, target-relative interpretation, uncertainty handling and Tutor/outplacement value are already strongly canonical.

**AR-02B remains the first technical task.** No new technical prerequisite is required before it.

---

## 2. Review matrix

| # | Topic | Current Product Authority | Repository support | Classification | First Human Test |
|---|---|---|---|---|---|
| 1 | Multi-source professional input | PRODUCT_VISION already requires heterogeneous input; Representation Model already allows CV, LinkedIn, documents, interview, Tutor, assessments, experience, certifications, aspirations/constraints | Acquisition/Evidence foundations preserve source/provenance; Interview is already only one acquisition mechanism | **ALREADY CANONICAL** | **INCLUDE** |
| 2 | Conversational/free input + simple upload | Minimal interaction, progressive disclosure and authorised material acquisition already canonical; Beta UX was still CV-first in wording | Current application supports material acquisition/interview but not a generalized source UX | **CANONICAL CLARIFICATION** | **INCLUDE** |
| 3 | Historical sources; source time vs event time | Persistent dated states and temporal validity exist, but source-production time vs described-event time was not explicit | Existing provenance/timestamps support partial mechanics; no complete temporal semantics | **NEW PRODUCT DECISION REQUIRED** | **INCLUDE** for at least one historical-source case |
| 4 | Professional Evolution vs Representation Evolution | P-04/P-05/P-07 and dated snapshots strongly imply distinction; historical omission rule not explicit | Snapshot/history foundations exist; no Knowledge Timeline / trajectory implementation required | **NEW PRODUCT DECISION REQUIRED** | **INCLUDE principle; DEFER timeline UI/architecture** |
| 5 | Episode identity / Evidence independence | Product already separates source diversity, independence and convergence, but does not explicitly prevent multi-source episode double counting | Evidence identity/provenance and independence concepts exist; no canonical professional episode identity contract | **NEW PRODUCT DECISION REQUIRED** | **INCLUDE principle; OPTIONAL explicit duplicate-source case** |
| 6 | Dimension Evidence State | Coverage, confidence, quality, reliability, independence, consistency are explicitly separate; measured strength vs inference support is canonical in PA-03 | Core has these concepts across Observation/Measurement/Dimension/Snapshot paths; context/temporal breadth are not universal state semantics | **ALREADY CANONICAL** for existing factors; context/temporal breadth **DEFER** as universal semantics | **INCLUDE existing uncertainty signals** |
| 7 | Person vs Target Representation | P-14, PD-016, PD-021 and PD-023 establish perspective separation and non-score-first comparison, but exact epistemic separation deserved consolidation | TargetModel/target-aware application structures exist separately from Person Knowledge | **CANONICAL CLARIFICATION / NEW PRODUCT DECISION** | **INCLUDE** |
| 8 | Candidate gap ≠ Knowledge gap | P-04, PD-021, PD-023, PD-027 already forbid uncertainty → weakness | Coverage and Knowledge state machinery preserve unknown/insufficient states | **ALREADY CANONICAL** | **INCLUDE** |
| 9 | Target-driven Knowledge Acquisition | PD-005/006/007 plus Coverage → Opportunity → Need → Strategy → Requirement → Design → Plan → Runtime → Evidence already establish acquisition from observability gaps | Full declarative Knowledge Acquisition chain exists | **CANONICAL CLARIFICATION / NEW PRODUCT DECISION** to make “priority, not mismatch” explicit | **INCLUDE** conceptually |
| 10 | Tutor/outplacement value hypothesis | PRODUCT_VISION explicitly names outplacement value; Beta UX already defines Candidate and Tutor-assisted cohorts | Consent/permission foundations exist; full Tutor workspace is not required | **ALREADY CANONICAL**; value remains a **VALIDATION HYPOTHESIS** | **INCLUDE** one small Tutor/outplacement cohort |
| 11 | Target discovery / career exploration | Vision allows direction/change, but no canonical target-discovery semantics | No justified career recommendation engine; current Representation model preserves future compatibility | **VALIDATION HYPOTHESIS / DEFER** | **DEFER** |

---

## 3. Product Authority modifications made

Only existing canonical homes were modified.

### `docs/20-product/PRODUCT_DECISIONS.md`

Added:

- **PD-030 — Source time and professional event time are distinct**
- **PD-031 — Source multiplicity does not imply professional-episode independence**
- **PD-032 — Professional evolution and Representation evolution are distinct**
- **PD-033 — Person Representation and Target Representation remain epistemically separate**
- **PD-034 — Target importance may prioritize acquisition, never manufacture mismatch**

### `docs/20-product/REPRESENTATION_MODEL.md`

Consolidated:

- multi-source professional Evidence;
- source time vs event/experience time;
- historical source semantics;
- Professional Evolution vs Representation Evolution;
- source/Evidence/episode identity and convergence;
- Person vs Target Representation;
- conceptual target-comparison states;
- target-driven acquisition without negative scoring.

### `docs/20-product/PRIVATE_BETA_USER_EXPERIENCE.md`

Clarified only the existing Material Acquisition direction:

- free/conversational professional input + simple document upload;
- CV is a common source, not the product boundary;
- users need not classify material using IMAGO's internal taxonomy.

No new Beta flow was introduced.

No continuity document required modification because this task changes Product semantic authority, not implementation status.

---

## 4. Exact new Product Decisions

### PD-030 — Source time and professional event time are distinct

For dated professional material, source/material production time and the time of the professional event described by that source are distinct whenever both are knowable. Neither is inferred from the other; unknown remains unknown.

### PD-031 — Source multiplicity does not imply professional-episode independence

Multiple sources may converge on one professional episode. Source identity, Evidence identity and episode identity are distinct. Repeated descriptions must not be counted automatically as independent professional experience.

### PD-032 — Professional evolution and Representation evolution are distinct

Changes in supported professional history/Knowledge are distinct from changes in how the person represented that history at different times. Historical omission does not prove historical absence.

### PD-033 — Person Representation and Target Representation remain epistemically separate

Person Representation carries Evidence/Knowledge and epistemic uncertainty. Target Representation carries requirements/expectations/relevance. Target importance cannot alter Person Knowledge or turn insufficient observation into weakness.

### PD-034 — Target importance may prioritize acquisition, never manufacture mismatch

High target importance plus insufficient Knowledge may increase priority for additional Evidence acquisition through the existing pipeline; it cannot itself produce negative scoring or mismatch.

---

## 5. Gap classification

### Can be validated without new architecture

The First Human Test can already validate:

- heterogeneous real professional material;
- free narrative plus documents;
- recognition/non-genericity of the resulting Representation;
- explainability and explicit uncertainty;
- target-relative usefulness;
- historical-source handling at Product/experience level;
- whether repeated sources are recognized as potentially describing the same episode;
- Candidate and small Tutor/outplacement value.

### Requires Application / UX work

Eventually needed for a richer product experience, but not a prerequisite to resume AR-02B:

- convenient multi-document acquisition;
- conversational source intake beyond the current narrow Beta path;
- display of source/event dates where useful;
- user-facing handling of source convergence/episode ambiguity;
- explicit Person-vs-Target comparison presentation;
- Tutor-assisted workflow beyond the current permission foundations.

These are Application/UX gaps, not reasons to redesign Core now.

### Would require new Core contracts only if later evidence proves necessary

Deferred:

- first-class professional episode identity / episode graph;
- generalized temporal Evidence/event model;
- Knowledge Timeline;
- Professional Trajectory contract;
- universal context-breadth or temporal-breadth scoring;
- career target discovery/recommendation engine.

PA-04 deliberately does not authorize any of these contracts.

---

## 6. First End-to-End Human Test — minimum scope

The first human test should remain a **Representation value test**, not a completeness test.

Minimum test input:

```text
authorised free professional narrative
+ at least one current professional source
+ optional additional heterogeneous source(s)
+ optional target
→ Evidence
→ canonical Knowledge where semantic policy exists
→ Professional Representation / Perception
→ target-relative interpretation when target exists
```

The cohort should cover:

1. **multiple professional sources** for at least some participants;
2. **at least one participant with historical CV/document material**;
3. **at least one target-relative comparison**;
4. **a small Tutor/outplacement-assisted case/cohort**, preserving person ownership and explicit permission.

The observable validation questions are whether the result is:

- meaningful;
- non-generic;
- recognizable;
- Evidence-backed;
- explainable;
- explicit about uncertainty;
- useful relative to a target when present.

The test must explicitly reject these failure modes:

- historical omission interpreted as absence;
- repeated descriptions of one episode counted as multiple independent experiences;
- insufficient observation presented as weakness/mismatch;
- target importance rewriting Person Knowledge;
- Tutor contribution/access changing Professional Identity ownership.

### Not required for the test

Do **not** block the test on:

- Knowledge Timeline;
- episode graph;
- universal scoring;
- complete temporal architecture;
- career recommendation engine;
- B2B platform;
- recruiter integrations;
- universal multi-source taxonomy.

---

## 7. Recommended technical sequence

### First technical task: AR-02B — Semantic Authority Resolution Boundary

**AR-02B should remain first.**

PA-03 already removed its Product-semantic blocker for the first canonical vertical:

```text
professional_semantic_policy:decision_accountability:v1
```

Nothing established by PA-04 requires a new Core or Product prerequisite before AR-02B.

AR-02B should remain narrowly scoped to resolving the explicit canonical semantic authority already authorized by PA-03. It should not absorb temporal modelling, episode identity, multi-source UX or target comparison.

### After AR-02B

The next work should be selected against the shortest route to the First End-to-End Human Test, favoring Application integration over speculative Core expansion. A repository-first test-readiness review may then identify only the concrete missing Application/UX wiring needed to run the defined human-test cases.

No automatic micro-task sequence is authorized by PA-04.

---

## Final conclusion

PA-04 confirms that IMAGO's current Representation model is already structurally compatible with the proposed multi-source and target-relative direction.

The necessary Product consolidation is now explicit without introducing premature technical contracts.

The First End-to-End Human Test should exercise multi-source material, one historical-source case, one target-relative case and a small Tutor/outplacement case, while keeping temporal timelines, episode graphs and career discovery out of critical scope.

**Recommended next technical task: AR-02B.**

No production code was modified. No commit or push was executed.
