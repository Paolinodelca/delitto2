# IMAGO — EAR Open Points and Product Direction Continuity Note

Status date: 2026-09-09

## Purpose

Preserve all unresolved findings from the current Experience Acceptance Run (EAR) so that Product evolution does not erase already-discovered evidence, time, value, or previously verified behavior.

This document is Project Memory.

It does not override repository Product Authority.

Repository authority order remains:

1. docs/20-product/
2. docs/00-continuity/
3. current task
4. implementation

---

## Product direction confirmed

The Product Perspective Architecture Review concluded:

B — DIRECTION IS COHERENT; MINIMAL NEW PRODUCT AUTHORITY IS REQUIRED BEFORE IMPLEMENTATION

The required Product Authority was subsequently canonicalized.

### Canonical direction

PERSON
→ Living Professional Identity
→ reusable Professional Knowledge
→ Professional Representation
→ Target / Opportunity Context
→ Target-relative Representation
→ derived application artifacts / Interview Practice
→ new eligible Evidence / Knowledge
→ enriched Living Professional Identity.

### Canonical Product-purpose distinction

PD-051 — Product Purpose Determines Interaction Necessity

Status: CANONICAL

PD-052 — Living Professional Identity and Derived Professional Views

Status: CANONICAL

The following distinction is therefore now canonical:

ACQUISITION NECESSITY
≠ REPRESENTATION NECESSITY
≠ OPPORTUNITY / APPLICATION NECESSITY
≠ INTERVIEW-PRACTICE NECESSITY

The canonical Product purposes are:

- professional_identity_build_enrich
- professional_representation_understand
- opportunity_application
- interview_practice

PD-053 remains intentionally deferred until immediately before CV tailoring implementation.

Do not generalize PD-049, PD-050 or PD-006 across all Product purposes.

---

# Human-verified / technically proven

## Browser persistence / restore

PASS — HUMAN VERIFIED.

Verified:

server finalization
→ browser localStorage
→ server stop
→ new server process
→ same browser/profile
→ restore
→ Professional Identity recognized.

The Living Professional Identity can therefore survive the current bounded Beta server lifecycle through the browser continuity artifact.

This proves continuity of the current Beta mechanism, not production persistence architecture.

---

## EAR-13 — Completion/navigation

PASS — HUMAN VERIFIED.

`Concludi esperienza` leads to:

- completed experience;
- saved-PI claim when successful;
- return CTA;
- no redundant final feedback form.

No regression observed during the current EAR.

---

## EAR-14 — REOPEN discoverability

PASS — HUMAN VERIFIED.

After server restart, the same browser/profile recognizes the saved Professional Identity and exposes:

- Riprendi una esistente;
- Crea per questa esperienza;
- source inventory.

Current source inventory visibly includes:

- CV attuale;
- CV precedente;
- Esperienza aggiunta.

No regression observed after PA-01 and its first corrective.

---

## PA-01 — Purpose-aware entry

PARTIALLY HUMAN VERIFIED.

The returning-user entry now exposes three explicit user-facing purposes over the same Living Professional Identity:

- Continua ad arricchire ciò che IMAGO conosce di te
- Mostrami come emergo professionalmente
- Allenami per un colloquio

The fourth canonical purpose:

`opportunity_application`

exists in the technical purpose contract but is correctly not exposed as unfinished user-facing functionality.

The purpose-selection boundary is therefore real and visible.

---

## professional_representation_understand

PASS FOR ROUTING — HUMAN VERIFIED.

Real returning-user path successfully demonstrated:

restored Living Professional Identity
→ purpose = professional_representation_understand
→ blank current CV
→ blank previous CV
→ blank additional material
→ blank Target
→ blank JD
→ Professional Representation materialized
→ no mandatory interview.

The first live attempt exposed a PA-01 routing defect:

Understand
→ interview-oriented preparation
→ mandatory JD / targetRole validation
→ FAIL.

