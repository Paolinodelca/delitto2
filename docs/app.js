const app = document.getElementById("app");
console.log("FRINGE LIVE", Date.now());

let pressureLevel = 0;
const MAX_PRESSURE = 100;

let step = 0;
const answers = [];
let observerTrace = null; // ← traccia dell’osservatore LLM

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
    let narratorText = "";
    let tutorText = "";
    let judge = {};

    // asse 1: pressione percepita
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
        note: []
      };
    } else if (pressureLevel < 70) {
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
        note: []
      };
    } else {
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
        note: []
      };
    }

    // asse 2: osservazione LLM (se presente)
    if (observerTrace) {
      judge.coerenza = observerTrace.coerenza || judge.coerenza;

      if (observerTrace.postura) {
        judge.note.push(`Postura rilevata: ${observerTrace.postura}`);
      }

      if (observerTrace.segnali_stress?.length) {
        observerTrace.segnali_stress.forEach(s =>
          judge.note.push(`Segnale osservato: ${s}`)
        );
      }
    }

    if (judge.note.length === 0) {
      judge.note.push("Nessuna anomalia cognitiva rilevata");
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

  // euristiche locali (pressione percepita)
  if (value.length < 5) {
    increasePressure(30);
  } else if (/non so|forse|boh|non ricordo/i.test(value)) {
    increasePressure(25);
  } else if (value.length > 60) {
    increasePressure(-10);
  } else {
    increasePressure(10);
  }

  // osservatore LLM SOLO alla fine
  if (n === 2) {
    observeWithLLM(answers).then(trace => {
      observerTrace = trace;

      // micro-influenza dell’osservatore (non dominante)
      if (trace?.coerenza === "bassa") increasePressure(15);
      if (trace?.postura === "evasiva") increasePressure(10);

      next();
    }).catch(() => {
      // fallback: il sistema continua comunque
      next();
    });
  } else {
    next();
  }
}

function increasePressure(amount) {
  pressureLevel = Math.max(0, Math.min(MAX_PRESSURE, pressureLevel + amount));

  const bar = document.getElementById("pressure-bar");
  if (bar) bar.style.width = pressureLevel + "%";
}

async function observeWithLLM(answers) {
  const response = await fetch("/api/observe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      answer1: answers[0],
      answer2: answers[1]
    })
  });

  if (!response.ok) return null;
  return await response.json();
}

render();
