import { observeWithLLM } from "./observerLLM.js";

const app = document.getElementById("app");
console.log("FRINGE LIVE", Date.now());

/* ===========================
   STATO GLOBALE
   =========================== */

let step = 0;
let externalObservation = null;

let pressureLevel = 20;
const MAX_PRESSURE = 100;

/**
 * MODELLO DEL GIOCATORE
 * Ipotesi operative, non verità
 */
let playerModel = {
  stile: "indeterminato",
  strategia: "indeterminata",
  fragilita: 0,
  rischioNarrativo: 0,
  esposizione: 0
};

/* ===========================
   INTERVENTI COGNITIVI (DEMO)
   =========================== */

const interventions = [
  {
    id: "ambiguita_guidata",
    target: "strategia",
    value: "ambiguità",
    text: [
      "Puoi rispondere senza entrare nei dettagli.\nNessuno ti sta chiedendo di chiarire tutto.",
      "Una risposta parziale non è una risposta falsa.\nDipende da cosa lasci fuori."
    ]
  },
  {
    id: "richiamo_continuita",
    target: "fragilita",
    delta: 15,
    text: [
      "Alcuni passaggi della tua risposta ricordano cose già dette.\nNon è un problema. Per ora.",
      "Non stai contraddicendo nulla.\nMa stai creando una linea che dovrai mantenere."
    ]
  },
  {
    id: "proiezione_futura",
    target: "rischioNarrativo",
    delta: 20,
    text: [
      "Questa risposta potrebbe essere riletta più avanti.\nIn un contesto diverso.",
      "Oggi non produce effetti.\nMa domani potrebbe sembrare una scelta."
    ]
  },
  {
    id: "asimmetria_responsabilita",
    target: "esposizione",
    delta: 20,
    text: [
      "Non tutti in questa stanza sono osservati allo stesso modo.",
      "Qualcuno può permettersi ambiguità.\nQualcun altro no."
    ]
  },
  {
    id: "chiusura_interpretativa",
    target: null,
    text: [
      "Non emerge una posizione definitiva.\nMa emerge un profilo.",
      "La sessione non chiarisce i fatti.\nChiarisce come ti sei mosso."
    ]
  }
];

/* ===========================
   MEMORIA LOCALE
   =========================== */

function loadPlayerModel() {
  const saved = localStorage.getItem("FRINGE_PLAYER_MODEL");
  if (saved) {
    try {
      playerModel = JSON.parse(saved);
      console.log("Profilo ricaricato", playerModel);
    } catch {}
  }
}

function savePlayerModel() {
  localStorage.setItem(
    "FRINGE_PLAYER_MODEL",
    JSON.stringify(playerModel)
  );
}

/* ===========================
   RENDER
   =========================== */

function render() {
  app.innerHTML = "";

  if (step === 0) {
    app.innerHTML = `
      <p><strong>FRINGE / LEAK</strong></p>
      <p>
        Una violazione procedurale è stata rilevata.<br>
        Non è chiaro se sia un errore,<br>
        una scorciatoia,<br>
        o qualcosa che verrà chiarito solo più avanti.
      </p>
      <p>
        Non ti viene chiesto di difenderti.<br>
        Ti viene chiesto di sostenere una posizione.
      </p>
      <button id="startBtn">Inizia</button>
    `;
    document.getElementById("startBtn").addEventListener("click", next);
    return;
  }

  if (step >= 1 && step <= interventions.length) {
    const intervention = interventions[step - 1];
    const variant =
      intervention.text[Math.floor(Math.random() * intervention.text.length)];

    app.innerHTML = `
      <p style="opacity:0.9; white-space:pre-line;">
        ${variant}
      </p>
      <textarea id="response" rows="3" style="width:100%;"></textarea>
      <button id="respondBtn">Continua</button>
    `;

    document
      .getElementById("respondBtn")
      .addEventListener("click", () =>
        handleIntervention(intervention)
      );
    return;
  }

  if (step === interventions.length + 1) {
    savePlayerModel();

    if (!externalObservation) {
      observeWithLLM({
        playerModel,
        pressureLevel,
        step,
        scenario: "FRINGE / LEAK"
      }).then(result => {
        externalObservation = result;
        render();
      });

      app.innerHTML = `<p>Analisi in corso...</p>`;
      return;
    }

    app.innerHTML = `
      <h3>NARRATORE</h3>
      <p>${narratorOutput()}</p>

      <h3>TUTOR</h3>
      <p>${tutorOutput()}</p>

      <h3>GIUDICE</h3>
      <pre>${JSON.stringify(judgeOutput(), null, 2)}</pre>

      ${
        externalObservation?.osservazione
          ? `
        <h3>OSSERVATORE ESTERNO</h3>
        <p style="opacity:0.8; font-style:italic;">
          ${externalObservation.osservazione}
        </p>`
          : ""
      }
    `;
  }
}

/* ===========================
   LOGICA INTERVENTI
   =========================== */

function handleIntervention(intervention) {
  const value = document.getElementById("response").value.trim();

  // segnali deboli, non semantici
  if (value.length < 10) pressureLevel += 10;
  if (value.length > 80) pressureLevel += 5;

  pressureLevel = Math.min(MAX_PRESSURE, pressureLevel);

  if (intervention.target) {
    if (intervention.value) {
      playerModel[intervention.target] = intervention.value;
    }
    if (intervention.delta) {
      playerModel[intervention.target] += intervention.delta;
    }
  }

  next();
}

function next() {
  step++;
  render();
}

/* ===========================
   OUTPUT
   =========================== */

function narratorOutput() {
  if (playerModel.rischioNarrativo > 40) {
    return "La tua posizione non è compromessa.\nMa è diventata leggibile.";
  }
  if (playerModel.strategia === "ambiguità") {
    return "Non hai chiarito.\nHai distribuito peso.";
  }
  return "Hai mantenuto una linea.\nSenza irrigidirla.";
}

function tutorOutput() {
  if (playerModel.esposizione > 30) {
    return "Sei entrato nel campo visivo.\nOra ne fai parte.";
  }
  return "Controllo sufficiente.\nPressione gestibile.";
}

function judgeOutput() {
  return {
    esito: pressureLevel > 70 ? "instabile" : "indeterminato",
    coerenza:
      playerModel.strategia === "ambiguità" ? "media" : "alta",
    modello_giocatore: {
      stile: playerModel.stile,
      strategia: playerModel.strategia,
      fragilita_stimata: playerModel.fragilita,
      rischio_narrativo: playerModel.rischioNarrativo,
      esposizione: playerModel.esposizione
    },
    note: [
      "Valutazione comportamentale",
      "Nessuna verifica di verità",
      "Lettura interpretativa"
    ]
  };
}

/* ===========================
   AVVIO
   =========================== */

loadPlayerModel();
render();
