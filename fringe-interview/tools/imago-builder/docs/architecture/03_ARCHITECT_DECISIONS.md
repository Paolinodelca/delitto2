# IMAGO Builder - Architectural Decisions

Version: 1.0

Status: ACTIVE

Owner: Architect

---

# Purpose

Questo documento raccoglie le decisioni architetturali permanenti del
Builder.

Non contiene implementazioni.

Non contiene workflow.

Non contiene stato del progetto.

Ogni decisione documenta:

- il problema;
- le alternative considerate;
- la decisione adottata;
- la motivazione.

Le decisioni approvate costituiscono riferimento permanente.

---

# Decision Format

Ogni decisione utilizza il seguente schema.

Decision ID

Status

Date

Problem

Alternatives

Decision

Consequences

---

# AD-0001

Title

Repository is the Source of Truth

Status

APPROVED

Problem

Durante lo sviluppo il Builder potrebbe essere tentato di ricostruire
componenti mancanti basandosi sulla documentazione o sulla memoria della
chat.

Alternatives

A)

Repository come unica fonte.

B)

Repository + documentazione con pari autorità.

C)

Ricostruzione automatica dei componenti mancanti.

Decision

Il repository costituisce sempre la fonte primaria della verità.

La documentazione ha esclusivamente funzione di supporto.

Conseguenze

Il Builder deve ispezionare il repository prima di implementare.

In presenza di incoerenze prevale sempre il repository.

---

# AD-0002

Title

Builder and Architect Responsibilities

Status

APPROVED

Problem

Separare chiaramente responsabilità progettuali e implementative.

Decision

L'Architect definisce:

- architettura;
- contratti;
- regole;
- evoluzioni.

Il Builder:

- ispeziona;
- implementa;
- testa;
- documenta;
- si ferma.

Conseguenze

Il Builder non modifica autonomamente l'architettura.

Le decisioni strutturali richiedono approvazione dell'Architect.

---

# AD-0003

Title

Repository Inspection Before Implementation

Status

APPROVED

Problem

Ridurre il rischio di implementazioni duplicate o incoerenti.

Decision

Ogni task inizia con una Repository Inspection completa delle aree
coinvolte.

Conseguenze

Mai implementare assumendo l'esistenza di file o componenti.

Mai ricostruire codice non verificato.

---

# AD-0004

Title

Public Contracts Require Validators

Status

APPROVED

Problem

Un contratto pubblico privo di validazione porta facilmente a dati
incoerenti tra i diversi Builder.

Alternatives

A)

Validator per ogni contratto pubblico.

B)

Validazione distribuita nei Builder.

C)

Assenza di validator dedicati.

Decision

Ogni contratto pubblico deve possedere un validator dedicato.

Conseguenze

I Builder possono assumere che gli input validati rispettino il
contratto.

La logica di validazione rimane centralizzata.

---

# AD-0005

Title

Immutable Builders

Status

APPROVED

Problem

La modifica accidentale degli input rende difficile individuare bug e
regressioni.

Alternatives

A)

Mutazione in-place.

B)

Clonazione parziale.

C)

Builder completamente immutabili.

Decision

I Builder producono sempre nuovi oggetti.

Gli input non vengono modificati.

Conseguenze

Pipeline prevedibili.

Test più semplici.

Debug più rapido.

---

# AD-0006

Title

Deterministic Rendering

Status

APPROVED

Problem

Lo stesso input non deve produrre risultati differenti.

Decision

Il rendering deve essere completamente deterministico.

Conseguenze

Snapshot affidabili.

Regression semplici.

Output confrontabili.

---

# AD-0007

Title

Generation Plan Identity

Status

APPROVED

Problem

Occorre garantire che Plan, Preflight e Writer operino sul medesimo
piano.

Decision

Ogni GenerationPlan possiede una propria identità stabile
(planIdentity / fingerprint).

Tale identità viene propagata senza modifiche durante tutta la pipeline.

Conseguenze

Il Writer può verificare che il Preflight appartenga realmente al piano.

Riduzione del rischio di utilizzo di dati incoerenti.

---

# AD-0008

Title

Preflight Before Write

Status

APPROVED

Problem

Una scrittura non verificata può produrre sovrascritture accidentali o
errori evitabili.

Alternatives

A)

Scrittura diretta.

B)

Preflight obbligatorio.

Decision

Ogni operazione di scrittura deve essere preceduta da un Preflight
valido.

Conseguenze

Il Writer non decide autonomamente cosa è consentito.

Le autorizzazioni provengono esclusivamente dal Preflight.

---

# AD-0009

Title

Atomic Write Per File

Status

