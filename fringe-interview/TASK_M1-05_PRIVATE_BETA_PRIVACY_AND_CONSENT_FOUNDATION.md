# TASK M1-05 — Private Beta Privacy and Consent Foundation

## Stato

IMPLEMENTED — 2026-08-06

Baseline autorizzata: `b23caadc51e80a98649c378562a94d41c639f6dc`.

## Implementazione realizzata

È stato introdotto un boundary applicativo separato tra onboarding completato e utilizzo dei dati nella Private Beta.

Il nuovo stato immutabile e versionato registra:

- titolarità della Professional Identity in capo alla persona;
- finalità `private_beta_experience`;
- necessità dell’uso dei dati per l’esperienza;
- versione dell’informativa provvisoria;
- timestamp ISO di creazione, decisione e revoca;
- decisione esplicita `accept` / `refuse`;
- stato `pending`, `accepted`, `refused` o `revoked`;
- modalità di lavoro scelta nell’onboarding;
- `tutorAccessGranted: false` in ogni stato.

L’informativa è classificata esplicitamente come `PRIVATE_BETA_PROVISIONAL_NOTICE` e non dichiara conformità legale o GDPR completa.

## Comportamento osservabile

- Il consenso può essere creato solo dopo il completamento di M1-04.
- Lo stato iniziale è `pending` e presenta due sole scelte.
- Solo `accepted` abilita l’avvio del percorso Beta.
- `pending`, `refused` e `revoked` bloccano il journey prima dell’invocazione del verifier e producono errori applicativi privacy sicuri.
- La revoca è consentita solo da uno stato precedentemente accettato.
- La scelta `with_tutor` non concede accesso e non crea autorizzazioni Tutor.

## File modificati o creati

- `src/app/privateBetaPrivacyConsent.js`
- `src/app/runPrivateBetaUserJourney.js`
- `src/app/index.js`
- `scripts/test_private_beta_privacy_consent.js`
- `scripts/test_run_private_beta_user_journey.js`
- `docs/00-continuity/BETA_ROADMAP.md`
- `docs/00-continuity/CONTINUITY.md`
- `docs/00-continuity/BETA_READINESS_MATRIX.md`
- `TASK_M1-05_PRIVATE_BETA_PRIVACY_AND_CONSENT_FOUNDATION.md`
- `TASK_M1-05_MANIFEST.txt`

## Verifiche eseguite

PASS:

- test dedicati M1-05;
- consenso accettato, rifiutato e revocato;
- versione e timestamp del consenso;
- Tutor senza accesso automatico;
- blocco prima del trattamento per stati non autorizzati;
- regressione M1-04;
- regressioni M1-01, M1-02 e M1-03;
- Beta Runtime Session Integration;
- Beta Session Core e hardening;
- Builder Beta Readiness Regression;
- controlli sintattici sui file JavaScript modificati;
- forbidden-scope scan;
- manifest ↔ file modificati exact match;
- overlay ↔ manifest exact match.

## Limiti ancora aperti

- validazione legale e testo definitivo dell’informativa;
- base giuridica, retention, cancellazione e anonimizzazione di produzione;
- persistenza reale dello stato di consenso;
- gestione separata delle autorizzazioni Tutor;
- integrazione UI completa.

## Responsabilità residue Milestone 1

- feedback minimo;
- logging e runbook operativo minimo;
- integrazione UI delle fondazioni M1-03, M1-04 e M1-05;
- ulteriori blocker Beta già presenti nella readiness matrix, senza estendere il perimetro di M1-05.

## Limiti di verifica del repository ricevuto

Lo ZIP non contiene `package.json` né metadata Git; non sono quindi riproducibili un comando npm repository-wide o verifiche Git della baseline. I test Node direttamente disponibili e pertinenti sono stati eseguiti materialmente.
