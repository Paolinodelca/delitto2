/**********************************************************
 * FRINGE / LEAK – docs/app.js (CANONICO)
 * --------------------------------------------------------
 * - UI stabile
 * - Osservazioni = oggetto
 * - Voto singolo, persistente
 * - Pronto per futura configurazione data-driven
 **********************************************************/

/* ======================================================
   CONFIGURAZIONE BASE (NON LOGICA, SOLO DATI)
   In futuro potrà arrivare da JSON / CSV / Google Sheet
   ====================================================== */

const GAME_CONFIG = {
  scenario: "FRINGE / LEAK",
  exposureLabel: "Livello di esposizione",

  introText: `
<p><strong>Questo non è un test.</strong></p>

<p>
Quello che è successo è successo.<br>
Ora devi decidere come verrà letto.
</p>

<p>
Questa non è una ricostruzione dei fatti.<br>
È una valutazione di come rendi accettabili le tue decisioni.
</p>

<p>
Non ti viene chiesto di dire cosa è successo davvero,<br>
ma quale versione dei fatti scegli di sostenere
sapendo che verrà letta, analizzata e interpretata.
</p>
`,

  contextBox: `
<h3>Contesto operativo</h3>
<p>
Saturn Way è un’azienda di ricerca avanzata con standard di sicurezza molto elevati.
Durante il turno hai sostituito il tuo responsabile diretto <strong>in sala di controllo</strong>.
Per un breve periodo si è creata una potenziale falla <strong>nei processi di sicurezza</strong>.
</p>

<h4>Persone coinvolte</h4>
<ul>
  <li><strong>Walter</strong> – tuo responsabile diretto</li>
  <li><strong>Alex</strong> – collega e amico personale, presente in sala di controllo</li>
  <li><strong>Eva / Adamo</strong> – tuo partner da un paio di anni</li>
</ul>
`
};


/* ======================================================
   STATO UI
   ====================================================== */

let currentObservations = null;
let voteState = {
  primo: null,
  secondo: null,
  terzo: null,
  locked: false
};


/* ======================================================
   UTILITIES
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
  requestAnimationFrame(() => {
    node.style.opacity = 1;
  });
}


/* ======================================================
   RENDER INTRO + CONTESTO
   ====================================================== */
