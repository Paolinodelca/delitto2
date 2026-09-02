# IMAGO â€” FHT-01 First Human Test Minimum Product Journey Implementation Readiness Review

## Verdict

**B â€” SMALL INTEGRATION SLICE REQUIRED BEFORE FIRST HUMAN TEST**

Repository-first review finds a real staged Private Beta UI journey that can already acquire CV + target/JD, run the interview incrementally, render evidence-aware professional feedback, collect feedback, and fail safely. It is not yet the minimum PA-07 Product journey because the real UI does not expose a distinct "what IMAGO understood / CV representation support" step before the interview, does not accept free-form professional narrative as a first-class UI input, and does not preserve/recover a Professional Identity across runs.

The smallest truthful Run-1 correction is therefore a bounded application/UI integration slice, not new Core architecture and not persistence architecture.

## Authority / closure state

- AR-03 remains CLOSED.
- First Human Test gate remains OPEN WITH EXPLICIT TEST LIMITATIONS.
- PA-07 remains canonical: `PERSON â‰  SESSION â‰  TARGET`, `ACQUIRE â†’ UNDERSTAND â†’ HELP â†’ PRESERVE â†’ REUSE`, and `SAVE â†’ REOPEN â†’ ENRICH â†’ REUSE`.
- No Product Authority contradiction was found. No authority or continuity file is changed by FHT-01.
- E-44 remains deferred.

## Repository-first trace of the real application

### Entry point and live UI

The runnable Beta entry is `scripts/run_private_beta_ui_server.js` â†’ `createPrivateBetaUiServer()` â†’ `/private-beta`.

The default server uses the staged journey:
- `POST /private-beta/journey` â†’ `prepareStagedPrivateBetaJourney`
- `POST /private-beta/interview/answer` â†’ `answerStagedPrivateBetaJourney`
- `POST /private-beta/feedback` â†’ `finalizeStagedPrivateBetaJourney`

The server keeps staged state in an in-process `Map`. It does **not** use the existing JSON file Beta session store.

### Acquisition

The current UI exposes:
- identity action (`create` / `recover`);
- working mode (`independent` / `with_tutor`);
- consent;
- target role;
- CV text;
- JD text.

The labels `recover` and `with_tutor` are onboarding choices only. No persisted Professional Identity is loaded by those selections.

The real UI does **not** expose:
- `userNotes` / free-form professional narrative;
- a generic additional professional document/source.

`runFringeInterviewMVPSession` already accepts `userNotes` and `roleNotes`, but the staged UI preparation currently passes only CV, JD and target role. Therefore free-form narrative is a missing application connection rather than a new parser/Core concept.

### Parser / target artifacts

`runFringeInterviewMVPSession` invokes the existing MVP/parser path and produces:
- `candidateProfile`;
- `roleProfile`;
- `jobFitAnalysis`;
- interview plan/question set/session/runtime.

Person material and target material remain distinct inputs at this boundary (`cvText` vs `jdText`/`targetRole`), although there is no persisted person-level lifecycle above them.

### Person/session identity and storage

Beta Session Core provides:
- `sessionId`;
- `testerId`;
- hashed resume credential;
- revisioned lifecycle;
- resume state;
- `createJsonFileBetaSessionStore`, which persists JSON to disk and supports authenticated load/save.

Existing session tests demonstrate the JSON store and resume mechanics.

However the **real staged UI does not consume that store**. Its `sessionStore` is a process-local `Map`, so:
- state is lost on process/application restart;
- `/private-beta` has no real recovery route;
- completed state is deleted after feedback;
- a previous Professional Identity cannot be reopened from the UI.

This is the central distinction between **CORE CAPABILITY EXISTS** and **REAL BETA JOURNEY CONSUMES IT**.

### Evidence and Knowledge

Accepted interview answers are registered into an IMAGO Evidence store in the staged answer path.

A canonical runtime Knowledge vertical slice can run only when `knowledgeSemanticAuthority` and `knowledgeSubjectRef` are supplied. The default real UI server supplies neither. Therefore the current real UI does **not** truthfully preserve accepted interview Evidence into reusable canonical person Knowledge.

The repository does contain KnowledgeLedger, KnowledgeSnapshot, PersonKnowledgeMatrix and KnowledgeCoverage contracts/builders and the Decision Accountability production semantic path, but their existence must not be reported as current end-to-end Beta reuse.

### User-observable output

At interview completion the staged journey builds:
- interview report;
- Final Candidate Report;
- Professional Perception / PRO report;
- `representationValueProof`.

