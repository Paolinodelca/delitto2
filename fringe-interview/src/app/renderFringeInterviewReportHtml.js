function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function ensureArray(value) {
  return Array.isArray(value) ? value : [];
}

function renderList(items, emptyLabel = "—") {
  const values = ensureArray(items).filter(Boolean);

  if (values.length === 0) {
    return `<p class="muted">${escapeHtml(emptyLabel)}</p>`;
  }

  return `
    <ul>
      ${values.map((item) => `<li>${escapeHtml(item)}</li>`).join("\n")}
    </ul>
  `;
}

function renderMetricGrid(metrics = {}) {
  const entries = Object.entries(metrics);

  if (entries.length === 0) {
    return `<p class="muted">—</p>`;
  }

  return `
    <div class="metric-grid">
      ${entries
        .map(
          ([label, value]) => `
            <div class="metric-card">
              <div class="metric-label">${escapeHtml(label)}</div>
              <div class="metric-value">${escapeHtml(value ?? "—")}</div>
            </div>
          `
        )
        .join("\n")}
    </div>
  `;
}

function renderDimensionTable(dimensionAverages = {}) {
  const labelMap = {
    concreteness: "Concretezza",
    specificity: "Specificità",
    evidence: "Evidenza",
    ownership: "Ownership",
    structure: "Struttura",
    clarity: "Chiarezza",
    reflection: "Riflessione"
  };

  const entries = Object.entries(dimensionAverages);

  if (entries.length === 0) {
    return `<p class="muted">—</p>`;
  }

  return `
    <table>
      <thead>
        <tr>
          <th>Dimensione</th>
          <th>Score</th>
        </tr>
      </thead>
      <tbody>
        ${entries
          .map(
            ([key, value]) => `
              <tr>
                <td>${escapeHtml(labelMap[key] || key)}</td>
                <td>${escapeHtml(value)}</td>
              </tr>
            `
          )
          .join("\n")}
      </tbody>
    </table>
  `;
}

function renderSection(title, body, extraClass = "") {
  return `
    <section class="card ${extraClass}">
      <h2>${escapeHtml(title)}</h2>
      ${body}
    </section>
  `;
}

function renderPills(items) {
  const values = ensureArray(items).filter(Boolean);

  if (values.length === 0) {
    return `<p class="muted">—</p>`;
  }

  return `
    <div class="pill-row">
      ${values.map((item) => `<span class="pill">${escapeHtml(item)}</span>`).join("\n")}
    </div>
  `;
}

function humanizeRecommendationBand(value) {
  const map = {
    strong_fit: "Aderenza forte",
    solid_fit: "Buona aderenza",
    plausible_fit: "Aderenza plausibile",
    stretch_fit: "Aderenza con gap rilevanti",
    weak_fit: "Aderenza debole"
  };

  return map[value] || value || "—";
}

function humanizeAnswerBand(value) {
  const map = {
    strong: "Forte",
    medium: "Media",
    weak: "Debole"
  };

  return map[value] || value || "—";
}

function humanizeInterviewStyle(value) {
  const map = {
    validate_strengths: "Valorizza i punti forti",
    validate_then_probe: "Valida e poi approfondisce",
    balanced: "Bilanciato",
    probe_risk_first: "Indaga prima i rischi"
  };

  return map[value] || value || "—";
}

function humanizeStepType(value) {
  const map = {
    opening: "Apertura",
    core_question: "Domanda principale",
    followup_pack: "Pacchetto follow-up",
    adaptive_followup_pack: "Follow-up adattivo",
    closing: "Chiusura"
  };

  return map[value] || value || "—";
}

function humanizeFamilyKey(value) {
  const map = {
    general_fit: "Aderenza generale",
    ownership_scope: "Ownership e responsabilità",
    stakeholder_management: "Gestione degli stakeholder",
    transferability: "Trasferibilità",
    analytical_depth: "Profondità analitica",
    seniority_calibration: "Calibrazione seniority",
    communication_clarity: "Chiarezza comunicativa",
    leadership_scope: "Ampiezza della leadership"
  };

  return map[value] || value || "—";
}

