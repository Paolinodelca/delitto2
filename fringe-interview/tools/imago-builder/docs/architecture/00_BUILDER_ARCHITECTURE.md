# IMAGO Builder Architecture

Version: 1.0

Status: ACTIVE

Owner: Architect

Last updated: after Task 0098E-3

---

# Purpose

Questo documento descrive l'architettura permanente del Builder.

NON descrive lo stato corrente del progetto.
NON descrive il task in corso.

Lo scopo è fornire ad ogni nuova istanza del Builder le regole architetturali permanenti che governano il repository.

Il repository costituisce la fonte della verità.

La chat non costituisce la fonte della verità.

Ogni implementazione deve essere derivata dal codice realmente presente nel repository.

---

# Mission

Il Builder è responsabile esclusivamente della costruzione del Core tecnico.

Il Builder NON decide l'architettura.

Le decisioni architetturali appartengono esclusivamente all'Architect.

Il Builder implementa.

L'Architect decide.

---

# Repository First

Principio fondamentale.

Prima di qualsiasi implementazione il Builder deve ispezionare il repository reale.

Mai assumere che una funzione esista.

Mai assumere che una firma sia corretta.

Mai assumere che un helper sia disponibile.

Ogni decisione deve partire dal codice realmente presente.

---

# Core Principles

Il Core deve essere:

- deterministico
- componibile
- verificabile
- testabile
- immutabile
- estendibile

Ogni componente deve poter essere verificato autonomamente.

Ogni componente deve poter essere utilizzato da componenti superiori senza duplicarne la logica.

---

# Layer Architecture

Il Builder è organizzato in layer.

Layer 1

Contracts

Esempi:

- MeasurementModuleSpec
- GenerationPlan
- GeneratedFileEntry
- WritePreflightReport
- GenerationWriteReport

I contracts definiscono la forma dei dati.

Non implementano comportamento.

---

Layer 2

Builders

I Builders costruiscono nuovi oggetti.

Un Builder:

riceve input

↓

produce output

↓

non modifica gli input

---

Layer 3

Validators

Ogni contratto pubblico possiede un validator.

I validator:

controllano

non correggono

non mutano

non costruiscono

Restituiscono errori strutturati.

---

Layer 4

Renderers

I renderer trasformano modelli in output.

Ad esempio:

Template

↓

Rendered File

Il rendering deve essere deterministico.

---

Layer 5

Planning

Il planning costruisce il piano completo.

Esempio:

MeasurementModuleSpec

↓

GenerationPlan

Il planning non scrive file.

---

Layer 6

Preflight

Il Preflight analizza il filesystem.

Determina:

- create
- overwrite
- blocked

Il Preflight non scrive.

Il Preflight non modifica.

---

Layer 7

Writer

Il Writer esegue esclusivamente il piano autorizzato.

Il Writer non costruisce il piano.

Il Writer non decide.

Il Writer esegue.

---

Layer 8

CLI

La CLI rappresenta solamente un'interfaccia.

La CLI non contiene logica di business.

La CLI utilizza esclusivamente API pubbliche.

---

# Dependency Direction

Le dipendenze devono sempre puntare verso il basso.

CLI

↓

Public API

↓

Builder

↓

Validator

↓

Contracts

Mai il contrario.

Contracts non dipendono dalla CLI.

Validator non dipendono dal Writer.

Writer non dipende dalla CLI.

---

# Public API

Ogni componente riutilizzabile deve essere esportato esclusivamente tramite l'entry pubblica del Builder.

Gli helper interni non devono essere esportati.

Le factory interne non devono essere esportate.

Le primitive atomiche non devono essere esportate.

Il repository deve avere una chiara distinzione tra:

API pubblica

e

implementazione interna.

---

# Immutability

L'immutabilità è una regola fondamentale.

Nessun Builder modifica l'input ricevuto.

Nessun Validator modifica l'input ricevuto.

Nessun Renderer modifica l'input ricevuto.

Ogni trasformazione produce un nuovo oggetto.

Le mutazioni sono consentite esclusivamente sul filesystem durante la fase di scrittura.

Mai durante planning.

Mai durante rendering.

Mai durante validation.

---

# Determinism

Dato lo stesso input:

MeasurementModuleSpec

↓

Template

↓

Options

↓

Repository

il risultato deve essere identico.

Devono essere identici:

- file prodotti
- ordine
- contenuto
- hash
- identity
- report sanitizzati

Sono ammessi elementi non deterministici soltanto nei metadata temporali.

---

# Validation Philosophy

Ogni contratto pubblico deve possedere un validator dedicato.

I validator non correggono dati.

I validator non costruiscono dati.

I validator verificano esclusivamente la correttezza strutturale e semantica.

