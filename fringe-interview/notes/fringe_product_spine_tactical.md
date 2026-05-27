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

