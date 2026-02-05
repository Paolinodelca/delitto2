const app = document.getElementById("app");
console.log("FRINGE LIVE", Date.now());

let pressureLevel = 0;
const MAX_PRESSURE = 100;

let step = 0;
const answers = [];

/**
 * MODELLO DEL GIOCATORE
 * Ipotesi operative, non verità
 */
let playerModel = {
  stile: "indeterminato",
  strategia: "indeterminata",
  fragilita: 0,
  rischioNarrativo: 0,
  esposizione: 0
};

/* ===========================
   MEMORIA LOCALE (PERSISTENZA)
   =========================== */

function loadPlayerModel() {
  const saved = localStorage.getItem("FRINGE_PLAYER_MODEL");
  if (saved) {
    try {
      playerModel = JSON.parse(saved);
      console.log("Profilo giocatore ricaricato", playerModel);
    } catch {
      console.warn("Profilo corrotto, ripristino default");
    }
  }
}

function savePlayerModel() {
  localStorage.setItem(
    "FRINGE_PLAYER_MODEL",
    JSON.stringify(playerModel)
  );
}

/* ===========================
   PRE-OSSERVAZIONE PREDITTIVA
   =========================== */

function predictiveCue() {
  if (pressureLevel > 70 && playerModel.fragilita > 40) {
    return "Qualunque esitazione ora verrà notata.";
  }

  if (playerModel.stile === "assertivo" && playerModel.esposizione > 30) {
    return "Una risposta troppo sicura potrebbe sembrare costruita.";
  }

  if (playerModel.strategia === "ambiguità") {
    return "La prossima risposta rischia di essere letta come una conferma.";
  }

  if (playerModel.rischioNarrativo > 40) {
    return "Stai creando un precedente. Non passerà inosservato.";
  }

  return null;
}

/* ===========================
   RENDER
   =========================== */

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

    const cue = predictiveCue();
    if (cue) {
      app.innerHTML += `
        <p style="font-style:italic; opacity:0.6; margin-top:10px;">
          ${cue}
        </p>
      `;
    }

    if (pressureLevel > 50) {
      app.innerHTML += `
        <p style="opacity:0.7; margin-top:10px;">
          Becker non prende appunti. Ti osserva.
        </p>
      `;
    }
  }

  if (step === 3) {
    savePlayerModel();

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

/* ===========================
   LOGICA
   =========================== */

function next() {
  step++;
  render();
}

function answer(n) {
  const value = document.getElementById(`a${n}`).value.trim();
  answers.push(value);

  if (value.length < 5) {
    increasePressure(30);
    playerModel.fragilita += 20;
    playerModel.esposizione += 15;
  } else if (/non so|forse|boh|non ricordo/i.test(value)) {
    increasePressure(25);
    playerModel.stile = "evasivo";
    playerModel.rischioNarrativo += 10;
  } else if (value.length > 70) {
    increasePressure(-10);
    playerModel.stile = "assertivo";
    playerModel.esposizione += 20;
  } else {
    increasePressure(10);
    playerModel.stile = "prudente";
  }

  if (n === 2) {
    const a1 = answers[0].toLowerCase();
    const a2 = answers[1].toLowerCase();

    const negazione = /no|mai|non/.test(a1);
    const apertura = /si|forse|possibile|potevano/.test(a2);

    if (negazione && apertura) {
      increasePressure(35);
      playerModel.strategia = "ambiguità";
      playerModel.fragilita += 30;
      playerModel.rischioNarrativo += 25;
    } else {
      playerModel.strategia = "coerenza";
    }
  }

  next();
}

function increasePressure(amount) {
  pressureLevel = Math.max(0, Math.min(MAX_PRESSURE, pressureLevel + amount));
}

/* ===========================
   OUTPUT NARRATIVI
   =========================== */

function narratorOutput() {
  if (playerModel.rischioNarrativo > 40) {
    return `
      Le tue parole hanno creato un precedente.<br>
      Non è ancora una colpa,<br>
      ma qualcuno potrebbe ricordarle.
    `;
  }

  if (playerModel.strategia === "ambiguità") {
    return `
      La tua posizione non crolla, ma si piega.<br>
      Le pieghe sono zone fertili.<br>
      Anche per il sospetto.
    `;
  }

  return `
    La tua posizione resta in piedi.<br>
    Non perché sia inattaccabile,<br>
    ma perché sai dove non spingere.
  `;
}

function tutorOutput() {
  if (playerModel.esposizione > 30) {
    return `
      Hai lasciato tracce.<br>
      Non tutte sono errori.<br>
      Ma tutte raccontano qualcosa.
    `;
  }

  if (playerModel.stile === "evasivo") {
    return `
      Evitare è una tecnica.<br>
      Funziona una volta.<br>
      Raramente due.
    `;
  }

  if (playerModel.stile === "assertivo") {
    return `
      Ti sei esposto con sicurezza.<br>
      In FRINGE, questo ha sempre un prezzo.
    `;
  }

  return `
    Prudenza attiva.<br>
    Non è silenzio.<br>
    È controllo.
  `;
}

function judgeOutput() {
  return {
    esito: pressureLevel > 70 ? "critico" : "indeterminato",
    coerenza: playerModel.strategia === "coerenza" ? "alta" : "media",
    modello_giocatore: {
      stile: playerModel.stile,
      strategia: playerModel.strategia,
      fragilita_stimata: playerModel.fragilita,
      rischio_narrativo: playerModel.rischioNarrativo,
      esposizione: playerModel.esposizione
    },
    note: [
      "Valutazione comportamentale multilivello",
      "Pre-osservazione predittiva attiva",
      "Nessuna verifica di verità fattuale"
    ]
  };
}

/* ===========================
   AVVIO
   =========================== */

loadPlayerModel();
render();
