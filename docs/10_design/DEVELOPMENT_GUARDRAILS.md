# IMAGO_DEVELOPMENT_GUARDRAILS.md

# Prima di ogni sviluppo

Verificare sempre.

□ Sto descrivendo una persona oppure evidenze osservabili?

□ Sto creando una regola valida solo per un ruolo?

□ Questa regola può invece nascere dalla Role Credibility Map?

□ Sto aggiungendo hardcoded?

□ Sto introducendo eccezioni permanenti?

□ Sto usando linguaggio giudicante?

□ Sto aumentando oppure riducendo la generalizzazione del sistema?

---

# Regole da NON violare

Mai misurare:

* talento
* personalità
* leadership
* motivazione

Misurare sempre:

i segnali osservabili.

---

Mai confondere:

esperienza

con

competenza dimostrata.

---

Mai confondere:

non osservato

con

assente.

---

Distinguere sempre:

OSSERVATO

INFERITO

IPOTIZZATO

---

Il report deve sempre rispondere a due domande.

1.

Che cosa è emerso?

2.

Come può essere reso più visibile?

Mai:

Quanto vale il candidato?

---

# Architecture Check

Prima di implementare una nuova funzione chiedersi:

Questa modifica rende FRINGE:

* più semplice?
* più generale?
* più stabile?
* più coerente con il Core Model?

Se la risposta è "no", fermarsi prima di scrivere codice.

Durante lo sviluppo chiedersi sempre:

Questa logica appartiene veramente al dominio Interview?

Oppure rappresenta un comportamento generale del Core?

Nel secondo caso deve essere implementata nel Core.
