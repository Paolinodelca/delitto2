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
   INTERVENTI
   =========================== */

const interventions = [
  {
    question:
      "Descrivi con precisione perché ti trovavi in sala di controllo e cosa stavi facendo all’inizio del turno."
  },
  {
    question:
      "Quando hai lasciato la sala, cosa ti ha fatto ritenere accettabile farlo in quel momento?"
  },
  {
    question:
      "C’è un elemento di questa vicenda che, se raccontato all’esterno, cambierebbe il modo in cui verrebbe letta?"
  },
  {
    question:
      "Riguardando la sequenza degli eventi: in quale punto il sistema ha smesso di funzionare come previsto?"
  },
  {
    question:
      "Se emergesse solo una versione parziale dei fatti, chi pensi che ne pagherebbe il prezzo più alto?"
  }
];

/* ===========================
   OSSERVAZIONE RISPOSTE
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

  /* STEP 0 — INTRO + SCELTA PARTNER */
  if (step === 0) {
    app.innerHTML = `
      <h2>FRINGE / LEAK</h2>

      <p><strong>Cos’è FRINGE / LEAK</strong></p>
      <p>
        Questa è una demo esperienziale.<br>
        Ti viene chiesto di immedesimarti nella situazione descritta
        e di agire come se le conseguenze fossero reali.
      </p>
      <p>
        Puoi rispondere come faresti nella realtà oppure simulare
        consapevolmente un comportamento.<br>
        La differenza emergerà nell’esito finale.
      </p>

      <hr>

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

  /* STEP 1 — SCENARIO */
  if (step === 1) {
    app.innerHTML = `
      <p>
        Ti trovi davanti a una commissione interna.<br>
        L’audizione avviene a porte chiuse.<br>
        Le persone coinvolte nel disservizio vengono ascoltate separatamente.
      </p>

      <p>
        Non è un procedimento disciplinare.<br>
        Non è un tribunale.<br>
        È una valutazione.
      </p>

      <p>
        Durante il tuo turno di guardia al laboratorio hai sostituito il tuo responsabile,
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
        Ora devi decidere come le azioni di questa vicenda verranno lette.
      </em></p>

      <button id="startBtn">Prosegui</button>
    `;

    document.getElementById("startBtn").onclick = () => {
      step++;
      render();
    };

    return;
  }

  /* STEP 2–6 — DOMANDE */
  if (step >= 2 && step < interventions.length + 2) {
    const current = interventions[step - 2];

    app.innerHTML = `
      <p><strong>${current.question}</strong></p>

      <textarea id="answer" rows="4" style="width:100%"></textarea>
      <br><br>
      <button id="sendBtn">Invia risposta</button>

      <p style="opacity:0.6;margin-top:10px;">
        Stato di esposizione in valutazione
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

  /* STEP FINALE */
  savePlayerModel();

  if (!externalObservation) {
    observeWithLLM({
      scenario: "FRINGE / LEAK",
      pressureLevel,
      playerModel,
      answers,
      context: {
        responsabile: "Walter",
        amico: "Alex",
        partner: partnerName
      }
    }).then(result => {
      externalObservation = result;
      render();
    });

    app.innerHTML = `<p>Valutazione in corso...</p>`;
    return;
  }

  app.innerHTML = `
    <h3>NARRATORE</h3>
    <p>${narratorOutput()}</p>

    <h3>TUTOR</h3>
    <p>${tutorOutput()}</p>

    <h3>GIUDICE</h3>
    <p><strong>Esito:</strong> ${judgeEsito()}</p>

    <p><em>Profilo osservato:</em></p>
    <ul>
      <li>Stile comunicativo: ${playerModel.stile}</li>
      <li>Strategia emersa: ${playerModel.strategia}</li>
      <li>Fragilità esposta: ${playerModel.fragilita > 0 ? "sì" : "no"}</li>
      <li>Rischio narrativo: ${playerModel.rischioNarrativo > 0 ? "presente" : "contenuto"}</li>
    </ul>

    <p style="opacity:0.7;">
      Metodo di valutazione: comportamentale, non fattuale, sotto pressione.
    </p>

    ${
      externalObservation?.osservazione
        ? `<h3>OSSERVATORE ESTERNO</h3>
           <p style="font-style:italic; opacity:0.85;">
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
    return "La tua posizione resta sostenibile, ma lascia spazio a letture divergenti.";
  }
  if (pressureLevel > 60) {
    return "Ogni risposta ha contribuito ad aumentare il peso interpretativo della vicenda.";
  }
  return "Hai sostenuto l’audizione senza una frattura evidente.";
}

function tutorOutput() {
  if (playerModel.stile === "elusivo") {
    return "Hai evitato l’esposizione diretta. Questo riduce l’impatto immediato, ma non cancella le tracce.";
  }
  if (playerModel.stile === "assertivo") {
    return "Hai scelto di esporre la tua posizione. Questo accelera la valutazione, nel bene e nel male.";
  }
  return "Hai mantenuto una postura di contenimento e controllo.";
}

function judgeEsito() {
  return pressureLevel > 70 ? "posizione instabile" : "valutazione indeterminata";
}

/* ===========================
   AVVIO
   =========================== */

loadPlayerModel();
render();
