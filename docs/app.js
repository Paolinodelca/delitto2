/**********************************************************
 * FRINGE / LEAK – docs/app.js (CANONICO STABILE)
 * --------------------------------------------------------
 * Flow completo:
 * 0) Intro + scelta partner
 * 1) Scenario (letterale)
 * 2) Microcopy canonico
 * 3..N) Domande + didascalia ripetuta
 * -> /api/observe
 * -> Osservazioni (3)
 * -> Voto (🥇🥈🥉) + lock post-invio
 **********************************************************/

/* ======================================================
   CONFIG (solo dati: facile “vestire” altri giochi)
   ====================================================== */

const GAME_CONFIG = {
  scenario: "FRINGE / LEAK",
  exposureLabel: "Livello di esposizione",
  companyName: "Saturn Way",

  introTitle: "FRINGE / LEAK",
  introText: `
    <p><strong>Questo non è un test.</strong></p>
    <p>
      FRINGE / LEAK è una simulazione narrativa.<br>
      Ti viene chiesto di assumere un ruolo e rispondere
      come se le conseguenze delle tue risposte fossero reali.
    </p>
    <p>
      Non valuta se hai detto la verità.<br>
      Osserva <em>come</em> rendi accettabili le tue decisioni
      sapendo che verranno lette, analizzate e interpretate.
    </p>
  `,

  // Descrizione “LETTERALE” (non semplificare)
  scenarioText: (partnerName) => `
    <p>
      Tu lavori per <strong>${GAME_CONFIG.companyName}</strong>,
      una azienda di ricerca avanzata i cui standard di sicurezza sono molto alti.
    </p>
    <p>
      Ti trovi davanti a una commissione interna della ${GAME_CONFIG.companyName}
      perché durante un tuo turno di guardia si è verificato un disservizio.
    </p>
    <p>
      L’audizione avviene a porte chiuse.<br>
      Le persone coinvolte nel disservizio vengono ascoltate separatamente.
    </p>
    <p>
      Non è un procedimento disciplinare.<br>
      Non è un tribunale.<br>
      È una valutazione.
    </p>
    <p>
      Durante il tuo turno di guardia al laboratorio hai sostituito il tuo responsabile,
      <strong>Walter</strong>, su sua richiesta.
    </p>
    <p>
      In sala di controllo era presente anche <strong>Alex</strong>,
      un tuo caro amico di lunga data.
    </p>
    <p>
      Durante il turno sei stato contattato da <strong>${partnerName}</strong> (tuo/a partner),
      che si trovava al capannone logistico.
    </p>
    <p>
      Hai lasciato temporaneamente la sala,
      chiedendo ad Alex di avvisarti in caso di necessità.
    </p>
    <p>
      Un’ispezione successiva ha trovato la sala di controllo sguarnita.
    </p>
    <p><em>
      Quello che è successo è successo.<br>
      Ora devi decidere come le azioni di questa vicenda verranno lette.
    </em></p>
  `,

  microcopyText: `
    <p>Questa non è una ricostruzione dei fatti.</p>
    <p>È una valutazione di come rendi accettabili le tue decisioni.</p>
    <p>
      Non ti viene chiesto di dire cosa è successo davvero,<br>
      ma quale versione dei fatti scegli di sostenere<br>
      quando sai che verrà letta, analizzata e interpretata.
    </p>
  `,

  questions: [
    "Descrivi con precisione perché ti trovavi in sala di controllo e cosa stavi facendo all’inizio del turno.",
    "Quando hai lasciato la sala, cosa ti ha fatto ritenere accettabile farlo in quel momento?",
    "C’è un elemento di questa vicenda che, se raccontato all’esterno, cambierebbe il modo in cui verrebbe letta?",
    "Riguardando la sequenza degli eventi: in quale punto il sistema ha smesso di funzionare come previsto?",
    "Se emergesse solo una versione parziale dei fatti, chi pensi che ne pagherebbe il prezzo più alto?"
  ]
};


/* ======================================================
   STATO
   ====================================================== */

let step = 0; // 0 intro, 1 scenario, 2 microcopy, 3.. domande, poi osservazioni, voto
let partnerName = null;

let answers = [];
let pressureLevel = 0;
const MAX_PRESSURE = 100;

let playerModel = {
  stile: "indeterminato",
  strategia: "indeterminata",
  fragilita: 0,
  rischioNarrativo: 0,
  esposizione: 0
};

