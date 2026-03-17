function safeJsonForHtml(value) {
  return JSON.stringify(value, null, 2).replace(/</g, "\\u003c");
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function renderInteractiveInterviewShellHtml({ sessionResult }) {
  if (!sessionResult || typeof sessionResult !== "object") {
    throw new Error("renderInteractiveInterviewShellHtml: sessionResult is required.");
  }

  const payloadJson = safeJsonForHtml(sessionResult);

  const html = `<!doctype html>
<html lang="it">
<head>
  <meta charset="utf-8" />
  <title>FRINGE Interview — Coach Dashboard</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>
    :root {
      --bg: #f4f7fb;
      --card: #ffffff;
      --card-soft: #f8fbff;
      --text: #18212f;
      --muted: #617084;
      --line: #dfe7f1;
      --shadow: 0 10px 28px rgba(20, 34, 58, 0.08);

      --blue-bg: #edf4ff;
      --blue-border: #cfe0ff;
      --blue-text: #2457c5;

      --good-bg: #ecfdf3;
      --good-border: #cfeeda;
      --good-text: #1f7a48;

      --mid-bg: #fff7e8;
      --mid-border: #f2ddb4;
      --mid-text: #9b5d00;

      --bad-bg: #fff0f0;
      --bad-border: #efc4c4;
      --bad-text: #a63b3b;

      --neutral-bg: #eef2f7;
      --neutral-border: #d9e0ea;
      --neutral-text: #526072;

      --zebra-a: #fcfdff;
      --zebra-b: #f8fbff;

      --strength-bg: #dcfce7;
      --strength-text: #166534;
      --evidence-bg: #dbeafe;
      --evidence-text: #1d4ed8;
      --weakness-bg: #fee2e2;
      --weakness-text: #b91c1c;

      --coach-bg: #f4f9ff;
      --coach-border: #cfe0ff;
      --coach-text: #1f3f73;

      --draft-bg: #f7fbff;
      --draft-border: #dbe7f5;

      --radius: 18px;
    }

    * {
      box-sizing: border-box;
    }

    body {
      margin: 0;
      padding: 24px;
      background: var(--bg);
      color: var(--text);
      font-family: Inter, Arial, Helvetica, sans-serif;
      line-height: 1.55;
    }

    .page {
      max-width: 1180px;
      margin: 0 auto;
      display: grid;
      gap: 18px;
    }

    .card {
      background: var(--card);
      border: 1px solid var(--line);
      border-radius: var(--radius);
      box-shadow: var(--shadow);
    }

    .hero-card {
      padding: 24px;
      background: linear-gradient(180deg, #fbfcff 0%, #f4f8ff 100%);
      border-color: #dbe7ff;
    }

    .section-card {
      padding: 20px;
    }

    .debug-card {
      padding: 14px 18px;
    }

    .eyebrow {
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      font-weight: 800;
      color: var(--muted);
      margin-bottom: 8px;
    }

    h1 {
      margin: 0;
      font-size: 34px;
      line-height: 1.05;
      letter-spacing: -0.03em;
      color: #132033;
    }

    h2 {
      margin: 0;
      font-size: 24px;
      line-height: 1.15;
      letter-spacing: -0.02em;
      color: #16253a;
    }

    h3 {
      margin: 0 0 10px 0;
      font-size: 18px;
      line-height: 1.2;
      color: #1c2b42;
    }

    h4 {
      margin: 0 0 8px 0;
      font-size: 15px;
      color: #23334d;
    }

    h5 {
      margin: 0 0 8px 0;
      font-size: 16px;
      line-height: 1.2;
      color: #1d2a3f;
    }

    p {
      margin: 0;
    }

    .hero-top {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 16px;
      margin-bottom: 18px;
    }

    .fit-pill,
    .status-pill,
    .source-pill,
    .mini-pill {
      display: inline-flex;
      align-items: center;
      padding: 6px 10px;
      border-radius: 999px;
      font-size: 12px;
      font-weight: 800;
      white-space: nowrap;
      border: 1px solid transparent;
    }

    .mini-pill {
      font-size: 12px;
      padding: 5px 9px;
    }

    .fit-pill {
      background: var(--blue-bg);
      border-color: var(--blue-border);
      color: var(--blue-text);
    }

    .good {
      background: var(--good-bg);
      border-color: var(--good-border);
      color: var(--good-text);
    }

    .mid {
      background: var(--mid-bg);
      border-color: var(--mid-border);
      color: var(--mid-text);
    }

    .bad {
      background: var(--bad-bg);
      border-color: var(--bad-border);
      color: var(--bad-text);
    }

    .neutral {
      background: var(--neutral-bg);
      border-color: var(--neutral-border);
      color: var(--neutral-text);
    }

    .hero-grid {
      display: grid;
      grid-template-columns: 1.3fr 1fr;
      gap: 18px;
    }

    .hero-summary {
      background: #ffffff;
      border: 1px solid #dbe7ff;
      border-radius: 16px;
      padding: 18px;
    }

    .hero-summary-text {
      margin-top: 10px;
      font-size: 17px;
      color: #2a3950;
    }

    .hero-side {
      display: grid;
      gap: 12px;
    }

    .info-box {
      background: var(--card-soft);
      border: 1px solid var(--line);
      border-radius: 14px;
      padding: 14px;
    }

    .info-box.emphasis {
      background: linear-gradient(180deg, #f7fbff 0%, #eef7ff 100%);
      border-color: #dbe7f6;
    }

    .bullet-list {
      margin: 0;
      padding-left: 18px;
      display: grid;
      gap: 6px;
    }

    .snapshot-grid {
      display: grid;
      gap: 14px;
      margin-top: 14px;
    }

    .snapshot-row {
      display: grid;
      gap: 8px;
    }

    .snapshot-head {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
    }

    .snapshot-label-wrap {
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }

    .snapshot-label {
      font-size: 14px;
      font-weight: 800;
      color: #263246;
    }

    .snapshot-score {
      font-size: 12px;
      font-weight: 800;
      padding: 5px 10px;
      border-radius: 999px;
      border: 1px solid transparent;
    }

    .bar-track {
      width: 100%;
      height: 12px;
      background: #edf2f8;
      border-radius: 999px;
      overflow: hidden;
      border: 1px solid #e0e7f0;
    }

    .bar-fill {
      height: 100%;
      border-radius: 999px;
    }

    .bar-fill.good {
      background: #3fb36b;
    }

    .bar-fill.mid {
      background: #d7a528;
    }

    .bar-fill.bad {
      background: #d85b5b;
    }

    .metric-help {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 18px;
      height: 18px;
      border-radius: 999px;
      background: #e5e7eb;
      color: #374151;
      font-size: 11px;
      font-weight: 800;
      cursor: help;
      position: relative;
      border: 1px solid #d7dce4;
    }

    .metric-help:hover .tooltip,
    .metric-help:focus .tooltip {
      opacity: 1;
      visibility: visible;
      transform: translateY(0);
    }

    .tooltip {
      position: absolute;
      left: 0;
      bottom: calc(100% + 8px);
      width: 240px;
      background: #111827;
      color: white;
      font-size: 12px;
      line-height: 1.4;
      padding: 8px 10px;
      border-radius: 8px;
      box-shadow: 0 8px 20px rgba(0,0,0,0.18);
      opacity: 0;
      visibility: hidden;
      transform: translateY(4px);
      transition: all 0.15s ease;
      z-index: 20;
      text-transform: none;
      letter-spacing: 0;
      font-weight: 500;
    }

    .map-list {
      display: grid;
      gap: 14px;
      margin-top: 14px;
    }

    .map-item {
      border: 1px solid var(--line);
      border-radius: 18px;
      overflow: hidden;
      box-shadow: 0 4px 14px rgba(0,0,0,0.03);
      transition: border-color 0.18s ease, box-shadow 0.18s ease, transform 0.18s ease;
    }

    .map-item:nth-child(odd) {
      background: var(--zebra-a);
    }

    .map-item:nth-child(even) {
      background: var(--zebra-b);
    }

    .map-item:nth-child(odd) > summary {
      border-left: 6px solid #7aa7ff;
    }

    .map-item:nth-child(even) > summary {
      border-left: 6px solid #8ad2b0;
    }

    .map-item[open] {
      border-color: #b8cbe8;
      box-shadow: 0 10px 24px rgba(36, 87, 197, 0.10);
      transform: translateY(-1px);
    }

    .map-item[open] > summary {
      background: linear-gradient(180deg, #ffffff 0%, #f6faff 100%);
    }

    details summary {
      list-style: none;
      cursor: pointer;
    }

    details summary::-webkit-details-marker {
      display: none;
    }

    .map-item > summary {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 12px;
      padding: 16px 18px;
      background: rgba(255,255,255,0.8);
    }

    .map-left {
      display: flex;
      gap: 14px;
      min-width: 0;
      flex: 1;
    }

    .map-index {
      width: 38px;
      min-width: 38px;
      height: 38px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-radius: 12px;
      background: #eef3fb;
      border: 1px solid #dce6f4;
      font-size: 13px;
      font-weight: 850;
    }

    .map-title-wrap {
      min-width: 0;
      flex: 1;
    }

    .map-title-row {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
      margin-bottom: 4px;
    }

    .map-title {
      font-size: 16px;
      font-weight: 800;
      color: #1d2a3f;
    }

    .map-subtitle {
      font-size: 12px;
      color: var(--muted);
      line-height: 1.45;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .map-right {
      display: flex;
      flex-direction: column;
      gap: 8px;
      align-items: flex-end;
      min-width: 110px;
    }

    .open-hint {
      font-size: 11px;
      color: var(--muted);
      font-weight: 700;
    }

    .map-content {
      padding: 16px 18px 18px 18px;
      border-top: 1px solid var(--line);
      display: grid;
      gap: 12px;
    }

    .content-box {
      background: #ffffff;
      border: 1px solid #e4eaf2;
      border-radius: 12px;
      padding: 14px;
    }

    .content-box.soft {
      background: #f8fbff;
      border-color: #dde8f6;
    }

    .trainer-box {
      border: 1px dashed #cfd9e7;
      border-radius: 14px;
      background: #ffffff;
      overflow: hidden;
    }

    .trainer-box[open] {
      border-color: #a9c0e0;
      box-shadow: inset 0 0 0 1px rgba(122,167,255,0.08);
    }

    .trainer-box > summary {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
      padding: 14px 16px;
      font-weight: 800;
      background: #fbfdff;
      font-size: 15px;
    }

    .trainer-content {
      padding: 16px;
      border-top: 1px dashed #cfd9e7;
      display: grid;
      gap: 16px;
    }

    .trainer-section-title {
      font-size: 18px;
      font-weight: 850;
      line-height: 1.2;
      color: #17304f;
      margin-bottom: 6px;
    }

    .annotated-text {
      line-height: 1.9;
      white-space: pre-wrap;
      background: #fafcff;
      border: 1px solid #e5edf7;
      border-radius: 12px;
      padding: 14px;
      font-size: 15px;
      color: #1b2638;
    }

    .hl-strength {
      background: var(--strength-bg);
      color: var(--strength-text);
      padding: 1px 3px;
      border-radius: 4px;
    }

    .hl-evidence {
      background: var(--evidence-bg);
      color: var(--evidence-text);
      padding: 1px 3px;
      border-radius: 4px;
    }

    .hl-weakness {
      background: var(--weakness-bg);
      color: var(--weakness-text);
      padding: 1px 3px;
      border-radius: 4px;
    }

    .legend-row {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin-top: 8px;
    }

    .trainer-columns {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    .trainer-column {
      border-radius: 14px;
      padding: 14px;
      border: 1px solid var(--line);
    }

    .trainer-column.positive {
      background: linear-gradient(180deg, #f7fdf9 0%, #ecfdf3 100%);
      border-color: #cfeeda;
    }

    .trainer-column.negative {
      background: linear-gradient(180deg, #fff8f8 0%, #fff0f0 100%);
      border-color: #efc4c4;
    }

    .trainer-column-title {
      font-size: 18px;
      font-weight: 850;
      line-height: 1.2;
      margin-bottom: 10px;
    }

    .trainer-column.positive .trainer-column-title {
      color: #17663a;
    }

    .trainer-column.negative .trainer-column-title {
      color: #9d2c2c;
    }

    .callout-box {
      border-radius: 14px;
      padding: 14px;
      border: 1px solid var(--line);
    }

    .callout-box.coach {
      background: linear-gradient(180deg, var(--coach-bg) 0%, #eef6ff 100%);
      border-color: var(--coach-border);
    }

    .callout-box.draft {
      background: linear-gradient(180deg, var(--draft-bg) 0%, #f1f8ff 100%);
      border-color: var(--draft-border);
    }

    .callout-title {
      font-size: 18px;
      font-weight: 850;
      line-height: 1.2;
      margin-bottom: 8px;
      color: #183a67;
    }

    .callout-box.draft .callout-title {
      color: #2457c5;
    }

    .draft-box {
      white-space: pre-wrap;
      font-size: 15px;
      line-height: 1.7;
    }

    .overview-summary {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 14px;
    }

    .overview-body {
      margin-top: 14px;
      display: grid;
      gap: 16px;
    }

    .overview-stats {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 12px;
    }

    .stat-box {
      background: #f8fbff;
      border: 1px solid #dde7f4;
      border-radius: 16px;
      padding: 16px;
    }

    .stat-value {
      font-size: 28px;
      font-weight: 850;
      line-height: 1;
    }

    .stat-label {
      margin-top: 8px;
      font-size: 13px;
      color: var(--muted);
    }

    .guide-grid {
      display: grid;
      grid-template-columns: 1.1fr 1fr;
      gap: 16px;
    }

    .guide-box {
      background: #f8fbff;
      border: 1px solid #dde7f4;
      border-radius: 14px;
      padding: 14px;
    }

    .guide-box ul {
      margin: 0;
      padding-left: 18px;
      display: grid;
      gap: 6px;
    }

    .surface-note {
      font-size: 13px;
      color: #6b7280;
    }

    pre {
      margin: 12px 0 0 0;
      padding: 14px;
      border-radius: 12px;
      background: #0f172a;
      color: #e5eefc;
      font-size: 12px;
      line-height: 1.5;
      overflow: auto;
    }

    .empty-state {
      padding: 18px;
      border: 1px dashed var(--line);
      border-radius: 14px;
      color: var(--muted);
      background: #fbfcfe;
    }

    @media (max-width: 960px) {
      .hero-grid,
      .trainer-columns,
      .overview-stats,
      .guide-grid {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 760px) {
      body {
        padding: 14px;
      }

      .hero-top,
      .overview-summary,
      .map-item > summary,
      .trainer-box > summary {
        flex-direction: column;
        align-items: stretch;
      }

      .map-right {
        align-items: flex-start;
        min-width: 0;
      }

      h1 {
        font-size: 28px;
      }
    }
  </style>
</head>
<body>
  <main class="page">
    <section class="card hero-card">
      <div class="hero-top">
        <div>
          <div class="eyebrow">Esito colloquio</div>
          <h1>Coach Dashboard</h1>
        </div>
        <div id="heroFitPill" class="fit-pill">—</div>
      </div>

      <div class="hero-grid">
        <div class="hero-summary">
          <h2>Sintesi finale</h2>
          <p id="heroSummaryText" class="hero-summary-text">—</p>
        </div>

        <div class="hero-side">
          <div class="info-box">
            <h3>Punti forti</h3>
            <div id="heroStrengths">—</div>
          </div>

          <div class="info-box">
            <h3>Da migliorare</h3>
            <div id="heroWeaknesses">—</div>
          </div>

          <div class="info-box emphasis">
            <h3>Consigli finali</h3>
            <div id="heroAdvice">—</div>
          </div>
        </div>
      </div>
    </section>

    <section class="card section-card">
      <div class="eyebrow">Panoramica</div>
      <h2>Performance snapshot</h2>
      <div id="performanceSnapshot" class="snapshot-grid">—</div>
    </section>

    <section class="card section-card">
      <div class="eyebrow">Percorso</div>
      <h2>Mappa del colloquio</h2>
      <div id="interviewMap" class="map-list">—</div>
    </section>

    <section class="card section-card">
      <details id="trainerOverview">
        <summary class="overview-summary">
          <div>
            <div class="eyebrow">Approfondimento</div>
            <h2>Trainer mode</h2>
          </div>
          <div id="trainerOverviewMeta" class="surface-note">—</div>
        </summary>

        <div class="overview-body">
          <p class="surface-note">
            Qui trovi una guida rapida per leggere il report e usare meglio i feedback risposta per risposta.
          </p>

          <div class="overview-stats">
            <div class="stat-box">
              <div id="trainerStatAnswers" class="stat-value">0</div>
              <div class="stat-label">Risposte</div>
            </div>
            <div class="stat-box">
              <div id="trainerStatLlm" class="stat-value">0</div>
              <div class="stat-label">Review LLM</div>
            </div>
            <div class="stat-box">
              <div id="trainerStatFallback" class="stat-value">0</div>
              <div class="stat-label">Fallback / altre review</div>
            </div>
          </div>

          <div class="guide-grid">
            <div class="guide-box">
              <h3>Come leggere questo report</h3>
              <ul>
                <li><strong>Aderenza profilo–ruolo</strong>: indica quanto il profilo emerso da CV e parsing sembra compatibile con la posizione target.</li>
                <li><strong>Performance snapshot</strong>: mostra come sono costruite le risposte, non quanto “piace” il candidato in astratto.</li>
                <li><strong>Coach tip</strong>: suggerisce come rendere la risposta più forte alla prossima iterazione.</li>
                <li><strong>Bozza migliorata</strong>: è una direzione possibile, non un testo da usare alla cieca.</li>
              </ul>
            </div>

            <div class="guide-box">
              <h3>Mini guida pratica</h3>
              <ul>
                <li>aggiungi <strong>contesto</strong> per far capire la situazione</li>
                <li>rendi esplicita la tua <strong>azione personale</strong></li>
                <li>chiudi con <strong>risultato o impatto</strong></li>
                <li>quando utile, aggiungi una breve <strong>riflessione finale</strong></li>
              </ul>
            </div>
          </div>
        </div>
      </details>
    </section>

    <section class="card debug-card">
      <details>
        <summary>Debug</summary>
        <pre id="debugJson">—</pre>
      </details>
    </section>
  </main>

  <script id="session-data" type="application/json">${payloadJson}</script>

  <script>
    const sourceResult = JSON.parse(document.getElementById("session-data").textContent);
    const root = sourceResult?.fringeInterviewMVPSession || sourceResult?.fringeInterviewMVP || {};

    function ensureArray(value) {
      return Array.isArray(value) ? value : [];
    }

    function ensureObject(value) {
      return value && typeof value === "object" && !Array.isArray(value) ? value : {};
    }

    function text(value, fallback = "—") {
      if (value === undefined || value === null) return fallback;
      if (typeof value === "string") {
        const trimmed = value.trim();
        return trimmed || fallback;
      }
      if (typeof value === "number") return String(value);
      return fallback;
    }

    function htmlEscape(value) {
      const raw = String(value ?? "");
      return raw
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    }

    function setText(id, value) {
      const el = document.getElementById(id);
      if (el) el.textContent = value ?? "—";
    }

    function setHtml(id, value) {
      const el = document.getElementById(id);
      if (el) el.innerHTML = value ?? "—";
    }

    function average(values) {
      const valid = ensureArray(values).filter(function (value) {
        return typeof value === "number" && Number.isFinite(value);
      });
      if (!valid.length) return 0;
      return Math.round(valid.reduce(function (sum, value) {
        return sum + value;
      }, 0) / valid.length);
    }

    function bulletList(items, fallback) {
      const clean = ensureArray(items)
        .map(function (item) {
          if (typeof item === "string") return item.trim();
          if (item && typeof item === "object") {
            return text(item.label || item.title || item.name || item.text || "", "");
          }
          return "";
        })
        .filter(Boolean);

      if (!clean.length) {
        return "<ul class=\\"bullet-list\\"><li>" + htmlEscape(fallback || "—") + "</li></ul>";
      }

      return "<ul class=\\"bullet-list\\">" +
        clean.map(function (item) {
          return "<li>" + htmlEscape(item) + "</li>";
        }).join("") +
      "</ul>";
    }

    function metricDefinitions() {
      return {
        specificity: {
          label: "Specificità",
          help: "Quanto chiaramente emergono contesto, scope, ruolo e azioni specifiche."
        },
        ownership: {
          label: "Ownership",
          help: "Quanto è chiaro ciò che hai deciso, guidato o posseduto personalmente."
        },
        evidence: {
          label: "Evidenze",
          help: "Quanto la risposta rende visibili risultati, impatti, dati o effetti concreti."
        },
        concreteness: {
          label: "Esempi concreti",
          help: "Quanto spesso la risposta contiene situazioni, episodi o dettagli reali invece di restare astratta."
        },
        clarity: {
          label: "Chiarezza",
          help: "Quanto la risposta è comprensibile, pulita e facile da seguire."
        },
        structure: {
          label: "Struttura",
          help: "Quanto la risposta segue un filo leggibile, per esempio contesto, azione, risultato."
        }
      };
    }

    function humanizeRecommendationBand(value) {
      const map = {
        strong_fit: "Aderenza forte",
        solid_fit: "Buona aderenza",
        plausible_fit: "Aderenza plausibile",
        stretch_fit: "Aderenza con gap rilevanti",
        weak_fit: "Aderenza debole"
      };
      return map[value] || value || "Valutazione non disponibile";
    }

    function humanizeAnswerBand(value) {
      const map = {
        strong: "Buona",
        medium: "Discreta",
        weak: "Debole"
      };
      return map[value] || value || "Non valutata";
    }

    function bandClassFromBand(value) {
      if (value === "strong") return "good";
      if (value === "medium") return "mid";
      if (value === "weak") return "bad";
      return "neutral";
    }

    function bandClassFromScore(score) {
      if (score >= 70) return "good";
      if (score >= 50) return "mid";
      return "bad";
    }

    function getEmbeddedAnswers() {
      return ensureArray(root?.interviewRuntime?.runtimeState?.answers);
    }

    function buildFallbackFinalReport(answers) {
      const overallScore = average(
        answers.map(function (item) {
          return item?.answerAnalysis?.answerShapeAnalysis?.overallScore;
        })
      );

      let overallBand = "weak";
      if (overallScore >= 72) overallBand = "strong";
      else if (overallScore >= 54) overallBand = "medium";

      const dimensions = ["concreteness", "specificity", "evidence", "ownership", "structure", "clarity", "reflection"];
      const dimensionAverages = {};

      dimensions.forEach(function (key) {
        dimensionAverages[key] = average(
          answers.map(function (item) {
            return item?.answerAnalysis?.answerShapeAnalysis?.dimensionScores?.[key];
          })
        );
      });

      const recurringStrengths = [];
      answers.forEach(function (item) {
        ensureArray(item?.answerAnalysis?.answerShapeAnalysis?.strengths).forEach(function (s) {
          if (s && !recurringStrengths.includes(s)) recurringStrengths.push(s);
        });
      });

      const recurringWeaknesses = [];
      if (dimensionAverages.ownership < 58) recurringWeaknesses.push("Ownership personale da rendere più esplicita.");
      if (dimensionAverages.evidence < 58) recurringWeaknesses.push("Risultati e impatti da supportare meglio con evidenze.");
      if (dimensionAverages.structure < 56) recurringWeaknesses.push("Struttura delle risposte da rendere più lineare.");
      if (dimensionAverages.reflection < 52) recurringWeaknesses.push("Apprendimento e adattamento ancora poco visibili.");

      let narrative =
        "La sessione mostra una base credibile, ma le risposte possono diventare più incisive rendendo più visibili risultati, ownership e chiusura riflessiva.";

      if (overallBand === "strong") {
        narrative =
          "La sessione restituisce un profilo credibile e convincente, con buone evidenze, struttura solida e messaggi rilevanti per il ruolo.";
      } else if (overallBand === "medium") {
        narrative =
          "La sessione è complessivamente credibile e mostra basi buone; il salto di qualità sta soprattutto nel rendere più espliciti risultati, ownership e impatto.";
      }

      const finalAdvice = [];
      if (dimensionAverages.evidence < 58) finalAdvice.push("Chiudi più spesso le risposte con un risultato concreto: beneficio, miglioramento o effetto prodotto.");
      if (dimensionAverages.ownership < 58) finalAdvice.push("Rendi più netto il tuo ruolo usando formule dirette come “ho deciso”, “ho proposto”, “ho impostato”, “ho guidato”.");
      if (dimensionAverages.reflection < 52) finalAdvice.push("Quando possibile, aggiungi una chiusura breve su ciò che hai imparato o migliorato.");

      return {
        overallBand: overallBand,
        overallScore: overallScore,
        dimensionAverages: dimensionAverages,
        recurringStrengths: recurringStrengths,
        recurringWeaknesses: recurringWeaknesses,
        finalAdvice: finalAdvice,
        narrative: narrative
      };
    }

    function getFinalReport() {
      if (root?.interviewReport?.interviewReport) {
        return {
          overallBand: root.interviewReport.interviewReport.sessionStats?.overallBand || "medium",
          overallScore: root.interviewReport.interviewReport.sessionStats?.overallScore || 0,
          dimensionAverages: root.interviewReport.interviewReport.dimensionAverages || {},
          recurringStrengths: ensureArray(root.interviewReport.interviewReport.recurringStrengths).map(function (item) {
            return item?.label || item;
          }),
          recurringWeaknesses: ensureArray(root.interviewReport.interviewReport.recurringWeaknesses).map(function (item) {
            return item?.label || item;
          }),
          finalAdvice: ensureArray(root.interviewReport.interviewReport.finalAdvice),
          narrative: root.interviewReport.interviewReport.narrativeSummary || ""
        };
      }

      return buildFallbackFinalReport(getEmbeddedAnswers());
    }

    function getFitLabel() {
      return humanizeRecommendationBand(
        root?.parserResult?.jobFitAnalysis?.jobFitAnalysis?.fitSummary?.recommendationBand ||
        root?.parserResult?.jobFitAnalysis?.fitSummary?.recommendationBand ||
        "Valutazione non disponibile"
      );
    }

    function extractSnapshotMetrics(report) {
      const defs = metricDefinitions();
      const dims = ensureObject(report?.dimensionAverages);

      const metrics = [
        { key: "specificity", label: defs.specificity.label, help: defs.specificity.help, score: dims.specificity },
        { key: "ownership", label: defs.ownership.label, help: defs.ownership.help, score: dims.ownership },
        { key: "evidence", label: defs.evidence.label, help: defs.evidence.help, score: dims.evidence },
        { key: "concreteness", label: defs.concreteness.label, help: defs.concreteness.help, score: dims.concreteness },
        { key: "clarity", label: defs.clarity.label, help: defs.clarity.help, score: dims.clarity },
        { key: "structure", label: defs.structure.label, help: defs.structure.help, score: dims.structure }
      ].filter(function (item) {
        return typeof item.score === "number" && Number.isFinite(item.score);
      });

      if (metrics.length) return metrics;

      return [
        { key: "specificity", label: defs.specificity.label, help: defs.specificity.help, score: 46 },
        { key: "ownership", label: defs.ownership.label, help: defs.ownership.help, score: 23 },
        { key: "evidence", label: defs.evidence.label, help: defs.evidence.help, score: 44 },
        { key: "concreteness", label: defs.concreteness.label, help: defs.concreteness.help, score: 52 },
        { key: "clarity", label: defs.clarity.label, help: defs.clarity.help, score: 55 },
        { key: "structure", label: defs.structure.label, help: defs.structure.help, score: 38 }
      ];
    }

    function getAnswerBandInfo(answer) {
      const llm = answer?.answerAnnotation || null;
      const heuristic = answer?.answerAnalysis?.answerShapeAnalysis || null;

      if (llm) {
        const band = llm?.summary?.overallBand || "medium";
        const score = band === "strong" ? 82 : band === "medium" ? 62 : 42;
        return {
          band: band,
          score: score,
          source: "LLM"
        };
      }

      const fallbackScore = heuristic?.overallScore ?? 0;
      const fallbackBand = heuristic?.overallBand || (fallbackScore >= 72 ? "strong" : fallbackScore >= 54 ? "medium" : "weak");

      return {
        band: fallbackBand,
        score: fallbackScore,
        source: "Analisi"
      };
    }

    function renderAnnotatedTextFallback(textValue) {
      const raw = String(textValue || "");
      const patterns = [
        {
          type: "strength",
          regex: /\\b(ho deciso|ho impostato|ho guidato|ho proposto|ho organizzato|ho definito|ho scelto|ho coordinato|ho ottenuto|ho creato|ho costruito)\\b/gi,
          label: "Ownership"
        },
        {
          type: "evidence",
          regex: /\\b\\d+(?:[.,]\\d+)?\\s*(?:%|percento|percent)?\\b/gi,
          label: "Dato o metrica"
        },
        {
          type: "evidence",
          regex: /\\b(risultato|impatto|beneficio|miglioramento|riduzione|vantaggio|effetto)\\b/gi,
          label: "Impatto"
        },
        {
          type: "weakness",
          regex: /\\b(cose|varie cose|in generale|più o meno|molto|parecchio|diverse attività)\\b/gi,
          label: "Formula generica"
        }
      ];

      const ranges = [];

      patterns.forEach(function (pattern) {
        const regex = new RegExp(pattern.regex.source, pattern.regex.flags);
        let match;
        while ((match = regex.exec(raw)) !== null) {
          ranges.push({
            start: match.index,
            end: match.index + match[0].length,
            type: pattern.type,
            label: pattern.label
          });
        }
      });

      ranges.sort(function (a, b) {
        if (a.start !== b.start) return a.start - b.start;
        return (b.end - b.start) - (a.end - a.start);
      });

      const filtered = [];
      let lastEnd = -1;

      ranges.forEach(function (range) {
        if (range.start < lastEnd) return;
        filtered.push(range);
        lastEnd = range.end;
      });

      if (!filtered.length) {
        return '<div class="annotated-text">' + htmlEscape(raw) + '</div>';
      }

      let html = "";
      let cursor = 0;

      filtered.forEach(function (item) {
        if (cursor < item.start) {
          html += htmlEscape(raw.slice(cursor, item.start));
        }

        const chunk = htmlEscape(raw.slice(item.start, item.end));
        const cls =
          item.type === "strength"
            ? "hl-strength"
            : item.type === "evidence"
              ? "hl-evidence"
              : "hl-weakness";

        html += '<span class="' + cls + '" title="' + htmlEscape(item.label) + '">' + chunk + '</span>';
        cursor = item.end;
      });

      if (cursor < raw.length) {
        html += htmlEscape(raw.slice(cursor));
      }

      return '<div class="annotated-text">' + html + '</div>';
    }

    function renderAnnotatedTextFromLlm(textValue, annotations) {
      const raw = String(textValue || "");
      const items = ensureArray(annotations)
        .map(function (item) {
          return {
            type: item?.type || "",
            start: Number.isFinite(item?.start) ? item.start : -1,
            end: Number.isFinite(item?.end) ? item.end : -1,
            label: item?.label || ""
          };
        })
        .filter(function (item) {
          return item.start >= 0 && item.end > item.start && item.end <= raw.length;
        })
        .sort(function (a, b) {
          if (a.start !== b.start) return a.start - b.start;
          return (b.end - b.start) - (a.end - a.start);
        });

      if (!items.length) {
        return '<div class="annotated-text">' + htmlEscape(raw) + '</div>';
      }

      const filtered = [];
      let lastEnd = -1;

      items.forEach(function (item) {
        if (item.start < lastEnd) return;
        filtered.push(item);
        lastEnd = item.end;
      });

      let html = "";
      let cursor = 0;

      filtered.forEach(function (item) {
        if (cursor < item.start) {
          html += htmlEscape(raw.slice(cursor, item.start));
        }

        const chunk = htmlEscape(raw.slice(item.start, item.end));
        const cls =
          item.type === "strength"
            ? "hl-strength"
            : item.type === "evidence"
              ? "hl-evidence"
              : "hl-weakness";

        html += '<span class="' + cls + '" title="' + htmlEscape(item.label) + '">' + chunk + '</span>';
        cursor = item.end;
      });

      if (cursor < raw.length) {
        html += htmlEscape(raw.slice(cursor));
      }

      return '<div class="annotated-text">' + html + '</div>';
    }

    function renderHero(report) {
      setText("heroFitPill", getFitLabel());
      setText("heroSummaryText", report?.narrative || "Sintesi non disponibile.");

      setHtml(
        "heroStrengths",
        bulletList(
          ensureArray(report?.recurringStrengths).slice(0, 3),
          "Nessun punto forte principale disponibile"
        )
      );

      setHtml(
        "heroWeaknesses",
        bulletList(
          ensureArray(report?.recurringWeaknesses).slice(0, 3),
          "Nessuna area di miglioramento principale disponibile"
        )
      );

      setHtml(
        "heroAdvice",
        bulletList(
          ensureArray(report?.finalAdvice).slice(0, 2),
          "Nessun consiglio operativo disponibile"
        )
      );
    }

    function renderPerformanceSnapshot(report) {
      const metrics = extractSnapshotMetrics(report);

      const html = metrics.map(function (item) {
        const safeScore = Math.max(0, Math.min(100, Number(item.score) || 0));
        const cls = bandClassFromScore(safeScore);
        const labelText = safeScore >= 70 ? "Buono" : safeScore >= 50 ? "Intermedio" : "Da rafforzare";

        return (
          '<div class="snapshot-row">' +
            '<div class="snapshot-head">' +
              '<div class="snapshot-label-wrap">' +
                '<div class="snapshot-label">' + htmlEscape(item.label) + '</div>' +
                '<span class="metric-help" tabindex="0">?' +
                  '<span class="tooltip">' + htmlEscape(item.help) + '</span>' +
                '</span>' +
              '</div>' +
              '<div class="snapshot-score ' + cls + '">' + htmlEscape(labelText + " · " + safeScore + "/100") + '</div>' +
            '</div>' +
            '<div class="bar-track">' +
              '<div class="bar-fill ' + cls + '" style="width:' + safeScore + '%;"></div>' +
            '</div>' +
          '</div>'
        );
      }).join("");

      setHtml("performanceSnapshot", html || '<div class="empty-state">Snapshot non disponibile.</div>');
    }

    function renderInterviewMap(answers) {
      if (!answers.length) {
        setHtml("interviewMap", '<div class="empty-state">Nessuna risposta disponibile nel payload corrente.</div>');
        return;
      }

      const html = answers.map(function (answer, index) {
        const info = getAnswerBandInfo(answer);
        const llm = answer?.answerAnnotation || null;
        const heuristic = answer?.answerAnalysis?.answerShapeAnalysis || null;

        const title = answer?.label || ("Domanda " + (index + 1));
        const prompt = answer?.promptText || llm?.questionPrompt || "Prompt non disponibile.";
        const answerText = answer?.answerText || "Risposta non disponibile.";
        const quickStrength = llm
          ? (llm?.summary?.topStrength || "Nessun segnale positivo esplicito")
          : (ensureArray(heuristic?.strengths)[0] || "Nessun segnale positivo esplicito");
        const quickFocus = llm
          ? (llm?.summary?.topImprovementArea || llm?.coachTip?.message || "Nessun focus utile disponibile")
          : (ensureArray(heuristic?.improvementHints)[0] || "Nessun focus utile disponibile");

        const strengths = llm
          ? ensureArray(llm?.strengths).map(function (item) {
              return item?.title && item?.explanation
                ? item.title + " — " + item.explanation
                : item?.title || item?.explanation || "";
            }).filter(Boolean)
          : ensureArray(heuristic?.strengths);

        const weaknesses = llm
          ? ensureArray(llm?.weaknesses).map(function (item) {
              return item?.title && item?.explanation
                ? item.title + " — " + item.explanation
                : item?.title || item?.explanation || "";
            }).filter(Boolean)
          : ensureArray(heuristic?.weaknesses);

        const coachTip = llm
          ? (
              llm?.coachTip?.title && llm?.coachTip?.message
                ? llm.coachTip.title + " — " + llm.coachTip.message
                : llm?.coachTip?.message || llm?.coachTip?.title || "Nessun suggerimento disponibile."
            )
          : (
              ensureArray(heuristic?.improvementHints)[0] ||
              "Nessun suggerimento disponibile."
            );

        const improvedDraft =
          llm?.improvedAnswerDraft?.isProvided && llm?.improvedAnswerDraft?.text
            ? llm.improvedAnswerDraft.text
            : "";

        const annotatedTextHtml = llm
          ? renderAnnotatedTextFromLlm(answerText, llm?.annotations)
          : renderAnnotatedTextFallback(answerText);

        return (
          '<details class="map-item">' +
            '<summary>' +
              '<div class="map-left">' +
                '<div class="map-index">Q' + (index + 1) + '</div>' +
                '<div class="map-title-wrap">' +
                  '<div class="map-title-row">' +
                    '<div class="map-title">' + htmlEscape(title) + '</div>' +
                    '<span class="mini-pill neutral">Step ' + (index + 1) + '</span>' +
                  '</div>' +
                  '<div class="map-subtitle">' + htmlEscape(prompt) + '</div>' +
                '</div>' +
              '</div>' +
              '<div class="map-right">' +
                '<div class="status-pill ' + bandClassFromBand(info.band) + '">' + htmlEscape(humanizeAnswerBand(info.band)) + '</div>' +
                '<div class="open-hint">Apri / chiudi dettaglio</div>' +
              '</div>' +
            '</summary>' +

            '<div class="map-content">' +
              '<div class="content-box">' +
                '<h4>Risposta</h4>' +
                '<p>' + htmlEscape(answerText) + '</p>' +
              '</div>' +

              '<div class="content-box soft">' +
                '<h4>Feedback rapido</h4>' +
                '<p><strong>Punto forte:</strong> ' + htmlEscape(quickStrength) + '</p>' +
                '<p style="margin-top:8px;"><strong>Focus utile:</strong> ' + htmlEscape(quickFocus) + '</p>' +
              '</div>' +

              '<details class="trainer-box">' +
                '<summary>' +
                  '<span>Apri Trainer Review</span>' +
                  '<span class="source-pill fit-pill">' + htmlEscape(info.source) + '</span>' +
                '</summary>' +

                '<div class="trainer-content">' +
                  '<div>' +
                    '<div class="trainer-section-title">Testo annotato</div>' +
                    '<div class="legend-row">' +
                      '<span class="mini-pill good">Punto forte</span>' +
                      '<span class="mini-pill fit-pill">Evidenza / risultato</span>' +
                      '<span class="mini-pill bad">Parte da rinforzare</span>' +
                    '</div>' +
                    '<div style="margin-top:12px;">' + annotatedTextHtml + '</div>' +
                  '</div>' +

                  '<div class="trainer-columns">' +
                    '<div class="trainer-column positive">' +
                      '<div class="trainer-column-title">Punti forti</div>' +
                      bulletList(strengths, "Nessun punto forte esplicito") +
                    '</div>' +
                    '<div class="trainer-column negative">' +
                      '<div class="trainer-column-title">Criticità</div>' +
                      bulletList(weaknesses, "Nessuna criticità esplicita") +
                    '</div>' +
                  '</div>' +

                  '<div class="callout-box coach">' +
                    '<div class="callout-title">Coach tip</div>' +
                    '<p>' + htmlEscape(coachTip) + '</p>' +
                  '</div>' +

                  (improvedDraft
                    ? '<div class="callout-box draft"><div class="callout-title">Bozza migliorata</div><div class="draft-box">' + htmlEscape(improvedDraft) + '</div></div>'
                    : '') +
                '</div>' +
              '</details>' +
            '</div>' +
          '</details>'
        );
      }).join("");

      setHtml("interviewMap", html);
    }

    function renderTrainerOverview(answers) {
      const llmCount = answers.filter(function (answer) {
        return !!answer?.answerAnnotation;
      }).length;

      const total = answers.length;
      const fallback = Math.max(0, total - llmCount);

      setText("trainerOverviewMeta", llmCount + "/" + total + " con review LLM");
      setText("trainerStatAnswers", String(total));
      setText("trainerStatLlm", String(llmCount));
      setText("trainerStatFallback", String(fallback));
    }

    function renderDebug(report, answers) {
      const snapshot = {
        rootKeys: Object.keys(root || {}),
        answers: answers.length,
        hasInterviewReport: !!root?.interviewReport?.interviewReport,
        fitLabel: getFitLabel(),
        overallBand: report?.overallBand || null,
        overallScore: report?.overallScore || null
      };

      setText("debugJson", JSON.stringify(snapshot, null, 2));
    }

    function renderAll() {
      const answers = getEmbeddedAnswers();
      const report = getFinalReport();

      renderHero(report);
      renderPerformanceSnapshot(report);
      renderInterviewMap(answers);
      renderTrainerOverview(answers);
      renderDebug(report, answers);
    }

    renderAll();
  </script>
</body>
</html>`;

  return html;
}

export default renderInteractiveInterviewShellHtml;