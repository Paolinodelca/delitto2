# Roadmap — Fringe Interview

This document tracks the development progression of the Fringe Interview MVP.

The roadmap is intentionally incremental: the system must become useful early, and then progressively smarter.

A second design horizon is now active:
the interview simulator should evolve toward a broader **training engine** driven by parser-specialized knowledge inputs.

---

# V1 — Core Interview Simulator (MVP)

Goal: create a working interview simulator capable of generating a useful feedback report.

## Architecture
- manifest operativo
- system architecture document
- core config files structure

## Interview engine
- question families configuration
- follow-up packs configuration
- report rubrics configuration

## Interview flow
- basic interview session flow
- question → answer → follow-up loop
- textual simulation interface

## Basic reporting
- final candidate report
- high level feedback areas
- basic improvement suggestions

At this stage the interview is mostly **content-driven**, not yet strongly personalized by CV/JD analysis.

### Status
**Substantially completed as backend logic + preview / trainer prototype layer**

Completed:
- architecture documents
- parser schema and prompt config
- question family config
- follow-up pack config
- parser pipeline
- interview planning
- session composer
- session runtime
- answer-shape analysis
- interview report collector
- final candidate report builder
- app entrypoint orchestration
- first HTML report preview
- adaptive runtime follow-up logic
- dimension-based adaptive routing
- first usable local interactive shell
- first hierarchical final report UI
- first trainer-style detailed answer review
- first LLM-backed trainer-mode integration

Still to complete inside V1:
- restore consistently short sessions (4–5 answers)
- eliminate repeated / near-duplicate prompts
- align live quick feedback with the new LLM annotation layer
- simplify trainer mode now that LLM review exists
- reduce visual redundancy in the shell

---

# V1.5 — Profile-aware Interview

Goal: introduce CV and Job Description parsing so the interview can adapt to the candidate profile and target role.

## Parser system

Implement structured parsing producing:

- CandidateProfile
- RoleProfile
- JobFitAnalysis

Parser responsibilities:

- detect seniority signals
- detect skill clusters
- detect responsibility signals
- detect domain signals
- evaluate evidence strength
- identify ambiguities

### Status
**Completed first working version**

Implemented:
- controlled prompt builders
- parser runners
- model adapter architecture
- Groq adapter
- end-to-end parser pipeline
- fixture-based testing
- Groq real-run testing
- locale-aware parser prompting
- retry handling for transient provider failures

Current operational note:
- repeated runs are now constrained by Groq daily token budget on the current service tier

## JobFitAnalysis engine

Evaluate compatibility between candidate and role across dimensions:

- technical fit
- tools fit
- domain fit
- seniority fit
- responsibility fit
- evidence strength
- growth potential

Output must include:

- matches
- gaps
- ambiguities
- transferable strengths
- interview focus priorities
- follow-up triggers
- CV improvement hints

### Status
**Completed first working version**

## Interview personalization

Use JobFitAnalysis to:

- choose question focus areas
- activate targeted follow-up packs
- emphasize certain interview sections
- adapt report generation

## Context-aware interview profiling

Goal: make the interview engine more realistic by adapting not only to role fit, but also to interview context.

The system should increasingly infer from the job description and related signals:
- role seniority
- company size / structure when inferable
- likely organizational style
- expected degree of autonomy, ownership, collaboration, or resilience
- whether the interview context is likely to be more HR-oriented, operational, business-driven, or pressure-oriented

This context should influence:
- selected question families
- emphasis of follow-up questions
- expected answer depth
- what counts as a strong answer for that context

### Status
Concept now explicitly active, implementation not started

Planned consequences:
- broader question taxonomy
- stronger distinction between junior / mid / senior interview paths
- stronger distinction between structured-corporate and smaller / pragmatic contexts
- more realistic interview behavior overall

## Person-perception layer

Goal: help the candidate understand what kind of person may be perceived through their answers.

This layer should NOT classify the candidate rigidly.
Instead, it should simulate the kind of impression a recruiter might form.

