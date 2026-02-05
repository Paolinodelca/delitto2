const app = document.getElementById("app");
console.log("FRINGE LIVE", Date.now());

let pressureLevel = 0;
const MAX_PRESSURE = 100;

let step = 0;
const answers = [];

/**
 * MODELLO DEL GIOCATORE
 * Non è una verità, sono ipotesi operative
 */
const playerModel = {
  stile: "indeterminato",      // prudente | assertivo | evasivo
  strategia: "indeterminata",  // coerenza | ambiguità | minimizzazione
  fragilita: 0                // 0–100
};

/**
 * OSSERVATORE LLM
 * Non giudica, osserva pattern cognitivi
 */
async function observeWithLLM(answers) {
  try {
    const res = await fetch("/api/observe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answers })
    });

    if (!res.ok) {
      console.warn("Osservazione LLM fallita");
      return null;
    }

    return await res.json();
  } catch (e) {
    console.warn("Errore osservatore:", e);
    return null;
  }
}

function render() {
  app.innerHTML = "";

  if (step === 0) {
    app.innerHTML = `
      <p><strong>Contesto</strong></p>
      <p>
        Una scoperta tacita è emersa a Heliox.<br>
        Un preprint esterno suggerisce una fuga di conoscenza.<br>
        Tu sei <strong>Alex Riva</strong>.
      </p>
      <button onclick="next()">Inizia</button>
    `;
  }

  if (step === 1) {
    app.innerHTML = `
      <div class="question">
        <p><strong>Jonas Becker</strong></p>
        <p>«Hai mai discusso informalmente del fenomeno fuori dal laboratorio?»</p>
        <input id="a1" style="width:100%" />
        <button onclick="answer(1)">Rispondi</button>
      </div>
    `;
  }

  if (step === 2) {
    app.innerHTML = `
      <div class="question">
        <p><strong>Jonas Becker</strong></p>
        <p>«Quindi stai dicendo che <em>non potevano</em> sapere davvero?»</p>
        <input id="a2" style="width:100%" />
        <button onclick="answer(2)">Rispondi</button>
      </div>
    `;

    if (pressureLevel > 50) {
      app.innerHTML += `
        <p style="opacity:0.7; margin-top:10px;">
          Becker non prende appunti. Ti osserva.
        </p>
      `;
    }
  }

  if (step === 3) {
    const narratorText = narratorOutput();
    const tutorText = tutorOutput();
    const judge = judgeOutput();

    app.innerHTML = `
      <div class="output">
        <h3>NARRATORE</h3>
        <p>${narratorText}</p>

        <h3>TUTOR</h3>
        <p>${tutorText}</p>

        <h3>GIUDICE</h3>
        <pre>${JSON.stringify(judge, null, 2)}</pre>
      </div>
    `;
  }
}

function next() {
  step++;
  render();
}

async function answer(n) {
  const value = document.getElementById(`a${n}`).value.trim();
  answers.push(value);

  // Pressione base
  if (value.length < 5) {
    increasePressure(30);
    playerModel.fragilita += 20;
  } else if (/non so|forse|boh|non ricordo/i.test(value)) {
    increasePressure(25);
    playerModel.stile = "evasivo";
  } else if (value.length > 60) {
    increasePressure(-10);
    playerModel.stile = "assertivo";
  } else {
    increasePressure(10);
    playerModel.stile = "prudente";
  }

  // Coerenza locale
  if (n === 2) {
    const a1 = answers[0].toLowerCase();
    const a2 = answers[1].toLowerCase();

    const negazione = /no|mai|non/.test(a1);
    const apertura = /si|potevano|forse|possibile/.test(a2);

    if (negazione && apertura) {
      increasePressure(35);
      playerModel.strategia = "ambiguità";
      playerModel.fragilita += 30;
    } else {
      playerModel.strategia = "coerenza";
    }

    // 👁 OSSERVAZIONE LLM (NUOVA)
    const obs = await observeWithLLM(answers);
    if (obs) {
      if (obs.coerenza === "bassa") increasePressure(25);
      if (obs.postura === "evasiva") increasePressure(15);

      if (obs.segnali_stress?.includes("contraddizione")) {
        increasePressure(30);
      }

      playerModel.stile = obs.postura || playerModel.stile;
    }
  }

  next();
}

function increasePressure(amount) {
  pressureLevel = Math.max(0, Math.min(MAX_PRESSURE, pressureLevel + amount));
}

function narratorOutput() {
  if (playerModel.strategia === "ambiguità") {
    return `
      La tua posizione non crolla, ma cambia forma.<br>
      Dove prima c’era una linea, ora c’è una curva.<br>
      Qualcuno potrebbe seguirla. Qualcun altro perdersi.
    `;
  }

  if (pressureLevel > 70) {
    return `
      La pressione ha lasciato un segno.<br>
      Non è una colpa, ma è visibile.<br>
      E ciò che è visibile diventa discutibile.
    `;
  }

  return `
    La tua posizione resta in piedi.<br>
    Non perché sia inattaccabile,<br>
    ma perché sai dove non spingere.
  `;
}

function tutorOutput() {
  if (playerModel.stile === "evasivo") {
    return `
      Evitare non è sempre fuggire.<br>
      A volte è guadagnare tempo.<br>
      Ma il tempo ha un costo.
    `;
  }

  if (playerModel.stile === "assertivo") {
    return `
      Hai parlato come chi accetta il rischio.<br>
      In FRINGE, questo viene sempre notato.
    `;
  }

  return `
    Hai mantenuto una postura prudente.<br>
    Non è neutralità.<br>
    È una scelta.
  `;
}

function judgeOutput() {
  return {
    esito: pressureLevel > 70 ? "critico" : "indeterminato",
    coerenza: playerModel.strategia === "coerenza" ? "alta" : "media",
    modello_giocatore: {
      stile: playerModel.stile,
      strategia: playerModel.strategia,
      fragilita_stimata: playerModel.fragilita
    },
    note: [
      "Valutazione basata su osservazione comportamentale",
      "Inclusa osservazione esterna non deterministica",
      "Nessuna verifica di verità fattuale"
    ]
  };
}

render();