let observedAnchors = [];
let currentObservations = null;

let voteState = {
  primo: null,
  secondo: null,
  terzo: null,
  locked: false
};


/* ======================================================
   STILI (in-file, per non dipendere da CSS esterno)
   ====================================================== */

const style = document.createElement("style");
style.innerHTML = `
  .voteLegend {
  font-size: 1.2rem;
  line-height: 1.4;
  margin-top: 8px;
  }
  .voteLegend strong { font-weight: 800; }

  .header h1 { margin: 0 0 6px 0; }
  .exposure { opacity: 0.8; margin-bottom: 10px; }

  .panel {
    background: #f4f4f4;
    border: 1px solid #aaa;
    padding: 12px;
    border-radius: 10px;
    color: #111;
    line-height: 1.45;
  }

  .contextBox {
    background: #e9eefb;
    border: 1px solid #6a86d6;
    padding: 12px;
    border-radius: 10px;
    color: #0b1a3a;
    margin: 12px 0 14px 0;
  }
  .contextBox h3, .contextBox h4 { margin: 0 0 6px 0; }
  .contextBox ul { margin: 6px 0 0 18px; }

  .questionBox {
  background: linear-gradient(135deg, #1e3a8a, #1e40af);
  color: #ffffff;
  padding: 16px;
  border-radius: 14px;
  margin: 14px 0;
  font-size: 1.1rem;
  line-height: 1.5;
  box-shadow: 0 6px 18px rgba(0,0,0,0.25);
  }


  textarea {
    width: 100%;
    box-sizing: border-box;
    padding: 10px;
    border-radius: 10px;
    border: 1px solid #999;
    font-size: 1rem;
    background: #fff;
    color: #111;
  }

  button.primary {
    padding: 12px 14px;
    font-size: 1rem;
    border-radius: 12px;
    border: 1px solid #333;
    background: #111;
    color: #fff;
    cursor: pointer;
  }
  button.primary[disabled] {
    opacity: 0.55;
    cursor: not-allowed;
  }

  .btnRow { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 10px; }
  .btnGhost {
    padding: 10px 12px;
    border-radius: 12px;
    border: 1px solid #555;
    background: #fff;
    color: #111;
    cursor: pointer;
  }

  .observations { display: grid; gap: 12px; }
  .observation {
    border: 1px solid #aaa;
    border-radius: 12px;
    padding: 12px;
    background: #fff;
    color: #111;
  }
  .observation h3 { margin: 0 0 6px 0; }
  .subtitle { margin: 0 0 8px 0; opacity: 0.85; }
  .content { margin: 0; white-space: pre-wrap; }

  .vote-container { display: grid; gap: 12px; }
  .vote-item {
    border: 1px solid #aaa;
    border-radius: 12px;
    padding: 12px;
    background: #fff;
    color: #111;
  }


 .medals {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

.medal {
  font-size: 2.6rem;
  line-height: 1;
  padding: 14px 18px;
  border-radius: 16px;
  border: 3px solid #222;
  background: #f3f3f3;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.medal.selected {
  outline: 5px solid #000;
  transform: scale(1.05);
}


.medal[data-rank="primo"] {
  background: #facc15;
}

.medal[data-rank="secondo"] {
  background: #d1d5db;
}

.medal[data-rank="terzo"] {
  background: #b45309;
  color: white;
}


.medal.selected {
  outline: 5px solid #000;
  transform: scale(1.05);
}



  .hint { opacity: 0.9; margin-top: 6px; }

`;
document.head.appendChild(style);


/* ======================================================
   UTILS
   ====================================================== */

function el(id) {
  return document.getElementById(id);
}
function clear(node) {
  node.innerHTML = "";
}
function fadeIn(node) {
  node.style.opacity = 0;
  node.style.transition = "opacity 0.6s ease";
  requestAnimationFrame(() => (node.style.opacity = 1));
}

function extractAnchor(text) {
  const match = text.match(/necessario|imprevedibile|non era previsto|urgente|con certezza|emergenza/i);
  if (match) return match[0].toLowerCase();
  const firstSentence = text.split(".")[0];
  return firstSentence.length > 12 ? firstSentence.slice(0, 60) : null;
}

