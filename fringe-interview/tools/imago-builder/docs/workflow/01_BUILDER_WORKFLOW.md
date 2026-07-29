# IMAGO Builder Workflow

Version: 1.0

Status: ACTIVE

Owner: Architect

---

# Purpose

Questo documento descrive il processo operativo che ogni istanza del Builder deve seguire durante l'implementazione di un task.

Non descrive l'architettura del Core (vedere 00_BUILDER_ARCHITECTURE.md).

Non descrive lo stato corrente del progetto (vedere 02_BUILDER_STATUS.md).

Descrive esclusivamente **come lavorare**.

---

# Regola fondamentale

Ogni task segue sempre la stessa pipeline.

Mai saltare una fase.

Mai invertire le fasi.

Mai iniziare il task successivo.

---

# Workflow

Task ricevuto

↓

Repository Inspection

↓

Analisi

↓

Design minimo

↓

Implementazione

↓

Unit Test

↓

Regression

↓

Health

↓

Static Audit

↓

Documentazione

↓

Report Finale

↓

STOP

---

# STEP 1 — Repository Inspection

Prima di scrivere una sola riga di codice:

ispezionare il repository reale.

Verificare:

- file esistenti
- struttura
- builder disponibili
- validator disponibili
- export pubblici
- helper
- template
- CLI
- documentazione

Mai assumere che qualcosa esista.

Mai ricostruire a memoria.

Il repository è la fonte della verità.

---

# STEP 2 — Analisi

Solo dopo l'ispezione:

identificare

- componenti coinvolti
- contratti interessati
- validator
- dipendenze
- test esistenti
- health check esistenti

L'obiettivo è modificare il minimo indispensabile.

---

# STEP 3 — Design minimo

Il Builder NON riprogetta il sistema.

Il design consiste esclusivamente nello stabilire:

quali file modificare

quali file creare

quali API usare

quali test aggiornare

Ogni modifica deve essere la più piccola possibile.

---

# STEP 4 — Implementazione

L'implementazione deve:

riutilizzare

prima di creare.

Ordine di preferenza:

1.

riuso completo

2.

estensione

3.

piccolo helper

4.

nuovo componente

Mai duplicare logica già esistente.

---

# Regola del Repository

Se il repository contiene già:

Builder

↓

Validator

↓

Renderer

↓

CLI

↓

Helper

devono essere riutilizzati.

Non crearne una seconda versione.

---

# Gestione degli errori

Se durante l'implementazione emerge una incoerenza reale:

fermarsi.

Documentare.

Riportare.

Mai "indovinare".

Mai modificare l'architettura autonomamente.

---

# Nuovi file

Ogni nuovo file deve avere una responsabilità chiara.

Non creare file "misc".

Non creare helper generici senza motivo.

Preferire componenti piccoli.

---

# Modifiche ai file esistenti

Prima di modificare un file:

capire il suo ruolo.

Ridurre al minimo la modifica.

Evitare rifattorizzazioni non richieste.

---

# STEP 5 — Unit Test

Ogni nuovo componente pubblico deve essere accompagnato da test unitari.

Il test deve verificare il comportamento reale del componente.

Un test unitario non deve dipendere da:

- altri sottosistemi non necessari;
- rete;
- servizi esterni;
- stato precedente del repository.

Ogni test deve essere:

- deterministico;
- ripetibile;
- veloce.

---

# Copertura minima

Per ogni Builder verificare almeno:

- input valido;
- input non valido;
- casi limite;
- immutabilità degli input;
- output valido.

Per ogni Validator verificare almeno:

- contratto valido;
- contratto non valido;
- errori strutturati;
- nessuna mutazione.

Per ogni CLI verificare almeno:

- argomenti validi;
- argomenti mancanti;
- help;
- version;
- exit code;
- output JSON;
- output umano.

---

# STEP 6 — Regression

Ogni modifica deve essere confrontata con il comportamento precedente.

Quando opportuno utilizzare snapshot sanitizzati.

Sanitizzare:

- timestamp;
- path temporanei;
- PID;
- nonce;
- messaggi dipendenti dal sistema operativo.

Non sanitizzare:

- status;
- error code;
- ordine dei file;
- hash deterministici;
- identity;
- summary.

Le regression servono a bloccare modifiche accidentali del comportamento pubblico.

---

# STEP 7 — Health

Ogni sottosistema significativo deve possedere un Health Check.

L'Health verifica l'integrazione del sottosistema.

Un Health non sostituisce:

