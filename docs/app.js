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
   DOMANDE (INTERVENTI)
   =========================== */

const interventions = [
  {
    observer: "Magistrato",
    question:
      "Descrivi con precisione perché ti trovavi lì e cosa stavi facendo."
  },
  {
    observer: "Giornalista",
    question:
      "C’è qualcosa che non hai ritenuto necessario dire finora?"
  },
  {
    observer: "Analista",
    question:
      "Stai cercando di proteggere qualcuno, o solo te stesso?"
  },
  {
    observer: "Magistrato",
    question:
      "Rileggi mentalmente le tue risposte precedenti. C’è una contraddizione?"
  },
  {
    observer: "Giornalista",
    question:
      "Se questa versione diventasse pubblica, cosa verrebbe messo in dubbio?"
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

  // STEP 0 — SCENARIO (rafforzato)
  if (step === 0) {
    app.innerHTML = `
      <h2>FRINGE / LEAK</h2>
      <p><strong>Il colloquio impossibile</strong></p>

      <p>
        Non sei qui per ricostruire i fatti.<br>
        Sei qui perché <em>qualcuno</em> deve capire come leggerli.
      </p>

      <p>
        Fuori da questa stanza ci sono persone coinvolte indirettamente:
      </p>

      <ul>
        <li>un responsabile che ti ha dato accesso e ora rischia per riflesso</li>
        <li>un amico che condivideva confini informali del lavoro</li>
        <li>un partner estraneo ai fatti, ma non alle conseguenze</li>
      </ul>

      <p>
        Nessuno di loro è presente.<br>
        Ma ogni risposta che darai potrà avvicinarli o allontanarli dal problema.
      </p>

      <p><em>
        Non stai decidendo cosa è successo.<br>
        Stai decidendo come questa situazione verrà letta.
      </em></p>

      <button id="startBtn">Inizia</button>
    `;

    document.getElementById("startBtn").onclick = () => {
      step++;
      render();
    };
    return;
  }

  // STEP 1–5 — DOMANDE
  if (step >= 1 && step <= interventions.length) {
    const current = interventions[step - 1];

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

  // STEP FINALE — VALUTAZIONE
  if (step > interventions.length) {
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
  return "Hai attraversato l’interrogatorio senza crollare.";
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
