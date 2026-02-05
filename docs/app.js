const app = document.getElementById("app");
console.log("FRINGE LIVE", Date.now());

let pressureLevel = 0;
const MAX_PRESSURE = 100;

let step = 0;
const answers = [];

/**
 * MODELLO DEL GIOCATORE
 * Ipotesi operative, NON verità
 */
const playerModel = {
  stile: "indeterminato",
  strategia: "indeterminata",
  fragilita: 0,

  // nuovi fattori latenti
  controllo: 50,   // 0–100
  rischio: 0,      // 0–100
  ambiguita: 0     // 0–100
};

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
    app.innerHTML = `
      <div class="output">
        <h3>NARRATORE</h3>
        <p>${narratorOutput()}</p>

        <h3>TUTOR</h3>
        <p>${tutorOutput()}</p>

        <h3>GIUDICE</h3>
        <pre>${JSON.stringify(judgeOutput(), null, 2)}</pre>
      </div>
    `;
  }
}

function next() {
  step++;
  render();
}

function answer(n) {
  const value = document.getElementById(`a${n}`).value.trim();
  answers.push(value);

  observeLocally(value);

  next();
}

/**
 * OSSERVATORE NON DETERMINISTICO (mock LLM)
 */
function observeLocally(text) {
  const len = text.length;

  if (len < 8) {
    increasePressure(25);
    playerModel.fragilita += 20;
    playerModel.controllo -= 10;
  }

  if (/forse|dipende|non saprei/i.test(text)) {
    playerModel.ambiguita += 30;
    playerModel.strategia = "ambiguità";
    increasePressure(20);
  }

  if (/assolutamente|mai|in nessun caso/i.test(text)) {
    playerModel.rischio += 25;
    playerModel.stile = "assertivo";
    increasePressure(10);
  }

  if (len > 70) {
    playerModel.controllo += 10;
    increasePressure(-5);
  }

  // coerenza tra risposte
  if (answers.length === 2) {
    const [a1, a2] = answers.map(a => a.toLowerCase());
    if (/mai|no/.test(a1) && /forse|possibile/.test(a2)) {
      playerModel.ambiguita += 40;
      playerModel.fragilita += 25;
      increasePressure(30);
    } else {
      playerModel.strategia = "coerenza";
    }
  }
}

function increasePressure(amount) {
  pressureLevel = Math.max(0, Math.min(MAX_PRESSURE, pressureLevel + amount));
}

function narratorOutput() {
  if (playerModel.ambiguita > 60) {
    return `
      Le tue parole non mentono, ma non si lasciano afferrare.<br>
      Becker annota meno. Ascolta di più.<br>
      L’ambiguità è diventata una presenza.
    `;
  }

  if (pressureLevel > 70) {
    return `
      La pressione non rompe, ma deforma.<br>
      Chi osserva ora sa dove premere.<br>
      E lo farà.
    `;
  }

  return `
    La tua posizione resta in piedi.<br>
    Non perché sia inattaccabile,<br>
    ma perché hai scelto cosa mostrare.
  `;
}

function tutorOutput() {
  if (playerModel.controllo < 40) {
    return `
      Stai cedendo spazio narrativo.<br>
      Non è un errore.<br>
      Ma va fatto con consapevolezza.
    `;
  }

  if (playerModel.rischio > 50) {
    return `
      Hai preso una linea netta.<br>
      In FRINGE, le linee attirano conseguenze.
    `;
  }

  return `
    Hai gestito la tensione senza irrigidirti.<br>
    Questa è una competenza, non una difesa.
  `;
}

function judgeOutput() {
  return {
    esito: pressureLevel > 70 ? "critico" : "instabile",
    coerenza: playerModel.strategia,
    modello_giocatore: {
      stile: playerModel.stile,
      fragilita_stimata: playerModel.fragilita,
      controllo: playerModel.controllo,
      rischio: playerModel.rischio,
      ambiguita: playerModel.ambiguita
    },
    note: [
      "Valutazione emergente",
      "Modello non deterministico",
      "Nessuna verifica di verità fattuale"
    ]
  };
}

render();
