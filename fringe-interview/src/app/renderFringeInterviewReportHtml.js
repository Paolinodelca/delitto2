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

function text(value, fallback = "—") {
  if (value === undefined || value === null) return fallback;
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed || fallback;
  }
  if (typeof value === "number") return String(value);
  return fallback;
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

function renderScoreSummaryCard({ title, score, subtitle }) {
  const status = scoreStatus(score);

  return `
    <div class="score-summary-card ${status.frameClass}">
      <div class="score-summary-top">
        <span class="score-dot ${status.dotClass}"></span>
        <span class="score-summary-title">${escapeHtml(title)}</span>
      </div>
      ${subtitle ? `<div class="score-summary-subtitle">${escapeHtml(subtitle)}</div>` : ""}
      <div class="score-summary-main">${escapeHtml(`${score ?? "—"} / 100`)}</div>
      <div class="score-summary-status ${status.className}">${escapeHtml(status.label)}</div>
    </div>
  `;
}

function renderSignalCard({ title, body, tone = "neutral" }) {
  return `
    <div class="signal-card signal-card-${escapeHtml(tone)}">
      <div class="signal-card-title">${escapeHtml(title)}</div>
      <div class="signal-card-text">${escapeHtml(body || "—")}</div>
    </div>
  `;
}

function renderMiniMetric({ label, value, tone = "neutral" }) {
  return `
    <div class="mini-metric mini-metric-${escapeHtml(tone)}">
      <div class="mini-metric-label">${escapeHtml(label)}</div>
      <div class="mini-metric-value">${escapeHtml(value)}</div>
    </div>
  `;
}

function buildHeroHighlights(report) {
  const overall = report?.overall || {};
  const roleFit = report?.roleFit || {};
  const answerQuality = report?.answerQuality || {};
  const questionQuality = report?.questionQuality || {};
  const executiveRead = report?.executiveRead || {};

  return {
    targetRole: overall?.roleTitle || "—",
    recommendationBand: humanizeRecommendationBand(roleFit?.recommendationBand),
    fitScore:
      overall?.metrics?.["Score di aderenza"] ??
      overall?.metrics?.["Compatibilità con il ruolo"] ??
      "—",
    answerScore:
      overall?.metrics?.["Score qualità risposte"] ??
      overall?.metrics?.["Qualità delle risposte"] ??
      "—",
    answerBand: humanizeAnswerBand(answerQuality?.overallBand),
    alignmentBand: humanizeAnswerBand(questionQuality?.alignment?.band),
    executiveHeadline: executiveRead?.headline || "",
    executiveSubheadline: executiveRead?.subheadline || ""
  };
}

function getCurrentPlan(meta) {
  const requested = meta?.requestedPlan || "";
  if (requested) return requested;
  return "free";
}

function summarizeStrengthsForOverview(roleStrengths = [], answerStrengths = []) {
  const roleItems = ensureArray(roleStrengths).filter(Boolean);
  const answerItems = ensureArray(answerStrengths).filter(Boolean);

  if (roleItems.length > 0) {
    return roleItems.slice(0, 4);
  }

  if (answerItems.length > 0) {
    return answerItems.slice(0, 4);
  }

  return [
    "Non si sono ancora evidenziati elementi forti e stabili da usare come leva principale nel posizionamento."
  ];
}

function normalizeGeneralWeaknessText(items) {
  return ensureArray(items)
    .map((item) => {
      const clean = text(item, "");
      if (!clean) return "";

      return clean
        .replace(/^La risposta /i, "Dalle risposte si osserva che ")
        .replace(/^La risposta resta /i, "Dalle risposte emerge che si resta ")
        .replace(/^La risposta non /i, "Dalle risposte emerge che non ")
        .replace(/^La risposta offre /i, "Dalle risposte emerge un livello limitato di ")
        .replace(/^La risposta sarebbe /i, "Dalle risposte emerge che sarebbe utile ")
        .replace(/^La risposta è /i, "Dalle risposte emerge un livello ")
        .trim();
    })
    .filter(Boolean);
}

function buildUpgradeMarketingCopy(planKey) {
  if (planKey === "pro") {
    return {
      title: "Con il piano PRO entri nella parte davvero utile per allenarti",
      text:
        "Qui trovi un aiuto guidato per migliorare le risposte: capisci meglio che effetto fanno, dove si indeboliscono e come renderle più convincenti già dal tentativo successivo.",
      bullets: [
        "lettura più precisa delle singole risposte",
        "indicazioni operative su cosa correggere",
        "migliore comprensione di come vieni percepito",
        "supporto più concreto per allenarti prima dei colloqui"
      ],
      button: "Passa a PRO"
    };
  }

  return {
    title: "Con il piano PREMIUM accedi al livello più vicino a un vero supporto di selezione",
    text:
      "Qui trovi un aiuto più operativo e più forte: guida per ottimizzare il CV rispetto a una posizione specifica, supporto per migliorare qualità e contenuti delle risposte, e una lettura più vicina a quella di un selezionatore esperto.",
    bullets: [
      "guida più mirata per ottimizzare il CV",
      "supporto operativo per migliorare le risposte",
      "lettura più avanzata del profilo rispetto al ruolo",
      "visione più vicina a una vera selezione"
    ],
    button: "Passa a PREMIUM"
  };
}

function buildAnswerTabs(answers) {
  return ensureArray(answers).map((answer, index) => ({
    key: `answer_${index + 1}`,
    label: `Risposta ${index + 1}`,
    stageLabel: text(answer?.label, "Passaggio"),
    index
  }));
}

function getQuestionTextForAnswer(answer, interviewSession, timelineEntry) {
  const stepType = text(answer?.stepType || timelineEntry?.stepType, "");
  const blockIndex = Number.isFinite(answer?.blockIndex)
    ? answer.blockIndex
    : Number.isFinite(timelineEntry?.blockIndex)
      ? timelineEntry.blockIndex
      : 0;

  if (stepType === "opening") {
    return text(
      interviewSession?.openingBlock?.openingPrompt ||
        interviewSession?.openingBlock?.openingScript,
      "Domanda non disponibile."
    );
  }

  if (stepType === "core_question") {
    return text(
      interviewSession?.coreQuestionBlocks?.[blockIndex]?.question,
      "Domanda non disponibile."
    );
  }

  if (stepType === "adaptive_followup_pack") {
    const followups = ensureArray(interviewSession?.followupBlocks?.[blockIndex]?.followups);
    return text(followups[0], "Domanda non disponibile.");
  }

  if (stepType === "closing") {
    return text(
      interviewSession?.closingBlock?.closingPrompt,
      "Domanda non disponibile."
    );
  }

  return "Domanda non disponibile.";
}

