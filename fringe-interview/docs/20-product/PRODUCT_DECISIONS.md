# Product Decisions

## PD-001 â€” Consent before personal data
**Status:** CANONICAL
**Decision:** Explicit consent precedes acquisition or use of personal material.

## PD-002 â€” Professional Identity ownership
**Status:** CANONICAL
**Decision:** The Professional Identity always belongs to the person; Tutor access is explicit and revocable.

## PD-003 â€” Representation first
**Status:** CANONICAL
**Decision:** Reports, CVs, interview outputs and coaching are views or products derived from the Representation, not substitutes for it.

## PD-004 â€” Interview opening
**Status:** CANONICAL
**Decision:** Every interview begins with a free presentation of the candidate's professional journey.

## PD-005 â€” Adaptive probing
**Status:** CANONICAL
**Decision:** Follow-up questions are generated only when additional evidence is needed to reach sufficient target observability.

## PD-006 â€” Minimum intrusiveness
**Status:** CANONICAL
**Decision:** Once a target dimension is sufficiently observable, the interview does not probe it further without a new reason.

## PD-007 â€” Role-aware questioning
**Status:** CANONICAL
**Decision:** Question selection is primarily driven by target relevance, evidence gaps and seniority expectations.

## PD-008 â€” Interviewer style as context
**Status:** CANONICAL
**Decision:** Interviewer style changes delivery, pressure and probing behaviour; it does not require a separate duplicated question bank.

## PD-009 â€” Preferred interaction mode
**Status:** CANONICAL
**Decision:** Voice is preferred when available; text remains fully supported.

## PD-010 â€” Behavioural timing
**Status:** CANONICAL
**Decision:** Response timing and interaction behaviour are observable signals, never standalone evaluations.

## PD-011 â€” Continuous primary flow
**Status:** CANONICAL
**Decision:** The main experience remains linear and focused; explanatory detours are deferred until after the task or explicitly requested.

## PD-012 â€” Contextual feedback
**Status:** CANONICAL
**Decision:** Feedback is requested as close as practical to the experience it evaluates; general feedback is requested at the end.

## PD-013 â€” Progressive reporting
**Status:** CANONICAL
**Decision:** The report first communicates a few high-value messages and exposes detailed evidence progressively.

## PD-014 â€” Professional Perception first
**Status:** CANONICAL
**Decision:** The primary Interview outcome is how the candidate currently emerges professionally, not the interview transcript or a list of answer scores.

## PD-015 â€” Credibility assets
**Status:** CANONICAL
**Decision:** Professional Perception must identify credible assets already present, not only weaknesses or missing signals.

## PD-016 â€” Target-relative interpretation
**Status:** CANONICAL
**Decision:** The same evidence may support different interpretations for different roles, seniority levels, organizations or interviewer contexts.

## PD-017 â€” Recipe version traceability
**Status:** CANONICAL
**Decision:** Every derived complex-dimension result must preserve the exact recipe and version that produced it.

## PD-018 â€” No automatic latest recipe
**Status:** CANONICAL
**Decision:** Multiple recipe versions may coexist; the system never silently selects the newest or most favourable version.

## PD-019 â€” Feedback does not alter identity
**Status:** CANONICAL
**Decision:** Beta feedback evaluates the product experience and never modifies the Professional Identity.

## PD-020 â€” Product-led sequencing
**Status:** CANONICAL
**Decision:** When two solutions are architecturally valid, prefer the one that produces greater observable value for the current release without closing reasonable future options.

## PD-021 â€” Representation Value Proof
**Status:** CANONICAL
**Decision:** The Private Beta must make its principal Professional Representation conclusions understandable through progressive disclosure of what emerges, why IMAGO sees it, what remains insufficiently observed and how the conclusion relates to the current target. User-facing explainability remains distinct from internal technical traceability and does not expose implementation structures. Insufficient observation is not absence or a weakness of the person, and coverage or confidence must not become a person score.

## PD-022 â€” Dynamic characterization first
**Status:** CANONICAL
**Decision:** For the Private Beta, emergent Professional Representation characterization is a dynamically derived view of existing canonical structures. A new persistent characterization object, lifecycle, versioning model or Core contract is not required; future first-class characterization remains an explicit later product decision informed by Beta evidence.

## PD-023 â€” Representation-to-target comparison is not score-first
**Status:** CANONICAL
**Decision:** Professional Representation-to-Target Representation comparison must primarily communicate supporting elements, relevant distances, insufficiently observed areas and significant contradictory evidence when available. It must not reduce the primary user outcome to a Job Fit Score, CV-to-JD Match Score, compatibility percentage or person score; already-authorized technical or secondary indicators remain possible when they do not replace the Representation-first interpretation.

## PD-024 â€” Context-scoped professional relationship observation
**Status:** CANONICAL
**Decision:** Professional Evidence may support an Observation of a professional relationship in the specific described event or context without establishing a stable characteristic of the person. The minimum semantic statement identifies, as available from authorised Evidence, the subject, the professional action or contribution, the object or domain, the person's relationship to it, responsibility/accountability scope, context and outcome, with provenance preserved. These elements are semantic roles rather than a competency catalogue and need not all be present when Evidence does not support them. Target relevance is not part of whether the Observation is true.

## PD-025 â€” Professional relationship and responsibility are not interchangeable
**Status:** CANONICAL
**Decision:** IMAGO keeps the person's relationship to an activity or domain distinct from responsibility/accountability for it. Participation, collaboration, contribution or influence may be observed without ownership, decision authority or accountability. Explicit non-ownership is positive contextual knowledge that responsibility/accountability was outside the person's described scope; it is not missing Evidence, a negative person characteristic, inability or evidence that the person could never hold that responsibility. Existing `decision_accountability` semantics remain valid only for decision accountability and must not be generalized into unrelated ownership or competence claims.

## PD-026 â€” Domain proximity is not competence
**Status:** CANONICAL
**Decision:** Exposure to, collaboration with, or contribution within a professional domain does not by itself establish specialist competence, ownership or responsibility for that domain. Competence or broader capability characterization requires Evidence that directly supports the relevant demonstrated capability and, when generalized beyond one event, sufficient convergence across observations and contexts. Lexical proximity, question intent and target relevance never substitute for such Evidence.

## PD-027 â€” Observation-to-characterization epistemic boundary
**Status:** CANONICAL
**Decision:** IMAGO distinguishes context-scoped observed professional relationships from inferred or derived characterization and from insufficient observation. `Observed` means directly supported by authorised Evidence within its supported semantic and contextual scope. `Inferred/derived` means supported by an explicit legitimate relationship among observations with preserved lineage. `Insufficiently observed` means available Evidence does not justify the proposed characterization and never means absence. One event Observation may become elementary Knowledge that the event/relationship was observed; it does not automatically become a stable person trait. Broader Dynamic Characterization may emerge only from sufficient coherent Evidence convergence, source/context diversity where relevant, and explicit derivation semantics. Contradictory or context-dependent observations remain visible rather than being silently collapsed.

## PD-028 — Decision accountability is a canonical elementary professional dimension
**Status:** CANONICAL
**Decision:** `decision_accountability` is the first canonical elementary professional semantic dimension authorized for the Evidence → Observation → Measurement → DimensionContribution → Knowledge path. Its meaning is the evidence-backed scope, explicitness and continuity of responsibility for decisions affecting collective outcomes. It is not interchangeable with generic ownership, contribution, collaboration, leadership, budget ownership or domain competence. A `decision_accountability` elementary Knowledge state describes what the current evidence-supported snapshot establishes about this construct; it is not an intrinsic or permanently stable characteristic of the person. One context-scoped episode may support elementary Knowledge about that episode, while broader person characterization requires explicit downstream derivation and sufficient converging evidence under PD-027.

## PD-029 — Decision accountability semantic policy and explicit acquisition association
**Status:** CANONICAL
**Decision:** The first production professional semantic policy is `professional_semantic_policy:decision_accountability:v1`. It authorizes only evidence that is explicitly associated upstream with this policy through an acquisition definition whose target knowledge is `dimension:decision_accountability`; question text, question key/family, expected signals, target role, keywords and capability names are never sufficient association by themselves. The association belongs to acquisition design/definition before execution and must remain traceable through execution/Evidence provenance. The policy uses characteristic `decision_accountability`, the existing bounded decision-accountability Measurement semantics, context-scoped Observation semantics for decision authority / consequence scope / explicit accountability evidence / responsibility continuity, and a direct identity-preserving mapping to elementary dimension `decision_accountability`. Mapping must not attenuate, amplify or reinterpret the measured construct. Contextual non-ownership, mere contribution or collaboration are not negative decision-accountability contributions: they remain contextual observations and must not be converted into deficiency. Insufficient or ineligible evidence produces no positive or contradicting DimensionContribution and never implies absence.

## PD-030 — Source time and professional event time are distinct
**Status:** CANONICAL
**Decision:** For dated professional material, IMAGO keeps the time of the source/material distinct from the time of the professional event or experience described by that source whenever both are knowable. A source produced later may support Evidence about an earlier event. Source date never silently becomes event date, and missing temporal information remains unknown rather than inferred. This decision authorizes the semantic distinction, not a new Core temporal contract.

## PD-031 — Source multiplicity does not imply professional-episode independence
**Status:** CANONICAL
**Decision:** Multiple authorised sources may provide converging Evidence about the same professional episode without becoming multiple independent professional episodes. Source identity, Evidence identity and the professional event/episode being described are distinct concepts. Confidence, convergence, coverage or broader characterization must not be increased merely by counting repeated descriptions of the same underlying episode as independent experience. When episode identity cannot be established, uncertainty is preserved. This decision authorizes semantic deduplication/independence requirements without prescribing an `episodeRef` Core contract.

## PD-032 — Professional evolution and Representation evolution are distinct
**Status:** CANONICAL
**Decision:** IMAGO distinguishes change in supported professional experience, responsibility, context and Knowledge from change in how the person represented that professional history at a given time. Historical CVs and other dated self-representations are Evidence of what that source represented then and may also contain Evidence about earlier professional events; omission from a historical source never proves absence in the person or in the underlying history. Dated Representation snapshots may support future trajectory views, but a Knowledge Timeline or Professional Trajectory is not required for the first human test.

## PD-033 — Person Representation and Target Representation remain epistemically separate
**Status:** CANONICAL
**Decision:** Person Representation expresses what authorised Evidence and Knowledge support about the person within the current context/snapshot, including uncertainty and observability. Target Representation expresses what a role, organization or other authorised target requires, expects or considers relevant. Target importance or expected expression does not alter Person Knowledge, create epistemic confidence about the person, or convert insufficient observation into weakness. Target-relative comparison may report supported alignment, supported/plausible distance, insufficient observation for comparison and significant contradictory Evidence when legitimately available.

## PD-034 — Target importance may prioritize acquisition, never manufacture mismatch
**Status:** CANONICAL
**Decision:** When a target makes a dimension important and Person Knowledge is insufficiently observed for comparison, the Product may increase the priority of acquiring additional relevant Evidence through the existing Knowledge Acquisition pipeline. Target importance plus insufficient Knowledge must not become a negative candidate score, weakness or mismatch. This is a sequencing principle, not a universal scoring formula.

## PD-035 — KnowledgeAcquisitionDesign owns the professional semantic-policy association
**Status:** CANONICAL
**Decision:** For the first production professional semantic vertical slice, `KnowledgeAcquisitionDesign` is the canonical acquisition artifact that owns `semanticPolicyRef = professional_semantic_policy:decision_accountability:v1`. The association is valid only when that Design targets elementary `dimension:decision_accountability` and is established before capability selection, Plan, Runtime Session, Execution, or Evidence interpretation. `KnowledgeAcquisitionRequirement` remains a declarative statement that knowledge availability is required and does not acquire semantic-policy ownership. No downstream component may select or replace the policy from answer text, question metadata, expected signals, target, capability identity, annotation, perception, keywords, or model classification.

## PD-036 — Semantic association is proven by causal acquisition lineage, not copied policy labels
**Status:** CANONICAL
**Decision:** `semanticPolicyRef` is not duplicated across every acquisition artifact. The canonical proof is a reconstructable causal chain from Evidence to the owning `KnowledgeAcquisitionDesign`. For the decision-accountability slice, canonical Evidence produced from acquisition execution must preserve a reference to the exact `KnowledgeAcquisitionExecution`; the existing execution lineage then resolves `Execution → Plan → CapabilityConfiguration → SolutionDecision → KnowledgeAcquisitionDesign`. Every link must be contract-valid and unambiguous. Semantic authority resolution succeeds only when that chain resolves one Design whose `semanticPolicyRef` is the authorized policy and whose target is `dimension:decision_accountability`; missing, broken, ambiguous, or inconsistent lineage yields no semantic authority.

## PD-037 — Semantic authority resolution and Evidence interpretation are separate responsibilities
**Status:** CANONICAL
**Decision:** Semantic authority resolution verifies the upstream acquisition lineage and returns the already-authorized semantic policy; it does not inspect answer semantics. Eligible Evidence may be semantically interpreted only by an explicit `decision_accountability` Observation Construction authority operating under `professional_semantic_policy:decision_accountability:v1`. A deterministic implementation or a model may execute that authority, but the executor may not choose the policy, expand its meaning, or create semantic authority. The interpretation output must validate as the existing specialized `DecisionAccountabilityObservation` contract and preserve the supporting Evidence IDs plus the resolved policy/acquisition lineage in provenance/extension metadata.

## PD-038 — Specialized decision-accountability Observation and Measurement are canonical for this slice
**Status:** CANONICAL
**Decision:** For `professional_semantic_policy:decision_accountability:v1`, the existing specialized `DecisionAccountabilityObservation` is the canonical semantic Observation, because it already represents the authorized construct through decision authority, consequence scope, accountability evidence, responsibility continuity, context, Evidence references, inference support, and limitations. The existing specialized `decision_accountability` Measurement semantics remain the canonical Measurement semantics. The generic Registered-Evidence Observation family used by AR-02A is not a competing semantic owner. The technical integration may adapt the specialized Measurement result into the generic canonical `MeasurementResult` shape required by the existing DimensionContribution pipeline only as a lossless, identity-preserving projection of already-computed decision-accountability measurement meaning; the adapter may not reinterpret Evidence or introduce a second scoring policy.

## PD-039 — No valid semantic Observation produces no Knowledge effect
**Status:** CANONICAL
**Decision:** Eligible Evidence that is insufficient, out of scope, unreliable for the authorized interpretation, or otherwise unable to produce a valid `DecisionAccountabilityObservation` yields no semantic Observation for the Knowledge path. It therefore yields no Measurement eligible for DimensionContribution, no supporting or contradicting contribution, no weakness, and no semantic fallback. `not observed` remains distinct from absence. Model failure, invalid constrained output, unresolved authority, or unsupported interpretation follows the same no-Knowledge-effect rule.
## PD-040 — Decision-accountability production interpretation and epistemic ownership
**Status:** CANONICAL
**Decision:** Under `professional_semantic_policy:decision_accountability:v1`, a single-Evidence semantic interpreter may produce only context-scoped semantic facts defensibly supported by the Evidence: `decisionAuthority`, `consequenceScope`, `accountabilityEvidence`, semantic `context`, Evidence-local `limitations`, and a responsibility-duration fact only when the Evidence itself supports a determinate duration or temporal bound. `decisionAuthority = none` is reserved for explicit contextual non-authority/non-ownership; insufficient authority Evidence produces no valid decision-accountability Observation. `recommendation` means the person proposes or recommends while final authority belongs elsewhere; `shared` requires supported joint decision authority, not consultation or collaboration alone; `final` requires supported final authority for the represented decision. `consequenceScope` classifies the supported scope of the decision/consequences, choosing no level when ambiguous rather than the highest plausible level; title, seniority, company size, target role and generic leadership language are not evidence. `accountabilityEvidence` means: `claimed` = accountability asserted without a concrete described action/causal episode; `implicit` = accountability supported by described role/action/consequence without an explicit accountability statement; `explicit` = responsibility/accountability for the decision or consequence is explicitly stated; `explicit_with_outcomes` = explicit accountability plus an observable described outcome causally connected to that decision/responsibility.

Responsibility continuity is distinct from role tenure. Exact durations and unambiguous date/duration expressions may be deterministically normalized to months; bounded or approximate expressions must preserve their bound/approximation semantics and may not be collapsed to an invented exact month count. Role/project dates may be used only when the Evidence establishes that the represented decision responsibility spans that same interval. Repeated but non-continuous responsibility is not silently summed as continuous tenure. Missing or indeterminate continuity remains unknown and never becomes `0`.

`evidenceQuality`, `sourceConvergence`, `consistency` and `coverage` are inference-support epistemic information, not free-form model confidence. Evidence quality is owned by a separate Evidence/provenance assessment from canonical source/provenance facts and may remain not yet available. Source convergence requires legitimate comparison across Evidence/sources while preserving professional-episode independence under PD-031. Consistency requires an explicit comparison set and relationship across relevant Evidence/Observations; it is not internal model confidence. Coverage belongs to Knowledge/acquisition coverage state, not to a single Observation interpreter. These values may be attached to Measurement inference support only when their canonical producers have supplied them; the single-Evidence interpreter may not invent them.

A valid production `DecisionAccountabilityObservation` requires eligible Evidence plus supported decision responsibility for a concrete represented decision/context, with at least one of `recommendation`, `shared` or `final` decision authority and a supported consequence scope. Accountability explicitness and continuity may be unknown when the corrected contract represents that state. Explicit `none` remains useful contextual Observation outside the positive Measurement/Contribution path; insufficient Evidence yields no valid Observation. The model may execute constrained semantic extraction/classification under already-resolved authority, but may not select policy, infer target/title-based authority, invent numeric epistemic scores, convert unknown to zero, perform unowned cross-Evidence aggregation, or create Knowledge directly.

The current specialized Observation/Measurement technical contracts require minimal correction before production free-form execution: unknown/not-yet-derived must be representable for responsibility continuity and inference-support inputs; bounded/approximate continuity must preserve its temporal semantics rather than force an exact number; Measurement must calculate strength only from known applicable strength components and must not substitute zero for unknown. Inference support must remain separately unavailable/partial until canonical inputs exist and must not gate or depress measured strength by fabricated defaults. No new scoring framework or universal semantic interpreter is authorized.


## PD-041 — Professional Identity is the reusable professional profile
**Status:** CANONICAL
**Decision:** The existing `Professional Identity` is the canonical person-owned professional Representation that fulfils the Product concept informally described as an IMAGO Professional Profile. The Beta must allow that identity to accumulate authorised professional material and supported Knowledge across meaningful interactions and to be saved, reopened, enriched and reused. A session is an interaction with the Professional Identity, not the identity itself. This decision does not introduce a second persistent profile object, prescribe storage technology or require a new Core Representation contract.

## PD-042 — Person, session and target remain distinct
**Status:** CANONICAL
**Decision:** `PERSON ≠ SESSION ≠ TARGET`. Starting another session does not create another person, and changing target does not rewrite person-owned Evidence or Knowledge. Sessions may acquire or consume authorised person knowledge. Targets remain separate interpretive contexts under PD-033/PD-034. The same Professional Identity may therefore be reused across sessions and targets while preserving provenance, uncertainty and dated state.

