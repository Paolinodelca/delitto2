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

/* ===========================
   SCELTA INIZIALE
   =========================== */

let partnerName = "Eva";

/* ===========================
   MODELLO GIOCATORE
   =========================== */

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
   DOMANDE
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
   ANALISI RISPOSTE
   =========================== */

function extractAnchor(text) {
  const match = text.match(/necessario|imprevedibile|non era previsto|chi pensa male|con certezza|urgente/i);
  if (match) return match[0].toLowerCase();

  const firstSentence = text.split(".")[0];
  return firstSentence.length > 12
    ? firstSentence.trim().slice(0, 60)
    : null;
}

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
    playerModel.difesa = "ritrazione";
  } else if (/forse|non so|non ricordo/i.test(text)) {
    pressureLevel += 15;
    playerModel.strategia = "ambiguità";
    playerModel.difesa = "indeterminatezza";
    playerModel.rischioNarrativo += 10;
  } else if (text.length > 120) {
    pressureLevel -= 5;
    playerModel.stile = "assertivo";
    playerModel.difesa = "razionalizzazione";
    playerModel.esposizione += 15;
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

  /* STEP 0 — INTRO + SCELTA PARTNER */
  if (step === 0) {
    app.innerHTML = `
      <h2>FRINGE / LEAK</h2>
      <p style="opacity:0.7;">Livello di esposizione</p>

      <p><strong>Cos’è FRINGE / LEAK</strong></p>
      <p>
        Questa è una demo esperienziale.<br>
        Ti viene chiesto di attraversare una situazione come se le conseguenze fossero reali.
      </p>
      <p>
        Puoi rispondere come faresti nella realtà<br>
        oppure simulare consapevolmente un comportamento.
      </p>
      <p>
        La differenza non viene segnalata durante il percorso.<br>
        Emergerà nell’esito finale.
      </p>

      <hr>

      <p>
        Indica chi è la persona con cui hai una relazione personale
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
        L’audizione avviene a porte chiuse.
      </p>

      <p>
        Non è un procedimento disciplinare.<br>
        È una valutazione.
      </p>

      <p>
        Durante il tuo turno di guardia hai sostituito il tuo responsabile, Walter.<br>
        In sala di controllo era presente anche Alex.
      </p>

      <p>
        Sei stato contattato da ${partnerName}.<br>
        Hai lasciato temporaneamente la sala.
      </p>

      <p>
        Un’ispezione successiva ha trovato la sala di controllo sguarnita.
      </p>

      <p><em>
        Quello che è successo è successo.<br>
        Ora devi decidere come verrà letto.
      </em></p>

      <button id="prosegui">Prosegui</button>
    `;

    document.getElementById("prosegui").onclick = () => {
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


if (!externalObservations) {
  observeWithLLM({
    scenario: "FRINGE / LEAK",
    pressureLevel,
    playerModel,
    observedAnchors,
    answers,
    context: {
      responsabile: "Walter",
      amico: "Alex",
      partner: partnerName
    }
  }).then(result => {
    externalObservations = result.osservazioni;
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
    <p><em>Motivo:</em> ${judgeMotivo()}</p>

    <p><em>Profilo osservato:</em></p>
    <ul>
      <li>Stile comunicativo: ${playerModel.stile}</li>
      <li>Meccanismo di difesa: ${playerModel.difesa}</li>
      <li>Strategia emersa: ${playerModel.strategia}</li>
      <li>Rischio narrativo: ${playerModel.rischioNarrativo > 0 ? "presente" : "contenuto"}</li>
    </ul>

    ${
  <h3>OSSERVATORE ESTERNO</h3>

${Object.entries(externalObservations).map(([key, text]) => `
  <div style="margin-bottom:1.5rem;">
    <p style="font-style:italic;">${text}</p>

    <button onclick="vote('${key}','primo')">🥇 Primo</button>
    <button onclick="vote('${key}','secondo')">🥈 Secondo</button>
    <button onclick="vote('${key}','terzo')">🥉 Terzo</button>
  </div>
`).join("")}

<button onclick="submitVote()">Conferma preferenze</button>

    }
  `;
}

/* ===========================
   OUTPUT TESTUALE
   =========================== */

function narratorOutput() {
  if (observedAnchors.length > 1) {
    return "Il tuo racconto ha mantenuto coerenza interna, ma si è appoggiato a formule ricorrenti.";
  }
  if (pressureLevel > 60) {
    return "La pressione interpretativa è cresciuta progressivamente.";
  }
  return "Hai attraversato l’audizione senza una frattura evidente.";
}

function tutorOutput() {
  if (playerModel.difesa === "razionalizzazione") {
    return "Hai spiegato molto. Questo chiarisce, ma espone.";
  }
  if (playerModel.difesa === "contenimento") {
    return "Hai limitato l’esposizione. Questo protegge, ma lascia spazio a letture esterne.";
  }
  return "La tua postura è rimasta sotto controllo.";
}

function judgeEsito() {
  return pressureLevel > 70 ? "posizione instabile" : "valutazione indeterminata";
}

function judgeMotivo() {
  if (playerModel.difesa === "razionalizzazione") {
    return "esposizione controllata senza punto di rottura";
  }
  if (playerModel.difesa === "contenimento") {
    return "riduzione del rischio narrativo";
  }
  return "assenza di elementi conclusivi";
}



/* ===========================
   AVVIO
   =========================== */

loadPlayerModel();
render();

function FinalObservations({ osservazioni }) {
  const [ranking, setRanking] = React.useState({
    primo: null,
    secondo: null,
    terzo: null
  });

  function vote(posizione, tipo) {
    setRanking(prev => ({ ...prev, [posizione]: tipo }));
  }

  async function submitVote() {
    await fetch("/api/vote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(ranking)
    });
  }

  return (
    <div>
      <h2>Osservazioni finali</h2>

      {Object.entries(osservazioni).map(([key, text]) => (
        <div key={key} style={{ marginBottom: "2rem" }}>
          <h3>{key.toUpperCase()}</h3>
          <p>{text}</p>

          <button onClick={() => vote("primo", key)}>🥇 Primo</button>
          <button onClick={() => vote("secondo", key)}>🥈 Secondo</button>
          <button onClick={() => vote("terzo", key)}>🥉 Terzo</button>
        </div>
      ))}

      <button onClick={submitVote}>
        Conferma preferenze
      </button>
    </div>
  );
}

window.vote = function(tipo, posizione) {
  voteRanking[posizione] = tipo;
};

window.submitVote = async function() {
  await fetch("/api/vote", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(voteRanking)
  });

  alert("Preferenze registrate");
};