PA-01 First Corrective Rework fixed that boundary.

A subsequent live attempt reached the correct Representation path but failed on Groq HTTP 429.

Retry later succeeded.

Therefore:

- Understand no longer requires Interview Practice;
- Understand no longer requires Target/JD;
- previously authorised material can be reused without re-entry;
- failure rendering preserves/re-exposes the recoverable PI.

This closes the purpose-routing defect for Understand.

It does NOT close Professional Representation quality.

---

## interview_practice

PASS FOR ROUTING — HUMAN VERIFIED.

Real returning-user path successfully demonstrated:

same restored Living Professional Identity
→ purpose = interview_practice
→ prior CV/material fields left blank
→ Target = Operations Manager
→ JD supplied
→ existing PI reused
→ target-aware Initial Understanding
→ Interview Practice flow available.

Prior professional material did not need to be re-entered.

This demonstrates that Interview Practice is now behaviorally distinct from Understand.

A previous attempt with both Target and JD blank failed in interview preparation. This is not currently considered a routing defect because the existing Interview Practice flow legitimately requires target context.

Interview Practice quality remains subject to EAR-05, EAR-07, EAR-08 and EAR-10.

---

## EAR-09 — PD-050 suppression

PARTIALLY PROVEN.

One earlier live run proved suppression after an authorised adaptive `decision_tradeoff_probe`.

A later run showed Core `decision_tradeoffs`, but the visible sequence did not establish that the authorised probe had occurred first.

Do not call this a regression without causal-lineage/runtime-trace evidence.

PA-01 and its corrective did not intentionally alter PD-049 or PD-050.

---

# Current blocker in PA-01

## professional_identity_build_enrich

FAIL — HUMAN EXPERIENCE.

This is now the remaining PA-01 purpose-routing blocker.

Real test:

restored Living Professional Identity
→ purpose = professional_identity_build_enrich
→ new professional delta supplied
→ Target/JD blank
→ Continue

failed immediately.

Operator diagnostic:

boundary:
`private_beta_preparation`

stage:
`parser_to_interview_preparation`

task:
`unknown`

failureKind:
`preparation_failed`

errorClass:
`application`

No provider failure was reported for this request.

Current evidence strongly indicates that Build/Enrich still reaches an interview-oriented preparation path instead of completing through an autonomous Living Professional Identity enrichment path.

This must be repository-traced before assuming the exact implementation cause.

Required Product behavior:

existing Living Professional Identity
+ authorised new professional delta
→ additive enrichment
→ preserve previous sources / Knowledge / provenance
→ updated current professional view when appropriate
→ no mandatory Interview Practice
→ no mandatory Target/JD.

Build/Enrich must not become an interview merely because new information is being acquired.

PA-01 therefore remains NOT fully Experience Accepted.

---

# Still open

## EAR-02 — Provider latency / robustness

OPEN — HIGH BETA PRIORITY.

Repeated real-provider observations now include:

- approximately 90–100 second preparation times;
- conservative provider concurrency = 1;
- multiple successful runs only after long waits;
- Groq HTTP 429 token rate-limit failure during Understand;
- later retry success.

The 429 diagnostic correctly exposed:

boundary:
`model_adapter`

stage:
`provider_model_call`

task:
`candidateProfile`

failureKind:
`rate_limit`

httpStatus:
`429`

providerCode:
`rate_limit_exceeded`

providerType:
`tokens`

The corrected Understand path then propagated the failure as:

boundary:
`professional_representation_materialization`

stage:
`restored_identity_to_candidate_projection`

This is no longer a minor operational note.

Before external Beta use, IMAGO needs an acceptable strategy for:

- latency;
- visible waiting/progress behavior;
- rate-limit resilience;
- retry/backoff where appropriate;
- provider-call efficiency;
- failure recovery;
- possibly provider/model strategy if required.

Do not mix this automatically with Product-purpose implementation. It is an independent Beta-readiness concern.

---

