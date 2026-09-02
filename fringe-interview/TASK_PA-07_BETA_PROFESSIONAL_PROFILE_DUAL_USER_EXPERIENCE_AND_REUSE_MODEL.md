# PA-07 — Beta Professional Profile, Dual-User Experience and Reuse Model

## Verdict

**A — PRODUCT DIRECTION CONSOLIDATED ON EXISTING PROFESSIONAL IDENTITY; BETA REUSE REQUIREMENT AUTHORIZED WITHOUT PERSISTENCE ARCHITECTURE**

PA-07 is Product Authority consolidation only. No production code, persistence technology, authentication, semantic contract, Core contract, AR-03 closure or First Human Test implementation was changed.

## Repository-first findings

1. **Ownership authority already exists.** `PRODUCT_PRINCIPLES.md` P-01/P-02 and `PRODUCT_DECISIONS.md` PD-002 establish person ownership and explicit, limited, revocable Tutor access.
2. **The canonical concept already exists.** `REPRESENTATION_MODEL.md` defines the persistent professional personal Representation as **Professional Identity**. Therefore “Professional Profile” is not introduced as a second canonical object; it is a Product-facing description of Professional Identity.
3. **Reusable person knowledge already has conceptual/Core foundations.** Evidence/provenance, KnowledgeLedger/KnowledgeSnapshot, PersonKnowledgeMatrix/KnowledgeCoverage, dated Representation states and the decision-accountability Evidence→Knowledge vertical slice exist. They do not yet constitute a complete persisted Beta Professional Identity lifecycle.
4. **Legacy CV+JD/session assumptions remain in implementation.** The parser pipeline still requires `cvText` and `jdText`, and the staged Beta journey is primarily session-shaped. Product Authority was already broader than CV+JD; PA-07 makes continuity/reuse explicit.
5. **PERSON ≠ SESSION ≠ TARGET is compatible with existing authority.** PD-033/PD-034 already separate Person Representation from Target Representation; Beta Session/resume is an interaction lifecycle, not person identity. PA-07 consolidates this as an explicit Product rule.
6. **Dual use does not require two Knowledge engines.** Existing ownership, perspective and Tutor decisions support candidate and career-professional/outplacement perspectives over the same person-owned Professional Identity.
7. **Minimum Beta persistence requirement can remain technology-neutral.** The Product requirement is `SAVE → REOPEN → ENRICH → REUSE`; storage/database/auth/cloud choices remain unauthorized.
8. **Report and application are different Product objects.** Reports are snapshots/derived outputs; the Professional Identity is the living reusable Representation. Return value must come from accumulated supported knowledge, not withheld exports.

## Product direction consolidated

The Beta product cycle is:

`ACQUIRE → UNDERSTAND → HELP → PRESERVE → REUSE`

with the existing **Professional Identity** as the person-owned reusable anchor. Meaningful interactions should improve reusable professional knowledge only when epistemically justified; unsupported/insufficient/rejected material remains no-Knowledge-effect.

Candidate/professional and Tutor/outplacement/career-professional are controlled perspectives over that same canonical knowledge path. Human professional judgment remains human-owned.

## Beta requirement matrix

| BETA REQUIREMENT | CURRENT STATUS | PRODUCT GAP | TECHNICAL IMPLEMENTATION AUTHORIZED NOW? |
|---|---|---|---|
| Create or recover a Professional Identity | PARTIAL | Onboarding/session identity exists, but no complete persisted Professional Identity reopen lifecycle is demonstrated | NO |
| Acquire current CV | AVAILABLE | Existing parser/Beta path consumes CV material | NO |
| Acquire free-form professional material | PARTIAL | Free interview narrative exists; general reusable acquisition is not yet a complete Beta path | NO |
| Acquire additional heterogeneous professional source | PARTIAL | Product/source contracts and structured acquisition foundations exist; end-to-end Beta UX is incomplete | NO |
| Preserve source/Evidence provenance | PARTIAL | Canonical provenance and Evidence paths exist; not all Beta inputs are integrated into one reusable profile | NO |
| Show what IMAGO understood with evidence-aware explanation | PARTIAL | Representation Value Proof/reporting exists; reusable profile review/correction experience is incomplete | NO |
| Keep person and target separate | PARTIAL | Canonically defined; current parser/session entry still materially assumes CV+JD together | NO |
| Immediate CV/professional representation utility | AVAILABLE | Existing report/CV feedback path provides current-session utility | NO |
| Interview preparation/feedback utility | AVAILABLE | Existing interview/report path provides this utility | NO |
| Let supported interaction Evidence contribute to reusable person Knowledge | PARTIAL | Decision-accountability vertical slice exists; broad Beta integration remains incomplete | NO |
| Save and reopen the Professional Identity | MISSING | Session persistence/resume exists, but it is not a persisted reusable Professional Identity | NO |
| Enrich an existing Professional Identity later | MISSING | No complete Product path demonstrates cross-session profile enrichment | NO |
| Reuse the same Professional Identity with a different target | MISSING | Canonically allowed, but no complete Beta implementation demonstrates it | NO |
| Candidate perspective | PARTIAL | Primary Beta path exists but does not yet realize the full reuse model | NO |
| Tutor/outplacement/career-professional perspective | PARTIAL | Product authority exists; delegated-access experience/infrastructure is not complete | NO |
| Report as snapshot, application as living reusable workspace | PARTIAL | Report exists; living persisted/reopenable Professional Identity experience is missing | NO |

`NO` means PA-07 itself does not authorize implementation. It authorizes Product requirements; implementation must be separately scoped repository-first.

## Product Authority changes

Only three canonical Product Authority documents were changed:

- `docs/20-product/PRODUCT_DECISIONS.md` — PD-041 through PD-046 consolidate identity/reuse, person-session-target separation, dual perspectives, report-vs-living Representation and epistemically justified accumulation.
- `docs/20-product/REPRESENTATION_MODEL.md` — extends the existing Professional Identity concept with the Beta continuity/reuse model; no new Representation object is introduced.
- `docs/20-product/PRIVATE_BETA_USER_EXPERIENCE.md` — expands the Beta from a single-session flow to the minimum acquire/understand/help/preserve/reuse Product cycle and records the two perspectives.

No other Product Authority required modification. Existing Product Vision and Principles already support persistence, heterogeneous inputs, person ownership, delegated access, perspective separation and Product-led sequencing.

## First Human Test consequence

AR-03 remains closed and its supervised limitations remain unchanged. The First Human Test is a Product test, not only a decision-accountability executor test. It should evaluate minimum utility, acquisition/usability, correctness of understood professional material, CV/interview support, continuity/reuse potential, candidate perspective and, where practical, outplacement/career-professional value. PA-07 does not define the detailed protocol.

## Next minimum step

**Repository-first First Human Test implementation readiness / gap review.**

The next task should map the newly consolidated minimum Product cycle against the current Beta application boundaries and identify the smallest implementation slice required to execute a supervised human test. It must explicitly test whether existing session stores, acquisition paths and Knowledge artifacts can be reused before authorizing any persistence architecture. E-44 remains deferred unless the active Product path explicitly consumes it.

## Verification

- Full `docs/20-product/` read in canonical order: PASS.
- Current continuity / AR-03 closure alignment: PASS.
- Avoidable Product concept duplication: PASS — existing `Professional Identity` reused.
- Production/test code changes: NONE.
- Persistence/storage/auth technology selected: NONE.
- `git diff --check`: repository ZIP contains no `.git`; equivalent `git diff --no-index --check` against pristine copies of all three changed Product Authority files: PASS.
- Commit/push: NOT PERFORMED.