- test unitari;
- regression;
- process test.

L'Health rappresenta una verifica complessiva.

Output consigliato:

PASS

oppure

FAIL

con dettaglio della causa.

---

# STEP 8 — Static Audit

Ogni task infrastrutturale termina con uno Static Audit.

Lo Static Audit verifica che l'implementazione rispetti le regole architetturali.

Verificare almeno:

- nessuna duplicazione di logica;
- nessun helper interno esportato;
- nessuna API pubblica accidentale;
- nessun bypass del Preflight;
- nessuna scrittura diretta del filesystem;
- nessun rollback globale;
- nessun delete-then-rename;
- nessun Promise.all nelle scritture;
- nessuna dipendenza non autorizzata.

Lo Static Audit è parte integrante del task.

---

# STEP 9 — Documentazione e stato

Ogni task deve aggiornare esclusivamente la documentazione realmente interessata dall’implementazione.

La documentazione non costituisce un allegato facoltativo del task: quando il repository contiene documenti che descrivono il componente modificato, il loro aggiornamento fa parte del completamento del task.

## Documentazione applicativa IMAGO

Per i task che modificano il prodotto IMAGO, il Core, il Runtime, la Session, il Measurement Engine, il Capability Engine o altri domini applicativi:

* aggiornare le specifiche architetturali realmente interessate;
* aggiornare la roadmap applicativa soltanto quando il task modifica lo stato o la pianificazione;
* aggiornare eventuali documenti di contratto o pipeline coinvolti;
* non modificare i documenti di stato del Builder, salvo che il Builder stesso sia stato modificato.

La roadmap applicativa corrente è:

```text
notes/BETA_ROADMAP.md
```

## Documentazione del Builder

I documenti:

```text
tools/imago-builder/docs/status/02_BUILDER_STATUS.md
tools/imago-builder/docs/status/04_TASK_HISTORY.md
tools/imago-builder/docs/onboarding/03_ROADMAP.md
```

descrivono esclusivamente IMAGO Builder.

Devono essere aggiornati quando il task modifica il Builder o una sua capacità operativa.

Quando applicabile, il Builder deve:

1. aggiornare `02_BUILDER_STATUS.md` affinché rappresenti lo stato corrente reale;
2. aggiungere in fondo a `04_TASK_HISTORY.md` una entry relativa al task completato e approvato;
3. aggiornare `03_ROADMAP.md` soltanto se cambia lo stato di una milestone Builder;
4. aggiornare `03_ARCHITECT_DECISIONS.md` soltanto in presenza di una decisione architetturale approvata relativa al Builder.

Non registrare nei documenti di stato del Builder task esclusivamente applicativi.

## Regole generali

Aggiornare soltanto documenti verificati nel repository reale.

Non creare documenti paralleli quando ne esiste già uno con la stessa responsabilità.

Non duplicare contenuti.

Preferire riferimenti tra documenti piuttosto che copie.

Quando viene introdotta o modificata una pipeline, documentarla con un diagramma semplice.

Ogni documento dichiarato come aggiornato deve comparire nell’elenco dei file modificati del report finale.


---

# STEP 10 — Report Finale

Il report finale deve descrivere esclusivamente ciò che è stato realmente fatto.

Deve includere almeno:

- repository ispezionato;
- file creati;
- file modificati;
- API pubbliche aggiunte;
- test eseguiti;
- regression eseguite;
- health eseguiti;
- static audit;
- documentazione aggiornata;
- limiti;
- elementi non disponibili;
- conferma che non sono stati iniziati task successivi.

Mai dichiarare eseguiti test che non esistono.

Mai dichiarare modificati file non realmente modificati.

Mai simulare un PASS.

---

## Deliverable del task

Il Builder non deve restituire automaticamente una copia completa del repository.

Salvo richiesta esplicita contraria, il deliverable deve contenere esclusivamente:

* file nuovi;
* file modificati;
* report di implementazione del task;
* eventuale manifest dei file consegnati.

Non includere:

* file invariati;
* cartelle temporanee;
* output di test non richiesti;
* precedenti handover;
* copie complete del repository;
* dipendenze installate;
* artifact generati non necessari all’applicazione delle modifiche.

Ogni file consegnato deve preservare il proprio percorso relativo rispetto alla root del repository.

Il report finale deve distinguere chiaramente:

```text
Files Created
Files Modified
Files Delivered
```

`Files Delivered` deve normalmente corrispondere all’unione di `Files Created` e `Files Modified`, oltre al report di implementazione.




