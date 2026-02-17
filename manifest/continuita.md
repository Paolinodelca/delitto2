# # Continuità progetto – Demo (stato canonico)

## Sintesi canonica (da mostrare in alto)

Questa demo simula un’indagine narrativa: osservi indizi, formuli ipotesi e valuti quanto ciascuna spiega i fatti. Non esiste una risposta “giusta” immediata: il sistema pesa coerenza, copertura degli indizi e contraddizioni, e restituisce un profilo di esito.

## Layout deciso (one-pass)

* **Header**: Titolo + Sintesi canonica.
* **Didascalia a 2 colonne** (subito sotto):

  * Colonna A: Caso / Contesto.
  * Colonna B: Regole di valutazione (cosa stai giudicando, scala, vincoli).
* **Domanda principale**: centrata, con riquadro risposta subito sotto (altezza ridotta rispetto a prima).
* **Ipotesi**: elenco con descrizione breve *prima* dell’area di feedback finale.
* **Feedback finale**: esito dell’analisi + spiegazione sintetica.

## Interazioni UX (decisioni)

* **Voto singolo**: pulsanti mutuamente esclusivi; dopo il click gli altri si disabilitano.
* **Stato visivo persistente**: il pulsante scelto resta evidenziato finché non si resetta.
* **Reset esplicito**: bottone “Rivedi valutazione”.
* **Debounce**: prevenzione click multipli rapidi.

## Regole di valutazione (canoniche)

* Scala discreta (es. 1–5).
* Un voto per ipotesi per sessione.
* Il punteggio finale combina: coerenza interna, copertura indizi, penalità contraddizioni.

## Note tecniche

* Stato client per evidenziazione e lock voto.
* Validazione lato client prima dell’invio.
* Endpoint accetta un solo voto per sessionId.

## Prossimi passi (domani)

* Rifinire microcopy della didascalia.
* Test rapido con 2–3 utenti.
* Tarare pesi del profilo di esito.
