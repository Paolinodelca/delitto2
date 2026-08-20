# IMAGO Beta Readiness Matrix

**Target:** Private Beta settembre 2026
**Primary application:** IMAGO Interview

| Area | Stato stimato | Necessaria per Beta | Decisione |
|---|---:|---|---|
| Core epistemico | 93% | SÃƒÂ¬ | Congelare salvo blocker |
| Evidence Ã¢â€ â€™ MeasurementResult | 95% | Solo se usato dalla Beta | Nessun hardening automatico |
| Ledger Ã¢â€ â€™ Snapshot | 92% | Solo se usato dalla Beta | Congelare |
| Capability Execution | 90% | Dipende dallÃ¢â‚¬â„¢integrazione | Congelare dopo E-42 |
| Derived Dimension State | 80% | Da verificare | E-44 non automatico |
| Interview Runtime storico | 85% | SÃƒÂ¬ | Verifica end-to-end |
| Beta Session / resume | 82% | SÃƒÂ¬ | Verifica operativa |
| Professional Perception | 85% | SÃƒÂ¬ | Calibrazione reale |
| CV Review / Optimization | 75% | Valore alto | Definire scope |
| Professional Identity persistente | 35% | SÃƒÂ¬, forma minima | Definire MVP |
| Report finale | 85% | SÃƒÂ¬ | Evidenze + 3 azioni |
| Role Family / Target | 65% | SÃƒÂ¬, scope limitato | Scegliere 2Ã¢â‚¬â€œ3 famiglie |
| Onboarding | 80% | SÃƒÂ¬ | Fondazione M1-04 completata; integrare nella UI |
| Error handling | 75% | SÃƒÂ¬ | Fondazione M1-03 completata; verificare integrazione UI |
| Privacy e consenso | 75% | SÃƒÂ¬ | Fondazione M1-05 completata; validazione legale e integrazione UI ancora necessarie |
| Feedback | 75% | SÃƒÂ¬ | Fondazione M1-06 completata; integrare nella UI e definire raccolta operativa |
| Operational logging | 75% | SÃƒÂ¬ | Fondazione M1-07 e runbook manuale completati; persistenza e observability di produzione escluse |
| Logging e runbook | 35% | SÃƒÂ¬ | Minimo |
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
8. Scope esplicito di famiglie e funzionalitÃƒÂ .

## Alto valore / basso costo

- sintesi Ã¢â‚¬Å“cosa ricorderÃƒÂ  il recruiterÃ¢â‚¬Â;
- evidenze collegate alle conclusioni;
- tre azioni finali;
- insufficienza dati dichiarata;
- feedback per sezione;
- revisione umana dei primi report;
- dashboard beta semplice.

7. Integrare il sink operativo M1-07 nell'ambiente Beta reale senza ampliare i dati raccolti.

## BI-01 integration status Ã¢â‚¬â€ 2026-08-07

- Canonical Beta journey integration: implemented.
- Onboarding Ã¢â€ â€™ consent Ã¢â€ â€™ authorised material use Ã¢â€ â€™ Interview Runtime Ã¢â€ â€™ Professional Perception report Ã¢â€ â€™ optional feedback: integrated.
- Operational logging: integrated at experience start/completion and safe failure/interruption boundaries; sink remains failure-safe and minimized.
- Professional Identity dated snapshot: explicit capability gap; no persistence is simulated.
- Voice: unavailable in the current Application path; text is the supported BI-01 mode.
- Remaining Beta Experience Validation blocker: prove the integrated path with the real Beta environment/material/provider configuration and resolve or explicitly scope the Professional Identity snapshot requirement.

## ME-01 real environment validation status Ã¢â‚¬â€ 2026-08-13

