# CONTINUITÀ – FRINGE / LEAK

## Stato attuale
La demo è completamente fruibile senza backend.
Il flusso narrativo è stabile.
La variabilità è garantita anche in assenza di LLM.

## Decisioni consolidate
- Eliminato il concetto di “risposta giusta”.
- L’Osservatore esterno produce letture sintetiche, non analisi.
- Il sistema privilegia posture e scelte implicite.

## Soluzioni temporanee attive
- Osservatore procedurale locale (fallback permanente).
- Endpoint /api/observe non ancora operativo.

## Prossimo passo pianificato
- Implementazione Strada B:
  integrazione LLM reale con vincoli narrativi stringenti.
- L’LLM non deve:
  - spiegare
  - elencare ipotesi
  - quantificare
- Deve:
  - restituire una singola lettura
  - focalizzarsi su ciò che è stato protetto e sacrificato.

## Note di attenzione
- La demo deve rimanere significativa anche senza rete.
- Nessun output deve risultare identico tra run consecutive.
