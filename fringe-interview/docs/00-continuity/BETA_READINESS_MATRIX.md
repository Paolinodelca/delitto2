# IMAGO Beta Readiness Matrix

**Target:** Private Beta settembre 2026
**Primary application:** IMAGO Interview

| Area | Stato stimato | Necessaria per Beta | Decisione |
|---|---:|---|---|
| Core epistemico | 93% | SÃ¬ | Congelare salvo blocker |
| Evidence â†’ MeasurementResult | 95% | Solo se usato dalla Beta | Nessun hardening automatico |
| Ledger â†’ Snapshot | 92% | Solo se usato dalla Beta | Congelare |
| Capability Execution | 90% | Dipende dallâ€™integrazione | Congelare dopo E-42 |
| Derived Dimension State | 80% | Da verificare | E-44 non automatico |
| Interview Runtime storico | 85% | SÃ¬ | Verifica end-to-end |
| Beta Session / resume | 82% | SÃ¬ | Verifica operativa |
| Professional Perception | 85% | SÃ¬ | Calibrazione reale |
| CV Review / Optimization | 75% | Valore alto | Definire scope |
| Professional Identity persistente | 35% | SÃ¬, forma minima | Definire MVP |
| Report finale | 85% | SÃ¬ | Evidenze + 3 azioni |
| Role Family / Target | 65% | SÃ¬, scope limitato | Scegliere 2â€“3 famiglie |
| Onboarding | 80% | SÃ¬ | Fondazione M1-04 completata; integrare nella UI |
| Error handling | 75% | SÃ¬ | Fondazione M1-03 completata; verificare integrazione UI |
| Privacy e consenso | 75% | SÃ¬ | Fondazione M1-05 completata; validazione legale e integrazione UI ancora necessarie |
| Feedback | 75% | SÃ¬ | Fondazione M1-06 completata; integrare nella UI e definire raccolta operativa |
| Operational logging | 75% | SÃ¬ | Fondazione M1-07 e runbook manuale completati; persistenza e observability di produzione escluse |
| Logging e runbook | 35% | SÃ¬ | Minimo |
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
8. Scope esplicito di famiglie e funzionalitÃ .

## Alto valore / basso costo

- sintesi â€œcosa ricorderÃ  il recruiterâ€;
- evidenze collegate alle conclusioni;
- tre azioni finali;
- insufficienza dati dichiarata;
- feedback per sezione;
- revisione umana dei primi report;
- dashboard beta semplice.

7. Integrare il sink operativo M1-07 nell'ambiente Beta reale senza ampliare i dati raccolti.

## BI-01 integration status â€” 2026-08-07

- Canonical Beta journey integration: implemented.
- Onboarding â†’ consent â†’ authorised material use â†’ Interview Runtime â†’ Professional Perception report â†’ optional feedback: integrated.
- Operational logging: integrated at experience start/completion and safe failure/interruption boundaries; sink remains failure-safe and minimized.
- Professional Identity dated snapshot: explicit capability gap; no persistence is simulated.
- Voice: unavailable in the current Application path; text is the supported BI-01 mode.
- Remaining Beta Experience Validation blocker: prove the integrated path with the real Beta environment/material/provider configuration and resolve or explicitly scope the Professional Identity snapshot requirement.

## ME-01 real environment validation status â€” 2026-08-13

- Verdict: **C â€” REAL BETA JOURNEY BLOCKED** in the supplied repository/environment.
- BI-01 deterministic integration remains green and the real-material consent guard is verified.
- Blocker 1 â€” baseline configuration package is absent: the real parser/runtime path cannot start because required `config/*.json` files are missing.
- Blocker 2 â€” the real Groq provider is not configured in the validation environment (`GROQ_API_KEY` absent); no provider call can be validated until environment configuration is supplied.
- Blocker 3 â€” the historical HTML shell/report renderer does not consume `runIntegratedPrivateBetaJourney`; the canonical BI-01 flow currently has no real tester-facing entry point in this baseline.
- Added realistic CV/JD and parser expected-output fixtures only to restore reproducible material-level validation; parser mock remains blocked upstream by missing canonical config.
- Known non-blocking gaps remain unchanged: voice subsystem unavailable; Professional Identity dated snapshot unavailable.
- Integrated interruption is observable, while resume exists at Beta Session/Runtime level but is not exposed by the canonical BI-01 orchestrator.
- Next work must remove the three environment/integration blockers above before ME-02 value-proof implementation is treated as Beta-environment validated.

