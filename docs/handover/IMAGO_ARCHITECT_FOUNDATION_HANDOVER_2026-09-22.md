# IMAGO --- ARCHITECT FOUNDATION HANDOVER

## Stable architecture, product authority and working method

### Prepared 22 September 2026

> PURPOSE
>
> This file is the stable handover for a future IMAGO Architect chat. It
> contains the concepts that should not have to be reconstructed from
> the latest session. It is NOT higher authority than the repository.
>
> Authority order remains: `docs/20-product/` → `docs/00-continuity/` →
> current authorised task → implementation.
>
> The current repository is the technical source of truth.

------------------------------------------------------------------------

## 1. Roles

### Architect/Product chat

Responsible for: - Product Authority; - architecture and semantic
boundaries; - deciding what should or should not be implemented; -
reviewing Builder deliverables before application; - Human Candidate
Test; - deciding when a task is actually closed.

### Builder

Responsible for repository-first implementation only after explicit
authorisation.

Builder must not become Product Authority.

### User

The user is not a software developer and expects: - complete explicit
PowerShell commands; - minimal manual repository work; - Architect to
make product/architecture decisions rather than bounce choices back; -
concise Builder reports: passing checks summarized, detail mainly for
new decisions, differences, anomalies and blockers.

------------------------------------------------------------------------

## 2. Repository discipline

-   Current working tree may intentionally be dirty.
-   Never infer failure merely from absence of commits/task reports
    after earlier consolidated HEAD.
-   No reset/stash/clean unless explicitly authorised.
-   No commit/push unless explicitly authorised.
-   Closed tasks are not reopened without concrete regression.
-   Historical residue, diagnostic test and real downstream defect must
    be distinguished before reopening architecture.
-   Overlay manifest must exactly match overlay.
-   Architect reviews actual changed files, not only Builder report.
-   Human Test is separate from automated verification.

------------------------------------------------------------------------

## 3. IMAGO product identity

IMAGO evolved from FRINGE Interview.

Core product idea:

**IMAGO builds, over time, a grounded understanding of a person's
professional path and reuses it to help the person understand how they
emerge professionally, explore directions, prepare applications and
train for interviews.**

Important positioning:

**IMAGO is not primarily an AI CV writer.**

Simple value expression:

**Ti conosce professionalmente. Ti valorizza senza inventarti.**

Mission boundary:

**Do not evaluate the person.**

The fundamental unit is observable/supportable professional information,
not an inferred personality profile.

------------------------------------------------------------------------

## 4. Core epistemic guardrails

Preserve these distinctions:

`Source → Evidence → Observation → Measurement → DimensionContribution → Knowledge`

and separately:

`Knowledge / authorised professional meaning → Representation / Application`

Rules: - answer ≠ Evidence automatically; - Evidence ≠ Observation; -
Observation ≠ Knowledge; - Representation ≠ Person Knowledge; -
Application wording ≠ Person Knowledge; - target-relative material must
not contaminate canonical Person Knowledge; - non-observed ≠ absent; -
unknown ≠ weakness; - no in-place mutation; - no global
fit/readiness/person score; - no open Person-level inference; - no
improvised universal ontology; - no personality inference; - no
capability inference merely from title/degree/participation; - no
leadership/ownership/causality strengthening without authority.

------------------------------------------------------------------------

## 5. Product architecture

Main conceptual flow:

`CV + professional material + accepted acquisition` → parsing/source
grounding → professional Evidence/Knowledge → Living Professional
Identity → purpose-specific downstream use.

Current Candidate purposes: - understand Professional Representation; -
explore Career Direction; - prepare an Application for an Opportunity; -
build/enrich Professional Identity; - Interview Training.

One Living Professional Identity should support multiple uses without
creating parallel truths.

------------------------------------------------------------------------

## 6. PD-057 --- Episode / Representation material

Bounded Representation/Application material may be derived from
authorised Evidence.

It can describe: - documented episode/activity; - source-supported
participation; - contribution; - context.

It must not silently become: - stable characteristic; - capability; -
trait; - seniority; - fit/readiness.

Important:

`participated ≠ contributed ≠ coordinated ≠ owned ≠ decided`.

Open source-bounded descriptive meaning is allowed without creating an
open Person ontology.

------------------------------------------------------------------------

## 7. PD-058 --- Representation Informational Contribution

Representation Informational Contribution is: - derived; -
non-evaluative; - representation-relative; - about what authorised
information adds to a specific materialised Professional Representation.

It is NOT: - intrinsic importance; - prestige; - capability; -
seniority; - fit/readiness; - a global score.

Useful distinctions:

`source presence ≠ Representation visibility ≠ informational contribution ≠ Connection ≠ purpose-relative relevance`.

First reading should use a bounded semantic/narrative budget and
non-redundancy, not Candidate ranking.

------------------------------------------------------------------------

## 8. PD-059 --- Career Preference Context

