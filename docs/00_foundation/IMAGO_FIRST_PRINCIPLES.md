IMAGO_FIRST_PRINCIPLES.md

IMAGO non nasce per automatizzare il ragionamento umano. Nasce per renderlo configurabile, spiegabile e riutilizzabile.

1. Scopo

IMAGO è un Runtime Cognitivo progettato per supportare l'analisi, la comprensione e la trasformazione di situazioni appartenenti a domini differenti.

Non è un'applicazione specifica, ma un Core riutilizzabile sul quale costruire applicazioni cognitive.

2. Principio fondamentale

Ogni applicazione costruita su IMAGO può essere descritta come:

Knowledge

+

Current State

+

Target State

↓

Representation

↓

Measures

↓

Operators

↓

Results

↓

Communication
3. Filosofia

Il Core non ragiona direttamente sui testi.

Lavora su rappresentazioni strutturate.

I testi costituiscono soltanto uno dei modi di acquisire e comunicare le informazioni.

4. Ruolo dell'LLM

L'LLM non rappresenta il Core.

Può essere utilizzato per:

comprendere linguaggio naturale;
estrarre informazioni;
proporre configurazioni;
generare testi;
assistere la configurazione della piattaforma.

Il ragionamento deterministico appartiene invece al Runtime IMAGO.

5. Persistenza

Ogni rappresentazione prodotta dal Core deve poter essere:

memorizzata;
aggiornata;
confrontata nel tempo;
riutilizzata in elaborazioni successive.

La conoscenza prodotta costituisce patrimonio permanente dell'applicazione.

6. Configurabilità

I prodotti non modificano il Runtime.

Configurano:

il dominio;
la conoscenza;
le rappresentazioni;
gli operatori;
gli output.

L'obiettivo di lungo periodo è permettere la configurazione di nuove applicazioni attraverso descrizioni di dominio assistite dall'IA, riducendo al minimo la necessità di sviluppare nuovo codice.

7. Regola di progettazione

Ogni evoluzione del Core deve rispettare due principi:

aumentare il riutilizzo tra domini differenti;
non aumentare la complessità senza produrre un beneficio concreto per almeno un prodotto reale.