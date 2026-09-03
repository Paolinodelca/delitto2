# IMAGO — FHT-DR01 FIRST HUMAN TEST DRY-RUN CLOSURE REVIEW

## Verdict

**C — FIRST HUMAN TEST BLOCKED BY ONE OR MORE PRE-TEST ISSUES**

Repository reviewed at consolidated base:

`9376254 — FHT-03 enforce representation semantic integrity`

This is review-only. No code, contract, commit, push, or corrective implementation was performed.

## Minimum blocking set

Two blocker boundaries remain before involving a real tester:

1. **Final Representation semantic authority / interview-evidence integration.** The final user-visible Representation can still reconstruct unsupported person claims and non-authoritative target insufficiencies, and its Professional Perception source does not actually consume the interview answers acquired during the session.
2. **Beta feedback operational completion.** The staged journey has one actionable feedback form and a real completion response, but submitted feedback has no persistent/operator-retrievable sink in the real UI path; the session is then deleted.

These are independent boundaries. The Representation blocker must be resolved first because it can materially misrepresent the person/target even if feedback retrieval is fixed.

## Observation review

| # | Repository evidence | Finding | Classification | Consequence |
|---|---|---|---|---|
| 1 — UNDERSTAND | `privateBetaStagedInterviewJourney.js` builds `cvReviewReport` from parsed `candidateProfile` + `targetRole`; `renderPrivateBetaUiJourneyHtml.js` renders legacy `profileRead`, `visibleSignals`, `missingForCvOptimization`, `improvementHint`, `targetFocus`. `userNotes` enters the parser upstream, but the UNDERSTAND surface has no direct evidence/provenance rendering for the additional narrative. | The surface is substantially the existing CV Review projection. It may fail to make newly supplied narrative evidence visibly legible even when the parser has consumed it. | **B — SUPERVISED TEST LIMITATION** | Weakens immediate utility/trust but does not by itself prevent completion or necessarily falsify the final Representation. |
| 2 — Opening repetition | Question selection has recent-question-key/history avoidance and lexical similarity filtering, but the stable opening plus selected role/motivation question can still request the career path twice with different intent. | This is weak semantic deduplication across different question families, not evidence that Runtime is completely non-adaptive. | **C — POST-FIRST-TEST IMPROVEMENT** | Annoying but useful to observe with a real tester after blockers are removed. |
| 3 — Intra-session adaptivity | Runtime advances answer-by-answer and supports adaptive follow-up; the observed success-measure follow-up is consistent with this. Question selection also ranks by category/relevance. | Local adaptivity is real. The architecture is not purely a static questionnaire, but it remains bounded by a preselected interview shape. | **C — POST-FIRST-TEST IMPROVEMENT** | Positive evidence for proceeding with supervised testing once blockers are removed. |
| 4 — Budget / closing | `config/interview_length_modes.json` defines `short`, `standard` (default), `deep` with fixed counts by question family. `deriveQuestionSelectionStrategy.js` resolves a mode and selects fixed category counts. Core coverage state exists elsewhere, but this selection path is not a target-importance + live-coverage stopping policy. | Current default budget is primarily preset shape/count with relevance ranking, not dynamic acquisition-to-coverage completion. | **B — SUPERVISED TEST LIMITATION** | Important target areas can remain unobserved. This is acceptable in a supervised first test if the final Representation faithfully labels them as unknown rather than deficient. Do not solve by merely adding questions. |
| 5 — Unsupported investment autonomy | Final Professional Perception derives `visibleSignals` from `finalCandidateReport.roleFit` and `cvAdvice`; `buildRepresentationValueProofProjection.js` then treats those report signals as derived evidence. There is no source-level authority check capable of proving that “supporto a progetti di investimento” authorizes “gestione autonoma di progetti di investimento.” | The observed `supporto → gestione autonoma` is unsupported semantic amplification if no other source evidence establishes autonomous investment management. The current final projection can propagate such a stronger precomputed signal. | **A — FIRST HUMAN TEST BLOCKER** | Material unsupported professional claim can be shown as evidence about the person. |
| 6 — Six Sigma / international experience reappear | FHT-03 sanitizes JobFit `gaps`, `missingSkills`, `weakSignals`, `risks`, but leaves clarification/HELP-oriented collections. `buildProfessionalPerceptionSummary()` merges `roleFit` and `cvAdvice` risks/clarifications into `underVisibleSignals`, and those feed `perceptionGap` / target-distance projection. The final projection has no RoleProfile requirement-membership gate. | Target authority is not preserved through the final Representation boundary. Contextual/HELP/clarification knowledge can be reframed as target-relative insufficient evidence. This explains how concepts removed from factual JobFit deficiency surfaces can reappear conceptually in the UI. | **A — FIRST HUMAN TEST BLOCKER** | Material target misrepresentation remains possible despite FHT-03. |
| 7 — Interview evidence utilization | `privateBetaStagedInterviewJourney.js` passes `runtimeAnswers` into `buildProReportV2()`. However `buildProfessionalPerceptionSummary({ runtimeAnswers, ... })` declares `runtimeAnswers` but does not consume it; its `visibleSignals`, `underVisibleSignals`, gaps and target-distance material are built from `finalCandidateReport` / pre-existing candidate-fit/CV structures. The separate accepted-answer Evidence/Knowledge vertical slice is built during Runtime but is not the authority feeding this final Professional Perception. | **Repository supports the dry-run hypothesis:** ACQUIRE quality is ahead of final Representation integration. The rich interview evidence does not directly update the Professional Perception used by the value-proof UI. | **A — FIRST HUMAN TEST BLOCKER** | A first human test of “evidence-aware feedback / Representation” would be contaminated: the product can ask useful adaptive questions and then fail to use their evidence in the main final Representation. |
| 8 — Card semantic slots | `buildRepresentationValueProofProjection.js` constructs target-relation `supportingEvidence` from `[...]gaps, ...under` plus contextual uncertainty evidence. The same `under` items also become `uncertainty` and can drive `targetRelation`. | The projection does not preserve a clean semantic distinction between positive supporting evidence, insufficient observation and target relation. Unknown/gap material can literally populate `supportingEvidence`. | **A — FIRST HUMAN TEST BLOCKER** | The UI can label insufficient observations as “Segnali che sostengono questa lettura” and repeat them in uncertainty/target slots, undermining semantic legibility. |
| 9 — Feedback experience | The staged UI contains one feedback phase/form. `Passo successivo` is the submit button for `/private-beta/feedback`, not static copy. `finalizeStagedPrivateBetaJourney()` returns `completed:true`, phase `experience_closed`; the renderer has a completion surface. However `privateBetaUiServer.js` receives the feedback result, renders it, and deletes the session. No feedback persistence/operator retrieval sink is present in this real UI route; operational logging records completion metadata, not submitted feedback content. | The repository does **not** support two distinct real feedback purposes: there is one feedback form followed by completion. It **does** confirm the operational gap: submitted feedback is not retrievable by the Beta operator after the request. | **A — FIRST HUMAN TEST BLOCKER (operational)** | Violates the explicit first-test minimum that operator can retrieve submitted feedback. The completion path itself exists; UX heaviness/duplication perception can be improved later. |

