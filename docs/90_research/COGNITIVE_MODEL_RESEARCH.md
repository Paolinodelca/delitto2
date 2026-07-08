# COGNITIVE_MODEL_RESEARCH.md

## Scopo

Verificare se le funzioni di IMAGO possono essere costruite combinando pochi modelli cognitivi ricorrenti, invece di creare una capability nuova per ogni prodotto.

L'obiettivo non è confermare l'ipotesi.

L'obiettivo è falsificarla.

---

# Ipotesi da testare

Molte funzioni apparentemente diverse possono essere ricondotte a pochi modelli cognitivi generali.

Modelli candidati:

* Evaluation Model
* Transformation Model
* Generation Model
* Validation Model
* Composition Model

---

# Regola di falsificazione

Ogni nuova capability deve essere introdotta solo se non può essere ottenuta componendo modelli già esistenti.

Se una funzione richiede un nuovo modello, va registrata come eccezione.

---

# Evaluation Model

Serve quando il sistema deve valutare qualcosa rispetto a un riferimento.

Schema:

Observed State

↓

Reference State

↓

Dimensions

↓

Evaluation Function

↓

Result

Esempi:

* Gap Analysis
* Risk Analysis
* Opportunity Analysis
* Credibility Analysis
* Knowledge Gap
* Fit Analysis

Nota:

Risk, Gap e Opportunity non sono primitive.

Sono diverse configurazioni dell'Evaluation Model.

---

# Transformation Model

Serve quando il sistema deve trasformare uno stato in un altro.

Schema:

Input State

↓

Transformation Goal

↓

Constraints

↓

Transformation Strategy

↓

Output State

Esempi:

* CV Rewrite
* LinkedIn Rewrite
* Answer Improvement
* Professional Summary
* Cover Letter

---

# Generation Model

Serve quando il sistema deve produrre alternative o contenuti nuovi a partire da vincoli.

Schema:

Input Context

↓

Generation Goal

↓

Constraints

↓

Candidate Outputs

↓

Selection Criteria

Esempi:

* domande difficili da colloquio
* alternative strategiche
* scenari professionali
* ipotesi di carriera
* piani d'azione

---

# Validation Model

Serve quando il sistema deve verificare se un output rispetta vincoli, schema o qualità minima.

Schema:

Candidate Output

↓

Validation Rules

↓

Errors / Warnings

↓

Pass / Fail

Esempi:

* validazione JSON LLM
* controllo anti-allucinazione
* coerenza con evidenze
* completezza minima
* compliance ai vincoli

---

# Composition Model

Serve quando il sistema deve assemblare parti già prodotte in un output finale.

Schema:

Components

↓

Assembly Rules

↓

Output Structure

↓

Final Artifact

Esempi:

* Professional Visibility Review
* CV finale
* report
* learning plan
* business review

---

# Casi d'uso da testare

## 1. Professional Visibility Review

Funzione:

spiegare come emerge il candidato.

Scomposizione:

* Evaluation Model: confronto tra ProfessionalIdentityModel e target role
* Evaluation Model: visibilità delle aree osservate
* Composition Model: assemblaggio del report
* Transformation Model: adattamento del reasoning in forma leggibile

Esito:

Il modello regge.

---

## 2. CV mirato a Job Description

Funzione:

produrre un CV orientato a una specifica JD.

Scomposizione:

* Evaluation Model: confronto tra identità professionale e JD
* Transformation Model: trasformazione delle evidenze in CV
* Validation Model: controllo coerenza con evidenze
* Composition Model: assemblaggio sezioni CV

Esito:

Il modello regge.

---

## 3. Recruiter Read

Funzione:

simulare cosa vede un recruiter.

Scomposizione:

* Evaluation Model: confronto tra candidatura e ruolo
* Evaluation Model con perspective modifier: punto di vista recruiter
* Composition Model: sintesi leggibile

Esito:

Il modello regge.

Nota:

Perspective non sembra un modello autonomo. È un modificatore.

---

## 4. Interview Coach

Funzione:

preparare il candidato al colloquio.

Scomposizione:

* Evaluation Model: aree deboli rispetto al ruolo
* Generation Model: generazione domande possibili
* Transformation Model: miglioramento risposte
* Composition Model: piano di preparazione

