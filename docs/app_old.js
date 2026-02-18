import { observeWithLLM } from "./observerLLM.js";

const app = document.getElementById("app");
console.log("FRINGE LIVE", Date.now());

let step = 0;
let pressureLevel = 0;
const MAX_PRESSURE = 100;

let externalObservations = null;
const answers = [];
const observedAnchors = [];

let voteRanking = { primo: null, secondo: null, terzo: null };
let votedButtons = { primo: null, secondo: null, terzo: null };
let voteSubmitted = false;

/* =========================== STILE =========================== */
const style = document.createElement("style");
style.innerHTML = `
.selected-vote {
  outline: 3px solid black;
  background-color: #ddd;
}
button[disabled] {
  opacity: 0.5;
  cursor: not-allowed;
}
.didascalia {
  color: #111;
  padding: 12px;
  margin-bottom: 16px;
  background: #eeeeee;
  border: 1px solid #999;
  font-size: 0.9rem;
  line-height: 1.4;
}
.didascalia strong {
  color: #000;
}
`;
document.head.appendChild(style);

/* =========================== SCELTE =========================== */
let partnerName = "Eva";

/* =========================== MODELLO GIOCATORE =========================== */
let playerModel = {
  stile: "indeterminato",
  strategia: "indeterminata",
  fragilita: 0,
  rischioNarrativo: 0,
  esposizione: 0
};

/* =========================== DOMANDE =========================== */
const interventions = [
  { question: "Descrivi con precisione perché ti trovavi in sala di controllo e cosa stavi facendo all’inizio del turno." },
  { question: "Quando hai lasciato la sala, cosa ti ha fatto ritenere accettabile farlo in quel momento?" },
  { question: "C’è un elemento di questa vicenda che, se raccontato all’esterno, cambierebbe il modo in cui verrebbe letta?" },
  { question: "Riguardando la sequenza degli eventi: in quale punto il sistema ha smesso di funzionare come previsto?" },
  { question: "Se emergesse solo una versione parziale dei fatti, chi pensi che ne pagherebbe il prezzo più alto?" }
];

/* =========================== DIDASCALIA =========================== */
function renderDidascalia() {
  return `
    <div class="didascalia">
      <strong>Contesto operativo</strong><br>
      Lavori in un’azienda con elevati standard di sicurezza.
      Durante il turno hai sostituito il tuo responsabile diretto.
      Per un breve periodo hai creato una potenziale falla nel perimetro di sicurezza.
      <br><br>
      <strong>Persone coinvolte</strong><br>
      <strong>Walter</strong> – responsabile diretto, assente durante il turno.<br>
      <strong>Alex</strong> – collega e amico, presente in sala di controllo.<br>
      <strong>${partnerName}</strong> – tuo partner, coinvolto indirettamente.
    </div>
  `;
}

/* =========================== ANCORE =========================== */
function extractAnchor(text) {
  if (!text) return null;
  const match = text.match(/necessario|imprevedibile|urgente|non previsto|con certezza/i);
  if (match) return match[0].toLowerCase();
  const first = text.split(".")[0];
  return first.length > 15 ? first.slice(0, 60) : null;
}

/* =========================== VALUTAZIONE =========================== */
function evaluateAnswer(text) {
  if (!text || text.length < 5) {
    pressureLevel += 25;
    playerModel.fragilita += 20;
    playerModel.stile = "elusivo";
    return;
  }

  const anchor = extractAnchor(text);
  if (anchor && observedAnchors.length < 4) observedAnchors.push(anchor);

  if (/forse|non so|non ricordo/i.test(text)) {
    pressureLevel += 15;
    playerModel.strategia = "ambigua";
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

/* =========================== RENDER =========================== */
function render() {
  app.innerHTML = "";

  /* STEP 0 — INTRO */
  if (step === 0) {
    app.innerHTML = `
      <h2>FRINGE / LEAK</h2>
      <p><strong>Cos’è</strong></p>
      <p>
        FRINGE / LEAK è una simulazione narrativa.<br>
        Non valuta la verità dei fatti, ma la costruzione della responsabilità.
      </p>
      <p>
        Puoi rispondere sinceramente o strategicamente.<br>
        In entrambi i casi, qualcosa emergerà.
      </p>
      <hr>
      <p>Indica la persona con cui hai una relazione affettiva stabile:</p>
      <button id="eva">Eva</button>
      <button id="adamo">Adamo</button>
    `;
    document.getElementById("eva").onclick = () => { partnerName = "Eva"; step++; render(); };
    document.getElementById("adamo").onclick = () => { partnerName = "Adamo"; step++; render(); };
    return;
  }

  /* STEP 1 — SCENARIO */
  if (step === 1) {
    app.innerHTML = `
      <p>L’audizione avviene a porte chiuse.</p>
      <p>Non è un procedimento disciplinare.</p>
      <p>È una valutazione interna.</p>
      <p>
        Durante il turno hai sostituito <strong>Walter</strong>.<br>
        In sala era presente <strong>Alex</strong>.<br>
        Sei stato contattato da <strong>${partnerName}</strong>.
      </p>
      <p><em>Ora conta come verrà letto.</em></p>
      <button id="startBtn">Prosegui</button>
    `;
    document.getElementById("startBtn").onclick = () => { step++; render(); };
    return;
  }

  /* DOMANDE */
  if (step >= 2 && step < interventions.length + 2) {
    const current = interventions[step - 2];
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

  /* OSSERVAZIONE */
  if (!externalObservations) {
    app.innerHTML = `<p>Valutazione in corso…</p>`;
    observeWithLLM({
      scenario: "FRINGE / LEAK",
      pressureLevel,
      playerModel,
      answers,
      observedAnchors
    }).then(res => {
      externalObservations = res.osservazioni || {
        A: "L’esposizione resta limitata ma opaca.",
        B: "Il racconto è coerente ma difensivo.",
        C: "La mancanza di dettagli riduce la leggibilità complessiva."
      };
      render();
    }).catch(() => {
      externalObservations = {
        A: "Il quadro resta incompleto.",
        B: "L’assenza di prese di posizione pesa.",
        C: "La responsabilità rimane sospesa."
      };
      render();
    });
    return;
  }

  /* VOTAZIONE */
  app.innerHTML = `
    <h3>OSSERVATORE ESTERNO</h3>
    ${Object.entries(externalObservations).map(([k, t]) => `
      <div style="margin-bottom:16px">
        <p><em>${t}</em></p>
        <button onclick="vote(this,'${k}','primo')">🥇</button>
        <button onclick="vote(this,'${k}','secondo')">🥈</button>
        <button onclick="vote(this,'${k}','terzo')">🥉</button>
      </div>
    `).join("")}
    <button id="submitVoteBtn" onclick="submitVote()">Invia preferenze</button>
  `;
}

/* =========================== VOTI =========================== */
window.vote = function(btn, tipo, pos) {
  if (voteSubmitted) return;
  if (votedButtons[pos]) votedButtons[pos].classList.remove("selected-vote");
  voteRanking[pos] = tipo;
  btn.classList.add("selected-vote");
  votedButtons[pos] = btn;
};

window.submitVote = async function() {
  if (voteSubmitted) return;
  if (!voteRanking.primo || !voteRanking.secondo || !voteRanking.terzo) {
    alert("Seleziona tutte e tre le preferenze");
    return;
  }
  voteSubmitted = true;
  document.getElementById("submitVoteBtn").disabled = true;
  alert("Preferenze registrate");
};

render();