function humanizeTriggerType(value) {
  const map = {
    leadership_depth: "Approfondimento leadership",
    responsibility_probe: "Verifica della responsabilità",
    tool_adaptation: "Adattamento agli strumenti",
    achievement_quantification: "Quantificazione dei risultati",
    stakeholder_examples: "Esempi sugli stakeholder",
    transferability_probe: "Verifica della trasferibilità"
  };

  return map[value] || value || "—";
}

function humanizePriority(value) {
  const map = {
    high: "alta",
    medium: "media",
    low: "bassa"
  };

  return map[value] || value || "—";
}

function humanizeBoolean(value) {
  if (value === true) return "Sì";
  if (value === false) return "No";
  return "—";
}

function buildHeroHighlights(report) {
  const overall = report?.overall || {};
  const roleFit = report?.roleFit || {};
  const answerQuality = report?.answerQuality || {};

  return {
    targetRole: overall?.roleTitle || "—",
    recommendationBand: humanizeRecommendationBand(roleFit?.recommendationBand),
    fitScore: overall?.metrics?.["Score di aderenza"] ?? "—",
    answerScore: overall?.metrics?.["Score qualità risposte"] ?? "—",
    answerBand: humanizeAnswerBand(answerQuality?.overallBand)
  };
}

function buildSelectedFamilies(questionSet) {
  return ensureArray(questionSet?.selectedQuestionFamilies).map((item) => {
    const family = humanizeFamilyKey(item?.familyKey);
    const priority = humanizePriority(item?.priority);
    return `${family} [priorità ${priority}]`;
  });
}

function buildSelectedFollowups(questionSet) {
  return ensureArray(questionSet?.selectedFollowupPacks).map((item) => {
    if (item?.label) {
      return item.label;
    }

    return humanizeTriggerType(item?.triggerType);
  });
}

