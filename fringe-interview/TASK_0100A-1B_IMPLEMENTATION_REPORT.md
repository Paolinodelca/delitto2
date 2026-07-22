# Task 0100A-1B — IMAGO Beta Session Core Hardening

## Esito

Implementazione completata sul repository reale estratto dall’handover.

## Ispezione preliminare

Ispezionati integralmente `src/session/`, gli adapter, l’API pubblica, il test `scripts/test_beta_session_core.js`, i punti di creazione/modifica/validazione/caricamento/salvataggio e la Health Check.

## Modifiche principali

- contratto BetaSession chiuso e validazione delle proprietà ammesse;
- `schemaVersion` aggiornato a `1.1`;
- `revision` iniziale pari a `1`;
- incremento monotono di una revisione per ogni comando di dominio;
- validazione semantica di stato, intervista, riferimenti e lifecycle;
- normalizzazione uniforme di `inputRefs`, `runtimeRef` e `resultRef`;
- protezione da timestamp regressivi;
- optimistic concurrency control negli store memory e JSON;
- rifiuto di revisioni obsolete, concorrenti e salti di revisione;
- validazione dei documenti persistiti e gestione esplicita dei JSON corrotti;
- scrittura JSON tramite file temporaneo e rename, con cleanup su errore;
- `revision` inclusa nello stato di resume, senza dati sensibili;
- Health Check estesa al Beta Session Core.

## Semantica revision

- nuova sessione: `revision: 1`;
- ogni comando di dominio valido: `revision = precedente + 1`;
- prima persistenza: `expectedRevision: 0`;
- aggiornamento: `expectedRevision` deve coincidere con la revisione persistita;
- la nuova revisione deve essere esattamente `persistita + 1`;
- timestamp uguali non consentono sovrascritture concorrenti.

## Compatibilità

Preservati i nomi delle API pubbliche, gli adapter esistenti, il resume token con persistenza del solo hash, l’immutabilità e i moduli ES reali del repository.

Breaking change minima: il formato persistito richiede `schemaVersion: 1.1` e `revision`. Non è stata introdotta una migrazione legacy, coerentemente con l’assenza di sessioni Beta reali da preservare.

## Test eseguiti

- `node scripts/test_beta_session_core.js` — PASS
- `node scripts/test_beta_session_core_hardening.js` — PASS
- `node scripts/fringe_health_check.js` — PASS

## Esclusioni rispettate

Non introdotti Builder changes, event sourcing, SessionEvent, LearningObservation, knowledge repository, analytics, telemetria, database, lock distribuiti, API HTTP, UI o nuove dipendenze.

## Rischi residui

Il JSON filesystem store applica optimistic concurrency sul contenuto persistito ma non offre locking inter-process distribuito. È adeguato al perimetro Beta dichiarato; un futuro deployment multi-process dovrà fornire uno storage con compare-and-swap equivalente senza modificare il contratto di dominio.
