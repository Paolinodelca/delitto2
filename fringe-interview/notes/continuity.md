# FRINGE Interview – Continuity Log

## Project identity

**Project name:** FRINGE  
**Active MVP:** Fringe Interview  
**Current branch:** `mvp-fringe-interview`

FRINGE contains:
- a frozen demo called **FRINGE / LEAK**
- a new active development branch for **Fringe Interview**

---

## Frozen areas

The following area is considered frozen and must not be modified unless explicitly decided later:

- **FRINGE / LEAK demo**
- the GitHub Pages demo connected to that frozen demo

This frozen demo remains a stable reference and must stay untouched while developing Fringe Interview.

---

## Active work area

Current active work is inside:

`fringe-interview/`

Current known structure includes:

- `config/interview_config.json`
- `config/question_families.json`
- `config/question_families.it.json`
- `config/followup_packs.json`
- `config/followup_packs.it.json`
- `config/report_rubrics.json`
- `config/parser_schema.json`
- `config/parser_prompts.json`
- `config/app_locale.json`
- `config/answer_annotation_schema.json`
- `notes/roadmap.md`
- `notes/ideas.md`
- `notes/parser_notes.md`
- `notes/jobfit_engine_spec.md`
- `notes/continuity.md`
- `notes/answer_annotation_schema.md`
- `manifest_fringe_interview.md`
- `architecture.md`
- `fixtures/`
- `src/parser/`
- `src/interview/`
- `src/app/`
- `src/i18n/`
- `scripts/`
- `tmp/`

---

## Current objective

Build MVP **Fringe Interview**:

A mock interview simulator that:
- analyzes the **form** of candidate answers
- adapts interview focus to CV ↔ Job Description fit
- activates follow-up questions when useful
- produces a final report useful to the candidate
- generates suggestions to improve the candidate CV

The system is not just a generic Q&A loop.  
It must behave like a structured interview engine guided by profile analysis.

A second medium-term objective is explicitly active:

- evolve the interview engine toward a broader **training engine**
- keep architecture choices compatible with future domain-specific training parsers
- avoid over-specializing the runtime to interviews only

This means current choices should increasingly favor:
- reusable runtime logic
- reusable answer analysis
- reusable report / coaching structure
- parser-driven specialization by domain
- a stable annotation layer independent from UI rendering

---

## Current implementation status

### Completed conceptual layer
The following design assets are in place:

- parser schema
- parser prompt configuration
- JobFitAnalysis engine specification
- parser notes
- roadmap
- continuity log
- answer annotation schema note
- answer annotation JSON schema

### Completed parser layer
The parser pipeline is implemented and tested.

Implemented capabilities:

- load parser schema and prompt config
- build controlled prompts for:
  - CandidateProfile
  - RoleProfile
  - JobFitAnalysis
- run parser tasks through a model adapter
- extract JSON safely from model output
- validate top-level parser output
- run end-to-end parser pipeline

### Completed model integration
A Groq adapter is implemented and tested using:

- `GROQ_API_KEY`
- optional `GROQ_MODEL`
- default model fallback:
  - `llama-3.3-70b-versatile`

The parser adapter already includes retry logic for transient provider failures such as:
- 429
- 500
- 502
- 503
- 504

A second Groq integration now exists for answer annotation, with:
- retry handling
- detection of suggested wait times from Groq rate-limit responses
- throttled session annotation flow to reduce TPM collisions

Current limitation:
- the project is currently hitting Groq daily token limits (`TPD`) fairly easily when rerunning full parser + annotation flows repeatedly
- this is now a practical operating constraint during testing

### Completed interview planning layer
The system derives from parser output:

- `interviewPlan`
- selected question families
- selected follow-up packs
- primary questions
- a composed `interviewSession`
- a runtime that advances step by step
- answer-shape analysis attached to recorded answers
- an aggregated `interviewReport`
- a final structured candidate report

This means the current chain is:

CV + JD  
→ parser  
→ JobFitAnalysis  
→ interviewPlan  
→ question selection  
→ composed interview session  
→ runtime  
→ answer-shape analysis  
→ interview report  
→ final candidate report

---

## Locale-aware architecture status

Locale handling is now part of the real architecture.

### Current locale source of truth
- `config/app_locale.json`

### Current locale-aware areas
The following areas now react to the active locale:

- question family config selection
- follow-up pack config selection
- interview internal copy
- answer-shape feedback text
- report collector narrative text
- final candidate report text
- parser output language instructions
- answer annotation prompt language instructions

### Verified behavior
With locale set to `it`, the system now produces:

- parser summaries in Italian
- interview/report shell text in Italian
- final report section titles in Italian
- parser-generated focus topics in Italian
- answer annotation textual output in Italian

This confirms that locale switching is externally configurable and does not require changing business logic.

---

## App orchestration status

A first application-facing orchestration layer is implemented.

### Current app entrypoints
- `runFringeInterviewMVP`
- `runFringeInterviewMVPSession`

### Current capability
The system can now:

- run the full parser flow from one entrypoint
- generate the interview plan
- build the question set
- compose the session
- initialize runtime
- optionally consume a batch of answers
- build interview report
- build final candidate report

This makes the MVP engine reusable from:
- scripts
- future UI
- future API layer
- future demo shell

---

## Adaptive runtime status

A first adaptive runtime rule is now implemented and verified.

### Current rule
If a weak answer is given to a `core_question`, the runtime may inject an `adaptive_followup_pack` before continuing the standard flow.

### Verified behavior
The adaptive runtime has been successfully tested with:

- normal answer on `opening`
- weak answer on `core_question`
- injected adaptive follow-up:
  - `stakeholder_examples`
- timeline updated dynamically

Observed verified timeline example:
- `opening`
- `core_question`
- `adaptive_followup_pack`
- remaining core / follow-up / closing flow

This confirms that the runtime is no longer purely linear.

A second refinement is also in place:

- dimension-based adaptive routing
- adaptive follow-up can now react not only to overall weak answers
- ownership / evidence / specificity can also influence adaptive choice

Important note:
- there are still practical issues around duplicate / overly similar questions in some runs
- this is still considered an active refinement area, not fully closed

---

## Answer annotation architecture status

A new answer annotation layer now exists as a distinct architectural module.

### Current design assets
- `notes/answer_annotation_schema.md`
- `config/answer_annotation_schema.json`

### Current implemented modules
- `src/interview/loadAnswerAnnotationSchema.js`
- `src/interview/buildAnswerAnnotationPrompt.js`
- `src/interview/normalizeAnswerAnnotation.js`
- `src/interview/runAnswerAnnotation.js`
- `src/interview/runAnswerAnnotationsForSession.js`
- `src/interview/adapters/runGroqAnswerAnnotationModel.js`

### Current capability
The system can now:

- define a stable answer-annotation contract
- build a locale-aware annotation prompt
- call Groq for one answer annotation
- call Groq for a full session annotation batch
- normalize the returned annotation
- reject unsafe `improvedAnswerDraft` outputs when they add unsupported content
- persist session-level LLM annotations in `tmp/answer-annotation/`

### Current normalization / guardrails
A first safety layer now exists:

- annotation excerpts must match source text spans
- invalid spans are discarded
- duplicate tags / annotations are normalized
- `improvedAnswerDraft` is disabled when it appears to introduce unsupported content
- suspicious invented outcomes are filtered conservatively

### Current limitation
The annotation quality is now structurally usable, but still imperfect:

- the model can still sound too school-like or generic
- some coach suggestions are too abstract or obvious
- some diagnostics focus too much on domain gaps rather than answer quality
- some upgraded drafts are still correctly disabled because they remain too risky to trust

---

## HTML preview and local UI status

### HTML preview
A first HTML preview renderer exists and works.

Current capability:
- generate a readable local browser preview from the full MVP session result
- show summary, fit, answer quality, risks, improvements, and session status
- organize secondary detail in expandable sections
- support Italian labels on the main surface more clearly than before

