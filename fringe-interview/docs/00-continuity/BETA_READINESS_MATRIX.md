# IMAGO Beta Readiness Matrix

**Target:** Private Beta settembre 2026
**Primary application:** IMAGO Interview

| Area | Stato stimato | Necessaria per Beta | Decisione |
|---|---:|---|---|
| Core epistemico | 93% | Sì | Congelare salvo blocker |
| Evidence → MeasurementResult | 95% | Solo se usato dalla Beta | Nessun hardening automatico |
| Ledger → Snapshot | 92% | Solo se usato dalla Beta | Congelare |
| Capability Execution | 90% | Dipende dall’integrazione | Congelare dopo E-42 |
| Derived Dimension State | 80% | Da verificare | E-44 non automatico |
| Interview Runtime storico | 85% | Sì | Verifica end-to-end |
| Beta Session / resume | 82% | Sì | Verifica operativa |
| Professional Perception | 85% | Sì | Calibrazione reale |
| CV Review / Optimization | 75% | Valore alto | Definire scope |
| Professional Identity persistente | 35% | Sì, forma minima | Definire MVP |
| Report finale | 85% | Sì | Evidenze + 3 azioni |
| Role Family / Target | 65% | Sì, scope limitato | Scegliere 2–3 famiglie |
| Onboarding | 80% | Sì | Fondazione M1-04 completata; integrare nella UI |
| Error handling | 75% | Sì | Fondazione M1-03 completata; verificare integrazione UI |
| Privacy e consenso | 75% | Sì | Fondazione M1-05 completata; validazione legale e integrazione UI ancora necessarie |
| Feedback | 75% | Sì | Fondazione M1-06 completata; integrare nella UI e definire raccolta operativa |
| Operational logging | 75% | Sì | Fondazione M1-07 e runbook manuale completati; persistenza e observability di produzione escluse |
| Logging e runbook | 35% | Sì | Minimo |
| Domini dinamici | Visione | No | Post-Beta |
| Matrix / Coverage nel prodotto | 45% | No, salvo dipendenza | Post-Beta |
| Provider multipli | 20% | No | Post-Beta |

## Blocker Beta

1. Percorso end-to-end verificato.
2. Professional Identity minima e riuso dei dati.
3. Report calibrato su profili reali.
4. Integrazione UI della gestione errori M1-03.
5. Integrazione UI e validazione legale della fondazione privacy/consenso M1-05.
6. Integrazione UI e raccolta operativa del feedback M1-06.
7. Golden-ID regression risolta prima del freeze.
8. Scope esplicito di famiglie e funzionalità.

## Alto valore / basso costo

- sintesi “cosa ricorderà il recruiter”;
- evidenze collegate alle conclusioni;
- tre azioni finali;
- insufficienza dati dichiarata;
- feedback per sezione;
- revisione umana dei primi report;
- dashboard beta semplice.

7. Integrare il sink operativo M1-07 nell'ambiente Beta reale senza ampliare i dati raccolti.

## BI-01 integration status — 2026-08-07

- Canonical Beta journey integration: implemented.
- Onboarding → consent → authorised material use → Interview Runtime → Professional Perception report → optional feedback: integrated.
- Operational logging: integrated at experience start/completion and safe failure/interruption boundaries; sink remains failure-safe and minimized.
- Professional Identity dated snapshot: explicit capability gap; no persistence is simulated.
- Voice: unavailable in the current Application path; text is the supported BI-01 mode.
- Remaining Beta Experience Validation blocker: prove the integrated path with the real Beta environment/material/provider configuration and resolve or explicitly scope the Professional Identity snapshot requirement.

## ME-01 real environment validation status — 2026-08-13

- Verdict: **C — REAL BETA JOURNEY BLOCKED** in the supplied repository/environment.
- BI-01 deterministic integration remains green and the real-material consent guard is verified.
- Blocker 1 — baseline configuration package is absent: the real parser/runtime path cannot start because required `config/*.json` files are missing.
- Blocker 2 — the real Groq provider is not configured in the validation environment (`GROQ_API_KEY` absent); no provider call can be validated until environment configuration is supplied.
- Blocker 3 — the historical HTML shell/report renderer does not consume `runIntegratedPrivateBetaJourney`; the canonical BI-01 flow currently has no real tester-facing entry point in this baseline.
- Added realistic CV/JD and parser expected-output fixtures only to restore reproducible material-level validation; parser mock remains blocked upstream by missing canonical config.
- Known non-blocking gaps remain unchanged: voice subsystem unavailable; Professional Identity dated snapshot unavailable.
- Integrated interruption is observable, while resume exists at Beta Session/Runtime level but is not exposed by the canonical BI-01 orchestrator.
- Next work must remove the three environment/integration blockers above before ME-02 value-proof implementation is treated as Beta-environment validated.