## EAR-03 — Source synthesis contradictions

OPEN — HIGH PRIORITY.

Live Understand and Interview Practice outputs continue to demonstrate contradictions between available material and top-level synthesis.

Example:

the Representation states that these areas remain insufficiently represented:

- eventual role changes or growth;
- eventual international/multicultural experience;

while the same output recognizes:

- current Production Supervisor experience;
- previous Industrialization Engineer experience.

The historical source also previously contained the Germany production-line launch, but Germany is no longer surfaced in the current professional view.

This is direct human evidence that:

source persistence
≠
coherent source synthesis.

Need:

- coherent multi-source synthesis;
- no contradiction between source-grounded facts and top-level conclusions;
- preservation of uncertainty;
- no invented absence;
- no loss of professionally relevant historical information.

---

## Historical-source retention / Germany / Atlas

OPEN — IMPORTANT.

Current visible source inventory contains:

- CV attuale;
- CV precedente;
- Esperienza aggiunta.

However, information richness is not reliably preserved in the materialized view.

Germany remains absent from current output despite being part of the historical CV material used earlier.

Atlas-related material remains visible in transformed form, but the interpretation is unstable.

Across runs, Atlas has been represented with labels including concepts such as:

- supplier-ramp-up / cross-functional coordination;
- supplier-management responsibility;
- operational project coordinator.

This variation raises a semantic-grounding concern.

The source evidence supported work with supply chain, quality and production around supplier ramp-up and continuity problems.

It must not silently become an unsupported formal role, title, ownership or authority claim.

Need to distinguish:

1. source retained;
2. source information extracted;
3. information synthesized;
4. semantic interpretation supported;
5. user-facing Representation.

Do not treat source-list visibility alone as proof of semantic retention.

---

## EAR-04 — Add/correct understanding loop

OPEN / PARTIAL.

The UI exposes:

“Manca qualcosa? Aggiungi o correggi materiale professionale”

with fields for additional professional experience/context and an “Aggiorna la lettura” action.

This loop has not yet been fully human revalidated for:

new delta
→ additive source handling
→ regenerated understanding
→ preservation of previous authorised information.

It must remain distinct from the standalone Product purpose:

`professional_identity_build_enrich`.

An add/correct control inside Interview Practice is not a substitute for a functioning Build/Enrich purpose.

---

## EAR-05 — Opening grounding

OPEN.

The Interview Practice flow acknowledges that previous material has been considered, but earlier runs still asked broadly for:

- career path;
- roles;
- context;
- responsibilities;
- duration;
- results.

For Interview Practice, revisiting known areas can be legitimate because rehearsal has a different purpose from Knowledge acquisition.

For Build/Enrich, repeating already-known material is inappropriate unless new acquisition necessity exists.

Purpose-aware routing therefore clarifies the issue but does not close it.

---

## EAR-06 — Contextual feedback UX

OPEN / PARTIAL.

Final feedback duplication was corrected.

Contextual feedback remains cumbersome and visually prominent.

Current Interview Practice Initial Understanding still exposes a contextual feedback block with multiple choices and optional comment.

Keep feedback separate from:

- Evidence;
- Knowledge;
- Living Professional Identity.

Need future UX simplification without weakening the boundary.

---

## EAR-07 — Immediate intra-session redundancy

OPEN.

Earlier live interviews demonstrated substantial overlap between opening and the following question.

Purpose-aware routing does not solve this.

Important distinction:

- recurrence across separate Interview Practice sessions may be legitimate;
- immediate mechanical repetition within the same session is not.

Need acquisition/conversation behavior that understands what has just been asked and answered.

---

## EAR-08 — Adaptive phrasing

OPEN / PARTIAL.

Wording improved from earlier fake-interruption language, but adaptive transitions must remain grounded in actual conversational context.

Avoid:

- fake reactions;
- formulaic “approfondiamo” transitions;
- wording implying a response to something the user did not actually say.

---

## EAR-10 — Canonical question skeleton too visible

