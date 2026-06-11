function ensureArray(value) {
  return Array.isArray(value) ? value : [];
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

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function humanizeRecommendationBand(value) {
  const map = {
    strong_fit: "Aderenza forte",
    solid_fit: "Buona aderenza",
    plausible_fit: "Aderenza plausibile",
    stretch_fit: "Aderenza con gap rilevanti",
    borderline_fit: "Aderenza borderline",
    partial_fit: "Aderenza parziale",
    weak_fit: "Aderenza debole",
    low_fit: "Aderenza molto debole"
  };

  return map[value] || value || "—";
}

function humanizeAnswerBand(value) {
  const map = {
    strong: "Forte",
    medium: "Da rafforzare",
    weak: "Debole"
  };

  return map[value] || value || "—";
}

function scoreStatus(score) {
  const numeric = Number(score);

  if (!Number.isFinite(numeric)) {
    return {
      label: "—",
      className: "status-neutral",
      dotClass: "dot-neutral",
      frameClass: "frame-neutral"
    };
  }

  if (numeric >= 75) {
    return {
      label: "Solido",
      className: "status-ok",
      dotClass: "dot-ok",
      frameClass: "frame-ok"
    };
  }

  if (numeric >= 50) {
    return {
      label: "Da rafforzare",
      className: "status-mid",
      dotClass: "dot-mid",
      frameClass: "frame-mid"
    };
  }

  return {
    label: "Debole",
    className: "status-weak",
    dotClass: "dot-weak",
    frameClass: "frame-weak"
  };
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

function renderSection(title, body, extraClass = "", subtitle = "") {
  return `
    <section class="card ${extraClass}">
      <h3>${escapeHtml(title)}</h3>
      ${subtitle ? `<p class="section-subtitle">${escapeHtml(subtitle)}</p>` : ""}
      ${body}
    </section>
  `;
}

function renderHeroMetricCard({ label, value, tone = "neutral" }) {
  return `
    <div class="hero-metric-card hero-metric-card-${escapeHtml(tone)}">
      <div class="hero-metric-label">${escapeHtml(label)}</div>
      <div class="hero-metric-value">${escapeHtml(value)}</div>
    </div>
  `;
}

function scoreToneFromLabel(value) {
  const lower = String(value || "").toLowerCase();

  if (
    lower.includes("forte") ||
    lower.includes("solido") ||
    lower.includes("buona") ||
    lower.includes("ok")
  ) {
    return "good";
  }

  if (
    lower.includes("plausibile") ||
    lower.includes("rafforzare") ||
    lower.includes("medio") ||
    lower.includes("parziale")
  ) {
    return "warm";
  }

  if (
    lower.includes("debole") ||
    lower.includes("borderline") ||
    lower.includes("gap") ||
    lower.includes("molto debole")
  ) {
    return "risk";
  }

  return "neutral";
}

function renderTopBlockingList(items) {
  const values = ensureArray(items).slice(0, 3);
  const labels = ["Apprendimento", "Responsabilità", "Impatto"];

  return `
    <div class="blocking-list">
      ${values
        .map(
          (item, index) => `
            <div class="blocking-item">
              <div class="blocking-index">${index + 1}</div>
              <div class="blocking-body">
                <div class="blocking-title">${labels[index] || `Focus ${index + 1}`}</div>
                <div class="blocking-text">${escapeHtml(item)}</div>
              </div>
            </div>
          `
        )
        .join("\n")}
    </div>
  `;
}

function renderAxisCard(axis) {
  const status = scoreStatus(axis?.score);

  return `
    <div class="score-summary-card ${status.frameClass}">
      <div class="score-summary-top">
        <span class="score-dot ${status.dotClass}"></span>
        <span class="score-summary-title">${escapeHtml(text(axis?.label, "Asse"))}</span>
      </div>
      <div class="score-summary-subtitle">Lettura sintetica dell’asse valutativo.</div>
      <div class="score-summary-main">${escapeHtml(`${axis?.score ?? "—"} / 100`)}</div>
      <div class="score-summary-status ${status.className}">
        ${escapeHtml(humanizeAnswerBand(axis?.band || ""))}
      </div>
    </div>
  `;
}

export function renderProReportSection({ proReportModel }) {
  if (!proReportModel || typeof proReportModel !== "object") {
    throw new Error("renderProReportSection: proReportModel is required.");
  }

  const summary = proReportModel?.summary || {};
  const fitAnalysis = proReportModel?.fitAnalysis || {};
  const answerSignals = proReportModel?.answerSignals || {};
  const recruiterRead = proReportModel?.recruiterRead || {};
  const coachRead = proReportModel?.coachRead || {};
  const priorities = proReportModel?.priorities || {};

  const fitBandLabel = humanizeRecommendationBand(summary?.fitBand);
  const answerBandLabel = humanizeAnswerBand(summary?.answerBand);
  const alignmentBandLabel = humanizeAnswerBand(summary?.alignmentBand);

  return `
    <div class="section-shell overview-shell">
      <div class="overview-stage-shell">

        <div class="hero-metrics-row">
          ${renderHeroMetricCard({
            label: "Ruolo target",
            value: text(summary?.targetRole),
            tone: "neutral"
          })}
          ${renderHeroMetricCard({
            label: "Aderenza al ruolo",
            value: fitBandLabel,
            tone: scoreToneFromLabel(fitBandLabel)
          })}
          ${renderHeroMetricCard({
            label: "Qualità risposte",
            value: answerBandLabel,
            tone: scoreToneFromLabel(answerBandLabel)
          })}
          ${renderHeroMetricCard({
            label: "Aderenza domanda",
            value: alignmentBandLabel,
            tone: scoreToneFromLabel(alignmentBandLabel)
          })}
        </div>

        <div class="overview-reading-block">
          <div class="overview-reading-title">Lettura PRO</div>
          <div class="overview-verdict-headline">
            ${escapeHtml(
              text(
                summary?.executiveHeadline,
                "Il profilo è leggibile, ma non ancora abbastanza forte nei punti che fanno davvero la differenza."
              )
            )}
          </div>
          <div class="overview-verdict-text">
            ${escapeHtml(
              text(
                summary?.executiveSubheadline || summary?.shortRationale,
                "Il sistema rileva segnali utili, ma non ancora abbastanza stabili per rendere il profilo pienamente convincente."
              )
            )}
          </div>
        </div>

        <div class="overview-errors-shell">
          <div class="overview-errors-title">Le 3 priorità che oggi pesano di più</div>
          <div class="overview-errors-subtitle">
            Questa è la sintesi PRO dei blocchi che oggi riducono maggiormente forza, credibilità e spendibilità del profilo.
          </div>
          ${renderTopBlockingList(priorities?.topBlockingIssues)}
        </div>

        <div class="grid-2 equal-grid">
          ${renderSection(
            "Fit reale al ruolo",
            `
              <p><strong>Valutazione:</strong> ${escapeHtml(fitBandLabel)}</p>
              <p><strong>Confidenza:</strong> ${escapeHtml(text(fitAnalysis?.confidence, "—"))}</p>
              <p><strong>Competenze coerenti:</strong></p>
              ${renderList(
                fitAnalysis?.matchedSkills,
                "Non emergono ancora skill abbastanza nette da usare come base forte di compatibilità."
              )}
              <p><strong>Competenze mancanti o deboli:</strong></p>
              ${renderList(
                fitAnalysis?.missingSkills,
                "Non emergono gap tecnici dichiarati come prioritari."
              )}
            `,
            "positive-card",
            "Qui il sistema prova a leggere se il profilo è davvero spendibile rispetto al ruolo, non solo se appare genericamente interessante."
          )}

          ${renderSection(
            "Rischi di lettura lato recruiter",
            `
              <p><strong>Rischio inserimento:</strong> ${escapeHtml(text(recruiterRead?.insertionRisk, "—"))}</p>
              <p><strong>Contesto ideale:</strong> ${escapeHtml(text(recruiterRead?.bestContext, "—"))}</p>
              <p><strong>Rischi percepiti:</strong></p>
              ${renderList(
                recruiterRead?.risks,
                "Non emergono ancora rischi sintetizzati in modo esplicito."
              )}
            `,
            "risk-card",
            "Questa non è ancora la sezione PREMIUM recruiter, ma è già una lettura più vicina a una logica di selezione."
          )}
        </div>

        <div class="section-shell" style="margin-top:18px;">
          <div class="section-shell-header">
            <div class="section-shell-title">Assi di lettura delle risposte</div>
            <div class="section-shell-subtitle">
              Qui il report PRO mostra i principali assi comportamentali già emersi dal motore.
            </div>
          </div>

          <div class="summary-score-grid">
            ${renderAxisCard(answerSignals?.behavioralAxes?.decision)}
            ${renderAxisCard(answerSignals?.behavioralAxes?.synthesis)}
            ${renderAxisCard(answerSignals?.behavioralAxes?.conflict)}
            ${renderAxisCard(answerSignals?.behavioralAxes?.positioning)}
          </div>
        </div>

        <div class="grid-2 equal-grid" style="margin-top:18px;">
          ${renderSection(
            "Che cosa sta funzionando",
            renderList(
              coachRead?.whatWorked,
              "Non emergono ancora punti forti abbastanza stabili da usare come leva principale."
            ),
            "positive-card",
            "Questi segnali aiutano il profilo e meritano di essere consolidati."
          )}

          ${renderSection(
            "Che cosa indebolisce ancora il profilo",
            renderList(
              coachRead?.whatToImprove,
              "Le aree di debolezza non sono ancora abbastanza definite."
            ),
            "warm-card",
            "Questi segnali non rendono il profilo necessariamente sbagliato, ma oggi ne riducono la credibilità."
          )}
        </div>

        <div class="grid-2 equal-grid" style="margin-top:18px;">
          ${renderSection(
            "Le prossime mosse più utili",
            renderList(
              priorities?.finalAdvice,
              "Serve rendere le risposte più chiare, più concrete e più attribuibili al candidato."
            ),
            "warm-card",
            "Questa è la parte più operativa del PRO: non solo che cosa non va, ma che cosa conviene correggere subito."
          )}

          ${renderSection(
            "Momenti di pressione osservati dal sistema",
            renderList(
              priorities?.pressureMoments,
              "Non emergono ancora momenti di pressione abbastanza chiari da sintetizzare."
            ),
            "risk-card",
            "Qui vedi i passaggi in cui il sistema ha insistito maggiormente o ha rilevato maggiore fragilità."
          )}
        </div>

      </div>
    </div>
  `.trim();
}

export default renderProReportSection;