Career preferences are: - Candidate-declared; - Candidate-controlled; -
reusable Application/Product state; - NOT canonical factual Person
Knowledge.

Unknown/no preference/not sure are legitimate.

Preferences may influence exploration ordering/filtering but cannot
manufacture Person-side professional support.

Explainability should distinguish: - professional support; - Candidate
preference; - unknown.

------------------------------------------------------------------------

## 9. PD-060/061/062 --- Grounded Application architecture

Canonical application flow:

`Living PI / authorised Representation` + `concrete Opportunity source`
→ Opportunity Understanding → grounded target-relative
selection/emphasis/composition → Grounded Application Package → Targeted
CV + Cover Letter → Candidate review → export.

Target may alter: - selection; - omission; - ordering; - emphasis; -
composition; - wording.

Target may NOT alter Candidate truth.

Candidate claims must remain reconstructably grounded.

### CV

One authoritative grounded content model, multiple presentation
templates.

Expected structure where supported: - Candidate-controlled
identity/contact; - summary; - professional history; - education; -
skills/languages/tools/certifications when authorised.

Prefer one page, two if needed. No padding. No silent truth truncation.
No generic AI adjectives.

### Cover Letter

Candidate-owned first-person natural narrative. Use strongest supported
connections. No invented: - motivation; - admiration; - ownership; -
results; - capability.

### Completeness

Completeness gaps are artifact-relative and non-evaluative. Unknown
remains unknown. Acquisition is optional/skippable.

------------------------------------------------------------------------

## 10. PD-063 --- Artifact Language Transformation

One Professional Identity / one Candidate Application Content Model can
support multiple language materialisations.

Artifact-language transformation is bounded presentation transformation.

It does NOT create: - Candidate truth; - Evidence; - Knowledge; -
capability; - seniority; - personality; - motivation; - fit/readiness; -
language proficiency.

Preserve: -
participation/contribution/collaboration/coordination/ownership; -
shared vs exclusive responsibility; - project result vs Candidate-caused
result; - uncertainty; - epistemic status; - provenance.

English CV ≠ evidence Candidate speaks English.

UI language, source language, JD language, artifact language and
Candidate proficiency are independent.

------------------------------------------------------------------------

## 11. PD-064 --- Candidate Application Semantic Protection Contract

Application-level transformation-control metadata may protect
already-established semantic invariants.

Four bounded dimensions only when already authorised: 1. agency
relationship; 2. responsibility scope; 3. result attribution/causality;
4. epistemic boundary/state.

Protection metadata is NOT: - Candidate meaning itself; - Knowledge; -
Evidence; - capability; - scoring; - universal ontology.

Absence of protection ≠ unrestricted transformation permission.

Model self-attestation or lexical blacklist is insufficient.

------------------------------------------------------------------------

## 12. PD-065 --- Professional Responsibility Scope

Context-bound responsibility states: - `shared_non_exclusive`; -
`exclusive_sole`; - `unknown_not_established`.

"Responsible for X" alone does not establish exclusive responsibility.

Shared responsibility is not a weaker Candidate. Exclusive
responsibility does not automatically imply leadership, capability,
seniority or general ownership.

Responsibility Scope remains distinct from: - Decision Accountability; -
continuing people responsibility; - agency; - result causality.

------------------------------------------------------------------------

## 13. PD-066 / CQ-05 --- Presentation Language Basis

Per-material presentation-language basis: - established IT; -
established EN; - unknown.

It is Application-level metadata, not Candidate truth/proficiency.

No inference from text appearance, locale, JD, defaults or historical
assumptions.

For requested language L:

`C_required ⊆ (D_L ∪ V_L)`

where: - `D_L` = eligible direct material with established presentation
basis L; - `V_L` = VALID CQ-05 materialisation in L.

UNKNOWN requires materialisation even if text "looks" like requested
language.

CQ-05 technical chain is CLOSED / VERIFIED / APPLIED.

Do not reopen absent concrete regression.

------------------------------------------------------------------------

## 14. PD-067 --- Interview Training / Acquisition Boundary

CLOSED / VERIFIED / APPLIED.

Fundamental rule:

**Training Answer ≠ Professional Acquisition Answer.**

Structured purpose authority: - `interview_practice → training`; -
`professional_identity_build_enrich → acquisition`; -
missing/ambiguous/other → unknown/fail closed.

Training answers may support training continuity and feedback but MUST
NOT directly: - enter Evidence Store; - create
Observation/Measurement/Knowledge; - mutate Professional Identity; -
become Application material.

Future optional preserve flow, not yet implemented:

`Training information` → Candidate explicit review/confirmation → NEW
acquisition event → Evidence → Knowledge.

Never retype the original Training Answer as Evidence.

------------------------------------------------------------------------

## 15. FB-01 --- Contextual Beta Feedback

CLOSED / VERIFIED / APPLIED.