- Verdict: **C Ã¢â‚¬â€ REAL BETA JOURNEY BLOCKED** in the supplied repository/environment.
- BI-01 deterministic integration remains green and the real-material consent guard is verified.
- Blocker 1 Ã¢â‚¬â€ baseline configuration package is absent: the real parser/runtime path cannot start because required `config/*.json` files are missing.
- Blocker 2 Ã¢â‚¬â€ the real Groq provider is not configured in the validation environment (`GROQ_API_KEY` absent); no provider call can be validated until environment configuration is supplied.
- Blocker 3 Ã¢â‚¬â€ the historical HTML shell/report renderer does not consume `runIntegratedPrivateBetaJourney`; the canonical BI-01 flow currently has no real tester-facing entry point in this baseline.
- Added realistic CV/JD and parser expected-output fixtures only to restore reproducible material-level validation; parser mock remains blocked upstream by missing canonical config.
- Known non-blocking gaps remain unchanged: voice subsystem unavailable; Professional Identity dated snapshot unavailable.
- Integrated interruption is observable, while resume exists at Beta Session/Runtime level but is not exposed by the canonical BI-01 orchestrator.
- Next work must remove the three environment/integration blockers above before ME-02 value-proof implementation is treated as Beta-environment validated.

## ME-01B real UI journey integration status Ã¢â‚¬â€ 2026-08-13

- Canonical tester-facing entry point: `scripts/run_private_beta_ui_server.js` Ã¢â€ â€™ `src/app/privateBetaUiServer.js` Ã¢â€ â€™ `runPrivateBetaUiJourneyEntryPoint` Ã¢â€ â€™ `runIntegratedPrivateBetaJourney`.
- The entry point uses the existing BI-01 orchestrator; no second journey state machine was introduced.
- Onboarding choices, consent, materials, text interview answers, Professional Perception report result, optional feedback, session closure and M1-07 operational logging are reachable through one application flow.
- UI material fields are gated/disabled unless consent is accepted; the application adapter additionally preserves BI-01 lazy material access, and tests prove refused consent does not read CV/JD getters.
- New tester-visible copy is externalized in `config/private_beta_ui.it.json` / `.en.json`; no new visible strings are embedded in the renderer.
- Historical interactive shell/report flow remains in the repository as legacy/demo debt but is no longer the canonical ME-01B Beta entry point.
- Live-provider validation was not executed because `GROQ_API_KEY` is not available in the Builder environment; this is an environment limitation, not a repository/product blocker.
- Known gaps remain non-blocking for ME-01B: voice unavailable; Professional Identity dated snapshot unavailable; integrated resume is not exposed by the new entry point.

## ME-01C live UI journey diagnostic status Ã¢â‚¬â€ 2026-08-14

- Verdict: **C Ã¢â‚¬â€ LIVE UI INTERVIEW JOURNEY STILL BLOCKED**.
- Repository diagnosis confirms the runtime already owns a canonical `currentStep`/question before an answer is accepted; the missing question in `/private-beta` is not a Runtime capability gap.
- ME-01B currently collects a pre-baked list of answers and passes it once to `runIntegratedPrivateBetaJourney` / `runFringeInterviewMVPSession`; the UI never receives the Runtime `currentStep` between answers.
- Therefore the missing QuestionÃ¢â€ â€™Answer loop and the inability to claim a genuinely live Interview journey share the same application integration boundary: BI-01/session execution is batch-oriented at the UI boundary even though the underlying Interview Runtime is stepwise.
- The previously observed `SERVICE_UNAVAILABLE` cannot be attributed to missing questions: M1-03 emits that code only for provider/network/timeout/5xx-like technical failures. Historical live evidence already demonstrates Groq/parser/MVP/Professional Perception availability. The safe boundary intentionally discarded the exact technical cause in that run.
- ME-01C adds a server/test-only diagnostic hook at the UI model-adapter boundary that records only provider task + coarse failure kind; it never records prompts, CV/JD, answers, secrets or raw exception text. A subsequent live run can identify the failing provider subtask without weakening M1-03.
- No static questionnaire or second Interview orchestrator was introduced. A real staged UI needs a minimum canonical prepare/current-question/submit-answer/next-question/finalize application boundary built over the existing Runtime, then BI-01 continuation to report/feedback/closure.
- Known non-blocking gaps remain unchanged: voice unavailable; Professional Identity dated snapshot unavailable; integrated resume not exposed in the UI.

## ME-01D staged canonical interview UI integration Ã¢â‚¬â€ 2026-08-14