## PD-043 — Beta professional continuity and reuse
**Status:** CANONICAL
**Decision:** For the Private Beta, a tester who has already supplied authorised professional information must be able to return later without being required to supply the same information again, enrich the existing Professional Identity with newly supported material, and reuse the resulting person-owned professional knowledge for a later session or a different target. The minimum Product continuity is `SAVE → REOPEN → ENRICH → REUSE`. The technical solution may initially be minimal and local when consistent with consent, privacy, provenance and existing authority; this decision does not select database, filesystem, cloud, authentication or synchronization architecture. Unsupported or insufficient material never becomes Knowledge merely to preserve continuity.

## PD-044 — One professional knowledge path, multiple user perspectives
**Status:** CANONICAL
**Decision:** Candidate/professional and Tutor/outplacement/career-professional experiences are perspectives over the same canonical person-owned Professional Identity and Knowledge path, not separate Knowledge engines. Their views, actions and workflow may differ, but delegated professional access remains explicit, limited and revocable under PD-002 and may not transfer ownership or mutate Evidence/Knowledge to fit the professional's perspective. Human professional judgment and responsibility remain with the human professional.

## PD-045 — Living Professional Identity and report snapshot are distinct
**Status:** CANONICAL
**Decision:** A report or export is a shareable snapshot derived from the Professional Identity at a declared state/context; it is not the persistent professional workspace itself. The application earns return use by preserving and developing authorised sources, reusable Knowledge, insufficiently observed areas, sessions, targets and subsequent enrichment, not by withholding prior results. Export remains permitted in principle; its minimum Beta form is a later implementation decision.

## PD-046 — Meaningful interaction should improve reusable knowledge when justified
**Status:** CANONICAL
**Decision:** Every meaningful professional interaction should, when epistemically justified, increase or improve the reusable professional knowledge available for the person. This is not a requirement that every interaction create Knowledge: unsupported, insufficient, rejected or otherwise ineligible Evidence remains so and follows existing no-Knowledge-effect rules.

## PD-047 — Bounded professional knowledge goals may bootstrap acquisition before observation
**Status:** CANONICAL
**Decision:** A product/session purpose may establish before Runtime an explicit bounded set of already-authorised professional Knowledge dimensions that IMAGO is permitted to attempt to acquire, even when those dimensions are not yet represented in Person Knowledge. For an active legitimate Knowledge goal, absence of existing Person Knowledge means `not observed` for acquisition purposes, never absent, weak or deficient, and may initiate the existing Knowledge Acquisition path without manufacturing Evidence or Knowledge. The target may prioritize already-authorised goals under PD-034 but does not create semantic dimensions or Person Knowledge. For the First Human Test, this bootstrap authority is limited to `decision_accountability` and `quantified_outcome`; additional professional Knowledge goals require their own canonical semantic authority and explicit product/session-purpose authorization. Future answers, question wording or metadata, expected signals, keywords, target wording and model classification may not retroactively create or expand the acquisition goal set.

## PD-048 — Quantified outcome is a canonical elementary professional semantic dimension

**Status:** CANONICAL
**Decision:** `quantified_outcome` is an authorized elementary professional semantic dimension for the Evidence → Observation → Measurement → DimensionContribution → Knowledge path under `professional_semantic_policy:quantified_outcome:v1`. Its meaning is an evidence-backed measurable outcome, scale or impact connected to the person's supported contribution in a represented professional event or context, consistent with `OBS-010`. The resulting Knowledge is event/context scoped and does not by itself establish sole causality, ownership, leadership, execution responsibility, project autonomy or a stable person trait. Quantitative magnitude is preserved as Evidence-supported outcome meaning and must not become a universal person score or make a larger number intrinsically better than a smaller one. Semantic authority must be established before Evidence interpretation through an acquisition definition targeting elementary `dimension:quantified_outcome`, with reconstructable causal lineage; question or answer text, presence of numbers or percentages, target wording, expected signals, keywords and model classification cannot independently activate the policy. Insufficient or ineligible Evidence produces no positive or contradicting Knowledge effect and never implies absence.
## PD-049 — Runtime Question Necessity and Satisfaction Authority
**Status:** CANONICAL
**Decision:** Runtime question necessity is objective-based, not timeline-based. Every Core question subject to Runtime necessity evaluation must have an explicit canonical pre-Runtime association with one or more authorized question objectives; question wording or textual similarity never establishes objective identity. After each accepted Runtime answer and its canonical processing, Runtime may reevaluate future Core-question necessity from current authorized Knowledge, Coverage and Acquisition state. An objective is satisfied only when the canonical state associated with that objective demonstrates sufficient acquisition for that authorized purpose; wording, keywords, target/JD similarity, generic answer quality, unauthorized model classification, or unrelated Knowledge cannot establish satisfaction.

Knowledge for a semantic dimension does not universally satisfy every related question. A Core question may serve multiple distinct objectives, and satisfaction of one does not suppress the question while another canonical objective remains necessary. Before presenting an evaluable future Core question, Runtime must determine the state of all its canonical objectives: if at least one remains necessary, preserve the acquisition opportunity and the question; if all are satisfied, the original question may be suppressed and must not be asked solely because it remains in the timeline; if objective linkage or satisfaction is ambiguous or unavailable, fail closed by preserving the existing question. This decision authorizes bounded `SUPPRESS` and `PRESERVE`; it does not generically authorize autonomous `REPLACE` or `TRANSFORM` without separate existing authority.

Opening and closing remain distinct conversational/Runtime boundaries and are not made suppressible by PD-049. Target/JD may influence acquisition priority only under existing authority and cannot create question objectives, declare satisfaction, create semantic dimensions, convert insufficient observation into deficit, or independently cause suppression. `Question objective satisfied` is solely an acquisition-necessity state: it does not mean the person is competent, suitable, strong/weak, universally complete, or unable to yield additional future Knowledge.

The first FHT application is bounded to already-authorized semantic authorities and must use explicit canonical associations. It must preserve the distinction `question identity ≠ question objective ≠ acquisition purpose ≠ semantic dimension ≠ Knowledge state ≠ question necessity`. No generic semantic equivalence, new professional dimension, universal score, new inference authority, or redefinition of KnowledgeCoverage is authorized.

## PD-050 — Decision Tradeoff Runtime Question Objective Authority
**Status:** CANONICAL
**Decision:** For the bounded First Human Test, Core Runtime question identity `decision_tradeoffs` serves exactly one canonical Runtime question objective: `decision_tradeoff_accountability`. This objective is to acquire sufficient observation, in the current represented event/context, that the person faced a real choice between alternatives or competing priorities and that the person's decision-responsibility boundary and consequences of the choice are observable. It is a Runtime acquisition objective, not a semantic dimension, person characteristic, competence score, judgment of decision quality, or claim of overall event/project ownership. Its complete canonical objective set is exactly `[decision_tradeoff_accountability]`; existing question-bank `intent`, `signals`, `familyLabel`, `narrativeRole`, or `category` do not create additional question objectives without later explicit authority.

Adaptive Runtime action identity `decision_tradeoff_probe` is explicitly authorized to serve the same `decision_tradeoff_accountability` objective. This linkage is canonical and does not derive from textual similarity. The objective may be satisfied through `professional_semantic_policy:decision_accountability:v1` only when successful canonical `decision_accountability` Knowledge production has causal acquisition lineage from a Runtime action explicitly authorized for this objective. For the bounded FHT, those action identities are exactly `decision_tradeoff_probe` and `decision_tradeoffs`. Thus question objective, acquisition purpose, and semantic dimension remain distinct while this Decision establishes their bounded authorized relation.

Within the current Runtime session, `decision_tradeoff_accountability` is `SATISFIED` if and only if canonical execution/Knowledge lineage demonstrates successful `decision_accountability` Knowledge production causally derived from one of those authorized action identities. Generic presence of DA Knowledge is insufficient. In particular, DA Knowledge produced from `opening_career_walkthrough` does not satisfy `decision_tradeoff_accountability`; neither wording, keywords, expected signals, question similarity, target/JD, model classification, nor Knowledge from another session can establish satisfaction.

Under PD-049, because `decision_tradeoffs` has this single canonical objective, if `decision_tradeoff_accountability` is satisfied before presentation of that Core question, all its objectives are satisfied and bounded `SUPPRESS` is authorized. If it is not satisfied, `PRESERVE`; if action lineage, linkage, state, or satisfaction cannot be demonstrated, fail closed with `PRESERVE`. No replacement question is generated. This is current-session acquisition-necessity authority only and does not declare the person universally known for decision accountability or prevent future DA acquisition in another session, context, or for another authorized question objective.

PD-050 does not authorize objective mappings or suppression for other Core questions, stakeholder-conflict or pressure-prioritization questions, opening/closing, generic semantic-dimension-to-question-objective mappings, generic question equivalence, new semantic dimensions or scoring, replacement/transform, or cross-session suppression.

## PD-051 — Product Purpose Determines Interaction Necessity
**Status:** CANONICAL
**Decision:** Every professional interaction operates under an explicit authorised Product purpose. For the professional Product, at minimum the purposes `professional_identity_build_enrich`, `professional_representation_understand`, `opportunity_application`, and `interview_practice` are semantically distinct interaction purposes over the same person-owned Living Professional Identity and Knowledge path. Product purpose may determine which existing Knowledge is reused, which additional acquisition is necessary, whether an interaction can return value without new acquisition, and whether previously explored professional areas may legitimately be revisited. Product purpose does not alter Evidence or Person Knowledge, create semantic dimensions, manufacture target fit, or by itself establish question-objective satisfaction. Acquisition necessity, Representation necessity, Opportunity/Application necessity and Interview-Practice necessity are therefore distinct. Existing PD-049/PD-050 remain bounded to their authorised Runtime acquisition-necessity scope and must not be generalized into cross-session or interview-practice suppression without separate explicit authority.

## PD-052 — Living Professional Identity and Derived Professional Views
**Status:** CANONICAL
**Decision:** The Living Professional Identity is the canonical persistent person-owned professional asset and workspace. It preserves authorised professional sources, reusable canonical Professional Knowledge, provenance, uncertainty, observability and dated state across sessions and targets. A Professional Representation is a materialized, explainable view of that Living Professional Identity for a declared purpose/context; a target-relative Professional Representation additionally consumes a separate Target/Opportunity Representation without mutating person-owned Evidence or Knowledge. Reports, shareable snapshots and future application artifacts are derived outputs of those views and are not independent professional records. A Product purpose may materialize a new view without requiring new acquisition when existing authorised information is sufficient. No second Professional Identity/Profile or parallel Knowledge path is created.

## PD-053 — Professional Representation Snapshot Materialization and Evolution
**Status:** CANONICAL
**Decision:** A Professional Representation remains a derived, explainable, purpose/context-bound materialization of the person-owned Living Professional Identity. A completed materialization may be preserved as an immutable dated/versioned Representation snapshot for its declared Product purpose/context and exact Representation recipe/version. When materially relevant authorised inputs are unchanged — including the applicable Living PI state, purpose/context, authorization state and Representation recipe/version — the Product reuses the existing valid snapshot rather than rematerializing it merely because the view is reopened. When materially relevant authorised professional sources, Evidence/Knowledge, authorization, purpose/context or recipe/version change, a new snapshot may be materialized while prior snapshots remain historical derived artifacts subordinate to the Living PI and current authorization.

Snapshot evolution must preserve the distinction among professional-state evolution, Knowledge/observability evolution, Representation-recipe evolution and context evolution. More Evidence does not by itself mean professional improvement; more Knowledge does not by itself mean greater competence; better observability does not mean a better person; and a new Representation claim does not by itself mean a newly acquired capability. A recipe-only or context-only change must not be presented as professional-state evolution.

A Representation snapshot remains traceable to the authorised professional state and relevant source/Evidence/Knowledge provenance from which it was derived and to the exact Representation recipe/version that materialized it, without requiring duplication of canonical data. It is a product-significant derived artifact, not a technical cache, second Professional Identity, professional source, canonical Evidence, canonical Knowledge, independently editable professional truth or replacement for the Living PI. Current snapshot reuse must respect current authorization: material later corrected, withdrawn or no longer authorised must not be reintroduced into the current Living PI or current Professional Representation through historical snapshot reuse. The same derived-snapshot principle may later apply to target-relative Representation over a separate Target/Opportunity context without mutating Person Knowledge.

## PD-054 — Professional Direction Exploration Purpose and Career Direction Hypothesis
**Status:** CANONICAL
**Decision:** `professional_direction_explore` is an explicit authorised Product purpose over the same person-owned Living Professional Identity and canonical Professional Knowledge path. It is semantically distinct from `professional_representation_understand`: Understand asks how the person currently emerges from authorised professional material, while Professional Direction Exploration asks which real professional directions appear worth exploring from that supported professional meaning under explicit assumptions and unresolved conditions. The purpose may derive one or more Career Direction Hypotheses from the current authorised Professional Representation, supported Professional Patterns and Representation-level Professional Insight, canonical Knowledge where applicable, an authorised external Role/Career Direction Representation, and explicit user interests/preferences/constraints. User interests, preferences and constraints shape exploration context and prioritisation but are not Evidence of capability, fit or suitability.

A Career Direction Hypothesis means only that a real professional direction is worth exploring under its stated support, assumptions, context and unresolved conditions. It is a derived Product/Application interpretation, not Person Knowledge, canonical Evidence, a stable trait, capability proof, Target fit, readiness, recommendation, predicted success or employment decision. Pattern does not become trait; Professional Insight remains derived Representation-level meaning and does not become capability; direction does not become fit or readiness. Accepting, rejecting, requesting or prioritising a direction does not mutate Person Knowledge. Multiple concurrent direction hypotheses are authorised; the Product must not imply one universal best career, universal ranking, score-first comparison or percentage readiness.

A Career Direction Hypothesis may identify `conditionsToVerify`: information that would materially affect whether the direction remains worth exploring but that current authorised Evidence/Knowledge does not establish sufficiently. A condition to verify is not absence, a capability gap or a development deficiency. It may later motivate application-level acquisition intent only for an already-authorised semantic dimension and an explicitly authorised exploration condition/purpose; Career Direction does not create semantic dimensions, Measurement semantics or Knowledge and does not bypass the existing Knowledge Acquisition chain. Career Direction evaluations are derived/contextual and may be re-evaluated when authorised Evidence/Knowledge, Professional Representation, external role knowledge, user context or recipe/version changes, without creating ProfessionalTrajectory or mutating prior canonical person state.

## PD-055 — External Role / Career Direction Representation and Direction Conditions Boundary
**Status:** CANONICAL
**Decision:** A named Career Direction Hypothesis must reference a distinct Product/Application-level Role/Career Direction Representation that describes a generalized professional role family or possible professional destination independently of the person. It is separate from Person Knowledge and Professional Representation and is not a concrete Opportunity/Target. A Role/Career Direction Representation is externally grounded, provenance-bearing, version/date aware and explicitly scoped to relevant professional/industry/context assumptions; it is not universal timeless truth about every instance of a role. Where supported by its external sources it may represent typical responsibilities, materially relevant knowledge/capability requirements, expected experience or exposure, contextual variants, prerequisite exposure, and bounded progression/bridge or learning/credential information.

Role/Career Direction Representation and Target/Opportunity Representation remain distinct. The former represents a generalized/exploratory professional destination that may exist before any vacancy; the latter represents a specific concrete role/organization/opportunity context. A user-selected Career Direction may later guide discovery or selection of a Target, but it does not automatically become a Target and neither object mutates person-owned Evidence or Knowledge.

A Career Direction Hypothesis relates independently represented external role knowledge to supported Professional Representation meaning and must retain an explainable support basis, material assumptions and conditions to verify. `condition to verify ≠ representation gap ≠ evidence gap ≠ knowledge/observability gap ≠ capability/development gap`: insufficient observation must not be converted into deficiency. A capability/development gap requires separate sufficient authority and Evidence and is not authorised merely by missing or weakly observed information.

The Product may surface bounded bridge-experience, development or learning options only as hypotheses/options when their rationale is traceable to authorised external role requirements and the current supported state. Such an option may state that an experience or learning activity could help build, expose or test an ingredient relevant to a direction; it must not claim that the person lacks a capability unless a separately authorised capability/development-gap boundary establishes that conclusion. Training or credential completion is not proof of professional capability, and experience requirements must not be silently replaced by coursework. Future acquisition methods, including controlled professional simulations, remain compatible only if separately authorised and if they enter through the existing Evidence → Observation → Measurement → Knowledge boundaries; PD-055 does not itself authorise Evidence Challenges, psychological profiling, certification claims or direct Challenge-to-trait/capability/direction shortcuts.

## PD-056 — Continuing People Responsibility Elementary Professional Semantic Authority
**Status:** CANONICAL
**Decision:** `continuing_people_responsibility` is an authorised elementary professional Person Knowledge dimension for the existing Evidence → Observation → Measurement → DimensionContribution → KnowledgeLedger / KnowledgeSnapshot → PersonKnowledgeMatrix path. Its bounded meaning is context-specific recurring or continuing responsibility over the work of one or more other people, supported by authorised Evidence with sufficient continuity, professional context, at least one concrete responsibility kind, and bounded scope/mode observability to distinguish the responsibility from collaboration, temporary coordination or title alone. This authority describes what responsibility is documented; it does not establish leadership quality/style/potential, management capability/readiness, charisma, influence, seniority, generic ownership, mentoring alone, project or cross-functional coordination without people-work responsibility, stakeholder influence, team performance/outcome or title-based capability inference. `decision_accountability`, `quantified_outcome` and `continuing_people_responsibility` remain distinct dimensions; they may coexist in one supported professional episode but do not derive or satisfy one another.

The canonical Person-side Knowledge goal is `people_responsibility_scope`, and the authorised semantic policy identity is `professional_semantic_policy:continuing_people_responsibility:v1`. Positive Evidence must explicitly support people-related responsibility, continuity beyond a one-off episode, at least one concrete responsibility kind, bounded professional context, and source/event provenance. Exact headcount is optional; people scope may remain exact, range-bounded, categorical or unknown as supported and must never manufacture precision or rank a larger team as better. Title, vague people-coordination wording, working with a team, leading a project, mentoring, making decisions, cross-functional coordination or team outcome are insufficient alone. Provider-assisted extraction may identify candidate structured claims only from explicit source content; deterministic semantic validation remains authoritative and may not infer unstated continuity, formal authority, team size, reporting lines, leadership capability, management maturity, fit or readiness.

The authorised Observation family is `observed_continuing_people_responsibility_context` and remains professional-context scoped. It may retain responsibility presence, continuity, responsibility mode, responsibility kinds, people scope, professional context, event time/period, Evidence/source lineage and limitations. Bounded continuity values are `temporary`, `recurring`, `continuing`, `insufficient`. Bounded responsibility modes are `formal_line`, `matrix_or_dotted_line`, `informal_operational`, `temporary_assignment`, `insufficient`; generic project/cross-functional coordination without actual people-work responsibility is not people responsibility, and wording/title does not establish formal authority. The minimum v1 responsibility kinds are `work_assignment_or_priority_setting`, `workload_shift_or_schedule_coordination`, and `performance_follow_up_or_feedback`. Hiring, disciplinary authority, staffing, formal appraisal and development/coaching are not required by this first authority and may require later extension.

