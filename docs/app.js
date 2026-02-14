import { observeWithLLM } from "./observerLLM.js";

const app = document.getElementById("app");
console.log("FRINGE LIVE", Date.now());

let step = 0;
let pressureLevel = 0;
const MAX_PRESSURE = 100;

let externalObservations = null;
const answers = [];
let voteRanking = {};

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
   VALUTAZIONE RISPOSTE
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

  /* STEP 0 — INTRO */
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
        Prima di iniziare, indica chi è la persona con cui hai una relazione personale
        coinvolta indirettamente nella vicenda.
      </p>

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
      <p>
        Ti trovi davanti a una commissione interna.<br>
        L’audizione avviene a porte chiuse.
      </p>

      <p>
        Durante il tuo turno di guardia hai sostituito il tuo responsabile, Walter.<br>
        In sala di controllo era presente anche Alex, un tuo amico di lunga data.
      </p>

      <p>
        Sei stato contattato da ${partnerName}, che si trovava al capannone logistico.<br>
        Hai lasciato temporaneamente la sala, chiedendo ad Alex di avvisarti in caso di necessità.
      </p>

      <p>
        Un’ispezione successiva ha trovato la sala di controllo sguarnita.
      </p>

      <p><em>
        Quello che è successo è successo.<br>
        Ora devi decidere come verrà letto.
      </em></p>

      <button id="startBtn">Prosegui</button>
    `;

    document.getElementById("startBtn").onclick = () => { step++; render(); };
    return;
  }

  /* DOMANDE */
  if (step >= 2 && step < interventions.length + 2) {
    const current = interventions[step - 2];
    app.innerHTML = `
      <p><strong>${current.question}</strong></p>
      <textarea id="answer" rows="4" style="width:100%"></textarea><br><br>
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
    app.innerHTML = `<p>Valutazione in corso...</p>`;
    observeWithLLM({
      pressureLevel,
      playerModel,
      answers,

      observedAnchors,   // 🔑 QUESTO È IL PEZZO MANCANTE
      context: { partner: partnerName, responsabile: "Walter", collega: "Alex" }
    }).then(res => {
      externalObservations = res.osservazioni;
      render();
    });
    return;
  }

  /* VOTAZIONE */
  app.innerHTML = `
    <h3>OSSERVATORE ESTERNO</h3>

    ${Object.entries(externalObservations).map(([k,t]) => `
      <div style="margin-bottom:20px">
        <p><em>${t}</em></p>
        <button style="font-size:24px" onclick="vote('${k}','primo')">🥇</button>
        <button style="font-size:24px" onclick="vote('${k}','secondo')">🥈</button>
        <button style="font-size:24px" onclick="vote('${k}','terzo')">🥉</button>
      </div>
    `).join("")}

    <button onclick="submitVote()">Invia preferenze</button>
  `;
}

/* ===========================
   VOTI
=========================== */

window.vote = function(tipo, pos) {
  voteRanking[pos] = tipo;
};

window.submitVote = async function() {
  try {
    const res = await fetch("/api/vote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ranking: voteRanking,
        timestamp: Date.now()
      })
    });

    if (!res.ok) throw new Error(await res.text());
    alert("Preferenze registrate");
  } catch (e) {
    console.error(e);
    alert("Errore nel salvataggio");
  }
};

render();