Esito:

Il modello regge.

---

## 5. Critical Questions

Funzione:

generare domande difficili.

Scomposizione:

* Evaluation Model: identificazione aree vulnerabili
* Generation Model: generazione domande
* Validation Model: controllo pertinenza

Esito:

Il modello regge.

---

## 6. Negotiation Coach

Funzione:

preparare la trattativa economica o contrattuale.

Scomposizione:

* Evaluation Model: confronto tra offerta e obiettivi
* Generation Model: scenari negoziali
* Evaluation Model: rischio/opportunità dei diversi scenari
* Recommendation come output derivato

Esito:

Il modello regge.

---

## 7. Business Opportunity Review

Funzione:

valutare se un'idea imprenditoriale ha opportunità concreta.

Scomposizione:

* Evaluation Model: confronto tra idea, mercato, risorse, vincoli
* Generation Model: scenari possibili
* Evaluation Model: rischio/opportunità
* Composition Model: report decisionale

Esito:

Il modello regge.

---

## 8. Learning Plan

Funzione:

creare percorso di apprendimento da manuali o documentazione.

Scomposizione:

* Extraction / Evidence Engine: contenuti e concetti
* Evaluation Model: gap tra conoscenza richiesta e conoscenza osservata
* Generation Model: esercizi o quiz
* Composition Model: piano didattico

Esito:

Il modello regge.

---

## 9. Orientamento studenti

Funzione:

proporre scenari di studio/lavoro coerenti.

Scomposizione:

* Evaluation Model: interessi, attitudini, vincoli
* Generation Model: scenari possibili
* Evaluation Model: coerenza scenari
* Composition Model: orientamento spiegato

Esito:

Il modello regge, ma richiede forte cautela.

Nota:

Hypothesis non sembra un modello autonomo. È una configurazione del Generation Model.

---

## 10. Lead Qualification da questionari

Funzione:

identificare opportunità commerciali da risposte destrutturate.

Scomposizione:

* Evidence extraction
* Evaluation Model: confronto tra risposte e profilo cliente ideale
* Ranking: derivato dall'Evaluation Model
* Recommendation: output derivato

Esito:

Il modello regge.

---

# Modificatori cognitivi emersi

Alcuni concetti non sembrano modelli autonomi, ma modificatori.

## Perspective

Esempi:

* recruiter
* candidato
* coach
* manager
* investitore

## Criteria

Definisce la dimensione di valutazione.

Esempi:

* credibilità
* rischio
* opportunità economica
* coerenza
* completezza
* attrattività

## Time Horizon

Esempi:

* oggi
* breve termine
* medio termine
* lungo termine

## Risk Appetite

Esempi:

* prudente
* bilanciato
* aggressivo

## Output Style

Esempi:

* tecnico
* narrativo
* executive
* operativo

---

# Risultato provvisorio

La verifica preliminare supporta l'ipotesi.

Molte funzioni diverse sembrano riconducibili a pochi modelli cognitivi:

* Evaluation
* Transformation
* Generation
* Validation
* Composition

Le differenze principali non stanno nella primitiva, ma in:

* oggetti confrontati;
* riferimenti;
* dimensioni;
* criteri;
* prospettiva;
* vincoli;
* output atteso.

---

# Rischio

Il modello può diventare troppo astratto.

Per evitare questo rischio:

* non implementare subito tutti i modelli;
* partire solo dal caso Professional Visibility Review;
* introdurre nuovi modelli solo quando necessari;
* ogni nuovo modello deve essere giustificato da un caso reale.

---

# Decisione provvisoria

Per IMAGO adottare temporaneamente questa gerarchia:

Engine

↓

Cognitive Model

↓

Capability

↓

Cognitive Operation

↓

Execution Plan

↓

Application

---

# Prossimo passo consigliato

Implementare solo il primo Cognitive Model necessario al prodotto attuale:

Evaluation Model.

Perché è già presente in:

* Representation Gap Reasoning;
* Readiness;
* Professional Visibility Review;
* futura CV Strategy.

Non implementare ancora:

* Transformation Model;
* Generation Model;
* Plugin Builder.

Questi verranno dopo.
