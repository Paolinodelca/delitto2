## Narrative Data Migration

Giugno 2026

Completata la prima migrazione verso Narrative Data esterni.

Implementato:

src/report/narrativeData/normalization/care_helping_professions.json

e relativo loader:

src/report/narrativeProfiles/cvReviewNormalizationProfiles.js

Il normalizzatore CV Review non contiene più hardcoding specifici per il caso Giulia.

Direzione architetturale confermata:

codice = logica

narrativeData = contenuti

Obiettivo finale:

- nessun testo professionale nei builder
- nessun vocabolario professionale nei motori
- tutte le narrative in file dati modulari
- aggiunta nuove famiglie e lingue tramite sostituzione/aggiunta file dati completi

Prossima milestone:

Narrative Data Architecture V1
(roleFamilies, roleTargets, rewriteOutput, localization strategy).

## Decisione strategica importante

La bonifica hardcoding non è considerata conclusa quando i testi vengono spostati da un builder a un file .js.

La bonifica sarà considerata conclusa solo quando:

* i contenuti saranno in Narrative Data esterni
* il motore leggerà tali dati tramite loader
* nuove famiglie e nuove lingue potranno essere aggiunte tramite sostituzione o aggiunta di file dati completi

Questa è la direzione architetturale ufficiale del progetto.