The Beta HTML renders `representationValueProof` claims when available, including:
- claim;
- epistemic status;
- supporting evidence summaries;
- uncertainty / insufficiently observed items;
- target relation.

This is a meaningful evidence-aware user output and is understandable without exposing Core architecture.

However it is shown **after the interview**. The current journey does not give the tester a distinct pre-interview confirmation of what IMAGO understood from the supplied professional material, nor a correction step.

A mature CV review builder (`buildCvReviewReportV1`) exists and is tested, but it is not connected to the real Private Beta UI.

There is no real report/export download route in the current staged Beta UI. The useful report is viewable in-app as a snapshot.

## Must Work readiness

| Capability | Status | Repository finding |
|---|---|---|
| A. Create / recover person | PARTIAL | Create/onboarding exists; `recover` does not recover persisted identity. |
| B. Acquire current CV | AVAILABLE | Real UI accepts CV text and runner requires it. |
| C. Acquire free-form professional material | PARTIAL | Runner supports `userNotes`; real UI does not expose/pass it. |
| D. Acquire one additional professional source | MISSING | No generic additional-source UI/application path. |
| E. Show what IMAGO understood | PARTIAL | Evidence-aware representation projection exists, but only after interview; parser understanding is not exposed before interaction. |
| F. Allow material correction | MISSING | No correction UX. Supervised verbal/manual disagreement capture is the truthful Run-1 substitute. |
| G. Keep person and target separate | PARTIAL | Separate input/artifact boundaries exist; no persistent person lifecycle. |
| H. Immediate CV / professional representation utility | PARTIAL | CV-review capability exists in repository; not connected to Beta UI. Post-interview professional representation value exists. |
| I. Target-relevant interview preparation | AVAILABLE | Target/JD feeds parser/planning; interview questions are prepared. |
| J. Run interview / professional interaction | AVAILABLE | Staged one-answer-at-a-time UI path exists. |
| K. Provide concrete feedback | AVAILABLE | Final/PRO report plus representation value proof are rendered. |
| L. Preserve supported new information | PARTIAL | Evidence registration exists; canonical Knowledge path is conditional and not wired by default UI. |
| M. Report / export current useful output | PARTIAL | In-app report snapshot is reachable; export/download is not. |
| N. Close and reopen | MISSING | Session Core can persist/resume; real UI cannot. |
| O. Enrich later | MISSING | No recovered Professional Identity to enrich. |
| P. Reuse with different target | MISSING | No person-level recovery/reuse path. |

## Required journey gap matrix

| Journey step | Real entry point | Status | Existing components | Missing connection | Run 1? | Return run? | Scope |
|---|---|---|---|---|---|---|---|
| Enter/onboard/consent | `/private-beta` | AVAILABLE | onboarding, consent, localized UI | â€” | YES | YES | NONE |
| Create person context | onboarding `create` | PARTIAL | Beta session identity | persistent Professional Identity binding | YES | YES | THIN |
| Recover person | onboarding `recover` | MISSING | JSON session store + resume contracts | UI/store/person binding and recovery route | NO | YES | SMALL |
| Acquire CV | materials form | AVAILABLE | `cvText`, parser | â€” | YES | YES | NONE |
| Acquire free narrative | none | PARTIAL | runner `userNotes` | localized textarea + staged pass-through | YES | YES | THIN |
| Additional professional source | none | MISSING | generic structured-input/Evidence infrastructure exists below UI | acquisition + provenance integration | NO | DESIRABLE | MEDIUM |
| Show initial understanding | none before interview | PARTIAL | parser candidate profile; CV review builder | bounded candidate-facing projection/UI step | YES | YES | SMALL |
| Correct material understanding | none | MISSING | no correction UX | supervised disagreement capture initially | YES (substitute) | DESIRABLE | MEDIUM |
| Define target/JD | materials form | AVAILABLE | targetRole/JD + role parser | â€” | YES | YES | NONE |
| Immediate CV/representation help | no pre-interview Beta view | PARTIAL | `buildCvReviewReportV1`; parser artifacts | connect bounded CV/representation view | YES | YES | SMALL |
| Interview preparation | journey prepare | AVAILABLE | interview plan/question set | optional preview only; not required | YES | YES | NONE |
| Interactive interview | answer endpoint | AVAILABLE | runtime + staged state | â€” | YES | YES | NONE |
| Evidence-aware feedback | feedback phase | AVAILABLE | PRO report + representationValueProof | â€” | YES | YES | NONE |
| Preserve answer Evidence | staged answer | PARTIAL | accepted-answer Evidence store | durable person-level binding absent | YES, supervised trace | YES | SMALL |
| Canonical reusable Knowledge | conditional only | PARTIAL | DA semantic path + Knowledge artifacts | default UI authority/subject integration and broader coverage | NO as conclusion; fail closed | YES | MEDIUM |
| In-app report snapshot | feedback/completed | AVAILABLE | report renderer | â€” | YES | YES | NONE |
| Export/download | none | MISSING | report artifacts/renderers | explicit export route | NO | NO | SMALL |
| Close/reopen | none | MISSING | JSON session store + resume | real UI integration | NO | YES | SMALL |
| Enrich/reuse new target | none | MISSING | person/target contracts, existing parser/runtime | recovered identity + source/target reuse integration | NO | YES | MEDIUM |