Measurement for this dimension is bounded and non-evaluative. It may represent `presence` as `supported`, `contextual_non_responsibility` or `insufficient`; continuity and mode using the authorised bounded values; `scopeObservability` as `known`, `partial` or `insufficient`; supported responsibility kinds and people scope; and limitations/provenance. It must not produce a leadership score, management maturity, capability ranking or amplification from title, target relevance or provider wording. Canonical Knowledge means only that, in the specified professional context and period, authorised Evidence supports the documented recurring/continuing responsibility, mode, bounded scope and known responsibility kinds; unspecified aspects remain unknown. A bounded statement of no direct reports may support contextual non-responsibility for that context but never global absence, leadership deficiency or inability to manage people. `not observed != absent`; contextual non-responsibility is not a global deficiency.

Event time remains distinct from source time under PD-030/PD-032; historical responsibility remains historical and does not imply current responsibility. Multiple mentions of the same underlying episode do not increase scope, continuity or capability under PD-031, and derived summaries are not independent Evidence. Later authorised Evidence may refine or correct prior interpretation; current Knowledge must become more precise rather than preserve an overclaim. Acquisition for this dimension is authorised only when upstream `KnowledgeAcquisitionDesign` explicitly references `professional_semantic_policy:continuing_people_responsibility:v1`; Career Direction may later motivate that acquisition through an application-level acquisition intent but may not create the dimension, Observation/Measurement semantics or Person Knowledge truth.

The existing Career Direction condition concerning actual scope of continuing people responsibility may later be considered sufficiently resolved when canonical Knowledge establishes recurring/continuing rather than merely temporary responsibility, sufficiently known responsibility mode, bounded people scope at least qualitatively, at least one authorised material responsibility kind, and adequate professional/event context and provenance. Resolution does not require leadership effectiveness, team outcome, hiring/disciplinary authority, all HR responsibilities or a capability score, and no persistent partial-resolution state is authorised by this decision. The same Person Knowledge may be reused by Professional Representation, multiple Career Directions, Target/Application and Interview Practice; those contexts may interpret relevance but may not mutate Person Knowledge. This decision does not authorise DevelopmentNeed, leadership gap, management deficiency, training recommendation, readiness or fit assessment. No new generic Core layer is authorised.

## PD-057 — Source-Grounded Professional Episode Meaning
**Status:** CANONICAL
**Decision:** IMAGO authorises **Source-Grounded Professional Episode Meaning** as bounded Representation/Application material derived from authorised Evidence. It describes what a documented professional episode or activity establishes — including the person's supported form of participation/contribution and relevant professional context where available — and describes **the episode, not a stable characteristic of the person**. It is richer than raw Evidence because it may preserve source-supported professional meaning, but it is not Evidence, canonical Observation, Measurement, DimensionContribution, Person Knowledge, KnowledgeLedger/Snapshot, PersonKnowledgeMatrix, Target Knowledge, Career Direction Hypothesis or a capability model. The canonical conceptual path is `authorised source → Evidence → Source-Grounded Professional Episode Meaning → Representation/Application material`. Separately, when an authorised semantic policy exists, the same Evidence may enter the canonical `Evidence → Observation → Measurement → DimensionContribution → Person Knowledge` path. Neither derivation substitutes for the other, and Episode Meaning is never a weaker form of Person Knowledge.

Every Episode Meaning must remain traceable to authorised Evidence and preserve enough source, episode/context and time identity to keep historical material historical, allow later source correction/revocation to affect current derived views, and avoid counting repeated descriptions of one underlying episode as independent professional experiences under PD-030/PD-031/PD-032. External Role/Target knowledge, job title, domain proximity, another episode, provider plausibility or downstream relevance may not create or rewrite Person-side Episode Meaning. Source multiplicity may strengthen documentary support only within separately authorised rules; it does not manufacture episode independence, ownership, continuity, capability or outcome.

The Product authorises **open, source-bounded descriptive professional meaning** without authorising open Person-level semantic inference or requiring an exhaustive professional ontology. Episode Meaning may describe only facts materially supported by the Evidence, such as the activity/event, professional context, the person's participation or contribution, object/situation, collaborators/functions, process/project phase, responsibility/ownership when explicit, temporal/context information and bounded outcome only where separately supported/authorised. These are possible semantic roles, not a mandatory universal schema or competency taxonomy. `participated ≠ contributed ≠ coordinated ≠ owned ≠ decided`: stronger participation, responsibility, causal attribution or achievement may not be materialised from weaker Evidence. A documented objective is not an achieved outcome. A documented episode such as participation in a production-line launch does not imply production-startup expertise/capability; coordination of production and maintenance does not imply maintenance-management capability; analysis supporting investment does not imply budget or investment authority.

Episode Meaning may contribute to canonical Person Knowledge only through a separately authorised semantic policy and canonical Knowledge path. Repetition, source multiplicity, reuse across Product purposes, Role relevance, provider labelling, user selection or prominence in a Representation never promotes Episode Meaning to Person Knowledge. Where independent authority exists, the same Evidence may legitimately support both Episode Meaning and canonical Person Knowledge without duplicating semantic authority; for example, Evidence about documented people-work activity may support an Episode Meaning and, independently through PD-056, `continuing_people_responsibility` Knowledge.

Episode Meaning may be input material for Pattern discovery only through separately authorised Pattern rules. Multiple similar Episode Meanings do not automatically establish competence, strength, trait, aptitude or stable capability. The authorised progression remains `facts → authorised recurrence → Pattern → Connection → Professional Meaning` where those boundaries are independently satisfied; never `facts → trait`. Episode Meaning may materially enrich Professional Representation under PD-052/PD-053 and may be reused by an authorised Product purpose without mutating Person Knowledge or creating a second snapshot/history system.

Episode Meaning is an authorised potential Person-material type for the existing Application-level Professional Material Relevance Relation. Conceptually, `Episode Meaning → Professional Material Relevance Relation → atomic external requirement` is permitted only where a separately authorised relevance mapping/boundary exists. Open descriptive Episode Meaning does not authorise free semantic matching, keyword/embedding authority or arbitrary comparison with external requirements. A Role/Career Direction/Target may make existing Person-side Episode Meaning more relevant but cannot manufacture it; Person-side material and external requirement remain separate and their relevance relation remains derived and purpose-relative.

For external requirements, IMAGO distinguishes the **human-readable requirement statement** from the **atomic semantic requirement unit used for relevance**. A human statement may be compound for readability, but relevance must operate at sufficient semantic atomicity that support/relevance to one component does not imply support for the others. Therefore relevance of Decision Accountability to `operational_constraints` does not establish relevance/support for budget responsibility, resource ownership or planning responsibility merely because those concepts share one human-readable requirement statement. This decision does not define a universal requirement ontology or authorise requirement decomposition implementation.

Provider assistance may propose or structure Episode Meaning only from authorised Evidence. Provider output is not authority for Evidence existence, stronger participation/ownership, capability, trait, causal attribution, outcome, seniority, generalized skill, fit, readiness or suitability. Application authority must preserve source grounding and validate bounded claim shape; unsupported strengthening fails closed. This decision authorises the Product boundary only. It does not implement extraction, modify canonical Observation/Core semantics, create a Person semantic policy/dimension, extend `activityModes`, alter BV05A mappings/UI, implement Target/JD relevance, CV tailoring, acquisition, fit/readiness or a universal professional ontology.

## PD-058 — Representation Informational Contribution and Composition
**Status:** CANONICAL
**Decision:** IMAGO authorises **Representation Informational Contribution** as a derived, non-evaluative relationship between authorised source-grounded professional material and one specific materialised Professional Representation. It answers only: **what supported professional information does this material add to what this Representation already materially expresses?** It is Representation-relative, re-derived with the view, and is not an intrinsic property of Evidence, Episode Meaning, source, episode or person. The Product does not authorise global episode salience, importance, strength, prestige, seniority weight, capability weight or a universal score. The same material may contribute differently to different Representations and Product purposes.

IMAGO distinguishes `source presence != Representation visibility != informational contribution != Connection != purpose-relative relevance`. Source presence means authorised material exists. Representation visibility means the current derived view materially surfaces it. Informational contribution means supported information from that material is not yet sufficiently expressed by the current composition. Connection remains an independently authorised relationship between supported materials. Purpose-relative relevance remains a separate relationship between Person material and an external requirement under a declared Product purpose. Target-independent `professional_representation_understand` may not use Career Direction, Target, Opportunity, JD or market desirability to determine informational contribution.

Professional material may be **partially represented**. Use of one supported aspect does not semantically exhaust the whole material. In the bounded Germany example, existing cross-functional recurrence may materially represent the engineering/production/quality collaboration aspect while line launch, installation, start-up, stabilization and historical context remain distinct source-grounded information. `one aspect represented != material semantically exhausted`. Non-foregrounding likewise carries no negative Person meaning: material may be already represented, primarily supporting, or unnecessary to repeat in the current composition without being weak, unimportant, irrelevant, inferior or obsolete.

For composition comparison, authorised source-grounded Representation material may expose **bounded informational/support units** that remain traceable to the material and its Evidence. These units may preserve PD-057 open descriptive vocabulary and are not Person Knowledge dimensions, capabilities, traits, competency-taxonomy nodes or universal ontology concepts. Conceptually, `source-grounded material -> bounded informational/support units <-> current Representation composition units -> derived contribution/coverage relation`. Any notion of coverage here means only whether supported professional information is already materially expressed in the current Representation and must remain distinct from canonical Knowledge Coverage, competence/capability coverage, fit or readiness.

Pattern semantics remain unchanged: Pattern answers **what recurs?** Informational Contribution answers **what distinct supported information does this material add to this Representation?** Pattern support does not automatically exhaust a supporting episode, and one Episode Meaning may add distinct information without establishing any Pattern. Connection also remains unchanged and is only one possible form of informational contribution: material may add distinct activity/context without creating a Connection. Informational contribution does not create or strengthen Person Knowledge, KnowledgeLedger, KnowledgeSnapshot, PersonKnowledgeMatrix, semantic dimensions, capability, strength, seniority or confidence.

The intended composition architecture is `available Professional Representation material, including Episode Meanings -> Representation-relative informational contribution/coverage -> bounded non-redundant material selection -> existing Pattern / Connection / canonical Knowledge material -> Professional Meaning composition -> progressive support/provenance`. Existing Professional Meaning / Professional Picture remains the destination; this decision does not authorise a second "important Episode Meanings" report. First-reading Representation has a bounded semantic/narrative **composition budget**: it may foreground a small non-redundant set of supported professional meanings while retaining supporting material at deeper reading levels. This is a composition constraint, not Top-N experience ranking, score, prestige order or universal importance ranking. Selection may prefer material that adds supported information not already materially represented, is needed to explain an authorised Pattern/Connection, carries relevant canonical Knowledge into the picture, or increases informational diversity without unnecessary repetition; these are composition principles, not Person-evaluation criteria.

Visibility/prominence is derived from the current materialised Representation rather than persisted as `visibilityScore`, `prominenceState`, `salienceState` or a second state machine. PD-053 remains authoritative for Representation materialisation/evolution: when authorised inputs or recipe materially change, informational contribution and composition may be re-derived. PD-030/PD-032 remain authoritative for time: recency is not importance, historical material may contribute substantially, and foregrounding historical participation does not make it current capability. PD-031 remains authoritative for source multiplicity: repeated source mentions of one episode do not create multiple episodes, greater informational contribution or greater prominence; source count is not a salience signal.

Provider assistance may propose bounded relations between source-grounded informational units and current Representation composition units, but provider output is not authority for importance, prestige, capability, trait, seniority, target fit or unsupported professional meaning. Every asserted new informational element must already be grounded in authorised material, and Application/authorised contract determines allowable relation shape and grounding. Informational contribution does not require a closed ontology of professional activities: IMAGO compares bounded source-grounded professional information with the current Representation composition, not each episode with every possible profession.

The same bounded Person material may later be consumed by purpose-relative relevance without merging authorities. Target-independent informational contribution is `Person material <-> current Representation -> contribution`; BV05A remains `Person material <-> atomic external requirement -> supported relevance`. No global importance value bridges them. Germany may add distinct information to Understand while remaining blocked for Career Direction relevance until an independently authorised atomic external requirement/mapping exists.

This authority is domain-independent. A legacy-service cloud migration may add migration/cloud context without cloud capability; diagnostic-instrument validation may add validation context without validation expertise; a strategic-account proposal may add commercial context without strategic-sales capability; rollout workstream dependencies may add rollout/workstream context without program-management capability. The Product purpose is to prevent correct generalisation from erasing useful source-grounded differences between professional episodes while preserving all existing Evidence, Knowledge, Pattern, Connection and relevance boundaries.

This decision authorises the Product boundary only. It does not implement contribution detection, modify `buildProfessionalMeaning`, modify `episodeMeanings[]`, implement provider comparison, add UI/Germany foregrounding, change BV05A, implement atomic Role Requirements, Target/JD, CV/Application, acquisition, scores, global salience or a universal professional ontology.

## PD-059 — Candidate Career Preference Context
**Status: CANONICAL**

**Decision:** IMAGO recognises **Career Preference Context** as explicit Candidate-declared exploration information associated with the Candidate's current professional-direction exploration. It records what the Candidate currently says they are interested in, prefer, would like to explore, would prefer to avoid, are practically constrained by, or remain uncertain about when considering possible professional directions. Its purpose is to inform exploration while preserving the distinction between what IMAGO professionally knows about the person and what the person currently wants to explore.

Career Preference Context is **Candidate-controlled** and may exist only from information explicitly supplied by the Candidate or explicitly confirmed by the Candidate. It is person-associated Product/Application state, reusable across Career Direction Exploration sessions where appropriate, but it is **not part of canonical factual Person Knowledge or the factual Professional Identity**. The narrow Beta persistence boundary is the Candidate's current Career Preference Context: the Product must preserve the current explicitly confirmed state across relevant exploration sessions, together with minimal update provenance sufficient to distinguish the current revision from stale context. A complex behavioural preference history or analytics system is not authorised.

Career Preference Context may be created when the Candidate explicitly supplies or confirms preference information and may be explicitly revised or replaced by the Candidate. The current revision supersedes the prior revision for current exploration without implying any change to Person Knowledge. Minimal provenance should preserve at least the fact that the state is Candidate-declared/confirmed and when the current revision was established or updated according to the repository's existing state conventions. `unknown`, `not sure` and `no preference` are legitimate explicit current states and must not be converted into inferred preferences. Absence of a stated preference likewise remains absence of preference information, not a negative preference.

The representation is intentionally **small and extensible rather than a universal career-preference taxonomy**. It may carry bounded Candidate-declared material such as interests/attractions, activity preferences, exploration orientations, avoidances, practical constraints, uncertainty and explicit Direction exploration requests. The Product may evolve the vocabulary as Candidate use is validated, but it may not infer hidden preference from behavioural observation merely to populate this context.

The canonical non-equivalences are:

`Career Preference Context != Evidence`

`Career Preference Context != Person Knowledge`

`Career Preference Context != professional capability`

`Career Preference Context != professional characteristic`

`Career Preference Context != fit`

`Career Preference Context != readiness`

`Career Preference Context != stable personality`

`Career Preference Context != Career Direction Hypothesis`

`Career Preference Context != Employer-visible Person truth`

A preference may change without any change to the factual Professional Identity. A Candidate moving from “I would like to explore people-coordination roles” to “I now want to focus primarily on specialist technical work” changes the current exploration context only. No Evidence, Observation, Measurement, DimensionContribution, KnowledgeLedger/Snapshot, PersonKnowledgeMatrix or factual Professional Representation material is thereby rewritten.

Under `professional_direction_explore`, Career Preference Context may influence **what the Product explores and how it presents exploration**: it may filter, broaden, prioritise, order or explicitly request exploration of Career Directions where this is transparent and justified by the Candidate's declared context. It may also make a Direction worth exploring because the Candidate explicitly wants to investigate it, including when current professional support is limited. It **must not manufacture Person-side professional support**. Existing authorised Professional Representation / Person-side material remains the only source of professional support for a Direction.

Therefore a Candidate statement such as “I like working with people” may justify exploring people-facing Directions more prominently because that interest was explicitly stated. It may not justify a claim that a people-management Direction is professionally supported, that the Candidate has people-management capability, or that the Candidate is suitable/ready for such a role. Preference must not compensate semantically for missing Evidence or missing professional support.

Career Direction explainability must preserve three distinct bases whenever applicable:

1. **Professional support** — why the Direction emerges from authorised preparation, experience, Knowledge or Professional Representation material.
2. **Candidate preference** — why the Direction is relevant to what the Candidate explicitly said they want to explore.
3. **Unknown / condition to verify** — what IMAGO still does not know sufficiently and may be worth investigating.

These bases must not collapse into one generic reason. A Direction may be explored from Candidate interest with limited professional support only when the Product makes that limitation visible and preserves unknown as distinct from absent, weakness, deficiency or capability gap.

Academic preparation, projects, internships, volunteering, extracurricular activity and early professional experience may contribute professional material only through already-authorised source-grounded mechanisms. PD-059 does not authorise `academic qualification -> professional capability -> career suitability`, and Career Preference Context cannot bridge that inference.

Career Preference Context may guide which authorised unknowns the Candidate wants to investigate. Existing acquisition remains authoritative for professional learning: `Direction condition / unknown -> authorised acquisition -> Runtime interaction -> Evidence -> authorised semantic interpretation -> Person Knowledge / Professional Representation -> re-evaluated Direction`. PD-059 does not authorise personality or psychometric inference, including response speed -> confidence, fluency -> stable communication capability, hesitation -> inability, assertiveness -> leadership, interview style -> personality, or conversational performance -> role suitability.

This decision preserves the convergence of Candidate journeys without defining the future Opportunity/Application boundary. A Candidate with a clear target may proceed from Professional Identity to Opportunity. A Candidate without a clear target may use `Professional Identity + Career Preference Context + Career Direction Exploration + selective authorised acquisition where useful -> Candidate-selected/explored target -> Opportunity`. Both may later converge on a separately authorised `Opportunity Understanding -> Grounded Application Package` boundary.

Career Preference Context must not become Employer functionality, Company Hiring Memory, Candidate scoring, fit/readiness scoring, personality profiling, psychometric assessment, a universal career ontology or hidden behavioural preference inference. Future Employer or Opportunity products may consume only separately authorised representations under future Product Authority; Candidate preference does not become Employer-visible Person truth merely because it is person-associated.

This decision authorises the Product boundary only. It does not implement Candidate UI, persistence wiring, Career Direction consumption, localization, Runtime changes, new Semantic Authority, new Person Knowledge, new Career Direction relations, Opportunity Understanding or Application Package generation.

## PD-060 — Grounded Opportunity Application Package
**Status: CANONICAL**

**Decision:** IMAGO authorises a bounded Candidate Application architecture that connects one concrete Candidate-supplied or Candidate-selected Opportunity with authorised Candidate professional material without rewriting factual Professional Identity. The canonical flow is:

`Living Professional Identity / authorised Professional Representation and professional material`
+
`Concrete Opportunity source -> Opportunity Understanding`
->
`target-relative grounded selection / emphasis / composition`
->
`Grounded Application Package`
->
`Targeted CV + Cover Letter`
->
`Candidate review -> copy / export / download`

No reverse mutation from Opportunity wording, Opportunity Understanding, Application Package or application-artifact prose into Evidence, Person Knowledge or factual Professional Identity is authorised.

### Opportunity and Opportunity Understanding