APPROVED

Problem

La generazione può coinvolgere numerosi file.

Un errore non deve corrompere il singolo file in scrittura.

Decision

L'atomicità viene garantita esclusivamente a livello di singolo file.

Non esiste una transazione globale.

Conseguenze

La pipeline rimane semplice.

Il comportamento è prevedibile.

La complessità del sistema rimane contenuta.

---

# AD-0010

Title

Stop On First Failure

Status

APPROVED

Problem

Continuare la scrittura dopo un errore produce risultati parzialmente
affidabili e difficili da interpretare.

Alternatives

A)

Continuare comunque.

B)

Rollback globale.

C)

Interrompere immediatamente.

Decision

Alla prima scrittura fallita il Writer interrompe il piano.

I file successivi vengono marcati come skipped.

Conseguenze

Il report finale rappresenta fedelmente quanto realmente accaduto.

Non vengono prodotti effetti collaterali imprevedibili.

---

# AD-0011

Title

Reuse Before Creation

Status

APPROVED

Problem

La duplicazione della logica aumenta rapidamente il costo di
manutenzione e introduce comportamenti divergenti.

Alternatives

A)

Creare nuovi componenti quando più comodo.

B)

Riutilizzare sistematicamente quelli esistenti.

Decision

Prima di creare un nuovo componente il Builder deve verificare se uno
esistente possa essere riutilizzato o esteso.

Conseguenze

Riduzione della duplicazione.

Maggiore coerenza del Core.

Evoluzione più semplice.

---

# AD-0012

Title

Minimal Change Principle

Status

APPROVED

Problem

Modifiche troppo estese aumentano il rischio di regressioni e rendono
più difficile la review.

Decision

Ogni task deve modificare esclusivamente ciò che è necessario per
raggiungere il proprio obiettivo.

Le rifattorizzazioni non richieste devono essere rinviate.

Conseguenze

Task più piccoli.

Review più rapide.

Maggiore affidabilità.

---

# AD-0013

Title

Task Boundaries

Status

APPROVED

Problem

L'inizio automatico del task successivo rende difficile capire dove
termina una modifica e dove ne inizia un'altra.

Decision

Ogni task termina con:

- implementazione;
- test;
- regression;
- health;
- static audit;
- documentazione;
- report finale.

Successivamente il Builder si ferma.

Conseguenze

Ogni commit rappresenta una milestone autonoma e verificabile.

---

# AD-0014

Title

No Creative Reconstruction

Status

APPROVED

Problem

Quando un componente non è presente nel repository, il Builder potrebbe
tentare di ricostruirlo basandosi sul contesto della chat.

Decision

Il Builder non ricostruisce mai codice assente.

In presenza di elementi mancanti:

- documenta;
- propone;
- si ferma.

Conseguenze

Eliminazione delle implementazioni speculative.

Maggiore affidabilità del progetto.

---

# AD-0015

Title

Beta First

Status

APPROVED

Problem

L'ottimizzazione continua dell'infrastruttura può ritardare
indefinitamente il rilascio della Beta.

Decision

La priorità del progetto è raggiungere una Beta stabile e utilizzabile.

Ogni nuova attività infrastrutturale deve essere valutata in funzione
del suo impatto sul percorso verso la Beta.

Conseguenze

Le funzionalità indispensabili hanno priorità sulle ottimizzazioni.

Le evoluzioni non essenziali vengono pianificate per il post-Beta.

---

# AD-0016

Title

Automation Must Repay Its Cost

Status

APPROVED

Problem

Non tutte le automazioni producono un beneficio proporzionato al tempo
necessario per svilupparle.

Decision

Una nuova automazione viene introdotta prima della Beta soltanto se il
tempo investito viene recuperato in poche iterazioni di sviluppo.

In caso contrario viene rinviata.

Conseguenze

Il progetto mantiene un'elevata produttività senza accumulare
complessità prematura.

---

# AD-0017

Title

Evidence Before Assumption

Status

APPROVED

Problem

Le decisioni implementative basate su supposizioni producono errori
difficili da individuare.

Decision

Ogni scelta tecnica deve essere supportata da evidenze osservabili:

- repository;
- test;
- contratti;
- documentazione approvata.

Mai assumere comportamenti non verificati.

Conseguenze

Decisioni riproducibili.

Maggiore qualità delle review.

---

# Architectural Principles

Le decisioni contenute in questo documento costituiscono la base
architetturale permanente del Builder.

Nuove decisioni devono:

- risolvere un problema reale;
- essere sufficientemente stabili;
- essere applicabili all'intero progetto;
- non duplicare decisioni esistenti.

---

# End of Document