- Verdict: **B Ã¢â‚¬â€ STAGED LIVE INTERVIEW JOURNEY INTEGRATED WITH NON-BLOCKING GAPS**.
- `/private-beta` now prepares the authorized interview, renders the authoritative Runtime `currentStep` question, submits exactly one answer, advances through `advanceInterviewRuntime`, and renders the next/adaptive Runtime question.
- The same server-side staged state preserves the canonical Beta Session and Runtime across successive HTTP requests; the browser receives only an opaque session reference and safe UI state.
- On Runtime completion the existing report builders are consumed, then feedback is offered, then session closure/logging completes.
- Consent remains before CV/JD reads. Operational/diagnostic logging does not contain CV, JD, answers, prompts or secrets.
- Existing BI-01 batch behavior remains green. The staged boundary is re-exported by the BI-01 application module; no UI-side question generator or second Interview state machine was introduced.
- `GROQ_API_KEY` is unavailable in the Builder environment. Deterministic integration is PASS; previously supplied live evidence remains authoritative for Groq parser/MVP/Professional Perception. One local live staged smoke test remains recommended after overlay application.
- Known non-blocking gaps remain: voice unavailable, Professional Identity persistent snapshot unavailable, broad tester-facing resume deferred.

## ME-02 Representation Value Proof Projection Ã¢â‚¬â€ 2026-08-15

- Authorized post-ME-01D live evidence records **LIVE SMOKE TEST PASS** for `/private-beta` with real Groq, real CV, staged Runtime questions, completed Professional Perception report and experience completion.
- ME-02 adds a non-persistent downstream `representation_value_proof_projection`; it consumes the existing Professional Perception `whoEmerges`, `credibilityAssets`, visible/under-visible signals, `perceptionGap`, target-distance narrative and target role without creating a second Representation/Evidence/Knowledge source of truth.
- The Beta report now presents 2Ã¢â‚¬â€œ4 primary claims with progressive disclosure for why the claim emerges, supporting derived signals, insufficient observation and limited target relation. Internal source references remain test-visible but are not rendered as primary user content.
- No global person/match score, new confidence model, persistent Emergent Characterization, Core contract or snapshot semantics were introduced.
- Limitation: the live Beta reporting pipeline does not currently carry the Core Evidence Store/Knowledge Ledger/PersonKnowledgeMatrix into claim-specific Professional Perception output. ME-02 therefore uses only explicit report-level derived signals/gaps as evidence and does not fabricate claim-to-raw-evidence relevance. Richer evidence trust/validation remains downstream.
- Builder environment has no `GROQ_API_KEY`; deterministic regressions are green and the authorized post-ME-01D live smoke evidence is retained. A local post-overlay smoke should confirm the new Value Proof rendering with the real provider.

## ME-02B Ã¢â‚¬â€ Representation claim quality + repeat-interview diagnostic Ã¢â‚¬â€ 2026-08-15

- Live ME-02 evaluation confirmed the Value Proof is technically present but exposed repetitive claims, repeated signal lists and overly coarse insufficient-observation wording.
- ME-02B refines the downstream projection without changing Core contracts: semantic claim consolidation, non-tautological evidence selection, and bounded professional-history context distinguish historically supported domains from depth/specialization that remains insufficiently characterized.
- The live optics finding is covered by deterministic regression: multi-source professional-history support is preserved without asserting certified mastery.
- Repeat-interview diagnostic: question ranking/selection is deterministic when candidate/target and inputs are unchanged. Existing `recentQuestionKeys` / `recentQuestionHistory` avoidance capability is implemented in question ranking/selection, but `runFringeInterviewMVP` does not receive or forward previous-session history.
- Repeat-interview status: **EXISTING VARIATION CAPABILITY NOT YET CONSUMED**. Enabling meaningful cross-session variation requires a separately authorized session-history handoff; ME-02B does not add persistent interview memory or a second planner.
- Existing Knowledge Coverage / Opportunity / Acquisition architecture leaves a compatible future path for progressive acquisition, but that cross-session loop is not wired into Interview planning in this task.

## ME-02C Ã¢â‚¬â€ Repeat Interview Variation Integration Ã¢â‚¬â€ 2026-08-15