## Cross-cutting finding

The repository supports the dry-run interpretation:

**ACQUIRE quality > REPRESENTATION integration quality.**

This is not because Runtime lacks all adaptivity. It is because the final Professional Perception / Representation path is still substantially assembled from Candidate/JobFit/CV-report structures, while the accepted interview answers and their Evidence/Knowledge processing do not become the direct semantic authority for the final user-visible claims.

FHT-03 successfully protects important JobFit factual surfaces, but that protection is not sufficient when downstream report/projection construction can reconstruct target-relative insufficiency or stronger person claims from other collections.

## Exactly one next implementation task

**FHT-DR02 — Final Representation Semantic Authority and Interview Evidence Integration**

Scope only the smallest coherent semantic blocker boundary feeding the final user-visible Representation.

Required outcome:

- final person claims must not exceed source/person evidence authority;
- target-relative insufficient/unknown items must require actual target authority;
- contextual HELP/clarification must not become target deficiency;
- interview evidence acquired in the current session must actually contribute to the final Representation through an existing authoritative path;
- projection must keep `supportingEvidence`, `uncertainty`, and `targetRelation` semantically distinct;
- do not redesign Final UI, interview planning, feedback UX, Core, or Representation architecture unless repository evidence proves the existing boundary cannot support the correction.

Why this task is first: Observations 5, 6, 7 and 8 converge on the same final Representation construction/projection boundary and can materially misrepresent the person or target. That is a higher-order pre-test safety issue than the independent feedback retrieval gap.

## Explicitly queued after FHT-DR02

**Beta feedback operational minimum** remains a separate pre-test blocker: preserve the existing lightweight submit/skip flow and completion state, but make submitted feedback retrievable by the Beta operator using the narrowest existing operational boundary. Do not bundle a broader feedback UX redesign.

## Supervised limitations after blockers are resolved

The first human test need not wait for:

- perfect UNDERSTAND narrative richness;
- elimination of the opening/motivation repetition;
- dynamic information-gain interview budgeting;
- broader contextual micro-feedback UX.

These should be observed or improved after the blocking semantic and operational boundaries are corrected.
