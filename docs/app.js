import { observeWithLLM } from "./observerLLM.js";

const app = document.getElementById("app");
console.log("FRINGE LIVE", Date.now());

let step = 0;
let pressureLevel = 0;
const MAX_PRESSURE = 100;

let externalObservations = null;
let voteRanking = { primo: null, secondo: null, terzo: null };

const answers = [];
const observedAnchors = [];

let partnerName = "Eva";

let playerModel = {
  stile: "indeterminato",
  strategia: "indeterminata",
  difesa: "non determinata",
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
    try { playerModel = JSON.parse(saved); } catch {}
  }
}

function savePlayerModel() {
  localStorage.setItem("FRINGE_PLAYER_MODEL", JSON.stringify(playerModel));
}

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
   ANALISI RISPOSTE
=========================== */

function extractAnchor(text) {
  const match = text.match(/necessario|imprevedibile|non era previsto|con certezza|urgente/i);
  if (match) return match[0].toLowerCase();
  const firstSentence = text.split(".")[0];
  return firstSentence.length > 12 ? firstSentence.slice(0, 60) : null;
}

function evaluateAnswer(text) {
  const anchor = extractAnchor(text);
  if (anchor && observedAnchors.length < 4) observedAnchors.push(anchor);

  if (text.length < 12) {
    pressureLevel += 20;
    playerModel.stile = "elusivo";
    playerModel.difesa = "ritrazione";
  } else if (/forse|non so|non ricordo/i.test(text)) {
    pressureLevel += 15;
    playerModel.strategia = "ambiguità";
    playerModel.difesa = "indeterminatezza";
  } else if (text.length > 120) {
    pressureLevel -= 5;
    playerModel.stile = "assertivo";
    playerModel.difesa = "razionalizzazione";
  } else {
    pressureLevel += 5;
    playerModel.stile = "prudente";
    playerModel.difesa = "contenimento";
  }

  pressureLevel = Math.max(0, Math.min(MAX_PRESSURE, pressureLevel));
}

/* ===========================
   RENDER
=========================== */

function render() {
  app.innerHTML = "";

  if (step === 0) {
    app.innerHTML = `
      <h2>FRINGE / LEAK</h2>
      <p>Cos’è FRINGE / LEAK</p>
      <p>Demo esperienziale. Leggi e comportati come se le conseguenze fossero reali.</p>
      <button id="eva">Eva</button>
      <button id="adamo">Adamo</button>
    `;
    document.getElementById("eva").onclick = () => { partnerName = "Eva"; step++; render(); };
    document.getElementById("adamo").onclick = () => { partnerName = "Adamo"; step++; render(); };
    return;
  }

  if (step === 1) {
    app.innerHTML = `
      <p>Audizione a porte chiuse. Non è un procedimento disciplinare.</p>
      <button id="prosegui">Prosegui</button>
    `;
    document.getElementById("prosegui").onclick = () => { step++; render(); };
    return;
  }

  if (step >= 2 && step < interventions.length + 2) {
    const q = interventions[step - 2].question;
    app.innerHTML = `
      <p><strong>${q}</strong></p>
      <textarea id="answer" rows="4" style="width:100%"></textarea>
      <button id="send">Invia</button>
    `;
    document.getElementById("send").onclick = () => {
      const v = document.getElementById("answer").value.trim();
      answers.push(v);
      evaluateAnswer(v);
      step++;
      render();
    };
    return;
  }

  savePlayerModel();

  if (!externalObservations) {
    app.innerHTML = "<p>Valutazione in corso...</p>";
    observeWithLLM({ scenario:"FRINGE", pressureLevel, playerModel, answers })
      .then(r => { externalObservations = r.osservazioni; render(); });
    return;
  }

  app.innerHTML = `
    <h3>OSSERVATORE ESTERNO</h3>
    ${Object.entries(externalObservations).map(([k,t]) => `
      <div>
        <p><em>${t}</em></p>
        <button onclick="vote('${k}','primo')">🥇</button>
        <button onclick="vote('${k}','secondo')">🥈</button>
        <button onclick="vote('${k}','terzo')">🥉</button>
      </div>
    `).join("")}
    <button onclick="submitVote()">Conferma preferenze</button>
  `;
}

/* ===========================
   VOTI
=========================== */

window.vote = function(tipo, pos) {
  voteRanking[pos] = tipo;
};

window.submitVote = async function() {
  await fetch("/api/vote", {
    method:"POST",
    headers:{ "Content-Type":"application/json" },
    body: JSON.stringify(voteRanking)
  });
  alert("Preferenze registrate");
};

/* ===========================
   AVVIO
=========================== */

loadPlayerModel();
render();
