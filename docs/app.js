import { observeWithLLM } from "./observerLLM.js";

const app = document.getElementById("app");
console.log("FRINGE LIVE", Date.now());

let step = 0;
let pressureLevel = 0;
const MAX_PRESSURE = 100;

let externalObservation = null;
const answers = [];

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
   PERSONAGGI
   =========================== */

let partnerName = null;

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
    observer: "Magistrato",
    question:
      "Durante quel turno eri formalmente responsabile della sala di controllo. Chi ha deciso la sostituzione e su quali basi?"
  },
  {
    observer: "Analista",
    question:
      "Quando hai lasciato la sala, cosa ti ha fatto credere che tutto sarebbe rimasto sotto controllo?"
  },
  {
    observer: "Giornalista",
    question:
      "Sei consapevole che una parte di questa vicenda, se raccontata fuori da qui, cambierebbe il modo in cui verrebbe letta all’interno dell’azienda?"
  },
  {
    observer: "Magistrato",
    question:
      "Riguardando la sequenza degli eventi: in quale momento ritieni che il sistema abbia smesso di funzionare come previsto?"
  },
  {
    observer: "Giornalista",
    question:
      "Se domani emergesse solo una versione parziale dei fatti, chi risulterebbe più esposto?"
  }
];

/* ===========================
   LOGICA DI PRESSIONE
   =========================== */

function evaluateAnswer(text) {
  if (text.length < 10) {
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

  /* STEP 0a — SCELTA PARTNER */
  if (step === 0) {
    app.innerHTML = `
      <h2>FRINGE / LEAK</h2>
      <p><strong>Sessione di valutazione preliminare</strong></p>

      <p>
        Prima di iniziare, scegli chi è la persona con cui hai una relazione personale.
      </p>

      <button id="evaBtn">Eva (partner)</button>
      <button id="adamoBtn">Adamo (partner)</button>
    `;

    document.getElementById("evaBtn").onclick = () => {
      partnerName = "Eva";
      step = 1;
      render();
    };

    document.getElementById("adamoBtn").onclick = () => {
      partnerName = "Adamo";
      step = 1;
      render();
    };

    return;
  }

  /* STEP 0b — SCENARIO */
  if (step === 1) {
    app.innerHTML = `
      <p><strong>Il contesto</strong></p>

      <p>
        Lavori in un laboratorio dove vengono trattate informazioni sensibili.
        Durante un turno di guardia, il tuo responsabile diretto, <strong>Walter</strong>,
        ti ha chiesto di sostituirlo per alcune incombenze personali che non ha voluto specificare.
      </p>

      <p>
        Accetti la sostituzione. In sala di controllo rimani insieme a <strong>Alex</strong>,
        un tuo amico di lunga data.
      </p>

      <p>
        Durante il turno ricevi una chiamata da <strong>${partnerName}</strong>,
        dal capannone di logistica. Ti chiede di raggiunger${partnerName === "Eva" ? "la" : "lo"} subito.
        Dopo una breve esitazione, lasci la sala, raccomandando ad Alex di avvisarti in caso di problemi.
      </p>

      <p>
        Un’ora dopo, una visita ispettiva trova la sala di controllo sguarnita.
        Nessuno dei tre — tu, Alex, Walter — è presente.
      </p>

      <p><em>
        Non stai decidendo cosa è successo.<br>
        Stai decidendo come questa situazione verrà letta.
      </em></p>

      <button id="startBtn">Inizia la sessione</button>
    `;

    document.getElementById("startBtn").onclick = () => {
      step = 2;
      render();
    };

    return;
  }

  /* STEP 2–6 — INTERVENTI */
  if (step >= 2 && step < 2 + interventions.length) {
    const current = interventions[step - 2];

    app.innerHTML = `
      <h3>${current.observer}</h3>
      <p>${current.question}</p>

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

  /* STEP FINALE — VALUTAZIONE */
  if (step >= 2 + interventions.length) {
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
          ? `<h3>OSSERVATORE ESTERNO</h3>
             <p style="opacity:0.8;font-style:italic;">
               ${externalObservation.osservazione}
             </p>`
          : ""
      }
    `;
  }
}

/* ===========================
   OUTPUT
   =========================== */

function narratorOutput() {
  if (playerModel.strategia === "ambiguità") {
    return "La tua posizione regge, ma lascia margini di interpretazione.";
  }
  if (pressureLevel > 60) {
    return "Ogni parola ha aumentato il peso della lettura.";
  }
  return "Hai attraversato la sessione senza un crollo evidente.";
}

function tutorOutput() {
  if (playerModel.stile === "elusivo") {
    return "Evitare è una tecnica. Ma ha un costo.";
  }
  if (playerModel.stile === "assertivo") {
    return "Esporsi chiaramente accelera la valutazione.";
  }
  return "Hai mantenuto una postura di controllo.";
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