## ME-01B real UI journey integration status â€” 2026-08-13

- Canonical tester-facing entry point: `scripts/run_private_beta_ui_server.js` â†’ `src/app/privateBetaUiServer.js` â†’ `runPrivateBetaUiJourneyEntryPoint` â†’ `runIntegratedPrivateBetaJourney`.
- The entry point uses the existing BI-01 orchestrator; no second journey state machine was introduced.
- Onboarding choices, consent, materials, text interview answers, Professional Perception report result, optional feedback, session closure and M1-07 operational logging are reachable through one application flow.
- UI material fields are gated/disabled unless consent is accepted; the application adapter additionally preserves BI-01 lazy material access, and tests prove refused consent does not read CV/JD getters.
- New tester-visible copy is externalized in `config/private_beta_ui.it.json` / `.en.json`; no new visible strings are embedded in the renderer.
- Historical interactive shell/report flow remains in the repository as legacy/demo debt but is no longer the canonical ME-01B Beta entry point.
- Live-provider validation was not executed because `GROQ_API_KEY` is not available in the Builder environment; this is an environment limitation, not a repository/product blocker.
- Known gaps remain non-blocking for ME-01B: voice unavailable; Professional Identity dated snapshot unavailable; integrated resume is not exposed by the new entry point.

## ME-01C live UI journey diagnostic status â€” 2026-08-14

- Verdict: **C â€” LIVE UI INTERVIEW JOURNEY STILL BLOCKED**.
- Repository diagnosis confirms the runtime already owns a canonical `currentStep`/question before an answer is accepted; the missing question in `/private-beta` is not a Runtime capability gap.
- ME-01B currently collects a pre-baked list of answers and passes it once to `runIntegratedPrivateBetaJourney` / `runFringeInterviewMVPSession`; the UI never receives the Runtime `currentStep` between answers.
- Therefore the missing Questionâ†’Answer loop and the inability to claim a genuinely live Interview journey share the same application integration boundary: BI-01/session execution is batch-oriented at the UI boundary even though the underlying Interview Runtime is stepwise.
- The previously observed `SERVICE_UNAVAILABLE` cannot be attributed to missing questions: M1-03 emits that code only for provider/network/timeout/5xx-like technical failures. Historical live evidence already demonstrates Groq/parser/MVP/Professional Perception availability. The safe boundary intentionally discarded the exact technical cause in that run.
- ME-01C adds a server/test-only diagnostic hook at the UI model-adapter boundary that records only provider task + coarse failure kind; it never records prompts, CV/JD, answers, secrets or raw exception text. A subsequent live run can identify the failing provider subtask without weakening M1-03.
- No static questionnaire or second Interview orchestrator was introduced. A real staged UI needs a minimum canonical prepare/current-question/submit-answer/next-question/finalize application boundary built over the existing Runtime, then BI-01 continuation to report/feedback/closure.
- Known non-blocking gaps remain unchanged: voice unavailable; Professional Identity dated snapshot unavailable; integrated resume not exposed in the UI.

## ME-01D staged canonical interview UI integration â€” 2026-08-14

