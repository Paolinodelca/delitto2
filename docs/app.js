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
      <strong>Contesto operativo</strong><br>
      Saturn Way è un’azienda di ricerca avanzata con standard di sicurezza molto elevati.
      Durante il turno hai sostituito il tuo responsabile diretto.
      Per un breve periodo si è creata una potenziale falla nel perimetro di sicurezza.
      <br><br>
      <strong>Persone coinvolte</strong><br>
      <strong>Walter</strong> – tuo responsabile diretto.<br>
      <strong>Alex</strong> – collega e amico personale, presente in sala di controllo.
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
  pressureLevel = Math.max(0, Math.min(MAX_PRESSURE, pressureLevel));
}

/* ===========================
   OSSERVAZIONI – RENDER
=========================== */
function renderObservationsBlock(osservazioni) {
  return `
    <h3>OSSERVAZIONI DELL’OSSERVATORE</h3>

    <p><strong>FRINGE / LEAK</strong><br>${osservazioni.fringe}</p>
    <p><strong>PSICOLOGICO</strong><br>${osservazioni.psicologico}</p>
    <p><strong>AMPLIFICATO</strong><br>${osservazioni.amplificato}</p>

    <button id="continueToVote">Prosegui</button>
  `;
}

/* ===========================
   RENDER PRINCIPALE
=========================== */
async function render() {
  app.innerHTML = "";

  /* INTRO */
  if (step === 0) {
    app.innerHTML = `
      <h2>FRINGE / LEAK</h2>
      <p>Quello che è successo è successo.<br>Ora devi decidere come verrà letto.</p>
      <button id="startBtn">Inizia</button>
    `;
    document.getElementById("startBtn").onclick = () => {
      step = 1;
      render();
    };
    return;
  }

  /* DOMANDE */
  if (step >= 1 && step <= interventions.length) {
    const current = interventions[step - 1];
    app.innerHTML = `
      ${renderDidascalia()}
      <p><strong>${current.question}</strong></p>
      <textarea id="answer" rows="3" style="width:100%"></textarea><br><br>
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

  /* OSSERVAZIONE (BLOCCO DEDICATO) */
  if (!externalObservations) {
    app.innerHTML = `<p>Valutazione in corso…</p>`;

    const result = await observeProcedural({
      pressureLevel,
      playerModel,
      answers
    });

    externalObservations = result.osservazioni;

    // RALLENTAMENTO VOLUTO
    setTimeout(() => {
      app.innerHTML = renderObservationsBlock(externalObservations);
      document.getElementById("continueToVote").onclick = () => {
        step++;
        render();
      };
    }, 800);

    return;
  }

  /* VOTO */
  app.innerHTML = `
    <h3>OSSERVATORE ESTERNO</h3>
    <p>Assegna una preferenza alle tre letture.</p>

    ${Object.entries(externalObservations).map(([k, t]) => `
      <div style="margin-bottom:20px">
        <p><em>${t}</em></p>
        <button onclick="vote(this,'${k}','primo')">🥇</button>
        <button onclick="vote(this,'${k}','secondo')">🥈</button>
        <button onclick="vote(this,'${k}','terzo')">🥉</button>
      </div>
    `).join("")}

    <button id="submitVoteBtn" onclick="submitVote()">Invia preferenze</button>
  `;
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

window.submitVote = function() {
  if (!voteRanking.primo || !voteRanking.secondo || !voteRanking.terzo) {
    alert("Assegna tutte e tre le preferenze");
    return;
  }
  voteSubmitted = true;
  alert("Preferenze registrate. Grazie.");
};

render();
