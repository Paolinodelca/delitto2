# IMAGO_ARCHITECTURE.md

# Scopo

Descrivere come il Core Model diventa software.

Non contiene filosofia.
Non contiene dettagli di implementazione.

---

# Pipeline

CV
+
Job Description
+
Contesto

↓

Parser

↓

Role Understanding

↓

Role Credibility Map

↓

Interview Plan

↓

Interview Runtime

↓

Observed Evidence Map

↓

Gap Engine

↓

Final Candidate Report

↓

PRO Report

---

# Principio fondamentale

Il sistema confronta sempre due mappe.

MAPPA A

Cosa il ruolo richiede.

↓

MAPPA B

Cosa il candidato ha realmente reso osservabile.

↓

OUTPUT

Gap spiegati.
Mai giudizi.

---

# Oggetti stabili

Role Credibility Map

Descrive:

* competenze richieste
* peso delle competenze
* seniority
* criteri di credibilità

Observed Evidence Map

Descrive:

ciò che è realmente emerso da:

* CV
* colloquio
* risposte
* esempi

Gap Engine

Confronta le due mappe.

Produce:

* cosa emerge
* cosa non emerge
* come renderlo più visibile

---

# Regola architetturale

Le Role Family NON contengono la conoscenza del ruolo.

Contengono solamente:

* tono
* linguaggio
* esempi
* stile narrativo

La conoscenza del ruolo nasce dalla Role Credibility Map.

---

# Obiettivo

Ogni nuovo componente deve poter essere inserito nella pipeline senza modificare il Core Model.

NOTA: 
Il RoleModel è la prima specializzazione del concetto generale di Reference Model.

Milestone

Il Core di FRINGE è diventato eseguibile.

Per la prima volta è possibile simulare un ciclo completo:

costruzione del modello;
pianificazione delle evidenze;
inizializzazione dello stato;
aggiornamento progressivo della copertura;
osservazione dell'evoluzione della Coverage.

Questa simulazione non utilizza ancora LLM.

Dimostra che il ragionamento del sistema è indipendente dal modello linguistico.