This preview is useful for:
- visual review
- product discussion
- checking report readability

### Local interactive UI prototype
A local interactive browser shell exists in a more mature prototype form.

Current capability:
- load a session snapshot
- show current context, report, runtime status, answers, and trainer mode
- display answer review using:
  - LLM annotations when available
  - heuristic fallback otherwise
- attach LLM session annotations to runtime answers before rendering
- render a trainer-style answer review with:
  - source badge (`Annotazione LLM` / fallback)
  - annotated text
  - strengths
  - weaknesses
  - coach tip
  - optional improved draft
- render from stored session JSON instead of recomputing browser-side runtime

Important limitation:
- visual distinction between LLM and heuristic review now exists, but the trainer UX is still rough
- some screens still feel noisy or redundant
- feedback rapid section and final report are not yet fully aligned with the LLM annotation layer
- duplicate questions / repeated prompts can still appear depending on the underlying session snapshot

Current conclusion:
- the shell is now a **usable trainer-mode prototype**
- it is no longer just a visual experiment
- but it is still not yet a polished or final product UI

---

## Current module status by area

### Parser
Status: **working**

Implemented files include:
- parser config loader
- prompt builders
- parser runners
- full parser pipeline
- Groq adapter

Test status:
- mock runner test: passed
- Groq parser test: passed
- full parser pipeline test: passed
- locale-aware parser test: passed

Current operational note:
- parser logic works, but frequent reruns are limited by Groq daily token quota

### Interview planning
Status: **working first version**

Implemented files include:
- `deriveInterviewPlanFromJobFit`
- `buildInterviewQuestionSet`
- `composeInterviewSession`

Recent refinement:
- duplicate / redundant question flow was reduced in earlier iterations
- only one question per family should be selected in the intended shorter flow
- total core questions are intended to stay limited
- standard follow-up duplication was previously reduced

Current issue still open:
- some session snapshots still show repeated or too-similar questions
- question-flow deduplication is therefore not yet fully resolved

Test status:
- interview plan derivation test: passed
- question selection test: passed
- session composer test: passed

### Runtime and answer analysis
Status: **working first version**

Implemented:
- runtime creation
- runtime step advancement
- answer recording
- deterministic answer-shape analysis
- interview report collector
- final candidate report builder
- adaptive follow-up injection
- dimension-aware adaptive routing

Recent refinement in local shell:
- answer scoring was recalibrated
- live feedback was simplified
- points of strength now appear more realistically
- suggestions are reduced and less repetitive than before

Test status:
- runtime test: passed
- answer-shape test: passed
- interview report collector test: passed
- final candidate report test: passed
- adaptive runtime follow-up test: passed
- adaptive runtime dimension routing test: passed

### Answer annotation layer
Status: **working first version**

Implemented:
- annotation schema loading
- annotation prompt builder
- single-answer LLM annotation
- session-wide LLM annotation
- normalization / guardrails
- session annotation persistence
- runtime merge for trainer rendering

Test status:
- answer annotation prompt preview test: passed
- single answer annotation Groq test: passed
- full session annotation Groq test: passed

Current quality note:
- structurally works
- semantically promising
- still needs better coaching quality and tighter answer-focused prompting

### App orchestration and preview
Status: **working first version**

Implemented:
- `runFringeInterviewMVP`
- `runFringeInterviewMVPSession`
- `renderFringeInterviewReportHtml`

Test status:
- MVP entrypoint test: passed
- full MVP session test: passed
- HTML preview generation test: passed

### Local interactive browser shell
Status: **usable LLM-aware prototype**

Implemented:
- interactive payload generation
- local HTML UI shell
- final report section
- collapsible detailed analysis
- trainer mode
- heuristic annotation rendering
- LLM annotation rendering
- completion card
- simplified dashboard structure

Current conclusion:
- the shell now truly supports LLM review
- the shell is good enough for product validation
- the shell still needs UX simplification and alignment
- it should not yet be treated as a stable front-end architecture

---

## Latest verified outputs

Recent successful outputs confirm:

- full session annotation via Groq works across all recorded answers in a session snapshot
- `session_answer_annotations_result.json` is generated successfully
- LLM annotations can be merged into the session result
- the local trainer shell can now show `Annotazione LLM`
- runtime answer count in the regenerated LLM shell matches the stored annotated session snapshot
- a 5-answer annotated session was successfully rendered in the shell

Examples from latest runs:
- session annotation summary:
  - `Total answers: 5`
  - `Annotated answers: 5`
- interactive shell generation summary:
  - `Answers in runtime: 5`
  - `Answers with LLM annotations attached: 5`
- visible shell behavior:
  - answers now show `Annotazione LLM`
  - quick feedback uses LLM-derived summary fields when available
  - detailed trainer blocks use LLM strengths / weaknesses / coach tip

---

## Design decisions currently active

### Parser philosophy
The parser must remain:
- schema-guided
- conservative
- evidence-aware
- resistant to hallucinated certainty

### Interview selection philosophy
The interview must:
- validate strengths
- clarify ambiguities early
- probe real risks without becoming unnecessarily aggressive
- avoid repetitive question loops
- stay short enough to preserve quality and usability

Current note:
- the intended design is short sessions (about 4–5 answers)
- repeated questions are still considered a bug / refinement issue, not a desired design feature

### Runtime philosophy
The runtime should evolve from:
- purely sequential flow

toward:
- lightly adaptive flow based on answer quality
- controlled injection of follow-up blocks when needed
- domain-reusable runtime behavior in future training applications

### Annotation philosophy
The trainer UI must depend on a stable annotation contract.

This means:
- generate `answerAnnotation`
- normalize it
- then render it

The UI should not depend on scattered heuristics hardcoded in many places.

### Locale philosophy
Locale changes must be externally controlled.

This means:
- language should be selected through config
- content files should be localized separately
- internal text should come from locale registries
- language changes should not require changing business logic modules

### UI/preview philosophy
The main report page should prioritize:
- high-impact summary
- key signals
- readable structure

Details should increasingly move into:
- collapsible sections
- deeper drill-down areas
- trainer-style review mode

The main surface should not become a giant all-open page.

### Product evolution philosophy
The interview simulator should now be seen as a **vertical use case** of a broader future architecture.

Longer-term direction:
- a generic training engine
- domain-specific parsers
- content-driven generation of questions / checks / coaching
- future ability to ingest freer training sources (manuals, guides, books, documents)

This means current implementation choices should not over-couple the engine to interviews only.

### Working method with the assistant
Important operational rule:

The user is **not a software specialist** and needs close guidance during software development.

Therefore the assistant should prefer:

- clear step-by-step instructions
- clear indication of **which file** to open
- clear indication of **what to replace**
- replacing an **entire function** instead of suggesting tiny line edits
- replacing an **entire file** when that reduces risk and integration mistakes
- avoiding fragile patch-style instructions when a full replacement is safer

Preferred intervention style:

### Good
- “Open this file and replace the whole function with the version below.”
- “Create this new file and paste this full content.”
- “Replace the entire file with this complete version.”

### Avoid when possible
- “Go to line X and change two characters.”
- “Insert this snippet somewhere near that block.”
- “Patch three separate places manually.”

---

## Files and modules currently established

### Config
- `config/parser_schema.json`
- `config/parser_prompts.json`
- `config/question_families.json`
- `config/question_families.it.json`
- `config/followup_packs.json`
- `config/followup_packs.it.json`
- `config/app_locale.json`
- `config/answer_annotation_schema.json`

### Notes
- `notes/continuity.md`
- `notes/roadmap.md`
- `notes/answer_annotation_schema.md`

### Fixtures
- `fixtures/sample_cv_01.txt`
- `fixtures/sample_jd_01.txt`
- expected parser outputs