function buildQuestionIntentText(answer) {
  const expectedSignals = ensureArray(answer?.expectedSignals).filter(Boolean);
  const narrativeRole = text(answer?.narrativeRole, "");
  const questionKey = text(answer?.questionKey, "");

  if (expectedSignals.length > 0) {
    return `Il sistema cercava soprattutto segnali di ${expectedSignals.slice(0, 3).join(", ")}.`;
  }

  if (narrativeRole && narrativeRole !== "—") {
    return `Questa domanda serviva a leggere meglio il passaggio di tipo ${narrativeRole}.`;
  }

  if (questionKey && questionKey !== "—") {
    return `Questa domanda serviva a mettere a fuoco il segnale ${questionKey}.`;
  }

  return "Questa domanda serviva a raccogliere elementi più chiari e verificabili sul profilo.";
}

function extractQuickReading(answer, index) {
  const analysis = answer?.answerAnalysis?.answerShapeAnalysis || {};
  const weaknesses = ensureArray(analysis?.weaknesses);
  const strengths = ensureArray(analysis?.strengths);
  const hints = ensureArray(analysis?.improvementHints);
  const score = Number(analysis?.overallScore ?? 0);
  const answerText = text(answer?.answerText, "");

  const wordCount = answerText.split(/\s+/).filter(Boolean).length;
  const isVeryShort = wordCount < 16;
  const hasNumbers = /\b\d+\b/.test(answerText);
  const hasFirstPerson = /\b(io|ho|mia|mio|mie|miei|mio ruolo|mi sono|ho deciso|ho fatto)\b/i.test(answerText);
  const hasConcreteMarkers = /\b(caso|progetto|situazione|cliente|stakeholder|team|risultato|metriche|dashboard|analisi|processo|decisione)\b/i.test(answerText);

  let usefulSignal = "";
  let strengthen = "";

  if (index === 0 && isVeryShort) {
    usefulSignal =
      "Questa apertura introduce la disponibilità a raccontarsi, ma non porta ancora elementi sufficienti per sostenere davvero il profilo.";
    strengthen =
      "Nell’apertura conviene dire subito in 2–3 frasi quali esperienze ti rendono credibile per il ruolo, invece di restare solo su una disponibilità generica.";
    return { usefulSignal, strengthen };
  }

  if (!hasConcreteMarkers && score < 45) {
    usefulSignal =
      "La risposta resta ancora troppo generale e non aiuta a capire bene situazione, azione e valore portato.";
    strengthen =
      "Conviene agganciare la risposta a un episodio preciso: contesto, cosa hai fatto tu, risultato ottenuto.";
    return { usefulSignal, strengthen };
  }

  if (hasConcreteMarkers && !hasNumbers && !hasFirstPerson) {
    usefulSignal =
      "La risposta porta almeno un contesto abbastanza concreto, ma lascia ancora poco visibile il tuo contributo personale.";
    strengthen =
      "Rendi più esplicito che cosa dipendeva da te e, se possibile, chiudi con un risultato concreto o un effetto visibile.";
    return { usefulSignal, strengthen };
    }

  if (hasConcreteMarkers && hasFirstPerson && !hasNumbers) {
    usefulSignal =
      "La risposta inizia a mostrare esperienza reale e una discreta presenza personale nel racconto.";
    strengthen =
      "Per renderla più forte manca soprattutto un risultato misurabile o comunque un effetto finale più chiaro.";
    return { usefulSignal, strengthen };
  }

  usefulSignal =
    strengths[0] ||
    analysis?.summary ||
    weaknesses[0] ||
    "La risposta offre alcuni elementi utili, ma non ancora abbastanza forti da sostenere da sola il posizionamento.";

  strengthen =
    hints[0] ||
    "Serve una risposta più concreta, più centrata e più facile da attribuire al tuo contributo personale.";

  return { usefulSignal, strengthen };
}

function buildFollowupReason(answer, questionText) {
  const analysis = answer?.answerAnalysis?.answerShapeAnalysis || {};
  const weaknesses = ensureArray(analysis?.weaknesses);
  const improvementHints = ensureArray(analysis?.improvementHints);
  const alignmentScore = analysis?.questionAlignment?.score ?? analysis?.questionAlignment ?? null;
  const offTopicRisk = text(analysis?.offTopicRisk, "").toLowerCase();
  const isFollowup =
    answer?.stepType === "adaptive_followup_pack" ||
    /contributo|esempio|più concreto|spiegami meglio|direttamente/i.test(questionText || "");

  if (isFollowup && weaknesses.length > 0) {
    return `Il sistema ha insistito perché nella risposta precedente non era ancora abbastanza chiaro questo punto: ${weaknesses[0]}`;
  }

  if (offTopicRisk === "high") {
    return "Qui il sistema avrebbe motivo di insistere perché la risposta rischia di allargarsi troppo rispetto alla domanda.";
  }

  if (typeof alignmentScore === "number" && alignmentScore < 45) {
    return "Qui il sistema avrebbe motivo di insistere perché la risposta resta poco aderente al punto che stava cercando di verificare.";
  }

  if (improvementHints.length > 0) {
    return `Il punto da forzare di più sarebbe questo: ${improvementHints[0]}`;
  }

  return "Qui il sistema cerca soprattutto conferme più chiare, concrete e attribuibili direttamente al candidato.";
}

function renderLockedSection({
  title,
  subtitle = "",
  preview = "",
  ctaTitle = "Sblocca questa sezione",
  ctaText = "Passa a un piano superiore per vedere questa analisi completa.",
  planLabel = "PRO",
  upgradeLabel = "Passa a PRO"
}) {
  return `
    <section class="card locked-card">
      <h3>${escapeHtml(title)}</h3>
      ${subtitle ? `<p class="section-subtitle">${escapeHtml(subtitle)}</p>` : ""}
      <div class="locked-preview">
        <div class="locked-overlay-copy">
          <div class="locked-overlay-pill">${escapeHtml(planLabel)}</div>
          <div class="locked-overlay-title">${escapeHtml(ctaTitle)}</div>
          <div class="locked-overlay-text">${escapeHtml(ctaText)}</div>
          <button class="upgrade-button">${escapeHtml(upgradeLabel)}</button>
        </div>
        <div class="locked-blur">
          ${preview || `<p class="muted">Contenuto premium disponibile.</p>`}
        </div>
      </div>
    </section>
  `;
}

