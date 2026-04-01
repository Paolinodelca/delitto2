function safeJsonForHtml(value) {
  return JSON.stringify(value ?? {}, null, 2).replace(/</g, "\\u003c");
}

export function renderInteractiveInterviewShellHtml({
  sessionResult = {},
  shellOptions = {}
} = {}) {
  const payloadJson = safeJsonForHtml(sessionResult);
  const shellOptionsJson = safeJsonForHtml(shellOptions);

  return `
<!doctype html>
<html lang="it">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>FRINGE Interview Setup</title>

<style>
  :root {
    --bg: #f4f6fb;
    --card: #ffffff;
    --text: #1f2937;
    --muted: #5b6472;
    --line: #cfd8e3;
    --line-strong: #94a3b8;
    --shadow: 0 10px 24px rgba(15, 23, 42, 0.08);

    --header: #9a3412;
    --header-2: #c2410c;

    --prep-bg: #fff7ed;
    --prep-border: #fdba74;
    --prep-active: #ea580c;
    --prep-text: #7c2d12;

    --free-bg: #fffbeb;
    --free-border: #f59e0b;
    --free-active: #d97706;

    --pro-bg: #f5f3ff;
    --pro-border: #c4b5fd;
    --pro-active: #7c3aed;
    --pro-text: #4c1d95;

    --premium-bg: #faf5ff;
    --premium-border: #d8b4fe;
    --premium-active: #9333ea;
    --premium-text: #581c87;

    --ok-bg: #ecfdf3;
    --ok-border: #86efac;
    --ok-text: #166534;

    --warn-bg: #fff7ed;
    --warn-border: #fdba74;
    --warn-text: #9a3412;

    --soft: #f8fafc;
  }

  * {
    box-sizing: border-box;
  }

  html, body {
    margin: 0;
    padding: 0;
    background: var(--bg);
    color: var(--text);
    font-family: Arial, Helvetica, sans-serif;
  }

  body {
    min-height: 100vh;
  }

  .top-shell-wrap {
    position: sticky;
    top: 0;
    z-index: 100;
    padding-top: 0;
    background: transparent;
  }

  .top-shell {
    max-width: 1180px;
    margin: 0 auto;
    background: linear-gradient(180deg, rgba(154,52,18,0.98) 0%, rgba(194,65,12,0.98) 100%);
    box-shadow: 0 10px 24px rgba(15, 23, 42, 0.12);
    border-radius: 0 0 18px 18px;
  }

  .top-shell-inner {
    padding: 10px 18px 12px 18px;
  }

  .title-row {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
    color: white;
    margin-bottom: 10px;
  }

  .title-main {
    font-size: 18px;
    font-weight: 800;
    letter-spacing: 0.02em;
  }

  .title-sub {
    font-size: 15px;
    color: rgba(255,255,255,0.96);
    margin-top: 4px;
    font-weight: 700;
    line-height: 1.35;
  }

  .title-help {
    font-size: 13px;
    color: rgba(255,255,255,0.88);
    margin-top: 6px;
    line-height: 1.35;
    font-weight: 600;
  }



.nav-strip {
  display: grid;
  grid-template-columns: 1.45fr 0.85fr 0.82fr 0.92fr 0.92fr;
  gap: 8px;
  align-items: stretch;
}

.nav-btn,
.nav-link {
  position: relative;
  min-height: 62px;
  border-radius: 13px;
  border: 2px solid transparent;
  padding: 8px 10px 9px 10px;
  background: white;
  text-align: left;
  box-shadow:
    0 8px 16px rgba(15, 23, 42, 0.08),
    inset 0 1px 0 rgba(255,255,255,0.85);
  transition: transform 0.16s ease, box-shadow 0.16s ease, border-color 0.16s ease, background 0.16s ease;
}

.nav-btn:hover,
.nav-link:hover {
  transform: translateY(-1px);
}

.nav-btn {
  cursor: pointer;
}

.nav-link {
  display: block;
  text-decoration: none;
  color: inherit;
}

.nav-btn.active,
.nav-link.active {
  border-width: 3px;
  transform: translateY(-1px);
  box-shadow:
    0 14px 24px rgba(15, 23, 42, 0.18),
    inset 0 0 0 1px rgba(255,255,255,0.65);
}

.nav-btn.active::after,
.nav-link.active::after {
  content: "";
  position: absolute;
  left: 10px;
  right: 10px;
  bottom: 5px;
  height: 4px;
  border-radius: 999px;
  background: currentColor;
  opacity: 0.28;
}

.nav-btn.prep,
.nav-link.prep {
  background: linear-gradient(180deg, #ffffff 0%, var(--prep-bg) 100%);
  border-color: var(--prep-border);
  color: var(--prep-text);
}

.nav-btn.free,
.nav-link.free {
  background: linear-gradient(180deg, #ffffff 0%, #fffaf0 100%);
  border-color: var(--free-border);
  color: #8a5a00;
}

.nav-btn.pro,
.nav-link.pro {
  background: linear-gradient(180deg, #ffffff 0%, var(--pro-bg) 100%);
  border-color: var(--pro-border);
  color: var(--pro-text);
}

.nav-btn.premium,
.nav-link.premium {
  background: linear-gradient(180deg, #ffffff 0%, var(--premium-bg) 100%);
  border-color: var(--premium-border);
  color: var(--premium-text);
}

.nav-btn.prep.active,
.nav-link.prep.active {
  border-color: var(--prep-active);
  background: linear-gradient(180deg, #ffffff 0%, #ffe8d1 100%);
}

.nav-btn.free.active,
.nav-link.free.active {
  border-color: var(--free-active);
  background: linear-gradient(180deg, #ffffff 0%, #fff1cc 100%);
}

.nav-btn.pro.active,
.nav-link.pro.active {
  border-color: var(--pro-active);
  background: linear-gradient(180deg, #ffffff 0%, #ede9fe 100%);
}

.nav-btn.premium.active,
.nav-link.premium.active {
  border-color: var(--premium-active);
  background: linear-gradient(180deg, #ffffff 0%, #f5e8ff 100%);
}

.nav-row {
  display: grid;
  grid-template-columns: 26px minmax(0, 1fr);
  gap: 8px;
  align-items: start;
}

.nav-index {
  width: 26px;
  height: 26px;
  min-width: 26px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 900;
  color: white;
  box-shadow: 0 4px 12px rgba(0,0,0,0.16);
  align-self: start;
  margin-top: 1px;
}

.nav-index.prep { background: #ea580c; }
.nav-index.free { background: #d97706; }
.nav-index.pro { background: #7c3aed; }
.nav-index.premium { background: #9333ea; }

.nav-copy {
  min-width: 0;
}

.nav-headline {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 6px;
}

.plan-chip {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  padding: 3px 7px;
  font-size: 9px;
  font-weight: 900;
  letter-spacing: 0.04em;
  color: white;
  line-height: 1;
  margin-top: 1px;
}

.plan-chip.free { background: #16a34a; }
.plan-chip.pro { background: #7c3aed; }
.plan-chip.premium { background: #9333ea; }

.nav-title {
  font-size: 14px;
  font-weight: 800;
  line-height: 1.05;
  color: #111827;
}

.nav-desc {
  font-size: 11px;
  color: #475467;
  margin-top: 3px;
  line-height: 1.2;
  max-width: 100%;
}

.prep-checks {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 4px 6px;
  margin-top: 6px;
}

.prep-check {
  display: flex;
  align-items: center;
  gap: 5px;
  min-width: 0;
}

.prep-dot {
  width: 9px;
  height: 9px;
  min-width: 9px;
  border-radius: 999px;
  background: #cbd5e1;
  border: 1px solid #94a3b8;
}

.prep-dot.ok {
  background: #16a34a;
  border-color: #166534;
  box-shadow: 0 0 0 2px rgba(22,163,74,0.14);
}

.prep-check-label {
  font-size: 10px;
  font-weight: 700;
  color: #475467;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.nav-lock {
  position: absolute;
  top: 8px;
  right: 8px;
  font-size: 14px;
  line-height: 1;
}




  .page {
    max-width: 1180px;
    margin: 16px auto 0 auto;
    padding: 0 18px 28px 18px;
  }

  .panel {
    display: none;
  }

  .panel.active {
    display: block;
  }

  .card {
    background: var(--card);
    border: 2px solid var(--line);
    border-radius: 16px;
    padding: 18px;
    box-shadow: var(--shadow);
  }

  .card + .card {
    margin-top: 16px;
  }

  .card.emphasis {
    border-color: #f59e0b;
    background: linear-gradient(180deg, #fffdf8 0%, #fff7ed 100%);
  }

  .card.paid {
    border-color: #c4b5fd;
    background: linear-gradient(180deg, #ffffff 0%, #faf5ff 100%);
  }

  .card.paid-premium {
    border-color: #d8b4fe;
    background: linear-gradient(180deg, #ffffff 0%, #fdf4ff 100%);
  }

  .mode-highlight {
    margin-top: 16px;
    padding: 14px;
    border-radius: 14px;
    border: 2px solid #fcd34d;
    background: linear-gradient(180deg, #fffef7 0%, #fff7ed 100%);
  }

  .mode-highlight-title {
    font-size: 14px;
    font-weight: 900;
    color: #9a3412;
    margin-bottom: 6px;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .mode-highlight-text {
    font-size: 14px;
    line-height: 1.5;
    color: #7c2d12;
    font-weight: 700;
  }

  .kicker {
    font-size: 12px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: #6b7280;
    margin-bottom: 8px;
  }

  h1, h2, h3 {
    margin: 0;
  }

  h2 {
    font-size: 24px;
    margin-bottom: 10px;
  }

  h3 {
    font-size: 18px;
    margin-bottom: 10px;
  }

  .intro {
    font-size: 16px;
    line-height: 1.48;
    color: #374151;
    font-weight: 600;
  }

  .field-grid {
    display: grid;
    gap: 14px;
    margin-top: 16px;
  }

  .field-box {
    border: 2px solid var(--line);
    border-radius: 14px;
    padding: 14px;
    background: var(--soft);
  }

  .field-box.complete {
    border-color: var(--ok-border);
    background: var(--ok-bg);
  }

  .field-head {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    align-items: center;
    margin-bottom: 8px;
  }

  .field-title {
    font-size: 15px;
    font-weight: 800;
  }

  .field-state {
    font-size: 11px;
    font-weight: 900;
    border-radius: 999px;
    padding: 4px 8px;
    border: 1px solid transparent;
  }

  .field-state.ok {
    background: var(--ok-bg);
    border-color: var(--ok-border);
    color: var(--ok-text);
  }

  .field-state.missing {
    background: var(--warn-bg);
    border-color: var(--warn-border);
    color: var(--warn-text);
  }

  label {
    display: block;
    font-size: 14px;
    font-weight: 800;
    margin-bottom: 6px;
  }

  input, textarea, select {
    width: 100%;
    border: 2px solid #cbd5e1;
    border-radius: 10px;
    padding: 11px 12px;
    font: inherit;
    background: white;
    color: #111827;
  }

  textarea {
    resize: vertical;
    min-height: 120px;
  }

  .help {
    margin-top: 6px;
    font-size: 13px;
    color: var(--muted);
  }

  .mini-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 14px;
    margin-top: 16px;
  }

  .mini-card {
    border: 2px solid var(--line);
    border-radius: 14px;
    background: white;
    padding: 14px;
  }

  .mini-card-title {
    font-size: 13px;
    color: #6b7280;
    font-weight: 800;
    margin-bottom: 8px;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .mini-card-value {
    font-size: 16px;
    font-weight: 800;
    color: #111827;
  }

  .prep-next-hint {
    margin-top: 8px;
    font-size: 13px;
    font-weight: 700;
    color: #9a3412;
  }

  .prep-next-hint.ok {
    color: #166534;
  }

  .cta-row {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-top: 14px;
  }

  .cta {
    appearance: none;
    border: 0;
    border-radius: 12px;
    padding: 12px 16px;
    font: inherit;
    font-weight: 800;
    cursor: pointer;
    background: var(--header);
    color: white;
    box-shadow: 0 8px 18px rgba(154, 52, 18, 0.18);
  }

  .cta.secondary {
    background: white;
    color: #7c2d12;
    border: 2px solid #fdba74;
    box-shadow: none;
  }

  .sim-box {
    border: 2px solid var(--line);
    border-radius: 14px;
    background: white;
    padding: 16px;
    margin-top: 16px;
  }

  .sim-box-title {
    font-size: 15px;
    font-weight: 800;
    margin-bottom: 8px;
  }

  .sim-note {
    font-size: 15px;
    line-height: 1.45;
    color: #374151;
  }

  .locked-title {
    font-size: 20px;
    font-weight: 800;
    margin-bottom: 10px;
  }

  .locked-text {
    font-size: 15px;
    line-height: 1.55;
    color: #374151;
  }

  .locked-highlight {
    margin-top: 12px;
    padding: 12px;
    border-radius: 12px;
    background: rgba(255,255,255,0.84);
    border: 2px dashed #cbd5e1;
    font-size: 14px;
    line-height: 1.5;
  }

  .locked-highlight strong {
    color: #111827;
  }

  .footer-note {
    margin-top: 18px;
    font-size: 13px;
    color: #6b7280;
    text-align: center;
  }



@media (max-width: 1120px) {
  .mini-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 760px) {
  .title-row {
    flex-direction: column;
    align-items: stretch;
    margin-bottom: 6px;
  }

  .top-shell-inner {
    padding: 8px 10px 9px 10px;
  }

  .page {
    padding: 0 12px 24px 12px;
  }

  .title-main {
    font-size: 15px;
  }

  .title-sub {
    font-size: 12px;
    margin-top: 3px;
    line-height: 1.2;
  }

  .title-help {
    font-size: 11px;
    margin-top: 4px;
    line-height: 1.2;
  }

  .nav-strip {
    display: flex;
    gap: 8px;
    overflow-x: auto;
    overflow-y: hidden;
    padding-bottom: 4px;
    scrollbar-width: thin;
    -webkit-overflow-scrolling: touch;
  }

  .nav-strip::-webkit-scrollbar {
    height: 6px;
  }

  .nav-strip::-webkit-scrollbar-thumb {
    background: rgba(255,255,255,0.35);
    border-radius: 999px;
  }

  .nav-btn,
  .nav-link {
    flex: 0 0 176px;
    min-height: 52px;
    padding: 7px 8px 8px 8px;
    border-radius: 11px;
  }

  .nav-row {
    grid-template-columns: 22px minmax(0, 1fr);
    gap: 6px;
  }

  .nav-index {
    width: 22px;
    height: 22px;
    min-width: 22px;
    font-size: 10px;
    margin-top: 0;
  }

  .plan-chip {
    padding: 2px 6px;
    font-size: 8px;
  }

  .nav-title {
    font-size: 12px;
    line-height: 1.05;
  }

  .nav-desc {
    font-size: 10px;
    margin-top: 2px;
    line-height: 1.15;
  }

  .prep-checks {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 3px 5px;
    margin-top: 5px;
  }

  .prep-dot {
    width: 8px;
    height: 8px;
    min-width: 8px;
  }

  .prep-check-label {
    font-size: 9px;
  }

  .nav-lock {
    top: 6px;
    right: 6px;
    font-size: 12px;
  }

  .card {
    padding: 14px;
    border-radius: 14px;
  }

  h2 {
    font-size: 20px;
  }

  h3 {
    font-size: 16px;
  }

  .intro {
    font-size: 14px;
    line-height: 1.4;
  }

  .field-box,
  .mini-card,
  .sim-box {
    padding: 12px;
    border-radius: 12px;
  }

  input,
  textarea,
  select {
    padding: 10px 10px;
    font-size: 14px;
  }

  .cta {
    width: 100%;
    justify-content: center;
  }
}


</style>
</head>

<body>
  <div class="top-shell-wrap">
    <div class="top-shell">
      <div class="top-shell-inner">
        <div class="title-row">
          <div>
            <div class="title-main">CONFIGURAZIONE DELLA SIMULAZIONE</div>
            <div class="title-sub">Un flusso semplice: prepari i dati, scegli il formato del colloquio, lanci la simulazione e poi apri il report.</div>
            <div class="title-help">Seleziona dalla barra: 1) preparazione, 2) simulazione, 3) report. Le aree PRO e PREMIUM mostrano i livelli di supporto avanzato.</div>
          </div>
        </div>

        <div class="nav-strip">
         
        
        <button class="nav-btn prep active" type="button" data-panel="prep">
  <div class="nav-row">
    <span class="nav-index prep">1</span>
    <div class="nav-copy">
      <div class="nav-headline">
        <div class="nav-title">Preparazione</div>
        <span class="plan-chip free">FREE</span>
      </div>
      <div class="nav-desc">Dati essenziali<br>e lingua</div>
      <div class="prep-checks">
        <div class="prep-check"><span class="prep-dot" id="dotRole"></span><span class="prep-check-label">Ruolo</span></div>
        <div class="prep-check"><span class="prep-dot" id="dotCv"></span><span class="prep-check-label">CV</span></div>
        <div class="prep-check"><span class="prep-dot" id="dotJd"></span><span class="prep-check-label">JD</span></div>
        <div class="prep-check"><span class="prep-dot ok" id="dotLang"></span><span class="prep-check-label">Lingua</span></div>
      </div>
    </div>
  </div>
</button>


          <button class="nav-btn free" type="button" data-panel="simulation">
  <div class="nav-row">
    <span class="nav-index free">2</span>
    <div class="nav-copy">
      <div class="nav-headline">
        <div class="nav-title">Simulazione</div>
        <span class="plan-chip free">FREE</span>
      </div>
      <div class="nav-desc">Controllo finale<br>e avvio</div>
    </div>
  </div>
</button>

<a class="nav-link free" href="./fringe_interview_interactive_shell_report.html">
  <div class="nav-row">
    <span class="nav-index free">3</span>
    <div class="nav-copy">
      <div class="nav-headline">
        <div class="nav-title">Report</div>
        <span class="plan-chip free">FREE</span>
      </div>
      <div class="nav-desc">Apri il report<br>della simulazione</div>
    </div>
  </div>
</a>



         <button class="nav-btn pro" type="button" data-panel="pro">
  <div class="nav-lock">🔒</div>
  <div class="nav-row">
    <span class="nav-index pro">4</span>
    <div class="nav-copy">
      <div class="nav-headline">
        <div class="nav-title">Training</div>
        <span class="plan-chip pro">PRO</span>
      </div>
      <div class="nav-desc">Feedback mirato<br>e guida</div>
    </div>
  </div>
</button>


          <button class="nav-btn premium" type="button" data-panel="premium">
  <div class="nav-lock">🔒</div>
  <div class="nav-row">
    <span class="nav-index premium">5</span>
    <div class="nav-copy">
      <div class="nav-headline">
        <div class="nav-title">Selezione</div>
        <span class="plan-chip premium">PREMIUM</span>
      </div>
      <div class="nav-desc">Visione recruiter<br>e CV avanzato</div>
    </div>
  </div>
</button>


        </div>
      </div>
    </div>
  </div>

  <main class="page">
    <section class="panel active" id="panel_prep">
      <div class="card emphasis">
        <div class="kicker">Step 1 · Preparazione</div>
        <h2>Inserisci i dati per iniziare</h2>
        <div class="intro">
          Per partire davvero servono il CV e il ruolo target. La job description non è obbligatoria, ma migliora la qualità della simulazione e rende il feedback più centrato.
        </div>

        <div class="field-grid">
          <div class="field-box" id="boxRole">
            <div class="field-head">
              <div class="field-title">Ruolo target</div>
              <div class="field-state missing" id="stateRole">Da inserire</div>
            </div>
            <label for="targetRoleInput">Inserisci il ruolo</label>
            <input id="targetRoleInput" type="text" placeholder="Es. Product Operations Manager" />
            <div class="help">Serve per orientare simulazione, domande e lettura finale del profilo.</div>
          </div>

          <div class="field-box" id="boxCv">
            <div class="field-head">
              <div class="field-title">CV</div>
              <div class="field-state missing" id="stateCv">Da inserire</div>
            </div>
            <label for="cvTextInput">Incolla il CV</label>
            <textarea id="cvTextInput" rows="8" placeholder="Incolla qui il CV oppure un estratto significativo..."></textarea>
            <div class="help">Qui metti il contenuto che useremo per capire esperienza, responsabilità, strumenti e segnali di seniority.</div>
          </div>

          <div class="field-box" id="boxJd">
            <div class="field-head">
              <div class="field-title">Job description</div>
              <div class="field-state missing" id="stateJd">Consigliata</div>
            </div>
            <label for="jdTextInput">Incolla la job description</label>
            <textarea id="jdTextInput" rows="6" placeholder="Incolla qui la job description o i requisiti principali del ruolo..."></textarea>
            <div class="help">Aiuta a rendere più preciso il fit col ruolo e più credibili le domande della simulazione.</div>
          </div>
        </div>

        <div class="mini-grid">
          <div class="mini-card">
            <div class="mini-card-title">Lingua interfaccia</div>
            <select id="uiLocaleSelect">
              <option value="it">Italiano</option>
              <option value="en">English</option>
            </select>
          </div>

          <div class="mini-card">
            <div class="mini-card-title">Lingua colloquio</div>
            <select id="sessionLocaleSelect">
              <option value="it">Italiano</option>
              <option value="en">English</option>
            </select>
          </div>
        </div>

        <div class="mini-grid">
          <div class="mini-card">
            <div class="mini-card-title">Formato colloquio</div>
            <select id="interviewLengthModeSelect">
              <option value="short">Quick Interview · breve e incisiva</option>
              <option value="standard" selected>Standard Interview · equilibrio</option>
              <option value="deep">Deep Interview · più esplorazione</option>
            </select>
            <div class="help" id="interviewLengthModeHelp">
              Versione rapida: poche domande ma con un affondo adattivo se emerge una debolezza forte.
            </div>
          </div>

          <div class="mini-card">
            <div class="mini-card-title">Modalità risposta</div>
            <select id="inputModeSelect">
              <option value="text">Text</option>
              <option value="voice">Voice ready</option>
            </select>
          </div>
        </div>

        <div class="mini-grid">
          <div class="mini-card">
            <div class="mini-card-title">Stato preparazione</div>
            <div class="mini-card-value" id="statusPrepValue">Da completare</div>
            <div class="prep-next-hint" id="prepNextHint">Completa almeno CV e ruolo target</div>
          </div>

          <div class="mini-card">
            <div class="mini-card-title">Formato selezionato</div>
            <div class="mini-card-value" id="selectedModeValue">Standard Interview</div>
            <div class="help" id="selectedModeSubtext">Equilibrio tra rapidità, copertura e approfondimento.</div>
          </div>
        </div>

        <div class="mode-highlight">
          <div class="mode-highlight-title">Suggerimento pratico</div>
          <div class="mode-highlight-text" id="modeHighlightText">
            Quick Interview è la scelta migliore per una prova veloce o una demo: resta breve, ma se trova una debolezza importante stringe comunque il punto con un approfondimento mirato.
          </div>
        </div>

        <div class="cta-row">
          <button class="cta secondary" id="fillDemoButton" type="button">Carica esempio</button>
        </div>
      </div>
    </section>

    <section class="panel" id="panel_simulation">
      <div class="card emphasis">
        <div class="kicker">Step 2 · Simulazione</div>
        <h2>Controllo finale e avvio</h2>
        <div class="intro">
          Quando CV e ruolo target sono presenti, la simulazione può partire. La job description resta fortemente consigliata, ma non blocca l’avvio.
        </div>

        <div class="sim-box">
          <div class="sim-box-title">Prontezza attuale</div>
          <div class="sim-note" id="simulationReadinessText">
            Per abilitare davvero la simulazione servono almeno CV e ruolo target.
          </div>
        </div>

        <div class="mini-grid">
          <div class="mini-card">
            <div class="mini-card-title">Ruolo target</div>
            <div class="mini-card-value" id="simRoleValue">Non inserito</div>
          </div>
          <div class="mini-card">
            <div class="mini-card-title">CV</div>
            <div class="mini-card-value" id="simCvValue">Non inserito</div>
          </div>
          <div class="mini-card">
            <div class="mini-card-title">Job description</div>
            <div class="mini-card-value" id="simJdValue">Non inserita</div>
          </div>
          <div class="mini-card">
            <div class="mini-card-title">Lingua colloquio</div>
            <div class="mini-card-value" id="simLangValue">Italiano</div>
          </div>
          <div class="mini-card">
            <div class="mini-card-title">Formato colloquio</div>
            <div class="mini-card-value" id="simModeValue">Standard Interview</div>
          </div>
          <div class="mini-card">
            <div class="mini-card-title">Stile atteso</div>
            <div class="mini-card-value" id="simModeBehaviorValue">Equilibrato</div>
          </div>
        </div>

        <div class="cta-row">
          <button class="cta" id="fakeStartButton" type="button">Completa prima CV e ruolo target</button>
        </div>

        <div class="help" id="simulationModeFootnote">
          In modalità standard il colloquio cerca equilibrio tra copertura e profondità.
        </div>
      </div>
    </section>

    <section class="panel" id="panel_pro">
      <div class="card paid">
        <div class="kicker">Piano PRO</div>
        <div class="locked-title">Con il piano PRO lavori davvero sulle risposte</div>
        <div class="locked-text">
          Qui non trovi solo un giudizio più ricco: trovi un aiuto guidato per migliorare in modo operativo la qualità delle risposte.
        </div>
        <div class="locked-highlight">
          <strong>Nel Pro puoi vedere:</strong>
          <ul>
            <li>suggerimenti più mirati;</li>
            <li>lettura risposta per risposta;</li>
            <li>punti deboli ricorrenti;</li>
            <li>indicazioni su come rendere più forti contenuto, struttura e credibilità.</li>
          </ul>
        </div>
      </div>
    </section>

    <section class="panel" id="panel_premium">
      <div class="card paid-premium">
        <div class="kicker">Piano PREMIUM</div>
        <div class="locked-title">Con il piano PREMIUM vai oltre il Pro</div>
        <div class="locked-text">
          Il Premium include tutto il piano Pro e aggiunge il livello più vicino a una vera lettura di selezione.
        </div>
        <div class="locked-highlight">
          <strong>Immagina di avere un recruiter esperto che ti aiuta a:</strong>
          <ul>
            <li>capire come il CV si posiziona rispetto a una posizione specifica;</li>
            <li>individuare dove perdi credibilità in selezione;</li>
            <li>migliorare davvero contenuti, tono e qualità delle risposte;</li>
            <li>rafforzare il CV in modo più utile per il ruolo che stai cercando.</li>
          </ul>
        </div>
      </div>
    </section>

    <div class="footer-note">
      Questa pagina prepara la simulazione. Il report si apre dal pulsante “Report” nella barra superiore.
    </div>
  </main>

  <script id="session-data" type="application/json">${payloadJson}</script>
  <script id="shell-options-data" type="application/json">${shellOptionsJson}</script>

  <script>
    const sourceResult = JSON.parse(document.getElementById("session-data").textContent || "{}");
    const shellOptions = JSON.parse(document.getElementById("shell-options-data").textContent || "{}");

    const targetRoleInput = document.getElementById("targetRoleInput");
    const cvTextInput = document.getElementById("cvTextInput");
    const jdTextInput = document.getElementById("jdTextInput");
    const uiLocaleSelect = document.getElementById("uiLocaleSelect");
    const sessionLocaleSelect = document.getElementById("sessionLocaleSelect");
    const interviewLengthModeSelect = document.getElementById("interviewLengthModeSelect");
    const inputModeSelect = document.getElementById("inputModeSelect");
    const fakeStartButton = document.getElementById("fakeStartButton");
    const fillDemoButton = document.getElementById("fillDemoButton");

    function text(value) {
      return String(value ?? "").trim();
    }

    function setState(elId, value, okText, missingText) {
      const el = document.getElementById(elId);
      if (!el) return;
      const ok = !!value;
      el.textContent = ok ? okText : missingText;
      el.className = "field-state " + (ok ? "ok" : "missing");
    }

    function setBoxComplete(boxId, value) {
      const box = document.getElementById(boxId);
      if (!box) return;
      box.classList.toggle("complete", !!value);
    }

    function setDot(id, isOk) {
      const dot = document.getElementById(id);
      if (!dot) return;
      dot.classList.toggle("ok", !!isOk);
    }

    function switchPanel(panelKey) {
      document.querySelectorAll(".panel").forEach((panel) => {
        panel.classList.toggle("active", panel.id === "panel_" + panelKey);
      });

      document.querySelectorAll(".nav-btn[data-panel]").forEach((button) => {
        button.classList.toggle("active", button.getAttribute("data-panel") === panelKey);
      });
    }

    function humanizeLocale(value) {
      return value === "en" ? "English" : "Italiano";
    }

    function getModeCopy(mode) {
      if (mode === "short") {
        return {
          title: "Quick Interview",
          help: "Versione rapida: poche domande ma con un affondo adattivo se emerge una debolezza forte.",
          subtext: "Breve, incisiva, ottima per prova veloce o demo.",
          behavior: "Rapido ma incisivo",
          footnote: "In Quick Interview il sistema resta breve ma, se trova una debolezza forte, può affondare una sola volta nel punto critico.",
          highlight: "Quick Interview è la scelta migliore per una prova veloce o una demo: resta breve, ma se trova una debolezza importante stringe comunque il punto con un approfondimento mirato.",
          buttonReady: "Avvia Quick Interview"
        };
      }

      if (mode === "deep") {
        return {
          title: "Deep Interview",
          help: "Versione più estesa: più copertura, più pressione e più spazio per emergere o andare in difficoltà.",
          subtext: "Più lunga, più esplorativa, più vicina a un test serio.",
          behavior: "Più esigente",
          footnote: "In Deep Interview il sistema esplora più aree e lascia più spazio agli approfondimenti adattivi.",
          highlight: "Deep Interview è la scelta giusta quando vuoi un test più severo: più ampiezza, più verifica, più occasioni per far emergere punti forti e fragilità.",
          buttonReady: "Avvia Deep Interview"
        };
      }

      return {
        title: "Standard Interview",
        help: "Versione bilanciata: copertura buona, ritmo sostenibile e spazio per almeno un approfondimento quando serve.",
        subtext: "Equilibrio tra rapidità, copertura e approfondimento.",
        behavior: "Equilibrato",
        footnote: "In modalità standard il colloquio cerca equilibrio tra copertura e profondità.",
        highlight: "Standard Interview è la scelta più equilibrata: abbastanza ampia da dare un quadro credibile, ma senza diventare troppo lunga.",
        buttonReady: "Avvia simulazione"
      };
    }

    function updateUi() {
      const hasRole = !!text(targetRoleInput.value);
      const hasCv = !!text(cvTextInput.value);
      const hasJd = !!text(jdTextInput.value);
      const prepReady = hasRole && hasCv;
      const mode = interviewLengthModeSelect.value || "standard";
      const modeCopy = getModeCopy(mode);

      setState("stateRole", hasRole, "Compilato", "Da inserire");
      setState("stateCv", hasCv, "Compilato", "Da inserire");
      setState("stateJd", hasJd, "Inserita", "Consigliata");

      setBoxComplete("boxRole", hasRole);
      setBoxComplete("boxCv", hasCv);
      setBoxComplete("boxJd", hasJd);

      setDot("dotRole", hasRole);
      setDot("dotCv", hasCv);
      setDot("dotJd", hasJd);

      document.getElementById("statusPrepValue").textContent = prepReady ? "Pronta" : "Da completare";

      const nextHint = document.getElementById("prepNextHint");
      nextHint.textContent = prepReady
        ? "Preparazione completa → passa alla simulazione"
        : "Completa almeno CV e ruolo target";
      nextHint.classList.toggle("ok", prepReady);

      document.getElementById("selectedModeValue").textContent = modeCopy.title;
      document.getElementById("selectedModeSubtext").textContent = modeCopy.subtext;
      document.getElementById("interviewLengthModeHelp").textContent = modeCopy.help;
      document.getElementById("modeHighlightText").textContent = modeCopy.highlight;

      document.getElementById("simRoleValue").textContent = hasRole ? targetRoleInput.value.trim() : "Non inserito";
      document.getElementById("simCvValue").textContent = hasCv ? "Inserito" : "Non inserito";
      document.getElementById("simJdValue").textContent = hasJd ? "Inserita" : "Non inserita";
      document.getElementById("simLangValue").textContent = humanizeLocale(sessionLocaleSelect.value);
      document.getElementById("simModeValue").textContent = modeCopy.title;
      document.getElementById("simModeBehaviorValue").textContent = modeCopy.behavior;
      document.getElementById("simulationModeFootnote").textContent = modeCopy.footnote;

      document.getElementById("simulationReadinessText").textContent = prepReady
        ? "I dati essenziali sono pronti. Puoi passare alla simulazione e poi aprire il report."
        : "Per abilitare davvero la simulazione servono almeno CV e ruolo target.";

      fakeStartButton.textContent = prepReady
        ? modeCopy.buttonReady
        : "Completa prima CV e ruolo target";
    }

    [
      targetRoleInput,
      cvTextInput,
      jdTextInput,
      uiLocaleSelect,
      sessionLocaleSelect,
      interviewLengthModeSelect,
      inputModeSelect
    ].forEach((el) => {
      el.addEventListener("input", updateUi);
      el.addEventListener("change", updateUi);
    });

    fillDemoButton.addEventListener("click", () => {
      targetRoleInput.value = "Product Operations Manager";
      cvTextInput.value =
        "Business Analyst con 6 anni di esperienza in contesti digitali, reporting, dashboard, stakeholder management e analisi SQL/Tableau.";
      jdTextInput.value =
        "Ricerchiamo una figura capace di coordinare processi cross-funzionali, lavorare con team prodotto e operations, gestire priorità, stakeholder e miglioramento continuo.";
      uiLocaleSelect.value = "it";
      sessionLocaleSelect.value = "it";
      interviewLengthModeSelect.value = "short";
      inputModeSelect.value = "text";
      updateUi();
    });

    fakeStartButton.addEventListener("click", () => {
      switchPanel("simulation");
      updateUi();
    });

    document.querySelectorAll(".nav-btn[data-panel]").forEach((button) => {
      button.addEventListener("click", () => {
        switchPanel(button.getAttribute("data-panel"));
      });
    });

    updateUi();
    switchPanel("prep");
  </script>
</body>
</html>
  `.trim();
}

export default renderInteractiveInterviewShellHtml;