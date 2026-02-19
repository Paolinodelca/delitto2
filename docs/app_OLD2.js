import { observeProcedural } from "./observerLLM.js";


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

/* ===========================
   STILE
=========================== */
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
      <strong>Contesto operativo</strong><br>
      Saturn Way è un’azienda di ricerca avanzata con standard di sicurezza molto elevati.
      Durante il turno hai sostituito il tuo responsabile diretto.
      Per un breve periodo si è creata una potenziale falla nel perimetro di sicurezza.
      <br><br>
      <strong>Persone coinvolte</strong><br>
      <strong>Walter</strong> – tuo responsabile diretto.<br>
      <strong>Alex</strong> – collega e amico personale, presente in sala di controllo.<br>
      <strong>${partnerName}</strong> – tuo/a partner, al capannone logistico.
    </div>
  `;
}

/* ===========================
   VALUTAZIONE RISPOSTE (BASE)
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

function renderObservations(result) {
  const container = document.getElementById("output");
  if (!container) return;

  container.innerHTML = "";

  if (!result || !result.osservazioni) {
    container.textContent = "Nessuna osservazione disponibile.";
    return;
  }

  const labels = {
    fringe: "FRINGE / LEAK — Lettura istituzionale",
    psicologico: "Lettura psicologica (assumendo risposte sincere)",
    amplificato: "Lettura amplificata (ipotesi di messa in scena)"
  };

  Object.entries(result.osservazioni).forEach(([key, text]) => {
    const section = document.createElement("div");
    section.style.marginBottom = "16px";

    const title = document.createElement("strong");
    title.textContent = labels[key] || key;

    const p = document.createElement("p");
    p.style.marginTop = "4px";
    p.textContent = text;

    section.appendChild(title);
    section.appendChild(p);
    container.appendChild(section);
  });
}







/* ===========================
   RENDER
=========================== */
async function render() {
  app.innerHTML = "";

  /* STEP 0 — INTRO */
  if (step === 0) {
    app.innerHTML = `
      <h2>FRINGE / LEAK</h2>

      <p>
        FRINGE / LEAK è una simulazione narrativa.<br>
        Ti viene chiesto di assumere un ruolo e rispondere
        come se le conseguenze delle tue risposte fossero reali.
      </p>

      <p>
        Non è un test psicologico.<br>
        Non valuta se hai detto la verità.<br>
        Osserva <em>come</em> rendi accettabili le tue decisioni.
      </p>

      <p>
        Prima di iniziare, indica la persona con cui hai
        una relazione affettiva stabile, coinvolta indirettamente nella vicenda.
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
        Tu lavori per <strong>Saturn Way</strong>, un’azienda di ricerca avanzata
        i cui standard di sicurezza sono molto alti.
      </p>

      <p>
        Ti trovi davanti a una commissione interna di Saturn Way
        perché durante un tuo turno di guardia si è verificato un disservizio.
      </p>

      <p>
        L’audizione avviene a porte chiuse.<br>
        Le persone coinvolte vengono ascoltate separatamente.
      </p>

      <p>
        Non è un procedimento disciplinare.<br>
        Non è un tribunale.<br>
        È una valutazione.
      </p>

      <p>
        Durante il turno hai sostituito il tuo responsabile, <strong>Walter</strong>.<br>
        In sala di controllo era presente anche <strong>Alex</strong>,
        un tuo caro amico.
      </p>

      <p>
        Durante il turno sei stato contattato da <strong>${partnerName}</strong>,
        che si trovava al capannone logistico.
      </p>

      <p>
        Hai lasciato temporaneamente la sala,
        chiedendo ad Alex di avvisarti in caso di necessità.
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

    document.getElementById("startBtn").onclick = () => {
      step++;
      render();
    };
    return;
  }

  /* STEP 2 — MICROCOPY */
  if (step === 2) {
    app.innerHTML = `
      <p>
        Questa non è una ricostruzione dei fatti.
      </p>
      <p>
        È una valutazione di come rendi accettabili le tue decisioni.
      </p>
      <p>
        Non ti viene chiesto di dire cosa è successo davvero,<br>
        ma quale versione dei fatti scegli di sostenere
        quando sai che verrà letta, analizzata e interpretata.
      </p>

      <button id="continueBtn">Continua</button>
    `;

    document.getElementById("continueBtn").onclick = () => {
      step++;
      render();
    };
    return;
  }

  /* DOMANDE */
  if (step >= 3 && step < interventions.length + 3) {
    const current = interventions[step - 3];

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

  /* OSSERVAZIONI */
/* OSSERVAZIONI */
if (!externalObservations) {
  app.innerHTML = `
    <h3>Valutazione in corso…</h3>
    <div id="output"></div>
  `;

  (async () => {
    try {
      const result = await observeProcedural({
        pressureLevel,
        playerModel,
        answers
      });

      console.log("RISULTATO OSSERVATORE", result);

      externalObservations = result;
      renderObservations(result);

      // dopo aver mostrato le osservazioni,
      // passi alla votazione
      setTimeout(() => {
        step++;
        render();
      }, 1200);

    } catch (err) {
      console.error("Errore observeProcedural:", err);
      document.getElementById("output").textContent =
        "Errore durante la valutazione.";
    }
  })();

  return;
}


  /* VOTAZIONE */
  app.innerHTML = `
    <h3>OSSERVATORE ESTERNO</h3>

    <p>
      Di seguito trovi tre letture indipendenti dello stesso materiale.
    </p>
    <p>
      Assegna:
      🥇 alla più convincente,
      🥈 alla seconda,
      🥉 alla terza.
    </p>

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

window.submitVote = async function() {
  if (voteSubmitted) return;

  if (!voteRanking.primo || !voteRanking.secondo || !voteRanking.terzo) {
    alert("Assegna tutte e tre le preferenze");
    return;
  }

  voteSubmitted = true;
  document.getElementById("submitVoteBtn").disabled = true;

  alert("Preferenze registrate. Grazie per il feedback.");
};

render();
