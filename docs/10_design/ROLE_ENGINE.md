# IMAGO_ROLE_ENGINE.md

# Scopo

Il Role Engine è il componente che costruisce la comprensione del ruolo prima dell'inizio del colloquio.

Non genera domande.

Non valuta il candidato.

Costruisce il modello di riferimento che guiderà tutto il resto della pipeline.

---

# Principio fondamentale

Il colloquio non può iniziare finché FRINGE non ha compreso:

* quale ruolo è realmente in gioco;
* quale livello di seniority è richiesto;
* quali segnali renderanno credibile un candidato per quel ruolo.

Il Role Engine costruisce questa comprensione.

---

# Input

Il Role Engine utilizza tutte le informazioni disponibili.

Possibili sorgenti:

* CV
* Job Description
* titolo del ruolo
* settore
* azienda
* contesto
* esperienza dichiarata
* informazioni emerse durante il parser

Le fonti possono essere complete oppure parziali.

Il sistema deve sempre indicare il livello di affidabilità della propria interpretazione.

---

# Fase 1 – Role Discovery

Obiettivo:

capire quale ruolo stiamo realmente analizzando.

Il titolo del ruolo non è considerato sufficiente.

Il sistema integra tutte le evidenze disponibili per identificare:

* ruolo reale;
* famiglia professionale;
* livello di seniority;
* contesto operativo.

Output:

Role Identity

---

# Fase 2 – Role Understanding

Obiettivo:

comprendere che cosa significa avere successo in quel ruolo.

Il sistema identifica:

* missione del ruolo;
* responsabilità principali;
* problemi tipici da affrontare;
* modalità decisionali;
* risultati attesi;
* criteri di credibilità.

Output:

Role Understanding

---

# Fase 3 – Role Credibility Map

Obiettivo:

trasformare il Role Understanding in una mappa utilizzabile durante il colloquio.

La mappa contiene:

* pilastri stabili di FRINGE;
* competenze specifiche del ruolo;
* segnali osservabili attesi;
* priorità;
* livello di confidenza.

Questa mappa guiderà:

* piano del colloquio;
* interpretazione delle risposte;
* report finale.

---

# Regole

La Role Credibility Map non deve essere una semplice lista di competenze.

Ogni elemento deve descrivere:

* perché è importante;
* quali evidenze lo rendono osservabile;
* quale livello di affidabilità ha.

---

# Aggiornamento

La Role Credibility Map non è immutabile.

Durante il colloquio possono emergere nuove informazioni.

Il Role Engine deve poter:

* confermare;
* modificare;
* arricchire;
* correggere

la mappa iniziale.

Ogni modifica deve mantenere la tracciabilità della fonte.

---

# Output finale

Il risultato del Role Engine è una rappresentazione coerente del ruolo.

Il suo compito non è prevedere il candidato ideale.

Il suo compito è costruire il riferimento rispetto al quale verranno interpretate le evidenze raccolte durante il colloquio.

---

# Principio architetturale

Il Role Engine non conosce tutti i ruoli.

Sa costruire una rappresentazione credibile del ruolo specifico utilizzando le informazioni disponibili.

La conoscenza del dominio nasce dinamicamente.

L'architettura del motore rimane stabile.