async function fetchObservationsFromAPI() {
  // Payload minimo coerente con api/observe.js
  const payload = {
    scenario: GAME_CONFIG.scenario,
    context: {
      responsabile: "Walter",
      amico: "Alex",
      partner: "Eva / Adamo"
    },
    playerModel: {
      stile: "indeterminato",
      strategia: "indeterminata",
      fragilita: 0,
      rischioNarrativo: 0,
      esposizione: 0
    },
    answers: [],            // in questa versione “intro-only” sono vuote
    observedAnchors: [],
    pressureLevel: 0
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
  // json deve essere: { osservazioni: { fringe, psicologico, amplificato } }
  return json.osservazioni;
}



function renderIntro() {
  const root = el("app");
  clear(root);

  const header = document.createElement("div");
  header.className = "header";
  header.innerHTML = `
    <h1>${GAME_CONFIG.scenario}</h1>
    <div class="exposure">${GAME_CONFIG.exposureLabel}</div>
  `;

  const intro = document.createElement("div");
  intro.className = "intro";
  intro.innerHTML = GAME_CONFIG.introText;

  const context = document.createElement("div");
  context.className = "context";
  context.innerHTML = GAME_CONFIG.contextBox;

  const proceed = document.createElement("button");
  proceed.className = "primary";
  proceed.textContent = "Inizia";
 


 proceed.onclick = async () => {
  const root = el("app");
  clear(root);

  // UI di attesa (niente schermate “vuote”)
  const header2 = document.createElement("div");
  header2.className = "header";
  header2.innerHTML = `
    <h1>${GAME_CONFIG.scenario}</h1>
    <div class="exposure">${GAME_CONFIG.exposureLabel}</div>
    <h2>OSSERVAZIONI DELL’OSSERVATORE</h2>
    <p>Valutazione in corso…</p>
  `;
  root.appendChild(header2);

  try {
    const obs = await fetchObservationsFromAPI();
    renderObservations(obs);
  } catch (err) {
    console.error("Errore fetchObservationsFromAPI:", err);

    // fallback coerente (oggetto, non array)
    renderObservations({
      fringe:
        "Nessun contenuto è stato fornito: la lettura istituzionale resta sospesa.",
      psicologico:
        "Assumendo sincerità, l’assenza di esposizione indica contenimento e ritiro narrativo.",
      amplificato:
        "Assumendo messa in scena/casualità, il profilo suggerisce distacco e non-collaborazione."
    });
  }
};




  root.appendChild(header);
  root.appendChild(intro);
  root.appendChild(context);
  root.appendChild(proceed);

  fadeIn(root);
}



/* ======================================================
   OSSERVAZIONI
   ====================================================== */

function renderObservations(observations) {
  // ✅ 1) Recupero robusto dei dati (evita crash tipo "cannot read fringe of undefined")
  const data =
    observations ||
    window.OBSERVATIONS_DATA ||
    window.currentObservations ||
    currentObservations ||
    null;

  // ✅ 2) Se manca tutto, mostra un messaggio e NON crasha
  if (!data || typeof data !== "object") {
    console.error("renderObservations: osservazioni mancanti/invalidi", {
      observations,
      OBSERVATIONS_DATA: window.OBSERVATIONS_DATA,
      currentObservations: window.currentObservations,
      currentObservationsVar: currentObservations
    });

    const root = el("app");
    clear(root);

    const header = document.createElement("div");
    header.className = "header";
    header.innerHTML = `
      <h1>${GAME_CONFIG.scenario}</h1>
      <div class="exposure">${GAME_CONFIG.exposureLabel}</div>
      <h2>OSSERVAZIONI DELL’OSSERVATORE</h2>
    `;

    const container = document.createElement("div");
    container.className = "observations";
    container.innerHTML = `<p>Nessuna osservazione disponibile (errore di caricamento).</p>`;

    const retry = document.createElement("button");
    retry.className = "primary";
    retry.textContent = "Riprova";
    retry.onclick = () => location.reload();

    root.appendChild(header);
    root.appendChild(container);
    root.appendChild(retry);
    return;
  }

  // ✅ 3) Normalizza: vogliamo SEMPRE stringhe, mai oggetti/undefined
  const normalized = {
    fringe:
      typeof data.fringe === "string"
        ? data.fringe
        : data.fringe
          ? JSON.stringify(data.fringe)
          : "",
    psicologico:
      typeof data.psicologico === "string"
        ? data.psicologico
        : data.psicologico
          ? JSON.stringify(data.psicologico)
          : "",
    amplificato:
      typeof data.amplificato === "string"
        ? data.amplificato
        : data.amplificato
          ? JSON.stringify(data.amplificato)
          : ""
  };

  // ✅ 4) Salva stato (così renderVoting può leggerlo)
  currentObservations = normalized;
  window.currentObservations = normalized;

  // ✅ 5) Render (uguale al tuo, ma usando normalized)
  const root = el("app");
  clear(root);

  const header = document.createElement("div");
  header.className = "header";
  header.innerHTML = `
    <h1>${GAME_CONFIG.scenario}</h1>
    <div class="exposure">${GAME_CONFIG.exposureLabel}</div>
    <h2>OSSERVAZIONI DELL’OSSERVATORE</h2>
  `;

  const container = document.createElement("div");
  container.className = "observations";

  container.appendChild(
    renderObservationBlock(
      "FRINGE / LEAK",
      "Lettura istituzionale, prudente, esterna.",
      normalized.fringe || "Nessun testo disponibile."
    )
  );

  container.appendChild(
    renderObservationBlock(
      "PSICOLOGICO",
      "Assumendo che le risposte siano sincere.",
      normalized.psicologico || "Nessun testo disponibile."
    )
  );

  container.appendChild(
    renderObservationBlock(
      "AMPLIFICATO",
      "Assumendo che le risposte siano una messa in scena o casuali.",
      normalized.amplificato || "Nessun testo disponibile."
    )
  );

  const proceed = document.createElement("button");
  proceed.className = "primary";
  proceed.textContent = "Prosegui";
  proceed.onclick = renderVoting;

  root.appendChild(header);
  root.appendChild(container);
  root.appendChild(proceed);

  fadeIn(container);
}


function renderObservationBlock(title, subtitle, text) {
  const box = document.createElement("div");
  box.className = "observation";

  box.innerHTML = `
    <h3>${title}</h3>
    <p class="subtitle">${subtitle}</p>
    <p class="content">${text}</p>
  `;

  return box;
}


/* ======================================================
   VOTAZIONE
   ====================================================== */

function renderVoting() {
  const root = el("app");
  clear(root);

  voteState = { primo: null, secondo: null, terzo: null, locked: false };

  const header = document.createElement("div");
  header.className = "header";
  header.innerHTML = `
    <h1>${GAME_CONFIG.scenario}</h1>
    <div class="exposure">${GAME_CONFIG.exposureLabel}</div>
    <h2>OSSERVATORE ESTERNO</h2>
    <p>
      Assegna una preferenza:<br>
      🥇 più convincente · 🥈 seconda · 🥉 terza
    </p>
  `;

  const container = document.createElement("div");
  container.className = "vote-container";

  container.appendChild(renderVoteItem("fringe", currentObservations.fringe));
  container.appendChild(renderVoteItem("psicologico", currentObservations.psicologico));
  container.appendChild(renderVoteItem("amplificato", currentObservations.amplificato));

  const send = document.createElement("button");
  send.className = "primary";
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
    btn.className = "medal";
    btn.textContent = rank === "primo" ? "🥇" : rank === "secondo" ? "🥈" : "🥉";
    btn.onclick = () => assignVote(rank, key, btn);
    buttons.appendChild(btn);
  });

  box.appendChild(content);
  box.appendChild(buttons);

  return box;
}

function assignVote(rank, key, btn) {
  if (voteState.locked) return;

  voteState[rank] = key;

  btn.parentElement.querySelectorAll("button").forEach(b =>
    b.classList.remove("selected")
  );
  btn.classList.add("selected");
}

async function submitVote() {
  if (voteState.locked) return;

  const { primo, secondo, terzo } = voteState;
  if (!primo || !secondo || !terzo) {
    alert("Devi assegnare tutte e tre le preferenze.");
    return;
  }

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

    el("app").innerHTML = `
      <h2>Preferenze registrate</h2>
      <p>La tua valutazione è stata acquisita.</p>
    `;
  } catch (err) {
    voteState.locked = false;
    alert("Errore durante l’invio della votazione.");
    console.error(err);
  }
}


/* ======================================================
   AVVIO
   ====================================================== */

document.addEventListener("DOMContentLoaded", () => {
  renderIntro();
});