- Verdict: **B Ã¢â‚¬â€ REPEAT INTERVIEW VARIATION INTEGRATED WITH NON-BLOCKING GAPS**.
- ME-02B diagnosis is now consumed: `recentQuestionKeys` and `recentQuestionHistory` are forwarded through the existing MVP/session/question-selection path; no second Interview Planner, random shuffle or question-generation redesign was introduced.
- The Private Beta UI server owns a temporary process-local recent-question store keyed by an opaque `HttpOnly`, `SameSite=Lax` Beta repeat-context cookie. This is explicitly Beta-specific technical memory, not Professional Identity, Representation, Knowledge persistence or long-term candidate history.
- Only canonical question identity metadata from successfully answered/shown Runtime steps is retained (`key`, category/family context and expected-signal labels). CV, JD, answers, prompts and provider payloads are not retained for variation.
- History is updated after a successful answer, so planned/unseen questions are not marked consumed. If a session is interrupted after answered questions, those answered questions may still guide the next simulation in the same process/browser context.
- A successive simulation in the same Beta browser context receives recent question history; unrelated browser contexts receive distinct opaque context IDs and do not share history accidentally.
- The mechanism is process-local and disappears on server restart. It deliberately does not define future canonical cross-session Representation/Knowledge memory.
- Existing ranking remains deterministic: no history preserves the prior baseline; supplied recent history changes eligible ranking when alternatives exist, while canonical relevance can still permit legitimate repetition.
- ME-02B Representation Value Proof behavior remains green. Builder has no live-provider secret; local post-overlay smoke test with the configured Groq environment remains required to validate real successive Simulation A/B behavior.

## AR-02 Runtime Answer Ã¢â€ â€™ IMAGO Evidence/Knowledge Integration Ã¢â‚¬â€ 2026-08-16

- AR-01 finding remains confirmed: accepted Runtime answers previously stopped in the interview-local answer/coverage path and did not enter IMAGO Core Evidence/Knowledge.
- AR-02 now registers only **accepted authoritative Runtime answers** into the canonical Evidence contract, preserving Beta Session, Interview Session, question/currentStep context, answer order and accepted timestamp provenance.
- Canonical progression beyond Evidence is **blocked**: existing Registered Evidence Ã¢â€ â€™ Observation construction requires an explicit Measurement plus exact construction rules for a known characteristic. The repository has no authorized semantic mapping from arbitrary Interview answer content to domain/responsibility characteristics such as stakeholder management, budget ownership boundary, cost awareness or software collaboration.
- The historical Groq Answer Annotation subsystem was not reused because its schema is coaching/answer-quality oriented (`concreteness`, `specificity`, `evidence`, `ownership`, `structure`, `clarity`, `reflection`, `generic`) and does not preserve the professional semantic assertions required by AR-02.
- Therefore Observation/Measurement, Knowledge Ledger/Snapshot, PersonKnowledgeMatrix and Knowledge Coverage remain unchanged by live Interview answers. AR-03 must not consume Coverage as if this integration were complete.
- AR-04 remains downstream: Professional Perception/Value Proof still do not consume canonical Interview-derived knowledge.
- Required next boundary: an authority-compatible semantic Evidence Ã¢â€ â€™ Observation mapping for Interview answers, reusing existing Observation/Measurement/Knowledge contracts without direct Representation or Coverage writes.

## PA-02 Minimal Professional Semantic Mapping Authority Ã¢â‚¬â€ 2026-08-16

- Verdict: **B Ã¢â‚¬â€ MINIMAL SEMANTIC AUTHORITY ADDED**.
- Product Authority now defines a small descriptive professional semantic grammar rather than a competency catalogue: context-scoped action/contribution, object/domain, professional relationship, responsibility/accountability scope, context, outcome and Evidence provenance.
- `PD-024` authorizes context-scoped professional relationship Observation without automatically establishing a stable person characteristic.
- `PD-025` separates participation/collaboration/contribution/influence from ownership/decision/accountability and defines explicit contextual non-ownership as positive contextual knowledge rather than deficiency.
- `PD-026` establishes that domain proximity, collaboration or contribution does not itself establish specialist competence.
- `PD-027` establishes the Observation Ã¢â€ â€™ elementary Knowledge Ã¢â€ â€™ derived/Dynamic Characterization epistemic boundary and preserves insufficient observation as distinct from absence.
- `OBS-007Ã¢â‚¬Â¦OBS-010` remain unchanged and reusable as source professional Observation types. `decision_accountability` remains bounded to its existing decision-responsibility semantics.
- Existing Core contracts are not modified. Their generic Observation/Measurement/Dimension/Knowledge machinery is structurally reusable, but AR-02A must implement the newly authorized semantics through explicit policy/mapping rather than question labels, lexical matching or a new competency catalogue.
- AR-02A may now be reopened. AR-03 and AR-04 remain unauthorized until AR-02A proves at least one real Interview Evidence item reaches canonical Knowledge/PKM/Coverage with the new semantic scope preserved.