A **Concrete Opportunity** is a specific external application target selected or supplied by the Candidate, such as a job description, vacancy or otherwise authorised target source. It is distinct from a Career Direction: a Career Direction is an exploratory Product/Application hypothesis about a possible professional direction; a Concrete Opportunity is an external target considered for a specific application.

**Opportunity Understanding** is a derived, source-grounded Application-side Representation of one Concrete Opportunity. It belongs to the Candidate's application context, not to Person Knowledge and not to Career Direction Knowledge. Its authority comes from the authorised Opportunity source and its provenance must retain reconstructable reference to that source and, where applicable, the source version/current input from which the understanding was derived.

Opportunity Understanding may represent bounded application-relevant Opportunity-side meaning that is actually grounded in the source, including role purpose, responsibilities, explicitly requested experience, explicitly requested capabilities or knowledge, practical constraints, context, explicitly stated priorities and other source-supported requirements. It may normalize, structure and compose such information for application use, but it must not present hidden employer intent, unstated priorities, Candidate fit/readiness or inferred Candidate truth as facts. It does not create a universal job ontology.

For Beta, one application context needs only a **current Opportunity source/current Opportunity Understanding** plus minimal provenance sufficient to determine whether downstream artifacts still correspond to the current source. If the Opportunity source materially changes, the prior Opportunity Understanding and dependent package/artifacts must not silently be presented as current.

### Grounded Application Package

A **Grounded Application Package** is a derived Candidate/Application Representation for one specific Concrete Opportunity. It combines:

1. authorised Candidate professional material from the factual Professional Identity / authorised Professional Representation and existing source-grounded professional material; and
2. the current Opportunity Understanding;

to produce target-relative **selection, omission, ordering, emphasis, composition and wording** for application communication.

The Grounded Application Package is not Person Knowledge, Evidence, factual Professional Identity, Career Preference Context, Career Direction, Target Knowledge, Candidate fit/readiness or an Employer assessment. It is an Application artifact basis. Target relevance changes how supported Candidate material is communicated; it does not change what is professionally true about the Candidate.

The Product may select relevant supported material, omit less relevant material from a specific artifact, reorder and emphasize supported material, compose it differently, adapt wording to the Opportunity and explain the grounded relationship between Candidate material and Opportunity requirements. These transformations are presentation/application transformations, not professional inference.

Targeting must not create unsupported capability, upgrade participation to ownership, upgrade contribution to leadership, invent experience, outcome or seniority, convert qualification into demonstrated capability, convert Candidate preference into capability, or convert Opportunity wording into Candidate truth.

### Application claim grounding and semantic-strength preservation

Every substantive Candidate-side professional claim introduced by the Grounded Application Package or its generated artifacts must remain **reconstructably grounded in authorised Candidate professional material**. The Product must retain enough support/provenance to answer internally, and Candidate-facing where useful, `why is IMAGO allowed to say this about this Candidate?`

Existing Evidence, Knowledge, Professional Representation and source-grounded professional-material architecture remains authoritative. PD-060 does not create a parallel CV truth system. If a substantive Candidate-side claim cannot be sufficiently grounded, it must fail closed rather than silently appear as Candidate fact.

`application wording != Person Knowledge`

`application wording != factual Professional Identity`

Wording may improve clarity, concision, structure and target relevance only while preserving the semantic strength of its grounding. A supported statement such as `participated in the launch of a new production line in Germany` may be reworded to foreground relevant supported context, but it may not become `led the international launch of a new production line` unless leadership/ownership is independently authorised and grounded. Rhetorical usefulness never authorises semantic strengthening.

### Shared package basis for CV and cover letter

The **Grounded Application Package is the common grounded basis** for both Targeted CV and Cover Letter. They are derived communication artifacts, not independent truth systems:

`Grounded Application Package -> Targeted CV`

`Grounded Application Package -> Cover Letter`

The artifacts may legitimately differ in selection, structure, detail, narrative form and wording because their communication purposes differ. They must not disagree about Candidate facts or independently manufacture Candidate-side claims. Both retain traceability to the same authorised Candidate/Opportunity basis.

### Candidate editing

Candidate editing of generated CV or Cover Letter is authorised as application preparation. Editing an application artifact does **not** automatically update Evidence, Person Knowledge, Professional Representation, source-grounded professional history or Career Preference Context.

A Candidate may revise wording while keeping the artifact in the application layer. If an edit introduces a genuinely new or semantically stronger factual professional claim that is not already sufficiently grounded, IMAGO must not silently promote that prose into factual Professional Identity or treat it as grounded package truth. Such a claim must remain unverified/unadopted by IMAGO or enter a separately authorised confirmation/acquisition path before it can be represented as supported Candidate fact. PD-060 does not define a complex editor or new Evidence-acquisition mechanism.

### Minimal Beta lifecycle and staleness

The minimum Beta lifecycle is:

`one Concrete Opportunity`
->
`current Opportunity Understanding`
->
`current Grounded Application Package`
->
`Targeted CV + Cover Letter`
->
`Candidate review`
->
`copy / export / download`

Regeneration is required or must be explicitly offered when a material grounding input changes: relevant Candidate professional information/Professional Representation, the Concrete Opportunity source/Opportunity Understanding, or an intentional Candidate regeneration request. The Product must preserve minimal input identity/version/provenance sufficient to mark dependent generated material as current or stale. It must not silently present stale artifacts as if they reflected current grounding. PD-060 does not authorise a general version-management platform, CRM, application tracking or bulk-application system.

### Candidate review and handoff

The Candidate remains the final human authority over external use/submission. IMAGO may prepare and explain grounded application material and permit Candidate-controlled copy, export or download. Automatic sending, employer contact, job-board submission and autonomous application are not authorised by PD-060.

### Explainability and unsupported Opportunity requirements

Candidate-facing application explanation must preserve the ability to distinguish:

- Candidate professional material supporting a claim;
- Opportunity-side material/requirement that motivated selection or emphasis;
- the grounded reason for the target-relative composition;
- Opportunity requirements for which current Candidate information is not sufficiently established.

An Opportunity requirement that is not sufficiently supported by current Candidate information is **not automatically a weakness, deficiency, capability gap or absence of capability**. `not sufficiently established != absent`. Existing target/person epistemic separation under PD-023, PD-033 and PD-034 remains authoritative.

### Early-career compatibility and journey convergence

The same architecture applies to experienced and early-career Candidates. Academic preparation, projects, internships, volunteering, extracurricular activity and limited professional experience may feed the package only through already-authorised source-grounded Candidate material. PD-060 does not authorise `degree -> capability`, `internship title -> suitability` or `preference -> capability`.

The two Candidate paths converge on the same Application boundary:

`Professional Identity -> Concrete Opportunity -> Opportunity Understanding -> Grounded Application Package`

or, for an initially unclear target:

`Professional Identity + Career Preference Context -> Career Direction Exploration -> optional authorised acquisition -> Candidate chooses/finds Concrete Opportunity -> Opportunity Understanding -> Grounded Application Package`.

No separate Candidate truth system is created.

### Legacy CV functionality and reuse

Existing legacy CV/target implementation, including `buildCvReviewReportV1` and related narrative/template/rewrite components, is implementation evidence only and is not promoted to Product Authority by PD-060. Later implementation may reuse mechanically safe components such as bounded formatting, narrative/template composition or artifact rendering where they can consume the PD-060 grounded package contract without carrying forward legacy semantic assumptions.

Legacy paths that derive target narratives directly from `candidateProfile`, traits/signals, role-family heuristics or other pre-current-authority interpretations must not become the canonical grounding architecture and must not bypass current Professional Identity, Professional Representation, Opportunity provenance or application-claim grounding.

### Explicit non-goals

PD-060 does not authorise job scraping/discovery, job recommendation ranking, Candidate/job fit scoring, ATS score, readiness score, Candidate or employer ranking, automatic submission/sending, bulk applications, application CRM/tracking, Company Hiring Memory, Employer product, personality profiling, psychometrics, inferred soft-skill assessment, universal skills/job ontology or autonomous career decisions.

This decision establishes Product Authority only. It does not implement Opportunity ingestion, Opportunity Understanding, Grounded Application Package generation, Targeted CV, Cover Letter, editor, export UI or production wiring.

## PD-061 — Grounded Candidate Application Experience and Professional Document Composition
**Status: CANONICAL**

**Decision:** IMAGO extends the closed PD-060 Grounded Opportunity Application Package into a Candidate-grade Application Experience and professional-document composition boundary. PD-061 does not weaken PD-060: the target controls relevance, emphasis, ordering, level of detail, document-space allocation, composition and wording only within authorised semantic strength; the target never determines Candidate truth.

The canonical Candidate Application purpose is:

`understand target -> relate target to authorised Candidate information -> identify materially relevant information not sufficiently established -> optionally acquire through existing authorised paths -> compose complete but target-focused Candidate documents -> Candidate review/control -> professional artifact output`.

### Target Understanding: concrete JD and no-JD boundary

For a **Concrete Opportunity with supplied JD/source**, PD-060 Opportunity Understanding remains authoritative. Opportunity-side responsibilities, requirements, qualifications, experience, tools/technologies, languages, context, stated seniority/scope and other material conditions may be represented only when source-grounded. They are Opportunity facts/claims, never Candidate facts.

A **Target Role without a concrete JD** is a different authority problem. Typical role characteristics cannot be represented as requirements of a specific employer, and model prior knowledge alone cannot silently become canonical role truth. Productive no-JD targeting therefore requires a separately authorised **Role Understanding / Role Knowledge source-and-provenance boundary** before it may drive target-relative professional composition. PD-061 does not create that authority or a universal professional ontology.

The first PD-061 implementation vertical slice is consequently limited to **Concrete Opportunity / supplied JD**. No-JD preparation remains an authorised product direction but is blocked from productive target semantics until the separate Role Understanding authority is established.

### Target-Relative Information Map

For each materially relevant Opportunity element, IMAGO may derive a non-evaluative **Target-Relative Information Map** that distinguishes:

- `sufficiently_documented`: authorised Candidate material sufficiently establishes the bounded Candidate-side meaning relevant to the Opportunity element;
- `related_but_not_established`: authorised related material exists, but does not establish the stronger Opportunity-side meaning;
- `not_sufficiently_established`: current authorised Candidate information does not sufficiently establish the relevant meaning;
- `candidate_uncertain`: the Candidate has explicitly expressed uncertainty where an authorised Candidate-controlled state supports it.

These states are epistemic/application states, not capability, fit, readiness, suitability, deficiency or ranking states. They preserve distinctions such as collaboration ≠ coordination, participation ≠ ownership, project participation ≠ project management, investment exposure ≠ investment decision authority, and `not sufficiently established != absent`.

Candidate-facing language must express these states naturally and must not expose internal semantic/grounding terminology unnecessarily.

### Pre-Application Targeted Acquisition

Before final composition, IMAGO may propose **optional bounded acquisition** for materially relevant Opportunity elements that are not sufficiently established, but only where existing acquisition and semantic authority can legitimately investigate the Candidate-side unknown.

The purpose is to discover relevant real Candidate information that may not yet have been acquired, not to manufacture fit. The canonical path remains:

`Candidate answer -> authorised Evidence -> Observation / Measurement / Knowledge where authorised -> Professional Identity / Representation -> target-relative Application material`.

Application generation may never promote a raw answer directly into a stronger CV/letter claim. Acquisition is optional; unanswered questions are not negative evidence. Prioritisation is limited to information whose clarification could materially change the grounded application composition. Long generic questionnaires are not authorised.

### Canonical CV Content Model

PD-061 authorises a **CV Content Model** distinct from both the factual Professional Identity and the visual template. A targeted CV is a coherent Candidate-owned professional document, not merely the subset of statements that match the Opportunity.

Where known, authorised and appropriate, the model may contain:

1. **Candidate-controlled personal/contact header** — name, surname, contact channels, LinkedIn, appropriately bounded location and other Candidate-controlled practical/contact information. This is application/account-side personal information and is architecturally distinct from canonical professional Knowledge.
2. **Professional summary** — concise Candidate-centred synthesis of grounded professional imprint, relevant experience/context, distinctive supported material and target-relative positioning without generic unsupported praise.
3. **Professional experience** — normally reverse chronological, preserving role, organisation, location where relevant, supported dates/period, scope, responsibilities, people/organisational responsibility, projects/episodes, measurable results and supported demonstrated professional material.
4. **Education** — qualification, institution, supported dates/years, relevant specialisation, grade/result, thesis/project or academic achievement where known and materially useful.
5. **Skills / knowledge / tools / languages / certifications / standards** — only through existing authorised distinctions between declaration, Evidence, Knowledge and Representation wording.

Quantitative evidence such as team size, sites/lines, volumes, budgets, investment scope, revenue/cost impact, productivity, quality, scrap/reject reduction, lead time, capacity, project scale, timing, awards or recognised results may be surfaced when actually supported. Numbers must never be invented or estimated for rhetorical effect. Missing high-value quantitative information may be a candidate for authorised pre-application acquisition.

### Complete history and target-relative emphasis

The target controls **document emphasis, not Candidate history**. A CV should normally preserve a coherent professional and educational chronology. Less relevant experiences may be compressed; materially relevant experiences may receive more detail, document space, concrete evidence and prominent target-relevant material. Significant history must not be silently erased merely because it is less relevant to the current target.

“Complete” means sufficient continuity and professional coherence for the Candidate document, not exhaustive reproduction of every source detail.

### Document information budget

The preferred CV composition target is approximately **one page**, with **two pages acceptable** where needed to preserve material professional history and target-relevant evidence. The Product must not artificially fill pages or destroy useful evidence to force one page.

Document-space allocation may consider professional stage, target relevance, informational distinctiveness, evidence strength, chronology/coherence, redundancy and readability. These are composition criteria only and must not become hidden Candidate scoring/ranking. Early-career Candidates will normally fit one page; experienced/senior Candidates may legitimately require two.

### Candidate document voice

CV and Cover Letter are Candidate-owned communication artifacts and must not read as IMAGO reports about the Candidate. Grammatical perspective may be transformed from internal third-person Representation language into conventional CV nominal/bullet language or natural first-person letter language only when factual/semantic strength is preserved.

`Candidate voice transformation != semantic strengthening`.

### Grounded Cover Letter composition

The Cover Letter is a separate narrative composition derived from the same PD-060 Grounded Application Package and must not be a prose copy of the CV. It should select a small number of meaningful grounded connections and may express the addressed Opportunity, explicit Candidate-controlled interest/motivation where available, relevant supported professional history, concrete supported experiences/results, their relationship to the Opportunity and a natural closing.

No motivation, company admiration, capability, result, ownership or suitability may be invented.

### Content model vs presentation template

PD-061 establishes strict separation:

`grounded CV / Cover Letter content`
!=
`document presentation template`.

A visual template cannot change Candidate truth. The same authorised content model may be rendered through multiple presentation templates.

For Candidate Beta the authorised presentation families are:

- **Essential / ATS-friendly** — single column, strong readability, minimal decoration, machine-friendly structure;
- **Professional** — polished, clear hierarchy, conservative professional appearance;
- **Compact / Modern** — denser bounded presentation, optionally using secondary multi-column regions while preserving readability.

Template choice is Candidate presentation preference, not a professional assessment and not a profession-specific truth model.

### Professional artifact output

Plain-text download remains valid as technical routing evidence but is not the intended final Candidate product. The Candidate Application Experience must support preview, template choice/change, content review and professionally usable download artifacts derived from the same authorised content model.

For the bounded Candidate Beta, **PDF is the required stable presentation artifact**. **DOCX is an authorised editable artifact format where implementation can preserve the same content/provenance boundary without semantic duplication.** A first implementation slice may deliver PDF first and add DOCX in the same slice only if bounded and safe; plain TXT may remain diagnostic/fallback but does not satisfy Candidate-grade completion by itself.

No automatic submission is authorised.

### UI, source and document language

PD-061 distinguishes three independent language dimensions:

1. **UI language** — controlled by the existing localized Candidate interface;
2. **Opportunity/source language** — the language of the supplied JD/source;
3. **generated document language** — Candidate-selected/confirmed language for CV/Cover Letter.

These may differ. Changing document/source language must not silently change UI language. Candidate-facing explanations must be naturally localized while preserving source meaning. New UI strings remain externalised through the existing localization architecture; internal terms such as grounding, semantic authority, target-relative material and Representation should normally not be exposed to Candidates.

### Application workspace remains separate from Professional Identity

PD-060 separation remains canonical. Target role/JD, Opportunity Understanding, Target-Relative Information Map, application-specific composition, CV, Cover Letter, template/language choices and staleness/version state are Application-side material and do not become Person Knowledge.

If targeted acquisition discovers new Candidate facts, only the canonical authorised Evidence/Knowledge path may update Professional Identity. Candidate document edits do not silently mutate Professional Identity; unsupported strengthening remains unverified or requires an authorised confirmation/acquisition path.

### Candidate-facing Application journey

The bounded Candidate journey is:

1. choose a visible Candidate purpose;
2. provide/select a Concrete Opportunity and JD;
3. understand what appears important for the position;
4. relate current documented professional information;
5. identify materially relevant aspects not yet sufficiently established;
6. optionally explore those aspects through authorised targeted acquisition, or proceed with current information;
7. compose the grounded CV Content Model and Cover Letter;
8. choose document language and presentation template;
9. review as final human authority;
10. download professional artifact(s).

Stages may be progressively disclosed or skipped when unnecessary. The Product must not force completeness.

### Controlled-exploration UX findings

The following findings are canonical Candidate-experience requirements for the next bounded implementation:

- **UX-01 Purpose gating:** Career Preference controls are shown only when materially relevant to Career Direction/Exploration or progressively needed; they must not burden concrete Application preparation by default.
- **UX-02 Purpose discoverability:** major Candidate purposes should be visible actions/cards/buttons at the generic entry boundary rather than hidden only inside a generic dropdown.
- **UX/DATA-03 Source identity:** distinct Candidate professional sources must expose enough bounded identity (such as title/type/date/context) to distinguish them; distinct sources are not collapsed merely to remove duplicate labels.
- **APP-01 Localization:** Candidate Application UI/document language routing must be corrected so IT/EN interface and document language are intentionally separated.
- **APP-02 Candidate voice:** generated professional artifacts must use coherent Candidate document voice.
- **APP-03 Natural Candidate language:** internal grounding/architecture terminology must not leak into normal Candidate UI.
- **APP-04/05 Candidate-grade composition:** CV and Cover Letter must use the PD-061 content/composition models rather than prototype statement concatenation.
- **APP-06 Professional materialization:** Candidate-grade output requires professional document rendering; TXT-only output is insufficient.

These are Candidate-experience/composition corrections, not evidence that PD-060 semantic architecture failed.

### Candidate review authority

The Candidate remains the final human authority over document content and external use. IMAGO may prepare, explain, preview and render grounded artifacts, but may not automatically submit or send them.

### Explicit deferrals and boundaries

PD-061 explicitly defers:

- **No-JD productive targeting** until a separate Role Understanding / Role Knowledge source-and-provenance authority is canonical;
- **Portable Professional Identity (BETA-04)** as a separate Product/Architecture task covering versioned, validated Candidate-controlled export/import/resume of authorised Professional Identity;
- **Data & Privacy Architecture** as a separate exploration covering account/personal data, professional data, preference/application data, analytics/research data, processing purposes, lawful bases/consent where applicable, minimisation, pseudonymisation/anonymisation, storage, encryption, retention, deletion, portability, backup, server persistence, account linkage and jurisdictional requirements.