### Parser code
- `src/parser/readJsonFile.js`
- `src/parser/loadParserConfig.js`
- `src/parser/buildCandidateProfilePrompt.js`
- `src/parser/buildRoleProfilePrompt.js`
- `src/parser/buildJobFitAnalysisPrompt.js`
- `src/parser/extractJsonObject.js`
- `src/parser/validateParserResult.js`
- `src/parser/runParserTask.js`
- `src/parser/runCandidateProfileParser.js`
- `src/parser/runRoleProfileParser.js`
- `src/parser/runJobFitAnalysis.js`
- `src/parser/runFullParserPipeline.js`
- `src/parser/index.js`
- `src/parser/adapters/runGroqParserModel.js`
- `src/parser/adapters/index.js`

### Interview code
- `src/interview/readInterviewConfig.js`
- `src/interview/deriveInterviewPlanFromJobFit.js`
- `src/interview/buildInterviewQuestionSet.js`
- `src/interview/composeInterviewSession.js`
- `src/interview/createInterviewRuntime.js`
- `src/interview/advanceInterviewRuntime.js`
- `src/interview/injectAdaptiveFollowup.js`
- `src/interview/selectAdaptiveFollowup.js`
- `src/interview/analyzeAnswerShape.js`
- `src/interview/collectInterviewReport.js`
- `src/interview/buildFinalCandidateReport.js`
- `src/interview/loadAnswerAnnotationSchema.js`
- `src/interview/buildAnswerAnnotationPrompt.js`
- `src/interview/normalizeAnswerAnnotation.js`
- `src/interview/runAnswerAnnotation.js`
- `src/interview/runAnswerAnnotationsForSession.js`
- `src/interview/index.js`

### Interview adapters
- `src/interview/adapters/runGroqAnswerAnnotationModel.js`

### i18n code
- `src/i18n/getAppLocale.js`
- `src/i18n/getInterviewLocale.js`
- `src/i18n/getParserLocale.js`
- `src/i18n/interviewLocaleRegistry.js`
- `src/i18n/parserLocaleRegistry.js`

### App code
- `src/app/runFringeInterviewMVP.js`
- `src/app/runFringeInterviewMVPSession.js`
- `src/app/renderFringeInterviewReportHtml.js`
- `src/app/buildInteractiveSessionPayload.js`
- `src/app/loadSessionAnswerAnnotations.js`
- `src/app/mergeSessionAnnotationsIntoResult.js`
- `src/app/renderInteractiveInterviewShellHtml.js`
- `src/app/index.js`

### Scripts
- parser prompt test
- parser runner mock test
- parser runner Groq test
- full parser pipeline Groq test
- interview plan derivation test
- question selection test
- session composer test
- runtime test
- answer-shape test
- interview report collector test
- final candidate report test
- locale-aware parser test
- MVP entrypoint test
- full MVP session test
- HTML preview generation test
- adaptive runtime follow-up test
- adaptive runtime dimension routing test
- interactive payload generation test
- interactive shell generation test
- answer annotation prompt preview test
- single-answer annotation Groq test
- session answer annotation Groq test
- interactive shell with LLM annotations generation test

---

## Latest UX checkpoint

A new visual iteration of the interactive shell was attempted and partially integrated.

Current confirmed state:
- the shell remains data-bound and functional
- LLM annotations are visible again
- a stronger hero section, answer cards, and answer-strength mini chart were introduced
- the completed-session box is now more readable than before

Current UX issues still open:
- the page remains too long and too repetitive
- report summary, quick feedback, answer cards, and trainer mode still overlap too much
- some visual labels are too similar and create confusion
- the final summary is not yet dominant enough in the page hierarchy
- the advice section is still not visually central enough
- the answer map could become too vertical with longer answers
- the answer-strength chart is still too flat and should later use stronger semantic color variation
- at least one final-report string is still leaking in English

Product conclusion:
- core intelligence is promising
- current limiting factor is no longer the engine
- current limiting factor is product shaping / UX hierarchy / localization cleanup



## Immediate next step

The next most sensible step is:

### 1. refine the trainer-mode UI around the new LLM layer
Priority refinements:
- remove redundant visual elements
- simplify relationship between summary / feedback rapido / trainer mode
- reduce clutter
- make the LLM review feel clearly different from heuristic fallback

### 2. improve answer-annotation prompt quality
Priority refinements:
- keep advice answer-focused rather than career-guidance-focused
- reduce school-like or generic coaching language
- reduce unsupported domain-gap advice that is not really about answer quality
- make improved drafts safer and more useful

### 3. re-fix short interview flow coherently
Priority refinements:
- restore stable 4–5 answer sessions
- eliminate repeated or near-duplicate prompts
- align session snapshot, annotation batch, and UI rendering to the same short flow

Most likely next best technical step:
- refine `buildAnswerAnnotationPrompt.js` so the model critiques answer form more sharply and gives less generic advice

Most likely next best product step:
- simplify the trainer-mode rendering now that LLM review is working

---

## Planned next steps after that

1. improve LLM annotation prompt quality
2. simplify trainer-mode UI
3. re-stabilize short session composition (4–5 answers without repetition)
4. align final report more strongly with LLM-driven answer review
5. later revisit stronger multi-view / multi-page UX
6. only after that evaluate a more professional front-end shell

---

## Last confirmed checkpoint

We explicitly confirmed that:

- the parser pipeline works end-to-end with Groq
- the interview planning layer works
- the session runtime works
- answer-shape analysis works
- the interview report collector works
- the final candidate report builder works
- the parser is locale-aware
- the app orchestration entrypoints work
- the HTML preview works
- adaptive runtime follow-up works
- an answer annotation schema and prompt pipeline now exist
- single-answer LLM annotation works
- full-session LLM annotation works
- normalized LLM annotations can be merged into the session result
- the local shell now shows `Annotazione LLM`
- the current shell is still prototype-grade, not final UI
- future architecture should increasingly support a broader training-engine direction
- continuity must remain documented in repository files
- full-file replacement remains the preferred working method

---

## Update rule for future sessions

When a meaningful milestone is reached, update this file with:
- what was completed
- what changed
- what remains active focus
- what file or module comes next

This file should remain concise, practical, and trustworthy as the main checkpoint for future sessions.
---

## Update — UI shell restructuring and report localization debugging

### Current checkpoint reached
A substantial UI restructuring of the local interactive shell has been completed.

The shell is no longer primarily a debug-style stacked page.
It now behaves much more like a compact coach dashboard with:
- stronger hierarchy
- shorter main surface
- compact interview map
- collapsible per-answer trainer review
- stronger final summary area
- performance snapshot with semantic progress bars

### Renderer refactor status
`src/app/renderInteractiveInterviewShellHtml.js` has been substantially rewritten and is now the active renderer.

Important integration note:
- some test scripts and app wiring were still pointing to `renderInteractiveInterviewShellHtml_OLD.js`
- this caused false verification because the old renderer was still being used
- the active test flow was corrected to import the new renderer
- `src/app/index.js` also needed cleanup to stop importing the removed `_OLD` file

### Current UI improvements already integrated
The current shell now includes:
- hero summary with final synthesis
- stronger final advice visibility
- compact performance snapshot
- compact interview map
- collapsible trainer review per answer
- alternating visual identity between answer cards
- stronger visual distinction for open cards
- positive/negative visual separation between:
  - `Punti forti`
  - `Criticità`
- highlighted `Coach tip`
- highlighted `Bozza migliorata`
- restored annotated answer text
- restored tooltips for performance dimensions:
  - Specificità
  - Ownership
  - Evidenze
  - Esempi concreti
  - Chiarezza
  - Struttura

### Current UX conclusion
The shell is now much improved and substantially more readable.
The current result is considered a good intermediate product checkpoint.

Still open on UX:
- a short explanatory guide on how to read the dashboard would work better near the top of the page, not only inside the lower trainer-mode area
- the meaning of `Buona aderenza` is still too implicit and should become more explicit, e.g.:
  - `Aderenza profilo–ruolo: buona`
- the global trainer-mode block has improved but still remains secondary compared to the answer-level trainer reviews

### Localization bug investigation
A remaining English string is still leaking into the final hero section:

- `The answer provides evidence or outcome-oriented support.`

This string was confirmed to already exist inside:
- `tmp/interview-report/interview_report.json`

This means the problem is not in the HTML renderer.
The investigation correctly moved upstream to report construction.

### Files inspected for the localization bug
The following files were inspected:
- `src/interview/collectInterviewReport.js`
- `src/interview/buildFinalCandidateReport.js`

### Current diagnosis on the localization bug
The leak appears to originate in `collectInterviewReport.js`, specifically in the recurring-strength aggregation path.

The current logic:
- collects answer-shape strengths
- tries to relocalize them using locale registries
- but some generated or normalized English strengths are not matching the canonical locale dictionary strings exactly
- as a result, they survive in English and propagate into the final report

A first hardening attempt was made by extending relocalization logic in:
- `src/interview/collectInterviewReport.js`

However, after rerunning:
- `node scripts/test_run_fringe_interview_mvp_session.js`
- `node scripts/test_render_interactive_shell_with_llm_annotations.js`

the English string still appeared in the shell.
So the bug is not yet considered closed.

### Next debugging step already defined
The next check to perform is:

1. rerun:
   - `node scripts/test_run_fringe_interview_mvp_session.js`
2. inspect generated JSON directly using:
   - `tmp/app-mvp-session/fringe_interview_mvp_session_result.json`
   - or a direct string search in PowerShell
3. verify whether the English string is still present after the latest `collectInterviewReport.js` change
4. if still present, add a final defensive relocalization layer either:
   - earlier in report collection
   - or as a last-resort normalization in renderer/report output mapping

### Important operational reminder
When changing:
- `collectInterviewReport.js`
- `buildFinalCandidateReport.js`
- runtime/report generation logic

the correct command to rerun is:
- `node scripts/test_run_fringe_interview_mvp_session.js`

Then regenerate the shell with:
- `node scripts/test_render_interactive_shell_with_llm_annotations.js`

The following commands are NOT the primary ones for this bug:
- `node scripts/test_answer_annotation_runner_groq.js`
- `node scripts/test_answer_annotations_for_session_groq.js`

Those are for annotation-layer tests, not for rebuilding the interview report pipeline.

### Product note for near-future work
A useful future product feature was identified:
- allow the user to choose interview length at the start

Possible modes:
- short
- standard
- deep

This is considered a good future improvement, but not immediate priority.
Priority remains:
1. close localization leak
2. refine dashboard guidance placement
3. clarify fit wording

### Strategic expansion note
A new promising direction was explicitly identified for FRINGE:
- CV coach / CV optimization for a target job description

Potential future flow:
CV → Job Fit Analysis → CV coaching suggestions → optimized CV draft for the target role

This is strongly aligned with the existing FRINGE architecture and should be considered a natural future vertical after the interview shell reaches stable product quality.

---

## Update — locale bug fixed in answer-shape analysis

### Current checkpoint
The remaining English string leak in the final shell has been resolved.

Observed previous leaked string:
- `The answer provides evidence or outcome-oriented support.`

### Root cause found
The problem was NOT in:
- `renderInteractiveInterviewShellHtml.js`
- `buildFinalCandidateReport.js`
- `collectInterviewReport.js`
- `interviewLocaleRegistry.js`
- `getInterviewLocale.js`
- `getAppLocale.js`

The actual root cause was in:
- `src/interview/analyzeAnswerShape.js`

### What was happening
The locale system correctly resolved:
- active locale = `it`
- Italian answer-shape strings available in locale registry

However, `analyzeAnswerShape.js` was still producing English summary / strengths / weaknesses / hints during execution.

### Fix applied
`src/interview/analyzeAnswerShape.js` was fully replaced with a more explicit locale resolution strategy:
- reads locale directly through app locale helpers
- resolves locale registry explicitly
- uses answer-shape copy from the resolved locale directly
- preserves the same scoring behavior
- now returns Italian answer-shape outputs correctly

### Verification performed
A direct isolated Node test was run and confirmed:
- `getActiveLocale()` = `it`
- `getInterviewLocale().answerShape.strengths.evidence` = Italian
- `analyzeAnswerShape()` now returns Italian:
  - summary
  - strengths
  - weaknesses
  - improvementHints

Then the normal regeneration flow was rerun successfully:
- `node scripts/test_run_fringe_interview_mvp_session.js`
- `node scripts/test_render_interactive_shell_with_llm_annotations.js`

Confirmed result:
- the English leak disappeared from the final shell
- top-level recurring strength now appears in Italian

### Current shell status
The local interactive shell is now:
- much more readable
- compact and coach-dashboard oriented
- answer-level trainer reviews are much improved
- metric tooltips are restored
- report language consistency is now substantially improved

### Current open UX refinements
Still sensible next refinements:
- make the top fit badge more explicit, e.g.:
  - `Aderenza profilo–ruolo: buona`
- move a short “how to read this report” guide higher on the page
- keep the lower trainer-mode explanation as deeper guidance only

### Product ideas confirmed
Two future product directions remain explicitly valuable:
1. user-selectable interview length:
   - short
   - standard
   - deep
2. future CV coach vertical:
   - CV ↔ job description analysis
   - coaching to improve CV positioning
   - possible optimized CV draft for target role

   ---

## Update — contextual interview engine expansion

### Current strategic extension
A new major product direction is now explicitly active for FRINGE Interview.

The system should evolve beyond:
- technical/professional fit validation only

and move toward:
- a more context-aware and realistic interview simulation

This means the engine should increasingly model not only:
- what the candidate knows
- how well the candidate answers

but also:
- what type of interview context is being simulated
- what type of person may be perceived through the answers
- what style / tone of interviewer the candidate may face

### New design axis 1 — interview context profiling
The system should infer interview context from:
- job description
- role seniority
- company size / type when inferable
- culture signals detectable in role language
- function-specific expectations

Examples:
- junior role vs senior role
- multinational / structured company vs small company / consultancy / operational context
- collaborative environment vs pressure / execution-driven environment

This context should influence:
- question-family selection
- prompt wording
- level of expected ownership
- expected evidence depth
- what kinds of personal signals are considered useful or risky

### New design axis 2 — person perception layer
The system should add a second analytical lens focused on:
- how a recruiter / HR interviewer might perceive the candidate as a person

Important rule:
this must NOT become a personality-labeling engine.

The system should avoid formulations like:
- “you are this type of person”

and instead prefer formulations like:
- “from these answers, a recruiter might perceive…”
- “these examples may suggest…”
- “for this role/context, it may help to make these aspects of yourself more visible”

This layer is especially relevant for:
- young users
- first-job / low-seniority candidates
- candidates who do not yet understand what signals they transmit in interviews

Examples of useful signals that may emerge:
- initiative
- autonomy
- collaboration
- discipline
- resilience
- curiosity
- energy / enthusiasm
- coachability
- execution focus
- comfort under ambiguity
- reaction under pressure

These signals may emerge through:
- examples chosen by the candidate
- hobbies / sports / extra activities
- side projects
- style of narration
- ownership language
- reaction to difficult questions

### New design axis 3 — interviewer tone / style
A further realistic product direction is now explicitly recognized:

the interview engine should eventually support different interviewer tones.

Reason:
real interviews often differ not only in topic but in interviewer style.
Some interviews are:
- neutral and professional
- encouraging
- cold / synthetic
- pressure-based
- challenging or even mildly hostile
- HR-relational
- business-pragmatic

This may depend on:
- interviewer personality
- role type
- company context
- seniority
- deliberate stress-testing of the candidate

The engine cannot know the exact real-world interviewer style in advance,
but it can:
1. infer a plausible style from context
2. let the user train against different tones deliberately

This is considered a very valuable future feature.

### Candidate future selector — interview tone
A future user-facing control now makes conceptual sense:

possible training tones:
- standard
- supportive
- incisive
- pressure
- HR-relational
- business-direct