- Verdict: **B â€” STAGED LIVE INTERVIEW JOURNEY INTEGRATED WITH NON-BLOCKING GAPS**.
- `/private-beta` now prepares the authorized interview, renders the authoritative Runtime `currentStep` question, submits exactly one answer, advances through `advanceInterviewRuntime`, and renders the next/adaptive Runtime question.
- The same server-side staged state preserves the canonical Beta Session and Runtime across successive HTTP requests; the browser receives only an opaque session reference and safe UI state.
- On Runtime completion the existing report builders are consumed, then feedback is offered, then session closure/logging completes.
- Consent remains before CV/JD reads. Operational/diagnostic logging does not contain CV, JD, answers, prompts or secrets.
- Existing BI-01 batch behavior remains green. The staged boundary is re-exported by the BI-01 application module; no UI-side question generator or second Interview state machine was introduced.
- `GROQ_API_KEY` is unavailable in the Builder environment. Deterministic integration is PASS; previously supplied live evidence remains authoritative for Groq parser/MVP/Professional Perception. One local live staged smoke test remains recommended after overlay application.
- Known non-blocking gaps remain: voice unavailable, Professional Identity persistent snapshot unavailable, broad tester-facing resume deferred.

## ME-02 Representation Value Proof Projection â€” 2026-08-15

- Authorized post-ME-01D live evidence records **LIVE SMOKE TEST PASS** for `/private-beta` with real Groq, real CV, staged Runtime questions, completed Professional Perception report and experience completion.
- ME-02 adds a non-persistent downstream `representation_value_proof_projection`; it consumes the existing Professional Perception `whoEmerges`, `credibilityAssets`, visible/under-visible signals, `perceptionGap`, target-distance narrative and target role without creating a second Representation/Evidence/Knowledge source of truth.
- The Beta report now presents 2â€“4 primary claims with progressive disclosure for why the claim emerges, supporting derived signals, insufficient observation and limited target relation. Internal source references remain test-visible but are not rendered as primary user content.
- No global person/match score, new confidence model, persistent Emergent Characterization, Core contract or snapshot semantics were introduced.
- Limitation: the live Beta reporting pipeline does not currently carry the Core Evidence Store/Knowledge Ledger/PersonKnowledgeMatrix into claim-specific Professional Perception output. ME-02 therefore uses only explicit report-level derived signals/gaps as evidence and does not fabricate claim-to-raw-evidence relevance. Richer evidence trust/validation remains downstream.
- Builder environment has no `GROQ_API_KEY`; deterministic regressions are green and the authorized post-ME-01D live smoke evidence is retained. A local post-overlay smoke should confirm the new Value Proof rendering with the real provider.

## ME-02B â€” Representation claim quality + repeat-interview diagnostic â€” 2026-08-15

- Live ME-02 evaluation confirmed the Value Proof is technically present but exposed repetitive claims, repeated signal lists and overly coarse insufficient-observation wording.
- ME-02B refines the downstream projection without changing Core contracts: semantic claim consolidation, non-tautological evidence selection, and bounded professional-history context distinguish historically supported domains from depth/specialization that remains insufficiently characterized.
- The live optics finding is covered by deterministic regression: multi-source professional-history support is preserved without asserting certified mastery.
- Repeat-interview diagnostic: question ranking/selection is deterministic when candidate/target and inputs are unchanged. Existing `recentQuestionKeys` / `recentQuestionHistory` avoidance capability is implemented in question ranking/selection, but `runFringeInterviewMVP` does not receive or forward previous-session history.
- Repeat-interview status: **EXISTING VARIATION CAPABILITY NOT YET CONSUMED**. Enabling meaningful cross-session variation requires a separately authorized session-history handoff; ME-02B does not add persistent interview memory or a second planner.
- Existing Knowledge Coverage / Opportunity / Acquisition architecture leaves a compatible future path for progressive acquisition, but that cross-session loop is not wired into Interview planning in this task.

## ME-02C â€” Repeat Interview Variation Integration â€” 2026-08-15

