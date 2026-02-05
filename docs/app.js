const app = document.getElementById("app");
console.log("FRINGE LIVE", Date.now());

let pressureLevel = 0;
const MAX_PRESSURE = 100;

let step = 0;
const answers = [];

let observerTrace = null;
let expectationLine = null;
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

    if (expectationLine) {
      app.innerHTML += `
        <p style="opacity:0.6; margin-top:10px; font-style:italic;">
          ${expectationLine}
        </p>
      `;
    }

    if (frictionLine) {
      app.innerHTML += `
        <p style="opacity:0.75; margin-top:6px; font-style:italic;">
          ${frictionLine}
        </p>
      `;
    }
  }

  if (step === 3) {
    let narratorText = "";
    let tutorText = "";
    let judge = { note: [] };

    if (pressureLevel < 40) {
      narratorText = `La tua posizione resta stabile.`;
      tutorText = `La pressione non ha alterato la forma del pensiero.`;
      judge.coerenza = "solida";
    } else if (pressureLevel < 70) {
      narratorText = `La posizione regge, ma si adatta.`;
      tutorText = `Il pensiero ha cambiato configurazione.`;
      judge.coerenza = "accettabile";
    } else {
      narratorText = `La posizione mostra segni di cedimento.`;
      tutorText = `La pressione ha reso visibili i limiti.`;
      judge.coerenza = "instabile";
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
            ? "Il sistema ha osservato una traiettoria del ragionamento."
            : "Nessuna traiettoria significativa rilevata."}
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
    observeWithLLM([answers[0], ""]).then(trace => {
      observerTrace = trace;

      if (trace?.postura === "difensiva") {
        expectationLine = "Il sistema rileva una chiusura preventiva del campo.";
      }
      if (trace?.postura === "evasiva") {
        expectationLine = "Il sistema rileva una strategia di diluizione.";
      }
      if (trace?.postura === "assertiva") {
        expectationLine = "Il sistema rileva una posizione già consolidata.";
      }

      next();
    }).catch(() => next());
    return;
  }

  if (n === 2) {
    if (observerTrace?.segnali_stress?.includes("contraddizione")) {
      frictionLine = "La seconda risposta non segue la traiettoria prevista.";
      alteredQuestion =
        "«Questa risposta modifica la posizione che stavi costruendo?»";
    }
    next();
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