PD-061 does not authorise fit/readiness/employability scoring, Candidate/employer ranking, hiring recommendation, psychometric/personality inference, generic Person capability inference, universal professional/job ontology, job scraping/discovery, ATS-gaming claims, fabricated keywords/experience/results, automatic submission, Employer-side evaluation, CRM, complete account/storage/privacy architecture or Portable Professional Identity implementation.

### Next authorised implementation scope

One bounded implementation vertical slice is authorised for the existing controlled Candidate scenario (“Marco”) and supplied Industrialization Project Engineer Opportunity:

`known Professional Identity + Concrete Opportunity/JD`
->
`Opportunity Understanding`
->
`Target-Relative Information Map`
->
`material unknowns`
->
`optional bounded acquisition through existing authority`
->
`complete CV Content Model`
->
`target-focused composition`
->
`Candidate-grade CV + Candidate-grade Cover Letter`
->
`template-based preview`
->
`professional PDF download (DOCX optional if safely bounded)`
->
`return to Professional Identity without Opportunity contamination`.

The implementation must also address UX-01, UX-02, UX/DATA-03 and APP-01 through APP-06 within this bounded Candidate journey, preserve existing IT/EN localization architecture, and must not introduce the separately deferred no-JD Role Understanding, Portable Professional Identity or Data & Privacy Architecture.


## PD-062 — Candidate Application Document Composition and Completeness Authority
**Status: CANONICAL**

**Decision:** PD-061 already authorises the Candidate-grade CV/letter content boundary; PD-062 closes the narrower missing authority exposed by the supervised human test: how authorised person material is assembled into a coherent professional-history document and how missing document-structural information is represented and optionally acquired. It does not create a second Candidate truth system and does not reopen PD-060 or PD-061.

The canonical composition flow is:

`Living Professional Identity + Candidate-controlled document data + authorised Representation/Evidence/Knowledge -> Professional History Structure -> Document Completeness State -> optional bounded Completeness Acquisition -> Opportunity Understanding -> Target-Relative Information Map -> Candidate Application Content Model -> semantic-invariant Document Voice/Composition -> Presentation Template -> Candidate Review -> Export`.

The order is conceptual rather than a requirement for one technical pipeline. Opportunity understanding and target-relative mapping may already exist before completeness acquisition; any regeneration must consume the same authorised inputs and preserve provenance.

### Professional History Structure

A Candidate CV is assembled from **professional-history entries**, not from an undifferentiated list of Representation statements. A history entry is a document-composition object that groups already-authorised material referring to the same supported professional experience/context. Where known, it may carry role, organisation/employer, location, period, responsibility/scope, supported contributions, episodes/projects, results and quantitative scope, with reconstructable provenance to the underlying authorised material.

Grouping is a composition operation, not new Person Knowledge. It may associate material only where the existing source/Representation context supports that association. Source identity, Evidence identity and professional-episode identity remain distinct. Ambiguous experience identity or chronology must remain ambiguous; the composer must not infer employer, dates, sequence, ownership or episode identity merely to make the CV look complete.

All materially distinct professional experiences should remain represented sufficiently to preserve a coherent history unless the Candidate explicitly chooses otherwise. Target relevance may change detail, emphasis and document-space allocation, but not chronology or truth. Older or less relevant experience may be compressed; target-relevant supported episodes/results may be expanded.

### Document Completeness State

PD-062 establishes **Document Completeness State** as an Application-level epistemic state about whether the information currently available is sufficient to materialise a coherent requested document. It is separate from Target-Relative Information Map and from Person Knowledge.

A completeness need may concern, where relevant to the requested artifact, Candidate-controlled identity/contact data, professional-history structure, education, supported skills/languages/tools/certifications, or other document-structural information already authorised by PD-061. Each need must identify the bounded missing/unclear document field or relationship and the professional-history/document context to which it belongs when known.

`document information unavailable != Candidate lacks it`.

Document Completeness State is not a CV score, Candidate quality score, fit/readiness state, employability measure or professional characteristic. No percentage, ranking or global completeness score is authorised. A document may still be generated after the Candidate skips a completeness need; the resulting artifact must simply avoid fabricating the missing information.

### Two independent information-gap classes

Application composition must preserve two different questions:

1. **Document-completeness need** — information missing or unclear for coherent materialisation of the requested Candidate document, independently of target relevance.
2. **Target-relative information need** — information whose clarification could materially change the grounded relationship between authorised Candidate material and the concrete Opportunity.

One fact may be relevant to both, but the states and reasons remain distinct. Target-relative uncertainty must not be used to imply a document-history fact is absent, and document incompleteness must not be converted into target distance or Candidate weakness.

### Bounded Completeness Acquisition

IMAGO may offer optional, contextual acquisition only for concrete completeness needs detected in the current document. It must not require a generic profile questionnaire before useful output. The Candidate may answer, decline, skip or leave the information unknown.

Acquired information follows one of three authority classes:

- **Candidate-controlled document data**: information such as the contact channels the Candidate chooses to show in the artifact. It is Application/account-side input and does not become professional Knowledge merely by being supplied.
- **Source-supported professional-history fact**: factual professional material such as an employer, employment period, qualification/institution or supported experience metadata. It must enter through an authorised professional source/Evidence path with provenance before reusable Professional Identity/Representation material may depend on it.
- **Semantic professional claim**: information such as people responsibility, decision authority, outcome attribution or another claim requiring semantic interpretation. It may affect reusable Knowledge only through the existing canonical Evidence -> authorised semantic interpretation -> Observation/Measurement/Knowledge path. If semantic authority is unavailable, it remains unpromoted/unknown rather than being upgraded for the CV.

Candidate assertion alone does not authorise a stable capability or characteristic. `"I am a strong leader"` is not a shortcut to Person Knowledge.

### Candidate-controlled document identity/contact data

Candidate-controlled identity/contact data is a separate composition input from professional Knowledge. Name, surname, phone, email, LinkedIn, bounded location/address and practical contact/mobility fields may be included only when explicitly supplied/authorised for the document. They must not be inferred from professional Evidence. PD-062 does not define account persistence, authentication, privacy storage, retention or production data architecture.

### Education and skills-like material

Education is represented as supported history/document material: qualification, institution, period/year and, when available and materially useful, specialisation, thesis/project, grade/result or academic achievement. Education prominence may vary with professional stage, but qualification alone does not establish capability or suitability.

Languages, tools/software, methods, certifications, technologies/processes and standards may be rendered when supported by authorised Candidate material and with the epistemic strength already available. Document presentation may state a supported declaration as a declaration; it must not silently convert it into an observed general capability. PD-062 does not create a universal skills ontology.

### Professional Summary composition

The Professional Summary is a bounded document synthesis, normally concise, built only from authorised Candidate material. It may foreground target-relevant supported experience, scope, context and distinctive professional material, but must not invent personality, attitude, capability, seniority, motivation or generic praise. It should not be a concatenation of source statements or a duplicate of the first experience entry.

Summary composition may compress and connect already-supported meanings when provenance remains reconstructable and semantic strength is invariant. Target controls foregrounding, not Candidate truth.

### Semantic-invariant Document Voice Transformation

PD-062 confirms and makes operational the PD-061 Candidate voice rule. A document composer may transform grammatical person, tense, sentence form and CV/letter convention when the represented proposition remains semantically invariant.

Examples of authorised transformation include third-person Representation wording into conventional CV bullet/nominal wording, or into natural first-person wording for a Candidate-owned Cover Letter. Participation must remain participation; collaboration must remain collaboration; shared responsibility must remain shared; project-level outcome must not become exclusive personal causality.

`document voice transformation != semantic inference != semantic strengthening`.

### Cover Letter composition

The Cover Letter must be a narrative composition from the same authorised Application content base, not a concatenation of Representation statements and not a prose duplicate of the CV. It should use Candidate-owned first-person voice, identify the concrete Opportunity, select a small bounded set of materially relevant supported connections, connect them coherently, and close naturally. Explicit Candidate motivation may be used when available; otherwise neutral application intent is sufficient. Employer admiration, motivation, ownership, capability, result or suitability must not be invented.

### Candidate-facing Opportunity Understanding projection

The supplied JD/source remains preserved as Opportunity source material. Candidate-facing Opportunity Understanding is a **bounded projection** of that source, not a replay of every source line. Presentation may structure source-grounded material into opportunity identity/context, responsibilities, requirements, preferred/advantageous conditions, practical constraints and unclear/unclassified material where supported by the source.

Headings, duplicated title text and introductory boilerplate must not be promoted into Candidate information gaps merely because they occur as source lines. Unclear parsing must remain unclear rather than being silently reclassified.

The Candidate-facing Target-Relative Information Map should group materially useful states and use ordinary Candidate language. Internal terms such as `grounded`, grounding status or semantic-policy jargon are not Candidate-facing Product language. Repetition should be reduced through bounded grouping without hiding materially distinct unknowns. No fit/readiness/suitability score or Candidate ranking is authorised.

### Human-test defect classification

The supervised PD-061I test establishes the following classification for downstream work:

- HT-01 through HT-15 expose existing-authority implementation gaps plus the composition/completeness authority closed by PD-062; downstream implementation may now address them within PD-057/058/060/061/062.
- HT-16 HTML preview line wrapping is a presentation/UX implementation defect. It requires no new semantic Product Authority.
- HT-17 duplicate human labels for distinct professional declarations is a source-presentation/disambiguation UX defect. Existing source identity/provenance authority is sufficient; the UI may use available supported metadata or deterministic localised disambiguation, but must not invent missing metadata.

### Explicit non-goals

PD-062 does not authorise no-JD Role Knowledge, model-prior role requirements, Portable Professional Identity, account/authentication architecture, production persistence/privacy architecture, Employer product, job discovery/scraping, Candidate/job scoring, fit/readiness/suitability ranking, automatic submission, universal skills ontology or a parallel CV truth store.

PD-062 is Product Authority only. It does not itself modify production code, UI, runtime, tests, configuration or document renderers.

## PD-063 — Candidate Artifact Language Transformation Authority

Status: **CANONICAL AUTHORITY COMPLETE**

### Canonical concept

**Candidate Artifact Language Transformation** is a bounded derived presentation/document transformation that renders already authorised Candidate meaning in a Candidate-requested natural language while preserving the meaning, semantic strength, epistemic status and provenance of the authorised material.

It is downstream of Candidate truth. It does not create Candidate truth, a new professional source, Evidence, Observation, Knowledge, a language-specific Professional Identity, capability, seniority, personality, motivation, fit/readiness or target-driven facts.

`artifact language transformation != semantic inference != semantic strengthening`.

One Professional Identity may therefore support multiple language-specific Candidate artifact materialisations without creating multiple language-specific Candidate truth models.

### Semantic invariants

Across artifact-language materialisations, the following must remain invariant wherever present in the authorised input:

- participation / contribution / collaboration / coordination / ownership distinctions;
- responsibility scope, including shared versus exclusive responsibility;
- project/event result versus Candidate-attributed causal achievement;
- uncertainty and ambiguity;
- Candidate-declared versus observed/derived epistemic status;
- related-but-insufficient versus established information;
- `unknown != absent`;
- provenance/support sufficient to reconstruct the authorised source meaning.

Natural-language vocabulary, grammar, syntax, punctuation, idiom and conventional CV/Cover Letter phrasing may change only within those invariants.

Thus, for example, a supported meaning equivalent to `ha partecipato` may be materialised as `participated`, but not as `led`; `responsabilità condivisa` may become `shared responsibility`, but not `full responsibility`; a project-level result may not become an exclusively Candidate-caused achievement unless that causality is independently authorised.

### Candidate Application Content Model and transformation ordering

The canonical Candidate Application Content Model remains the single authoritative Application-side semantic/content basis. It is conceptually language-independent **at the Candidate-truth level**: it carries authorised propositions, structure, provenance and epistemic boundaries, while source excerpts may of course retain their original natural language.

PD-063 does not require a universal abstract linguistic representation.

The safe canonical materialisation boundary is:

```text
authorised Candidate material
→ Candidate Application Content Model
→ bounded artifact materialisation
   {requested language + document voice/composition convention}
→ Candidate review
→ presentation / export
```

Artifact Language Transformation and PD-062 Document Voice Transformation are therefore sibling constraints of one bounded materialisation step from structured authorised meaning, not authority for an uncontrolled chain of free-text translation → paraphrase → narrative rewrite. Implementations may use internal stages when technically necessary, but every stage must remain traceable to the same structured authorised meaning and the final wording must preserve semantic strength.

Professional Summary and Cover Letter composition may be materialised naturally in the requested language under the same rule. Fluency does not authorise embellishment such as `experienced`, `expert`, `leader`, `strategic`, `highly skilled`, `results-driven`, `proven`, `successful`, enthusiasm, employer admiration, cultural fit, ownership or causal achievement unless independently supported.

### Provenance and source preservation

The original authorised Candidate material remains preserved in its source language. Artifact-language wording is derived Application/document materialisation and remains reconstructably linked to the same authorised support.

Translation/materialisation does not overwrite source text and does not create new Evidence, Knowledge or Professional Identity. Candidate edits to translated artifact wording remain governed by the existing PD-060/PD-061/PD-062 review boundary and do not silently mutate canonical Professional Identity.

The original Opportunity/JD likewise remains preserved in its source language. PD-063 does not redefine Opportunity Understanding or rewrite the canonical Opportunity source.

### Language independence and Candidate control

These are independent dimensions:

- UI language;
- Candidate professional-material source language(s);
- Opportunity/JD source language;
- requested Candidate artifact language;
- Candidate language proficiency.

The Candidate controls the requested artifact language from the currently supported set. Changing artifact language must not change UI language, rewrite source material or establish Candidate language proficiency. Generating an English CV, for example, is not evidence that the Candidate speaks English and must not populate `Languages: English` without separately authorised Candidate language information.

A Professional Identity may contain authorised material originating in multiple source languages. PD-063 authorises only the bounded transformation needed to materialise the requested Candidate artifact; it does not create a translation-management platform.

### Fail-closed rule

When several translations are linguistically plausible, choose only wording that preserves the authorised semantic boundary. Ambiguity must not be resolved toward stronger professional meaning.

If a safe semantic-preserving materialisation cannot be established, the implementation must fail closed by preserving visibly attributable source wording, requesting Candidate review/confirmation, or exposing a bounded inability to transform that item. It must not silently choose a stronger interpretation.

The Candidate remains final authority over reviewable artifact wording before use/export. No automatic application submission is authorised.

### Supported-language boundary

PD-063 defines a reusable **semantic capability**, not an unlimited language promise.

For the current Private Beta, the authorised implementation target is limited to the language set already exposed and supported by the repository: **Italian and English**. Future languages may reuse this authority only when separately implemented and verified. PD-063 does not promise perfect, certified or native-level translation.

Translation quality is not Candidate quality. No translation score, Candidate language score, communication-quality score, employability score, fit/readiness inference or language-proficiency inference is authorised.

### Human-test finding and implementation boundary

The controlled PD-062I Human Candidate test establishes:

- UI/source/artifact language separation: **HUMAN VERIFIED**;
- structural labels and boilerplate can follow requested artifact language: **HUMAN VERIFIED**;
- transformation of Candidate-derived professional content into the requested artifact language: **NOT YET IMPLEMENTED / NOT YET HUMAN ACCEPTED**.

The current Beta must therefore not be described as fully translating Candidate artifacts.

PD-063 is Product Authority only. It does not modify production JavaScript, UI, configuration, tests, runtime, PDF rendering, localisation resources or provider/model selection.

The next bounded implementation may use this authority to resolve the existing Candidate-quality language defect (CQ-05) together with the separately identified PD-062I Candidate-quality corrections. PD-063 does not itself solve CQ-01/02/03/04/06/07.

### Explicit non-goals

PD-063 does not authorise a general-purpose translation service, translation memory, localisation-management platform, unlimited languages, automatic source-language-detection architecture beyond implementation necessity, Candidate language-proficiency inference, no-JD Role Knowledge, Employer product, job discovery, Candidate scoring, fit/readiness, psychometrics, Account/Data/Privacy architecture, Portable Professional Identity, automatic application submission or marketing claims of perfect/certified translation, ATS optimisation, international suitability or improved employability.

## PD-064 — Candidate Application Semantic Protection Contract

Status: **CANONICAL AUTHORITY COMPLETE**

### Canonical concept

IMAGO authorises **Candidate Application Semantic Protection** as sparse transformation-control metadata attached to, or reconstructably referenced by, authorised Candidate Application material.

Semantic Protection does **not** create professional meaning. It records only transformation-sensitive invariants already established by upstream authority so that downstream language/document materialisation cannot strengthen, contradict, reassign or erase them.

Therefore:

`Candidate professional meaning != Semantic Protection metadata`

and:

`Semantic Protection != Evidence != Observation != Knowledge != characteristic != capability != fit/readiness`.

Semantic Protection is Application-side control metadata, not a Person ontology or competing truth store.

### Minimum protection contract

For the current Beta vertical slice the explicit protection vocabulary is closed to four transformation-safety dimensions:

1. **agency relation** — only where upstream authority already establishes a distinction equivalent to participation, contribution, coordination, ownership or decision;
2. **responsibility scope** — only where upstream authority already establishes shared/non-exclusive versus exclusive responsibility;
3. **result attribution** — only where upstream authority already establishes whether a result belongs to a project/team/process/event context rather than to Candidate-exclusive causality;
4. **epistemic boundary** — only where an existing upstream state materially constrains document wording, including declared/observed or derived status, uncertainty/establishment, and `unknown != absent`.

These are protection dimensions, not scores, competencies or a universal ladder of professional strength. The Application layer may preserve an upstream distinction but may not infer one from arbitrary prose merely to populate the contract.

The contract is deliberately sparse. Each item has a protection state:

- `established`: one or more explicit protections are reconstructably justified upstream;
- `no_additional_protection_needed`: existing structure is sufficient for the requested transformation boundary and no explicit transformation-sensitive semantic distinction is required;
- `insufficiently_established`: safe generative transformation would require a semantic protection that upstream authority does not establish.

Absence of metadata is never interpreted as unrestricted transformation permission.

### Derivation and provenance

Every `established` protection must reference the authorised upstream distinction that justifies it. Valid origins include existing canonical structured authority such as source-grounded Episode Meaning, authorised semantic-policy output, explicit responsibility/participation/result structure, or another already-canonical structured Application input.

Application may copy/reference that distinction without strengthening it. It may not run a model over legacy/free prose and silently assign protection semantics.

A protection therefore travels with the Candidate Application Content Model item needed for materialisation, conceptually:

```text
CandidateApplicationContentItem
  authorisedContent
  provenance
  semanticProtection?
```

No `SemanticProtectionKnowledgeBase`, translated Professional Identity or Person-level protection store is authorised.

### Structural versus explicit protections

The following remain protected by existing structure and are not duplicated as semantic tags:

- item identity;
- Professional Experience identity and association;
- chronology;
- source/provenance relationship;
- Candidate/document identity versus professional content;
- original source text;
- Candidate Application Content Model immutability;
- Professional Identity immutability.

