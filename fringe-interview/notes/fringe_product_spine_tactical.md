# FRINGE — Product Spine Tactical

## Priorità non negoziabile

FRINGE non deve diventare un semplice questionario.

FRINGE deve simulare il comportamento cognitivo di un recruiter:
- capisce se la risposta centra la domanda
- decide se scavare
- riformula se il candidato non capisce
- insiste se vede pattern ricorrenti
- distingue risposta debole da risposta fuori asse
- legge CV, ruolo, risposte e traiettoria come un sistema unico

---

## Architettura da preservare

Separare sempre:

1. Question engine
2. Adaptive follow-up engine
3. Interviewer behavior layer
4. Report / coaching layer

Non duplicare question bank o follow-up pack per ogni stile recruiter.

Lo stile deve essere un layer sopra:
- tone
- pressure
- escalation
- wording
- tolerance to vagueness
- number/intensity of probes

---

## Direzione prodotto

### FREE
- quick scan
- poche domande
- pochi affondi
- fa percepire il problema

### PRO
- interview trainer
- affondi adaptive reali
- report operativo
- suggerimenti migliorativi
- output stampabile/usabile

### PREMIUM
- recruiter simulation avanzata
- stili interviewer
- affondi multipli
- tracking errori nel tempo
- confronto tra tentativi
- progressione del profilo

---

## Modalità colloquio

Non creare “modalità finta” senza affondi.

Tutte le interviste devono essere vive.

Differenziare invece per intensità:

- Quick Scan: 4–5 domande, affondi solo critici
- Standard: 7–8 domande, affondi moderati
- Deep Simulation: 10–12 domande, affondi multipli e pressione più alta

---

## Stili interviewer futuri

Da implementare come behavior layer, non come set separati di domande.

Stili possibili:
- supportive
- standard
- incisive
- pressure
- business_direct
- technical
- executive

Lo stesso affondo può cambiare tono.

Esempio:
- supportive: “Provo a riformulare meglio…”
- incisive: “Mi manca ancora il punto centrale…”
- pressure: “Ti sto ancora sentendo molto generale…”
- executive: “In una frase: cosa hai scelto e cosa hai sacrificato?”

---

## Adaptive follow-up: stato attuale

Già verificati localmente:

- `consistency_probe`
- `decision_tradeoff_probe`

Entrambi:
- vengono selezionati
- vengono iniettati nella timeline
- diventano currentStep
- usano la domanda originale
- producono prompt question-aware

Questa è una feature centrale, non secondaria.

---

## Prossime 3–4 settimane

1. Stabilizzare adaptive follow-up nel flusso reale
2. Definire taglie intervista: Quick / Standard / Deep
3. Introdurre tracking pattern errori:
   - genericità
   - ownership debole
   - non aderenza
   - mancanza outcome
   - risposta duplicata
   - trade-off non esplicitato
4. Rendere “Come puoi rafforzarla” progressivo e non ripetitivo
5. Preparare output PRO stampabile
6. Solo dopo: PREMIUM come evoluzione, non come “più testo”

---

## Da non perdere

Career Targeting e Orientation restano verticali futuri validi.

Ma prima va consolidato Interview Trainer, perché è il laboratorio principale del motore.

Direzione lunga:
FRINGE evolve da simulatore colloquio a motore di lettura, confronto e coaching del profilo.

Principio da fissare

Questo:

The engine should always generate the richest possible analysis.

Product plans (FREE / PRO / PREMIUM) should NOT change the engine logic.

They should only control:
- visibility
- enabled behaviors
- accessible recruiter styles
- rendering capabilities
- adaptive intensity
- coaching depth

through configuration-driven capability policies.

Questo è il cuore.

3. Regola CRITICA

Mai fare:

if (premium)

nel runtime o renderer.

Ma:

if (capabilities.showRecruiterPanel)

oppure:

if (capabilities.enableAdaptivePressure)

# ROADMAP PRIORITARIA — PROFESSIONAL PERCEPTION LAYER

## Osservazione strategica

Durante la preparazione del beta è emersa una possibile evoluzione fondamentale del valore percepito di FRINGE.

Oggi il sistema analizza molto bene:

* singole risposte
* punti deboli
* punti forti
* ownership
* decision
* synthesis
* friction
* positioning
* motivation for change
* transferability

Tuttavia il report è ancora fortemente orientato al dettaglio.

Il candidato potrebbe ancora chiedersi:

> "Nel complesso, che impressione sto dando?"

---

## Intuizione chiave

Il candidato non compra realmente:

* una simulazione
* un report
* l'analisi di 20 risposte

Compra invece:

> una comprensione migliore di come viene percepito professionalmente.

Il colloquio è il meccanismo.

La percezione professionale è il beneficio.

---

# FUTURA SEZIONE AD ALTO VALORE

## Professional Perception Summary

Possibili nomi:

* Percezione Professionale Emergente
* Come stai venendo percepito
* Professional Perception Summary

---

## 1. Immagine professionale emergente

Sintesi narrativa:

* che figura professionale emerge
* quali segnali dominano
* quali segnali sono poco visibili

Esempio:

> Emerge una figura credibile sul piano operativo e dell'affidabilità esecutiva. Emergono meno chiaramente leadership, influenza e gestione di decisioni complesse.

---

## 2. Percezione richiesta dal ruolo target

Partendo dal ruolo desiderato:

* quali segnali il ruolo tende a ricercare
* quali comportamenti vengono normalmente associati a quel livello professionale

Non come regole assolute.

Ma come tendenze.

---

## 3. Gap di percezione

NON:

> ti manca la leadership

MA:

> la leadership potrebbe esistere, ma oggi non emerge con sufficiente evidenza nelle risposte fornite.

Distinguere sempre:

* assenza reale
* assenza di evidenza

---

## 4. Piano di evoluzione della percezione

Non migliorare la singola risposta.

Ma:

> Come essere percepito più vicino al ruolo target.

Esempi:

* mostrare più criteri decisionali
* esplicitare maggiormente ownership e responsabilità
* quantificare l'impatto
* raccontare meglio trade-off e priorità
* evidenziare coordinamento e influenza

---

## 5. Time To Impact percepito

Recuperare il concetto storico di FRINGE:

> Quanto rapidamente il selezionatore potrebbe immaginare che il candidato generi valore nel ruolo.

Non basato sulle competenze assolute.

Basato sui segnali emersi.

---

# POSIZIONAMENTO FUTURO

Possibile evoluzione del messaggio di prodotto:

Da:

> Simulatore di colloquio

Verso:

> Sistema di analisi della percezione professionale.

---

# PRIORITÀ

Questa evoluzione è considerata una delle future roadmap ad altissimo impatto sul valore percepito del report.

Probabilmente più importante di molte ottimizzazioni tecniche aggiuntive.

Da affrontare DOPO:

* candidate experience
* onboarding
* beta test iniziale

ma PRIMA di molte altre estensioni del report.