La validazione deve essere il più possibile:

- deterministica
- priva di effetti collaterali
- facilmente testabile

Ogni validator restituisce un risultato strutturato.

Mai eccezioni come normale controllo di flusso.

Le eccezioni devono rappresentare soltanto errori realmente inattesi.

---

# Builder Philosophy

Un Builder costruisce un nuovo oggetto.

Mai modificarne uno esistente.

Ogni Builder deve essere:

- piccolo
- riutilizzabile
- componibile
- prevedibile

Un Builder non deve conoscere il livello superiore.

Esempio corretto

MeasurementModulePlan Builder

↓

produce GenerationPlan

↓

non conosce il Writer.

---

# Single Responsibility

Ogni modulo deve avere una sola responsabilità.

Esempi.

GenerationPlan Builder

Costruisce il piano.

Non valida il filesystem.

Non scrive.

Non crea directory.

---

Write Preflight

Analizza il filesystem.

Non scrive.

Non renderizza template.

Non modifica il piano.

---

Writer

Scrive.

Non decide.

Non pianifica.

Non renderizza.

---

CLI

Interpreta gli argomenti.

Invoca API pubbliche.

Formatta output.

Nulla di più.

---

# Planning Pipeline

La pipeline logica del Builder è sempre composta da fasi indipendenti.

MeasurementModuleSpec

↓

Validation

↓

Planning

↓

Plan Validation

↓

Preflight

↓

Preflight Validation

↓

Write

↓

Write Validation

↓

Health

Ogni fase produce un contratto verificabile.

---

# Contracts

I contratti rappresentano il linguaggio comune del Core.

Ogni contratto deve avere:

Builder

Validator

Regression

Health

Documentazione

Tra i contratti principali:

MeasurementModuleSpec

MeasurementTemplateContext

GeneratedFileEntry

GenerationPlan

GenerationWritePreflight

GenerationWriteReport

### Risultato della generazione del Measurement Module

L’orchestratore `generateMeasurementModuleScaffold()` restituisce attualmente
un oggetto risultato non ancora formalizzato mediante un builder e un validator
dedicati.

`MeasurementModuleGenerationResult` è un contratto candidato, non un contratto
implementato.

La sua eventuale introduzione deve:

- riutilizzare gli envelope già prodotti dall’orchestratore;
- preservare la compatibilità dell’API pubblica;
- non duplicare l’orchestratore esistente;
- essere coperta da unit test e regression test.

Eventuali contratti futuri dovranno seguire la stessa convenzione.

---

# Template Rendering

I template devono essere completamente deterministici.

Il renderer riceve:

Template

Context

↓

Output

Il renderer non sceglie il template.

Il renderer non costruisce il contesto.

Il renderer non scrive file.

---

# GeneratedFileEntry

Ogni file generato deve essere rappresentato tramite un contratto dedicato.

Il Builder superiore non deve costruire manualmente file intermedi.

L'intero repository deve utilizzare un'unica rappresentazione dei file generati.

---

# GenerationPlan

Il GenerationPlan rappresenta il piano completo di generazione.

Contiene esclusivamente informazioni necessarie alla generazione.

Non contiene stato runtime.

Non contiene riferimenti al filesystem temporaneo.

Non contiene risultati di scrittura.

Il GenerationPlan è immutabile.

---

# Plan Identity

Ogni piano possiede una propria identità.

L'identità permette di verificare che:

Preflight

↓

Writer

↓

Report

facciano riferimento esattamente allo stesso piano.

L'identità non deve essere modificata.

---

# Filesystem Safety

Il filesystem rappresenta l'unico punto mutabile del sistema.

Prima di ogni scrittura deve esistere un Preflight reale.

Il Writer non deve inventare autorizzazioni.

Il Writer esegue esclusivamente quanto autorizzato.

Mai bypassare il Preflight.

Mai costruire manualmente autorizzazioni.

---

# Atomicity

L'atomicità è definita esclusivamente per singolo file.

Ogni file deve essere pubblicato in maniera atomica.

Il piano completo NON è transazionale.

Non esiste rollback globale.

Una scrittura può terminare con:

completed

partial

failed

Lo stato partial è previsto e corretto.

Il Builder non deve tentare di eliminarlo.

---

# Stop on First Failure

Durante la scrittura:

un errore reale

↓

interrompe il piano

↓

i file successivi risultano skipped

Questa è una scelta progettuale.

Non deve essere modificata senza una decisione architetturale.

---

# Overwrite

L'overwrite è sempre esplicito.

Non può essere implicito.

Richiede:

autorizzazione del piano

più

autorizzazione del preflight

Il Writer non forza mai overwrite autonomamente.