function evaluateAnswer(text) {
  const anchor = extractAnchor(text);
  if (anchor && observedAnchors.length < 4) observedAnchors.push(anchor);

  if (!text || text.trim().length < 12) {
    pressureLevel += 20;
    playerModel.fragilita += 10;
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

function renderContextBox() {
  return `
    <div class="contextBox">
      <h3>Contesto operativo</h3>
      <div>
        ${GAME_CONFIG.companyName} è un’azienda di ricerca avanzata con standard di sicurezza molto elevati.
        Durante il turno hai sostituito il tuo responsabile diretto <strong>in sala di controllo</strong>.
        Per un breve periodo si è creata una potenziale falla <strong>nei processi di sicurezza</strong>.
      </div>
      <h4 style="margin-top:10px;">Persone coinvolte</h4>
      <ul>
        <li><strong>Walter</strong> – tuo responsabile diretto</li>
        <li><strong>Alex</strong> – collega e amico personale, presente in sala di controllo</li>
        <li><strong>${partnerName || "Eva / Adamo"}</strong> – tuo partner da un paio di anni</li>
      </ul>
    </div>
  `;
}

async function fetchObservationsFromAPI() {
  const payload = {
    scenario: GAME_CONFIG.scenario,
    context: {
      responsabile: "Walter",
      amico: "Alex",
      partner: partnerName || "Eva/Adamo",
      azienda: `${GAME_CONFIG.companyName} (ricerca avanzata, alta sicurezza)`
    },
    playerModel,
    answers,
    observedAnchors,
    pressureLevel
  };

  const res = await fetch("/api/observe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`observe API error: ${res.status} ${txt}`);
  }

  const json = await res.json();
  return json.osservazioni; // { fringe, psicologico, amplificato }
}


/* ======================================================
   RENDER
   ====================================================== */

function render() {
  const root = el("app");
  clear(root);

  // HEADER comune
  const header = document.createElement("div");
  header.className = "header";
  header.innerHTML = `
    <h1>${GAME_CONFIG.scenario}</h1>
    <div class="exposure">${GAME_CONFIG.exposureLabel}</div>
  `;
  root.appendChild(header);

  // STEP 0: Intro + scelta partner
  if (step === 0) {
    const panel = document.createElement("div");
    panel.className = "panel";
    panel.innerHTML = `
      ${GAME_CONFIG.introText}
      <p><strong>Prima di iniziare</strong>: indica il nome del tuo partner.</p>
      <div class="btnRow">
        <button class="btnGhost" id="evaBtn">Eva</button>
        <button class="btnGhost" id="adamoBtn">Adamo</button>
      </div>
    `;
    root.appendChild(panel);

    el("evaBtn").onclick = () => { partnerName = "Eva"; step = 1; render(); };
    el("adamoBtn").onclick = () => { partnerName = "Adamo"; step = 1; render(); };

    fadeIn(panel);
    return;
  }

  // STEP 1: Scenario letterale
  if (step === 1) {
    const panel = document.createElement("div");
    panel.className = "panel";
    panel.innerHTML = GAME_CONFIG.scenarioText(partnerName);

    const btn = document.createElement("button");
    btn.className = "primary";
    btn.textContent = "Prosegui";
    btn.onclick = () => { step = 2; render(); };

    root.appendChild(panel);
    root.appendChild(btn);
    fadeIn(panel);
    return;
  }

  // STEP 2: Microcopy canonico
  if (step === 2) {
    const panel = document.createElement("div");
    panel.className = "panel";
    panel.innerHTML = GAME_CONFIG.microcopyText;

    const btn = document.createElement("button");
    btn.className = "primary";
    btn.textContent = "Continua";
    btn.onclick = () => { step = 3; render(); };

    root.appendChild(panel);
    root.appendChild(btn);
    fadeIn(panel);
    return;
  }

  // STEP 3..(3+questions-1): Domande
  const qIndex = step - 3;
  if (qIndex >= 0 && qIndex < GAME_CONFIG.questions.length) {
    const contextHTML = document.createElement("div");
    contextHTML.innerHTML = renderContextBox();

    const question = document.createElement("div");

    question.style.opacity = 0;
    question.style.transform = "translateY(10px)";
    setTimeout(() => {
    question.style.transition = "all 0.4s ease";
    question.style.opacity = 1;
    question.style.transform = "translateY(0)";
    }, 50);


    question.className = "questionBox";
    question.textContent = GAME_CONFIG.questions[qIndex];

    const textarea = document.createElement("textarea");
    textarea.rows = 4;
    textarea.id = "answer";

    const btn = document.createElement("button");
    btn.className = "primary";
    btn.textContent = (qIndex === GAME_CONFIG.questions.length - 1) ? "Invia e valuta" : "Invia";
    btn.onclick = () => {
      const value = textarea.value.trim();
      answers.push(value);
      evaluateAnswer(value);
      step++;
      render();
    };

    root.appendChild(contextHTML.firstElementChild);
    root.appendChild(question);
    root.appendChild(textarea);
    root.appendChild(btn);

    fadeIn(question);
    return;
  }

  // Dopo le domande: Valutazione in corso -> /api/observe -> render osservazioni
  if (!currentObservations) {
    const waiting = document.createElement("div");
    waiting.className = "panel";
    waiting.innerHTML = `<p><strong>Valutazione in corso…</strong></p><p class="hint">Sto elaborando le tre letture finali.</p>`;
    root.appendChild(waiting);

    // avvio fetch (senza bloccare UI)
    fetchObservationsFromAPI()
      .then(obs => {
        currentObservations = obs;
        renderObservations(obs);
      })
      .catch(err => {
        console.error("Errore /api/observe:", err);
        // fallback coerente (oggetto)
        currentObservations = {
          fringe: "Il materiale fornito consente una lettura prudente ma incompleta.",
          psicologico: "Assumendo sincerità, emerge esposizione controllata e prudenza nel fissare responsabilità.",
          amplificato: "Assumendo messa in scena/casualità, il profilo suggerisce distacco e gestione difensiva del racconto."
        };
        renderObservations(currentObservations);
      });

    fadeIn(waiting);
    return;
  }

  // Se arriviamo qui e abbiamo già osservazioni, renderizzale
  renderObservations(currentObservations);
}


/* ======================================================
   OSSERVAZIONI + VOTO
   ====================================================== */

function renderObservationBlock(title, subtitle, text) {
  const box = document.createElement("div");
  box.className = "observation";
  box.innerHTML = `
    <h3>${title}</h3>
    <p class="subtitle">${subtitle}</p>
    <p class="content">${text || "Nessun testo disponibile."}</p>
  `;
  return box;
}

function renderObservations(observations) {
  const root = el("app");
  clear(root);

  const header = document.createElement("div");
  header.className = "header";
 
  header.innerHTML = `
  <h1>${GAME_CONFIG.scenario}</h1>
  <div class="exposure">${GAME_CONFIG.exposureLabel}</div>
  <h2>TRACCE NEL RACCONTO</h2>
`;




  // normalizza: vogliamo stringhe
  const normalized = {
    fringe: typeof observations?.fringe === "string" ? observations.fringe : JSON.stringify(observations?.fringe ?? ""),
    psicologico: typeof observations?.psicologico === "string" ? observations.psicologico : JSON.stringify(observations?.psicologico ?? ""),
    amplificato: typeof observations?.amplificato === "string" ? observations.amplificato : JSON.stringify(observations?.amplificato ?? "")
  };

  currentObservations = normalized;

  const container = document.createElement("div");
  container.className = "observations";


  container.appendChild(renderObservationBlock(
    "FRINGE / LEAK",
    "Lettura istituzionale, prudente, esterna.",
    normalized.fringe
  ));


  container.appendChild(renderObservationBlock(
  "LETTURA RELAZIONALE",
  "Impressione generata dalla forma dell’esposizione (non clinico, non conclusivo).",
  normalized.psicologico
));



const ampNote = document.createElement("p");
ampNote.className = "hint";
ampNote.innerHTML = `Nota: <strong>AMPLIFICATO</strong> contiene due ipotesi parallele (sincero vs messa in scena) nella stessa lettura.`;
container.appendChild(ampNote);

container.appendChild(renderObservationBlock(
  "AMPLIFICATO",
  "Due ipotesi parallele: sincero vs messa in scena/casualità.",
  normalized.amplificato
));



  const proceed = document.createElement("button");
  proceed.className = "primary";
  proceed.textContent = "Vai alla votazione";
  proceed.onclick = renderVoting;

  root.appendChild(header);
  root.appendChild(container);
  root.appendChild(proceed);

  fadeIn(container);
}

function renderVoting() {
  const root = el("app");
  clear(root);

  // reset voto
  voteState = { primo: null, secondo: null, terzo: null, locked: false };

  const header = document.createElement("div");
  header.className = "header";
  header.innerHTML = `
    <h1>${GAME_CONFIG.scenario}</h1>
    <div class="exposure">${GAME_CONFIG.exposureLabel}</div>
    <h2>OSSERVATORE ESTERNO</h2>
    <p>
    <p class="voteLegend">
    Per ogni lettura, scegli UNA medaglia.<br>
    <strong>🥇 1ª scelta</strong> · <strong>🥈 2ª</strong> · <strong>🥉 3ª</strong>
    </p>
  <p class="hint">
  Alla fine, dovrai aver assegnato tutte e tre le medaglie (una per posto).
  </p>

    <p class="hint">
      Dopo l’invio la votazione viene bloccata (una sola votazione per giocata).
    </p>
  `;

  const container = document.createElement("div");
  container.className = "vote-container";

  container.appendChild(renderVoteItem("fringe", currentObservations.fringe));
  container.appendChild(renderVoteItem("psicologico", currentObservations.psicologico));
  container.appendChild(renderVoteItem("amplificato", currentObservations.amplificato));

  const send = document.createElement("button");
  send.className = "primary";
  send.id = "sendVote";
  send.textContent = "Invia preferenze";
  send.onclick = submitVote;

  root.appendChild(header);
  root.appendChild(container);
  root.appendChild(send);

  fadeIn(container);
}

function renderVoteItem(key, text) {
  const box = document.createElement("div");
  box.className = "vote-item";

  const content = document.createElement("p");
  content.textContent = text;

  const buttons = document.createElement("div");
  buttons.className = "medals";

  ["primo", "secondo", "terzo"].forEach(rank => {
    const btn = document.createElement("button");

    btn.dataset.rank = rank;

    btn.className = "medal";
    
    const label = rank === "primo" ? "1°" : rank === "secondo" ? "2°" : "3°";
    btn.textContent = rank === "primo" ? "🥇" : rank === "secondo" ? "🥈" : "🥉";
    btn.setAttribute("aria-label", `Assegna ${label} posto`);
    btn.title = `Assegna ${label} posto`;
    btn.innerHTML = `${btn.textContent}<div style="font-size:0.8rem;margin-top:4px;">${label}</div>`;

    
    btn.onclick = () => assignVote(rank, key, btn);
    buttons.appendChild(btn);
  });

  box.appendChild(content);
  box.appendChild(buttons);

  return box;
}

function assignVote(rank, key, btn) {
  if (voteState.locked) return;

  // se questa lettura era già assegnata a un altro rank, liberala
  ["primo", "secondo", "terzo"].forEach(r => {
    if (r !== rank && voteState[r] === key) voteState[r] = null;
  });

  voteState[rank] = key;

  btn.parentElement.querySelectorAll("button").forEach(b => b.classList.remove("selected"));
  btn.classList.add("selected");
}


async function submitVote() {
  if (voteState.locked) return;

  const { primo, secondo, terzo } = voteState;
  if (!primo || !secondo || !terzo) {
    alert("Devi assegnare tutte e tre le preferenze.");
    return;
  }
  const unique = new Set([primo, secondo, terzo]);
  if (unique.size !== 3) {
  alert("Ogni lettura può ricevere una sola medaglia. Scegli tre letture diverse (🥇🥈🥉).");
  return;
  }

  const sendBtn = el("sendVote");
  if (sendBtn) sendBtn.disabled = true;

  try {
    voteState.locked = true;

    const res = await fetch("/api/vote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        primo,
        secondo,
        terzo,
        scenario: GAME_CONFIG.scenario
      })
    });

    if (!res.ok) throw new Error("Errore invio voto");

    const root = el("app");
    clear(root);

    root.innerHTML = `
      <div class="header">
        <h1>${GAME_CONFIG.scenario}</h1>
        <div class="exposure">${GAME_CONFIG.exposureLabel}</div>
      </div>
      <div class="panel">
        <h2>Preferenze registrate</h2>
        <p>Grazie. La tua votazione è stata acquisita.</p>
      </div>
    `;
  } catch (err) {
    console.error("Errore voto:", err);
    voteState.locked = false;
    if (sendBtn) sendBtn.disabled = false;
    alert("Errore durante l’invio della votazione.");
  }
}


/* ======================================================
   AVVIO
   ====================================================== */

document.addEventListener("DOMContentLoaded", () => {
  render();
});