Explicit Semantic Protection is used only for the four transformation-sensitive dimensions above when existing structure alone cannot prevent semantic promotion.

Target/Opportunity relevance may continue to affect selection, omission, ordering and emphasis under PD-060/061/062, but it may not change a Semantic Protection.

### Agency protection

Where upstream authority establishes an agency relationship, downstream materialisation must preserve that relationship and may not promote it to another stronger professional relationship.

For the first Beta slice, existing canonical distinctions such as `participated`, `contributed`, `coordinated`, `owned` and `decided` may be referenced as **authorised relation identities** when upstream material already uses/establishes them. PD-064 does not turn them into a universal Person capability ladder and does not authorise inference of a relation from free prose.

Thus a protected participation relation cannot be materialised as leadership/management/ownership; contribution cannot be materialised as ownership or independent delivery unless that stronger relation is separately authorised.

### Responsibility-scope protection

Where upstream authority establishes shared/non-exclusive responsibility, the protection records that non-exclusivity. Transformation must not materialise sole/full/exclusive responsibility unless exclusivity is independently authorised upstream.

This is a wording invariant, not a Candidate responsibility characteristic.

### Result-attribution protection

Where upstream authority establishes a result at project/team/process/event level without Candidate-exclusive causality, the protection records that attribution boundary. Transformation may describe the supported result but may not convert it into a first-person or Candidate-exclusive causal achievement.

PD-064 does not create a general causal-reasoning ontology.

### Epistemic protection

Where upstream material already carries a bounded epistemic state, downstream wording must preserve it. Candidate-declared is not silently upgraded to observed; source-supported episode meaning is not rewritten as stable capability; uncertain/not-sufficiently-established is not rewritten as established; unknown is not rewritten as absent.

The contract references existing epistemic authority rather than duplicating the Knowledge architecture.

### Controlled transformation-result contract

For items with `established` Semantic Protection, a downstream language executor may return target-language wording only through a structured transformation result that preserves stable item identity and exposes the protected relation/scope/attribution/epistemic identities required by the input contract.

Model self-attestation is not validation.

For the current CQ-05 vertical slice, the canonical safe implementation direction is **application-controlled protected realization**:

- the provider may transform open descriptive material within the bounded item;
- transformation-sensitive semantic atoms must be materialised through application-controlled, language-specific realization choices keyed by the already-authorised protection identity, or through another equivalently deterministic constrained mechanism;
- the provider is not authorised to invent or relabel the protected identity;
- the final item must remain reconstructably linked to the same authorised input/provenance.

This allows the application to deterministically reject a structured output that requests a different protected relation/scope/attribution/state. It also prevents a model declaration such as “meaning preserved” from serving as proof.

The implementation must additionally ensure that free generated remainder cannot independently restate or contradict a protected dimension. If that cannot be bounded for an item, that item is `insufficiently_established` for automatic transformation and must fail closed.

### Validator authority and limitation

PD-064 authorises a downstream validator to establish only:

**“the transformation preserved all canonical protected dimensions and structural invariants for this item.”**

It does not authorise the stronger claim:

**“two arbitrary natural-language texts are perfectly semantically equivalent.”**

A compliant validator may deterministically check, as applicable:

- stable item identity/count;
- structural/provenance identity;
- unchanged protection identities;
- use of authorised application-controlled realization for protected semantic atoms;
- no unexpected protected claim item;
- no omitted protected item;
- Candidate Application Content Model immutability;
- Professional Identity immutability;
- no language-proficiency creation.

Lexical blacklists may be adversarial test aids but are not semantic authority and cannot be the production proof boundary.

### Unknown / insufficient protection and fail-closed rule

`insufficiently_established` is a first-class transformation state.

If safe transformation of an item would require a protection not reconstructably established upstream, downstream implementation must not infer permission from missing metadata. It must preserve attributable source wording where appropriate, exclude the item from automatic transformation and request bounded Candidate review, or fail the requested artifact materialisation.

A mixed-language artifact must not be represented/exported as a successfully completed target-language artifact merely because static labels were localised.

### Legacy and open professional meaning

Historical/open descriptive material created before PD-064 is not retroactively reinterpreted. Existing protections may be reconstructed only from canonical structured authority already present.

PD-057 remains fully compatible: open source-grounded Episode Meaning can remain open descriptive professional meaning while only selected transformation-sensitive distinctions carry Semantic Protection. IMAGO does not close the vocabulary of professional experience to make translation easier.

Legacy/open material for which required protection is not reconstructable is `insufficiently_established` for arbitrary generative language transformation and follows the fail-closed rule.

### CQ-05 unblocking boundary

PD-064 supplies the missing Product Authority needed for a new bounded CQ-05 implementation attempt.

The first implementation may support only the already-authorised Italian ↔ English Beta boundary and only material for which:

1. structural invariants are available;
2. required Semantic Protection is `established` or explicitly `no_additional_protection_needed`;
3. protected dimensions can be rendered through deterministic application-controlled realization or an equivalently constrained mechanism;
4. free generated wording cannot bypass/contradict those protections;
5. insufficiently protected material fails closed.

The controlled Marco scenario must be able to preserve, without Marco/manufacturing-specific rules:

- participation versus leadership/ownership;
- contribution versus ownership;
- shared versus exclusive responsibility;
- project/event result versus Candidate-exclusive causality;
- relevant existing epistemic state.

This authority does not itself implement CQ-05, a provider, translation engine, universal semantic parser or multilingual platform.

### Non-goals

PD-064 does not authorise a universal professional ontology, competency taxonomy, capability/personality/seniority/leadership inference, Candidate scoring, fit/readiness, general causal reasoning, unrestricted semantic interpretation, translation platform, provider integration, language-proficiency inference, Employer product, no-JD Role Knowledge, Account/Data/Privacy architecture or Portable Professional Identity.

## PD-065 — Bounded Professional Responsibility Scope Authority

Status: **CANONICAL / CLOSED**

### Canonical concept

IMAGO authorises **Professional Responsibility Scope** as an elementary, context-bound semantic relationship describing whether responsibility for one specific authorised professional activity, episode, responsibility, work scope, operational follow-up or project task was shared/non-exclusive, exclusive/sole, or not established.

Professional Responsibility Scope describes the bounded referent. It is not a free-standing Person characteristic and does not establish general responsibility, collaboration, leadership, capability, seniority, ownership, management, employability or accountability.

Therefore:

`responsibility scope != Person characteristic != capability != seniority != leadership != Decision Accountability != Continuing People Responsibility != result causality`.

### Allowed states

The first canonical distinction is deliberately closed and minimal:

- `shared_non_exclusive`
- `exclusive_sole`
- `unknown_not_established`

No numeric scale, low/medium/high responsibility, score, strength ordering or evaluative interpretation is authorised.

`shared_non_exclusive` is descriptive and is not weaker, lower-seniority, lower-capability or less important.

`exclusive_sole` describes only the bounded referent and does not establish capability, leadership, seniority, general ownership, people management or decision authority.

`unknown_not_established` is a legitimate canonical state. Ordinary wording such as “responsible for X” does not establish exclusivity.

### Context / referent binding

Every established Responsibility Scope must be bound to a reconstructable bounded professional referent. The scope must not be propagated from one activity, episode or responsibility to another and must never be generalised to the Person.

A valid structured representation must preserve, directly or by canonical reference:

- the bounded professional referent;
- the Responsibility Scope state;
- provenance/support;
- the authority under which the state was constructed.

The exact implementation schema remains an implementation concern and must follow existing Evidence → Observation → downstream canonical architecture.

### Evidence construction boundary

Responsibility Scope may be constructed only when the state is explicitly supported by:

- authorised source-grounded material;
- accepted acquisition/confirmation;
- or existing canonical structured authority that explicitly establishes the same bounded scope.

Raw source prose is not an Application semantic tag. Source wording must first cross an authorised source/Evidence construction boundary with provenance and bounded referent preserved.

Implementation must not use a brittle keyword rule such as `contains "shared" -> shared_non_exclusive`, nor infer scope from collaboration, participation, contribution, coordination, team membership, job title, seniority, Decision Accountability or Continuing People Responsibility.

Where source support is ambiguous, later bounded acquisition may ask whether the specific responsibility was shared, exclusive, uncertain or intentionally unanswered. Acquisition is not implemented by PD-065.

### Relationship with PD-057 Episode Meaning

PD-057 remains unchanged.

Where an authorised source-grounded professional episode explicitly establishes Responsibility Scope, Episode Meaning may preserve/reference that scope as one bounded part of the episode meaning.

Responsibility Scope is optional. Not every Episode Meaning requires it, and PD-065 does not close the vocabulary of open professional meaning or authorise general Person inference from Episode Meaning.

### Separation from Decision Accountability

`Professional Responsibility Scope != Decision Accountability`.

Decision Accountability remains the authority for bounded decision authority/accountability. A Candidate may have shared responsibility for activity X while holding exclusive decision authority for decision Y, or vice versa.

`decisionAuthority=shared` may not be reused as generic `responsibilityScope=shared_non_exclusive` outside the exact authorised decision referent.

Existing Decision Accountability authority is unchanged.

### Separation from PD-056 Continuing People Responsibility

`Professional Responsibility Scope != Continuing People Responsibility`.

PD-056 concerns recurring/continuing responsibility over other people's work. PD-065 concerns shared/exclusive scope for one bounded professional referent.

Neither is a proxy for the other. PD-056 remains unchanged.

### Separation from agency

Agency relationships such as participation, contribution, coordination, ownership and decision remain distinct from Responsibility Scope.

Where independently authorised, an episode may contain both an agency relationship and a Responsibility Scope. Neither determines the other.

In particular:

`participated != shared responsibility`

`contributed != shared responsibility`

`coordinated != shared responsibility`

`owned != exclusive responsibility`

`decided != exclusive responsibility`.

### Separation from result causality

`Responsibility Scope != result causality`.

Shared responsibility for an activity does not establish shared causal credit for an outcome. Exclusive responsibility for an activity does not establish that the Candidate caused a downstream result.

Quantified Outcome authority remains independent and unchanged.

### Representation and Application

Professional Representation may consume Responsibility Scope only after canonical construction and must preserve `shared_non_exclusive`, `exclusive_sole` or `unknown_not_established` without strengthening.

Candidate Application may consume the same established bounded meaning. Target relevance may affect selection, emphasis or ordering but cannot change the scope. A target requesting full responsibility cannot transform established shared responsibility into exclusive responsibility.

### PD-064 Semantic Protection relation

An established Responsibility Scope is eligible to supply PD-064 transformation protection for the same bounded referent.

Conceptually:

- `shared_non_exclusive` protects against materialisation as sole/full/exclusive responsibility;
- `exclusive_sole` permits exclusive wording only for that independently established referent;
- `unknown_not_established` does not permit arbitrary strengthening.

PD-064 remains unchanged. PD-065 supplies the previously missing upstream semantic distinction that PD-064 may protect.

### Controlled first vertical slice

The first required vertical slice is bounded to authorised material equivalent in meaning to:

“Responsabilità condivisa sul follow-up operativo.”

The canonical representation must be capable of preserving:

- referent: the bounded operational follow-up activity;
- Responsibility Scope: `shared_non_exclusive`;

without establishing people leadership, Decision Accountability, exclusive ownership, result causality, capability or seniority.

No Marco-, manufacturing- or literal-sentence-specific rule is authorised.

### Open professional meaning

Professional episodes may continue to contain open descriptive meaning. Responsibility Scope is one optional elementary bounded semantic distinction, used only when explicitly supported and useful.

PD-065 does not create a universal responsibility, ownership, accountability, leadership, management, team-role or capability ontology.

### Non-goals

PD-065 does not authorise responsibility scoring, general Person responsibility inference, leadership/management/capability/seniority inference, ownership taxonomy, accountability taxonomy, personality, fit/readiness, team-role taxonomy, general causal reasoning, Quantified Outcome changes, translation, Employer functionality, no-JD Role Knowledge or a multilingual artifact implementation.

### CQ-05 consequence

PD-065 closes only the shared-responsibility Product Authority gap identified by PD-064D.

It does not implement CQ-05 and does not change the independent approximately-20%-project-result case.

The authorised subsequent sequence remains separate:

1. implement bounded Responsibility Scope Evidence/Observation/semantic construction and routing under PD-065;
2. implement/verify existing Quantified Outcome acquisition/confirmation for the approximately-20% case;
3. route canonical Quantified Outcome Representation material into Candidate Application Material;
4. verify CQ-05 Safe Executor Input Readiness;
5. only then resume protected IT↔EN artifact materialisation.


## PD-066 — Candidate Application Material Presentation-Language Basis

**Status: CANONICAL / CLOSED**

**Decision:** IMAGO introduces **Candidate Application Material Presentation-Language Basis**: a bounded Application-level fact attached to one specific Candidate Application Material presentation realization. It records whether that exact realization is explicitly established as directly usable in one supported presentation language. Current Beta states are `established(it)`, `established(en)`, and `unknown`.

The basis is presentation metadata, not Candidate truth. It is not Candidate proficiency or nationality, UI/browser locale, Opportunity/JD/source language, requested artifact language, Person Knowledge, Evidence, Observation, Measurement, Professional Representation meaning, capability, communication quality, fit or readiness. It never populates proficiency or Person Knowledge.

### Establishment and provenance

An `established` basis requires an Application production boundary that explicitly knows the presentation language in which that realization was created or validated, with reconstructable material/realization provenance. Legitimate establishment includes an explicit deterministic Application realization boundary or a CQ-05 requested-language derived realization that reaches semantic validation status `VALID` while preserving stable Candidate Application Material identity. `REJECTED`, `UNSUPPORTED`, provider failure or malformed output cannot establish the requested language.

Lexical/regex/model language detection, Candidate identity/proficiency/nationality, UI/browser locale, Opportunity/JD language, package defaults, filenames and the historical fact that the Private Beta operated in Italian are not establishment authority.

Existing or persisted material with no authoritative basis resolves to `unknown`; there is no bulk Italian backfill and no hydration-time language inference. A current creation boundary that does not explicitly know its realization language also records `unknown`.

### Direct use and existing eligibility

PD-066 defines `D_L` as Candidate Application Material realizations whose Presentation-Language Basis is explicitly established as requested language `L`. Presentation-Language Basis remains separate from `sameLanguageDocumentEligibility`: direct language use requires both existing Application/document eligibility and an established basis equal to the requested language. `unknown` belongs to neither `D_it` nor `D_en`.

Requested/generated artifact language remains a separate Candidate/Application choice. Requesting EN or IT does not write that language onto existing source Candidate material. Existing `artifactLanguage` fields are not Presentation-Language Basis; a missing-to-IT document/presentation default cannot prove that Candidate professional material is Italian.

### Material identity, mixed language and derived realizations

The basis follows stable Candidate Application Material realization identity, never visible-text matching. One package may contain IT, EN and UNKNOWN realizations simultaneously; no package-level source-language classification may collapse them. Two identical visible strings with different material identities may legitimately carry different bases.

A validated CQ-05 transformation may create a derived realization in another established presentation language without changing the underlying Candidate truth, Professional Identity, Knowledge or Professional Representation. PD-066 supplies only this authority/data-contract foundation; complete CQ-05 artifact-consumption enforcement remains a separate resumed CQ-05I-R2 task.

## PD-067 — Interview Training / Professional Acquisition Boundary

**Status: CANONICAL / CLOSED**

**Decision:** An `interview_practice` answer is an **Interview Training Answer**, not a Professional Acquisition Answer. Training acceptance authorises Runtime progression only; it does not authorise Evidence acceptance. A Training Answer MUST NOT directly become Evidence, Observation, Measurement, Knowledge, Professional Identity truth or Candidate Application Material.

Interview Training may reuse the existing staged Runtime and may consume already-authorised Professional Identity / Knowledge for personalisation. Shared Runtime does not imply shared Evidence authority. The semantic intake boundary is gated by the structured canonical Product purpose, never UI wording, localized labels, question text or route-name inference. Missing or ambiguous purpose authority does not authorise an Evidence write.

Potentially useful professional information surfaced during Training remains training-session data. A future preserve/acquire interaction requires Candidate review/confirmation and must create a **new canonical Acquisition event** entering the existing acquisition → Evidence → downstream semantic path. Confirmation must never retype the Training Answer itself as Evidence. Decline/skip is legitimate and must not block Training. No second Training Evidence/Knowledge pipeline is authorised.

The first Private Beta slice guarantees mandatory semantic isolation. The current repository does not expose a sufficiently bounded Candidate-facing preserve/acquire transition that can be reused without additional integration, so no save/preserve control is exposed by PD-067. Safe Interview Training remains usable without that optional transition.

PD-067 introduces no general permission model, capability/personality/fit/readiness inference, employer disclosure, Voice Input or Beta Feedback authority change.


## PD-068 — Candidate-Facing Professional Representation Experience and Private Beta Home Simplification

**Status: CANONICAL / CLOSED**

**Decision:** IMAGO's epistemic complexity protects Professional Representation but does not define its Candidate-facing structure. Candidate-facing Representation uses progressive disclosure: **Professional Reading → Why IMAGO says this → Sources/details and material semantic limits**. Default prominence follows bounded informational value rather than internal data order; supported recurring professional meaning may precede generic chronology. The same professional meaning must not be independently restated across default sections.

Evidence presentation is bounded and traceable. Candidate-facing support uses the strongest deterministic human-readable source/context identity available and only exact source excerpts already present in authorised structured support; structured semantic support must not be presented as a fabricated quotation. Deeper provenance and semantic qualifications remain inspectable behind progressive disclosure. PD-057/058/064/065, Quantified Outcome and Decision Accountability protections remain fully authoritative; presentation may naturalise their language but may not strengthen participation, responsibility, ownership, causality, capability, fit, readiness or traits.

The Private Beta Home is a Candidate orientation surface. Purpose selection and execution are adjacent. Returning Candidates see factual continuity state and compact consent state; material management remains reachable on demand rather than permanently expanded. Workflow state may be shown, but no professional quality/completeness score is authorised. Consent authority/lifecycle is not weakened. All Candidate-facing copy remains in IT/EN localization resources and UI language remains separate from artifact language.

FB-01 feedback remains Product feedback. PD-068 does not rewrite Core/Knowledge or create Candidate truth.

## PD-069 — Grounded Descriptive Professional Relationship Authority
**Status:** CANONICAL / CLOSED

**Decision:** IMAGO authorises **Source-Grounded Descriptive Descriptors** and **Grounded Descriptive Professional Relationships** as bounded, Representation-level derived material. This authority extends PD-057 open source-grounded professional meaning and remains upstream of PD-058 informational contribution/selection. It authorises new grounded relationships between already-authorised professional materials; it does **not** authorise a new Person-level characteristic merely because such a relationship is visible.

A Source-Grounded Descriptive Descriptor states only that one identified authorised material supports one bounded description. It is source/material scoped, reconstructably grounded, descriptive, open-vocabulary and Representation-only. Minimum descriptor roles are `situation_context`, `activity`, `involved_function`, `work_phase`, `problem_object`, and `contribution_participation`. These roles identify the descriptive function of a value; descriptor values remain open and source-grounded. They are not a universal taxonomy of industries, professions, skills, competencies, project types, leadership types or capabilities.

