# FRINGE INTERVIEW — Architecture MVP

## Obiettivo
Costruire un MVP per simulazione colloqui basato sul motore FRINGE, mantenendo il core separato dai contenuti specifici dell'applicazione.

---

## Principio architetturale
Il sistema è diviso in tre strati:

### 1. Core FRINGE
Motore comune, riusabile da più applicazioni.

Responsabilità:
- orchestrazione sessione
- stato della sessione
- gestione domanda/risposta
- strategia follow-up
- osservazione finale

### 2. Application Layer — Fringe Interview
Logica specifica del dominio colloquio.

Responsabilità:
- gestione profilo candidato
- gestione job description
- costruzione scenario di colloquio
- rendering report utili al candidato

### 3. Content / Config Layer
Materiale modificabile senza toccare il core.

Responsabilità:
- famiglie di domande
- varianti
- follow-up pack
- rubriche di report
- configurazione UI / tono

---

## Flusso MVP
1. Landing
2. Inserimento profilo candidato
3. Parsing job description (se presente)
4. Conferma profilo ruolo
5. Setup simulazione
6. Colloquio
7. Report finale
8. Retry / nuova simulazione

---

## Oggetti dati principali

### CandidateInput
- name
- targetRole
- seniority
- cvText
- jobDescriptionText

### RoleProfile
- title
- seniorityDetected
- requiredSkills
- preferredSkills
- responsibilities
- softSkills
- languageStyle

### CandidateProfile
- summary
- skillSignals
- strengthAreas
- riskAreas

### InterviewConfig
- mode
- interviewerTone
- questionCount
- domainPack

### QuestionItem
- id
- family
- variant
- pressure
- text
- followUpEligible

### AnswerItem
- questionId
- text
- timestamp
- localSignals

### FollowUpDecision
- triggered
- type
- reason
- questionId
- text

### InterviewSession
- sessionId
- candidateInput
- candidateProfile
- roleProfile
- config
- questionPlan
- answers
- followUps
- finalReport

---

## Moduli principali

### Candidate Profile Builder
Trasforma il CV in un profilo sintetico usabile dal motore.

### Role Profile Extractor
Trasforma la job description in un profilo strutturato.

### Interview Scenario Builder
Combina candidato + ruolo + configurazione per creare la sessione.

### Question Strategy Engine
Seleziona:
- famiglia di domanda
- variante
- eventuale follow-up

### Observation Engine
Legge il colloquio e produce il report finale.

### Report Renderer
Mostra il report finale in forma leggibile.

---

## Domande: modello ibrido
### Livello 1
Famiglie stabili:
- motivazione
- esperienza concreta
- gestione difficoltà
- priorità / trade-off
- aderenza al ruolo
- sintesi finale

### Livello 2
Varianti controllate per:
- tono
- pressione
- tipo intervistatore

### Livello 3
Follow-up adattivi:
- concretizza
- prova
- stringi
- ruolo

---

## Modulo aggiuntivo strategico
### CV ↔ Job Description Fit Analyzer
Funzione utile e monetizzabile.

Output minimo:
- aderenza generale
- copertura competenze
- aree mancanti
- segnali deboli nel CV

Output premium:
- consigli di riscrittura
- sezioni da rinforzare
- skill da rendere più visibili
- esempi di miglioramento

---

## V1
- input testuale
- 5 domande
- qualche follow-up
- report finale
- nessun account obbligatorio
- nessun audio

## V1.5
- confronto tra tentativi
- feedback step-by-step
- upload PDF

## V2
- account
- storico sessioni
- recruiter mode
- audio
- dashboard