This should not yet be treated as immediate implementation priority,
but it is now a recognized product direction.

### Impact on question architecture
Because of the above extensions, the question bank will need to expand significantly.

The engine should increasingly select questions from a broader structured pool based on:
- seniority
- company context
- job family
- interview tone
- person-perception objectives

This means the future question architecture should likely support:
- professional-fit families
- behavioral/person-perception families
- context-sensitive variants
- tone-sensitive variants
- low-seniority vs high-seniority variants

### Current implementation consequence
This new direction should be reflected in future design work before large-scale question writing begins.

Recommended order:
1. define context dimensions
2. define tone dimensions
3. define person-perception objectives
4. design question-family taxonomy
5. only then expand the question bank substantially

### Current conclusion
FRINGE should evolve from:
- a role-fit interview simulator

toward:
- a context-aware interview engine that also helps candidates understand
  how they may be perceived during the interview and how to adapt their self-presentation more effectively.

  ---

## Update — context-aware interview engine foundation

### New strategic extension now formalized
A new major extension of the FRINGE Interview engine has now been formalized at architecture level.

The engine should evolve from:
- role-fit interview simulation only

toward:
- context-aware interview simulation

This means the system should increasingly account for:
- seniority context
- company context
- interviewer tone / style
- person-perception signals emerging through answers

### New design dimensions now recognized
The following design dimensions are now explicitly active:

1. **Seniority context**
   - entry
   - junior
   - mid
   - senior
   - lead
   - executive

2. **Company context**
   - corporate_structured
   - scaleup_dynamic
   - startup_pragmatic
   - consultancy_client_facing
   - small_business_operational

3. **Interview tone**
   - standard
   - supportive
   - incisive
   - pressure
   - hr_relational
   - business_direct

4. **Person-perception layer**
   The system should not label the user rigidly.
   It should instead simulate how a recruiter may perceive the candidate through their answers.

### Important product implication
The interview engine should eventually adapt not only:
- what questions are asked

but also:
- how they are asked
- what kind of answer is expected in that context
- what image of the candidate is likely to emerge

### New files added as conceptual foundation
The following files should now exist as a first architecture foundation:
- `notes/interview_context_engine.md`
- `config/interview_context_profiles.json`
- `config/interview_tones.json`

These files are not yet full runtime implementation,
but they establish the conceptual and machine-readable basis for future work.

### Current implementation consequence
Before scaling the question bank significantly, the recommended order is now:

1. define context dimensions
2. define tone dimensions
3. define person-perception objectives
4. define mapping rules between context and question families
5. only after that expand the question library substantially

### Product note
A future interview selector now makes strong product sense:
- interview length
- interview tone

This should later allow users to train not only for different question depth,
but also for different interviewer styles, including more pressuring or colder variants.

### Future vertical alignment
This work is also aligned with future FRINGE directions such as:
- CV coach
- CV optimization for target roles
- profile perception coaching
- broader training-engine applications

## Architecture expansion — Interview Context Engine

The following architectural layer has been introduced:

- interview_context_engine
- interview_context_selection_matrix
- data_structure_design_rules
- question_family_taxonomy
- question_selection_strategy
- context_profile_contract
- derive_interview_context_profile_spec

These documents define the conceptual infrastructure for a context-aware interview engine.

The next step will be to define the question object schema and adapt the question bank structure to support:

- family-based questions
- tone variants
- perception signals
- seniority suitability

 node scripts/test_generate_structured_interview_preview.js

=== Structured interview preview summary ===
{
  "seniorityContext": "lead",
  "companyContext": "corporate_structured",
  "toneMode": "incisive",
  "totalQuestions": 5,
  "mandatoryCount": 2,
  "secondaryCount": 1,
  "personPerceptionCount": 1,
  "closingCount": 1
}

=== Preview timeline ===
1. stakeholder_interaction | category=role_fit | stage=mandatory | tone=incisive | source=tone_variant
   prompt: Describe a real case where stakeholder expectations conflicted. What did you actually do?
2. transferability_examples | category=role_fit | stage=mandatory | tone=incisive | source=tone_variant
   prompt: Be specific: why should I believe your past experience is genuinely transferable to this role?
3. learning_orientation | category=seniority_calibration | stage=secondary | tone=incisive | source=tone_variant
   prompt: Give me one concrete example of how you learned quickly and applied it in practice.
4. initiative_examples | category=person_perception | stage=person_perception | tone=incisive | source=tone_variant
   prompt: Give me one concrete example of initiative you took without being directly asked.
5. closing_reflection | category=closing | stage=closing | tone=incisive | source=standard_variant
   prompt: Before we close, what would you most want the interviewer to remember about your fit for this role?

=== Output file ===
- C:\Users\Utente\documents\progetti\delitto2\fringe-interview\tmp\structured-interview-preview\structured_interview_preview.json

=== Done ===
Structured interview preview generated successfully.

---

## Update — first implemented contextual interview engine prototype

### Current checkpoint
A first implemented prototype of the new context-aware interview engine now exists in working code form.

This prototype is still parallel to the legacy interview engine and does not replace the current MVP runtime,
but it already validates the new architecture with a real end-to-end flow.

### What is now implemented
The new prototype can now:

1. derive an `interviewContextProfile` from parser outputs
2. load a structured pilot question bank (`question_bank_v2.json`)
3. rank structured questions against the derived context
4. derive a `questionSelectionStrategy`
5. resolve tone-aware prompt variants
6. build a final `structuredInterviewPreview`

This means the following new flow is now real and tested:

parser outputs  
→ `deriveInterviewContextProfile`  
→ `loadStructuredQuestionBank`  
→ `rankStructuredQuestions`  
→ `deriveQuestionSelectionStrategy`  
→ `selectQuestionToneVariant`  
→ `buildStructuredInterviewPreview`

### New files added
The following implementation files now exist:

#### Config
- `config/question_bank_v2.json`

#### Notes
- `notes/question_bank_migration_strategy.md`
- `notes/load_structured_question_bank_spec.md`
- `notes/select_question_tone_variant_spec.md`
- `notes/question_object_schema.md`

#### Interview code
- `src/interview/loadStructuredQuestionBank.js`
- `src/interview/rankStructuredQuestions.js`
- `src/interview/deriveInterviewContextProfile.js`
- `src/interview/deriveQuestionSelectionStrategy.js`
- `src/interview/selectQuestionToneVariant.js`
- `src/interview/buildStructuredInterviewPreview.js`

#### Scripts
- `scripts/test_load_structured_question_bank.js`
- `scripts/test_rank_structured_questions.js`
- `scripts/test_derive_interview_context_profile.js`
- `scripts/test_contextual_question_selection_flow.js`
- `scripts/test_derive_question_selection_strategy.js`
- `scripts/test_select_question_tone_variant.js`
- `scripts/test_generate_structured_interview_preview.js`

### Verified behavior
The prototype has been verified to:

- load and normalize the structured pilot bank successfully
- derive a plausible context profile from parser results
- rank questions differently depending on context
- build a readable selection strategy with:
  - mandatory question keys
  - secondary question keys
  - person-perception question keys
  - closing question keys
- resolve prompt wording according to tone, with safe fallback to standard variants
- generate a final structured preview timeline

### Latest observed example
A recent successful derived context profile produced:

- `seniorityContext: lead`
- `companyContext: corporate_structured`
- `defaultTone: incisive`

From that context, the structured engine selected and resolved a preview flow including:

1. `stakeholder_interaction`
2. `transferability_examples`
3. `learning_orientation`
4. `initiative_examples`
5. `closing_reflection`

This confirms that the new flow is no longer static and already behaves contextually.

### Current architecture conclusion
The contextual interview engine is no longer only a design direction.
It now has a first implemented and testable prototype layer.

Important note:
- this prototype is still separate from the current legacy interview session composer
- it is not yet the active engine for real MVP runtime generation
- it should still be treated as a parallel experimental path

### Current limitation
The structured pilot bank is still intentionally small.