Expected output style:
- “a recruiter may perceive…”
- “these answers may suggest…”
- “for this role, it may help to make these aspects more visible…”

Potential perceived signals:
- initiative
- autonomy
- collaboration
- discipline
- resilience
- curiosity
- enthusiasm
- coachability
- comfort under pressure
- execution focus

This is especially relevant for:
- low-seniority profiles
- first-job candidates
- young users with little interview experience

### Status
Concept now explicitly active, implementation not started

Planned consequences:
- new behavioral / person-perception question families
- new report sections focused on perceived personal signals
- better coaching on self-presentation during interviews

## Interview tone simulation

Goal: prepare the candidate not only for different questions, but for different interviewer styles.

Real interviews vary in tone. Some are:
- standard / neutral
- supportive
- incisive
- pressure-oriented
- HR-relational
- business-direct
- occasionally mildly hostile or stress-testing

The system cannot know the real interviewer style in advance,
but it can:
- infer a plausible tone from role/context
- allow explicit training against different tones

This is especially useful for:
- commercial roles
- leadership roles
- customer-facing roles
- stressful or high-pressure environments

### Status
Concept now explicitly active, implementation not started

Possible future user-facing selector:
- short / standard / deep
- standard / supportive / incisive / pressure / HR-relational / business-direct

Important note:
tone simulation should be used for realistic preparation, not for theatrical exaggeration.
The goal is to train resilience, adaptability, and composure under different interview conditions.

## Question bank expansion strategy

Because the engine is becoming more context-aware, the question bank should eventually expand significantly.

The correct future order is:
1. define context dimensions
2. define person-perception objectives
3. define tone dimensions
4. structure the question-family taxonomy
5. only then scale the library of actual questions

This avoids uncontrolled growth of question files and keeps selection logic coherent.

### Status
Not started as formal architecture work
Concept now clearly active


### Status
**Completed first working version**

Implemented:
- interview plan derivation
- question family selection
- follow-up pack selection
- session composition
- runtime execution base
- answer-shape analysis
- report aggregation
- final candidate report build
- adaptive follow-up injection on weak core answers
- dimension-aware adaptive routing

Still to complete:
- tighter question deduplication
- stronger alignment between selected question and actual answer intent
- more stable short-flow behavior
- stronger consistency between session design and rendered shell

## Comparative retry

Allow a second interview attempt and highlight improvements.

### Status
Not started

## Optional step-by-step feedback

Allow the system to optionally provide feedback after certain questions.

### Status
**Started in prototype form**

Implemented in shell:
- lightweight quick feedback
- score / top strength / focus area

Still to refine:
- align quick feedback with LLM review rather than old heuristic only
- reduce repetitive patterns
- possibly separate “fast feedback” from “deep trainer feedback”

## Locale-aware system behavior

The system should be externally switchable between languages without changing core business logic.

### Status
**Working first version**

Implemented:
- `app_locale.json` as source of truth
- locale-aware interview config loading
- localized question/follow-up content
- localized report copy
- locale-aware parser prompting
- locale-aware answer annotation prompting

Still to refine:
- richer localized config coverage
- stricter locale consistency checks in generated outputs
- cleaner handling of internal keys versus user-facing labels

## Preview and interaction layer

A first preview and local interaction exploration exist.

### Status
**Working prototype with LLM trainer layer**

Implemented:
- HTML preview for final report
- local payload generation
- local interactive HTML shell
- final report dashboard
- collapsible detailed analysis
- trainer mode
- heuristic answer annotations
- LLM answer annotations
- completion state after session end
- session annotation merge into shell rendering

Still to refine:
- simplify the shell now that it supports real LLM review
- remove redundant visual constructs
- make trainer mode visually more distinct and professional
- possibly later move toward multi-view UX

---

Latest UI/product note:
- the shell has moved from raw debug-style rendering toward a more product-like surface
- however, the next UX step is simplification, not adding more sections
- priority is now:
  - reduce repetition
  - strengthen hierarchy
  - make final synthesis and advice visually dominant
  - keep trainer mode as a deeper layer, not a duplicate of the main report

  Interview Context Engine (design phase)
