# IMAGO CORE MODEL

## Perché esiste questo documento

Questo documento raccoglie i principi fondanti di FRINGE.

Non descrive il codice.

Descrive le decisioni di prodotto che **non devono essere rimesse in discussione ad ogni sviluppo**.

Ogni nuova funzionalità, prompt, renderer o role family dovrà essere coerente con questi principi.

---

# 1. Missione di FRINGE

FRINGE non è un simulatore di colloqui.

FRINGE è un motore che aiuta il candidato a comprendere **come la propria storia professionale viene percepita durante un colloquio** e come renderla più chiara, credibile e coerente con il ruolo desiderato.

L'obiettivo non è preparare risposte perfette.

L'obiettivo è rendere visibile il valore reale del candidato.

---

# 2. Cosa FRINGE NON fa

FRINGE non valuta la persona.

Non assegna un valore al candidato.

Non misura il talento.

Non decide se il candidato sia "bravo" oppure "scarso".

Il soggetto dell'analisi è sempre:

* la candidatura;
* il CV;
* le risposte;
* la narrazione;
* la percezione che ne deriva.

Mai la persona.

---

# 3. La domanda fondamentale

Tutto il prodotto deve rispondere a una sola domanda.

> Quanto di ciò che il candidato è realmente riesce ad arrivare al selezionatore?

Questa domanda guida:

* il colloquio;
* l'analisi;
* il report;
* i suggerimenti;
* le future evoluzioni.

---

# 4. Il modello di lettura di FRINGE

La candidatura viene interpretata attraverso cinque pilastri.

## 4.1 Credibilità narrativa

Il candidato riesce a rendere credibile la propria esperienza?

Segnali tipici:

* esempi concreti;
* responsabilità personale;
* risultati;
* chiarezza;
* coerenza.

---

## 4.2 Competenze

Il candidato rende visibili le competenze richieste dal ruolo?

Le competenze NON sono codificate manualmente.

Vengono ricavate dinamicamente da:

* CV;
* Job Description;
* ruolo;
* seniority.

---

## 4.3 Maturità professionale

Come ragiona il candidato?

Non riguarda ciò che sa.

Riguarda il modo in cui affronta:

* decisioni;
* priorità;
* ambiguità;
* trade-off;
* responsabilità.

---

## 4.4 Fit

Quanto il candidato appare coerente con il contesto specifico?

Il fit dipende da:

* azienda;
* ruolo;
* cultura;
* livello di seniority.

Non è una caratteristica assoluta della persona.

---

## 4.5 Potenziale

Quanto il candidato lascia intuire di poter crescere?

Il potenziale è indipendente dalle competenze attuali.

Può emergere attraverso:

* apprendimento;
* adattabilità;
* curiosità;
* riflessione;
* evoluzione.

---

# 5. Il ruolo dell'LLM

L'LLM NON sostituisce FRINGE.

FRINGE rimane il motore stabile.

L'LLM costruisce la mappa del ruolo.

Input:

* CV;
* Job Description;
* esperienza;
* settore.

Output:

Role Credibility Map.

Questa mappa descrive cosa deve emergere per risultare credibili in quello specifico ruolo.

---

# 6. Le Role Family

Le Role Family NON devono contenere centinaia di regole.

Devono rappresentare modelli interpretativi.

La conoscenza specifica del ruolo viene generata dinamicamente.

Le famiglie definiscono il linguaggio, il tono e la logica di interpretazione.

---

# 7. Filosofia dei feedback

Ogni feedback deve aiutare.

Mai giudicare.

Non:

"Questa risposta è debole."

Preferire:

"Questo elemento della tua esperienza oggi non emerge ancora con sufficiente chiarezza."

Il candidato deve terminare il report sapendo:

* cosa preparare;
* cosa rendere più visibile;
* come raccontare meglio la propria esperienza.

Mai con la sensazione di essere stato giudicato.

---

# 8. Principio guida

Un selezionatore non assume competenze.

Assume una previsione di successo.

FRINGE aiuta il candidato a capire se quella previsione viene costruita in modo convincente durante il colloquio.

---

# 9. Regola architetturale

Quando nasce una nuova funzionalità bisogna sempre chiedersi:

"Questa funzione rende più chiara la percezione della candidatura oppure introduce semplicemente complessità?"

Se introduce solo complessità, probabilmente non appartiene al Core Model.

---

# 10. Visione

L'obiettivo finale di FRINGE non è insegnare a rispondere.

È aiutare ogni candidato a rendere visibile il proprio valore professionale nel modo più autentico, credibile e coerente possibile.

NOTA AGGIUNTA:
La vera unità fondamentale di FRINGE non è la domanda.

Non è la risposta.

Non è il report.

È l'evidenza osservabile.

Tutto il sistema esiste per trasformare informazioni grezze in evidenze osservabili, confrontarle con un modello di riferimento e produrre azioni utili.

NOTA:
Il RoleModel è la prima specializzazione del concetto generale di Reference Model.

NOTA:
Il Core non conosce il concetto di intervista. Conosce solo strategie di raccolta delle evidenze. L'intervista è una specializzazione della Collection Strategy.