export function renderFringeInterviewReportHtml({ sessionResult }) {
  if (!sessionResult || typeof sessionResult !== "object") {
    throw new Error("renderFringeInterviewReportHtml: sessionResult is required.");
  }

  const mvp = sessionResult?.fringeInterviewMVPSession || {};
  const report = mvp?.finalCandidateReport || {};
  const runtime = mvp?.interviewRuntime || {};
  const session = mvp?.interviewSession || {};
  const questionSet = mvp?.interviewQuestionSet || {};
  const meta = mvp?.meta || {};

  const overall = report?.overall || {};
  const roleFit = report?.roleFit || {};
  const answerQuality = report?.answerQuality || {};
  const strengths = report?.strengths || {};
  const risks = report?.risks || {};
  const improvements = report?.improvements || {};
  const cvAdvice = report?.cvAdvice || {};
  const finalTakeaway = report?.finalTakeaway || {};

  const selectedFamilies = buildSelectedFamilies(questionSet);
  const selectedFollowups = buildSelectedFollowups(questionSet);
  const hero = buildHeroHighlights(report);

  const html = `
<!doctype html>
<html lang="it">
<head>
  <meta charset="utf-8" />
  <title>FRINGE Interview MVP Report</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>
    body {
      font-family: Arial, Helvetica, sans-serif;
      background: #f5f7fb;
      color: #1f2937;
      margin: 0;
      padding: 24px;
      line-height: 1.5;
    }
    .page {
      max-width: 1100px;
      margin: 0 auto;
    }
    h1 {
      margin: 0 0 8px 0;
      font-size: 30px;
    }
    .subtitle {
      color: #4b5563;
      margin-bottom: 24px;
    }
    .card {
      background: white;
      border-radius: 14px;
      padding: 20px;
      margin-bottom: 18px;
      box-shadow: 0 4px 14px rgba(0,0,0,0.06);
    }
    .hero {
      padding: 24px;
    }
    h2 {
      margin-top: 0;
      font-size: 22px;
    }
    h3 {
      margin-bottom: 8px;
      font-size: 18px;
    }
    p {
      margin-top: 8px;
      margin-bottom: 8px;
    }
    .metric-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 12px;
      margin-top: 12px;
    }
    .metric-card {
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 10px;
      padding: 12px;
    }
    .metric-label {
      font-size: 12px;
      color: #6b7280;
      margin-bottom: 6px;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    .metric-value {
      font-size: 20px;
      font-weight: bold;
    }
    .grid-2 {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 18px;
    }
    .grid-3 {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 18px;
    }
    ul {
      padding-left: 20px;
      margin-top: 8px;
    }
    .muted {
      color: #6b7280;
    }
    .takeaway {
      font-size: 18px;
      font-weight: 600;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 10px;
    }
    th, td {
      text-align: left;
      padding: 10px;
      border-bottom: 1px solid #e5e7eb;
    }
    .small {
      font-size: 14px;
      color: #4b5563;
    }
    .pill-row {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 8px;
    }
    .pill {
      background: #eef2ff;
      color: #3730a3;
      border-radius: 999px;
      padding: 6px 10px;
      font-size: 13px;
    }
    details {
      background: white;
      border-radius: 14px;
      padding: 0;
      margin-bottom: 18px;
      box-shadow: 0 4px 14px rgba(0,0,0,0.06);
      overflow: hidden;
    }
    details summary {
      cursor: pointer;
      padding: 18px 20px;
      font-weight: bold;
      list-style: none;
      background: white;
    }
    details summary::-webkit-details-marker {
      display: none;
    }
    .details-body {
      padding: 0 20px 20px 20px;
    }
    .status-ok {
      color: #065f46;
      font-weight: bold;
    }
    .status-mid {
      color: #92400e;
      font-weight: bold;
    }
    .status-weak {
      color: #991b1b;
      font-weight: bold;
    }
  </style>
</head>
<body>
  <div class="page">
    <h1>FRINGE Interview MVP</h1>
    <div class="subtitle">
      Report finale candidato · Locale: ${escapeHtml(report?.locale || "it")}
    </div>

    ${renderSection(
      "Sintesi generale",
      `
        <p><strong>Candidato:</strong> ${escapeHtml(overall?.candidateSummary || "—")}</p>
        <p><strong>Ruolo target:</strong> ${escapeHtml(hero.targetRole)}</p>
        <p><strong>Messaggio chiave:</strong> ${escapeHtml(finalTakeaway?.message || "—")}</p>
        <p><strong>Razionale sintetico:</strong> ${escapeHtml(overall?.shortRationale || "—")}</p>
      `,
      "hero"
    )}

    ${renderSection(
      "Indicatori principali",
      renderMetricGrid({
        "Valutazione complessiva": hero.recommendationBand,
        "Score di aderenza": hero.fitScore,
        "Score qualità risposte": hero.answerScore,
        "Fascia qualità risposte": hero.answerBand
      })
    )}

    <div class="grid-3">
      ${renderSection(
        "Punti forti principali",
        renderList(
          ensureArray(strengths?.combinedHighlights).slice(0, 4)
        )
      )}

      ${renderSection(
        "Aree da migliorare",
        renderList(
          ensureArray(improvements?.finalAdvice).slice(0, 4)
        )
      )}

      ${renderSection(
        "Stato sessione",
        `
          <p><strong>Risposte fornite:</strong> ${escapeHtml(meta?.answersProvided ?? "—")}</p>
          <p><strong>Risposte registrate:</strong> ${escapeHtml(meta?.answersRecorded ?? "—")}</p>
          <p><strong>Sessione completata:</strong> <span class="${
            meta?.sessionCompleted ? "status-ok" : "status-mid"
          }">${escapeHtml(humanizeBoolean(meta?.sessionCompleted))}</span></p>
          <p><strong>Step corrente runtime:</strong> ${escapeHtml(humanizeStepType(runtime?.currentStep?.stepType))}</p>
          <p><strong>Stile intervista:</strong> ${escapeHtml(humanizeInterviewStyle(session?.summary?.interviewStyle))}</p>
        `
      )}
    </div>

    ${renderSection(
      "Messaggio finale",
      `<p class="takeaway">${escapeHtml(finalTakeaway?.message || "—")}</p>`
    )}

    <details open>
      <summary>Approfondimento — Aderenza al ruolo</summary>
      <div class="details-body">
        <div class="grid-2">
          ${renderSection(
            "Fit col ruolo",
            `
              <p><strong>Valutazione complessiva:</strong> ${escapeHtml(humanizeRecommendationBand(roleFit?.recommendationBand))}</p>
              <p><strong>Affidabilità della valutazione:</strong> ${escapeHtml(humanizeAnswerBand(roleFit?.confidence))}</p>
              <h3>Punti forti sul ruolo</h3>
              ${renderList(roleFit?.strengths)}
              <h3>Competenze trasferibili</h3>
              ${renderList(roleFit?.transferableStrengths)}
            `
          )}

          ${renderSection(
            "Rischi e chiarimenti",
            `
              <h3>Rischi</h3>
              ${renderList(roleFit?.risks)}
              <h3>Chiarimenti necessari</h3>
              ${renderList(roleFit?.clarificationsNeeded)}
              <h3>Competenze mancanti</h3>
              ${renderList(roleFit?.missingSkills)}
            `
          )}
        </div>
      </div>
    </details>

    <details>
      <summary>Approfondimento — Qualità delle risposte</summary>
      <div class="details-body">
        <div class="grid-2">
          ${renderSection(
            "Sintesi qualità risposta",
            `
              <p><strong>Fascia qualità:</strong> ${escapeHtml(humanizeAnswerBand(answerQuality?.overallBand))}</p>
              <p><strong>Score qualità:</strong> ${escapeHtml(answerQuality?.overallScore ?? "—")}</p>
              <p><strong>Numero risposte:</strong> ${escapeHtml(answerQuality?.totalAnswers ?? "—")}</p>
              <h3>Punti forti ricorrenti</h3>
              ${renderList(answerQuality?.recurringStrengths)}
              <h3>Debolezze ricorrenti</h3>
              ${renderList(answerQuality?.recurringWeaknesses)}
            `
          )}

          ${renderSection(
            "Dettaglio dimensioni",
            renderDimensionTable(answerQuality?.dimensionAverages || {})
          )}
        </div>
      </div>
    </details>

    <details>
      <summary>Approfondimento — Miglioramenti e CV</summary>
      <div class="details-body">
        <div class="grid-2">
          ${renderSection(
            "Suggerimenti di miglioramento",
            `
              <h3>Consigli finali</h3>
              ${renderList(improvements?.finalAdvice)}
              <h3>Suggerimenti ricorrenti</h3>
              ${renderList(improvements?.recurringImprovementHints)}
            `
          )}

          ${renderSection(
            "Suggerimenti per il CV",
            `
              <h3>Indicazioni CV</h3>
              ${renderList(cvAdvice?.cvImprovementHints)}
              <h3>Indicazioni di posizionamento</h3>
              ${renderList(cvAdvice?.positioningHints)}
            `
          )}
        </div>
      </div>
    </details>

    <details>
      <summary>Approfondimento — Sessione e piano intervista</summary>
      <div class="details-body">
        ${renderSection(
          "Famiglie domanda selezionate",
          renderPills(selectedFamilies)
        )}

        ${renderSection(
          "Follow-up pack selezionati",
          renderPills(selectedFollowups)
        )}

        ${renderSection(
          "Sintesi narrativa della sessione",
          `<p>${escapeHtml(overall?.narrativeSummary || "—")}</p>`
        )}
      </div>
    </details>
  </div>
</body>
</html>
  `;

  return html.trim();
}