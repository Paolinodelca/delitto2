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

/* ===========================
   STILE (una sola volta)
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
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  padding: 12px;
  margin-bottom: 16px;
  border: 1px solid #ccc;
  background: #f9f9f9;
  font-size: 0.9rem;
}

.didascalia .colonna {
  line-height: 1.4;
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
      <div class="colonna">
        <strong>Contesto</strong><br>
        Lavori in una azienda con alto standard di sicurezza.<br>
        Hai svolto il turno in sostituzione del tuo responsabile (Walter).<br>
        Per un breve periodo hai creato una potenziale falla nella sicurezza dell’azienda.
      </div>
      <div class="colonna">
        <strong>Ruoli</strong><br>
        <strong>Walter</strong> – è il tuo responsabile diretto che hai dovuto sostituire nella sala di controllo.<br>
        <strong>Alex</strong> – tuo collega e caro amico, è presente con te in sala controllo.<br>
        <strong>${partnerName}</strong> – è da un paio di anni il tuo partner e ti ha chiamato con urgenza dal capannone di Logistica.
      </div>
    </div>
  `;
}


/* ===========================
   ANCORE
=========================== */

function extractAnchor(text) {
  const match = text.match(/necessario|imprevedibile|non era previsto|urgente|con certezza/i);
  if (match) return match[0].toLowerCase();

  const firstSentence = text.split(".")[0];
  return firstSentence.length > 12 ? firstSentence.slice(0, 60) : null;
}

/* ===========================
   VALUTAZIONE RISPOSTE
=========================== */

function evaluateAnswer(text) {
  const anchor = extractAnchor(text);
  if (anchor && observedAnchors.length < 4) {
    observedAnchors.push(anchor);
  }

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

  /* ===========================
     STEP 0 — INTRO BLINDATA
  ============================ */
  if (step === 0) {
    app.innerHTML = `
      <h2>FRINGE / LEAK</h2>

      <p><strong>Cos’è FRINGE / LEAK</strong></p>

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
        Puoi rispondere come faresti davvero,<br>
        oppure costruire consapevolmente una versione dei fatti.<br>
        In entrambi i casi, qualcosa emergerà.
      </p>

      <hr>

      <p>
        Prima di iniziare, indica la persona con cui hai
        una relazione affettiva stabile, coinvolta indirettamente nella vicenda.
      </p>

      <button id="eva">Eva</button>
      <button id="adamo">Adamo</button>
    `;

    document.getElementById("eva").onclick = () => { partnerName = "Eva"; step++; render(); };
    document.getElementById("adamo").onclick = () => { partnerName = "Adamo"; step++; render(); };
    return;
  }

  /* ===========================
     STEP 1 — SCENARIO BLINDATO
  ============================ */
  if (step === 1) {
    app.innerHTML = `
      <p>
        L’audizione avviene a porte chiuse.<br>
        Non è un procedimento disciplinare.<br>
        È una valutazione interna.
      </p>

      <p>
        L’azienda per cui lavori sviluppa tecnologie sensibili e riservate.<br>
        La sicurezza del perimetro è una condizione operativa, non formale.
      </p>

      <p>
        Durante il turno hai sostituito il tuo responsabile diretto,
        <strong>Walter</strong>, su sua richiesta.
      </p>

      <p>
        In sala di controllo era presente anche <strong>Alex</strong>,<br>
        un collega con cui hai un rapporto di fiducia personale.
      </p>

      <p>
        Durante il turno sei stato contattato da <strong>${partnerName}</strong>,
        che si trovava al capannone logistico.
      </p>

      <p>
        Ti sei allontanato temporaneamente dalla sala,
        chiedendo ad Alex di avvisarti in caso di necessità.
      </p>

      <p>
        Un’ispezione successiva ha rilevato che la sala di controllo
        era sguarnita.
      </p>

      <p><em>
        Quello che è successo è successo.<br>
        Ora conta come verrà letto.
      </em></p>

      <button id="startBtn">Prosegui</button>
    `;

    document.getElementById("startBtn").onclick = () => { step++; render(); };
    return;
  }


  /* ===========================
     DOMANDE
  ============================ */
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

  /* ===========================
     OSSERVAZIONI
  ============================ */
  if (!externalObservations) {
    app.innerHTML = `<p>Valutazione in corso...</p>`;

    observeWithLLM({
      scenario: "FRINGE / LEAK",
      pressureLevel,
      playerModel,
      answers,
      observedAnchors,
      context: {
        partner: partnerName,
        responsabile: "Walter",
        amico: "Alex",
        azienda: "tecnologie sensibili"
      }
    })
    .then(res => {
      externalObservations = res.osservazioni;
      render();
    })
    .catch(err => {
      console.error(err);
      app.innerHTML = "<p>Errore durante la valutazione.</p>";
    });

    return;
  }

  /* ===========================
     VOTAZIONE
  ============================ */
  app.innerHTML = `
    <h3>OSSERVATORE ESTERNO</h3>

    ${Object.entries(externalObservations).map(([k, t]) => `
      <div style="margin-bottom:20px">
        <p><em>${t}</em></p>
        <button style="font-size:2rem" onclick="vote(this,'${k}','primo')">🥇</button>
        <button style="font-size:2rem" onclick="vote(this,'${k}','secondo')">🥈</button>
        <button style="font-size:2rem" onclick="vote(this,'${k}','terzo')">🥉</button>
      </div>
    `).join("")}

    <button id="submitVoteBtn" onclick="submitVote()">Invia preferenze</button>
  `;


  /* --- da qui in poi: IDENTICO alla versione corrente --- */

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
    alert("Seleziona tutte e tre le preferenze");
    return;
  }

  voteSubmitted = true;
  document.getElementById("submitVoteBtn").disabled = true;

  try {
    const res = await fetch("/api/vote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...voteRanking, scenario: "FRINGE / LEAK" })
    });

    if (!res.ok) throw new Error();
    alert("Preferenze registrate");
  } catch {
    voteSubmitted = false;
    document.getElementById("submitVoteBtn").disabled = false;
    alert("Errore nel salvataggio");
  }
};

render();