## Run 1 vs Return Run

### First Human Test â€” Run 1

Run 1 should not be blocked on persistence architecture. It should test:
- acquisition usability;
- correctness of initial understanding;
- target handling;
- immediate professional/CV utility;
- interview usefulness;
- evidence-aware feedback;
- overall coherence.

The current journey is close, but the tester is moved from material submission directly into interview. That skips the PA-07 `UNDERSTAND â†’ HELP` product moment before the interaction and makes it difficult to distinguish parser/material-understanding quality from interview/report quality.

The smallest pre-test implementation should therefore expose that moment using existing parser/CV-review artifacts and add the already-supported free-form narrative input.

A full material-correction workflow is not required for Run 1. The supervised operator can record disagreement/corrections as test evidence, provided the UI does not imply that uncorrected understanding is canonical Knowledge.

### First Human Test â€” Return Run

`SAVE â†’ REOPEN â†’ ENRICH â†’ REUSE` is not real today.

The repository already contains a file-backed Beta session store and resume mechanics, so a return-run slice should not begin by designing a database/account system. However session persistence alone is not yet Professional Identity persistence: the completed staged journey deletes state and the session object does not itself constitute the PA-07 reusable person Knowledge workspace.

Therefore Return Run should follow Run 1 immediately, but it should not be folded into the first implementation task unless implementation work demonstrates that person binding can be added without broadening the slice.

## Dual-user readiness

### Candidate / professional

**PARTIAL but viable for Run 1 after the small integration slice.**

The current localized UI can be operated directly by a candidate. The missing product-facing understanding/CV-support moment is more important than any new Core capability.

### Tutor / outplacement / career professional

No separate application or multi-user infrastructure is required for the First Human Test.

The current `with_tutor` onboarding choice does not create delegated-access infrastructure. For initial Product learning, the professional perspective can truthfully be evaluated by having the professional supervise/review the same candidate-owned artifacts and outputs, under the existing authorization constraints.

This is sufficient to test whether IMAGO reduces the effort needed to organize, understand and investigate professional material. Dedicated professional actions/views can be decided from observed learning rather than pre-built.

## AR-03 supervised limitations preserved

The First Human Test must continue to:
- preserve Evidence â†’ semantic executor outcome â†’ Observation provenance where that semantic path is exercised;
- record provider/model identity;
- present rejected/UNSUPPORTED as not established / insufficient evidence, never as weakness;
- avoid Measurement/Knowledge conclusions where canonical projection is unavailable;
- record participant/observer disagreements;
- treat run-to-run model variability as calibration evidence, not production reliability evidence.

Nothing in FHT-01 reopens AR-03.

## Implementation options

### Option 1 â€” MINIMUM FIRST HUMAN TEST SLICE â€” RECOMMENDED

**Journey enabled**

`ENTER â†’ CV + free narrative + target/JD â†’ SEE WHAT IMAGO UNDERSTOOD / CV REPRESENTATION SUPPORT â†’ supervised confirmation/disagreement capture â†’ INTERVIEW â†’ EVIDENCE-AWARE FEEDBACK`

**Reuse**
- existing localized Beta UI;
- staged journey;
- existing parser artifacts;
- existing `userNotes` runner input;
- existing CV Review builder / bounded candidate-profile projection;
- existing interview runtime;
- existing `representationValueProof`.

**New integration/code**
- localized free-form professional narrative field and pass-through;
- bounded pre-interview understanding/CV-support projection from already-created parser artifacts;
- one staged UI phase between preparation and interview, or equivalent minimal confirmation presentation;
- preserve the supervised disagreement as test feedback/observation, not canonical repair.

