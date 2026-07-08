BUILDER TASK 0001
EvidenceStore Foundation
Obiettivo

Introdurre il primo componente della nuova architettura Core.

Questa implementazione NON modifica la pipeline esistente.

Introduce solamente il nuovo oggetto tecnico EvidenceStore.

File da creare
src/core/evidence/

   src/core/evidence/buildEvidenceStore.js
src/core/evidence/validateEvidenceStore.js
src/core/evidence/healthBuildEvidenceStore.js
src/core/evidence/index.js
scripts/test_build_evidence_store.js


Responsabilità

buildEvidenceRepository()

riceve:

inputSources[]

e restituisce:

evidenceRepository = {

    evidence: [],

    sources: [...],

    statistics: {

        totalEvidence: 0,

        sourceCount: sources.length

    },

    metadata: {

        version: "1.0",

        createdAt

    },

    extensions: {}

}
Non implementare

NON implementare:

Evidence Extraction
Parser
LLM
Normalization

Questa è solamente la fondazione del Repository.

Validator

Verificare:

struttura
campi obbligatori
statistics coerenti
metadata
Health Check

Produrre un semplice report:

EvidenceStore

Status

Sources

Evidence

Validation

PASS / FAIL
Test

Creare uno script che costruisca tre sorgenti fittizie.

Ad esempio:

CV

Job Description

LinkedIn

Costruire il Repository.

Validarlo.

Stampare il risultato.

Regola

Non modificare alcun modulo esistente.

Il nuovo codice deve essere completamente isolato.

4. Perché questo task mi piace?

Perché segue esattamente il metodo che abbiamo definito.

Build

↓

Validate

↓

Test

↓

Health

È il primo modulo sviluppato seguendo il nuovo standard IMAGO.

5. Una proposta (questa è importante)

Vorrei introdurre una regola permanente.

Ogni Builder Task avrà sempre questa intestazione:

Sprint

Owner

Priority

Estimated Complexity

Dependencies

Files

Acceptance Criteria

Per esempio:

Sprint:
Sprint 1

Owner:
Builder

Priority:
High

Complexity:
Low

Dependencies:
None

---

# Esito

Status

✅ DONE

Build

✅ PASS

Validation

✅ PASS

Health Check

✅ PASS

Data

2026-07-03