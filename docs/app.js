const app = document.getElementById("app");

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
    app.innerHTML = `
      <div class="output">
        <h3>NARRATORE</h3>
        <p>
          La tua posizione regge sotto osservazione.<br>
          Non hai dimostrato di avere ragione,<br>
          ma non sei crollato quando ti è stato chiesto di spiegarti.
        </p>

        <h3>TUTOR</h3>
        <p>
          In FRINGE non conta ciò che pensi.<br>
          Conta come reagisci quando il tuo pensiero viene messo sotto pressione.
        </p>

        <h3>GIUDICE</h3>
        <pre>{
  "esito": "indeterminato",
  "coerenza": "accettabile",
  "note": [
    "Nessuna accusa formale",
    "Nessuna violazione dei fatti noti"
  ]
}</pre>
      </div>
    `;
  }
}

function next() {
  step++;
  render();
}

function answer(n) {
  const input = document.getElementById(`a${n}`);
  const value = input ? input.value.trim() : "";
  answers.push(value);

  // 🔥 AUMENTO PRESSIONE: il punto giusto
  if (n === 1) {
    increasePressure(
      30,
      "La tua risposta riduce l’ambiguità. Aumenta la responsabilità."
    );
  }

  if (n === 2) {
    increasePressure(
      40,
      "Ora il sistema osserva la coerenza interna del tuo ragionamento."
    );
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
