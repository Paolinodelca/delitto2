import { observeProcedural } from "./observerLLM.js";

const app = document.getElementById("app");
console.log("FRINGE LIVE", Date.now());

let step = 0;
let pressureLevel = 0;
const MAX_PRESSURE = 100;

let externalObservations = null;
const answers = [];

let voteRanking = { primo: null, secondo: null, terzo: null };
let votedButtons = { primo: null, secondo: null, terzo: null };
let voteSubmitted = false;

/* ===========================
   STILE
=========================== */
const style = document.createElement("style");
style.innerHTML = `
  body { font-family: system-ui, sans-serif; }

  .didascalia {
    color: #111;
    padding: 14px;
    margin-bottom: 20px;
    background: #f0f0f0;
    border: 1px solid #999;
    font-size: 0.9rem;
    line-height: 1.4;
  }

  .question-box {
    border-left: 6px solid #000;
    padding: 16px;
    margin: 20px 0;
    background: #fafafa;
    animation: fadeIn 0.4s ease;
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(6px); }
    to { opacity: 1; transform: translateY(0); }
  }

  textarea {
    width: 100%;
    font-size: 1rem;
  }

  .observer-block {
    margin-bottom: 28px;
    padding: 14px;
    border: 1px solid #ccc;
    background: #fafafa;
  }

  .observer-block h4 {
    margin-top: 0;
  }

  .vote-btn {
    font-size: 1.6rem;
    padding: 10px 16px;
    margin-right: 10px;
    cursor: pointer;
  }

  .selected-vote {
    outline: 4px solid black;
    background-color: #ddd;
  }

  button[disabled] {
    opacity: 0.5;
    cursor: not-allowed;
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
  fragilita: 0
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
      <strong>Contesto operativo</strong><br>
      Saturn Way è un’azienda di ricerca avanzata con standard di sicurezza molto elevati.
      Durante il turno hai sostituito il tuo responsabile diretto <strong>in sala di controllo</strong>.
      Per un breve periodo si è creata una potenziale falla nei <strong>processi di sicurezza</strong>.
      <br><br>
      <strong>Persone coinvolte</strong><br>
      <strong>Walter</strong> – tuo responsabile diretto.<br>
      <strong>Alex</strong> – collega e amico personale, presente in sala di controllo.<br>
      <strong>${partnerName}</strong> – tuo partner da un paio d’anni, coinvolto indirettamente.
    </div>
  `;
}

/* ===========================
   VALUTAZIONE BASE
=========================== */
function evaluateAnswer(text) {
  if (text.length < 12) {
    pressureLevel += 20;
    playerModel.fragilita += 10;
  } else {
    pressureLevel += 5;
  }
  pressureLevel = Math.min(MAX_PRESSURE, pressureLevel);
}

/* ===========================
   RENDER
=========================== */
function render() {
  app.innerHTML = "";

  /* INTRO */
  if (step === 0) {
    app.innerHTML = `
      <h2>FRINGE / LEAK</h2>
      <p>Simulazione narrativa di esposizione della responsabilità.</p>
      <p>Indica il nome del tuo partner:</p>
      <button id="eva">Eva</button>
      <button id="adamo">Adamo</button>
    `;
    document.getElementById("eva").onclick = () => { partnerName = "Eva"; step++; render(); };
    document.getElementById("adamo").onclick = () => { partnerName = "Adamo"; step++; render(); };
    return;
  }

  /* SCENARIO */
  if (step === 1) {
    app.innerHTML = `
      <p><em>Quello che è successo è successo.<br>Ora devi decidere come verrà letto.</em></p>
      <button id="startBtn">Prosegui</button>
    `;
    document.getElementById("startBtn").onclick = () => { step++; render(); };
    return;
  }

  /* MICROCOPY */
  if (step === 2) {
    app.innerHTML = `
      <p>Questa non è una ricostruzione dei fatti.</p>
      <p>È una valutazione di come rendi accettabili le tue decisioni.</p>
      <button id="continueBtn">Continua</button>
    `;
    document.getElementById("continueBtn").onclick = () => { step++; render(); };
    return;
  }

  /* DOMANDE */
  if (step >= 3 && step < interventions.length + 3) {
    const current = interventions[step - 3];
    app.innerHTML = `
      ${renderDidascalia()}
      <div class="question-box">
        <strong>${current.question}</strong>
      </div>
      <textarea id="answer" rows="4"></textarea><br><br>
      <button id="sendBtn">Invia</button>
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

  /* OSSERVAZIONI */
  if (!externalObservations) {
    app.innerHTML = `<p>Valutazione in corso…</p>`;
    observeProcedural({ pressureLevel, playerModel, answers })
      .then(result => {
        externalObservations = result.osservazioni;
        render();
      });
    return;
  }

  /* VOTAZIONE */
  app.innerHTML = `
    <h3>OSSERVATORE ESTERNO</h3>
    <p>
      Assegna una preferenza:
      🥇 più convincente,
      🥈 seconda,
      🥉 terza.
    </p>

    ${Object.entries(externalObservations).map(([key, text]) => `
      <div class="observer-block">
        <p>${text}</p>
        <button class="vote-btn" onclick="vote(this,'${key}','primo')">🥇</button>
        <button class="vote-btn" onclick="vote(this,'${key}','secondo')">🥈</button>
        <button class="vote-btn" onclick="vote(this,'${key}','terzo')">🥉</button>
      </div>
    `).join("")}

    <button id="submitVoteBtn">Invia preferenze</button>
  `;

  document.getElementById("submitVoteBtn").onclick = submitVote;
}

/* ===========================
   VOTI
=========================== */
window.vote = function(btn, tipo, pos) {
  if (voteSubmitted) return;

  if (votedButtons[pos]) {
    votedButtons[pos].classList.remove("selected-vote");
  }

  voteRanking[pos] = tipo;
  btn.classList.add("selected-vote");
  votedButtons[pos] = btn;
};

function submitVote() {
  if (voteSubmitted) return;

  if (!voteRanking.primo || !voteRanking.secondo || !voteRanking.terzo) {
    alert("Assegna tutte e tre le preferenze.");
    return;
  }

  voteSubmitted = true;
  document.getElementById("submitVoteBtn").disabled = true;
  alert("Preferenze registrate. Grazie.");
}

render();
