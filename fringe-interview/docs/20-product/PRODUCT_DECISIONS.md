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