function renderTopNavigation(activeTab, currentPlan) {
  const tabs = [
    {
      key: "overview",
      label: "Sintesi",
      note: "lettura rapida del risultato",
      plan: "free",
      locked: false
    },
    {
      key: "answers",
      label: "Profilo e risposte",
      note: "come le risposte sostengono il profilo",
      plan: "free",
      locked: false
    },
    {
      key: "cv",
      label: "CV",
      note: "lettura iniziale del posizionamento",
      plan: "free",
      locked: false
    },
    {
      key: "training",
      label: "Training guidato",
      note: "coach mode e leve di miglioramento",
      plan: "pro",
      locked: currentPlan === "free"
    },
    {
      key: "selection",
      label: "Lettura selezione",
      note: "prospettiva recruiter e rischio inserimento",
      plan: "premium",
      locked: currentPlan !== "premium"
    }
  ];

  return `
    <section class="report-shell-header">
      <div class="report-shell-top">
        <div>
          <div class="report-shell-title">FRINGE INTERVIEW — REPORT DELLA SIMULAZIONE</div>
          <div class="report-shell-subtitle">
            Qui non vedi solo un punteggio: vedi quanto il profilo regge davvero sotto domanda, dove il sistema ha insistito e che impressione lascia oggi a livello candidato e selezione.
          </div>
        </div>
        <a class="switch-link" href="./fringe_interview_interactive_shell_setup.html">← Vai al setup</a>
      </div>

      <div class="single-line-nav single-line-nav-5">
        ${tabs
          .map((tab, index) => {
            const isActive = activeTab === tab.key;
            const chipLabel =
              tab.plan === "free" ? "FREE" : tab.plan === "pro" ? "PRO" : "PREMIUM";

            const tabClasses = [
              "top-tab",
              tab.plan === "free" ? "top-tab-free" : "top-tab-paid",
              isActive ? "is-active" : "",
              tab.locked ? "is-locked" : "is-unlocked"
            ]
              .filter(Boolean)
              .join(" ");

            const indexClass =
              tab.plan === "free"
                ? "top-tab-index-free"
                : tab.plan === "pro"
                  ? "top-tab-index-pro"
                  : "top-tab-index-premium";

            const chipClass =
              tab.plan === "free"
                ? "plan-chip-free"
                : tab.plan === "pro"
                  ? "plan-chip-pro"
                  : "plan-chip-premium";

            return `
              <button class="${tabClasses}" data-report-tab="${escapeHtml(tab.key)}" type="button">
                <span class="top-tab-index ${indexClass}">${index + 1}</span>
                <span class="plan-chip ${chipClass}">${chipLabel}</span>
                ${tab.plan !== "free" ? `<span class="top-tab-lock">${tab.locked ? "🔒" : "✓"}</span>` : ""}
                <span class="top-tab-main">
                  <span class="top-tab-label">${escapeHtml(tab.label)}</span>
                  <span class="top-tab-note">${escapeHtml(tab.note)}</span>
                </span>
              </button>
            `;
          })
          .join("\n")}
      </div>
    </section>
  `;
}

