# IMAGO Product Vision

Version: 1.0

Status: CANONICAL

Owner: IMAGO Architecture

---

# Purpose

Definire cosa è IMAGO come piattaforma e quali principi guidano la sua evoluzione.

Questo documento non descrive implementazioni tecniche.

Non descrive la roadmap.

Non descrive il Core.

---

# Mission

IMAGO è una piattaforma progettata per costruire rappresentazioni spiegabili, persistenti ed evolutive della realtà osservata, trasformando dati dispersi in conoscenza utile per comprendere, decidere e sviluppare persone, organizzazioni e sistemi complessi.

Tali rappresentazioni supportano comprensione, decisione e sviluppo.

---

# Vision

La quantità di dati disponibili cresce continuamente.

Il valore non consiste nell'accumulare dati, ma nel trasformarli in rappresentazioni comprensibili, verificabili e utilizzabili.

IMAGO nasce per costruire queste rappresentazioni.

---

# What IMAGO Is

IMAGO è una piattaforma.

Le applicazioni rappresentano domini specializzati costruiti sopra la piattaforma.

La prima applicazione è IMAGO Interview.

In futuro potranno esistere numerose applicazioni basate sullo stesso Core.

---

# Platform Principles

La piattaforma deve essere:

- domain independent;
- application independent;
- explainable;
- extensible;
- evolutive;
- traceable.

---

# Current Domains

Attualmente il dominio implementato è quello professionale.

La piattaforma non assume che questo sia l'unico dominio possibile.

---

# Future Domains

Esempi di domini compatibili con la piattaforma:

- Career
- Learning
- Medical
- Decision Support
- Negotiation
- Organizational Analysis
- Complex Systems

L'elenco non è limitativo.

---

# Product Strategy

Ogni nuova applicazione deve riutilizzare il Core.

Nuovi domini devono introdurre nuovi modelli di osservazione e nuove Representation.

Non devono duplicare il Core.

---

# Beta Strategy

La Beta rappresenta esclusivamente la prima implementazione della piattaforma.

Il completamento della Beta non coincide con il completamento della piattaforma.

---

# Engineering Principle

La piattaforma privilegia modelli generali rispetto a soluzioni specifiche.

Tuttavia, quando due soluzioni risultano entrambe coerenti con l'architettura, viene preferita quella che produce maggiore valore osservabile per gli utenti della release corrente.

La generalizzazione non deve anticipare bisogni ipotetici.

La specializzazione non deve chiudere possibilità future ragionevolmente prevedibili.

# Long-term Goal

Costruire una piattaforma capace di rappresentare, comprendere ed evolvere modelli computabili della realtà osservata, mantenendo separati:

- piattaforma;
- dominio;
- applicazione;
- esperienza utente.

---

# Out of Scope

Questo documento non definisce:

- architettura software;
- contratti;
- pipeline;
- implementazioni;
- roadmap;
- task.

Tali aspetti appartengono ai documenti specifici.

---

Revision History

Version 1.0

Prima formalizzazione della Product Vision.