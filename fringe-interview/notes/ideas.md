# Ideas — Fringe Interview

## Moduli monetizzabili
- simulazione colloquio standard
- colloquio mirato su job description
- CV ↔ job fit analyzer
- suggerimenti premium di riscrittura CV
- pacchetti per settore (sales, PM, engineering, support, HR)

## Modalità future
- recruiter mode
- coach mode
- interview replay
- confronto tra tentativi
- simulazioni per seniority diverse

## Idee laterali
- lettera di accompagnamento coerente con il ruolo
- ottimizzazione CV in chiave colloquio
- simulazione di follow-up dopo il colloquio
- simulazione di domande “scomode”

---

# Idea di espansione — Career Targeting e Orientation

## Intuizione generale

Il motore FRINGE non dovrebbe essere pensato solo come simulatore di colloquio.

La direzione più interessante è considerarlo come un motore più generale di:

- lettura del profilo
- confronto profilo ↔ obiettivo
- identificazione di segnali, gap e trasferibilità
- coaching strutturato
- costruzione di percorsi di miglioramento o esplorazione

In questa logica, l’interview simulator è un primo verticale, ma non necessariamente l’unico.

---

## Verticale possibile 1 — Career Targeting

### Obiettivo
Dare indicazioni su quali ruoli o job description abbiano più senso per una persona in base a:

- CV
- esperienza professionale
- competenze
- eventuali note personali o preferenze
- una o più job description candidate

### Output possibili
- ruoli plausibili da colpire
- ruoli raggiungibili ma con gap
- ruoli sconsigliati per mismatch forti
- punti trasferibili
- gap principali
- suggerimenti di posizionamento CV
- priorità di candidatura

### Perché è promettente
Questo verticale è molto vicino all’architettura già esistente di Fringe Interview:

- parser CV
- parser ruolo / job description
- job fit analysis
- chiarimento di punti forti, rischi e ambiguità
- coaching finale

Quindi potrebbe essere il primo sviluppo naturale oltre all’interview trainer.

---

## Verticale possibile 2 — Orientation

### Obiettivo
Supportare l’orientamento di persone più giovani o in fasi iniziali del percorso, per esplorare:

- tipi di studio
- attitudini operative
- contesti lavorativi compatibili
- famiglie professionali plausibili
- direzioni da approfondire

### Input possibili
- CV o mini-profilo
- descrizione personale
- interessi dichiarati
- attività preferite / detestate
- materie amate / tollerate / rifiutate
- esempi di esperienze positive e negative
- eventuali vincoli pratici

### Output possibili
- aree di studio plausibili
- contesti professionali compatibili
- tipi di ruolo compatibili
- mismatch probabili
- piste da esplorare
- domande guida per chiarire meglio il profilo

### Nota importante
Questo verticale non va pensato come “test magico che scopre la vera natura della persona”.

Va invece pensato come:
- motore di esplorazione guidata
- supporto ragionato
- strumento per far emergere compatibilità e incompatibilità plausibili

Serve cautela per evitare:
- pseudo-psicologia
- etichette premature
- eccesso di sicurezza in output che dovrebbero restare probabilistici

---

## Architettura desiderabile

La direzione migliore sembra essere:

### Motore comune
- parser
- profiling
- confronto profilo ↔ target
- annotation / coaching
- report
- dialogo guidato

### Verticali sopra il motore comune
- Interview
- Training
- Career Targeting
- Orientation

Questo consentirebbe di non sviluppare strumenti separati, ma un unico motore con verticali diversi.

---

## Ordine suggerito di sviluppo

### Prima
Consolidare:
- interview trainer
- annotation layer
- trainer mode
- qualità del coaching
- riduzione delle ripetizioni
- stabilità del flusso corto

### Poi
Sviluppare per primo:

#### Career Targeting
Perché:
- è vicino al motore attuale
- riusa parser e fit analysis
- richiede meno salti concettuali

### Dopo
Valutare:

#### Orientation
Con design più prudente e meno assertivo, soprattutto per utenti giovani o con profilo ancora in formazione.

---

## Principio guida

FRINGE dovrebbe evolvere da:

- simulatore di colloquio

verso:

- motore di lettura, confronto e coaching del profilo

L’interview è il primo caso d’uso forte, ma non deve diventare il limite concettuale del sistema.