Current pilot questions are useful for validating architecture,
but they are not yet rich enough to support broader realistic contextual coverage,
especially for:

- senior / lead calibration
- leadership depth
- trade-off reasoning
- ambiguity management
- accountability under pressure

This is expected and not considered a bug.

### Recommended next step
Before integrating the new contextual engine into the legacy runtime,
the next sensible step is to strengthen the pilot structured bank with a few additional question objects,
especially for higher-seniority contexts.

Suggested near-term additions:
- leadership_scope
- decision_tradeoffs
- ambiguity_management
- accountability_examples
- pressure_handling

### Strategic note
This milestone is important because it proves that FRINGE can evolve from:

- a role-fit interview simulator

toward:

- a context-aware interview engine with structured question assets, tone-aware delivery, and person-perception-aware selection logic

without breaking the current MVP.

## 🔹 Fringe Interview – Contextual Interview Engine (v2 prototype)

### Stato attuale

È stato implementato un primo prototipo funzionante del nuovo motore di selezione contestuale delle domande di intervista, basato su:

- seniority del ruolo
- tipo di azienda (company context)
- tono dell’intervista (tone mode)
- segnali di person perception
- strategia di selezione delle domande

---

### Componenti introdotti

#### 1. Structured Question Bank v2

File:
- `config/question_bank_v2.json` (EN)
- `config/question_bank_v2.it.json` (IT)

Caratteristiche:
- domande strutturate con:
  - key
  - category (`role_fit`, `seniority_calibration`, `person_perception`, `closing`)
  - intent
  - signals
  - senioritySuitability
  - companyContextSuitability
  - toneSuitability
  - selectionWeight
- varianti di tono:
  - `standard` (obbligatoria)
  - `supportive`
  - `hr_relational`
  - `incisive`
  - `business_direct`
  - `pressure` (dove rilevante)

Numero attuale domande: **10**

---

#### 2. Locale-aware loading

File:
- `loadStructuredQuestionBank.js`

Funzionalità:
- selezione automatica del file in base a:
  - active locale
  - fallback locale
  - fallback finale → inglese
- validazione forte:
  - presenza `standard` in ogni domanda
  - coerenza struttura

---

#### 3. Context derivation

File:
- `deriveInterviewContextProfile.js`

Output:
- `seniorityContext`
- `companyContext`
- `defaultTone`
- `personPerceptionFocus`
- `questionStrategyBias`

---

#### 4. Ranking delle domande

File:
- `rankStructuredQuestions.js`

Logica:
- scoring basato su:
  - seniority match
  - company context
  - tone
  - signals / bias

---

#### 5. Selection Strategy (v2 migliorata)

File:
- `deriveQuestionSelectionStrategy.js`

Nuove caratteristiche:
- selezione strutturata per categorie:
  - `mandatory` → role_fit (2)
  - `seniority_calibration` → forzata per `senior/lead/executive`
  - `secondary` → completamento dinamico
  - `person_perception` → sempre presente
  - `closing` → sempre presente
- introduzione flag:
  - `forcedSeniorityCalibration`
  - `forcedPressureSignal`

---

#### 6. Tone resolution

File:
- `selectQuestionToneVariant.js`

Logica:
- usa variante specifica se disponibile
- fallback su `standard`

---

#### 7. Structured Interview Preview

File:
- `buildStructuredInterviewPreview.js`

Fix importante:
- inclusione corretta di `seniorityQuestionKeys`

Output:
- timeline ordinata delle domande
- summary con conteggi per categoria

---

### Esempio comportamento (contesto: lead + corporate + incisive)

Output tipico:

1. stakeholder_interaction
2. accountability_examples
3. decision_tradeoffs
4. leadership_scope
5. pressure_handling
6. closing_reflection

Interpretazione:
- forte enfasi su:
  - responsabilità reale
  - qualità decisionale
  - gestione pressione
  - leadership scope

---

### Stato del prototipo

✔ Funzionante  
✔ Coerente con contesto  
✔ Linguaggio locale supportato  
✔ Output plausibile per diversi livelli di seniority  

⚠ Non ancora integrato nel motore principale (composer legacy)

---

### Nota importante

Questo sistema rappresenta un **nuovo layer decisionale** che:
- NON sostituisce ancora il sistema attuale
- ma è pronto per integrazione controllata

---

### Prossimo obiettivo

- espansione question bank v2
- confronto tra scenari:
  - junior
  - lead
  - consultancy / pressure
- preparazione integrazione nel motore principale

---

## Update — multi-scenario behavioral validation of the contextual engine

### Current checkpoint
The contextual interview engine prototype has now been validated not only as a technical pipeline,
but also as a behaviorally differentiated system across multiple interview scenarios.

A dedicated comparison script was introduced to test whether the same engine produces meaningfully different interview previews when context changes.

### New validation script
The following script now exists:

- `scripts/test_compare_interview_scenarios.js`

Its purpose is to compare multiple context profiles side by side and inspect:

- selected question mix
- question ordering
- tone resolution
- perceived interviewer behavior

### Compared scenarios
The engine was tested on three scenarios:

1. **junior + corporate_structured + supportive**
2. **lead + corporate_structured + incisive**
3. **senior + consultancy_client_facing + pressure**

### Main result
The comparison confirmed that the new engine is no longer only changing wording.
It is now changing:

- question priorities
- pressure level
- evaluation angle
- perceived interviewer style

This is a major validation milestone.

### Observed behavior by scenario

#### Scenario 1 — Junior / Supportive
Observed behavior:
- softer wording
- stronger emphasis on:
  - transferability
  - learning
  - initiative
- gentler closing style

Interpretation:
- the engine behaves like a potential-oriented interviewer
- this scenario feels closer to a mentor / growth-oriented recruiter style

#### Scenario 2 — Lead / Incisive
Observed behavior:
- stronger emphasis on:
  - accountability
  - stakeholder conflict
  - decision trade-offs
  - leadership scope
  - pressure handling

Interpretation:
- the engine behaves more like a demanding manager validating scope and judgment
- this scenario now feels meaningfully appropriate for higher seniority

#### Scenario 3 — Consultancy / Pressure
Observed behavior:
- pressure-oriented wording clearly appears in:
  - stakeholder interaction
  - decision trade-offs
  - pressure handling
- the resulting flow feels more skeptical and stress-oriented

Interpretation:
- the engine behaves more like a demanding consultancy / client-facing interviewer
- this validates the usefulness of tone-sensitive and context-sensitive question design

### Important conclusion
This comparison strongly suggests that FRINGE is no longer only generating different prompts.
It is beginning to simulate different interviewer personas or interview styles in a structurally credible way.

This is one of the most important conceptual validations reached so far.

### New issue discovered during validation
A structural bug was found and fixed in:

- `src/interview/buildStructuredInterviewPreview.js`

Problem:
- `seniorityQuestionKeys` were present in strategy output
- but were missing from the final preview timeline

Fix:
- preview timeline construction now includes:
  - mandatory questions
  - seniority questions
  - secondary questions
  - person-perception questions
  - closing questions

After the fix, the preview correctly expanded from 5 to 6 questions in higher-seniority scenarios.

### Current quality assessment
The contextual engine now behaves credibly enough to be considered:

- technically working
- behaviorally differentiated
- product-relevant

It is still prototype-stage, but it is no longer only an architectural experiment.

### Open refinement points identified
Validation also revealed two important improvement areas:

#### 1. Junior strategy still slightly too demanding
In the junior/supportive scenario, `accountability_examples` still rises too easily into mandatory selection.

This suggests the strategy should later be refined so that junior paths more strongly favor:
- learning orientation
- initiative
- potential
- motivation
and less strongly favor high-accountability framing.

#### 2. Pressure mode still needs richer bank support
The consultancy/pressure scenario is already meaningfully different,
but some selected questions still fall back to standard variants because the pressure-oriented bank coverage is still limited.