Feedback checkpoints include: - Professional Representation; - Career
Direction; - Application Output; - Journey Conclusion.

Feedback is Product/Beta feedback, not professional Evidence/Knowledge.

It stores bounded context/IDs, reaction and voluntary comment, not
automatic copies of full CV/JD/interview/PI/artifacts.

Current feedback UI may be cognitively heavy; this is a bounded UX
follow-up, not a current semantic blocker.

------------------------------------------------------------------------

## 16. Private Beta Home

After PD-068 Human Test:

**HOME --- HUMAN ACCEPTED.**

Returning Candidate Home acts as dashboard/orientation: - what IMAGO
has; - reusable professional knowledge count; - compact consent state; -
five purposes; - action close to purpose; - material management on
demand.

Do not redesign Home absent concrete regression.

------------------------------------------------------------------------

## 17. PD-068 --- Candidate-facing Professional Representation

Key principle:

**IMAGO's epistemic complexity must protect the Representation; it must
not become the Representation.**

Accepted progressive disclosure:

1.  **Professional Reading**
2.  **Perché IMAGO dice questo**
3.  **Fonti e dettagli**

After first PD-068 Human Test: - information architecture / progressive
disclosure = HUMAN ACCEPTED; - narrative composition = NOT YET HUMAN
ACCEPTED.

Candidate-facing Representation must answer:

**"Che cosa hai capito di me professionalmente che vale la pena farmi
notare?"**

not expose the internal semantic audit trail as the primary experience.

Desired flow:

`Truth/support` → `protected professional meaning` →
`narrative composition` → `bounded evidence` → `deeper provenance`.

Not:

`database fields` → `semantic labels` → `disclaimer` → `source dump`.

Narrative coherence must never strengthen semantic meaning.

------------------------------------------------------------------------

## 18. Human Test discipline

Human Test is the product acceptance gate, separate from automated
tests.

Current controlled persona: Marco.

Do not restart the entire journey after every corrective.

Resume from the precise checkpoint.

Human acceptance should distinguish: - semantic correctness; -
information architecture; - narrative quality; - usability; - perceived
value.

Automated PASS does not imply HUMAN ACCEPTED.

------------------------------------------------------------------------

## 19. Deferred items

Do not automatically introduce before current Human Test is completed: -
Voice Input; - Training preserve/acquire UI; - general disclosure/use
permission system; - Employer product; - marketplace/discoverability; -
no-JD canonical Role Understanding; - Portable Professional Identity; -
full Data/Privacy redesign.

Voice future architecture:
`microphone → STT → visible editable transcript → Candidate correction → Send → normal pipeline`.

No voice emotion/personality/trait inference.

------------------------------------------------------------------------

## 20. Future no-JD role understanding

Three cases: 1. concrete JD → source-grounded Opportunity Understanding;
2. role + sector/context without JD → future Target Role Understanding
from explicit occupational/role knowledge, clearly typical rather than
employer-declared; 3. generic title → ask discriminating context.

Model latent knowledge alone is not canonical role truth.

------------------------------------------------------------------------

## 21. Future disclosure/use authority

Current Candidate-only Beta does not require a general permission
architecture before Human Test.

A richer use/disclosure authority will become necessary for future: -
employer access; - discoverability; - marketplace; - proactive
matching; - outreach; - delegated submission.

Professional truth authority and disclosure/use authority are separate
concepts.

------------------------------------------------------------------------

## 22. Performance

Professional Representation latency around \~90 seconds was observed
historically and is a product defect, but it should be addressed in a
dedicated profiling task rather than mixed into semantic/narrative
corrective work.

Future task: **Beta Performance Profiling & Professional Representation
Latency Reduction**

Profile: - context preparation; - model calls; - tokens; - TTFT; -
retries; - validation; - rendering.

Prefer: - deterministic IDs/provenance/coverage; - LLM for bounded
language/composition; - prepared authorised model input; - parallelism
only where independent; - honest progressive UI.

------------------------------------------------------------------------

## 23. Strategic product direction

Candidate direct value comes first.

Possible future evolution: Candidate → Employer → Professional Identity
Network.

But marketplace/network should follow proof of single-sided Candidate
value.

Potential differentiation: 1. persistent Living Professional Identity;
2. dialogue surfaces information not in CV and preserves it; 3. "values
me without inventing me" through grounding/protection; 4. same Person
knowledge reused across Representation, Direction, Application and
Interview; 5. IMAGO explicitly represents what it does not know.

Strategic external documents are exploration/memory, not higher Product
Authority than repository docs.

------------------------------------------------------------------------

## 24. What a future Architect chat should do on startup

1.  Read this stable foundation.
2.  Read the latest **Architect Live Checkpoint** file.
3.  If repository work is required, obtain the latest
    repository/handover and respect repository Product Authority.
4.  Do NOT reconstruct every historical task unless a concrete issue
    requires it.
5.  Resume from the exact current Human Test/task checkpoint.
