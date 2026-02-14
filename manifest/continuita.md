# CONTINUITÀ – FRINGE / LEAK

## Stato attuale
La demo è completamente fruibile senza backend.
Il flusso narrativo è stabile e testato fino all’esito finale.
Il sistema produce un esito significativo anche in assenza di LLM reale.
È attiva una versione estesa dell’output finale con più letture concorrenti.

## Decisioni consolidate
- Eliminato definitivamente il concetto di “risposta giusta”.
- Il valore emerge dalla postura complessiva, non dal contenuto fattuale.
- L’Osservatore esterno non spiega il sistema né le sue logiche.
- Le letture finali possono essere multiple, ma restano **mutuamente coerenti**.
- Il linguaggio privilegia:
  - esposizione implicita
  - difese
  - costi silenziosi delle scelte

## Soluzioni temporanee attive
- Osservatore procedurale locale come fallback permanente.
- Endpoint `/api/observe` non ancora affidabile in produzione.
- In caso di errore:
  - viene restituito un testo narrativo coerente
  - la demo non segnala il fallback al giocatore

## Struttura attuale dell’esito finale
- NARRATORE: restituisce coerenza e andamento del racconto.
- TUTOR: evidenzia la postura adottata.
- GIUDICE: produce un esito non binario.
- OSSERVATORE ESTERNO:
  - può produrre più letture alternative
  - le letture sono pensate come “interpretazioni concorrenti”
  - nessuna viene dichiarata vera

## Test in corso
- Introduzione del ranking 🥇🥈🥉 sulle letture finali.
- Obiettivo del ranking:
  - misurare quale tipo di feedback risulta più memorabile
  - raccogliere dati qualitativi, non punteggi di performance
- Il voto non influenza l’esito della demo.
- Il voto serve esclusivamente a orientare le scelte di design future.

## Prossimo passo pianificato
### Implementazione Strada B
- Integrazione LLM reale con vincoli narrativi stringenti.
- L’LLM **non deve**:
  - spiegare il sistema
  - elencare opzioni o ipotesi
  - quantificare comportamenti o probabilità
- L’LLM **deve**:
  - produrre una lettura unica per prompt
  - mantenere un tono coerente con FRINGE / LEAK
  - focalizzarsi su:
    - cosa è stato protetto
    - cosa è stato sacrificato
    - che immagine del sé emerge

## Linee guida per i prompt (consolidate)
- Una sola voce per output.
- Lunghezza contenuta (sensazione di sintesi, non di report).
- Nessuna morale esplicita.
- Nessuna istruzione al soggetto.
- Il testo deve poter essere ricordato, non “capito”.

## Note di attenzione
- La demo deve rimanere significativa anche offline.
- Nessun output deve risultare identico tra run consecutive.
- Le differenze tra letture devono essere **di interpretazione**, non di fatti.
- Il sistema non deve mai chiedere al giocatore di “scegliere chi è”.
  Lo deduce. O meglio: lo suggerisce, lasciando un residuo di ambiguità.

## Stato mentale del progetto
Il progetto è stabile.
Non è in fase esplorativa.
Le prossime modifiche devono essere incrementali, non correttive.