This suggests the structured bank should later expand with:
- more `pressure` variants
- possibly consultancy-specific prompts
- more pressure-sensitive higher-seniority questions

### Recommended next step
The next sensible work order is now:

1. update continuity / roadmap with this validation
2. refine junior-oriented selection behavior
3. expand the structured bank with:
   - more junior/potential questions
   - more pressure-oriented variants
4. only after that reconsider integration into the legacy composer

### Strategic interpretation
This milestone is important because it validates that FRINGE can evolve toward:

- a context-aware interview engine
- with distinct interviewer styles
- distinct pressure levels
- distinct seniority expectations
- and distinct person-perception emphasis

This is a strong confirmation of the broader product direction.

---

## Update — junior/potential expansion and improved scenario differentiation

### Current checkpoint
The structured question bank v2 has now been expanded with a second wave of questions focused on junior/potential-oriented evaluation.

New question objects added:
- `motivation_for_role`
- `feedback_application`
- `team_contribution_examples`
- `adaptability_examples`

These were added in both locale-aware structured bank files:
- `config/question_bank_v2.json`
- `config/question_bank_v2.it.json`

### Purpose of this expansion
The goal of this addition was to improve contextual realism for:
- junior / entry scenarios
- supportive interview styles
- growth / potential oriented evaluation

Before this expansion, junior flows still tended to inherit too much accountability-heavy logic from higher-seniority patterns.

### Strategy refinement applied
`src/interview/deriveQuestionSelectionStrategy.js` was further refined so that:

- junior-like contexts (`entry`, `junior`) now use:
  - only 1 mandatory `role_fit` question
  - a stronger preference for lower-seniority supportive flow
- seniority-forced calibration still applies for:
  - `senior`
  - `lead`
  - `executive`

This reduced the risk of junior flows sounding too managerial or too demanding.

### Multi-scenario validation rerun
After the bank expansion and strategy refinement, the multi-scenario comparison was rerun successfully.

Scenarios tested:
1. `junior + corporate_structured + supportive`
2. `lead + corporate_structured + incisive`
3. `senior + consultancy_client_facing + pressure`

### Updated observed behavior

#### Junior / Supportive
Current selected flow:
- `transferability_examples`
- `learning_orientation`
- `motivation_for_role`
- `closing_reflection`

Interpretation:
- the junior flow is now much more credible
- it emphasizes:
  - transferability
  - growth
  - motivation
  - potential
- it no longer feels overly accountability-heavy

This is considered a clear improvement.

#### Lead / Incisive
Current selected flow remains strong and coherent:
- `accountability_examples`
- `stakeholder_interaction`
- `decision_tradeoffs`
- `leadership_scope`
- `pressure_handling`
- `closing_reflection`

Interpretation:
- the higher-seniority flow remains appropriately demanding
- it still validates:
  - scope
  - accountability
  - judgment
  - stakeholder handling
  - composure under pressure

#### Consultancy / Pressure
Current selected flow:
- `stakeholder_interaction`
- `accountability_examples`
- `decision_tradeoffs`
- `adaptability_examples`
- `pressure_handling`
- `closing_reflection`

Interpretation:
- the consultancy/pressure flow now gains a useful adaptability signal
- it feels slightly more realistic for client-facing volatile environments

### Current conclusion
The contextual engine now shows stronger differentiation across:
- junior / supportive
- lead / incisive
- senior consultancy / pressure

This makes the prototype substantially more credible as a simulated interviewer system.

### Remaining opportunity
The junior flow is now more natural, but also shorter (4 questions instead of 5–6).

This is not necessarily a bug:
- it may become a useful “lighter junior mode”

However, this should later be made explicit as a product choice:
- shorter junior flow
or
- equal-length junior flow with more junior-specific questions

### Recommended next step
The next sensible step is now to update the project notes and roadmap to reflect:
- the junior/potential expansion
- the improved multi-scenario differentiation
- the stronger behavioral credibility of the contextual engine

---

## Update — consultancy / pressure expansion completed

### Current checkpoint
The structured contextual question bank has now been expanded with a third wave of questions specifically designed to strengthen consultancy / client-facing / pressure-oriented interview behavior.

New question objects added:
- `client_pushback_handling`
- `clarity_under_challenge`
- `priority_conflict_management`
- `expectation_reset`

These were added in both:
- `config/question_bank_v2.json`
- `config/question_bank_v2.it.json`

### Purpose of this expansion
The goal was to make the contextual engine more distinctive in scenarios such as:
- `consultancy_client_facing`
- `pressure`
- skeptical interviewer situations
- client resistance / pushback
- expectation misalignment
- explanation under scrutiny

Before this addition, the pressure branch was already differentiated,
but still partly felt like a senior interview with sharper wording rather than a truly distinct consultancy-pressure style.

### Validation rerun performed
After the bank expansion, the scenario comparison script was rerun successfully:

- `junior + corporate_structured + supportive`
- `lead + corporate_structured + incisive`
- `senior + consultancy_client_facing + pressure`

### Updated observed behavior

#### Junior / Supportive
Current selected flow remains coherent and clean:
- `transferability_examples`
- `learning_orientation`
- `motivation_for_role`
- `closing_reflection`

Interpretation:
- junior paths remain growth-oriented
- no regression was introduced by the consultancy/pressure expansion

#### Lead / Incisive
Current selected flow became:
- `client_pushback_handling`
- `accountability_examples`
- `decision_tradeoffs`
- `leadership_scope`
- `clarity_under_challenge`
- `closing_reflection`

Interpretation:
- the flow remains strong and demanding
- however, it now shows a slight consultancy/client-facing contamination even in a more generic `corporate_structured` lead scenario

This is not considered a failure, but it is an important calibration note.

#### Consultancy / Pressure
Current selected flow became:
- `client_pushback_handling`
- `stakeholder_interaction`
- `decision_tradeoffs`
- `pressure_handling`
- `clarity_under_challenge`
- `closing_reflection`

Interpretation:
- this is a strong improvement
- the consultancy/pressure branch now feels much more distinct
- the engine is now testing:
  - client pushback
  - skeptical challenge
  - reasoning under pressure
  - clarity under scrutiny
  - emotional composure

This is considered a major success of the new expansion.

### Current conclusion
The contextual engine now behaves in a much more recognizable way for consultancy/pressure scenarios.

It no longer feels only like:
- a generic senior interview with sharper prompts

and increasingly feels like:
- a distinct client-facing pressure interview style

### New refinement point discovered
The new consultancy-sensitive questions are strong enough that one of them:
- `client_pushback_handling`

now rises very easily even outside explicitly consultancy-heavy contexts.

This suggests a likely next refinement:
- reduce weighting or contextual favorability of some consultancy-specific questions outside `consultancy_client_facing`
- or add stronger penalties for mismatch with company context

### Recommended next step
The next sensible action is now:
1. document this milestone
2. apply a small ranking refinement so that:
   - consultancy-sensitive prompts dominate more clearly in consultancy contexts
   - but do not over-dominate generic corporate lead contexts

### Strategic interpretation
This milestone further confirms that FRINGE is increasingly capable of simulating:
- different interviewer postures
- different stress levels
- different contextual evaluation logics

This is a strong validation of the contextual-engine direction.

---

## Update — ranking calibration completed across junior / lead / consultancy scenarios

### Current checkpoint
A final ranking calibration step has now been completed for the contextual interview engine prototype.

The goal of this calibration was:
- to keep consultancy-sensitive questions strongly visible in `consultancy_client_facing` contexts
- while preventing them from over-dominating more generic `corporate_structured` lead scenarios

### File updated
- `src/interview/rankStructuredQuestions.js`

### Main refinement applied
The ranking logic now distinguishes between:

- `consultancySensitive`
- `strongConsultancySensitive`

The most consultancy-specific prompts:
- `client_pushback_handling`
- `expectation_reset`

now receive:
- stronger boost inside `consultancy_client_facing`
- stronger penalty outside that context

