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

  /* STEP 0 — INTRO */
  if (step === 0) {
    app.innerHTML = `
      <h2>FRINGE / LEAK</h2>

      <p><strong>Contesto</strong></p>
      <p>
        Ti trovi coinvolto in una ricostruzione interna dei fatti.<br>
        Non è un procedimento disciplinare, ma le conseguenze
        dipenderanno da come la vicenda verrà interpretata.
      </p>

      <p>
        Le domande che seguiranno non servono a stabilire una colpa,
        ma a capire <em>come</em> una decisione è diventata accettabile
        nel momento in cui è stata presa.
      </p>

      <p>
        Prima di iniziare, indica chi è la persona con cui hai una relazione
        affettiva stabile, coinvolta indirettamente nella vicenda.
      </p>

      <button id="eva">Eva</button>
      <button id="adamo">Adamo</button>
    `;

    document.getElementById("eva").onclick = () => { partnerName = "Eva"; step++; render(); };
    document.getElementById("adamo").onclick = () => { partnerName = "Adamo"; step++; render(); };
    return;
  }

  /* STEP 1 — SCENARIO (RAFFORZATO) */
  if (step === 1) {
    app.innerHTML = `
      <p>
        L’audizione avviene a porte chiuse.<br>
        Nessun verbale ufficiale è stato ancora redatto.
      </p>

      <p>
        L’azienda per cui lavori sviluppa tecnologie sensibili e riservate.<br>
        La sicurezza del perimetro non è una formalità, ma una condizione essenziale.
      </p>

      <p>
        Durante il turno hai sostituito il tuo responsabile diretto, <strong>Walter</strong>.<br>
        Walter è noto per una gestione severa e per tutelare prima i propri interessi,
        poi quelli dell’azienda.
      </p>

      <p>
        In sala di controllo era presente anche <strong>Alex</strong>,<br>
        un collega con cui hai un rapporto di fiducia personale.
      </p>

      <p>
        Sei stato contattato da <strong>${partnerName}</strong>,<br>
        con cui condividi una relazione affettiva stabile e un possibile progetto di vita.
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
      scenario: "FRINGE / LEAK",
      pressureLevel,
      playerModel,
      answers,
      observedAnchors,
      context: {
        soggetto: "giocatore",
        partner: partnerName,
        responsabile: "Walter",
        amico: "Alex",
        azienda: "sviluppo di tecnologie sensibili"
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

  /* VOTAZIONE */
  app.innerHTML = `
    <h3>OSSERVATORE ESTERNO</h3>

    ${Object.entries(externalObservations).map(([k, t]) => `
      <div style="margin-bottom:20px">
        <p><em>${t}</em></p>
        <button style="font-size:2rem" onclick="vote('${k}','primo')">🥇</button>
        <button style="font-size:2rem" onclick="vote('${k}','secondo')">🥈</button>
        <button style="font-size:2rem" onclick="vote('${k}','terzo')">🥉</button>
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
  if (!voteRanking.primo || !voteRanking.secondo || !voteRanking.terzo) {
    alert("Seleziona tutte e tre le preferenze");
    return;
  }

  try {
    const res = await fetch("/api/vote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...voteRanking,
        scenario: "FRINGE / LEAK"
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
