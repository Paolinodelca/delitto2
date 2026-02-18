import { observeWithLLM } from "./observerLLM.js";

const app = document.getElementById("app");
console.log("FRINGE LIVE", Date.now());

let step = 0;
let pressureLevel = 0;
const MAX_PRESSURE = 100;

let externalObservations = null;
const answers = [];
const observedAnchors = [];
const inputQualities = []; // 👈 NUOVO

let voteRanking = { primo: null, secondo: null, terzo: null };
let votedButtons = { primo: null, secondo: null, terzo: null };
let voteSubmitted = false;

/* ===========================
   STILE
=========================== */
const style = document.createElement("style");
style.innerHTML = `
  .selected-vote {
    outline: 3px solid #000;
    background-color: #ddd;
  }
  button[disabled] {
    opacity: 0.5;
    cursor: not-allowed;
  }
  .didascalia {
    color: #111;
    display: grid;
    grid-template-columns: 1fr;
    gap: 8px;
    padding: 14px;
    margin-bottom: 16px;
    background: #f2f2f2;
    border: 1px solid #999;
    font-size: 0.95rem;
  }
  .didascalia strong {
    color: #000;
  }
`;
document.head.appendChild(style);

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
   DOMANDE
=========================== */

const interventions = [
  { question: "Descrivi con precisione perché ti trovavi in sala di controllo e cosa stavi facendo all’inizio del turno." },
  { question: "Quando hai lasciato la sala, cosa ti ha fatto ritenere accettabile farlo in quel momento?" },
  { question: "C’è un elemento di questa vicenda che, se raccontato all’esterno, cambierebbe il modo in cui verrebbe letta?" },
  { question: "Riguardando la sequenza degli eventi: in quale punto il sistema ha smesso di funzionare come previsto?" },
  { question: "Se emergesse solo una versione parziale dei fatti, chi pensi che ne pagherebbe il prezzo più alto?" }
];

/* ===========================
   DIDASCALIA
=========================== */

function renderDidascalia() {
  return `
    <div class="didascalia">
      <strong>Contesto operativo</strong>
      <div>
        Lavori in un’azienda con elevati standard di sicurezza.<br>
        Hai sostituito il tuo responsabile diretto durante il turno.<br>
        Per un periodo limitato si è creata una potenziale falla nel perimetro.
      </div>

      <strong>Persone coinvolte</strong>
      <div>
        <strong>Walter</strong>: responsabile diretto, assente durante il turno.<br>
        <strong>Alex</strong>: collega e amico personale, presente in sala di controllo.<br>
        <strong>${partnerName}</strong>: partner, ti ha contattato dal capannone logistico.
      </div>
    </div>
  `;
}

/* ===========================
   ANALISI INPUT
=========================== */

function classifyInput(text) {
  if (!text || text.trim() === "") return "blank";
  if (/vaff|cazzo|merda|idiot|stronzo/i.test(text)) return "hostile";
  if (text.length < 8) return "nonsense";
  return "valid";
}

/* ===========================
   VALUTAZIONE RISPOSTE
=========================== */

function evaluateAnswer(text, quality) {
  if (quality === "blank") {
    pressureLevel += 25;
    playerModel.fragilita += 20;
    playerModel.stile = "assente";
    return;
  }

  if (quality === "hostile") {
    pressureLevel += 30;
    playerModel.rischioNarrativo += 25;
    playerModel.strategia = "provocazione";
    return;
  }

  if (quality === "nonsense") {
    pressureLevel += 15;
    playerModel.stile = "elusivo";
    return;
  }

  // valid
  pressureLevel += 5;
  playerModel.stile = "prudente";
}

/* ===========================
   RENDER
=========================== */

function render() {
  app.innerHTML = "";

  if (step === 0) {
    app.innerHTML = `
      <h2>FRINGE / LEAK</h2>
      <p>Questa è una simulazione narrativa.</p>
      <button id="eva">Eva</button>
      <button id="adamo">Adamo</button>
    `;
    document.getElementById("eva").onclick = () => { partnerName = "Eva"; step++; render(); };
    document.getElementById("adamo").onclick = () => { partnerName = "Adamo"; step++; render(); };
    return;
  }

  if (step >= 1 && step < interventions.length + 1) {
    const current = interventions[step - 1];
    app.innerHTML = `
      ${renderDidascalia()}
      <p><strong>${current.question}</strong></p>
      <textarea id="answer" rows="3" style="width:100%"></textarea><br><br>
      <button id="sendBtn">Invia</button>
    `;
    document.getElementById("sendBtn").onclick = () => {
      const value = document.getElementById("answer").value;
      const quality = classifyInput(value);
      answers.push(value);
      inputQualities.push(quality);
      evaluateAnswer(value, quality);
      step++;
      render();
    };
    return;
  }

  if (!externalObservations) {
    app.innerHTML = `<p>Valutazione in corso...</p>`;
    observeWithLLM({
      pressureLevel,
      playerModel,
      answers,
      inputQualities
    }).then(res => {
      externalObservations = res.osservazioni;
      render();
    });
    return;
  }

  app.innerHTML = `
    <h3>OSSERVATORE ESTERNO</h3>
    ${Object.values(externalObservations).map(t => `<p><em>${t}</em></p>`).join("")}
  `;
}

render();