## GM-01 Groq Model Migration & Provider Compatibility Boundary â€” 2026-08-19

- Verdict: **B â€” GROQ MIGRATION IMPLEMENTED, LOCAL LIVE VALIDATION REQUIRED**.
- `llama-3.3-70b-versatile` was decommissioned on 2026-08-16 and is no longer a production default. The canonical Groq default is now `openai/gpt-oss-120b` in one Infrastructure compatibility module; `GROQ_MODEL` remains an explicit override.
- Parser, Answer Annotation and Professional Perception Groq adapters now delegate request construction/model compatibility to one Infrastructure boundary instead of independently knowing model defaults or request quirks.
- Current parser tasks (`candidateProfile`, `roleProfile`, `jobFitAnalysis`) and structured interview/report tasks use JSON Object Mode. This addresses the supplied GPT-OSS JobFitAnalysis symptom at the output-contract boundary without changing existing semantic schemas. Adaptive/gap-driven question generation remains text mode.
- Existing Answer Annotation and Professional Perception JSON Schemas are not strict-mode compatible as written (`additionalProperties:false` is not consistently declared and Professional Perception contains optional properties), so GM-01 does not distort them. The boundary supports strict JSON Schema for a future caller only when the caller explicitly supplies a strict-compatible canonical schema.
- No hidden model fallback exists. Provider errors expose only task/model/coarse status through errors and do not log API keys, prompts, CV/JD, answers, response bodies or reasoning.
- Builder has no `GROQ_API_KEY`; deterministic compatibility, parser mock, staged Beta and full health checks pass. Live provider validation remains required for CandidateProfile, RoleProfile, JobFitAnalysis, full MVP/adaptive follow-up, Professional Perception and Answer Annotation.
- AR-02A remains deferred until that live validation succeeds.

## GM-01A Groq 400 Diagnostic + Answer Annotation Compatibility Fix â€” 2026-08-19

- GM-01 live validation supplied with this task remains: CandidateProfile PASS, RoleProfile PASS, JobFitAnalysis PASS, full FRINGE MVP session PASS, Professional Perception Groq PASS on `openai/gpt-oss-120b`; the observed 429 was a Free Plan TPM-window event, not a compatibility regression.
- The historical Answer Annotation HTTP 400 response body cannot be recovered retroactively because the pre-GM-01A shared client discarded it. Builder has no `GROQ_API_KEY`, so the exact historical provider message remains pending one local live reproduction.
- GM-01A adds sanitized provider diagnostics containing only task, model, HTTP status, whitelisted provider code/type, normalized safe message, retry-after and coarse failure kind. Raw provider bodies, prompts, candidate answers, generated completion and secrets are not attached to errors.
- Answer Annotation now supplies its existing canonical schema to the centralized compatibility boundary. For GPT-OSS the boundary selects native strict JSON Schema and adds only provider-structural `additionalProperties:false` recursively; all existing required fields, types and enums are preserved. Other structured tasks retain their GM-01 JSON Object Mode contracts; text tasks remain text.
- GPT-OSS structured requests suppress returned reasoning with `include_reasoning:false`; no hidden reasoning is stored or exposed.
- HTTP 429/5xx retry behavior is preserved; `retry-after` is honored when numeric. Non-retryable 400 is not retried. Transport connect-timeout retry remains unchanged/not added in GM-01A.
- Deterministic GM-01A compatibility/security tests PASS; parser mock PASS; staged Beta application/UI PASS; full FRINGE health check PASS.
- Local live validation still required: `GROQ_MODEL=openai/gpt-oss-120b node scripts/test_answer_annotation_runner_groq.js`. A PASS closes the remaining Answer Annotation provider-validation gate; if it fails, the new sanitized `providerDiagnostic` supplies the provider classification without leaking user data.
- AR-02A remains deferred until this live provider validation closes GM-01/GM-01A.

## GM-01B Native Structured Output Prompt Alignment â€” 2026-08-19