## ME-01B real UI journey integration status — 2026-08-13

- Canonical tester-facing entry point: `scripts/run_private_beta_ui_server.js` → `src/app/privateBetaUiServer.js` → `runPrivateBetaUiJourneyEntryPoint` → `runIntegratedPrivateBetaJourney`.
- The entry point uses the existing BI-01 orchestrator; no second journey state machine was introduced.
- Onboarding choices, consent, materials, text interview answers, Professional Perception report result, optional feedback, session closure and M1-07 operational logging are reachable through one application flow.
- UI material fields are gated/disabled unless consent is accepted; the application adapter additionally preserves BI-01 lazy material access, and tests prove refused consent does not read CV/JD getters.
- New tester-visible copy is externalized in `config/private_beta_ui.it.json` / `.en.json`; no new visible strings are embedded in the renderer.
- Historical interactive shell/report flow remains in the repository as legacy/demo debt but is no longer the canonical ME-01B Beta entry point.
- Live-provider validation was not executed because `GROQ_API_KEY` is not available in the Builder environment; this is an environment limitation, not a repository/product blocker.
- Known gaps remain non-blocking for ME-01B: voice unavailable; Professional Identity dated snapshot unavailable; integrated resume is not exposed by the new entry point.

## ME-01C live UI journey diagnostic status — 2026-08-14

- Verdict: **C — LIVE UI INTERVIEW JOURNEY STILL BLOCKED**.
- Repository diagnosis confirms the runtime already owns a canonical `currentStep`/question before an answer is accepted; the missing question in `/private-beta` is not a Runtime capability gap.
- ME-01B currently collects a pre-baked list of answers and passes it once to `runIntegratedPrivateBetaJourney` / `runFringeInterviewMVPSession`; the UI never receives the Runtime `currentStep` between answers.
- Therefore the missing Question→Answer loop and the inability to claim a genuinely live Interview journey share the same application integration boundary: BI-01/session execution is batch-oriented at the UI boundary even though the underlying Interview Runtime is stepwise.
- The previously observed `SERVICE_UNAVAILABLE` cannot be attributed to missing questions: M1-03 emits that code only for provider/network/timeout/5xx-like technical failures. Historical live evidence already demonstrates Groq/parser/MVP/Professional Perception availability. The safe boundary intentionally discarded the exact technical cause in that run.
- ME-01C adds a server/test-only diagnostic hook at the UI model-adapter boundary that records only provider task + coarse failure kind; it never records prompts, CV/JD, answers, secrets or raw exception text. A subsequent live run can identify the failing provider subtask without weakening M1-03.
- No static questionnaire or second Interview orchestrator was introduced. A real staged UI needs a minimum canonical prepare/current-question/submit-answer/next-question/finalize application boundary built over the existing Runtime, then BI-01 continuation to report/feedback/closure.
- Known non-blocking gaps remain unchanged: voice unavailable; Professional Identity dated snapshot unavailable; integrated resume not exposed in the UI.

## ME-01D staged canonical interview UI integration — 2026-08-14

- Verdict: **B — STAGED LIVE INTERVIEW JOURNEY INTEGRATED WITH NON-BLOCKING GAPS**.
- `/private-beta` now prepares the authorized interview, renders the authoritative Runtime `currentStep` question, submits exactly one answer, advances through `advanceInterviewRuntime`, and renders the next/adaptive Runtime question.
- The same server-side staged state preserves the canonical Beta Session and Runtime across successive HTTP requests; the browser receives only an opaque session reference and safe UI state.
- On Runtime completion the existing report builders are consumed, then feedback is offered, then session closure/logging completes.
- Consent remains before CV/JD reads. Operational/diagnostic logging does not contain CV, JD, answers, prompts or secrets.
- Existing BI-01 batch behavior remains green. The staged boundary is re-exported by the BI-01 application module; no UI-side question generator or second Interview state machine was introduced.
- `GROQ_API_KEY` is unavailable in the Builder environment. Deterministic integration is PASS; previously supplied live evidence remains authoritative for Groq parser/MVP/Professional Perception. One local live staged smoke test remains recommended after overlay application.
- Known non-blocking gaps remain: voice unavailable, Professional Identity persistent snapshot unavailable, broad tester-facing resume deferred.