- context profiling layer
- tone simulation
- person-perception signals
- question selection strategy
- question taxonomy redesign (next step)

# V2 — Training Engine Transition

Goal: generalize the interview engine into a broader content-driven training architecture.

## Training engine abstraction

Separate reusable engine parts from interview-specific parts.

Target distinction:

### Reusable
- runtime orchestration
- answer recording
- adaptive follow-up logic
- report shell
- answer annotation contract
- trainer mode concepts
- annotation normalization
- annotation-driven rendering

### Interview-specific
- CV parser
- role parser
- job fit analysis
- interview question families
- interview follow-up packs

### Status
**Concept active, first implementation signals now present**

The new answer annotation layer is the first serious reusable piece pointing toward the broader training engine.

## Structured annotation module

Build a true post-session annotation system capable of marking:
- strengths
- weaknesses
- evidence
- genericity
- ownership
- improvement opportunities

Target output:
- span-based or position-based annotations
- suitable for colored review in trainer mode

### Status
**Started and working first version**

Implemented:
- annotation schema note
- annotation JSON schema
- prompt builder
- Groq answer annotation runner
- single-answer annotation
- session-wide annotation
- normalization and guardrails
- rendering in trainer mode

Still to refine:
- reduce generic coaching language
- make annotations more answer-quality-focused
- make improved drafts safer and more useful
- improve visual clarity in UI

## Domain-specific training parsers

Future architecture should support:
- interview parser
- manual / procedural parser
- sales training parser
- leadership / management parser
- future book/document parser

The idea is that a training tool could ingest freer knowledge sources and self-configure training flows through parser specialization.

### Status
Concept defined, implementation not started

## Content-driven training ingestion

Long-term idea:
- ingest semi-structured or freer training sources
- identify concepts, processes, examples, rules, and checks
- auto-generate question sets, scenarios, and coaching logic

Possible sources:
- manuals
- guides
- playbooks
- books
- internal documentation

### Status
Concept defined, implementation not started

---

# V3 — Platform Layer

Goal: transform the simulator / trainer into a persistent platform.

## User system
- user accounts
- authentication
- session storage

## Session history
- previous interviews
- comparison of attempts
- improvement tracking

## CV upload
- PDF upload
- automatic CV parsing
- profile extraction

## Recruiter mode
- recruiter interview simulations
- alternative evaluation perspective

## Dashboard
- user dashboard
- interview progress tracking
- training progress tracking

## Audio layer (future)
- voice input
- speech analysis

### Status
Not started

---

## Latest product/UI update

A major shell simplification and hierarchy refactor has now been completed in the local interactive browser shell.

### Newly integrated improvements
- stronger top summary / coach dashboard structure
- reduced duplication between summary and trainer details
- compact interview map with collapsible answer cards
- stronger visual separation of opened answer cards
- stronger distinction between:
  - positive answer signals
  - critical answer signals
- highlighted coach-tip area
- highlighted improved-answer area
- restored annotated text rendering in trainer review
- restored metric tooltips in performance snapshot

### Current product conclusion
The shell is now substantially closer to a coach dashboard and farther from a debug viewer.

The current UI is considered:
- meaningfully improved
- more usable for product validation
- still not final

### Still open in V1 preview layer
- move the short “how to read this report” explanation nearer to the top of the page
- make `Aderenza` wording explicit:
  - e.g. `Aderenza profilo–ruolo`
- close the remaining report localization leak where one recurring strength still appears in English
- keep improving coaching quality so answer feedback stays answer-focused rather than drifting toward broad career advice

### Current bug under active investigation
A recurring-strength label is still leaking in English into the final shell.

Observed example:
- `The answer provides evidence or outcome-oriented support.`

This was confirmed to already exist in the generated interview-report JSON, which means:
- the bug is upstream of the renderer
- the active investigation is inside report collection / relocalization logic