function renderFringeInterviewReportHtml({ sessionResult }) {
  if (!sessionResult || typeof sessionResult !== "object") {
    throw new Error("renderFringeInterviewReportHtml: sessionResult is required.");
  }

  const mvp = sessionResult?.fringeInterviewMVPSession || {};
  const report = mvp?.finalCandidateReport || {};
  const session = mvp?.interviewSession || {};
  const meta = mvp?.meta || {};
  const runtime = mvp?.interviewRuntime || {};
  const runtimeState = runtime?.runtimeState || {};
  const answers = ensureArray(runtimeState?.answers);
  const timeline = ensureArray(runtimeState?.timeline);

  const overall = report?.overall || {};
  const roleFit = report?.roleFit || {};
  const answerQuality = report?.answerQuality || {};
  const questionQuality = report?.questionQuality || {};
  const runtimeRead = report?.runtimeRead || {};
  const strengths = report?.strengths || {};
  const improvements = report?.improvements || {};
  const cvAdvice = report?.cvAdvice || {};
  const finalTakeaway = report?.finalTakeaway || {};
  const executiveRead = report?.executiveRead || {};
  const pressureMoments = report?.pressureMoments || {};
  const coachSnapshot = report?.coachSnapshot || {};
  const recruiterSnapshot = report?.recruiterSnapshot || {};

  const hero = buildHeroHighlights(report);
  const currentPlan = getCurrentPlan(meta);

  const overviewStrengths = summarizeStrengthsForOverview(
    roleFit?.strengths,
    strengths?.answerStrengths
  );

  const normalizedWeaknesses = normalizeGeneralWeaknessText(
    answerQuality?.recurringWeaknesses
  );

  const answerTabs = buildAnswerTabs(answers);

  const overviewHtml = `
    <div class="section-shell">
      <div class="section-shell-header">
        <div class="section-shell-title">Risultato della simulazione</div>
        <div class="section-shell-subtitle">
          Una lettura sintetica di come il profilo del CV e il modo di rispondere risultano oggi rispetto al ruolo scelto.
        </div>
      </div>

      <div class="hero-outcome-card">
        <div class="hero-outcome-label">Messaggio principale</div>
        <div class="hero-outcome-headline">${escapeHtml(executiveRead?.headline || finalTakeaway?.message || "Al momento non è disponibile un messaggio finale sintetico.")}</div>
        <div class="hero-outcome-subheadline">${escapeHtml(executiveRead?.subheadline || runtimeRead?.runtimeNarrative || "Il report sintetizza come il profilo si presenta oggi e quali aree meritano più attenzione.")}</div>

        <div class="hero-metrics-grid">
          ${renderMiniMetric({
            label: "Ruolo target",
            value: hero.targetRole,
            tone: "neutral"
          })}
          ${renderMiniMetric({
            label: "Aderenza al ruolo",
            value: hero.recommendationBand,
            tone: "good"
          })}
          ${renderMiniMetric({
            label: "Qualità delle risposte",
            value: hero.answerBand,
            tone: "warm"
          })}
          ${renderMiniMetric({
            label: "Aderenza alla domanda",
            value: hero.alignmentBand,
            tone: "neutral"
          })}
        </div>
      </div>

      <div class="summary-grid">
        <div class="summary-panel">
          <div class="summary-panel-title">Numeri di supporto</div>
          <div class="summary-score-grid">
            ${renderScoreSummaryCard({
              title: "Compatibilità con il ruolo",
              score: hero.fitScore,
              subtitle: "Quanto il profilo ricavato soprattutto da CV e job fit analysis appare coerente con la posizione scelta."
            })}
            ${renderScoreSummaryCard({
              title: "Qualità delle risposte",
              score: hero.answerScore,
              subtitle: "Quanto le risposte date in simulazione risultano convincenti, chiare e concrete."
            })}
          </div>
        </div>

        <div class="summary-panel summary-panel-main">
          <div class="summary-panel-title">Perché il sistema ha insistito</div>
          <div class="summary-main-text">${escapeHtml(executiveRead?.whySystemInsisted || "Il sistema ha insistito nei punti in cui ownership, concretezza o aderenza alla domanda non risultavano ancora abbastanza visibili.")}</div>
          <div class="summary-helper-text">
            ${escapeHtml(
              questionQuality?.alignment?.narrative ||
                runtimeRead?.runtimeNarrative ||
                "Il valore del sistema emerge soprattutto quando la prima risposta non basta e serve andare più a fondo."
            )}
          </div>
        </div>
      </div>

      <div class="signal-grid">
        ${renderSignalCard({
          title: "Che cosa sostiene oggi il profilo",
          body:
            executiveRead?.mainStrength ||
            overviewStrengths[0] ||
            "Non si sono ancora evidenziati elementi forti e stabili da usare come leva principale nel posizionamento.",
          tone: "good"
        })}

        ${renderSignalCard({
          title: "Che cosa lo limita di più",
          body:
            executiveRead?.mainConstraint ||
            normalizedWeaknesses[0] ||
            "Oggi il limite principale non è tanto il potenziale del profilo, quanto il modo in cui viene sostenuto dalle risposte.",
          tone: "risk"
        })}

        ${renderSignalCard({
          title: "Momento da tenere d’occhio",
          body:
            ensureArray(pressureMoments?.items)[0] ||
            "Non emerge ancora un passaggio dominante, ma il sistema segnala aree da rafforzare sotto domanda.",
          tone: "neutral"
        })}
      </div>

      <div class="grid-2 equal-grid">
        ${renderSection(
          "Che cosa sostiene oggi il profilo",
          renderList(
            overviewStrengths,
            "Non si sono ancora evidenziati elementi che sostengano con forza il posizionamento del profilo."
          ),
          "positive-card"
        )}

        ${renderSection(
          "Aree da rafforzare",
          renderList(
            ensureArray(improvements?.finalAdvice).length > 0
              ? ensureArray(improvements?.finalAdvice).slice(0, 5)
              : normalizedWeaknesses.slice(0, 5),
            "Non emergono aree critiche dominanti, ma serve consolidare meglio la qualità delle risposte."
          ),
          "risk-card"
        )}
      </div>
    </div>
  `;

  const answersHtml = `
    <div class="section-shell">
      <div class="section-shell-header">
        <div class="section-shell-title">Profilo e risposte</div>
        <div class="section-shell-subtitle">
          Qui vedi il filo della simulazione e il modo in cui le singole risposte hanno sostenuto o indebolito il profilo.
        </div>
      </div>

      <div class="subtab-row">
        ${answerTabs.length > 0
          ? answerTabs
              .map(
                (tab) => `
                  <button class="subtab-button ${tab.index === 0 ? "is-active" : ""}" data-answer-tab="${tab.index}" type="button">
                    ${escapeHtml(tab.label)}
                  </button>
                `
              )
              .join("\n")
          : `<div class="muted">Nessuna risposta disponibile.</div>`}
      </div>

      ${
        answerTabs.length > 0
          ? answerTabs
              .map((tab) => {
                const answer = answers[tab.index] || {};
                const timelineEntry = timeline[tab.index] || {};
                const questionText = getQuestionTextForAnswer(answer, session, timelineEntry);
                const reading = extractQuickReading(answer, tab.index);
                const score = answer?.answerAnalysis?.answerShapeAnalysis?.overallScore ?? "—";
                const frame = scoreStatus(score);
                const stageLabel = text(answer?.label, tab.stageLabel || "Passaggio");
                const answerText = text(answer?.answerText, "Risposta non disponibile.");
                const questionIntent = buildQuestionIntentText(answer);
                const followupReason = buildFollowupReason(answer, questionText);

                return `
                  <div class="answer-tab-panel ${tab.index === 0 ? "is-active" : ""}" data-answer-panel="${tab.index}">
                    <div class="answer-header-row">
                      <div class="answer-stage-pill">${escapeHtml(stageLabel)}</div>
                      <div class="answer-score-card ${frame.frameClass}">
                        <span class="score-dot ${frame.dotClass}"></span>
                        <span class="answer-score-number">${escapeHtml(`${score} / 100`)}</span>
                        <span class="answer-score-band ${frame.className}">${escapeHtml(frame.label)}</span>
                      </div>
                    </div>

                    <div class="stack-grid">
                      <div class="stack-card">
                        <div class="stack-card-title">Domanda</div>
                        <div class="stack-card-text">${escapeHtml(questionText)}</div>
                      </div>

                      <div class="stack-card">
                        <div class="stack-card-title">Risposta</div>
                        <div class="stack-card-text">${escapeHtml(answerText)}</div>
                      </div>
                    </div>

                    <div class="analysis-grid analysis-grid-3">
                      <div class="analysis-card analysis-card-intent">
                        <div class="analysis-card-title">Che cosa cercava la domanda</div>
                        <div class="analysis-card-text">${escapeHtml(questionIntent)}</div>
                      </div>

                      <div class="analysis-card analysis-card-reading">
                        <div class="analysis-card-title">Che cosa è emerso</div>
                        <div class="analysis-card-text">${escapeHtml(reading.usefulSignal)}</div>
                      </div>

                      <div class="analysis-card analysis-card-action">
                        <div class="analysis-card-title">Perché il sistema spingerebbe ancora</div>
                        <div class="analysis-card-text">${escapeHtml(followupReason)}</div>
                      </div>
                    </div>

                    <div class="analysis-grid">
                      <div class="analysis-card analysis-card-action">
                        <div class="analysis-card-title">Come rafforzarla</div>
                        <div class="analysis-card-text">${escapeHtml(reading.strengthen)}</div>
                      </div>
                    </div>
                  </div>
                `;
              })
              .join("\n")
          : ""
      }
    </div>
  `;

  const cvFreeHtml = `
    <div class="section-shell">
      <div class="section-shell-header">
        <div class="section-shell-title">CV</div>
        <div class="section-shell-subtitle">
          Una prima lettura del CV rispetto al ruolo scelto, con suggerimenti di impostazione generale.
        </div>
      </div>

      <div class="grid-2 equal-grid">
        ${renderSection(
          "Che impressione trasmette oggi il CV",
          `
            <p>${escapeHtml(
              overall?.candidateSummary ||
                "Il CV mostra una base professionale leggibile, ma non sempre rende chiaro fino in fondo il valore trasferibile verso il ruolo scelto."
            )}</p>
            <p class="small">Questa è una lettura generale: serve a capire l’impressione iniziale che il CV tende a dare.</p>
          `
        )}

        ${renderSection(
          "Che cosa conviene migliorare per prima",
          renderList(
            ensureArray(cvAdvice?.cvImprovementHints).slice(0, 4),
            "Conviene rendere più chiari responsabilità personali, risultati e aderenza al ruolo."
          ),
          "warm-card"
        )}
      </div>

      <div class="grid-2 equal-grid">
        ${renderSection(
          "Posizionamento consigliato",
          renderList(
            ensureArray(cvAdvice?.positioningHints).slice(0, 4),
            "Metti maggiormente in evidenza le esperienze che rendono il passaggio al ruolo più credibile."
          ),
          "positive-card"
        )}

        ${renderSection(
          "Che cosa manca ancora",
          renderList(
            ensureArray(roleFit?.clarificationsNeeded).slice(0, 4),
            "Manca ancora qualche elemento che aiuti a capire meglio il livello di autonomia e di impatto reale."
          ),
          "risk-card"
        )}
      </div>
    </div>
  `;

  const proCopy = buildUpgradeMarketingCopy("pro");
  const premiumCopy = buildUpgradeMarketingCopy("premium");

  const trainingHtml = `
    <div class="section-shell">
      <div class="section-shell-header">
        <div class="section-shell-title">Training guidato</div>
        <div class="section-shell-subtitle">
          Questa è la parte in cui il feedback smette di essere generale e diventa davvero utile per allenarsi meglio.
        </div>
      </div>

      ${renderLockedSection({
        title: proCopy.title,
        subtitle: "Preview reale del valore PRO: il sistema entra nel merito di cosa ha funzionato, cosa manca e come migliorarlo.",
        preview: `
          <div class="marketing-preview">
            <div class="preview-sample-grid">
              <div class="preview-sample-card">
                <div class="preview-sample-title">Che cosa ha funzionato</div>
                ${renderList(
                  ensureArray(coachSnapshot?.whatWorked).slice(0, 4),
                  "Qui comparirebbero i segnali forti emersi davvero nelle risposte."
                )}
              </div>
              <div class="preview-sample-card">
                <div class="preview-sample-title">Che cosa migliorare</div>
                ${renderList(
                  ensureArray(coachSnapshot?.whatToImprove).slice(0, 4),
                  "Qui comparirebbero le debolezze ricorrenti osservate dal sistema."
                )}
              </div>
            </div>
            <div class="preview-sample-card">
              <div class="preview-sample-title">Prossime mosse consigliate</div>
              ${renderList(
                ensureArray(coachSnapshot?.nextMoves).slice(0, 5),
                "Qui comparirebbero le indicazioni operative per il tentativo successivo."
              )}
            </div>
          </div>
        `,
        ctaTitle: proCopy.title,
        ctaText: proCopy.text,
        planLabel: "PRO",
        upgradeLabel: proCopy.button
      })}
    </div>
  `;

  const selectionHtml = `
    <div class="section-shell">
      <div class="section-shell-header">
        <div class="section-shell-title">Lettura selezione</div>
        <div class="section-shell-subtitle">
          Qui entri nella parte più vicina a una lettura reale di selezione e di posizionamento competitivo.
        </div>
      </div>

      ${renderLockedSection({
        title: premiumCopy.title,
        subtitle: "Preview reale del valore PREMIUM: non solo coaching, ma lettura recruiter, rischio inserimento e contesto ideale.",
        preview: `
          <div class="marketing-preview">
            <div class="preview-sample-grid">
              <div class="preview-sample-card">
                <div class="preview-sample-title">Rischio inserimento</div>
                <p>${escapeHtml(text(recruiterSnapshot?.insertionRisk, "medio"))}</p>
              </div>
              <div class="preview-sample-card">
                <div class="preview-sample-title">Contesto ideale</div>
                <p>${escapeHtml(text(recruiterSnapshot?.bestContext, "contesto da definire"))}</p>
              </div>
            </div>

            <div class="preview-sample-grid">
              <div class="preview-sample-card">
                <div class="preview-sample-title">Segnali positivi</div>
                ${renderList(
                  ensureArray(recruiterSnapshot?.strengths).slice(0, 4),
                  "Qui comparirebbero i segnali forti letti in chiave recruiter."
                )}
              </div>
              <div class="preview-sample-card">
                <div class="preview-sample-title">Rischi percepiti</div>
                ${renderList(
                  ensureArray(recruiterSnapshot?.risks).slice(0, 4),
                  "Qui comparirebbero i rischi osservati in chiave selezione."
                )}
              </div>
            </div>
          </div>
        `,
        ctaTitle: premiumCopy.title,
        ctaText: premiumCopy.text,
        planLabel: "PREMIUM",
        upgradeLabel: premiumCopy.button
      })}
    </div>
  `;

  const html = `
<!doctype html>
<html lang="it">
<head>
  <meta charset="utf-8" />
  <title>FRINGE Interview Report</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>
    :root {
      --bg: #f5f7fb;
      --card: #ffffff;
      --text: #1f2937;
      --muted: #4b5563;
      --line: #dbe3f0;
      --green-shell-a: #0f5f4a;
      --green-shell-b: #0a4d3c;
    }

    * {
      box-sizing: border-box;
    }

    body {
      font-family: Arial, Helvetica, sans-serif;
      background: var(--bg);
      color: var(--text);
      margin: 0;
      padding: 0 20px 24px 20px;
      line-height: 1.55;
    }

    .page {
      max-width: 1180px;
      margin: 0 auto;
      padding-top: 12px;
    }

    h1, h2, h3 {
      margin-top: 0;
    }

    h2 {
      font-size: 24px;
      margin-bottom: 8px;
    }

    h3 {
      font-size: 20px;
      margin-bottom: 8px;
    }

    p {
      margin-top: 8px;
      margin-bottom: 8px;
    }

    .report-shell-header {
      position: sticky;
      top: 0;
      z-index: 50;
      background: linear-gradient(180deg, var(--green-shell-a) 0%, var(--green-shell-b) 100%);
      color: white;
      border-radius: 16px;
      padding: 12px 14px 14px 14px;
      margin-bottom: 18px;
      box-shadow: 0 10px 24px rgba(10,77,60,0.22);
    }

    .report-shell-top {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 16px;
      margin-bottom: 10px;
    }

    .report-shell-title {
      font-size: 18px;
      font-weight: 800;
      letter-spacing: 0.02em;
      margin-bottom: 4px;
    }

    .report-shell-subtitle {
      font-size: 14px;
      line-height: 1.45;
      color: rgba(255,255,255,0.92);
      max-width: 860px;
    }

    .switch-link {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      white-space: nowrap;
      text-decoration: none;
      background: rgba(255,255,255,0.16);
      color: white;
      border: 1px solid rgba(255,255,255,0.34);
      border-radius: 12px;
      padding: 10px 14px;
      font-size: 14px;
      font-weight: 800;
    }

    .single-line-nav {
      display: grid;
      gap: 8px;
      align-items: stretch;
    }

    .single-line-nav-5 {
      grid-template-columns: 1fr 1.2fr 1fr 1fr 1fr;
    }

    .top-tab {
      position: relative;
      min-height: 88px;
      border-radius: 14px;
      border: 2px solid transparent;
      padding: 12px 12px 10px 12px;
      cursor: pointer;
      text-align: left;
      box-shadow:
        0 10px 18px rgba(15, 23, 42, 0.10),
        inset 0 1px 0 rgba(255,255,255,0.85);
      transition: transform 0.16s ease, box-shadow 0.16s ease, border-color 0.16s ease;
    }

    .top-tab:hover {
      transform: translateY(-1px);
    }

    .top-tab.is-active {
      border-width: 3px;
      box-shadow:
        0 14px 24px rgba(15, 23, 42, 0.20),
        inset 0 0 0 1px rgba(255,255,255,0.6);
    }

    .top-tab-free {
      background: linear-gradient(180deg, #ffffff 0%, #ecfdf5 100%);
    }

    .top-tab-paid {
      background: linear-gradient(180deg, #ffffff 0%, #f5f3ff 100%);
    }

    .top-tab-index {
      position: absolute;
      top: 10px;
      left: 10px;
      width: 30px;
      height: 30px;
      border-radius: 999px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: 900;
      color: white;
      box-shadow: 0 4px 12px rgba(0,0,0,0.16);
    }

    .top-tab-index-free {
      background: #16a34a;
    }

    .top-tab-index-pro {
      background: #7c3aed;
    }

    .top-tab-index-premium {
      background: #9333ea;
    }

    .plan-chip {
      position: absolute;
      top: 10px;
      right: 10px;
      display: inline-flex;
      align-items: center;
      border-radius: 999px;
      padding: 4px 8px;
      font-size: 10px;
      font-weight: 900;
      letter-spacing: 0.04em;
      color: white;
    }

    .plan-chip-free {
      background: #16a34a;
    }

    .plan-chip-pro {
      background: #7c3aed;
    }

    .plan-chip-premium {
      background: #9333ea;
    }

    .top-tab-lock {
      position: absolute;
      top: 40px;
      right: 12px;
      font-size: 20px;
      line-height: 1;
    }

    .top-tab-main {
      display: block;
      padding-left: 38px;
      padding-right: 34px;
      padding-top: 2px;
    }

    .top-tab-label {
      display: block;
      font-size: 15px;
      font-weight: 800;
      color: #111827;
    }

    .top-tab-note {
      display: block;
      font-size: 13px;
      color: #475467;
      margin-top: 4px;
      line-height: 1.35;
    }

    .top-tab-free.is-active {
      border-color: #16a34a;
    }

    .top-tab-paid.is-active {
      border-color: #7c3aed;
    }

    .section-shell {
      background: white;
      border-radius: 16px;
      padding: 18px;
      margin-bottom: 18px;
      box-shadow: 0 6px 18px rgba(0,0,0,0.07);
    }

    .section-shell-header {
      margin-bottom: 14px;
    }

    .section-shell-title {
      font-size: 24px;
      font-weight: 800;
      color: #0f172a;
      margin-bottom: 4px;
    }

    .section-shell-subtitle {
      color: #475467;
      font-size: 15px;
      line-height: 1.5;
    }

    .hero-outcome-card {
      background: linear-gradient(180deg, #f0fdf4 0%, #dcfce7 100%);
      border: 2px solid #86efac;
      border-radius: 16px;
      padding: 18px;
      margin-top: 14px;
      margin-bottom: 18px;
      box-shadow: inset 0 0 0 1px rgba(255,255,255,0.55);
    }

    .hero-outcome-label {
      font-size: 13px;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: #166534;
      margin-bottom: 8px;
    }

    .hero-outcome-headline {
      font-size: 26px;
      line-height: 1.35;
      font-weight: 800;
      color: #111827;
      margin-bottom: 10px;
    }

    .hero-outcome-subheadline {
      font-size: 16px;
      line-height: 1.6;
      color: #1f2937;
    }

    .hero-metrics-grid {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 12px;
      margin-top: 16px;
    }

    .mini-metric {
      border-radius: 14px;
      padding: 14px;
      border: 2px solid #dbe3f0;
      background: rgba(255,255,255,0.82);
    }

    .mini-metric-good {
      border-color: #86efac;
    }

    .mini-metric-warm {
      border-color: #fdba74;
    }

    .mini-metric-neutral {
      border-color: #dbe3f0;
    }

    .mini-metric-label {
      font-size: 12px;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #475467;
      margin-bottom: 6px;
    }

    .mini-metric-value {
      font-size: 18px;
      font-weight: 800;
      color: #111827;
      line-height: 1.35;
    }

    .summary-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 18px;
      margin-top: 14px;
      align-items: stretch;
    }

    .summary-panel {
      background: #f8fafc;
      border: 2px solid #dbe3f0;
      border-radius: 14px;
      padding: 16px;
      display: flex;
      flex-direction: column;
      min-height: 100%;
    }

    .summary-panel-main {
      background: linear-gradient(180deg, #fff7ed 0%, #ffedd5 100%);
      border-color: #fdba74;
    }

    .summary-panel-title {
      font-size: 14px;
      font-weight: 800;
      color: #475467;
      margin-bottom: 8px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .summary-main-text {
      font-size: 22px;
      font-weight: 700;
      line-height: 1.4;
      color: #111827;
      margin-bottom: 12px;
    }

    .summary-helper-text {
      font-size: 15px;
      color: #374151;
      margin-top: auto;
      line-height: 1.55;
    }

    .summary-score-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      height: 100%;
    }

    .signal-grid {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 14px;
      margin-top: 4px;
      margin-bottom: 18px;
    }

    .signal-card {
      border-radius: 14px;
      padding: 16px;
      border: 2px solid #dbe3f0;
      min-height: 160px;
      background: #ffffff;
    }

    .signal-card-good {
      background: #f0fdf4;
      border-color: #86efac;
    }

    .signal-card-risk {
      background: #fef2f2;
      border-color: #fca5a5;
    }

    .signal-card-neutral {
      background: #f8fafc;
      border-color: #dbe3f0;
    }

    .signal-card-title {
      font-size: 14px;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #334155;
      margin-bottom: 8px;
    }

    .signal-card-text {
      font-size: 16px;
      color: #111827;
      line-height: 1.65;
    }

    .card {
      background: white;
      border-radius: 16px;
      padding: 18px;
      margin-bottom: 0;
      box-shadow: 0 6px 18px rgba(0,0,0,0.07);
      border: 2px solid #dbe3f0;
    }

    .grid-2 {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 18px;
      margin-top: 18px;
    }

    .equal-grid > .card {
      height: 100%;
    }

    .card h3 {
      font-size: 20px;
      margin-bottom: 8px;
    }

    .section-subtitle {
      color: #4b5563;
      font-size: 15px;
      line-height: 1.5;
      margin-top: 0;
      margin-bottom: 10px;
    }

    .score-summary-card {
      background: #ffffff;
      border: 3px solid #e5e7eb;
      border-radius: 14px;
      padding: 14px;
      display: flex;
      flex-direction: column;
      min-height: 176px;
    }

    .frame-ok {
      border-color: #16a34a;
      background: #ecfdf3;
    }

    .frame-mid {
      border-color: #f59e0b;
      background: #fff7ed;
    }

    .frame-weak {
      border-color: #ef4444;
      background: #fef2f2;
    }

    .frame-neutral {
      border-color: #cbd5e1;
      background: #f8fafc;
    }

    .score-summary-top {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 6px;
    }

    .score-summary-title {
      font-size: 15px;
      font-weight: 800;
    }

    .score-summary-subtitle {
      font-size: 14px;
      color: #4b5563;
      min-height: 42px;
      margin-bottom: 10px;
      line-height: 1.45;
    }

    .score-summary-main {
      font-size: 34px;
      font-weight: 900;
      line-height: 1;
      margin-top: auto;
      margin-bottom: 8px;
    }

    .score-summary-status {
      font-size: 15px;
      font-weight: 800;
    }

    .score-dot {
      width: 18px;
      height: 18px;
      border-radius: 999px;
      display: inline-block;
      flex: 0 0 auto;
    }

    .dot-ok {
      background: #16a34a;
    }

    .dot-mid {
      background: #d97706;
    }

    .dot-weak {
      background: #dc2626;
    }

    .dot-neutral {
      background: #94a3b8;
    }

    .positive-card {
      background: #f0fdf4;
      border-color: #86efac;
    }

    .risk-card {
      background: #fef2f2;
      border-color: #fca5a5;
    }

    .warm-card {
      background: #fff7ed;
      border-color: #fdba74;
    }

    ul {
      padding-left: 20px;
      margin-top: 8px;
    }

    li {
      font-size: 15px;
      line-height: 1.55;
    }

    li + li {
      margin-top: 6px;
    }

    .muted {
      color: #6b7280;
      font-size: 15px;
      line-height: 1.5;
    }

    .small {
      font-size: 15px;
      color: #4b5563;
      line-height: 1.5;
    }

    .status-ok {
      color: #065f46;
      font-weight: 800;
    }

    .status-mid {
      color: #92400e;
      font-weight: 800;
    }

    .status-weak {
      color: #991b1b;
      font-weight: 800;
    }

    .status-neutral {
      color: #334155;
      font-weight: 800;
    }

    .subtab-row {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 12px;
      margin-bottom: 16px;
    }

    .subtab-button {
      border: 2px solid #cbd5e1;
      background: #eef2ff;
      color: #312e81;
      border-radius: 10px;
      padding: 9px 13px;
      font-weight: 800;
      font-size: 14px;
      cursor: pointer;
    }

    .subtab-button.is-active {
      background: #312e81;
      color: white;
      border-color: #312e81;
      box-shadow: 0 8px 16px rgba(49,46,129,0.20);
    }

    .answer-tab-panel {
      display: none;
    }

    .answer-tab-panel.is-active {
      display: block;
    }

    .answer-header-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
      margin-bottom: 14px;
      flex-wrap: wrap;
    }

    .answer-stage-pill {
      display: inline-flex;
      align-items: center;
      border-radius: 999px;
      background: #e2e8f0;
      color: #0f172a;
      font-size: 14px;
      font-weight: 800;
      padding: 7px 12px;
    }

    .answer-score-card {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      border-radius: 14px;
      border: 3px solid #d1d5db;
      background: white;
      padding: 9px 14px;
    }

    .answer-score-number {
      font-size: 18px;
      font-weight: 900;
      color: #111827;
    }

    .answer-score-band {
      font-size: 14px;
      font-weight: 800;
    }

    .stack-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 12px;
      margin-bottom: 14px;
    }

    .stack-card {
      background: #ffffff;
      border: 2px solid #dbe3f0;
      border-radius: 14px;
      padding: 14px;
    }

    .stack-card-title {
      font-size: 13px;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #475467;
      margin-bottom: 8px;
    }

    .stack-card-text {
      font-size: 16px;
      color: #111827;
      line-height: 1.65;
      white-space: pre-wrap;
    }

    .analysis-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 14px;
      margin-top: 14px;
    }

    .analysis-grid-3 {
      grid-template-columns: 1fr 1fr 1fr;
    }

    .analysis-card {
      border-radius: 14px;
      padding: 16px;
      border: 2px solid transparent;
      min-height: 165px;
    }

    .analysis-card-intent {
      background: #eef2ff;
      border-color: #c7d2fe;
    }

    .analysis-card-reading {
      background: #f8fafc;
      border-color: #dbe3f0;
    }

    .analysis-card-action {
      background: #fff7ed;
      border-color: #fdba74;
      box-shadow: inset 0 0 0 1px rgba(251,146,60,0.12);
    }

    .analysis-card-title {
      font-size: 14px;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #334155;
      margin-bottom: 8px;
    }

    .analysis-card-text {
      font-size: 16px;
      color: #111827;
      line-height: 1.65;
    }

    .locked-card {
      position: relative;
      overflow: hidden;
    }

    .locked-preview {
      position: relative;
      margin-top: 8px;
      border-radius: 12px;
      overflow: hidden;
      border: 2px dashed #d1d5db;
      background: linear-gradient(180deg, #fafafa 0%, #f3f4f6 100%);
      min-height: 240px;
    }

    .locked-blur {
      padding: 18px;
      filter: blur(2px);
      opacity: 0.4;
      pointer-events: none;
      user-select: none;
    }

    .locked-overlay-copy {
      position: absolute;
      inset: 0;
      z-index: 2;
      padding: 20px;
      background: linear-gradient(180deg, rgba(255,255,255,0.86) 0%, rgba(255,255,255,0.96) 100%);
      display: flex;
      flex-direction: column;
      justify-content: center;
    }

    .locked-overlay-pill {
      display: inline-flex;
      align-items: center;
      align-self: flex-start;
      border-radius: 999px;
      background: #4f46e5;
      color: white;
      font-size: 11px;
      font-weight: 800;
      padding: 5px 10px;
      margin-bottom: 10px;
      letter-spacing: 0.05em;
    }

    .locked-overlay-title {
      font-size: 22px;
      font-weight: 800;
      color: #111827;
      margin-bottom: 8px;
    }

    .locked-overlay-text {
      font-size: 16px;
      color: #374151;
      margin-bottom: 14px;
      max-width: 760px;
      line-height: 1.55;
    }

    .upgrade-button {
      align-self: flex-start;
      border: none;
      border-radius: 12px;
      padding: 11px 16px;
      background: #4f46e5;
      color: white;
      font-weight: 800;
      font-size: 14px;
      cursor: pointer;
      box-shadow: 0 8px 18px rgba(79,70,229,0.24);
    }

    .marketing-preview {
      max-width: 860px;
    }

    .preview-sample-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 14px;
      margin-bottom: 14px;
    }

    .preview-sample-card {
      background: #ffffff;
      border: 2px solid #dbe3f0;
      border-radius: 14px;
      padding: 14px;
    }

    .preview-sample-title {
      font-size: 13px;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #475467;
      margin-bottom: 8px;
    }

    @media (max-width: 1180px) {
      .single-line-nav-5 {
        grid-template-columns: 1fr 1.15fr 1fr 1fr 1fr;
      }

      .top-tab-note {
        font-size: 12px;
      }

      .summary-grid,
      .summary-score-grid,
      .grid-2,
      .analysis-grid,
      .analysis-grid-3,
      .signal-grid,
      .hero-metrics-grid,
      .preview-sample-grid {
        grid-template-columns: 1fr;
      }

      .single-line-nav {
        display: flex;
        overflow-x: auto;
        overflow-y: hidden;
        gap: 8px;
        padding-bottom: 4px;
        -webkit-overflow-scrolling: touch;
        scrollbar-width: thin;
      }

      .single-line-nav::-webkit-scrollbar {
        height: 6px;
      }

      .single-line-nav::-webkit-scrollbar-thumb {
        background: rgba(255,255,255,0.35);
        border-radius: 999px;
      }

      .single-line-nav-5 {
        grid-template-columns: none;
      }

      .top-tab {
        flex: 0 0 220px;
        min-height: 90px;
      }

      .report-shell-header {
        position: sticky;
        top: 0;
      }

      .report-shell-top {
        flex-direction: column;
        align-items: stretch;
      }
    }

    @media (max-width: 760px) {
      body {
        padding: 0 10px 18px 10px;
      }

      .page {
        padding-top: 10px;
      }

      .report-shell-header {
        padding: 10px 10px 10px 10px;
        border-radius: 14px;
        margin-bottom: 14px;
      }

      .report-shell-top {
        margin-bottom: 8px;
        gap: 10px;
      }

      .report-shell-title {
        font-size: 15px;
      }

      .report-shell-subtitle {
        font-size: 11px;
        line-height: 1.3;
      }

      .switch-link {
        width: 100%;
        justify-content: center;
        padding: 9px 12px;
        font-size: 13px;
      }

      .top-tab {
        flex: 0 0 176px;
        min-height: 74px;
        padding: 8px 8px 8px 8px;
        border-radius: 12px;
      }

      .top-tab-index {
        top: 8px;
        left: 8px;
        width: 24px;
        height: 24px;
        font-size: 10px;
      }

      .plan-chip {
        top: 8px;
        right: 8px;
        font-size: 8px;
        padding: 2px 6px;
      }

      .top-tab-lock {
        top: 31px;
        right: 9px;
        font-size: 15px;
      }

      .top-tab-main {
        padding-left: 28px;
        padding-right: 22px;
        padding-top: 0;
      }

      .top-tab-label {
        font-size: 13px;
        line-height: 1.05;
      }

      .top-tab-note {
        font-size: 10px;
        line-height: 1.15;
        margin-top: 3px;
      }

      .section-shell-title {
        font-size: 20px;
      }

      .hero-outcome-headline {
        font-size: 22px;
      }

      .summary-main-text,
      .stack-card-text,
      .analysis-card-text,
      .locked-overlay-text,
      .muted,
      .small,
      li,
      .hero-outcome-subheadline,
      .signal-card-text {
        font-size: 15px;
      }
    }

    @media (max-height: 520px) and (orientation: landscape) {
      .report-shell-header {
        position: static;
      }
    }
  </style>
</head>
<body>
  <div class="page">
    ${renderTopNavigation("overview", currentPlan)}

    <div id="reportPanel_overview" class="report-main-panel">
      ${overviewHtml}
    </div>

    <div id="reportPanel_answers" class="report-main-panel" style="display:none;">
      ${answersHtml}
    </div>

    <div id="reportPanel_cv" class="report-main-panel" style="display:none;">
      ${cvFreeHtml}
    </div>

    <div id="reportPanel_training" class="report-main-panel" style="display:none;">
      ${trainingHtml}
    </div>

    <div id="reportPanel_selection" class="report-main-panel" style="display:none;">
      ${selectionHtml}
    </div>
  </div>

  <script>
    (function () {
      function switchMainTab(tabKey) {
        var allButtons = document.querySelectorAll("[data-report-tab]");
        var allPanels = document.querySelectorAll(".report-main-panel");

        allButtons.forEach(function (button) {
          button.classList.toggle("is-active", button.getAttribute("data-report-tab") === tabKey);
        });

        allPanels.forEach(function (panel) {
          panel.style.display = panel.id === ("reportPanel_" + tabKey) ? "" : "none";
        });
      }

      function switchAnswerTab(index) {
        document.querySelectorAll("[data-answer-tab]").forEach(function (button) {
          button.classList.toggle("is-active", String(button.getAttribute("data-answer-tab")) === String(index));
        });

        document.querySelectorAll("[data-answer-panel]").forEach(function (panel) {
          panel.classList.toggle("is-active", String(panel.getAttribute("data-answer-panel")) === String(index));
        });
      }

      document.querySelectorAll("[data-report-tab]").forEach(function (button) {
        button.addEventListener("click", function () {
          switchMainTab(button.getAttribute("data-report-tab"));
        });
      });

      document.querySelectorAll("[data-answer-tab]").forEach(function (button) {
        button.addEventListener("click", function () {
          switchAnswerTab(button.getAttribute("data-answer-tab"));
        });
      });

      switchMainTab("overview");

      if (document.querySelectorAll("[data-answer-tab]").length > 0) {
        switchAnswerTab(0);
      }
    })();
  </script>
</body>
</html>
  `;

  return html.trim();
}

export default renderFringeInterviewReportHtml;