- Verdict: **B â€” REPEAT INTERVIEW VARIATION INTEGRATED WITH NON-BLOCKING GAPS**.
- ME-02B diagnosis is now consumed: `recentQuestionKeys` and `recentQuestionHistory` are forwarded through the existing MVP/session/question-selection path; no second Interview Planner, random shuffle or question-generation redesign was introduced.
- The Private Beta UI server owns a temporary process-local recent-question store keyed by an opaque `HttpOnly`, `SameSite=Lax` Beta repeat-context cookie. This is explicitly Beta-specific technical memory, not Professional Identity, Representation, Knowledge persistence or long-term candidate history.
- Only canonical question identity metadata from successfully answered/shown Runtime steps is retained (`key`, category/family context and expected-signal labels). CV, JD, answers, prompts and provider payloads are not retained for variation.
- History is updated after a successful answer, so planned/unseen questions are not marked consumed. If a session is interrupted after answered questions, those answered questions may still guide the next simulation in the same process/browser context.
- A successive simulation in the same Beta browser context receives recent question history; unrelated browser contexts receive distinct opaque context IDs and do not share history accidentally.
- The mechanism is process-local and disappears on server restart. It deliberately does not define future canonical cross-session Representation/Knowledge memory.
- Existing ranking remains deterministic: no history preserves the prior baseline; supplied recent history changes eligible ranking when alternatives exist, while canonical relevance can still permit legitimate repetition.
- ME-02B Representation Value Proof behavior remains green. Builder has no live-provider secret; local post-overlay smoke test with the configured Groq environment remains required to validate real successive Simulation A/B behavior.

## AR-02 Runtime Answer â†’ IMAGO Evidence/Knowledge Integration â€” 2026-08-16

- AR-01 finding remains confirmed: accepted Runtime answers previously stopped in the interview-local answer/coverage path and did not enter IMAGO Core Evidence/Knowledge.
- AR-02 now registers only **accepted authoritative Runtime answers** into the canonical Evidence contract, preserving Beta Session, Interview Session, question/currentStep context, answer order and accepted timestamp provenance.
- Canonical progression beyond Evidence is **blocked**: existing Registered Evidence â†’ Observation construction requires an explicit Measurement plus exact construction rules for a known characteristic. The repository has no authorized semantic mapping from arbitrary Interview answer content to domain/responsibility characteristics such as stakeholder management, budget ownership boundary, cost awareness or software collaboration.
- The historical Groq Answer Annotation subsystem was not reused because its schema is coaching/answer-quality oriented (`concreteness`, `specificity`, `evidence`, `ownership`, `structure`, `clarity`, `reflection`, `generic`) and does not preserve the professional semantic assertions required by AR-02.
- Therefore Observation/Measurement, Knowledge Ledger/Snapshot, PersonKnowledgeMatrix and Knowledge Coverage remain unchanged by live Interview answers. AR-03 must not consume Coverage as if this integration were complete.
- AR-04 remains downstream: Professional Perception/Value Proof still do not consume canonical Interview-derived knowledge.
- Required next boundary: an authority-compatible semantic Evidence â†’ Observation mapping for Interview answers, reusing existing Observation/Measurement/Knowledge contracts without direct Representation or Coverage writes.

## PA-02 Minimal Professional Semantic Mapping Authority â€” 2026-08-16

- Verdict: **B â€” MINIMAL SEMANTIC AUTHORITY ADDED**.
- Product Authority now defines a small descriptive professional semantic grammar rather than a competency catalogue: context-scoped action/contribution, object/domain, professional relationship, responsibility/accountability scope, context, outcome and Evidence provenance.
- `PD-024` authorizes context-scoped professional relationship Observation without automatically establishing a stable person characteristic.
- `PD-025` separates participation/collaboration/contribution/influence from ownership/decision/accountability and defines explicit contextual non-ownership as positive contextual knowledge rather than deficiency.
- `PD-026` establishes that domain proximity, collaboration or contribution does not itself establish specialist competence.
- `PD-027` establishes the Observation â†’ elementary Knowledge â†’ derived/Dynamic Characterization epistemic boundary and preserves insufficient observation as distinct from absence.
- `OBS-007â€¦OBS-010` remain unchanged and reusable as source professional Observation types. `decision_accountability` remains bounded to its existing decision-responsibility semantics.
- Existing Core contracts are not modified. Their generic Observation/Measurement/Dimension/Knowledge machinery is structurally reusable, but AR-02A must implement the newly authorized semantics through explicit policy/mapping rather than question labels, lexical matching or a new competency catalogue.
- AR-02A may now be reopened. AR-03 and AR-04 remain unauthorized until AR-02A proves at least one real Interview Evidence item reaches canonical Knowledge/PKM/Coverage with the new semantic scope preserved.