Primary file under current investigation:
- `src/interview/collectInterviewReport.js`

Secondary file checked:
- `src/interview/buildFinalCandidateReport.js`

### Near-future product feature candidate
A highly plausible future feature has been identified:
- selectable interview length at session start

Candidate options:
- short
- standard
- deep

This is considered valuable for usability and adoption, but not the immediate next task.
The localization leak and dashboard explanation clarity remain higher priority.

---

## Latest technical milestone

The remaining locale inconsistency in answer-shape analysis has been fixed.

### Closed issue
A recurring-strength string was still leaking in English into the final shell.

### Actual root cause
The issue was traced to:
- `src/interview/analyzeAnswerShape.js`

The module was returning English answer-shape outputs despite the active locale being `it`.

### Fix completed
`analyzeAnswerShape.js` was fully replaced so that:
- locale resolution is explicit and robust
- answer-shape strings are pulled from the resolved locale copy directly
- the analysis output is now aligned with the configured app locale

### Current result
The full shell now renders with much stronger Italian consistency.

### Next likely UI refinements
- clarify fit wording at top level:
  - `Aderenza profilo–ruolo`
- move brief reading guidance higher in the page hierarchy
- later explore selectable interview length:
  - short / standard / deep

 ---

## Latest contextual engine implementation milestone

A first implemented prototype of the context-aware interview engine has now been completed.

### Newly implemented prototype flow
The system can now run the following experimental flow:

- derive interview context from parser outputs
- load a structured pilot question bank
- rank structured questions by contextual suitability
- derive a question selection strategy
- resolve tone-aware prompt variants
- assemble a structured interview preview

This means the following prototype modules now exist conceptually and in code:

- `deriveInterviewContextProfile`
- `loadStructuredQuestionBank`
- `rankStructuredQuestions`
- `deriveQuestionSelectionStrategy`
- `selectQuestionToneVariant`
- `buildStructuredInterviewPreview`

### Current result
A first end-to-end contextual preview can now be generated successfully.

This preview is still parallel to the legacy interview engine and does not yet replace the active session composer,
but it proves that the architectural direction is implementable.

### What this milestone validates
This milestone validates:

- context-aware question ranking
- tone-aware question resolution
- structured question-object architecture
- separation between context derivation, selection strategy, and final prompt resolution

### Current limitation
The current structured question bank is still only a pilot set.

It is sufficient for architecture validation,
but not yet sufficient for full realistic contextual coverage.

The current gap is especially visible for:
- lead / senior roles
- leadership-oriented questioning
- decision-tradeoff validation
- ambiguity management
- accountability under pressure

### Next recommended step
Before integrating the contextual engine into the real legacy runtime,
the next best step is:

- expand `question_bank_v2.json` with a small second wave of structured questions

Suggested next additions:
- `leadership_scope`
- `decision_tradeoffs`
- `ambiguity_management`
- `accountability_examples`
- `pressure_handling`

### Strategic conclusion
The project now has:

- a working legacy MVP engine
- a working contextual engine prototype path

The next phase should focus on:
1. strengthening the structured question bank
2. refining contextual coverage
3. only after that, planning controlled integration into the main interview composer

## 🚀 Contextual Interview Engine – Next Steps

### Fase completata

✔ Prototipo v2 implementato  
✔ Question bank strutturato (10 domande)  
✔ Strategia di selezione contestuale  
✔ Supporto multi-lingua  
✔ Preview coerente per profili senior/lead  

---

### Fase successiva (priorità alta)

#### 1. Espansione Question Bank

Aggiungere nuove domande per coprire:

- delegation & team leverage
- stakeholder persuasion / influence
- conflict escalation
- ownership vs execution
- prioritization trade-offs complessi

Target: +5 / +10 domande

---

#### 2. Scenario comparison

Testare il comportamento del motore su:

- profilo `junior + supportive`
- profilo `lead + incisive`
- profilo `consultancy_client_facing + pressure`