Each accepted descriptor must preserve a stable local descriptor identity, role, bounded descriptive value, source/material identity, exact or reconstructable grounding, source support reference/span where available, canonical episode/activity identity where available, material semantic-strength constraints, provenance and extraction status. Descriptor identity means `this authorised material supports this bounded description`, never `this Person possesses this property`. A descriptor is not Evidence replacement, Person Knowledge, characteristic, competency, capability, trait, personality, strength/weakness, seniority, leadership assessment, fit/readiness or profession ontology.

Open descriptive semantics may use **bounded model-assisted proposal**. A model may propose descriptor role/value, exact supporting source span/reference and local descriptive relationships visible within the same source. Model output is not final semantic authority. Deterministic validation must establish that the referenced source/material and support belong together, the descriptor role is permitted, grounding is reconstructable, source/episode/material scope is preserved, provenance is sufficient, and participation, responsibility, ownership/decision authority and result causality have not been strengthened. Prohibited Person-level predicates fail closed. Deterministic code must not pretend to prove open semantic equivalence that it cannot establish.

A **Grounded Descriptive Professional Relationship** connects two or more accepted source-grounded descriptors/materials and remains Representation-only. It preserves contributing descriptor and source/material identities, bounded relationship wording and basis, provenance, semantic-strength boundaries and, where recurrence is claimed, independence of contributing materials. For open descriptive semantics a model may propose a bounded relationship hypothesis, but acceptance requires deterministic admissibility checks: all contributors are accepted and grounded; sources/materials are identifiable; recurrence contributors are genuinely distinct; wording does not exceed contributing meanings; agency/responsibility/causality are not strengthened; no Person capability/trait/leadership meaning is created; no unsupported same-episode identity, chronology-only professional continuity or acquisition-lineage-only professional identity is introduced; and provenance remains reconstructable. Failure of any required condition fails closed.

PD-069 does not require universal normalisation. Distinct source-grounded expressions such as start-up, ramp-up and stabilisation may remain distinct underneath a bounded relationship; neither model proposal nor lexical/embedding similarity establishes that they are universally equivalent. A relationship may describe recurrence or bounded connection among documented situations, contexts, activities, phases, functions, problem types or contribution forms without converting repeated occurrence into a stable Person capability, trait, preference, identity, seniority, leadership or strength.

Accepted grounded descriptive relationships may feed the existing Representation path: `Grounded Descriptive Relationship -> Professional Meaning -> Professional Thread -> PD-058 informational contribution / non-redundant selection -> Candidate-facing Professional Reading -> progressive support/provenance`. Candidate-facing wording expresses the professional connection, not extraction mechanics. PD-058 remains the authority for bounded Representation-relative informational contribution and selection; PD-069 creates no importance, prestige, Candidate, fit or readiness score.

Descriptors and grounded relationships do not automatically enter Person Knowledge. `descriptor -> Knowledge characteristic` and `relationship -> Knowledge characteristic` require separate semantic authority and are not authorised here. Candidate confirmation is not required merely to derive a faithful Representation-only descriptor from already-authorised material. Normal canonical acquisition/confirmation is required when a proposed meaning would add a fact not established by authorised source material, unresolved ambiguity requires new Candidate information, or a future authority requires confirmation before canonical Knowledge entry.

PD-069 explicitly prohibits capability/competency/trait/personality/leadership/seniority/fit/readiness/employability inference; Candidate scoring; prestige/importance ranking; strength/weakness classification; universal professional ontology; lexical equality, embedding similarity or unchecked LLM similarity as final semantic authority; project/organisation name as episode identity; chronology alone as professional continuity; Runtime/acquisition lineage as professional episode identity; `participated -> contributed -> coordinated -> owned` strengthening; shared-to-exclusive responsibility strengthening; project-result-to-Candidate-caused-result strengthening; target desirability as target-independent truth; and automatic Person Knowledge write-back.

The Target-Relative Conditional Knowledge Gap concept remains explicitly outside PD-069. A target may determine what is worth asking, never what is true about the Candidate. PD-069 preserves PD-057 through PD-068C and authorises no Evidence / Observation / Measurement / Knowledge Core redesign.

**Next authorised scope:** one bounded technical vertical slice may implement source-grounded descriptor proposal, deterministic descriptor validation, bounded relationship hypothesis/admissibility, Representation-only relationship materialisation, integration into Professional Meaning / Professional Threads and PD-058 selection, with reconstructable provenance and fail-closed semantic-strength protection. It must not implement Person Knowledge promotion, target-relative conditional acquisition or a universal professional ontology.

## PD-070 — Higher-Order Descriptive Professional Structure Authority

**Status:** CANONICAL / CLOSED

**Decision:** IMAGO authorises a **Higher-Order Descriptive Professional Structure** as a derived, Representation-only, nonpersistent semantic object jointly supported by multiple independently grounded and already-authorised professional Representation contributors. Its subject is documented professional material, situations, episodes, activities or configurations represented by those contributors; it is not a stable property of the Person. Canonical rule: richer synthesis does not authorise a stronger Person claim.

A Higher-Order Structure may consume only already-authorised Representation material: accepted Grounded Descriptive Professional Relationships and Source-Grounded Descriptive Descriptors, Source-Grounded Professional Episode Meaning, already-authorised supported Patterns, bounded canonical Knowledge meaning whose semantic protection permits Representation use, explicit bounded responsibility scope, Decision Accountability, Quantified Outcome, Continuing People Responsibility within their existing authorities, and PD-058 informational units/contribution relations. Professional Thread is downstream carrier, not semantic truth authority. Raw source prose may support reconstructable provenance/explanation but must not become an uncontrolled second extraction path. A fact absent from authorised contributors cannot be introduced by composition.

The canonical object preserves stable local structure identity, contributor references/types, reconstructable material/source references, bounded structure wording, structured `claimShape`, `compositionBasis`, `independenceBasis`, provenance, inherited semantic ceilings/protection boundary, validation/admissibility state, `persistent = false`, and `personPropertyAssertion = none`. Open descriptive meaning remains open vocabulary; PD-070 creates no universal professional ontology.

Within contributor authority, a structure may describe bounded recurrence or combination across documented situation/context types, work phases, problem/object configurations, involved functions, bounded sequences, forms of participation/contribution, and authorised relations among situations, actors/functions, actions and outcomes. It may describe source-grounded differences/changes across situations only when these do not become Person trajectory claims.

PD-070 explicitly prohibits the structure from establishing or strengthening capability, competency, trait, personality, strength/weakness, leadership, seniority, general ownership/responsibility, decision autonomy beyond bounded Decision Accountability, result causality beyond existing authority, professional/career identity, professional continuity or trajectory from chronology, preference, motivation, potential, fit, readiness, employability, prestige, target suitability, Career Direction or Person Knowledge. No Candidate score/ranking or Person Knowledge write-back is authorised.

Higher-order recurrence requires reconstructable independence: at least two authorised contributors and at least two independently grounded professional material/episode bases for contributors used to establish recurrence. Repeated representations of one episode, duplicate wording, source count, project/organisation name, chronology, Runtime/acquisition lineage or lexical similarity cannot manufacture recurrence, episode identity, continuity or semantic equivalence. Multiple contributors from one episode may support non-recurrence explanation but cannot be counted as independent recurrence evidence.

Composition preserves the weakest relevant semantic boundary of its contributors. Participation cannot become ownership; shared responsibility cannot become exclusive responsibility; coordination cannot become leadership; bounded Decision Accountability cannot become general decision autonomy; project result cannot become Candidate-caused achievement; recurrence of documented situations cannot become stable Person capability. Unknown remains unknown. Multiplicity is not semantic-strengthening authority.

A distinct bounded second-order model-assisted proposal layer is authorised. The model may propose contributor grouping, bounded structure wording, contributor references, `compositionBasis` and structured `claimShape`. The model is proposal-only: it cannot manufacture contributor identity/source facts, establish independence by itself, define semantic ceilings, convert plausibility into truth, create Person properties or write Knowledge. This second-order boundary remains distinct from PD-069 first-order relationship proposal and must not collapse into one opaque general-purpose model call.

Deterministic validation remains acceptance authority and verifies contributor existence/acceptance, unambiguous identity, reconstructable provenance, minimum contributor count, recurrence independence where claimed, no duplicate/same-episode inflation, claimShape within inherited semantic ceilings, no agency/responsibility/ownership/decision-authority/causality strengthening, `personPropertyAssertion = none`, target-independent input, nonpersistence and reconstructable contributor refs. It must not pretend to prove arbitrary open semantic equivalence; lexical blacklists, embeddings and provider/model self-attestation are not semantic acceptance authority. Wording and claimShape are proposed together; wording exceeding contributors/compositionBasis/claimShape/ceilings fails closed and is not silently rewritten.

Accepted flow is `Higher-Order Descriptive Professional Structure -> Professional Meaning -> Professional Thread -> PD-058 informational contribution/nonredundant selection -> Candidate-facing Professional Reading`. PD-058 remains downstream selection authority. A small first-reading budget such as 2–3 dense structures is a composition budget, not Candidate ranking. First-order relationships subsumed by a selected higher-order structure should normally remain available as support/progressive provenance rather than duplicate equivalent Level-1 readings.

**Interesting Unknown is explicitly outside PD-070.** `professionalMeaning.insufficientObservability` is not authorised to mean a small unresolved distinction worth asking about and must not be assigned that meaning retroactively. A future bounded Product Authority must separately authorise any `higher-order structure -> unresolved distinction -> optional Candidate acquisition value` path. Until then unknown is not absent, but Representation synthesis cannot decide autonomously that an unknown deserves acquisition.

PD-070 is target-independent. JD, Opportunity, Career Preference, Career Direction desirability, adjacent-role suggestion and fit/readiness are not composition authority. Future Career Direction may consume accepted target-independent structures only through separately authorised purpose-relative relevance; target desirability must never become Person truth.

Higher-Order Descriptive Professional Structure is recomputable derived Representation state with default `persistent = false`; caching, if ever introduced, does not make it Person Knowledge. Ambiguous contributor authority, unestablished recurrence independence, semantic strengthening, missing required facts, wording beyond claimShape/compositionBasis, Person-level meaning or target desirability entering synthesis all fail closed. `No structure safely established` is a valid result.

**Next authorised scope:** one bounded technical vertical slice may implement the distinct second-order proposal contract, deterministic contributor/independence/semantic-strength validation, Representation-only structure materialisation, Professional Meaning / Professional Thread integration and downstream PD-058 nonredundant selection. Interesting Unknown, Person Knowledge promotion, target-relative reasoning and universal ontology remain outside scope.

## PD-072A — Target-Relative Confirmed Absence Authority
**Status:** CANONICAL / AUTHORITY DEFINED; MINIMAL NEGATIVE-KNOWLEDGE VERTICAL SLICE REQUIRED

**Decision:** IMAGO authorises `TARGET_RELATIVE_CONFIRMED_ABSENCE` only as a recomputable, target-relative derived state whose positive basis is canonical Person Knowledge that itself explicitly represents bounded non-presence under an absence-capable semantic authority. Missing Evidence, missing CV wording, insufficient observation, an unresolved Career Direction condition, preference, Training material, model inference or absence of matching Representation material can never establish this state. `not observed != absent` remains invariant.

The derived state must preserve `requirementRef`, `requirementClass`, target/Career-Direction ref, compatible absence scope, temporal/contextual scope where material, supporting Knowledge refs and reconstructable Evidence lineage, semantic authority ref, limitations, current status and recomputation provenance. It is not generic negative Person Knowledge and must never become capability deficiency, weakness, inability, fit/readiness judgment, leadership deficiency or a global professional gap.

Eligibility requires an exact scope-compatible chain: authorised absence-capable Person Knowledge positively establishes non-presence; the target requirement asks for the same bounded semantic class and a scope no broader than the established absence; and the current Knowledge/provenance remains valid. Episode-, role- or context-only non-responsibility cannot satisfy a career-wide requirement. Later superseding/corrective Knowledge invalidates or recomputes the derived state; no permanent negative label attaches to the Person.

An explicit Candidate denial is Evidence candidate only. It must enter the canonical Acquisition -> Evidence -> authorised absence-capable Observation/Measurement/Knowledge path before target-relative confirmed absence can be derived. Career Direction may motivate acquisition but may not write Person Knowledge directly.

Requirement classes are classified by available semantic authority: (A) absence-capable now only where canonical Person Knowledge already carries authorised bounded non-presence; (B) clarification-capable but not absence-capable where acquisition/questioning exists but the Knowledge path cannot persist bounded non-presence; (C) not yet acquisition-authorised where no semantic acquisition authority exists. The complete Career Direction map must tolerate all three and preserve NEEDS_CLARIFICATION whenever absence cannot be proven.

Repository review establishes that PD-056 `continuing_people_responsibility` contains an authorised semantic primitive `contextual_non_responsibility`, but the current vertical slice deliberately materialises that Observation as `insufficient`, produces no Measurement/KnowledgeSnapshot for it, and therefore does not yet provide absence-capable Person Knowledge. It is class B today, not class A. No other generic negative Person Knowledge authority is created by PD-072A.

A target-relative confirmed absence may later authorise a bounded bridge opportunity tied to the same requirement and absence scope. It does not prove capability deficiency or future readiness. Learning/course bridges are appropriate only where learning can reasonably address the requirement; experiential responsibility should prefer project/exposure/responsibility bridges. No bridge is authorised from unknown/insufficient observation alone.

**Next authorised technical scope:** one minimal negative-Knowledge vertical slice may extend the already-authorised PD-056 continuing-people-responsibility semantic path so an explicit, Evidence-grounded `contextual_non_responsibility` can survive as bounded non-presence Knowledge with context/time/provenance and correction semantics. It must not globalise absence or alter positive people-responsibility semantics. Only after that slice may Career Direction derive `TARGET_RELATIVE_CONFIRMED_ABSENCE` for scope-compatible formal-people-responsibility requirements.

## PD-072D — Bounded Formal People Responsibility Target Requirement Authority (2026-09-25)

Status: **AUTHORITY COMPLETE — BOUNDED CURATED VERTICAL SLICE**.

PD-072D introduces one target-side structured distinction only for the current curated Career Direction people-responsibility requirements. It does not classify Candidate evidence and does not create fit, readiness, gap, confirmed absence, bridge recommendations, or a generic role-requirement ontology.

Canonical bounded requirement class:

- `formal_continuing_people_responsibility`

Required structured semantics for this class:

- `roleRequirementSemanticKey = people_responsibility`;
- `responsibilityFormality = formal`;
- `continuityRequirement = continuing`;
- bounded `responsibilityScope`;
- explicit `authorityRef`;
- explicit curated `sourceBasisRefs` and existing requirement source provenance.

Safety rule: a requirement not explicitly curated under this authority remains `unspecified`; neither free-text wording, lexical similarity, embeddings nor model inference may promote it to formal people responsibility at runtime. `unspecified != formal`.

The authority is currently limited to the source-grounded people-responsibility requirements in the curated Operations Manager and Industrial Production Manager Career Direction fixtures. Generic/informal operational coordination remains a distinct requirement meaning and must not be collapsed with formal reporting/line responsibility.

This structure exists to allow a later PD-072C consumer to compare structured target requirement semantics with structured Person Knowledge. It does not itself derive target-relative confirmed absence.

## PD-072C Completion — first bounded target-relative confirmed absence consumer
Status: Human-review pending; implementation verified.

For the bounded `continuing_people_responsibility` vertical slice, Career Direction may derive `TARGET_RELATIVE_CONFIRMED_ABSENCE` only when all of the following are structurally established: canonical PD-072B bounded non-presence Knowledge, PD-072D `formal_continuing_people_responsibility` target authority, formal responsibility compatibility, continuing/current temporal compatibility, and role-scope compatibility. Any unresolved condition fails closed to unresolved / clarification-required.

The state is target-relative and derived; it is not generic Person Knowledge and must not imply leadership deficiency, capability, fit, readiness, suitability, or career-wide absence. Supported informal operational coordination and bounded non-presence of formal reporting responsibility may coexist as different meanings. `bridgeEligible` may be exposed for a valid derived state, but bridge recommendations remain outside PD-072C.

## PD-072E — Candidate-facing Career Direction support-map composition
Status: implementation verified; Human Test pending.

Career Direction Candidate composition is hierarchical rather than an evidence dump. Level 1 presents concise direction overviews without ranking; Level 2 presents the selected/expanded direction through bounded support states. `WELL_SUPPORTED` renders as `Già ben supportato`; unresolved relevant requirements render as `Da chiarire`; `TARGET_RELATIVE_CONFIRMED_ABSENCE` alone may render as `Da costruire`. `PARTIALLY_SUPPORTED` must not be fabricated and remains absent until deterministic bounded authority exists.

Preferences remain separate Candidate-controlled exploration context and never increase/decrease professional support. Detailed Candidate/O*NET/BLS grounding remains available in secondary `Fonti e dettagli`. A valid formal-people-responsibility confirmed absence may expose an optional experiential-first bridge, but the bridge is target-relative and is not evidence of readiness or capability. Unknown and missing support never authorize a bridge.

## PD-072F — Career Direction Candidate Actionability Completion

Status: **IMPLEMENTED / READY FOR FINAL HUMAN ACCEPTANCE**

PD-072F preserves the approved PD-072 semantic architecture and corrects only Candidate-facing composition after the PD-072E Human Test.

- Overview state summaries are derived from structured state counts and keep `NEEDS_CLARIFICATION` distinct from `TARGET_RELATIVE_CONFIRMED_ABSENCE`; clarification never receives development/`Da costruire` wording.
- Bounded known unresolved requirement reasons are rendered as localized Candidate questions without changing their semantic authority. Unknown mappings retain the repository-safe fallback rather than inferring wording.
- `Approfondisci` remains available only on the existing authorized people-responsibility acquisition route. Candidate questions for other unresolved requirements are informational only.
- `Prossimi passi` are composed deterministically from the actual unresolved requirement reasons plus an authorized bridge only when confirmed absence is bridge-eligible, followed by bounded reassessment. No development action is invented from unknown state.
- Overview and detail use distinct localized rationale surfaces to avoid mechanical duplication while preserving the same semantic basis.
- Preferences, traceability, canonical Acquisition, PD-072A/B/C/D authority and Professional Representation remain unchanged.


## PD-072G — Career Direction Visual Hierarchy and Detail Rendering
Presentation-only authority: Career Direction must expose clear non-evaluative visual hierarchy without changing support-state semantics. Traceability remains secondary/collapsed. Renderer must not emit phantom bullets or reserve detail space for empty data; valid grounding remains visible.


## PD-073 — Career Direction Clarification Acquisition Runtime Completion (2026-09-28)
- Bounded Beta corrective after PD-072G Human Acceptance.
- First failing boundary: Groq strict structured-output rejection before a continuing-people-responsibility semantic candidate can enter canonical validation.
- Career Direction already routes `people_responsibility_scope_probe` through Knowledge Acquisition Execution and accepted Runtime Evidence; no parallel Career Direction Knowledge path is introduced.
- On `structured_output_rejected`, the CPR production semantic executor now performs one bounded `json_object` recovery call, then applies the same application validators, exact Evidence grounding/repair and canonical Observation → Measurement → Knowledge path.
- Non-structured provider failures remain fail-closed operational failures. Semantic insufficiency, number-only answers and coordination-only answers do not create unsupported Knowledge.
- PD-072D formal target-requirement semantics remain unchanged: operational responsibility is not promoted to formal line management.


