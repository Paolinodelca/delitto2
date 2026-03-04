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
 * -> Soluzione C: chiusura + replay
 **********************************************************/

/* ======================================================
   CONFIG (fallback embedded)
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

  // Descrizione “LETTERALE” (fallback Saturn)
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
    <p>
      Rispondi a 5 domande e verifica la lettura della tua esposizione!
    </p>
  `,

  // fallback: 5 domande Saturn
  questions: [
    "Descrivi con precisione perché ti trovavi in sala di controllo e cosa stavi facendo all’inizio del turno.",
    "Quando hai lasciato la sala, cosa ti ha fatto ritenere accettabile farlo in quel momento?",
    "C’è un elemento di questa vicenda che, se raccontato all’esterno di questa sala, cambierebbe il modo in cui verrebbe letta?",
    "Riguardando la sequenza degli eventi: in quale punto il sistema ha smesso di funzionare come previsto?",
    "Se emergesse solo una versione parziale dei fatti, chi pensi che ne pagherebbe il prezzo più alto?"
  ],

  // opzionale per “vestiti”:
  // partnerOptions: ["Eva", "Adamo"],
  // roles: { responsabile:"...", amico:"..." },
  // setting: "...",
  // scenarioHtmlTemplate: "...",
  // contextHtmlTemplate: "...",
  // questionSets: [[...],[...]]
};

const API_ORIGIN = (location.hostname.endsWith("github.io"))
  ? "https://delitto2.vercel.app"
  : "";

/* ======================================================
   CONFIG LOADER (vestiti esterni senza cambiare la UI)
   ====================================================== */

function deepMerge(base, override) {
  if (!override || typeof override !== "object") return base;
  const out = Array.isArray(base) ? [...base] : { ...(base || {}) };
  for (const [k, v] of Object.entries(override)) {
    if (
      v && typeof v === "object" &&
      !Array.isArray(v) &&
      typeof out[k] === "object" &&
      out[k] !== null &&
      !Array.isArray(out[k])
    ) {
      out[k] = deepMerge(out[k], v);
    } else {
      out[k] = v;
    }
  }
  return out;
}

// ricava "/delitto2" su GitHub Pages (repo pages), "" su Vercel/local
function getRepoBasePath() {
  if (!location.hostname.endsWith("github.io")) return "";
  const parts = location.pathname.split("/").filter(Boolean);
  const repo = parts[0] || "";
  return repo ? `/${repo}` : "";
}

function hydrateScenarioFunctionsFromConfig(cfg) {
  // intro / microcopy: accetta sia introText sia introHtml (json)
  if (typeof cfg.introHtml === "string" && !cfg.introText) cfg.introText = cfg.introHtml;
  if (typeof cfg.microcopyHtml === "string" && !cfg.microcopyText) cfg.microcopyText = cfg.microcopyHtml;

  // ✅ REGOLA MODULARE:
  // se arriva scenarioHtmlTemplate dal JSON, DEVE vincere sempre
  const tpl =
    (typeof cfg.scenarioHtmlTemplate === "string" && cfg.scenarioHtmlTemplate.trim())
      ? cfg.scenarioHtmlTemplate
      : (typeof cfg.scenarioText === "string" && cfg.scenarioText.trim())
        ? cfg.scenarioText
        : "";

  if (tpl) {
    cfg.scenarioText = (partnerName) => {
      const company = cfg.companyName || "—";
      const partner = partnerName || "(partner)";
      return tpl
        .replaceAll("{{companyName}}", company)
        .replaceAll("{{partnerName}}", partner);
    };
  } else if (typeof cfg.scenarioText !== "function") {
    cfg.scenarioText = (partnerName) =>
      `<p>Scenario non disponibile.</p><p>Partner: <strong>${partnerName || "(partner)"}</strong></p>`;
  }
}

