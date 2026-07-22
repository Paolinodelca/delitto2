# Measurement and Observation Foundation

## Contratti
`Evidence` resta il dato estratto già esistente, anche contenente testo utile alla pipeline legacy. `Measurement` delimita cosa viene analizzato, da quali riferimenti, con quale scope, target e metodo. `Observation` registra un segnale atomico tracciabile senza copiare la fonte. `MeasurementResult` normalizza le sole osservazioni di una Measurement per una caratteristica.

Le Observation non vengono sommate direttamente: volume documentale e numero di domande non equivalgono a maggiore evidenza. La baseline raggruppa osservazioni ridondanti tramite `independenceGroup`, oppure tramite una chiave deterministica composta da fonte, posizione, caratteristica, tipo di segnale e fingerprint; per gruppo usa il segnale con qualità combinata più alta.

`normalizedValue` è una media pesata limitata a [-1,1]. I pesi espliciti sono confidence × evidenceQuality × sourceReliability. `coverage` dipende dal numero di gruppi indipendenti rispetto a `expectedIndependentSignals` (default 3), non dal valore. `confidence`, qualità, affidabilità, independence e consistency restano campi separati. Questa è una baseline tecnica sostituibile, non una misura scientificamente validata.

## Separazione tra Knowledge e Interpretation
Observation rappresenta il segnale osservato. MeasurementResult rappresenta la sintesi normalizzata della singola misurazione. Nessuno dei due valuta la persona. Prospettive di recruiter, CEO, responsabile tecnico, ruolo o organizzazione appartengono a un futuro layer `Perspective / Interpretation` e non modificano la conoscenza memorizzata.

## Minimizzazione
I nuovi oggetti usano riferimenti opachi; non contengono nome, email, CV, transcript, risposte complete, prompt o report. Questo consente in futuro di separare Identity Store e Knowledge Store e di costruire un KnowledgeState aggregato senza archivio monolitico.

Restano aperti: tassonomia, calibrazione scientifica, strategie semantiche avanzate di deduplicazione, KnowledgeState e interpretazioni per prospettiva.