# Gestione delle anomalie

Se durante il task manca un file previsto:

1. verificare che non esista con un nome diverso;

2. verificare che non sia stato spostato;

3. se realmente assente:

   dichiararlo esplicitamente nel report.

Mai ricrearlo automaticamente salvo richiesta esplicita del task.

---

# Compatibilità

Ogni implementazione deve mantenere compatibili:

- contratti pubblici;
- JSON envelope;
- exit code;
- API pubbliche;
- pipeline consolidate.

Una breaking change richiede approvazione dell'Architect.

---

# Task Completion Checklist

Prima di dichiarare completato un task, il Builder deve verificare
la seguente checklist.

Repository

□ Repository ispezionato.

□ Nessuna assunzione fatta senza verifica.

Implementazione

□ Modifiche limitate al minimo necessario.

□ Nessuna duplicazione significativa.

□ API pubbliche coerenti.

Testing

□ Unit test eseguiti.

□ Regression eseguite.

□ Process test eseguiti (se applicabili).

□ Health eseguiti.

Static Audit

□ Static audit completato.

□ Nessuna violazione architetturale rilevata.

Documentation

□ Documentazione applicativa interessata aggiornata.

□ Roadmap applicativa aggiornata, se il task ne modifica stato o pianificazione.

□ Stato e cronologia del Builder aggiornati, se il task modifica IMAGO Builder.

□ Nessun documento Builder modificato per task esclusivamente applicativi.

□ Nessuna duplicazione documentale inutile.

□ Tutti i documenti dichiarati come aggiornati figurano tra i file modificati.


Report

□ Report finale completo.

□ File creati elencati.

□ File modificati elencati.

□ Limiti dichiarati.

□ Elementi non disponibili dichiarati.

Workflow

□ Nessun task successivo iniziato.

□ STOP raggiunto.

---

# Quando fermarsi

Il Builder deve interrompere il lavoro quando:

- il task richiesto è completato;
- tutti i test richiesti sono stati eseguiti;
- la documentazione è stata aggiornata;
- lo Static Audit è stato completato;
- il report finale è stato prodotto.

Non deve:

iniziare automaticamente il task successivo.

Proporre possibili evoluzioni è consentito.

Implementarle no.

---

# Situazioni che richiedono STOP immediato

Il Builder deve fermarsi e riportare la situazione quando:

- il repository è incoerente;
- manca codice necessario;
- un contratto pubblico è ambiguo;
- esistono due implementazioni concorrenti;
- il task richiede una decisione architetturale;
- la richiesta comporta una breaking change non autorizzata.

In questi casi il Builder deve:

descrivere il problema

↓

indicare i file coinvolti

↓

proporre le possibili soluzioni

↓

fermarsi.

---

# Criteri di qualità

Ogni implementazione deve essere valutata secondo questi criteri.

Correttezza

L'implementazione soddisfa il task.

Semplicità

La soluzione è la più semplice possibile.

Riuso

È stato riutilizzato il codice esistente.

Testabilità

Il comportamento è facilmente verificabile.

Determinismo

A parità di input produce lo stesso output.

Immutabilità

Gli input non vengono modificati.

Manutenibilità

Il codice sarà comprensibile anche dopo molti mesi.

---

# Criteri di revisione

Durante la review architetturale il Builder deve facilitare il lavoro
dell'Architect.

Il report finale deve permettere di capire rapidamente:

- cosa è cambiato;
- perché è cambiato;
- dove è cambiato;
- come è stato verificato;
- quali limiti rimangono.

La review non deve richiedere la rilettura dell'intero repository.

---

# Evoluzione del Workflow

Il presente workflow rappresenta il processo standard del Builder.

Nuove fasi possono essere introdotte soltanto tramite decisione
architetturale.

Le modifiche devono mantenere:

- chiarezza;
- ripetibilità;
- verificabilità.

---

# Workflow Invariants

Le seguenti regole sono permanenti.

1.

Repository prima del codice.

2.

Implementare solo quanto richiesto.

3.

Riutilizzare prima di creare.

4.

Modificare il minimo indispensabile.

5.

Testare sempre.

6.

Eseguire regression.

7.

Eseguire Health.

8.

Completare lo Static Audit.

9.

Aggiornare la documentazione.

10.

Produrre un report reale.

11.

Mai simulare risultati.

12.

Mai iniziare il task successivo.

13.

In caso di dubbio:

fermarsi.

---

# End of Workflow