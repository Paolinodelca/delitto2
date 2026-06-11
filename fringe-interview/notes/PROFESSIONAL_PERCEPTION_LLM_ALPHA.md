# PROFESSIONAL_PERCEPTION_LLM_ALPHA

## Stato

Pipeline LLM sperimentale creata e funzionante.

NON ancora integrata nel report PRO.

Obiettivo: sostituire progressivamente le narrative hardcoded della pagina "Come vieni percepito" con una generazione LLM controllata.

---

## Componenti creati

### Schema

config/professional_perception_schema.json

Supporta:

* target_role
* open_direction

Se non esiste un ruolo target significativo, la sezione targetDistance dovrà essere sostituita da professionalDirections.

---

### Loader

src/interview/loadProfessionalPerceptionSchema.js

Test:

node scripts/test_load_professional_perception_schema.js

---

### Prompt Builder

src/interview/buildProfessionalPerceptionPrompt.js

Input attuali:

* finalCandidateReport
* roleFit
* cvAdvice
* runtimeRead
* runtimeAnswers
* candidateProfile
* roleFamily
* targetMode

---

### Test Prompt

node scripts/test_build_professional_perception_prompt.js

Output:

tmp/professional-perception/professional_perception_prompt.json

---

### Test Groq

node scripts/test_run_professional_perception_groq.js

Output:

tmp/professional-perception/professional_perception_groq_raw.json

---

## Stato qualitativo

Versione attuale: ALPHA

Miglioramenti ottenuti:

* meno coaching generico
* introduzione concetto:
  evidence → interpretation → professional meaning
* blind spot come dinamica percettiva e non come skill mancante
* credibility assets più vicini alla filosofia FRINGE

---

## Problema principale emerso

La qualità dell'output è oggi limitata soprattutto dalla povertà dell'input.

L'LLM riceve:

* roleFit
* cvAdvice
* candidateProfile sintetico

ma non riceve ancora abbastanza:

* storia professionale reale
* esperienze dettagliate
* risultati
* evidenze narrative

---

## Priorità prossima iterazione

NON lavorare ancora sul prompt.

Prima verificare se esistono nel parser dati più ricchi da fornire a Professional Perception:

* candidateProfile completo
* roleProfile
* openingPositioning
* featuredAnswers
* migliori risposte del candidato

Obiettivo:

spostare la narrativa da:

"ha competenze X"

a:

"questo percorso suggerisce Y".

---

## Decisione prodotto confermata

La sezione:

"Il tuo bagaglio di credibilità"

deve:

* riconoscere il lavoro realmente svolto
* valorizzare gli sforzi professionali
* spiegare il significato professionale delle evidenze

e NON diventare:

* elenco di skill
* valutazione numerica
* coaching HR generico.