OPEN.

For Interview Practice, recurring professional dimensions and themes are legitimate.

Exact or mechanically similar question wording is not.

Surface adaptation must preserve:

- semantic authority;
- acquisition objective;
- question-purpose boundaries.

Do not solve this through uncontrolled generative rewriting.

---

## EAR-11 — Professional Representation quality

OPEN — VERY HIGH PRODUCT PRIORITY.

The first successful human `professional_representation_understand` run exposed the current limitation clearly.

The screen titled:

“Come emergo professionalmente”

currently behaves primarily as a structured inventory/projection of sources.

Observed output included:

CV attuale:
- Operations/Manufacturing professional;
- approximately 12 years;
- Production Supervisor;
- operational coordination / KPI / priorities.

CV precedente:
- Industrialization Engineer;
- production-line/process experience.

Esperienza aggiunta:
- supplier ramp-up;
- cross-functional coordination.

Canonical reusable knowledge count:
2.

This proves that IMAGO possesses and can reuse professional material.

It does NOT yet produce a sufficiently rich answer to:

“Come emergo professionalmente?”

Missing or weak:

- professional trajectory;
- evolution across roles;
- synthesis across sources;
- credible professional assets;
- relationship between earlier and current experience;
- explanation of why a particular professional image emerges;
- meaningful use of reusable Knowledge;
- context-sensitive professional positioning.

A supported trajectory might, for example, connect:

industrialization / process and line-launch experience
→ increasing operational responsibility
→ Production Supervisor
→ cross-functional operational coordination and problem solving

but only when the underlying evidence supports each link.

The exact wording must not be hardcoded.

The system must derive the synthesis from authorised Evidence/Knowledge.

EAR-11 should not be solved as a cosmetic report rewrite.

It is a core Product-value problem.

---

## EAR-12 — Internal epistemic / implementation language too visible

OPEN — HIGH UX PRIORITY.

Examples still visible include:

“Conoscenze canoniche riutilizzabili disponibili: 2”

This may be useful internally but provides little direct user value.

Desired hierarchy:

1. plain-language professional conclusion;
2. supporting evidence / why IMAGO sees it;
3. uncertainty / insufficient observation where relevant;
4. deeper provenance/technical detail progressively available when useful.

Do not remove epistemic rigor.

Translate it into user-meaningful language.

---

## EAR-15 / EAR-18 — Meaningful REOPEN → ENRICH → REUSE

TECHNICALLY PROVEN, SEMANTICALLY NOT CLOSED.

Continuity lifecycle is technically proven through:

SAVE
→ browser persistence
→ server restart
→ RESTORE
→ REOPEN
→ reuse.

Understand and Interview Practice now both demonstrate reuse of the restored Living Professional Identity.

Still unresolved:

- autonomous Build/Enrich;
- additive enrichment;
- historical information richness;
- Germany;
- Atlas semantic stability;
- quality of reusable Professional Knowledge;
- whether accumulated PI meaningfully improves subsequent Product experiences.

Persistence is not equivalent to useful memory.

Useful memory is not equivalent to adaptive Product intelligence.

---

# Purpose-routing status

## professional_representation_understand

ROUTING: PASS — HUMAN VERIFIED.

QUALITY: OPEN under EAR-03 / EAR-11 / EAR-12.

---

## interview_practice

ROUTING: PASS — HUMAN VERIFIED with Target/JD.

QUALITY: OPEN under EAR-05 / EAR-07 / EAR-08 / EAR-10.

---

## professional_identity_build_enrich

ROUTING / EXECUTION: FAIL — HUMAN VERIFIED.

Current priority:
complete an autonomous additive enrichment path over the same Living Professional Identity.

---

## opportunity_application

CANONICAL PURPOSE IDENTITY EXISTS.

USER-FACING PRODUCT FLOW: intentionally not implemented yet.

Do not expose placeholder functionality.

---

# Product direction not to lose

