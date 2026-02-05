const app = document.getElementById("app");
console.log("FRINGE LIVE", Date.now());

let pressureLevel = 0;
const MAX_PRESSURE = 100;

let step = 0;
const answers = [];

let observerTrace = null;
let frictionLine = null;
let alteredQuestion = null;

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
    const questionText = alteredQuestion ||
      `«Quindi stai dicendo che <em>non potevano</em> sapere davvero?»`;

    app.innerHTML = `
      <div class="question">
        <p><strong>Jonas Becker</strong></p>
        <p>${questionText}</p>
        <input id="a2" style="width:100%" />
        <button onclick="answer(2)">Rispondi</button>
      </div>
    `;

    if (frictionLine) {
      app.innerHTML += `
        <p style="opacity:0.75; margin-top:10px; font-style:italic;">
          ${frictionLine}
        </p>
      `;
    }
  }

  if (step === 3) {
    let narratorText = "";
    let tutorText = "";
    let judge = {};

    if (pressureLevel < 40) {
      narratorText = `
        La tua posizione regge senza incrinarsi.<br>
        Le risposte sono controllate.<br>
        Nessuna frattura evidente.
      `;

      tutorText = `
        Hai mantenuto una postura stabile.<br>
        La pressione non ha trovato appigli.
      `;

      judge = { esito: "indeterminato", coerenza: "solida", note: [] };
    } else if (pressureLevel < 70) {
      narratorText = `
        La tua posizione regge, ma sotto carico.<br>
        Il pensiero si adatta.<br>
        L’ambiguità resta aperta.
      `;

      tutorText = `
        Non hai ceduto,<br>
        ma il ragionamento ha cambiato forma.
      `;

      judge = { esito: "indeterminato", coerenza: "accettabile", note: [] };
    } else {
      narratorText = `
        La posizione mostra segni di stress.<br>
        Il controllo diminuisce.<br>
        La precisione si assottiglia.
      `;

      tutorText = `
        In FRINGE la pressione non punisce.<br>
        Espone.
      `;

      judge = { esito: "critico", coerenza: "instabile", note: [] };
    }

    if (observerTrace) {
      judge.note.push(`Postura osservata: ${observerTrace.postura}`);
      observerTrace.segnali_stress?.forEach(s =>
        judge.note.push(`Segnale: ${s}`)
      );
    }

    app.innerHTML = `
      <div class="output">
        <h3>NARRATORE</h3>
        <p>${narratorText}</p>

        <h3>TUTOR</h3>
        <p>${tutorText}</p>

        <h3>OSSERVAZIONE</h3>
        <p style="opacity:0.8;">
          ${observerTrace
            ? "Il sistema ha rilevato una variazione nella forma del ragionamento."
            : "Nessuna variazione significativa rilevata."}
        </p>

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

  if (value.length < 5) pressureLevel += 30;
  else if (/non so|forse|boh|non ricordo/i.test(value)) pressureLevel += 25;
  else if (value.length > 60) pressureLevel -= 10;
  else pressureLevel += 10;

  pressureLevel = Math.max(0, Math.min(MAX_PRESSURE, pressureLevel));

  if (n === 1) {
    next();
    return;
  }

  if (n === 2) {
    observeWithLLM(answers).then(trace => {
      observerTrace = trace;

      if (trace?.postura === "evasiva") {
        frictionLine = "Becker inclina leggermente la testa. Non replica subito.";
      }

      if (trace?.segnali_stress?.includes("contraddizione")) {
        alteredQuestion =
          "«Quello che dici ora è compatibile con quanto hai appena affermato?»";
      }

      next();
    }).catch(() => next());
  }
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