- Existing local live evidence remains authoritative: CandidateProfile PASS, RoleProfile PASS, JobFitAnalysis PASS, full FRINGE MVP Session PASS and Professional Perception Groq PASS with `openai/gpt-oss-120b`.
- GM-01A safe diagnostics identified the remaining real Answer Annotation failure as HTTP 400 / `json_validate_failed` / `invalid_request_error` / `structured_output_rejected`.
- Two manual direct-provider diagnostics established that GPT-OSS 120B accepts both a minimal strict schema and the complete existing Answer Annotation schema after the provider-side recursive `additionalProperties:false` transformation. The schema/account capability is therefore not the remaining incompatibility.
- GM-01B removes the duplicate structural contract from the Answer Annotation prompt when the canonical GM-01 compatibility boundary selects native `json_schema` strict mode. The native schema is then the sole structural authority; the prompt retains semantic coaching, evidence fidelity, span/excerpt and locale instructions.
- Non-native/fallback prompt construction retains the existing embedded-schema structural guidance. The decision is capability/contract-driven and contains no model-name conditional in Answer Annotation application logic.
- The canonical Answer Annotation schema, provider-side strict-schema transformation, GM-01A safe diagnostics, Parser/Professional Perception JSON Object contracts and adaptive/gap-driven text contracts are unchanged.
- Deterministic GM-01B, GM-01A, GM-01 compatibility, parser mock, staged Beta and complete health checks PASS. The historical prompt-preview script also PASSes when its expected `tmp/answer-annotation` output directory exists; its fixture-output dependency is unchanged.
- Builder environment has no live provider secret available for this task. Required closure check remains: `GROQ_MODEL=openai/gpt-oss-120b node scripts/test_answer_annotation_runner_groq.js` (PowerShell environment assignment as documented in the task/report).
- Until that real Answer Annotation call PASSes, verdict remains `B â€” PROMPT ALIGNMENT IMPLEMENTED, LOCAL LIVE VALIDATION REQUIRED`; AR-02A remains deferred.

## GM-01C Structured Output Completion Budget Compatibility â€” 2026-08-20

- Verdict: **B â€” COMPLETION BUDGET FIX IMPLEMENTED, LOCAL LIVE VALIDATION REQUIRED**.
- Prior live evidence remains authoritative: GPT-OSS 120B CandidateProfile, RoleProfile, JobFitAnalysis, Full MVP Session and Professional Perception passed; Answer Annotation returned `400 / json_validate_failed`.
- Direct live strict Structured Output checks already established that both a minimal schema and the full real Answer Annotation schema (with provider-side recursive `additionalProperties:false`) are accepted by GPT-OSS 120B. The full-schema direct result used approximately 765 completion tokens.
- GM-01B removed duplicate schema text from the native-schema prompt, but the real Answer Annotation request still failed.
- Repository inspection found no Answer Annotation-specific output budget: its adapter supplied no `maxTokens`, so the provider default/effective limit applied.
- GM-01C adds a centrally resolved `answerAnnotation` completion budget of **2048 tokens** to the existing Groq task contract. The value is intentionally moderate: it provides substantial headroom over the observed ~765-token direct full-schema result for the richer real task (3â€“6 annotations, summaries, coaching fields and improved draft) without increasing unrelated task budgets.
- The GPT-OSS compatibility profile now emits the current `max_completion_tokens` parameter. The generic alternate Groq profile retains `max_tokens` compatibility for explicit caller-provided limits.
- Answer Annotation remains `json_schema` with `strict:true` and `include_reasoning:false`. Canonical schema, GM-01B prompt semantics/alignment, normalization and application adapter semantics are unchanged.
- GM-01A sanitized provider diagnostics remain unchanged. A previously observed `UND_ERR_CONNECT_TIMEOUT` remains a separate non-blocking transport limitation; GM-01C does not redesign network retry.
- Deterministic GM-01/GM-01A/GM-01B/GM-01C, Answer Annotation prompt, parser mock, staged Beta application/UI and full health checks pass.
- `GROQ_API_KEY` is not available in the Builder environment, so the completion-budget hypothesis is not claimed as live-proven here.
- Required local closure check after rate-limit window clearance: `GROQ_MODEL=openai/gpt-oss-120b` + `node scripts/test_answer_annotation_runner_groq.js`.
- AR-02A remains deferred until the Groq migration series is live-closed.