The value proposition is not:

“IMAGO stores more information.”

Nor is it:

“IMAGO performs interviews.”

The core value loop is:

Build professional history progressively once
→ keep it current
→ understand how the person emerges
→ bring a new Target/JD/opportunity
→ retrieve relevant parts of the full professional history
→ derive opportunity-specific application material
→ prepare for the interview
→ incorporate new eligible Evidence/Knowledge
→ improve the Living Professional Identity.

The current CV is one source/view.

It is not the canonical professional record.

Future target-specific CVs should be derived artifacts from the Living Professional Identity.

The Living Professional Identity should make it possible to reuse relevant experience from the whole professional history, including information no longer present in the current CV.

Future Company/Opportunity Context may use authorised external/public information, but must:

- preserve provenance;
- remain separate from Person Knowledge;
- not convert public claims into verified internal culture;
- not manufacture target fit.

A future shareable Professional Identity / Representation snapshot may be valuable for recruiters/HR, but remains:

- person-owned;
- derived;
- contextual;
- distinct from the persistent Living Professional Identity.

---

# Product architecture now demonstrated

Current evidence increasingly supports the following Product hierarchy:

Living Professional Identity
= persistent person-owned professional asset/workspace

Professional Representation
= evidence-based materialized view of the Living Professional Identity for a declared purpose/context

Target-relative Professional Representation
= Professional Representation interpreted against a separate Target/Opportunity context without rewriting Person Knowledge

Application artifacts
= derived outputs such as future target-specific CVs, cover letters or other application material

Interview Practice
= purpose-specific interaction that may legitimately revisit known professional areas for rehearsal while also producing new eligible Evidence when epistemically justified.

No second Professional Identity or parallel Knowledge path should be introduced.

---

# Recommended sequence from current state

1. Complete PA-01 Build/Enrich execution routing through a bounded corrective.

2. Human-verify:
   existing PI
   + new professional delta
   → additive enrichment
   → no Target/JD
   → no mandatory interview
   → previous professional history preserved.

3. Close PA-01 Experience Acceptance only when all three currently exposed purposes have demonstrated their intended routing in the real UI.

4. Address Professional Representation quality as a distinct Product/architecture task:
   - EAR-03;
   - historical-source synthesis;
   - Germany;
   - Atlas semantic stability;
   - trajectory;
   - credible assets;
   - EAR-11;
   - EAR-12.

5. Address provider latency/rate-limit robustness as an independent Beta-readiness workstream.

6. Return to Interview Practice quality:
   - EAR-05;
   - EAR-07;
   - EAR-08;
   - EAR-10.

7. Revisit contextual feedback UX.

8. Only after the Living Professional Identity and Professional Representation provide sufficient value, consider:
   - PD-053;
   - opportunity-specific CV generation/tailoring;
   - Company/Opportunity Context;
   - shareable Professional Views.

---

# Immediate next task

PA-01 SECOND CORRECTIVE REWORK

Purpose:

complete the missing `professional_identity_build_enrich` execution path.

Required human acceptance:

existing restored Living Professional Identity
+
only new professional delta
+
blank Target/JD
→
successful additive enrichment
→
previous authorised history retained
→
no Interview Practice required.

Do not broaden this corrective into:

- Professional Representation redesign;
- CV generation;
- Company Context;
- generic cross-session question suppression;
- provider architecture;
- new semantic dimensions.

---

# Guardrail

Before closing any future IMAGO task, explicitly state:

- which EAR open point it addresses;
- whether it closes, partially closes, or leaves it unchanged;
- what human/live verification remains;
- whether any previously closed point regressed.

Do not close an EAR issue from repository tests alone when the issue concerns:

- perceived experience;
- live provider behavior;
- semantic usefulness;
- source-retention quality;
- Professional Representation quality.

A technical PASS is not automatically an Experience Acceptance PASS.

Persistence
≠ useful memory
≠ semantic synthesis
≠ Product intelligence.