Obiettivo:
→ verificare che il sistema cambi realmente “personalità”

---

#### 3. Refinement strategy (facoltativo)

Possibili miglioramenti:

- weighting dinamico per category
- variazione numero domande per seniority
- inserimento “pattern di intervista” (es. stress interview)

---

### Fase successiva (integrazione)

#### 4. Integrazione nel motore principale

Step graduali:

1. usare `deriveInterviewContextProfile` nel flow reale
2. affiancare selection strategy al sistema attuale
3. introdurre progressive override del composer

---

### Visione

Obiettivo finale:

un motore che non genera solo domande, ma:

- simula **stili di intervista diversi**
- adatta tono e pressione
- costruisce una percezione coerente del candidato

In altre parole:
non un questionario, ma un **intervistatore simulato**

---

## Latest validation milestone — scenario comparison confirms behavioral differentiation

A dedicated comparison of multiple interview scenarios has now been completed for the contextual engine prototype.

### Scenarios compared
The following scenarios were tested side by side:

- junior / corporate_structured / supportive
- lead / corporate_structured / incisive
- senior / consultancy_client_facing / pressure

### Validation outcome
The comparison confirmed that the contextual engine is not only changing prompt wording.
It is also changing:

- question emphasis
- interviewer pressure level
- evaluation posture
- perceived interview style

This is a major validation milestone because it confirms that the system is starting to simulate distinct interviewer behaviors rather than only distinct prompt texts.

### Most important observed outcome
The system now produces meaningfully different previews such as:

#### Junior / supportive
- more potential-oriented
- gentler
- more learning / initiative focused

#### Lead / incisive
- more accountability-oriented
- more decision-quality oriented
- more scope-validating

#### Consultancy / pressure
- more skeptical
- more stress-oriented
- more pressure-testing

### Technical milestone included in this phase
A bug was identified and fixed in preview generation:

- `buildStructuredInterviewPreview.js`

Fix:
- `seniorityQuestionKeys` are now correctly included in the final preview timeline

This restored full strategy-to-preview coherence.

### Current product conclusion
The contextual engine prototype is now validated at three levels:

1. architecture level
2. pipeline level
3. behavioral differentiation level

This makes it a serious candidate for future integration into the main interview engine,
but not yet the immediate next step.

### New recommended priority order

#### Priority 1
Refine junior strategy behavior so that lower-seniority paths more strongly favor:
- learning
- initiative
- potential
- coachability

#### Priority 2
Expand the structured bank with:
- more junior/potential questions
- more pressure variants
- more consultancy-sensitive prompts

#### Priority 3
Re-run scenario comparison after those additions

#### Priority 4
Only after that, plan controlled integration into the legacy composer

### Strategic conclusion
The system is now demonstrably moving from:

- question selection logic

toward:

- simulated interviewer behavior

That is a major product shift and one of the strongest signals so far that the contextual engine direction is worth continuing.

---

## Latest milestone — junior/potential question expansion completed

The structured contextual engine has now been expanded with a second wave of junior/potential-oriented questions.

### New question objects added
The following structured questions were added to the v2 bank:

- `motivation_for_role`
- `feedback_application`
- `team_contribution_examples`
- `adaptability_examples`

These additions improve coverage for:
- junior / entry candidates
- supportive interview styles
- HR-relational evaluation
- potential / growth / coachability signals

### Strategy refinement completed
The selection strategy was also refined so that junior-like paths now:
- use fewer mandatory role-fit questions
- avoid over-emphasizing accountability too early
- more easily surface learning and motivation signals

### Result of rerun scenario comparison
After this update, the contextual engine now shows a stronger behavioral split across:

#### Junior / Supportive
More focused on:
- transferability
- learning
- motivation
- future potential

#### Lead / Incisive
Still focused on:
- accountability
- stakeholder conflict
- decision trade-offs
- leadership scope
- pressure handling

#### Consultancy / Pressure
Now more clearly focused on:
- stakeholder tension
- decision trade-offs under pressure
- adaptability
- pressure handling