## PD-073 First Corrective Product Status — Live Career Direction Clarification Diagnostic Completion (2026-09-28)

- Human Test remains not accepted for live answer interpretation; the current execution environment has no `GROQ_API_KEY`, so the exact live provider failure cannot be replayed or safely classified here.
- Pre-question latency root cause identified: production start performed provider-backed semantic reuse over `professionalSources` before rendering the already-deterministic clarification question.
- Corrective: question preparation remains canonical (Intent → Acquisition design/plan/runtime/execution) but performs no provider call before Candidate answer submission. Controlled timing regression: provider calls before question = 0; local deterministic preparation < 1 s.
- Provider/operator diagnostics now preserve bounded provider status/type/code/model/output mode/structured-output/timing information and whether the PD-073 recovery was entered when a provider error reaches the canonical production path.
- Retry UI now groups the current clarification question, technical-failure message, answer control and stop control in one visible context.
- No CPR/PD-072 semantic authority was broadened. Provider failures remain fail-closed.
- Full `fringe_health_check.js`: PASS.
- Remaining bounded blocker: rerun the real answer with live Groq credentials and capture the newly preserved diagnostic before any further recovery change.


## PD-073 Second Corrective — Career Direction Acquisition Operator Diagnostic Exposure

- Scope: observability only; CPR semantics, provider recovery, grounding, canonical Knowledge and Career Direction recomputation unchanged.
- Prior gap: `directionAcquisition.operationalFailure` was retained internally but was absent from both `/private-beta/operator/semantic-trace` and operator console output.
- When operator diagnostics are enabled, Career Direction acquisition failures are now projected as a sanitized `career_direction_people_responsibility_acquisition` trace and emitted once to the operator console.
- Safe projection includes stage/status/category/reason, bounded provider diagnostic fields, PD-073 recovery metadata, and semantic/provider category; Candidate answer, prompts, raw provider response, Evidence content and secrets are excluded.
- Existing FHT semantic trace records remain compatible and share the existing endpoint.
- Focused regression and full health check: PASS.


## PD-073 Third Corrective — CPR live candidate rejection diagnostic completion (2026-09-28)
- Scope is observability-only. CPR schema/prompt/authority, provider recovery, grounding and canonical Evidence → Knowledge behavior are unchanged.
- `candidate_rejected` operator diagnostics now expose the executor-owned bounded `validationErrors` plus a whitelisted structural candidate shape; professional context, event-time text, support excerpts, Evidence text, raw provider output and prompts are excluded.
- Successful provider-call metadata already available before validation (model, output mode, structured-output flag, elapsed time and HTTP attempts) is propagated without an additional provider call.
- Provider transport and structured-output failures remain distinct from semantic candidate rejection; diagnostics remain gated by operator mode.
- Focused regression and full health check: PASS.

## PD-073 Fourth Corrective — CPR semantic candidate grounding alignment (2026-09-28)

- Live evidence established a schema-valid CPR candidate could populate `professionalContext.description` while leaving `support.professionalContext=null`; the existing validator correctly rejected it.
- Root cause: the strict JSON schema can represent that internally inconsistent pair, while the semantic validator correctly enforces the conditional Evidence-support dependency. The prompt's generic grounding instruction was strengthened to state the professional-context dependency explicitly.
- A candidate rejected **only** for existing `... requires Evidence support.` errors may now enter the already-authorized application-owned exact Evidence grounding repair before final rejection.
- The repair uses the same accepted Evidence, may only materialize exact Evidence support, and is followed by the full unchanged semantic validator plus verbatim-support gate. Any structural/semantic validation error outside grounding remains immediately fail-closed.
- No generic semantic retry loop was added; no CPR semantic authority, schema enum, Observation, Measurement, Knowledge, Career Direction state or provider structured-output recovery was weakened.

## PD-073 Fifth Corrective — CPR Canonical Knowledge Production Completion
**Status:** IMPLEMENTED / HUMAN TEST PENDING
**Decision:** The live `measurement_insufficient` boundary was traced to an authorised CPR Observation whose otherwise supported continuing people-work semantics carried `responsibilityMode=insufficient`. PD-056 already authorises `informal_operational` for bounded recurring/continuing operational responsibility over people-work and already requires mode observability before positive Knowledge. The production extractor is therefore aligned to classify `informal_operational` only when Evidence explicitly establishes recurring/continuing people-work responsibility through concrete operational responsibility such as work assignment or priority setting while formal reporting authority remains unestablished. Generic coordination/collaboration/project leadership remains insufficient; `formal_line` remains outside this bounded production adapter. The canonical validator and Measurement gate are unchanged. Canonical failure diagnostics now expose the bounded Observation/Measurement state and insufficiency reason operator-safely.


## PD-074 — Career Direction Candidate-Controlled Clarification Queue and Shared-State Composition

- Career Direction unresolved conditions may be projected into a recomputable Candidate-facing clarification queue; the queue is not Person Knowledge and creates no semantic authority.
- Actionability is derived from existing structured authority. In the current bounded slice, only `people_responsibility_scope` maps to the authorised `people_responsibility_scope_probe`; production planning and broader resource/budget conditions remain informational-only.
- Queue deduplication uses structured condition/semantic/action identity, never wording similarity. A shared unresolved need appears once with all affected direction labels.
- Resolved conditions disappear after canonical Knowledge and normal Career Direction recomputation. One Candidate answer still runs one canonical Acquisition at a time.
- Shared professional support may be composed once above direction cards while direction details retain direction-specific unresolved requirements and secondary grounding/traceability.


## PD-074 First Corrective — Resolved Clarification Projection Alignment

- Career Direction Candidate-facing projection MUST recompute current people-responsibility condition resolution from persisted canonical Person Knowledge, rather than relying only on transient Acquisition resolutions.
- `resolved_by_current_authorised_state` and `target_relative_confirmed_absence` are excluded structurally from clarification queue, unresolved counts, `Da chiarire`, and unresolved next steps.
- The existing stale/direct Acquisition route guard remains defensive fallback protection.
- No PD-072/PD-073 semantic authority or acquisition behavior changes.


## PD-074 Second Corrective — current resolution state rehydration alignment (2026-09-29)

Repository-first diagnosis identified the restart-only stale boundary in `matrixFromReusableDirectionKnowledge()`: persisted `reusableKnowledgeResults` are canonicalized by `knowledgeRef`, while the Career Direction rehydration path selected `items.at(-1)` as if array position meant recency. The same-request Acquisition guard instead used the newly produced `personKnowledgeMatrix`, so guard and rehydrated page could disagree.

Career Direction CPR rehydration now selects the current persisted canonical CPR Knowledge result by canonical Knowledge timestamp (`knowledgeSnapshot.metadata.createdAt`, with existing ledger/event timestamps as bounded fallbacks) and deterministic ref tie-break, never by persistence-array position. Representation snapshots remain presentation/representation state and do not override newer Person Knowledge. No PD-056/PD-072/PD-073 semantic authority changed.

A restart/rehydration regression serializes persisted continuity, discards transient Acquisition resolutions, includes a lexically-later stale CPR snapshot plus newer PD-073 Knowledge, and proves page resolution and defensive Acquisition guard both resolve from the same current canonical Knowledge.

### PD-074 Third Corrective — Initial current-resolution projection
Career Direction unresolved presentation must always be based on current canonical persisted Person Knowledge plus the current Career Direction evaluation, including the first `professional_direction_explore` render. Initial preparation and later direction outcomes share `projectCurrentCareerDirectionState(...)`; no Candidate-facing route may omit current structured resolution state. This projection is not persisted as professional truth. Visual/information-hierarchy redesign remains deferred until state consistency is Human Accepted.

## PD-075 — Career Direction information hierarchy and Candidate action surface completion

Career Direction now uses progressive disclosure as a Candidate-facing presentation rule. The first view prioritizes orientation, shared support when present, remaining clarifications/actionability, and compact direction summaries. Direction detail is opt-in; grounding and traceability remain secondary/collapsed. Unresolved clarification and generic next-step copy must not be mechanically duplicated when they carry the same Candidate value. Structurally empty traceability artifacts must not render. This decision changes presentation only and does not alter Career Direction evaluation, Person Knowledge, acquisition authority, confirmed absence, preferences, or target requirements.


## PD-076 — Career Direction overview/detail UX pattern (2026-09-29)

PD-076 is Candidate-facing UX/information architecture only. Career Direction now uses a two-level navigation pattern: overview cards first, then an explicit selected-direction detail state with persistent sibling direction navigation and collapsed secondary grounding. Selected direction is application/UI navigation state only and is not Person Knowledge.

Bounded role descriptions are composed deterministically from existing target-side role requirement statements; Candidate-specific reasoning remains separate. No Career Direction semantics, resolution state, acquisition authority, target requirements, Person Knowledge, or PD-073 behavior changed.

The pattern is intentionally reusable later as: overview → primary choice → selected detail → primary state/action → secondary collapsible grounding. No other IMAGO surface is migrated by PD-076.

## PD-077 — Career Direction Candidate hierarchy and semantic visual token foundation
- Career Direction overview begins with the identified directions; shared support and the global clarification block no longer precede the primary choices.
- Clarification queue semantics remain structured, but Candidate-facing unresolved presentation is contextualized inside the selected direction detail; acquisition action appears only when the existing queue marks that condition actionable for that direction.
- Role description is separated from Candidate reasoning and uses only bounded target-side activity/responsibility requirement semantics; candidate-experience-style requirements are excluded from the neutral mini role description.
- Supported / clarify / confirmed-gap states use reusable expandable semantic rows; expanded state receives a visibly nested surface, not icon-only signaling.
- Career Direction establishes centralized semantic CSS visual tokens for page/surfaces, navigation active/inactive state, supported/clarify/build state, information, grounding, borders and text roles. Future surfaces should reuse these roles rather than create local equivalents.
- Career Preference Context remains separate from Knowledge and is presented as a secondary contextual control; its update/re-evaluation behavior is unchanged.
- Existing deterministic material does not always authorize a new 3–5 line synthesized narrative; PD-077 preserves the grounded authorised direction rationale rather than inventing richer prose.

## PD-079 — Career Direction Rich Requirement Support Integration and Documented Support Robustness Authority

Career Direction may carry a target-relative, derived and recomputable requirement-support relation from already-authorised Person-side professional structures. The relation is not Person Knowledge and does not establish fit, readiness, capability strength or employability.

PD-079 admits existing supported Patterns and bounded Knowledge through the established Career Direction mapping policy and adds bounded proposal/acceptance support for accepted PD-069 Grounded Descriptive Professional Relationships and PD-070 Higher-Order Descriptive Professional Structures. Because PD-069/PD-070 are intentionally target-independent, target relevance is proposal-only where no explicit semantic key exists; deterministic application validation must resolve exact contributor and target identities, preserve provenance, enforce the Person-side semantic ceiling, prohibit provider self-authorisation and fail closed when target strength exceeds the contributor authority. Lexical/fuzzy similarity is not authority.

The first bounded rich mapping authority is cross-functional coordination. PD-069/PD-070 support is accepted only when reconstructable accepted descriptor lineage establishes coordinated activity/involved-function agency; participated/contributed-only material is insufficient. Other target requirements remain fail-closed until separately authorised.

Documented support robustness describes only the structure of the requirement-specific documented basis: `SINGLE_GROUNDED_BASIS`, `INDEPENDENT_RECURRENT_BASIS`, or `COMPOSED_HIGHER_ORDER_BASIS`. Recurrence requires existing independent professional-basis/episode authority; raw mention/source/file counts do not upgrade robustness. PD-070 composed support requires its accepted independent `professionalBasisRefs`. Duration/formal role is factual context only and never a generic robustness multiplier.

Target requirement priority (O*NET Importance/Level, ESCO essential/optional, or derived Candidate-facing priority) remains explicitly outside PD-079.

## PD-079L — Live Career Direction Rich Requirement Support Proposal Integration

Career Direction production may make one bounded batch proposal call per evaluation over accepted PD-069/PD-070 contributors and explicit atomic target requirements. Provider output is proposal-only and must pass unchanged PD-079 deterministic acceptance. Empty output and provider failure are valid degraded outcomes and preserve pre-existing deterministic Career Direction support. Proposal reuse is derived/recomputable application state keyed by the structured contributor + requirement input; it is not Person Knowledge. Preference-only re-evaluation reuses the current proposal set when Representation and target requirements are unchanged. No new target semantic key mapping authority is introduced.


## PD-080 — Target Requirement Priority Authority / O*NET Descriptor Integration (2026-09-30)

- Target requirement priority is TARGET ROLE KNOWLEDGE and remains distinct from Candidate support state and PD-079 documented-support robustness.
- Private Beta authority is a curated O*NET task-descriptor slice only: exact O*NET-SOC occupation identity + exact Task ID + source-native Task Type (Core/Supplemental) + raw Importance when available.
- O*NET Level is a distinct rating concept and must never be inferred from Importance; the current curated task slice does not fabricate Level where the selected task authority does not provide it.
- Occupation code or proposition prose alone is insufficient. Requirement-to-descriptor mapping is explicit and reconstructable; wrong occupation, unknown descriptor, or prose-only similarity fails closed.
- Multi-descriptor requirements preserve descriptor-level native ratings. PD-080 authorises no averaging, maximum-selection, weighted aggregation, or CENTRAL/RELEVANT/COMPLEMENTARY normalization.
- ESCO essential/optional is a legitimate future source-native authority but is not forced into the current Beta fixtures because no sufficiently reconstructable exact ESCO occupation-skill mapping is established here.
- Current role requirement semantics, Career Direction supported/clarify/confirmed-absence states, PD-079 robustness, PD-079L proposal behavior, Acquisition, and Candidate UI are unchanged.
- The structured priority records intentionally preserve occupation/descriptor identity and source-native priority semantics for later PD-081 sustained-role-exposure reasoning; PD-080 does not perform temporal inference.


## PD-081 — Sustained Role Exposure / Temporal Requirement Support Authority

PD-081 adds a derived chronology and target-relative temporal-depth authority. Exact/month-precise role dates are deterministically converted to duration; vague chronology fails closed. The initial bounded sustained threshold is 12 months. For exact PD-080 O*NET Core requirements, sustained formal-role occupancy may establish contextual role support, but it does not establish requirement-specific execution, competence, performance, employer approval, fit or readiness. `SUSTAINED_REQUIREMENT_SUPPORT` additionally requires an existing PD-079 requirement-specific support relation explicitly linked to that role exposure. Cross-role sustained recurrence requires at least two independent role refs with direct requirement support. PD-079 structural robustness remains a separate dimension. The current Professional Representation roleHistory does not yet carry sufficiently precise role dates in the Marco Beta fixture; therefore no temporal depth is fabricated for that current fixture until structured chronology is available.

## PD-081L — Live Role Chronology Integration

- Source-grounded role chronology may be carried into Professional Representation only when an explicit date range is present in the authorised professional source and is attached to the same source-bounded formal-role identity.
- Generic experience duration such as "circa 12 anni" is not role chronology authority and must not be assigned to a formal role.
- Month/year ranges preserve month precision. Year-only ranges preserve year precision and are represented conservatively through minimum/maximum possible duration; no month/day is fabricated.
- The PD-081 12-month sustained threshold is satisfied for year-only chronology only when the minimum possible duration is at least 12 months.
- Compatible duplicate chronology may combine provenance; conflicting chronology fails closed. Similar titles, same employer, or overlapping dates do not merge role identities.
- Chronology is persisted inside the Professional Representation snapshot and remains derived factual chronology, not Person Knowledge or competency evidence.

## PD-082 — Candidate-facing Career Direction Requirement Map Composition

- Selected-direction detail is requirement-centric: one atomic target requirement appears once as the primary row.
- Target priority (PD-080), Candidate support state, structural robustness (PD-079), and temporal depth (PD-081) remain visibly separate axes; no aggregate score is authorised.
- O*NET source-native Core/Supplemental and raw Importance are rendered without averaging multi-descriptor requirements.
- Contextual sustained-role support is informational and must not visually equal direct supported evidence. Missing chronology is omitted/neutral, never a gap.
- Internal robustness/temporal enum identifiers are localized into bounded Candidate language.
- The selected-direction hierarchy is: navigation → role → neutral description → one grounded why synthesis → Requirement Map → secondary grounding. Redundant supported/unresolved prose sections are replaced by expandable requirement rows.


## PD-083 — Canonical Visual Design System
Candidate-facing visual design authority is `docs/20-product/IMAGO_VISUAL_DESIGN_SYSTEM.md`. Future UI work must use the canonical semantic token layer and must not invent page-local semantic colors, typography, radii, spacing, borders or elevation where a token exists. PD-082 Career Direction is the reference surface; older surfaces migrate when touched. Visual states express information state, not Candidate judgement.

## PD-085 — Opportunity-Specific Rich Requirement Support Authority and Application Professional Intelligence Integration

**Status:** CANONICAL / CLOSED

Application target authority is the Candidate-supplied concrete JD. PD-085 introduces `OpportunityRequirementSupportRelation`, a target-relative, opportunity-specific, derived and recomputable relation that must never be persisted as Person Knowledge. It preserves exact opportunity/JD requirement identity and class, contributor type/ref, professional/material/source lineage, semantic ceiling/protections, relation basis, acceptance state and provenance.

Admissible Person-side contributors are already-authorised bounded canonical Knowledge meanings, supported Patterns, source-grounded Episode Meanings, accepted PD-069 Grounded Descriptive Professional Relationships, accepted PD-070 Higher-Order Descriptive Professional Structures and quantified outcomes already represented through canonical Knowledge. Career Direction support relations are not semantic authority for Application.

Open JD relevance may be proposed by a bounded model-assisted proposal layer. Provider output is proposal-only. Deterministic acceptance resolves exact opportunity, requirement and contributor identities, preserves requirement class and provenance, enforces agency/responsibility/causality ceilings, prohibits provider self-authorisation, fabricated equivalence, exclusive-responsibility strengthening and sole-causality strengthening, and fails closed for the pending broader resource/budget and direct production planning/scheduling Acquisition authorities.

Lexical overlap remains only a proposal aid, retrieval/preselection mechanism and fallback diagnostic signal. It is no longer sufficient authority for `sufficiently_documented`. That state requires at least one accepted opportunity-specific rich support relation. Without one, lexical relevance can produce only `related_but_not_established`; no signal remains `not_sufficiently_established`. Unknown remains distinct from absent. Required, preferred, responsibility, constraint and contextual/unclassified JD classes remain distinct.

Application reuses the established documentary support-structure vocabulary: `SINGLE_GROUNDED_BASIS`, `INDEPENDENT_RECURRENT_BASIS`, and `COMPOSED_HIGHER_ORDER_BASIS`. These describe the structure of requirement-specific documentary support, not Candidate strength. Temporal context is not itself an Application support contributor and cannot establish requirement execution.

Grounded Application Package v1.4 preserves accepted rich support projection/relations alongside the lexical diagnostic relations and uses rich source/material lineage to prefer opportunity-relevant Candidate material for downstream Targeted CV and Cover Letter composition. Complete professional chronology remains preserved by the existing document composition path; PD-085 adds no Candidate score, match %, readiness %, fit score, ranking or global red/green verdict.

Accepted Application support relations survive the normal `applicationState.groundedApplicationPackage` continuity path as derived Application state and do not write to `reusableKnowledgeResults` or Person Knowledge.
