# PA-06 — Production Decision Accountability Observation Interpretation Contract

## Verdict

**B — MINIMAL CONTRACT CORRECTION REQUIRED AND AUTHORIZED**

Product meaning is now sufficient to unblock the production path, but the existing specialized Observation/Measurement technical contracts must be minimally corrected because they currently force unknown continuity and inference-support information into numeric defaults.

## Canonical ownership matrix

| Field | Canonical owner | Single Evidence? | Production rule |
| --- | --- | --- | --- |
| `decisionAuthority` | authorized decision-accountability interpreter | yes | `recommendation` = proposes while final authority is elsewhere; `shared` = effective joint authority; `final` = supported final authority; `none` only for explicit contextual non-authority, never missing Evidence |
| `consequenceScope` | authorized interpreter | yes when supported | classify supported decision/consequence reach; no title/seniority/target inference; ambiguity stays unknown |
| `accountabilityEvidence` | authorized interpreter | yes | `claimed` / `implicit` / `explicit` / `explicit_with_outcomes` per PD-040 criteria |
| responsibility continuity | semantic temporal fact + deterministic temporal normalization | sometimes | role tenure is not continuity; exact only when supported; bounds/approximation preserved; unknown ≠ 0 |
| `context` | Evidence semantics + deterministic provenance facts | yes/in part | sparse, supported only |
| `evidenceIds` | deterministic Evidence lineage | yes | required, never model-invented |
| evidence quality | separate Evidence/provenance assessment | not necessarily | not model confidence; may be unknown/not yet available |
| source convergence | cross-Evidence/source derivation | no | requires comparison and PD-031 episode-independence discipline |
| consistency | cross-Evidence/Observation derivation | no | requires explicit comparison set; not model confidence |
| coverage | Knowledge/acquisition coverage state | no | not a single-Observation estimate |
| `limitations` | Evidence interpreter plus relevant deterministic/cross-Evidence producer | in part | preserve supported limits; no completeness inference |

## Unknown treatment

Unknown, not applicable and not yet derived are epistemic states, not numeric values. Missing continuity must not become `0`. Cross-Evidence inference support unavailable in the first vertical slice remains not yet derived. Approximate or bounded duration must preserve its qualification instead of becoming an invented exact month count.

## Minimum SUPPORTED rule

A positive Measurement-eligible Observation requires: eligible Evidence under the resolved policy; a concrete represented decision/context; supported decision responsibility with authority `recommendation`, `shared` or `final`; supported consequence scope; deterministic supporting Evidence IDs; and no semantic contradiction invalidating the interpretation. Accountability explicitness and continuity may remain unknown after contract correction. Explicit contextual `none` may be retained as contextual knowledge but is not a negative Measurement/Contribution. Insufficient Evidence produces no valid Observation and no Knowledge effect.

## Observation contract decision

The current contract **cannot remain unchanged**. Minimal correction must:

- represent responsibility continuity as unknown when unsupported and preserve exact/bounded/approximate temporal semantics;
- represent each inference-support input independently as unknown/not-yet-derived when its canonical producer has not supplied it;
- preserve producer/provenance when inference-support information is present;
- prevent builders/validators from silently normalizing missing semantic information to zero/default enum values.

The exact technical representation is delegated to the next technical task; it must preserve the Product distinctions `known`, `unknown`, `not_applicable`, and `not_yet_derived` where relevant.

## Measurement consequence

The specialized Measurement remains canonical but requires matching minimal semantics: unknown must not score as zero. Measurement may calculate only from known applicable strength components under the existing versioned configuration. If required strength semantics are unavailable, result is insufficient/not-applicable and cannot produce a DimensionContribution. Inference support remains separate from measured strength and may be unavailable/partial; no new coefficients or LLM confidence score are authorized.

## Model role

A production model may execute constrained extraction/classification from free-form Evidence only after semantic authority has already resolved. It may not choose `semanticPolicyRef`, infer authority/scope from target/title/seniority, invent epistemic numbers, convert missing Evidence into negative Evidence, perform unowned cross-source aggregation, or create Knowledge/PKM/Coverage directly.

## Authority files changed

- `docs/20-product/PRODUCT_DECISIONS.md` — PD-040 canonical decision.
- `docs/20-product/REPRESENTATION_MODEL.md` — detailed canonical field ownership, criteria, sufficiency and contract-correction semantics.
- `docs/00-continuity/CONTINUITY.md` — PA-06 verdict and next-step continuity.

No application, Core, Infrastructure, provider, Groq, GM-02, prompt or schema implementation was modified.

## AR-02D implementability

**Yes, with the authorized minimal contract correction implemented before or together with AR-02D.** PA-06 removes the missing Product/Architecture semantic authority identified by AR-02D. The next technical task can implement the corrected specialized Observation/Measurement boundary and the production free-form executor without semantic invention.