### Product significance
This milestone improves the contextual engine in an important way:

it reduces the risk that junior interviews sound like weakened senior interviews.

Instead, junior flows now begin to feel like:
- real potential-oriented interviews
- with more realistic expectations and signals

### New open design question
A new product decision is now visible:

Should junior/supportive paths be:
- intentionally shorter
or
- equal-length but filled with more junior-specific question types?

This is not urgent, but it is now a meaningful design choice rather than an accidental consequence.

### Recommended next step
Before integrating the contextual engine into the legacy composer, the next best options are:

1. expand the bank further with:
   - more pressure variants
   - more consultancy-specific prompts
   - more junior-specific prompts
2. or explicitly define:
   - short / standard / deep interview modes

Both directions are now product-relevant.

---

## Latest milestone — consultancy / pressure branch strengthened

A new wave of structured questions has now been added to strengthen consultancy / pressure-oriented interview behavior.

### New question objects added
The following structured questions were introduced:

- `client_pushback_handling`
- `clarity_under_challenge`
- `priority_conflict_management`
- `expectation_reset`

These additions improve coverage for:
- client pushback
- skeptical challenge
- explanation under scrutiny
- expectation management
- pressure-sensitive communication

### Validation result
After this addition, the scenario comparison was rerun and confirmed a meaningful improvement in the consultancy/pressure branch.

#### Consultancy / Pressure now feels more like:
- skeptical
- demanding
- client-facing
- pressure-testing

This is a strong product improvement because the contextual engine now better simulates an interviewer who is:
- harder to convince
- more stress-oriented
- more focused on credibility under challenge

### Important side effect discovered
One new consultancy-sensitive question:
- `client_pushback_handling`

now tends to rise strongly even in some generic `corporate_structured` lead scenarios.

This is not a structural problem, but it reveals a useful refinement need:
- stronger company-context weighting
- or milder behavior of consultancy-sensitive prompts outside explicit consultancy contexts

### Current priority after this milestone
The next likely refinement is:

- adjust ranking sensitivity so that consultancy-specific prompts remain highly visible in consultancy contexts,
  but do not dominate too easily in generic corporate scenarios

### Product significance
The contextual engine is now becoming more recognizable not only across:
- junior vs senior

but also across:
- normal evaluation vs pressure-oriented evaluation

This moves the project further toward:
- simulated interviewer behavior
rather than:
- prompt selection only

---

## Latest milestone — contextual engine calibration stabilized

A final calibration pass on the contextual ranking logic has now been completed successfully.

### What was achieved
The system now separates much more cleanly between:

- junior / supportive interviews
- lead / incisive interviews
- consultancy / pressure interviews

### Key technical refinement
`rankStructuredQuestions.js` was refined so that highly consultancy-specific prompts now behave more appropriately:

- strong boost inside `consultancy_client_facing`
- stronger penalty outside consultancy contexts

This solved the previous issue where:
- `client_pushback_handling`
could rise too aggressively even in more generic corporate lead scenarios

### Final validated scenario behavior

#### Junior / Supportive
Now behaves like:
- growth-oriented
- lower-pressure
- team / learning / motivation focused

#### Lead / Incisive
Now behaves like:
- scope-validating
- accountability-oriented
- demanding but not overly consultancy-shaped

#### Consultancy / Pressure
Now behaves like:
- skeptical
- relationally difficult
- pressure-testing
- client-facing
- clarity / pushback / expectation management focused

### Current product conclusion
This milestone confirms that the contextual engine can now generate:
- differentiated interviewer posture
- differentiated pressure style
- differentiated question logic

This is a major step toward:
- simulated interviewer behavior
rather than:
- prompt variation only

### New stable status
The contextual engine prototype can now be considered:

- behaviorally differentiated
- structurally coherent
- suitable for gradual future integration

### Recommended next product choices
The next branch should now be chosen explicitly among:

#### Option A — gradual integration
Start using the contextual engine outputs inside the legacy interview composer.