function pickNextQuestionSet(questionSets, scenarioKey) {
  const storageKey = `fringe_qset_${scenarioKey}`;
  let idx = parseInt(localStorage.getItem(storageKey) || "0", 10);
  if (!Number.isInteger(idx) || idx < 0) idx = 0;

  const chosen = questionSets[idx % questionSets.length];
  localStorage.setItem(storageKey, String((idx + 1) % questionSets.length));
  return chosen;
}

function buildQuestionsFromConfig(cfg) {
  if (Array.isArray(cfg.questions) && cfg.questions.length) return cfg.questions;

  if (Array.isArray(cfg.questionPool) && cfg.questionPool.length) {
    const shuffled = [...cfg.questionPool].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 5);
  }

  return [];
}

// ✅ PUNTO UNICO: selezione domande per QUESTA run
// - se c'è questionSets -> rotazione set (coerente narrativamente)
// - altrimenti fallback su questions/questionPool
function selectQuestionsForRun() {
  if (Array.isArray(GAME_CONFIG.questionSets) && GAME_CONFIG.questionSets.length > 0) {
    const chosen = pickNextQuestionSet(GAME_CONFIG.questionSets, GAME_CONFIG.scenario || "scenario");
    if (Array.isArray(chosen) && chosen.length > 0) {
      GAME_CONFIG.questions = chosen;
      return;
    }
  }

  GAME_CONFIG.questions = buildQuestionsFromConfig(GAME_CONFIG);
}

// Scenario param -> file
async function loadExternalScenarioConfig() {
  const params = new URLSearchParams(window.location.search);
  const scenarioParam = params.get("s");

  let file = "scenario_fringe_leak.json";
  if (scenarioParam === "batman") file = "scenario_batman.json";
  if (scenarioParam === "partner") file = "scenario_partner_geloso.json";
  if (scenarioParam === "alieni") file = "scenario_alieni.json";

  const base = getRepoBasePath();
  const candidates = [
    "./data/" + file,
    base + "/data/" + file
  ];

  console.log("[SCENARIO PARAM]", scenarioParam, "file:", file, "base:", base, "candidates:", candidates);

  for (const url of candidates) {
    try {
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) {
        console.warn("[SCENARIO FETCH FAIL]", url, res.status);
        continue;
      }
      const json = await res.json();
      console.log("[SCENARIO FETCH OK]", url);
      return json;
    } catch (e) {
      console.warn("[SCENARIO FETCH ERR]", url, e);
    }
  }

  return null;
}

/* ======================================================
   STATO
   ====================================================== */

let step = 0;
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
let lastShadowWord = "";

/* ======================================================
   STILI (in-file)
   ====================================================== */

const style = document.createElement("style");
style.innerHTML = `
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

  .hint { opacity: 0.9; margin-top: 6px; }

  .closing {
    margin-top: 14px;
    padding: 12px;
    border-radius: 12px;
    border: 1px solid #bbb;
    background: #fff;
    color: #111;
    line-height: 1.5;
  }
  .closing .big {
    font-size: 1.05rem;
    font-weight: 700;
    margin: 0 0 6px 0;
  }
`;
document.head.appendChild(style);

/* ======================================================
   UTILS
   ====================================================== */

function el(id) { return document.getElementById(id); }
function clear(node) { node.innerHTML = ""; }
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

