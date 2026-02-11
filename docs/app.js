import { observeWithLLM } from "./observerLLM.js";

const app = document.getElementById("app");
console.log("FRINGE LIVE", Date.now());

let step = 0;
let pressureLevel = 0;
const MAX_PRESSURE = 100;

let externalObservation = null;
const answers = [];

/* ===========================
   SCELTE INIZIALI
   =========================== */

let partnerName = "Eva";

/* ===========================
   MODELLO GIOCATORE
   =========================== */

let playerModel = {
  stile: "indeterminato",
  strategia: "indeterminata",
  fragilita: 0,
  rischioNarrativo: 0,
  esposizione: 0
};

/* ===========================
   PERSISTENZA
   =========================== */

function loadPlayerModel() {
  const saved = localStorage.getItem("FRINGE_PLAYER_MODEL");
  if (saved) {
    try {
      playerModel = JSON.parse(saved);
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
   INTERVENTI COGNITIVI
   =========================== */

const interventions = [
  {
    observer: "Osservazione",
    question:
      "Descrivi con precisione perché ti trovavi in sala di controllo e cosa stavi facendo all’inizio del turno."
  },
  {
    observer: "Osservazione",
    question:
      "Quando hai lasciato la sala, cosa ti ha fatto credere che il sistema sarebbe rimasto sotto controllo?"
  },
  {
    observer: "Osservazione",
    question:
      "Se una parte di questa vicenda venisse raccontata fuori da qui, pensi che verrebbe letta allo stesso modo?"
  },
  {
    observer: "Osservazione",
    question:
      "Riguardando la sequenza degli eventi: in quale momento il sistema ha smesso di funzionare come previsto?"
  },
  {
    observer: "Osservazione",
    question:
      "Se domani emergesse solo una versione parziale dei fatti, non sei tu quello che rischia più di tutti?"
  }
];

/* ===========================
   LOGICA DI OSSERVAZIONE
   =========================== */

function evaluateAnswer(text) {
  if (text.length < 12) {
    pressureLevel += 20;
    playerModel.fragilita += 15;
    playerModel.esposizione += 10;
    playerModel.stile = "elusivo";
  } else if (/forse|non so|non ricordo/i.test(text)) {
    pressureLevel += 15;
    playerModel.strategia = "ambiguità";
    playerModel.rischioNarrativo += 10;
  } else if (text.length > 120) {
    pressureLevel -= 5;
    playerModel.stile = "assertivo";
    playerModel.esposizione += 15;
  } else {
    pressureLevel += 5;
    playerModel.stile = "prudente";
  }

  pressureLevel = Math.max(0, Math.min(MAX_PRESSURE, pressureLevel));
}

/* ===========================
   RENDER
   =========================== */

function render() {
  app.innerHTML = "";

  // STEP 0 — SCELTA PARTNER
  if (step === 0) {
    app.innerHTML = `
      <h2>FRINGE / LEAK</h2>
      <p><strong>Sessione di valutazione preliminare</strong></p>

      <p>
        Prima di iniziare, indica chi è la persona con cui hai una relazione personale
        coinvolta indirettamente nella vicenda.
      </p>

      <button id="eva">Eva</button>
      <button id="adamo">Adamo</button>
    `;

    document.getElementById("eva").onclick = () => {
      partnerName = "Eva";
      step++;
      render();
    };

    document.getElementById("adamo").onclick = () => {
      partnerName = "Adamo";
      step++;
      render();
    };

    return;
  }

  // STEP 1 — SCENARIO
  if (step === 1) {
    app.innerHTML = `
      <p>
        Ti trovi davanti a una commissione interna.<br>
        L’audizione si svolge a porte chiuse.<br>
        Le persone coinvolte nel disservizio vengono ascoltate separatamente.
      </p>

      <p>
        Non è una seduta disciplinare.<br>
        Non è un procedimento giudiziario.<br>
        È una valutazione.
      </p>

      <p>
        Durante il tuo turno di guardia al laboratorio, hai sostituito il tuo responsabile,
        Walter, su sua richiesta.<br>
        In sala di controllo era presente anche Alex, un tuo amico di lunga data.
      </p>

      <p>
        Durante il turno sei stato contattato da ${partnerName},
        che si trovava al capannone logistico.<br>
        Hai lasciato temporaneamente la sala, chiedendo ad Alex di avvisarti in caso di necessità.
      </p>

      <p>
        Un’ispezione successiva ha trovato la sala di controllo sguarnita.
      </p>

      <p><em>
        Quello che è successo è successo.<br>
        Ora stai decidendo come le azioni di questa vicenda verranno lette.
      </em></p>

      <button id="startBtn">Inizia l’audizione</button>
    `;

    document.getElementById("startBtn").onclick = () => {
      step++;
      render();
    };
    return;
  }

  // STEP 2–6 — INTERVENTI
  if (step >= 2 && step < interventions.length + 2) {
    const current = interventions[step - 2];

    app.innerHTML = `
      <p><strong>${current.question}</strong></p>

      <textarea id="answer" rows="4" style="width:100%"></textarea>
      <br><br>
      <button id="sendBtn">Invia risposta</button>

      <p style="opacity:0.6;margin-top:10px;">
        Livello di esposizione: ${pressureLevel}
      </p>
    `;

    document.getElementById("sendBtn").onclick = () => {
      const value = document.getElementById("answer").value.trim();
      answers.push(value);
      evaluateAnswer(value);
      step++;
      render();
    };
    return;
  }

  // STEP FINALE — VALUTAZIONE
  savePlayerModel();

  if (!externalObservation) {
    observeWithLLM({
      playerModel,
      pressureLevel,
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
        ? `<h3>OSSERVATORE ESTERNO</h3>
           <p style="opacity:0.8;font-style:italic;">
             ${externalObservation.osservazione}
           </p>`
        : ""
    }
  `;
}

/* ===========================
   OUTPUT
   =========================== */

function narratorOutput() {
  if (playerModel.strategia === "ambiguità") {
    return "La tua posizione resta in equilibrio, ma apre più di una possibile lettura.";
  }
  if (pressureLevel > 60) {
    return "Ogni risposta ha aumentato il peso interpretativo della vicenda.";
  }
  return "Hai sostenuto l’audizione senza una frattura evidente.";
}

function tutorOutput() {
  if (playerModel.stile === "elusivo") {
    return "Evitare è una strategia. Ma lascia tracce.";
  }
  if (playerModel.stile === "assertivo") {
    return "Esporsi accelera la lettura, anche quando non la controlli.";
  }
  return "Hai mantenuto una postura contenitiva.";
}

function judgeOutput() {
  return {
    esito: pressureLevel > 70 ? "instabile" : "indeterminato",
    modello_giocatore: playerModel,
    note: [
      "Valutazione comportamentale",
      "Nessuna verifica fattuale",
      "Osservazione sotto pressione"
    ]
  };
}

/* ===========================
   AVVIO
   =========================== */

loadPlayerModel();
render();