---

# Error Model

Gli errori devono essere:

espliciti

stabili

testabili

Ogni errore applicativo deve avere un codice.

Esempio:

measurement_module_spec_invalid

generation_plan_invalid

generation_write_failed

preflight_not_ready

Mai sostituire errori applicativi con errori generici.

Preservare sempre il codice originale quando possibile.

---

# Testing Philosophy

Ogni componente pubblico deve essere accompagnato da una suite di test.

Il Builder non considera un componente completato se:

- manca il test unitario;
- manca almeno una regression significativa;
- manca il relativo health check, quando previsto.

I test rappresentano parte integrante dell'implementazione.

---

# Livelli di test

Il Builder utilizza più livelli di verifica.

## Unit Test

Verificano un singolo componente.

Esempi:

Builder

Validator

Renderer

Contract

Parser

CLI helper

Devono essere piccoli, deterministici e veloci.

---

## Regression Test

Servono a garantire che il comportamento pubblico rimanga stabile.

Le regression devono utilizzare snapshot sanitizzati quando opportuno.

Devono essere eliminate:

- timestamp
- path temporanei
- PID
- nonce
- messaggi dipendenti dal sistema operativo

Devono invece rimanere invariati:

- status
- identity
- file order
- hash (quando deterministici)
- error code
- summary

---

## Process Test

Le CLI devono essere testate come veri processi.

Non basta importare le funzioni.

Quando possibile utilizzare:

child_process.spawnSync()

Verificare:

- exit code
- stdout
- stderr
- file prodotti
- comportamento del filesystem

---

## Health Check

Gli health check rappresentano una verifica complessiva.

Un Health:

non sostituisce i test

non sostituisce le regression

ma verifica che l'intero sottosistema sia coerente.

Ogni nuovo sottosistema importante dovrebbe possedere un proprio health dedicato.

---

# Static Audit

Ogni task deve terminare con uno static audit.

Lo static audit serve a verificare che l'implementazione non abbia introdotto scorciatoie architetturali.

Tra le verifiche tipiche:

assenza di API interne importate

assenza di helper duplicati

assenza di Promise.all nelle scritture

assenza di delete-then-rename

assenza di rollback globale

assenza di export accidentali

assenza di dipendenze non autorizzate

Lo static audit è obbligatorio per ogni task infrastrutturale.

---

# Public Export Policy

Ogni nuova API pubblica deve essere esportata da:

tools/imago-builder/index.js

Le implementazioni interne rimangono private.

Non devono essere esportati:

helper

factory

primitive atomiche

utility locali

Il numero di API pubbliche deve rimanere il più piccolo possibile.

---

# CLI Philosophy

La CLI è un adattatore.

Non implementa logica di business.

Ogni decisione deve essere demandata al Core.

La CLI può:

leggere file

interpretare argomenti

scrivere report

formattare output

invocare API pubbliche

La CLI non deve:

costruire piani

renderizzare template

scrivere file direttamente

analizzare il filesystem

duplicare validator

---

# JSON Output

Quando una CLI supporta la modalità JSON:

stdout deve contenere esclusivamente un JSON valido.

Mai banner.

Mai testo aggiuntivo.

Mai log.

Mai stack trace.

Il JSON costituisce un contratto pubblico.

---

# Human Output

L'output umano deve essere leggibile.

Deve mostrare:

operazione

modalità

summary

principali errori

risultato finale

Non deve mostrare:

contenuto completo dei file

hash interni inutili

informazioni di debug

path temporanei

variabili ambiente

---

# Error Handling

Il Builder privilegia errori strutturati.

Ogni errore deve essere:

identificabile

stabile

facilmente testabile

Gli errori devono propagarsi mantenendo il maggior numero possibile di informazioni utili.

Mai convertire sistematicamente tutti gli errori in:

"Unknown error"

---

# Immutability Verification

L'immutabilità non è soltanto una regola progettuale.

Deve essere verificata tramite test.

Quando un Builder riceve strutture complesse, i test devono confrontare snapshot prima e dopo l'esecuzione.

Una modifica accidentale dell'input costituisce una regressione.

---

# Determinism Verification

Il determinismo deve essere verificato.

A parità di input devono risultare identici:

GenerationPlan

GeneratedFileEntry

Identity

Template selection

Output sanitizzato

Quando il determinismo dipende dal filesystem, i test devono utilizzare ambienti equivalenti.

---

# Documentation Policy

Ogni componente importante deve possedere documentazione dedicata.

La documentazione descrive:

scopo

pipeline

contratti

API pubbliche

limiti

esempi

La documentazione non deve duplicare il codice.

La documentazione non deve sostituire i test.

---

# Backward Compatibility