function extractShadowWord(psicText) {
  const m = String(psicText || "").match(/PAROLA-OMBRA:\s*([^\n]+)/i);
  if (!m) return "";
  const raw = (m[1] || "").trim().toLowerCase();
  const first = raw.replace(/["'.:,;!?()]/g, " ").trim().split(/\s+/)[0] || "";
  return first;
}

function getPartnerOptions() {
  const opts = Array.isArray(GAME_CONFIG.partnerOptions) ? GAME_CONFIG.partnerOptions : null;
  if (opts && opts.length >= 2) return opts.slice(0, 2);
  return ["Eva", "Adamo"];
}

function renderContextBox() {
  const roles = GAME_CONFIG.roles || {};
  const company = GAME_CONFIG.companyName || "—";
  const partner = partnerName || "(partner)";

  if (typeof GAME_CONFIG.contextHtmlTemplate === "string" && GAME_CONFIG.contextHtmlTemplate.trim()) {
    return GAME_CONFIG.contextHtmlTemplate
      .replaceAll("{{companyName}}", company)
      .replaceAll("{{partnerName}}", partner)
      .replaceAll("{{roleResponsabile}}", roles.responsabile || "Walter")
      .replaceAll("{{roleAmico}}", roles.amico || "Alex");
  }

  return `
    <div class="contextBox">
      <h3>Contesto</h3>
      <div>
        <strong>${company}</strong> è l’ambiente di riferimento di questa versione.
        Stai rispondendo sapendo che il testo verrà letto e interpretato.
      </div>
      <h4 style="margin-top:10px;">Figure in gioco</h4>
      <ul>
        <li><strong>${roles.responsabile || "Walter"}</strong> – figura di autorità (o equivalente)</li>
        <li><strong>${roles.amico || "Alex"}</strong> – contatto interno / alleato</li>
        <li><strong>${partner}</strong> – partner (pressione privata)</li>
      </ul>
    </div>
  `;
}

/* ======================================================
   API
   ====================================================== */

async function fetchObservationsFromAPI() {
  const roles = GAME_CONFIG.roles || {};

  const payload = {
    scenario: GAME_CONFIG.scenario,
    context: {
      responsabile: roles.responsabile || "Walter",
      amico: roles.amico || "Alex",
      partner: partnerName || "Eva/Adamo",
      ambiente: GAME_CONFIG.setting || ""
    },
    playerModel,
    answers,
    observedAnchors,
    pressureLevel,
    lastShadowWord
  };

  const res = await fetch(`${API_ORIGIN}/api/observe`, {
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

  const header = document.createElement("div");
  header.className = "header";
  header.innerHTML = `
    <h1>${GAME_CONFIG.scenario}</h1>
    <div class="exposure">${GAME_CONFIG.exposureLabel}</div>
  `;
  root.appendChild(header);

  // STEP 0
  if (step === 0) {
    const [p1, p2] = getPartnerOptions();

    const panel = document.createElement("div");
    panel.className = "panel";
    panel.innerHTML = `
      ${GAME_CONFIG.introText}
      <p><strong>Prima di iniziare</strong>: indica il nome del tuo partner.</p>
      <div class="btnRow">
        <button class="btnGhost" id="p1Btn">${p1}</button>
        <button class="btnGhost" id="p2Btn">${p2}</button>
      </div>
    `;
    root.appendChild(panel);

    el("p1Btn").onclick = () => { partnerName = p1; step = 1; render(); };
    el("p2Btn").onclick = () => { partnerName = p2; step = 1; render(); };

    fadeIn(panel);
    return;
  }

  // STEP 1
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

  // STEP 2
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

  // STEP 3.. domande
  const questionsNow = Array.isArray(GAME_CONFIG.questions)
    ? GAME_CONFIG.questions
    : buildQuestionsFromConfig(GAME_CONFIG);

  const qIndex = step - 3;

  if (qIndex >= 0 && qIndex < questionsNow.length) {
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
    question.textContent = questionsNow[qIndex];

    const textarea = document.createElement("textarea");
    textarea.rows = 4;
    textarea.id = "answer";

    const btn = document.createElement("button");
    btn.className = "primary";
    btn.textContent = (qIndex === questionsNow.length - 1) ? "Invia e valuta" : "Invia";
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

  // Dopo domande: /api/observe
  if (!currentObservations) {
    const waiting = document.createElement("div");
    waiting.className = "panel";
    waiting.innerHTML = `<p><strong>Valutazione in corso…</strong></p><p class="hint">Sto elaborando le tre letture finali.</p>`;
    root.appendChild(waiting);

    fetchObservationsFromAPI()
      .then(obs => {
        currentObservations = obs;
        renderObservations(obs);
      })
      .catch(err => {
        console.error("Errore /api/observe:", err);
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

  renderObservations(currentObservations);
}

/* ======================================================
   OSSERVAZIONI (Soluzione C)
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

function resetRun(keepPartner = true) {
  step = keepPartner ? 1 : 0;
  answers = [];
  pressureLevel = 0;
  observedAnchors = [];
  currentObservations = null;

  playerModel = {
    stile: "indeterminato",
    strategia: "indeterminata",
    fragilita: 0,
    rischioNarrativo: 0,
    esposizione: 0
  };

  // ✅ ROTAZIONE ANCHE SU REPLAY (senza refresh)
  // Se vuoi: con keepPartner=false torniamo alla scelta partner, ma il set domande è comunque pronto.
  selectQuestionsForRun();

  render();
}

function renderObservations(observations) {
  const root = el("app");
  clear(root);

  const header = document.createElement("div");
  header.className = "header";
  header.innerHTML = `
    <h1>${GAME_CONFIG.scenario}</h1>
    <div class="exposure">${GAME_CONFIG.exposureLabel}</div>
    <h2>QUELLO CHE EMERGE DAL RACCONTO</h2>
    <p class="hint">La stessa storia può essere letta in modi diversi.</p>
  `;

  const normalized = {
    fringe: typeof observations?.fringe === "string" ? observations.fringe : JSON.stringify(observations?.fringe ?? ""),
    psicologico: typeof observations?.psicologico === "string" ? observations.psicologico : JSON.stringify(observations?.psicologico ?? ""),
    amplificato: typeof observations?.amplificato === "string" ? observations.amplificato : JSON.stringify(observations?.amplificato ?? "")
  };

  currentObservations = normalized;

  const sw = extractShadowWord(normalized.psicologico);
  if (sw) lastShadowWord = sw;

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

  const closing = document.createElement("div");
  closing.className = "closing";
  closing.innerHTML = `
    <p class="big">Tre letture. Nessuna conclusione definitiva.</p>
    <p class="hint">La storia non cambia. Cambia il modo in cui viene letta.</p>
    <div class="btnRow">
      <button class="primary" id="retryBtn">Riprova con un'altra versione</button>
      <button class="btnGhost" id="changeBtn">Cambia scenario</button>
    </div>
  `;

  root.appendChild(header);
  root.appendChild(container);
  root.appendChild(closing);

  el("retryBtn").onclick = () => resetRun(true);
  el("changeBtn").onclick = () => { window.location.href = window.location.pathname; };

  fadeIn(container);
}

/* ======================================================
   AVVIO
   ====================================================== */

document.addEventListener("DOMContentLoaded", async () => {
  try {
    const external = await loadExternalScenarioConfig();

    if (external) {
      const merged = deepMerge(GAME_CONFIG, external);
      Object.keys(merged).forEach(k => { GAME_CONFIG[k] = merged[k]; });

      hydrateScenarioFunctionsFromConfig(GAME_CONFIG);
    }

    // ✅ scegli domande per la prima run (anche se non c'è external)
    selectQuestionsForRun();

    console.log("[SCENARIO LOADED]", {
      scenario: GAME_CONFIG.scenario,
      companyName: GAME_CONFIG.companyName,
      hasTemplate: typeof GAME_CONFIG.scenarioHtmlTemplate === "string" && GAME_CONFIG.scenarioHtmlTemplate.length > 0,
      microcopyLen: (GAME_CONFIG.microcopyText || "").length,
      questionsLen: (GAME_CONFIG.questions || []).length
    });

  } catch (e) {
    console.warn("Scenario JSON non caricato, uso config embedded.", e);
    // anche in fallback: domande pronte
    selectQuestionsForRun();
  }

  render();
});