#### Option B — user-facing interview modes
Introduce:
- short
- standard
- deep

and connect them to contextual selection logic.

#### Option C — further specialization
Expand the structured bank by:
- sector
- function
- role family
- interviewer style

All three directions are now realistic.
---

## Latest milestone — interview length modes added

A new product-facing control layer has now been implemented for interview depth:

- `short`
- `standard`
- `deep`

### New capability
The contextual engine now supports not only:
- different scenarios
- different tones
- different company contexts
- different seniority paths

but also:
- different interview lengths

### Technical implementation
Implemented:
- `config/interview_length_modes.json`
- `loadInterviewLengthModes.js`
- integration into `deriveQuestionSelectionStrategy.js`
- validation script:
  - `test_compare_interview_lengths.js`

### Validation outcome
The length modes were validated successfully on a `lead / corporate_structured / incisive` scenario.

Observed behavior:

#### Short
A clearly reduced flow:
- faster
- sharper
- suitable for quick simulation

#### Standard
The current default:
- balanced
- coherent
- aligned with the previously stabilized selection logic

#### Deep
A genuinely extended flow:
- more exploration
- more secondary probing
- richer simulation

### Important stability result
The introduction of interview length modes did not break the contextual engine.

The standard scenario comparison remains coherent across:
- junior / supportive
- lead / incisive
- consultancy / pressure

### Product significance
This is a major product improvement because users can now control both:
- the type of interviewer
and
- the depth of the session

This makes the engine feel more like a configurable simulation product rather than a fixed pipeline.

### New design choice emerging
A new explicit product decision is now visible:

Should junior users in `standard` mode receive:
- a naturally shorter interview
or
- a standard-length interview with one more junior-specific question?

This is not yet an issue to fix.
It is now a product behavior choice to decide explicitly later.

### Recommended next step
The next branch should now be chosen between:

#### Option A
Integrate contextual engine outputs gradually into the legacy composer.

#### Option B
Refine the behavior of `standard` mode for junior profiles.

At this stage, both are realistic next steps.
---

## Latest milestone — contextual engine integrated into real MVP session flow

A major milestone has now been reached:

the contextual interview engine is no longer only generating selection metadata.

It is now actively driving the real MVP interview flow.

### What is now contextual in the real session
The following parts of the final interview session now come from the contextual engine:

- core question blocks
- closing prompt
- interview length mode control

### Integration completed
The contextual pipeline now runs through the real MVP flow as follows:

- parser
- job fit analysis
- legacy interview plan
- contextual context profiling
- structured question ranking
- contextual selection strategy
- tone variant resolution
- real session composition using contextual questions

### Important technical fix completed
A structural issue in contextual question resolution was fixed:

Resolved questions now preserve:
- stage
- stage order
- tone used
- source

This allowed the composer to:
- separate core questions from contextual closing correctly
- avoid treating all contextual questions as generic undifferentiated blocks

### Session test updated
The full session test was recalibrated to the new contextual flow by:
- explicitly using `interviewLengthMode: "short"`
- updating the answer sequence to better match the contextual prompts

### Validation result
The end-to-end full session test now passes again with:
- requested mode: `short`
- resolved mode: `short`
- `sessionCompleted: true`

### Product significance
This milestone is a major transition point.

The project has now moved from:
- contextual engine alongside the MVP

toward:
- contextual engine inside the MVP

This means FRINGE is now closer to:
- real contextual interview simulation
rather than:
- legacy interview flow with experimental side modules

### New likely next priorities
The next branch should now be chosen between:

#### Option A — stabilize and clean presentation
- improve local shell labels for contextual stages
- reduce remaining legacy summary artifacts
- improve readability of contextual question categories

#### Option B — adaptive contextual intelligence
- make adaptive follow-up selection aware of:
  - contextual stage
  - tone
  - interview length mode

#### Option C — further product controls
- expose interview length more explicitly in future UI
- later expose tone selection as a user-facing control

At this stage, the contextual engine can be considered part of the real working MVP.