Una modifica che rompe un contratto pubblico richiede una decisione architetturale.

Il Builder non modifica liberamente:

nomi dei campi

signature pubbliche

exit code

JSON envelope

contratti

senza approvazione dell'Architect.

---

# Evolution Principle

Il Core cresce per composizione.

Nuove funzionalità devono riutilizzare quanto già esistente.

Preferire:

Builder piccoli

Validator piccoli

Pipeline lunghe ma semplici

piuttosto che Builder monolitici.

---

# Repository as Source of Truth

Il repository costituisce sempre la fonte primaria della conoscenza.

I documenti di handover aiutano il Builder a comprendere
l'architettura, ma non sostituiscono il codice.

In caso di differenza tra documentazione e codice:

vince il repository.

In caso di dubbio:

il Builder deve fermarsi e riportare l'incoerenza.

Mai inventare la soluzione.

---

# Architect vs Builder

Le responsabilità sono rigorosamente separate.

Architect

- definisce l'architettura
- definisce le regole
- definisce i contratti
- approva le evoluzioni
- approva breaking changes
- approva nuovi layer

Builder

- ispeziona il repository
- implementa
- aggiorna i test
- aggiorna la documentazione
- esegue regression
- produce report
- si ferma

Il Builder non modifica l'architettura autonomamente.

---

# Review Process

Ogni task termina con una review.

La review verifica almeno:

- codice prodotto
- test
- regression
- health
- static audit
- documentazione
- export pubblici
- compatibilità

Solo dopo la review il task può essere:

- approvato
- corretto
- respinto

---

# Compatibility

Ogni nuovo componente deve rispettare il Core esistente.

Una nuova implementazione non deve:

rompere validator

rompere builder

rompere test

rompere CLI

rompere documentazione

rompere pipeline

salvo esplicita approvazione.

---

# Internal Duplication

Il Builder deve preferire il riuso.

Quando una funzione esiste già:

va riutilizzata.

Non devono nascere due implementazioni della stessa logica.

Eccezioni ammesse soltanto se:

l'Architect approva una rifattorizzazione.

---

# Incremental Growth

Il Core cresce in modo incrementale.

Ogni task aggiunge una capacità ben definita.

Ogni task termina con:

test

↓

health

↓

review

↓

stop

Il Builder non anticipa task futuri.

---

# Forbidden Behaviour

Il Builder non deve:

inventare repository

inventare file

inventare helper

inventare export

inventare test

inventare package.json

inventare dipendenze

inventare CLI

inventare convenzioni

inventare risultati di test

inventare PASS

inventare report

inventare commit

inventare push

Se un elemento non è disponibile:

deve essere dichiarato.

Mai simulato.

---

# Long-Term Maintainability

Ogni implementazione deve essere pensata per durare.

Preferire:

chiarezza

↓

semplicità

↓

componibilità

↓

testabilità

piuttosto che ottimizzazioni premature.

---

# Documentation Rules

Ogni componente significativo deve avere:

- documentazione dedicata;
- esempi d'uso;
- contratti descritti;
- limitazioni esplicite.

La documentazione deve essere mantenuta coerente con il codice.

---

# Core Invariants

Le seguenti regole costituiscono invarianti permanenti del Builder.

1.

Repository = Source of Truth.

2.

Il Builder implementa.

L'Architect decide.

3.

Ogni contratto pubblico possiede un validator.

4.

Ogni Builder produce nuovi oggetti.

Mai mutare gli input.

5.

Il rendering è deterministico.

6.

Il GenerationPlan è immutabile.

7.

Il Writer non costruisce il piano.

8.

Il Preflight è obbligatorio.

9.

Il Writer utilizza esclusivamente un Preflight valido.

10.

Atomicità esclusivamente per singolo file.

11.

Non esiste rollback globale.

12.

Stop-on-first-failure.

13.

Lo stato "partial" è valido.

14.

Ogni componente pubblico possiede test.

15.

Le CLI utilizzano soltanto API pubbliche.

16.

Le primitive interne non vengono esportate.

17.

Lo static audit è obbligatorio per i task infrastrutturali.

18.

Ogni implementazione termina con una review.

19.

Il Builder non inizia task successivi.

20.

In caso di dubbio:

ci si ferma.

---

# Evolution

L'architettura del Builder è progettata per crescere.

Nuovi componenti dovranno integrarsi
seguendo gli stessi principi descritti in questo documento.

Qualunque evoluzione significativa
deve mantenere:

- determinismo
- immutabilità
- componibilità
- verificabilità
- chiarezza
- responsabilità singola

Questi principi hanno priorità
rispetto alla rapidità di implementazione.

---

END OF DOCUMENT