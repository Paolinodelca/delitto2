const app = document.getElementById("app");
console.log("FRINGE LIVE", Date.now());
let pressureLevel = 0;
const MAX_PRESSURE = 100;

let step = 0;
const answers = [];

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
  }


  if (step === 3) {
  let narratorText = "";
  let tutorText = "";
  let judge = {};

  if (pressureLevel < 40) {
    narratorText = `
      La tua posizione regge senza incrinarsi.<br>
      Le risposte sono caute, forse difensive,<br>
      ma non mostrano cedimenti evidenti.
    `;

    tutorText = `
      Hai mantenuto il controllo.<br>
      In FRINGE, la stabilità è una forma di competenza.
    `;

    judge = {
      esito: "indeterminato",
      coerenza: "solida",
      note: [
        "Bassa esposizione sotto pressione",
        "Nessuna contraddizione rilevante"
      ]
    };
  } 
  else if (pressureLevel < 70) {
    narratorText = `
      La tua posizione regge, ma sotto sforzo.<br>
      Alcune risposte lasciano spazio all’interpretazione.<br>
      L’ambiguità aumenta.
    `;

    tutorText = `
      La pressione non ti ha spezzato,<br>
      ma ha iniziato a modellare il tuo ragionamento.
    `;

    judge = {
      esito: "indeterminato",
      coerenza: "accettabile",
      note: [
        "Risposte parzialmente esposte",
        "La posizione resta plausibile ma fragile"
      ]
    };
  } 
  else {
    narratorText = `
      La tua posizione mostra segni di stress.<br>
      Le risposte accelerano, si comprimono,<br>
      e iniziano a perdere precisione.
    `;

    tutorText = `
      In FRINGE la pressione non è un errore.<br>
      È una lente che rivela i limiti.
    `;

    judge = {
      esito: "critico",
      coerenza: "instabile",
      note: [
        "Alta esposizione sotto pressione",
        "Il ragionamento mostra cedimenti"
      ]
    };
  }

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



function answer(n) {
  const value = document.getElementById(`a${n}`).value.trim();
  answers.push(value);

  // euristica di pressione
  if (value.length < 5) {
    increasePressure(30, "Risposta troppo breve sotto interrogazione");
  } else if (/non so|forse|boh|non ricordo/i.test(value)) {
    increasePressure(25, "Risposta evasiva rilevata");
  } else if (value.length > 60) {
    increasePressure(-10, "Risposta articolata, pressione contenuta");
  } else {
    increasePressure(10, "Risposta neutra sotto pressione");
  }

  next();
}




function increasePressure(amount, reason = "") {
  pressureLevel = Math.min(MAX_PRESSURE, pressureLevel + amount);

  const bar = document.getElementById("pressure-bar");
  if (bar) {
    bar.style.width = pressureLevel + "%";
  }

  const label = document.getElementById("pressure-label");
  if (label && reason) {
    label.textContent = reason;
  }
}

render();