**Limitations**
- no durable Professional Identity;
- no reopen/reuse;
- no generic additional document;
- no automatic correction mutation;
- no claim that parser/report artifacts are canonical reusable Knowledge.

**Product learning**
Tests the full Run-1 `ACQUIRE â†’ UNDERSTAND â†’ HELP â†’ INTERACT â†’ FEEDBACK` coherence rather than only interview semantics.

**Scope: SMALL.**

### Option 2 â€” Run 1 plus session recovery

Option 1 plus thin use of the existing JSON Beta session store for interrupted-session recovery.

This can test operational resume and reduce accidental loss, but it still does **not** satisfy PA-07 Professional Identity `SAVE â†’ REOPEN â†’ ENRICH â†’ REUSE`. It should not be mislabeled as person-profile persistence.

**Additional scope: SMALL.**

### Option 3 â€” Return Run Professional Identity slice

Option 1 plus a minimal person-owned persisted snapshot/binding sufficient to reopen authorised professional material, enrich it and apply another target.

This would materially test PA-07 MUST RETURN, but repository evidence shows it crosses beyond simple session-store wiring because reusable person knowledge and completed-session lifecycle must be bound truthfully.

**Scope: MEDIUM.**

Do not choose this option before Run 1 merely for architectural completeness.

## Single smallest next implementation task

**FHT-02 â€” First Human Test Run-1 Understanding and Professional Utility Integration**

Bounded objective:

> Connect the existing real staged Private Beta journey so that a tester can provide CV + optional free-form professional narrative + separate target/JD, see a bounded and provenance-aware representation of what IMAGO understood plus immediate CV/professional representation utility before entering the interview, and then continue through the existing interview and evidence-aware feedback journey.

Constraints:
- reuse existing parser/CV-review/report artifacts;
- no new semantic policy;
- no persistence architecture;
- no Professional Identity lifecycle implementation;
- no additional generic document source in this task;
- no automatic correction/Knowledge repair;
- all new UI text through existing localization resources;
- preserve AR-03 supervised limitations.

This is one Product-journey-bounded SMALL integration task and is the smallest missing implementation required before putting Run 1 in front of a real tester.

## Differentiation enablers, not Run-1 blockers

Existing/near-term artifacts that may later support differentiation:
- representation value proof with supporting evidence and uncertainty â€” **DIFFERENTIATION ENABLER**;
- parser + interview cross-context professional perception â€” **DIFFERENTIATION ENABLER**;
- canonical Evidence/Knowledge vertical slices â€” **DIFFERENTIATION ENABLER**;
- multi-target person-owned Knowledge reuse â€” **DIFFERENTIATION ENABLER**, currently not application-real.

No MUST SURPRISE capability is canonized here.

## Verification

Repository inspection covered:
- `docs/20-product/`;
- current `docs/00-continuity/`;
- actual Beta server/UI entry points;
- staged journey;
- MVP/parser path;
- session stores and resume;
- reports/value-proof projection;
- accepted-answer Evidence and conditional Knowledge integration;
- relevant tests.

Existing runnable checks executed:
- `node scripts/test_staged_private_beta_ui_journey.js` â€” PASS
- `node scripts/test_real_beta_ui_journey_integration.js` â€” PASS
- `node scripts/test_beta_session_core.js` â€” PASS
- `node scripts/test_beta_session_core_hardening.js` â€” PASS

No live Groq calls were required.

No production code, tests, Product Authority or continuity were modified.

## Final readiness answer

1. **What can a real person do today?**
   Open the localized Beta UI, consent, provide CV + target/JD, complete a staged target-relevant interview, see evidence-aware professional feedback, and submit/skip feedback.

2. **What currently breaks/disappears or needs developer intervention?**
   Process restart loses staged UI state; `recover` does not recover a person; free narrative is not exposed; initial material understanding/CV support is not shown before interview; no material correction UX exists; canonical reusable Knowledge is not wired by default; completed Professional Identity cannot be reopened/enriched/reused.

3. **Smallest missing implementation before Run 1?**
   **FHT-02 â€” First Human Test Run-1 Understanding and Professional Utility Integration.**

4. **Can SAVE â†’ REOPEN â†’ ENRICH â†’ REUSE be included cheaply enough now?**
   Session persistence/resume is cheap, but truthful Professional Identity reuse is broader than session recovery. Keep it as the immediate Return Run slice rather than blocking Run 1.

5. **Can Candidate and Outplacement value both be learned without two applications?**
   **Yes.** Run the candidate-owned journey directly and evaluate the professional-support perspective through supervised review of the same artifacts before introducing separate multi-user infrastructure.