## GM-01 Groq Model Migration & Provider Compatibility Boundary — 2026-08-19

- Verdict: **B — GROQ MIGRATION IMPLEMENTED, LOCAL LIVE VALIDATION REQUIRED**.
- `llama-3.3-70b-versatile` was decommissioned on 2026-08-16 and is no longer a production default. The canonical Groq default is now `openai/gpt-oss-120b` in one Infrastructure compatibility module; `GROQ_MODEL` remains an explicit override.
- Parser, Answer Annotation and Professional Perception Groq adapters now delegate request construction/model compatibility to one Infrastructure boundary instead of independently knowing model defaults or request quirks.
- Current parser tasks (`candidateProfile`, `roleProfile`, `jobFitAnalysis`) and structured interview/report tasks use JSON Object Mode. This addresses the supplied GPT-OSS JobFitAnalysis symptom at the output-contract boundary without changing existing semantic schemas. Adaptive/gap-driven question generation remains text mode.
- Existing Answer Annotation and Professional Perception JSON Schemas are not strict-mode compatible as written (`additionalProperties:false` is not consistently declared and Professional Perception contains optional properties), so GM-01 does not distort them. The boundary supports strict JSON Schema for a future caller only when the caller explicitly supplies a strict-compatible canonical schema.
- No hidden model fallback exists. Provider errors expose only task/model/coarse status through errors and do not log API keys, prompts, CV/JD, answers, response bodies or reasoning.
- Builder has no `GROQ_API_KEY`; deterministic compatibility, parser mock, staged Beta and full health checks pass. Live provider validation remains required for CandidateProfile, RoleProfile, JobFitAnalysis, full MVP/adaptive follow-up, Professional Perception and Answer Annotation.
- AR-02A remains deferred until that live validation succeeds.

## GM-01A Groq 400 Diagnostic + Answer Annotation Compatibility Fix — 2026-08-19

- GM-01 live validation supplied with this task remains: CandidateProfile PASS, RoleProfile PASS, JobFitAnalysis PASS, full FRINGE MVP session PASS, Professional Perception Groq PASS on `openai/gpt-oss-120b`; the observed 429 was a Free Plan TPM-window event, not a compatibility regression.
- The historical Answer Annotation HTTP 400 response body cannot be recovered retroactively because the pre-GM-01A shared client discarded it. Builder has no `GROQ_API_KEY`, so the exact historical provider message remains pending one local live reproduction.
- GM-01A adds sanitized provider diagnostics containing only task, model, HTTP status, whitelisted provider code/type, normalized safe message, retry-after and coarse failure kind. Raw provider bodies, prompts, candidate answers, generated completion and secrets are not attached to errors.
- Answer Annotation now supplies its existing canonical schema to the centralized compatibility boundary. For GPT-OSS the boundary selects native strict JSON Schema and adds only provider-structural `additionalProperties:false` recursively; all existing required fields, types and enums are preserved. Other structured tasks retain their GM-01 JSON Object Mode contracts; text tasks remain text.
- GPT-OSS structured requests suppress returned reasoning with `include_reasoning:false`; no hidden reasoning is stored or exposed.
- HTTP 429/5xx retry behavior is preserved; `retry-after` is honored when numeric. Non-retryable 400 is not retried. Transport connect-timeout retry remains unchanged/not added in GM-01A.
- Deterministic GM-01A compatibility/security tests PASS; parser mock PASS; staged Beta application/UI PASS; full FRINGE health check PASS.
- Local live validation still required: `GROQ_MODEL=openai/gpt-oss-120b node scripts/test_answer_annotation_runner_groq.js`. A PASS closes the remaining Answer Annotation provider-validation gate; if it fails, the new sanitized `providerDiagnostic` supplies the provider classification without leaking user data.
- AR-02A remains deferred until this live provider validation closes GM-01/GM-01A.
