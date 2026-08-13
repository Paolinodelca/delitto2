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
