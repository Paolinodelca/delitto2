# FRINGE INTERVIEW — Manifesto operativo

## Visione
FRINGE INTERVIEW è un'applicazione che aiuta una persona a capire come risultano le sue risposte in un colloquio.

Non misura la verità assoluta.
Non assegna un voto scolastico.
Non pretende di sostituire il giudizio umano.

Rende leggibile:
- come il candidato entra nella domanda
- quanto resta concreto
- quanto si espone
- quanto si difende
- quanto resta aderente al ruolo

---

## Problema che affronta
Molti candidati:
- parlano in modo generico
- usano slogan invece di esempi
- non adattano le risposte al ruolo
- non capiscono come risultano sotto pressione

FRINGE INTERVIEW serve a trasformare questa zona vaga in una lettura utile e praticabile.

---

## Obiettivo MVP
Permettere a un utente di:
1. inserire CV e ruolo target
2. simulare un colloquio breve
3. ricevere un report chiaro
4. rifare la simulazione migliorando

---

## Principio
Non esistono risposte perfette in astratto.
Esistono risposte più o meno forti rispetto a:
- un ruolo
- una domanda
- una pressione
- una lettura esterna

---

## Elementi chiave
- parsing CV
- parsing job description
- domande stabili con varianti
- follow-up adattivi
- report finale utile
- modularità piena rispetto al motore FRINGE

---

## Modulo strategico
### CV ↔ Job Fit
Il sistema deve poter leggere un annuncio incollato dall’utente e trasformarlo in un profilo strutturato.

Questo consente:
- integrazione rapida
- minor fatica utente
- simulazione più aderente
- futura monetizzazione premium

---

## Output atteso
Il report deve aiutare a capire:
- come il candidato risulta
- dove convince
- dove perde forza
- cosa rifarebbe meglio al secondo tentativo

---

## Regola di progetto
Fringe Interview non deve essere scritto “dentro” il motore.
Deve vivere sopra il motore come applicazione separata e configurabile.