This preserves their power in true consultancy-pressure scenarios,
while reducing contamination in more generic corporate lead flows.

### Validation rerun performed
The multi-scenario comparison was rerun successfully after the ranking refinement.

Scenarios validated:
1. `junior + corporate_structured + supportive`
2. `lead + corporate_structured + incisive`
3. `senior + consultancy_client_facing + pressure`

### Final observed result

#### Junior / Supportive
Current selected flow:
- `team_contribution_examples`
- `learning_orientation`
- `motivation_for_role`
- `closing_reflection`

Interpretation:
- junior path remains clean, realistic, and potential-oriented
- it now feels clearly different from senior interview logic

#### Lead / Incisive
Current selected flow:
- `accountability_examples`
- `stakeholder_interaction`
- `decision_tradeoffs`
- `leadership_scope`
- `pressure_handling`
- `closing_reflection`

Interpretation:
- the previous consultancy contamination has been removed
- the lead/corporate branch is now again coherent with a demanding but not consultancy-specific manager style

#### Consultancy / Pressure
Current selected flow:
- `client_pushback_handling`
- `expectation_reset`
- `priority_conflict_management`
- `pressure_handling`
- `clarity_under_challenge`
- `closing_reflection`

Interpretation:
- this branch remains strongly differentiated
- it now feels clearly client-facing, skeptical, pressure-testing, and relationally demanding

### Current conclusion
The contextual interview engine now shows a much healthier separation across:

- junior supportive interviews
- corporate lead incisive interviews
- consultancy pressure interviews

This is one of the strongest validation checkpoints reached so far.

### Strategic significance
The engine is no longer merely selecting different prompts.
It is now producing clearly different interviewer behaviors depending on:
- seniority
- company context
- tone
- pressure level

This confirms that the contextual interview engine direction is working at a product level, not only at an architecture level.

### Recommended next step
The next sensible step can now be chosen more calmly between:

1. integrating the contextual engine gradually into the legacy composer
2. introducing user-facing interview modes such as:
   - short
   - standard
   - deep
3. further expanding the bank with additional sector-specific / role-family-specific prompts

At this checkpoint, documentation should be considered updated and trustworthy.
---

## Update — interview length modes implemented and validated

### Current checkpoint
A new user-facing product dimension has now been implemented:

- `short`
- `standard`
- `deep`

This is now part of the contextual interview engine prototype.

### New config file introduced
- `config/interview_length_modes.json`

### New loader introduced
- `src/interview/loadInterviewLengthModes.js`

### Core integration completed
`src/interview/deriveQuestionSelectionStrategy.js` now supports:
- explicit `interviewLengthMode`
- config-driven selection counts
- fallback to default mode when not provided

The selected strategy now includes:
- `interviewLengthMode`
- metadata about:
  - requested mode
  - resolved mode
  - default mode

### Validation script introduced
- `scripts/test_compare_interview_lengths.js`

This script compares the same context profile across:
- `short`
- `standard`
- `deep`

### Validation result
The interview length modes were successfully validated.

#### Short
Observed behavior:
- lighter and faster flow
- for `lead / incisive`, current result is:
  - 1 mandatory
  - 1 seniority
  - 1 person-perception
  - 1 closing

Interpretation:
- this is a real short mode, not only a slightly reduced standard mode

#### Standard
Observed behavior:
- preserves the current reference flow
- for `lead / incisive`, current result is:
  - 2 mandatory
  - 1 seniority
  - 1 secondary
  - 1 person-perception
  - 1 closing

Interpretation:
- this remains the stable default mode

#### Deep
Observed behavior:
- adds more exploration through extra secondary questions
- for `lead / incisive`, current result is:
  - 2 mandatory
  - 1 seniority
  - 2 secondary
  - 1 person-perception
  - 1 closing

Interpretation:
- this is a meaningful deepening of the interview, not just longer repetition

### Stability check
After introducing interview length modes, the existing contextual scenario comparison remained stable:

- `junior + corporate_structured + supportive`
- `lead + corporate_structured + incisive`
- `senior + consultancy_client_facing + pressure`

This confirms that:
- the new length layer did not break contextual differentiation
- context and length are now coexisting coherently

### Product significance
This is an important product milestone because the system now supports not only:
- different interviewer styles
- different company contexts
- different seniority expectations

but also:
- different session depths

This moves FRINGE closer to a usable product control surface.

### New open design question
A product choice is now visible:

Should `junior + standard` remain relatively short by design,
or should standard mode force one more question for junior profiles?

This is not yet treated as a bug.
It is now considered a deliberate future product choice.

### Recommended next step
The next sensible step is:
1. update documentation
2. checkpoint this milestone
3. only after that decide whether to:
   - integrate contextual engine into the legacy composer
   - or further refine product behavior for junior standard mode
   ---

## Update — contextual engine now drives the real MVP interview flow

### Current checkpoint
The contextual interview engine is no longer only attached as side metadata.

It is now actively driving the real MVP interview session flow.

### What changed
A first real runtime-level integration has now been completed.

Previously:
- the contextual engine produced:
  - context profile
  - ranking
  - selection strategy
- but the final interview session still used legacy primary questions

Now:
- `buildInterviewQuestionSet.js` builds and stores:
  - `interviewContextProfile`
  - `rankedStructuredQuestions`
  - `questionSelectionStrategy`
  - `resolvedStructuredQuestions`
- `composeInterviewSession.js` uses the contextual engine output to build:
  - real `coreQuestionBlocks`
  - real contextual `closingPrompt`

### Files updated in this phase
- `src/interview/buildInterviewQuestionSet.js`
- `src/interview/composeInterviewSession.js`
- `src/interview/selectQuestionToneVariant.js`
- `src/app/runFringeInterviewMVP.js`
- `src/app/runFringeInterviewMVPSession.js`
- `scripts/test_run_fringe_interview_mvp_session.js`

### Current session behavior
The real interview session now uses contextual structured questions for the core interview flow.

Observed example in generated MVP result:
- `stakeholder_interaction`
- `accountability_examples`
- `decision_tradeoffs`
- `leadership_scope`
- `pressure_handling`

The contextual closing question is also now used as the real closing prompt.

### Important structural fix completed
A bug was found in the first contextual composition pass:
- resolved structured questions were not carrying proper stage information
- therefore everything was appearing as generic `contextual`
- and even `closing_reflection` was leaking into the core question list

This was fixed by replacing `selectQuestionToneVariant.js` so that resolved question objects now preserve:
- `stage`
- `stageOrder`
- `toneUsed`
- `source`
- `prompt`

This allowed `composeInterviewSession.js` to:
- exclude contextual closing from core questions
- use contextual closing correctly in the closing block

### Interview length mode now active end-to-end
The new product control:
- `short`
- `standard`
- `deep`

is now not only available in isolation,
but also passed through the real app MVP/session entrypoints.

### Session test recalibrated
The full session integration test had become outdated because the new contextual flow made the interview longer than the old legacy test expected.

`test_run_fringe_interview_mvp_session.js` was updated to:
- explicitly request `interviewLengthMode: "short"`
- use a revised answer set aligned with the new contextual questions

### Validation result
After this recalibration:
- `Interview length mode requested: short`
- `Interview length mode resolved: short`
- `Answers provided: 6`
- `Answers recorded: 6`
- `Session completed: true`

This confirms that:
- the real MVP flow now runs successfully using contextual questions
- the new interview length control is working in the real session pipeline
- end-to-end generation still completes successfully

### Current conclusion
The contextual engine has now crossed a major threshold:

it is no longer only:
- a prototype branch
- a sidecar strategy layer
- a future design experiment

it is now:
- part of the actual MVP interview generation flow

### Recommended next step
The next sensible step should now be chosen between:

1. improve labeling / UX presentation of contextual stages in the local shell
2. reduce remaining legacy summary artifacts such as old `selectedFamilies` reporting
3. refine adaptive follow-up logic so it becomes more aware of contextual question stages
4. checkpoint and stabilize before another expansion