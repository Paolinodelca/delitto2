# CV OPTIMIZATION WORKSPACE

## Visione

L'obiettivo non è riscrivere automaticamente il CV.

L'obiettivo è aiutare il candidato a comprendere:

* come viene letto oggi;
* come viene percepito;
* quali segnali emergono;
* quali segnali restano nascosti;
* come modificare il CV per il target desiderato.

---

## Workflow generale

### Step 1

CV Review

Output:

* Profile Read
* Credibility Assets
* Reading Risk
* Possible Directions
* Professional Signals
* Professional Traits

Domanda:

"Come appare oggi il profilo?"

---

### Step 2

Target Selection

Possibili modalità:

* target specifico
* famiglia professionale
* modalità discovery

Domanda:

"Dove vuoi andare?"

---

### Step 3

Perception Gap

Confronto:

CV attuale
vs
target desiderato

Output:

* segnali mancanti
* segnali deboli
* segnali da rafforzare
* segnali da ridurre

Domanda:

"Cosa impedisce oggi al CV di essere letto nel modo desiderato?"

---

### Step 4

Transformation Plan

Output:

* cosa spostare in alto
* cosa comprimere
* cosa espandere
* cosa spiegare meglio
* quali esperienze diventano centrali

Domanda:

"Quali modifiche produrranno il maggiore impatto?"

---

### Step 5

Narrative Repositioning

Output:

* nuovo titolo professionale
* nuovo profilo professionale
* messaggio chiave
* proposta di storytelling professionale

Domanda:

"Quale identità professionale deve emergere?"

---

### Step 6

CV Optimized Version

Output:

* CV targetizzato
* lettera di presentazione opzionale
* confronto prima/dopo

Domanda:

"Come appare il CV dopo l'ottimizzazione?"

---

## Livelli futuri

### Base

CV Review

### PRO

Transformation Plan

### PREMIUM

Narrative Repositioning
+
CV Optimized Version
+
Cover Letter
+
Confronto prima/dopo

---

## Principio guida

FRINGE non scrive semplicemente un nuovo CV.

FRINGE spiega il percorso che porta dalla versione attuale alla versione ottimizzata.

Il valore non è il documento finale.

Il valore è la comprensione della trasformazione.


## Nuova priorità — Role Target Narrative Layer

Problema emerso durante i test reali:

La sola `Role Family` non è sufficiente per generare narrative realmente mirate.

All'interno della stessa famiglia professionale possono esistere target molto diversi, con linguaggi, aspettative e segnali di credibilità differenti.

Esempio:

care_helping_professions

* family_support
* youth_prevention
* disability_autism
* mental_health
* addiction_support

Oggi FRINGE distingue correttamente la famiglia professionale.

Non distingue ancora in modo sufficientemente forte i sotto-target interni alla stessa famiglia.

Effetto osservato:

I report generati per target diversi risultano ancora troppo simili:

* profileRead
* credibilityAssets
* possibleDirections
* targetFocus

Obiettivo futuro:

Introdurre un livello intermedio:

Role Family
↓
Role Target
↓
Narrative Profile

Esempio:

care_helping_professions
↓
disability_autism
↓
narrative specifiche
credibility focus specifici
reading risk specifici
target focus specifici

Benefici:

* report più pertinenti
* CV Review più utile
* Professional Perception più accurata
* migliore supporto alla CV Optimization
* riduzione delle narrative generiche

Nota:

Questa esigenza è emersa durante il beta test reale del profilo "Giulia", ma è considerata un requisito generale del prodotto e non una personalizzazione specifica per quel caso.

## STATO ATTUALE DEL MOTORE CV (GIUGNO 2026)

# STATO ATTUALE DEL MOTORE CV (GIUGNO 2026)

## Obiettivo

Costruire un motore di ottimizzazione CV che non si limiti ad analizzare il profilo, ma che produca versioni del CV adattate a diversi target professionali.

---

## Architettura attuale

Pipeline implementata:

CV
↓
Profile Read
↓
Credibility Assets
↓
Reading Risk
↓
Target Focus
↓
Transformation Plan
↓
Narrative Repositioning
↓
CV Opening Draft
↓
CV Key Skills Draft
↓
CV Structure Draft
↓
CV Rewrite Instructions
↓
CV Section Rewrite Plan
↓
CV Rewrite Output

---

## Refactoring architetturale completato

### Role Target Narratives

Spostato in:

src/report/narrativeProfiles/roleTargetNarrativeProfiles.js

Il vecchio file:

src/report/roleTargetNarrativeProfiles.js

è ora un semplice file ponte.

---

### Role Family Narratives

Spostato in:

src/report/narrativeProfiles/roleFamilyNarrativeProfiles.js

Il vecchio file:

src/report/roleFamilyNarrativeProfiles.js

è ora un semplice file ponte.

---

## Principio architetturale da mantenere

Tutti i contenuti narrativi, vocabolari professionali, testi dipendenti da:

* lingua
* famiglia professionale
* target professionale

devono essere concentrati nei file:

src/report/narrativeProfiles/

e NON dispersi nel codice applicativo.

Obiettivo:

* supporto multilingua
* espansione nuove famiglie
* espansione nuovi target
* aggiornamenti tramite sostituzione di file completi

senza modificare il motore.

---

## Nuovo layer implementato

Role Family Rewrite Vocabulary

Nuovi campi:

* rewriteProfile
* rewriteSkills
* rewriteKeywords

Attualmente implementati per:

care_helping_professions

Utilizzati come fallback quando non esiste un Role Target specifico.

Gerarchia:

Role Target
↓
Role Family
↓
Fallback generico

---

## Stato del CV Rewrite Engine

CV Review Engine:
100%

CV Optimization Engine:
90%

CV Rewrite Engine:
circa 70%

---

## Caso reale di validazione: Giulia

Target testati:

* Infanzia / Famiglie / Genitorialità
* Giovani / Ascolto / Prevenzione
* Disabilità / Sostegno educativo

Risultato:

Il motore produce già:

* profilo professionale targetizzato
* competenze chiave targetizzate
* struttura CV consigliata
* istruzioni di riscrittura
* piano di riscrittura sezioni
* primo CV Rewrite Output

---

## Prossimo passo prioritario

Sospendere temporaneamente l'aggiunta di nuove famiglie e nuovi target.

Eseguire un test reale end-to-end sul CV di Giulia:

CV Famiglie
CV Giovani
CV Disabilità

Obiettivo:

identificare i veri colli di bottiglia della generazione CV.

Ipotesi attuale:

il prossimo limite non è più l'analisi del CV ma la riscrittura delle esperienze professionali e della formazione.

Solo dopo questo test decidere eventuali nuove evoluzioni del motore.