## ME-02 Representation Value Proof Projection — 2026-08-15

- Authorized post-ME-01D live evidence records **LIVE SMOKE TEST PASS** for `/private-beta` with real Groq, real CV, staged Runtime questions, completed Professional Perception report and experience completion.
- ME-02 adds a non-persistent downstream `representation_value_proof_projection`; it consumes the existing Professional Perception `whoEmerges`, `credibilityAssets`, visible/under-visible signals, `perceptionGap`, target-distance narrative and target role without creating a second Representation/Evidence/Knowledge source of truth.
- The Beta report now presents 2–4 primary claims with progressive disclosure for why the claim emerges, supporting derived signals, insufficient observation and limited target relation. Internal source references remain test-visible but are not rendered as primary user content.
- No global person/match score, new confidence model, persistent Emergent Characterization, Core contract or snapshot semantics were introduced.
- Limitation: the live Beta reporting pipeline does not currently carry the Core Evidence Store/Knowledge Ledger/PersonKnowledgeMatrix into claim-specific Professional Perception output. ME-02 therefore uses only explicit report-level derived signals/gaps as evidence and does not fabricate claim-to-raw-evidence relevance. Richer evidence trust/validation remains downstream.
- Builder environment has no `GROQ_API_KEY`; deterministic regressions are green and the authorized post-ME-01D live smoke evidence is retained. A local post-overlay smoke should confirm the new Value Proof rendering with the real provider.

## ME-02B — Representation claim quality + repeat-interview diagnostic — 2026-08-15

- Live ME-02 evaluation confirmed the Value Proof is technically present but exposed repetitive claims, repeated signal lists and overly coarse insufficient-observation wording.
- ME-02B refines the downstream projection without changing Core contracts: semantic claim consolidation, non-tautological evidence selection, and bounded professional-history context distinguish historically supported domains from depth/specialization that remains insufficiently characterized.
- The live optics finding is covered by deterministic regression: multi-source professional-history support is preserved without asserting certified mastery.
- Repeat-interview diagnostic: question ranking/selection is deterministic when candidate/target and inputs are unchanged. Existing `recentQuestionKeys` / `recentQuestionHistory` avoidance capability is implemented in question ranking/selection, but `runFringeInterviewMVP` does not receive or forward previous-session history.
- Repeat-interview status: **EXISTING VARIATION CAPABILITY NOT YET CONSUMED**. Enabling meaningful cross-session variation requires a separately authorized session-history handoff; ME-02B does not add persistent interview memory or a second planner.
- Existing Knowledge Coverage / Opportunity / Acquisition architecture leaves a compatible future path for progressive acquisition, but that cross-session loop is not wired into Interview planning in this task.

## ME-02C — Repeat Interview Variation Integration — 2026-08-15

- Verdict: **B — REPEAT INTERVIEW VARIATION INTEGRATED WITH NON-BLOCKING GAPS**.
- ME-02B diagnosis is now consumed: `recentQuestionKeys` and `recentQuestionHistory` are forwarded through the existing MVP/session/question-selection path; no second Interview Planner, random shuffle or question-generation redesign was introduced.
- The Private Beta UI server owns a temporary process-local recent-question store keyed by an opaque `HttpOnly`, `SameSite=Lax` Beta repeat-context cookie. This is explicitly Beta-specific technical memory, not Professional Identity, Representation, Knowledge persistence or long-term candidate history.
- Only canonical question identity metadata from successfully answered/shown Runtime steps is retained (`key`, category/family context and expected-signal labels). CV, JD, answers, prompts and provider payloads are not retained for variation.
- History is updated after a successful answer, so planned/unseen questions are not marked consumed. If a session is interrupted after answered questions, those answered questions may still guide the next simulation in the same process/browser context.
- A successive simulation in the same Beta browser context receives recent question history; unrelated browser contexts receive distinct opaque context IDs and do not share history accidentally.
- The mechanism is process-local and disappears on server restart. It deliberately does not define future canonical cross-session Representation/Knowledge memory.
- Existing ranking remains deterministic: no history preserves the prior baseline; supplied recent history changes eligible ranking when alternatives exist, while canonical relevance can still permit legitimate repetition.
- ME-02B Representation Value Proof behavior remains green. Builder has no live-provider secret; local post-overlay smoke test with the configured Groq environment remains required to validate real successive Simulation A/B behavior.
