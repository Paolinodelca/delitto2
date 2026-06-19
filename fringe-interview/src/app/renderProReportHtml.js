import { assembleReportSectionData } from "../report/assembleReportSectionData.js";
import loadProReportNarrativeData from "../report/narrativeProfiles/loadProReportNarrativeData.js";

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

function renderOpeningCreditBox(opening = {}) {
  const credit = opening?.contextCarryoverCredit || null;

  if (!credit) {
    return "";
  }

  const label =
    credit.credibilityLevel === "strong"
      ? "Credito forte"
      : credit.credibilityLevel === "partial"
        ? "Credito parziale"
        : "Credito debole";

  const tone =
    credit.credibilityLevel === "strong"
      ? "good"
      : credit.credibilityLevel === "partial"
        ? "warm"
        : "risk";

  return `
    <div class="opening-credit-box opening-credit-${tone}">
      <div class="opening-credit-label">Credito generato dall’apertura</div>
      <div class="opening-credit-value">${escapeHtml(label)}</div>
      <div class="opening-credit-text">
        ${credit.shouldRequireConcreteEvidenceLater
          ? "L’apertura non basta ancora a rendere credibili le risposte successive: serviranno esempi concreti, responsabilità e risultati."
          : "L’apertura fornisce già riferimenti abbastanza concreti: le risposte successive possono costruire su questa base senza ripetere tutto."}
      </div>
    </div>
  `;
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

function renderPill(label, tone = "neutral") {
  return `<span class="pill pill-${escapeHtml(tone)}">${escapeHtml(label)}</span>`;
}

function toneFromCvWeight(value) {
  const clean = String(value || "").toLowerCase();

  if (clean.includes("leva forte")) return "good";
  if (clean.includes("leva utile")) return "warm";
  if (clean.includes("leva secondaria")) return "neutral";

  if (clean.includes("gap rilevante")) return "risk";
  if (clean.includes("gap critico")) return "risk";
  if (clean.includes("gap medio")) return "warm";
  if (clean.includes("gap da chiarire")) return "neutral";

  return "neutral";
}

function renderCvSignalCards(items = [], emptyLabel = "—") {
  const values = ensureArray(items).filter(Boolean);

  if (!values.length) {
    return `<p class="muted">${escapeHtml(emptyLabel)}</p>`;
  }

  return `
    <div class="cv-signal-list">
      ${values
        .map((item) => `
          <div class="cv-signal-card">
            <div class="cv-signal-top">
              <div class="cv-signal-label">${escapeHtml(text(item?.label, "—"))}</div>
              ${renderPill(text(item?.weight, "—"), toneFromCvWeight(item?.weight))}
            </div>
            ${item?.impact ? `<div class="cv-signal-impact">${escapeHtml(text(item?.impact, "—"))}</div>` : ""}
          </div>
        `)
        .join("\n")}
    </div>
  `;
}

function renderCvSignalList(items = [], emptyLabel = "—") {
  const values = ensureArray(items).filter(Boolean);

  if (!values.length) {
    return `<p class="muted">${escapeHtml(emptyLabel)}</p>`;
  }

  return `
    <ul class="cv-simple-list">
      ${values
        .map((item) => `
          <li>
            <span class="cv-simple-label">${escapeHtml(text(item?.label, "—"))}</span>
            <span class="cv-simple-sep">·</span>
            <span class="cv-simple-weight">${escapeHtml(text(item?.weight, "—"))}</span>
          </li>
        `)
        .join("\n")}
    </ul>
  `;
}

function toneFromCoherence(value) {
  const clean = String(value || "").toLowerCase();
  if (clean === "high") return "good";
  if (clean === "medium") return "warm";
  if (clean === "low") return "risk";
  return "neutral";
}

function toneFromRisk(value) {
  const clean = String(value || "").toLowerCase();
  if (clean === "ok") return "good";
  if (clean === "debole" || clean === "weak" || clean === "alto" || clean === "high") return "risk";
  if (clean === "non_esplorata") return "warm";
  return "neutral";
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

function toneFromSensitiveReadiness(value) {
  const clean = String(value || "").toLowerCase();

  if (clean.includes("solida")) return "positive-card";
  if (clean.includes("da rafforzare")) return "warm-card";
  if (clean.includes("fragile")) return "risk-card";
  if (clean.includes("da presidiare")) return "warm-card";
  if (clean.includes("non valutabile")) return "warm-card";
  if (clean.includes("peso ridotto")) return "positive-card";
  if (clean.includes("da chiarire")) return "warm-card";

  return "card";
}


function humanizeProblematicAnswerType(
  value,
  item = {},
  proReportNarratives = {}
) {
  const clean = String(value || "").toLowerCase();
  const score = Number(item?.score ?? 0);
  const weaknesses = ensureArray(item?.weaknesses).filter(Boolean);
  const offTopicRisk = String(item?.offTopicRisk || "").toLowerCase();
  const answerIndex = Number(item?.answerIndex || 0);

  const templates =
    proReportNarratives?.renderer?.problematicAnswerType || {};

  function pickVariant(variants) {
    const cleanVariants = ensureArray(variants).filter(Boolean);

    if (cleanVariants.length === 0) {
      return "";
    }

    const index =
      Number.isFinite(answerIndex) && answerIndex > 0
        ? answerIndex - 1
        : Math.max(0, Math.round(score || 0));

    return cleanVariants[index % cleanVariants.length];
  }

  if (clean === "none") {
    if (score <= 15) {
      if (weaknesses.length > 0) {
        return rewriteWeaknessForUser(
          weaknesses[0],
         proReportNarratives
        );
      }

      if (offTopicRisk === "high") {
        return templates.offTopicHighVeryWeak;
      }

      return templates.veryWeakFallback;
    }

    if (score <= 40) {
      const firstWeakness =
        weaknesses.length > 0
          ? rewriteWeaknessForUser(
            weaknesses[0],
            proReportNarratives
          )
          : "";

      return pickVariant([
        firstWeakness,
        ...ensureArray(templates.weakVariants)
      ]);
    }

    if (offTopicRisk === "high") {
      return pickVariant(templates.offTopicVariants);
    }

    return pickVariant(templates.usableVariants);
  }

  const map = {
    duplicate: templates.duplicate,
    evasive: templates.evasive,
    off_topic: templates.off_topic,
    provocative_unserious: templates.provocative_unserious,
    non_answer: templates.non_answer,
    nonsense: templates.nonsense,
    generic_example_missing: templates.generic_example_missing
  };

  return pickVariant(map[clean]) || templates.fallback;
}

function rewriteWeaknessForUser(
  value,
  proReportNarratives = {}
) {
  const clean = text(value, "");

  const templates =
    proReportNarratives?.renderer?.weaknessRewrite || {};

  if (!clean) {
    return templates.emptyFallback;
  }

  const replacements = [
    {
      from: "La risposta non resta abbastanza aderente al punto chiesto.",
      to: templates.notAligned
    },
    {
      from: "La risposta rischia di andare fuori asse rispetto alla domanda.",
      to: templates.goesOffTrack
    },
    {
      from: "La risposta suona più come un’introduzione o una promessa di risposta che come una risposta vera.",
      to: templates.tooIntroductory
    },
    {
      from: "La risposta resta troppo astratta e beneficerebbe di un esempio più concreto.",
      to: templates.tooAbstract
    },
    {
      from: "La risposta non distingue con chiarezza il contributo personale dall’attività del team.",
      to: templates.ownershipUnclear
    },
    {
      from: "La risposta è chiara ma non mette ancora abbastanza in evidenza il tuo contributo diretto.",
      to: templates.directContributionWeak
    },
    {
      from: "La risposta non mostra ancora riflessione, apprendimento o adattamento.",
      to: templates.learningNotVisible
    },
    {
      from: "La risposta sarebbe più facile da seguire con una struttura più chiara.",
      to: templates.structureWeak
    }
  ];

  const exact = replacements.find((item) => item.from === clean);

  if (exact?.to) {
    return exact.to;
  }

  return clean
    .replace(/^La risposta /, "")
    .replace(/^Questa è di fatto /, "")
    .replace(/^Questa /, "")
    .toLowerCase();
}

function humanizeOffTopicRisk(value) {
  const clean = String(value || "").toLowerCase();

  const map = {
    low: "resta abbastanza sul punto",
    medium: "tende un po' ad allargarsi",
    high: "rischia di non rispondere davvero al punto"
  };

  return map[clean] || "aderenza da chiarire";
}

function humanizeQuestionIntent(value) {
  const clean = String(value || "").trim();

  if (!clean || clean.toLowerCase() === "domanda del colloquio") {
    return "passaggio di chiarimento del colloquio";
  }

  const map = {
    "Apertura / posizionamento": "apertura e posizionamento",
    "Aderenza al ruolo": "collegamento con il ruolo target",
    "Conflitto / pressione": "gestione di attrito o pressione",
    "Decisione / priorità": "decisione e criterio di scelta",
    "Esempio concreto": "episodio concreto",
    "Percorso / walkthrough": "racconto del percorso"
  };

  return map[clean] || clean.toLowerCase();
}

function rewritePriorityText(
  value,
  proReportNarratives = {}
) {
  const clean = text(value, "");

  if (!clean) {
    return "";
  }

  const templates =
    proReportNarratives?.renderer?.priorityRewrite || {};

  const replacements = [
    {
      from: "La risposta non mostra ancora riflessione, apprendimento o adattamento.",
      to: templates.learningNotVisible
    },
    {
      from: "La risposta sarebbe più facile da seguire con una struttura più chiara.",
      to: templates.structureWeak
    },
    {
      from: "La risposta è chiara ma non mette ancora abbastanza in evidenza il tuo contributo diretto.",
      to: templates.directContributionWeak
    },
    {
      from: "La risposta non distingue con chiarezza il contributo personale dall’attività del team.",
      to: templates.ownershipUnclear
    }
  ];

  const exact = replacements.find((item) => item.from === clean);

  return exact?.to
    ? exact.to
    : clean.replace(/^La risposta /, "Nel colloquio ");
}

function rewriteChecklistAction(value) {
  const clean = text(value, "");

  if (!clean) return "";

  const replacements = [
    {
      from: "node scripts/test_render_pro_report_v2.js",
      to: "Fai capire meglio che cosa dipendeva davvero da te, quali decisioni hai preso e quale contributo hai portato in prima persona."
    },
    {
      from: "Usa una sequenza semplice come situazione, azione, risultato.",
      to: "Usa una struttura semplice e ripetibile: situazione, tua azione, risultato."
    },
    {
      from: "Aggiungi una situazione concreta con contesto, azione e risultato invece di restare sul generale.",
      to: "Porta almeno un esempio reale con contesto, tua azione e risultato."
    },
    {
      from: "Usa esempi più concreti invece di parlare in termini troppo generali.",
      to: "Riduci le formule generiche e appoggiati di più a episodi reali."
    },
    {
      from: "Aggiungi una breve riflessione su ciò che hai imparato o su come ti sei adattato.",
      to: "Chiudi almeno una risposta spiegando che cosa hai imparato o come hai corretto il tiro."
    }
  ];

  const exact = replacements.find((item) => item.from === clean);
  return exact ? exact.to : clean;
}

function normalizeImprovementHints(
  items = [],
  proReportNarratives = {}
) {
  const raw = ensureArray(items).map((item) => text(item, "")).filter(Boolean);

  const normalized = raw.map((item) =>
  rewriteImprovementHint(item, proReportNarratives)
);
  const deduped = [];

  for (const item of normalized) {
    const key = item.toLowerCase().trim();
    if (!key) continue;
    if (deduped.some((existing) => existing.toLowerCase().trim() === key)) {
      continue;
    }
    deduped.push(item);
  }

  return deduped.slice(0, 3);
}

function buildTemplateImprovedAnswer(
  item = {},
  proReportNarratives = {}
) {
  const templates =
    proReportNarratives?.renderer?.templateImprovedAnswer || {};

  const questionIntent =
    String(item?.questionIntent || "").toLowerCase();

  const score =
    Number(item?.score ?? 0);

  const offTopicRisk =
    String(item?.offTopicRisk || "").toLowerCase();

  const weaknesses =
    ensureArray(item?.weaknesses).join(" ").toLowerCase();

  const annotations =
    ensureArray(item?.annotations);

  const hasOwnershipIssue =
    weaknesses.includes("contributo diretto") ||
    weaknesses.includes("responsabilità") ||
    annotations.some(
      (a) => String(a?.dimension || "").toLowerCase() === "ownership"
    );

  const hasSpecificityIssue =
    weaknesses.includes("concreto") ||
    weaknesses.includes("specific") ||
    annotations.some(
      (a) => String(a?.dimension || "").toLowerCase() === "specificity"
    );

  const hasStructureIssue =
    weaknesses.includes("struttura") ||
    annotations.some(
      (a) => String(a?.dimension || "").toLowerCase() === "structure"
    );

  const hasReflectionIssue =
    weaknesses.includes("riflessione") ||
    weaknesses.includes("adattamento") ||
    annotations.some(
      (a) => String(a?.dimension || "").toLowerCase() === "reflection"
    );

  if (
    questionIntent.includes("apertura") ||
    questionIntent.includes("posizionamento")
  ) {
    return templates.opening;
  }

  if (
    questionIntent.includes("ruolo") ||
    offTopicRisk === "high"
  ) {
    return templates.roleOrOffTopic;
  }

  if (
    questionIntent.includes("pressione") ||
    questionIntent.includes("conflitto")
  ) {
    return templates.pressureConflict;
  }

  if (
    questionIntent.includes("decisione") ||
    questionIntent.includes("priorità")
  ) {
    return templates.decisionPriority;
  }

  if (hasOwnershipIssue) {
    return templates.ownershipIssue;
  }

  if (hasSpecificityIssue) {
    return templates.specificityIssue;
  }

  if (hasReflectionIssue) {
    return templates.reflectionIssue;
  }

  if (hasStructureIssue || score < 50) {
    return templates.structureIssue;
  }

  return templates.fallback;
}

function buildInspirationalAnswerDraft(
  item = {},
  proReportNarratives = {}
) {
  const templates =
    proReportNarratives?.renderer?.inspirationalAnswerDraft || {};

  const questionIntent =
    String(item?.questionIntent || "").toLowerCase();

  const questionText =
    String(item?.questionText || "").toLowerCase();

  const score =
    Number(item?.score ?? 0);

  const isLearningCurve =
    questionText.includes("curva di apprendimento") ||
    questionText.includes("affronteresti") ||
    questionText.includes("imparare");

  const isOpening =
    questionIntent.includes("apertura") ||
    questionIntent.includes("posizionamento");

  const isRole =
    questionIntent.includes("ruolo") ||
    questionText.includes("perché questo ruolo") ||
    questionText.includes("ruolo target");

  const isDecision =
    questionIntent.includes("decisione") ||
    questionIntent.includes("priorità") ||
    questionText.includes("trade-off") ||
    questionText.includes("decisione");

  const isPressure =
    questionIntent.includes("pressione") ||
    questionIntent.includes("conflitto") ||
    questionText.includes("pressione") ||
    questionText.includes("conflitto");

  const weaknesses =
    Array.isArray(item?.weaknesses)
      ? item.weaknesses
      : [];

  if (score >= 75) {
    return "";
  }

  if (isOpening) {
    return templates.opening;
  }

  if (isLearningCurve) {
    return templates.learningCurve;
  }

  if (isRole) {
    return templates.role;
  }

  if (isDecision) {
    return templates.decision;
  }

  if (isPressure) {
    return templates.pressure;
  }

  const mainWeakness =
    weaknesses[0] || "";

  if (mainWeakness.toLowerCase().includes("contesto")) {
    return templates.contextWeakness;
  }

  if (mainWeakness.toLowerCase().includes("ownership")) {
    return templates.ownershipWeakness;
  }

  if (mainWeakness.toLowerCase().includes("struttura")) {
    return templates.structureWeakness;
  }

  return templates.fallback;
}

function rewriteImprovementHint(
  value,
  proReportNarratives = {}
) {
  const clean = text(value, "");

  if (!clean) {
    return "";
  }

  const templates =
    proReportNarratives?.renderer?.improvementHintRewrite || {};

  const replacements = [
    {
      from: "Aggiungi una situazione concreta con contesto, azione e risultato invece di restare sul generale.",
      to: templates.concreteExample
    },
    {
      from: "Aggiungi una situazione concreta con contesto, tua azione diretta e risultato, invece di restare su una descrizione valida ma ancora generale.",
      to: templates.concreteExample
    },
    {
      from: "Usa una sequenza semplice come situazione, azione, risultato.",
      to: templates.simpleStructure
    },
    {
      from: "node scripts/test_render_pro_report_v2.js",
      to: templates.ownership
    },
    {
      from: "Inserisci un outcome, una metrica o un effetto visibile del tuo lavoro.",
      to: templates.outcome
    },
    {
      from: "Resta più vicino alla domanda: prima chiarisci il punto centrale, poi aggiungi contesto.",
      to: templates.stayOnQuestion
    },
    {
      from: "Resta più aderente alla domanda: chiarisci prima il punto centrale, poi aggiungi contesto ed esempio.",
      to: templates.stayOnQuestionWithExample
    },
    {
      from: "Hai già una base chiara: rafforza il punto centrale con un elemento più specifico o verificabile.",
      to: templates.makeItStronger
    }
  ];

  const exact = replacements.find(
    (item) => item.from === clean
  );

  return exact?.to || clean;
}

function renderImpactList(items = [], tone = "risk") {
  return ensureArray(items).map((item, index) => {
    const score = index === 0 ? 5 : index === 1 ? 4 : 3;
    const level = score === 5 ? "high" : score === 4 ? "mid" : "low";
    const label = score === 5 ? "Alta" : score === 4 ? "Media" : "Nota";

    return `
      <div class="impact-item impact-${tone}">
        <div class="impact-priority impact-priority-${level}">
          <span class="impact-priority-dot"></span>
          <span class="impact-priority-label">${label}</span>
        </div>
        <div class="impact-text">${escapeHtml(item)}</div>
      </div>
    `;
  }).join("");
}

function renderFeaturedRecruiterRecovery(item = {}) {
  const recovery = item?.recruiterRecoveryPrompt;

  if (!recovery || typeof recovery !== "object") {
    return "";
  }

  return `
    <div class="featured-recruiter-recovery">
      <div class="featured-recruiter-recovery-kicker">
        Il recruiter ti avrebbe fermato qui
      </div>

      <div class="featured-recruiter-recovery-text">
        ${escapeHtml(recovery?.prompt || "")}
      </div>
    </div>
  `;
}


function renderAnswerCard(
  item,
  context = {}
) {
  const proReportNarratives =
  context?.proReportNarratives || {};
  const score = Number(item?.score ?? 0);
  const status = scoreStatus(score);

  const isCritical = item?.featuredType === "critical";
  const isStrong = item?.featuredType === "strong";

  const typeLabel = isCritical
    ? "La risposta più penalizzante"
    : isStrong
      ? "La risposta che oggi regge meglio"
      : "Risposta significativa";

  const mainHint =
    ensureArray(item?.improvementHints)[0] ||
    "Rendi la risposta più concreta, più centrata e più collegata al ruolo.";

  const featuredToneClass = isCritical
    ? "featured-answer-critical"
    : isStrong
      ? "featured-answer-strong"
      : "featured-answer-neutral";

  return `
    <div class="answer-card featured-answer-card ${featuredToneClass}">
      <div class="answer-card-top">
        <div class="answer-card-kicker">${escapeHtml(typeLabel)}</div>
        <div class="answer-card-score ${status.className}">
          ${escapeHtml(`${score} / 100`)}
        </div>
      </div>

      <div class="featured-answer-qa-box">
        <div class="featured-answer-question">
          <span>Domanda</span>
          ${escapeHtml(text(item?.questionText, "Domanda non disponibile"))}
        </div>


    <div class="featured-answer-response">
  <span>Risposta</span>
  <div class="featured-answer-response-text">
    ${escapeHtml(text(item?.answerText, "Risposta non disponibile"))}
  </div>


  <div class="featured-answer-summary-inside">
    ${escapeHtml(
  getDisplayAnswerSummary(
    item,
    context?.proReportNarratives || {}
      )
    )}
  </div>
${item?.contextLinkNote ? `
  <div class="featured-context-link-note">
    <div class="featured-context-link-title">Collegamento con il racconto iniziale</div>
    ${escapeHtml(item.contextLinkNote)}
  </div>
` : ""}
${renderFeaturedRecruiterRecovery(item)}


</div>
</div>

<div class="answer-card-grid featured-analysis-grid">
  <div class="answer-subcard featured-subcard featured-subcard-risk">
    <div class="answer-subcard-title">Che cosa oggi la indebolisce</div>
    ${renderImpactList(
      ensureArray(item?.weaknesses).slice(0, 3),
      "risk"
    )}
  </div>

  <div class="answer-subcard featured-subcard featured-subcard-advice">
    <div class="answer-subcard-title">Come può essere rafforzata</div>
    ${renderImpactList(
      normalizeImprovementHints(
      item?.improvementHints,
      proReportNarratives
      ).slice(0, 2),
      "advice"
    )}
  </div>
</div>


    </div>
  `;
}

function renderDuplicateAnswerWarning(item = {}) {
  const type = String(item?.problematicAnswerType || "").toLowerCase();

  if (type !== "duplicate") {
    return "";
  }

  return `
    <div class="duplicate-answer-warning">
      <div class="duplicate-answer-warning-title">Risposta ripetuta</div>
      <div class="duplicate-answer-warning-text">
        Questa risposta ripete contenuti già emersi. In un colloquio questo penalizza molto, perché dà l’impressione di non aggiungere nuove evidenze, esempi o decisioni rispetto a quanto già detto.
      </div>
    </div>
  `;
}

function getFirstCorrectionTone(item = {}) {
  const type = String(item?.problematicAnswerType || "").toLowerCase();
  const score = Number(item?.score ?? 0);
  const offTopicRisk = String(item?.offTopicRisk || "").toLowerCase();

  if (
    type === "duplicate" ||
    type === "non_answer" ||
    type === "off_topic" ||
    type === "evasive" ||
    type === "nonsense" ||
    score <= 25 ||
    offTopicRisk === "high"
  ) {
    return "is-severe";
  }

  if (score < 50) {
    return "is-warning";
  }

  return "is-neutral";
}

function toneFromAnnotationType(type) {
  const clean = String(type || "").toLowerCase();

  if (clean === "strength" || clean === "evidence") return "segment-good";
  if (clean === "weakness") return "segment-risk";
  if (clean === "opportunity" || clean === "improvement" || clean === "warning") return "segment-warm";

  return "segment-neutral";
}

function humanizeAnnotationType(value) {
  const clean = String(value || "").toLowerCase();

  const map = {
    strength: "punto forte",
    evidence: "evidenza",
    weakness: "punto debole",
    opportunity: "da rafforzare"
  };

  return map[clean] || "segmento";
}

function humanizeAnnotationDimension(value) {
  const clean = String(value || "").toLowerCase();

  const map = {
    concreteness: "concretezza",
    specificity: "specificità",
    evidence: "evidenza",
    ownership: "responsabilità personale",
    structure: "struttura",
    clarity: "chiarezza",
    reflection: "riflessione",
    generic: "lettura generale"
  };

  return map[clean] || "lettura";
}

function segmentImpactLabel(type) {
  const clean = String(type || "").toLowerCase();

  if (clean === "strength" || clean === "evidence") return "Aiuta la risposta";
  if (clean === "weakness") return "Penalizza la risposta";
  if (clean === "opportunity") return "Da rafforzare";

  return "Da leggere";
}

function buildFallbackAnnotations(item = {}) {
  const analysis = item?.analysis || {};
  const answerText = String(item?.answerText || "").trim();

  if (!answerText) {
    return [];
  }

  const annotations = [];

  if (
    ensureArray(item?.weaknesses).some((w) =>
      String(w).toLowerCase().includes("aderente")
    )
  ) {
    annotations.push({
      type: "risk",
      excerpt: answerText.slice(0, 180),
      note: "La risposta introduce elementi utili, ma non aggancia abbastanza bene il punto centrale della domanda."
    });
  }

  if (
    ensureArray(item?.weaknesses).some((w) =>
      String(w).toLowerCase().includes("ownership")
    )
  ) {
    annotations.push({
      type: "opportunity",
      excerpt: answerText.slice(0, 220),
      note: "Qui sarebbe utile distinguere meglio ciò che dipendeva direttamente da te rispetto al lavoro del team."
    });
  }

  if (
    ensureArray(item?.weaknesses).some((w) =>
      String(w).toLowerCase().includes("specific")
    )
  ) {
    annotations.push({
      type: "risk",
      excerpt: answerText.slice(0, 220),
      note: "Il passaggio resta ancora troppo generale: servirebbe un episodio più verificabile o concreto."
    });
  }

  if (
    ensureArray(item?.weaknesses).length === 0
  ) {
    annotations.push({
      type: "strength",
      excerpt: answerText.slice(0, 220),
      note: "La risposta costruisce un racconto abbastanza leggibile e coerente."
    });
  }

  return annotations.slice(0, 3);
}


function renderAnswerSegments(item = {}) {
 const annotationsSource =
  ensureArray(item?.annotations).length > 0
    ? item?.annotations
    : buildFallbackAnnotations(item);

const annotations = ensureArray(annotationsSource)


    .filter((annotation) =>
      typeof annotation?.excerpt === "string" &&
      annotation.excerpt.trim()
    )
    .slice(0, 8);

  if (!annotations.length) {
    return `
      <div class="segment-empty">
        Segmentazione non ancora disponibile per questa risposta. Rigenera le answer annotations per ottenere evidenziazioni puntuali.
      </div>
    `;
  }

  function toneKey(annotation) {
    const type = String(annotation?.type || "").toLowerCase();

    if (type.includes("strength") || type.includes("positive")) return "positive";
    if (type.includes("weakness") || type.includes("risk") || type.includes("negative")) return "risk";
    return "improve";
  }

  function renderSegmentCard(annotation) {
    return `
      <div class="answer-segment ${toneFromAnnotationType(annotation?.type)}">
        <div class="segment-head">
          <div>
            <div class="segment-impact">
              ${escapeHtml(`${segmentImpactLabel(annotation?.type)} · ${humanizeAnnotationDimension(annotation?.dimension)}`)}
            </div>
          </div>
        </div>

        <div class="segment-excerpt">“${escapeHtml(text(annotation?.excerpt, ""))}”</div>
        <div class="segment-reason">${escapeHtml(text(annotation?.reason, "—"))}</div>
      </div>
    `;
  }

  const groups = {
    positive: [],
    risk: [],
    improve: []
  };

  annotations.forEach((annotation) => {
    groups[toneKey(annotation)].push(annotation);
  });

  const orderedGroups = [
    { key: "positive", label: "Altri elementi che aiutano la risposta" },
    { key: "risk", label: "Altri elementi che penalizzano la risposta" },
    { key: "improve", label: "Altri elementi da rafforzare" }
  ];

  return `
    <div class="answer-segment-list">

      ${orderedGroups.map((group) => {
        const items = groups[group.key];

        if (!items.length) {
          return "";
        }

        const primary = items[0];
        const extra = items.slice(1);

        return `
          ${renderSegmentCard(primary)}

          ${extra.length > 0 ? `
            <details style="
              margin:10px 0 14px 0;
              border-radius:12px;
              overflow:hidden;
              border:1px solid rgba(255,255,255,0.18);
              background:rgba(15,23,42,0.18);
            ">
              <summary style="
                min-height:42px;
                padding:0 12px;
                display:flex;
                align-items:center;
                justify-content:space-between;
                gap:10px;
                cursor:pointer;
                background:rgba(255,255,255,0.08);
                color:#ffffff;
                font-size:13px;
                font-weight:900;
              ">
                <span>${escapeHtml(group.label)}</span>
                <strong style="
                  padding:5px 9px;
                  border-radius:999px;
                  background:#facc15;
                  color:#111827;
                  font-size:11px;
                  font-weight:900;
                  white-space:nowrap;
                ">
                  +${extra.length}
                </strong>
              </summary>

              <div style="display:grid; gap:10px; padding:10px;">
                ${extra.map(renderSegmentCard).join("\n")}
              </div>
            </details>
          ` : ""}
        `;
      }).join("\n")}

    </div>
  `;
}

function normalizeForCompare(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[.,;:!?()[\]"]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function isCoveredByAnnotations(textValue, annotations = []) {
  const cleanText = normalizeForCompare(textValue);

  if (!cleanText) return false;

  return ensureArray(annotations).some((annotation) => {
    const reason = normalizeForCompare(annotation?.reason);
    const label = normalizeForCompare(annotation?.label);
    const dimension = normalizeForCompare(annotation?.dimension);

    return (
      reason.includes(cleanText.slice(0, 28)) ||
      cleanText.includes(label) ||
      cleanText.includes(dimension)
    );
  });
}

function renderCapabilityBlock(
  context = {},
  capabilityKey = "",
  renderFn = null
) {
  if (!isCapabilityEnabled(context, capabilityKey)) {
    return "";
  }

  if (typeof renderFn !== "function") {
    return "";
  }

  return renderFn();
}


function isCapabilityEnabled(context = {}, capabilityKey = "") {
  return context?.productCapabilities?.[capabilityKey] === true;
}



function classifyCoachingTheme(value) {
  const clean = normalizeForCompare(value);

  if (
    clean.includes("contributo") ||
    clean.includes("responsabil") ||
    clean.includes("ownership") ||
    clean.includes("dipendeva da te") ||
    clean.includes("decisioni hai preso")
  ) {
    return "ownership";
  }

  if (
    clean.includes("concreto") ||
    clean.includes("esempio") ||
    clean.includes("episodio") ||
    clean.includes("specific")
  ) {
    return "specificity";
  }

  if (
    clean.includes("struttura") ||
    clean.includes("situazione") ||
    clean.includes("azione") ||
    clean.includes("risultato")
  ) {
    return "structure";
  }

  if (
    clean.includes("riflessione") ||
    clean.includes("imparato") ||
    clean.includes("adattato")
  ) {
    return "reflection";
  }

  if (
    clean.includes("aderente") ||
    clean.includes("fuori asse") ||
    clean.includes("domanda") ||
    clean.includes("passaggio verso questo ruolo")
  ) {
    return "alignment";
  }

  return clean.slice(0, 40);
}

function dedupeByCoachingTheme(items = [], maxItems = 2) {
  const selected = [];
  const seenThemes = new Set();

  for (const item of ensureArray(items)) {
    const clean = text(item, "");
    if (!clean) continue;

    const theme = classifyCoachingTheme(clean);
    if (seenThemes.has(theme)) continue;

    seenThemes.add(theme);
    selected.push(clean);

    if (selected.length >= maxItems) break;
  }

  return selected;
}

function selectSecondaryWeaknesses(item = {}) {
  const annotations = ensureArray(item?.annotations);
  const annotationThemes = new Set(
    annotations.map((annotation) =>
      classifyCoachingTheme(
        `${annotation?.type || ""} ${annotation?.dimension || ""} ${annotation?.label || ""} ${annotation?.reason || ""}`
      )
    )
  );

  const filtered = ensureArray(item?.weaknesses).filter((weakness) => {
    const theme = classifyCoachingTheme(weakness);

    if (annotationThemes.has(theme)) {
      return false;
    }

    return true;
  });

  return dedupeByCoachingTheme(filtered, annotations.length ? 1 : 3);
}


function buildSpecificHintFromAnnotation(
  annotation,
  item = {},
  proReportNarratives = {}
) {
  const templates =
    proReportNarratives?.renderer?.specificHintFromAnnotation || {};

  const type =
    String(annotation?.type || "").toLowerCase();

  const dimension =
    String(annotation?.dimension || "").toLowerCase();

  const intent =
    String(item?.questionIntent || "").toLowerCase();

  if (type === "opportunity") {
    return templates.opportunity;
  }

  if (dimension === "ownership") {
    return templates.ownership;
  }

  if (dimension === "specificity") {
    return templates.specificity;
  }

  if (dimension === "evidence") {
    return templates.evidence;
  }

  if (dimension === "structure") {
    return templates.structure;
  }

  if (dimension === "reflection") {
    return templates.reflection;
  }

  if (intent.includes("ruolo")) {
    return templates.roleIntent;
  }

  if (intent.includes("decisione")) {
    return templates.decisionIntent;
  }

  if (
    intent.includes("pressione") ||
    intent.includes("conflitto")
  ) {
    return templates.pressureIntent;
  }

  return "";
}



function selectUsefulImprovementHints(
  item,
  proReportNarratives = {}
) {
  const templates =
    proReportNarratives?.renderer?.usefulImprovementHint || {};

  const hints = ensureArray(item?.improvementHints);

  if (hints.length === 0) {
    return [];
  }

  const answerIndex = Number(item?.answerIndex || 1);

  const hasRecruiterRecovery =
    !!item?.recruiterRecoveryPrompt;

  const offTopicRisk =
    String(item?.offTopicRisk || "").toLowerCase();

  const shouldFilterAlignmentHints =
    hasRecruiterRecovery &&
    (
      offTopicRisk === "high" ||
      offTopicRisk === "medium"
    );

  function normalizeHint(hint) {
    const lower = String(hint || "").toLowerCase();

    if (
      lower.includes("aggiungi una situazione concreta con contesto, azione e risultato") ||
      lower.includes("aggancia la risposta a un caso preciso")
    ) {
      if (answerIndex <= 2) {
        return templates.concreteEarly;
      }

      if (answerIndex <= 4) {
        return answerIndex % 2 === 0
          ? templates.concreteRepeatedEven
          : templates.concreteRepeatedOdd;
      }

      return templates.concretePersistent;
    }

    if (
      lower.includes("inserisci un outcome") ||
      lower.includes("una metrica") ||
      lower.includes("un effetto visibile")
    ) {
      if (answerIndex <= 2) {
        return templates.outcomeEarly;
      }

      if (answerIndex <= 4) {
        return templates.outcomeRepeated;
      }

      return templates.outcomePersistent;
    }

    if (
      lower.includes("responsabilità") ||
      lower.includes("responsabilita") ||
      lower.includes("dipendeva davvero da te")
    ) {
      if (answerIndex <= 2) {
        return templates.ownershipEarly;
      }

      if (answerIndex <= 4) {
        return templates.ownershipRepeated;
      }

      return templates.ownershipPersistent;
    }

    if (
      lower.includes("hai già una base chiara") ||
      lower.includes("hai gia una base chiara") ||
      lower.includes("elemento più specifico o verificabile") ||
      lower.includes("elemento piu specifico o verificabile")
    ) {
      return templates.makeVerifiable;
    }

    return hint;
  }

  const recoveryPatterns = [
    "collegato meglio alla domanda",
    "collegata meglio alla domanda",
    "resta sul punto",
    "punto richiesto",
    "punto preciso richiesto",
    "riallinea la risposta",
    "prima di migliorare lo stile",
    "perché è rilevante",
    "perche e rilevante"
  ];

  const normalized = hints
    .map((hint) => normalizeHint(hint))
    .filter(Boolean)
    .filter((hint) => {
      if (!shouldFilterAlignmentHints) {
        return true;
      }

      const lower = String(hint || "").toLowerCase();

      return !recoveryPatterns.some((pattern) =>
        lower.includes(pattern)
      );
    });

  return normalized.slice(0, 4);
}

function getDisplayAnswerSummary(
  item = {},
  proReportNarratives = {}
) {
  const templates =
    proReportNarratives?.renderer?.displayAnswer || {};

  const type =
    String(item?.problematicAnswerType || "").toLowerCase();

  if (type === "duplicate") {
    return templates.duplicateSummary;
  }

  return text(
    item?.summary,
    templates.summaryFallback
  );
}

function getDisplayQuestionAlignment(
  item = {},
  proReportNarratives = {}
) {
  const templates =
    proReportNarratives?.renderer?.displayAnswer || {};

  const type =
    String(item?.problematicAnswerType || "").toLowerCase();

  if (type === "duplicate") {
    return templates.duplicateQuestionAlignment;
  }

  return humanizeOffTopicRisk(text(item?.offTopicRisk, "low"));
}


function renderCvSupportDetails(cvSupportRead = {}) {
  const usableSignals = ensureArray(cvSupportRead?.usableSignals);
  const credibilityBridge = text(cvSupportRead?.credibilityBridge, "");
  const positioningHint = text(cvSupportRead?.positioningHint, "");

  const hasContent =
    usableSignals.length > 0 ||
    credibilityBridge ||
    positioningHint;

  if (!hasContent) {
    return "";
  }

  return `
    <details
      class="fr-situation-details fr-answer-cv-support-details"
      ontoggle="
        var label=this.querySelector('[data-open-label]');
        if(label){label.textContent=this.open ? 'Chiudi' : 'Apri';}
      "
    >
      <summary class="fr-situation-summary fr-answer-cv-support-summary">
        <span>Segnali CV utili</span>
        <strong data-open-label class="fr-situation-summary-button">Apri</strong>
      </summary>

      <div class="fr-situation-details-body fr-answer-cv-support-body">
        ${renderCvSupportReadBox(cvSupportRead)}
      </div>
    </details>
  `;
}

function renderWorkspaceAnswerPanel(item, isActive = false, context = {}) {
  const score = Number(item?.score ?? 0);
  const questionIndex = item?.answerIndex || 0;
  const scoreClass = score >= 75 ? "good" : score >= 50 ? "mid" : "weak";


  const inspirationalAnswerDraft =
  buildInspirationalAnswerDraft(
    item,
    context?.proReportNarratives || {}
  );
  return `
    <div
      class="answer-tab-panel ${isActive ? "is-active" : ""}"
      data-answer-panel="${escapeHtml(String(questionIndex))}"
    >

      <details class="workspace-qa-details fr-answer-qa-details">
        <summary class="fr-answer-qa-summary">
          <span class="workspace-details-label">
            <span class="details-label-closed">Apri domanda e risposta ${questionIndex}</span>
            <span class="details-label-open">Chiudi domanda e risposta ${questionIndex}</span>
          </span>

          <span class="workspace-summary-score workspace-summary-score-${scoreClass}">
            ${escapeHtml(String(score))}/100
          </span>
        </summary>

        <div class="workspace-qa-content compact fr-answer-qa-content">
          <div class="workspace-question-box compact fr-card fr-answer-question-box">
            <div class="qa-question-label compact-label">Domanda ${escapeHtml(String(questionIndex))}</div>
            <div class="qa-question-text compact fr-text">
              ${escapeHtml(text(item?.questionText, "Domanda non disponibile"))}
            </div>
          </div>

          <div class="workspace-answer-box compact fr-card fr-answer-original-box">
            <div class="qa-answer-label compact-label">Risposta ${escapeHtml(String(questionIndex))}</div>
            <div class="qa-answer-text compact-scroll fr-text">
              ${escapeHtml(text(item?.answerText, "Risposta non disponibile"))}
            </div>
          </div>
        </div>
      </details>

      <section class="fr-card fr-answer-reading-box">
        <div class="fr-title-primary">
          Lettura sintetica della risposta
        </div>

        <p class="fr-text fr-answer-summary-text">
          ${escapeHtml(
          getDisplayAnswerSummary(
            item,
            context?.proReportNarratives || {}
          )
        )}
        </p>

        <div class="fr-answer-first-correction">
          <div class="fr-pill fr-pill-risk">
            Punto da correggere per primo
          </div>

          <div class="fr-answer-first-correction-text">
            ${escapeHtml(
          humanizeProblematicAnswerType(
           text(item?.problematicAnswerType, "none"),
          item,
           context?.proReportNarratives || {}
             )
            )}
          </div>
        </div>

        ${item?.contextLinkNote ? `
          <div class="fr-note fr-answer-context-note">
            <div class="fr-answer-mini-title">Collegamento con apertura e CV</div>
            <div class="fr-text">
              ${escapeHtml(item.contextLinkNote)}
            </div>
          </div>
        ` : ""}

        ${renderQuestionAlignmentAlert(item, context)}


        ${renderCapabilityBlock(
        context,
         "showRecruiterPanel",
         () => renderRecruiterPanel(item, context)
        )}



        ${renderDuplicateAnswerWarning(item)}
        ${renderCvSupportDetails(item?.cvSupportRead)}
      </section>

      ${renderCapabilityBlock(
  context,
  "showDetailedAnswerWorkspace",
  () => `
      <details
        class="workspace-analysis-details fr-situation-details fr-answer-analysis-details"
        ontoggle="
          var label=this.querySelector('[data-analysis-open-label]');
          if(label){label.textContent=this.open ? 'Chiudi' : 'Apri';}
        "
      >
        <summary class="fr-situation-summary">
          <span>Analisi dettagliata della risposta</span>
          <strong data-analysis-open-label class="fr-situation-summary-button">Apri</strong>
        </summary>

        <div class="fr-situation-details-body">
          <div class="cv-parsed-content">

            <div class="answer-card-grid fr-answer-detail-grid">

              <div class="answer-subcard workspace-analysis-column">

                <div class="workspace-column-main-title">Analisi della risposta</div>

                <div class="workspace-block workspace-block-after-title">
                  <div class="answer-subcard-title">Dettagli rilevanti della risposta</div>
                  ${renderAnswerSegments(item)}
                </div>

                <div class="workspace-block workspace-block-risk">
                  <div class="answer-subcard-title risk-title-strong">Aspetti che oggi indeboliscono la risposta</div>
                  ${renderWeaknessNarrativeList(selectSecondaryWeaknesses(item))}
                </div>

                ${renderMissingAnswerSignalsBox(item?.cvSupportRead)}

                ${ensureArray(item?.strengths).length > 0 ? `
                  <div class="workspace-block workspace-block-positive">
                    <div class="answer-subcard-title">Altri elementi che aiutano la risposta</div>

                    ${renderList(
                      ensureArray(item?.strengths).slice(0, 3),
                      ""
                    )}
                  </div>
                ` : ""}

              </div>

              <div class="answer-subcard workspace-advice-column">

                <div class="workspace-column-main-title">Come puoi rafforzarla</div>

                ${renderImprovementNarrativeList(
                  selectUsefulImprovementHints(
                    item,
                    context?.proReportNarratives || {}
                  )
                )}

                <div class="improved-answer-highlight">
                  <div class="improved-answer-title">Come potrebbe suonare meglio</div>

                  <div class="improved-answer-text">
                    ${escapeHtml(
                        buildTemplateImprovedAnswer(
                        item,
                        context?.proReportNarratives || {}
                            )
                        )}
                  </div>

                  ${inspirationalAnswerDraft ? `
  <div class="inspiration-answer-box">
    <div class="inspiration-answer-label">Spunto di risposta</div>
    <div class="inspiration-answer-text">
      ${escapeHtml(inspirationalAnswerDraft)}
    </div>
  </div>
` : `
  <div class="inspiration-answer-box is-good-answer">
    <div class="inspiration-answer-label">Risposta già solida</div>
    <div class="inspiration-answer-text">
      In questo caso non serve riscrivere la risposta da zero: conviene solo aggiungere, se disponibile, un dettaglio concreto in più.
    </div>
  </div>
`}


                </div>

                <div class="premium-soft-note">
                  <strong>PREMIUM</strong>
                  Puoi riscrivere la risposta, confrontare la nuova versione con quella iniziale e misurare il miglioramento con una nuova analisi.
                </div>

              </div>

            </div>

          </div>
        </div>
      </details>
    `
    )}




    </div>
  `;
}

function humanizeCvUsefulSignal(value) {
  const clean = String(value || "").trim();
  const lower = clean.toLowerCase();

  if (!clean) return "";

  if (lower.includes("analisi") || lower.includes("dati") || lower.includes("data")) {
    return `Esperienze utili di analisi dati da collegare meglio alla risposta`;
  }

  if (lower.includes("report")) {
    return `Esperienze di reporting già presenti nel CV, da trasformare in esempio concreto`;
  }

  if (lower.includes("process")) {
    return `Esperienze su processi o miglioramento operativo da rendere più esplicite`;
  }

  if (lower.includes("comunicazione") || lower.includes("stakeholder")) {
    return `Interazioni con stakeholder o comunicazione interna da usare come contesto reale`;
  }

  if (lower.includes("sql") || lower.includes("tableau") || lower.includes("power bi")) {
    return `Strumenti e competenze tecniche già spendibili, se collegati a un risultato`;
  }

  return `Segnale utile dal CV: ${clean}`;
}

function humanizeCvMissingSignal(value) {
  const clean = String(value || "").trim();
  const lower = clean.toLowerCase();

  if (!clean) return "";

  if (lower.includes("responsabilità")) {
    return "Non emerge ancora con chiarezza quale fosse la responsabilità personale diretta";
  }

  if (lower.includes("durata")) {
    return "Manca un riferimento temporale che renda più credibile il percorso raccontato";
  }

  if (lower.includes("ruolo") || lower.includes("contesto")) {
    return "Serve chiarire meglio ruolo ricoperto e contesto operativo";
  }

  if (lower.includes("risultati") || lower.includes("impatti")) {
    return "Mancano risultati o impatti osservabili a sostegno della risposta";
  }

  if (lower.includes("lasciare indietro") || lower.includes("trade")) {
    return "Va esplicitato meglio che cosa è stato scelto e che cosa è stato lasciato indietro";
  }

  if (lower.includes("persone") || lower.includes("funzioni") || lower.includes("stakeholder")) {
    return "Vanno rese più leggibili le persone o funzioni coinvolte";
  }

  return `Elemento da chiarire: ${clean}`;
}

function renderRecruiterPanel(item = {}, context = {}) {
  const recoveryHtml = renderRecruiterRecoveryPrompt(item);
  const patternNote = item?.coachingPatternNote || "";

  if (!recoveryHtml && !patternNote) {
    return "";
  }

  return `
    <div class="fr-recruiter-panel">
      <div class="fr-recruiter-panel-title">
        Il pannello del recruiter
      </div>

      <div class="fr-recruiter-panel-subtitle">
        Ecco come un recruiter leggerebbe questa risposta nel contesto del colloquio.
      </div>

      ${recoveryHtml}

      ${patternNote && isCapabilityEnabled(context, "showPatternMemory") ? `
        <div class="fr-note fr-answer-pattern-note fr-recruiter-pattern-note">
          <div class="fr-answer-mini-title">
            Pattern che sta notando
          </div>

          <div class="fr-text">
            ${escapeHtml(patternNote)}
          </div>
        </div>
      ` : ""}
    </div>
  `;
}

function renderCvSupportNarrativeList(items = [], type = "useful") {
  const values = ensureArray(items)
    .map((item) =>
      type === "missing"
        ? buildCvMissingSignalView(item)
        : buildCvUsefulSignalView(item)
    )
    .filter(Boolean)
    .slice(0, 4);

  if (!values.length) {
    return `<p class="muted">Non emergono elementi specifici.</p>`;
  }

  const statusClass = type === "missing" ? "missing" : "useful";
  const icon = type === "missing" ? "−" : "+";

  return `
    <div class="fr-cv-support-list fr-cv-support-list-${statusClass}">
      ${values.map((item) => `
        <div class="fr-cv-support-item">
          <span class="fr-cv-support-dot">${icon}</span>

          <span class="fr-cv-support-text">
            <strong>${escapeHtml(item.label)}</strong>
            <span> — ${escapeHtml(item.hint)}</span>
          </span>
        </div>
      `).join("")}
    </div>
  `;
}

function buildCvUsefulSignalView(value) {
  const clean = String(value || "").trim();
  const lower = clean.toLowerCase();

  if (!clean) return null;

  if (lower.includes("analisi") || lower.includes("dati") || lower.includes("data")) {
    return {
      label: "Analisi dati",
      hint: "da collegare a una decisione, un problema risolto o un risultato osservabile"
    };
  }

  if (lower.includes("report")) {
    return {
      label: "Reporting",
      hint: "da trasformare in esempio operativo, non solo in attività descritta"
    };
  }

  if (lower.includes("process")) {
    return {
      label: "Miglioramento processi",
      hint: "utile se raccontato con contesto, vincoli e impatto"
    };
  }

  if (lower.includes("comunicazione") || lower.includes("stakeholder")) {
    return {
      label: "Stakeholder / comunicazione",
      hint: "da usare per mostrare coordinamento, confronto o gestione di attriti"
    };
  }

  if (lower.includes("sql") || lower.includes("tableau") || lower.includes("power bi")) {
    return {
      label: clean,
      hint: "competenza spendibile se collegata a un output o a una decisione"
    };
  }

  return {
    label: clean,
    hint: "segnale utile, da collegare meglio alla risposta"
  };
}



function renderImprovementNarrativeList(items = []) {
  const values = ensureArray(items).filter(Boolean).slice(0, 4);

  if (!values.length) {
    return `<p class="muted">Non emergono suggerimenti operativi aggiuntivi.</p>`;
  }

  return `
    <div class="fr-answer-improvement-list">
      ${values.map((item) => `
        <div class="fr-answer-improvement-item">
          <span class="fr-answer-improvement-dot">→</span>
          <span class="fr-answer-improvement-text">${escapeHtml(item)}</span>
        </div>
      `).join("")}
    </div>
  `;
}

function renderWeaknessNarrativeList(items = []) {
  const values = ensureArray(items).filter(Boolean).slice(0, 4);

  if (!values.length) {
    return `<p class="muted">I punti principali sono già evidenziati nella lettura sintetica.</p>`;
  }

  return `
    <div class="fr-answer-weakness-list">
      ${values.map((item) => `
        <div class="fr-answer-weakness-item">
          <span class="fr-answer-weakness-dot">−</span>
          <span class="fr-answer-weakness-text">${escapeHtml(item)}</span>
        </div>
      `).join("")}
    </div>
  `;
}

function buildCvMissingSignalView(value) {
  const clean = String(value || "").trim();
  const lower = clean.toLowerCase();

  if (!clean) return null;

  if (lower.includes("bi specifici") || lower.includes("strumenti bi")) {
    return {
      label: "Dettaglio tecnico da usare solo se serve",
      hint: "non inserirlo in ogni risposta: conta solo se la domanda riguarda strumenti, dati o reporting"
    };
  }

  if (lower.includes("responsabilità") || lower.includes("personale")) {
    return {
      label: "Ruolo personale",
      hint: "far capire quale parte della decisione o dell’azione dipendeva davvero da te"
    };
  }

  if (lower.includes("ruolo") || lower.includes("contesto")) {
    return {
      label: "Contesto della situazione",
      hint: "spiegare dove eri, con quale responsabilità e dentro quale vincolo"
    };
  }

  if (lower.includes("trade") || lower.includes("lasciare indietro") || lower.includes("sacrificata")) {
    return {
      label: "Scelta fatta e rinuncia",
      hint: "dire chiaramente cosa hai scelto, cosa hai lasciato fuori e perché"
    };
  }

  if (lower.includes("criterio")) {
    return {
      label: "Criterio di scelta",
      hint: "spiegare quale logica hai usato per decidere"
    };
  }

  if (lower.includes("effetto") || lower.includes("risultati") || lower.includes("impatti")) {
    return {
      label: "Effetto concreto",
      hint: "mostrare cosa è cambiato dopo la scelta"
    };
  }

  if (lower.includes("trasferibilità") || lower.includes("ponte")) {
    return {
      label: "Collegamento al ruolo target",
      hint: "far vedere perché quell’esperienza rende più credibile il passaggio verso questo ruolo"
    };
  }

  if (lower.includes("esempio concreto") || lower.includes("collegato al cv")) {
  return {
    label: "Esempio concreto",
    hint: "porta un episodio reale e spiegane il collegamento con la domanda"
  };
}

if (lower.includes("risultato osservabile")) {
  return {
    label: "Risultato osservabile",
    hint: "mostra l’effetto prodotto, anche in modo semplice"
  };
}



  if (lower.includes("persone") || lower.includes("funzioni") || lower.includes("stakeholder")) {
    return {
      label: "Persone coinvolte",
      hint: "rendere chiari interlocutori, funzioni o resistenze gestite"
    };
  }

  return {
  label: clean,
  hint: "da trasformare in un punto concreto e collegato alla domanda"
  };
}

function renderMissingAnswerSignalsBox(cvSupportRead = {}) {
  const missingSignals = ensureArray(cvSupportRead?.missingSignals).slice(0, 4);

  if (!missingSignals.length) {
    return "";
  }

  const values = missingSignals
    .map((item) => buildCvMissingSignalView(item))
    .filter(Boolean);

  return `
    <div class="workspace-block workspace-block-risk fr-answer-missing-box">
      <div class="answer-subcard-title risk-title-strong">
        Cosa manca nella risposta
      </div>

      <div class="fr-answer-missing-list">
        ${values.map((item) => `
          <div class="fr-answer-missing-item">
            <span class="fr-answer-weakness-dot">−</span>

            <span class="fr-answer-missing-content">
              <span class="fr-answer-missing-label">${escapeHtml(item.label)}</span>
              <span class="fr-answer-missing-hint">${escapeHtml(item.hint)}</span>
            </span>
          </div>
        `).join("")}
      </div>
    </div>
  `;
}

function renderCvSupportReadBox(cvSupportRead = {}) {
  const usableSignals = ensureArray(cvSupportRead?.usableSignals).slice(0, 4);
  const credibilityBridge = text(cvSupportRead?.credibilityBridge, "");
  const positioningHint = text(cvSupportRead?.positioningHint, "");

  const hasUsefulContent =
    usableSignals.length > 0 ||
    credibilityBridge ||
    positioningHint;

  if (!hasUsefulContent) {
    return "";
  }

  return `
    <div class="cv-support-read-box fr-cv-support-read-box">

      ${(credibilityBridge || positioningHint) ? `
        <div class="fr-cv-support-coach-box">
          <div class="fr-cv-support-coach-title">
            Come usare il CV in questa risposta
          </div>

          ${credibilityBridge ? `
            <div class="fr-cv-support-coach-text">
              ${escapeHtml(credibilityBridge)}
            </div>
          ` : ""}

          ${positioningHint ? `
            <div class="fr-cv-support-coach-text fr-cv-support-coach-text-secondary">
              ${escapeHtml(positioningHint)}
            </div>
          ` : ""}
        </div>
      ` : ""}

      ${usableSignals.length > 0 ? `
        <div class="fr-cv-support-signals-box">
          <div class="fr-cv-support-signals-title">
            Punti del CV che puoi richiamare
          </div>

          <div class="fr-cv-support-signals-intro">
            Non vanno ripetuti come elenco: scegli quello più adatto alla domanda e trasformalo in un episodio concreto.
          </div>

          <div class="cv-support-grid fr-cv-support-grid">
            <div class="cv-support-column cv-support-good fr-cv-support-column">
              ${renderCvSupportNarrativeList(usableSignals, "useful")}
            </div>
          </div>
        </div>
      ` : ""}

    </div>
  `;
}

function renderOpeningStrengthList(items = []) {
  const values = ensureArray(items).filter(Boolean).slice(0, 3);

  if (!values.length) {
    return `<p class="muted">Non emergono ancora elementi già spendibili.</p>`;
  }

  return `
    <div class="opening-strength-list">
      ${values.map((item) => `
        <div class="opening-strength-item">
          <span class="opening-strength-dot"></span>
          <span>${escapeHtml(item)}</span>
        </div>
      `).join("")}
    </div>
  `;
}

function renderWeightedList(items = []) {
  return items.map((text, index) => {
    const level = index === 0 ? "high" : index === 1 ? "mid" : "low";

    return `
      <div class="weighted-item ${level}">
        <span class="weighted-priority-dot ${level}"></span>
        <span class="weighted-text">${escapeHtml(text)}</span>
      </div>
    `;
  }).join("");
}

function renderOpeningPositioningModule(module) {
  const opening = module?.data || {};

  return `
    <div class="overview-pro-block overview-opening-block fr-section-stack" data-fr-section="opening">

      <div class="fr-title-primary opening-main-title-v09">
        <span>Apertura del colloquio</span>

        <button
          type="button"
          onclick="var p=document.querySelector('[data-situation-panel=&quot;opening&quot;]'); if(p){p.style.display='none';}"
          class="fr-close-button"
        >
          Chiudi
        </button>
      </div>

      <div class="fr-note">
        Qui trovi come il racconto iniziale viene percepito, quali segnali del CV possono renderlo più credibile e come impostare un’apertura più forte.
      </div>

      <div class="fr-section-nav" data-fr-section-nav="opening">
        <button type="button" class="fr-section-chip is-active" data-fr-open-panel="story">Racconto</button>
        <button type="button" class="fr-section-chip" data-fr-open-panel="cv">CV</button>
        <button type="button" class="fr-section-chip" data-fr-open-panel="coach">Come impostarla</button>
      </div>

      <section class="fr-card fr-nav-panel is-open" data-fr-panel="story">
        <button type="button" class="fr-panel-title" data-fr-toggle-panel="story">
          Lettura del tuo racconto
        </button>

        <div class="fr-panel-body">
          ${opening?.openingAssessment ? `
            <div class="fr-note opening-assessment-v09">
              ${escapeHtml(opening.openingAssessment)}
            </div>
          ` : ""}

          ${renderOpeningCreditBox(opening)}

          <div class="overview-reading-grid opening-reading-grid-v09">
            <div class="fr-card opening-reading-item-v09">
              <div class="opening-reading-label-v09">Impressione iniziale</div>
              <div class="fr-text">
                ${escapeHtml(humanizeNarrativeStyle(opening?.narrativeStyle))}
              </div>
            </div>

            <div class="fr-card opening-reading-item-v09">
              <div class="opening-reading-label-v09">Chiarezza del percorso</div>
              <div class="fr-text">
                ${escapeHtml(humanizeContinuityRead(opening?.continuityRead))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="fr-card fr-nav-panel" data-fr-panel="cv">
        <button type="button" class="fr-panel-title" data-fr-toggle-panel="cv">
          Lettura del CV come base di credibilità
        </button>

        <div class="fr-panel-body">
          <div class="opening-subsection-v09">
            <div class="fr-pill fr-pill-positive">Elementi già spendibili</div>
            ${renderOpeningStrengthList(ensureArray(opening?.strengths).slice(0, 3))}
          </div>

          <div class="opening-subsection-v09">
            
            


             <div class="fr-pill fr-pill-risk">Punti da spiegare meglio</div>
           
             ${renderWeightedList(ensureArray(opening?.risks).slice(0, 3))}


            
          </div>
        </div>
      </section>

      <section class="fr-card fr-nav-panel" data-fr-panel="coach">
        <button type="button" class="fr-panel-title" data-fr-toggle-panel="coach">
          Come impostare l’apertura del colloquio
        </button>

        <div class="fr-panel-body">
          ${renderWeightedList(ensureArray(opening?.improvements).slice(0, 4))}

          <div class="overview-pitch-box opening-pitch-v09">
            <div class="overview-pitch-label">Esempio di apertura</div>

            <div class="overview-pitch-text">
              ${escapeHtml(opening?.shortPitchExample || "")}
            </div>

            <div class="overview-pitch-note">
              … completa questo spunto con una o due esperienze concrete del tuo CV che rendano credibile il passaggio verso il ruolo target.
            </div>
          </div>
        </div>
      </section>

    </div>
  `;
}

function renderCvFitBadge(label, score = 0, isRisk = false) {
  const normalized = Math.max(0, Math.min(100, Number(score || 0)));
  const level = normalized >= 70 ? "high" : normalized >= 40 ? "mid" : "low";

  return `
    <div class="cv-fit-badge ${isRisk ? "risk" : ""} ${level}">
      <div class="cv-fit-label">${label}</div>
      <div class="cv-fit-bar">
        <div class="cv-fit-fill" style="width:${normalized}%"></div>
      </div>
    </div>
  `;
}




function humanizeNarrativeStyle(value) {
  const clean = String(value || "").toLowerCase();

  if (clean.includes("descrittivo")) {
    return "Il racconto sembra ordinato, ma rischia di restare un po’ descrittivo: spiega cosa hai fatto, però deve far capire meglio perché quelle esperienze ti rendono credibile per il ruolo target.";
  }

  if (clean.includes("tecnico")) {
    return "Il racconto appare tecnico: può aiutare se il ruolo richiede competenza specifica, ma va collegato subito al valore che puoi portare nel ruolo.";
  }

  if (clean.includes("dispersivo")) {
    return "Il racconto rischia di disperdersi: conviene scegliere pochi passaggi forti e usarli per costruire un filo chiaro.";
  }

  return "Il racconto iniziale va reso più intenzionale: non deve solo riassumere il CV, ma orientare subito l’intervistatore verso il ruolo target.";
}

function humanizeContinuityRead(value) {
  const clean = String(value || "").toLowerCase();

  if (clean.includes("parzialmente")) {
    return "Il percorso si capisce, ma non è ancora raccontato come una traiettoria pienamente lineare. Conviene spiegare meglio il filo che collega esperienze, competenze maturate e ruolo target.";
  }

  if (clean.includes("lineare")) {
    return "Il percorso appare abbastanza lineare: ora va solo raccontato scegliendo i passaggi più utili per il ruolo target, senza perdersi in dettagli secondari.";
  }

  if (clean.includes("framment")) {
    return "Il percorso può sembrare frammentato: è importante preparare una spiegazione semplice dei passaggi, dei cambi e del filo logico che li collega.";
  }

  return "Il percorso del CV va chiarito meglio: chi ascolta deve capire rapidamente da dove arrivi, che cosa hai costruito e perché questo ruolo è il passo successivo.";
}

function renderBlockingPrioritiesModule(module) {
  const proReportNarratives = {};

  const priorities = module?.data || {};


  const rewrittenPriorities = ensureArray(priorities?.items).map((item) => ({
    ...item,
    description: rewritePriorityText(
  item?.description,
  proReportNarratives
      )
  }));

  return `
    <div class="overview-pro-block overview-priority-block">

      
      <div class="overview-pro-note">
        Non sono singole frasi da correggere: sono abitudini di risposta che riducono forza e credibilità del profilo.
      </div>

      <div class="priority-list compact-priority-list">
        ${rewrittenPriorities.length > 0
          ? rewrittenPriorities.map((item, index) => `
            <div class="priority-item overview-priority-item compact">
              <div class="priority-index">${index + 1}</div>
              <div class="priority-text">${escapeHtml(text(item?.description, "—"))}</div>
            </div>
          `).join("\n")
          : `<p class="muted">Non emergono ancora priorità bloccanti sintetizzate.</p>`
        }
      </div>
    </div>
  `;
}

function renderRecruiterRecoveryPrompt(item = {}) {
  const recovery = item?.recruiterRecoveryPrompt;

  if (!recovery || typeof recovery !== "object") {
    return "";
  }

  const severity = String(recovery?.severity || "medium").toLowerCase();

  return `
    <div class="fr-recruiter-recovery fr-recruiter-recovery-${escapeHtml(severity)}">
      <div class="fr-recruiter-recovery-label">
        ${escapeHtml(recovery?.title || "Come ti avrebbe fermato un recruiter")}
      </div>

      <div class="fr-recruiter-recovery-prompt">
        “${escapeHtml(recovery?.prompt || "")}”
      </div>

      <div class="fr-recruiter-recovery-expected">
        <strong>Cosa dovrebbe cambiare nella seconda risposta:</strong>
        ${escapeHtml(recovery?.expected || "")}
      </div>
    </div>
  `;
}


function renderQuestionAlignmentAlert(
  item = {},
  context = {}
) {
  const baseText = getDisplayQuestionAlignment(
  item,
  context?.proReportNarratives || {}
  );
  const offTopicRisk = String(item?.offTopicRisk || "").toLowerCase();
  const score = Number(item?.score ?? 0);
  const answerIndex = Number(item?.answerIndex || 0);

  const isRisk = offTopicRisk === "high" || score < 45;
  const isWarn = !isRisk && score < 65;

  const statusClass = isRisk ? "risk" : isWarn ? "warn" : "good";

  let displayText = baseText;

  if (String(baseText || "").toLowerCase().includes("rischia di non rispondere")) {
    const variants =
  context?.proReportNarratives?.renderer?.displayAnswer?.offTopicRiskVariants || [];

    const idx =
      Number.isFinite(answerIndex) && answerIndex > 0
        ? (answerIndex - 1) % variants.length
        : 0;

    displayText = variants[idx];
  }

  return `
    <div class="fr-question-alignment-alert fr-question-alignment-${statusClass}">
      <div class="fr-question-alignment-label">
        Aderenza alla domanda
      </div>

      <div class="fr-question-alignment-text">
        ${escapeHtml(displayText)}
      </div>
    </div>
  `;
}

function renderFeaturedAnswersModule(
  module,
  context = {}
) {
  const templates =
    context?.proReportNarratives?.renderer?.featuredAnswersModule || {};

  const featuredAnswers = module?.data || {};

  return `
    <div class="overview-pro-block">

      <div class="overview-standard-title">
        ${escapeHtml(templates.title)}
      </div>

      <div class="overview-pro-note">
        ${escapeHtml(templates.note)}
      </div>

      <div class="answer-stack overview-answer-stack">
        ${ensureArray(featuredAnswers?.items).length > 0
          ? ensureArray(featuredAnswers.items)
            .map((item) => renderAnswerCard(item, context))
           .join("\n")
          : `<p class="muted">${escapeHtml(templates.empty)}</p>`
        }
      </div>
    </div>
  `;
}

function renderSensitiveQuestionsModule(module) {
  const sensitiveQuestions = module?.data || {};
  const sensitiveItems = ensureArray(sensitiveQuestions?.items);

  return `
    <div class="section-shell">
      <div class="section-shell-title">Punti delicati da preparare bene</div>
      <div class="section-shell-subtitle">
        Qui non trovi “voti”, ma i passaggi in cui conviene arrivare preparato: sono quelli dove una risposta vaga può indebolire anche un buon profilo.
      </div>

      <div class="grid-2">
        ${sensitiveItems.map((item) => `
          <section class="card ${toneFromSensitiveReadiness(item?.readinessLabel)}">
            <h3>${escapeHtml(text(item?.label, "Punto delicato"))}</h3>

            <div class="pill-row">
            ${renderPill(`Stato: ${text(item?.statusLabel, "—")}`, "neutral")}
             ${renderPill(`Priorità: ${text(item?.readinessLabel, "—")}`, "neutral")}
            </div>


            <p><strong>Perché ti conviene prepararlo bene</strong></p>
            <p>${escapeHtml(text(item?.whyItMatters, "—"))}</p>

            <p><strong>Da dove nasce questa lettura</strong></p>
            <p>${escapeHtml(text(item?.evidenceQuestionLabel, "—"))}</p>

            <p><strong>Come lo affronterei io al tuo posto</strong></p>
            <p>${escapeHtml(buildFriendlySensitiveAdvice(item))}</p>
          </section>
        `).join("\n")}
      </div>
    </div>
  `;
}

function buildFriendlySensitiveAdvice(item, {
  roleFamily = "care_helping_professions",
  locale = "it"
} = {}) {
  const type = String(item?.type || "").toLowerCase();
  const note = text(item?.note, "");

  const proReportNarratives = loadProReportNarrativeData({
    roleFamily,
    locale
  });

  const sensitiveAdvice =
    proReportNarratives?.sensitiveAdvice || {};

  return (
    sensitiveAdvice[type] ||
    note ||
    sensitiveAdvice.default ||
    "Preparerei questo punto con una risposta breve, concreta e collegata al ruolo target."
  );
}


function renderCvDocumentReadBox(read = {}) {
  if (!read || typeof read !== "object") {
    return "";
  }

  return `
    <section class="cv-document-read-box">
      <div class="cv-document-title">Lettura del CV come documento</div>

      <div class="cv-document-headline">
        ${escapeHtml(text(read?.headline, "Il CV contiene elementi utili, ma va reso più mirato al ruolo target."))}
      </div>

      <div class="cv-document-grid">
        <div class="cv-document-item">
          <div class="cv-document-label">Chiarezza del profilo</div>
          <div class="cv-document-text">${escapeHtml(text(read?.clarity, "Da chiarire meglio."))}</div>
        </div>

        <div class="cv-document-item">
          <div class="cv-document-label">Prove ed evidenze</div>
          <div class="cv-document-text">${escapeHtml(text(read?.evidence, "Da rafforzare con esempi."))}</div>
        </div>

        <div class="cv-document-item">
          <div class="cv-document-label">Punti da chiarire</div>
          <div class="cv-document-text">${escapeHtml(text(read?.risks, "Da verificare."))}</div>
        </div>

        <div class="cv-document-item">
          <div class="cv-document-label">Priorità di riscrittura</div>
          <div class="cv-document-text">${escapeHtml(text(read?.rewrite, "Rendere il CV più mirato."))}</div>
        </div>
      </div>
    </section>
  `;
}

function renderCvParsedProfileBox(cvSlim = {}) {
  const profile = cvSlim?.cvParsedProfileBox || {};
  const transitionPotential = cvSlim?.transitionPotential || {};

  if (!profile || typeof profile !== "object") {
    return "";
  }

  const transferableStrengths = ensureArray(profile?.transferableStrengths).slice(0, 5);
  const matchedSkills = ensureArray(profile?.matchedSkills).slice(0, 5);

  const missingSkills = ensureArray(cvSlim?.weakOrMissing)
    .map((item) => item?.label || item)
    .filter(Boolean)
    .slice(0, 5);

  const readiness = String(transitionPotential?.readinessLevel || "medium");
  const recoverability = String(transitionPotential?.recoverabilityLevel || "medium");

  return `
    <section class="overview-card overview-card-neutral strong" style="margin-top:14px;">

     <div style="width:calc(100% - 28px); min-height:44px; margin:0 auto 16px auto; padding:10px 16px; display:flex; align-items:center; justify-content:center; border-radius:10px; background:linear-gradient(180deg,#818cf8 0%,#4338ca 100%); border:1px solid rgba(255,255,255,0.26); color:#ffffff; font-size:18px; font-weight:900; line-height:1.2; text-align:center; box-shadow:inset 0 1px 0 rgba(255,255,255,0.22),0 2px 8px rgba(15,23,42,0.14);">
    Come FRINGE legge il tuo CV
    </div>
      <div class="cv-reading-main">
        <div class="cv-reading-main-label">
          Profilo percepito
        </div>

        <div class="cv-reading-main-role">
          ${escapeHtml(text(profile?.targetRole, "Ruolo non disponibile"))}
        </div>

        <div class="cv-reading-main-seniority">
     <span>Seniority percepita</span>
     <strong class="cv-seniority-badge">
     ${escapeHtml(text(profile?.seniority, "non disponibile"))}
         </strong>
        </div>


        <div class="cv-reading-summary" style="margin-top:12px;">
          ${escapeHtml(
            text(
              profile?.summary,
              "Il sistema non è riuscito a costruire una sintesi leggibile del profilo."
            )
          )}
        </div>
      </div>

      <div class="cv-profile-snapshot-grid">

  <section class="cv-snapshot-card cv-snapshot-good">
    <div class="cv-snapshot-title">Leve forti del profilo</div>

    ${renderList(
      transferableStrengths,
      "Non emergono ancora leve forti chiaramente trasferibili."
    )}
  </section>

  <section class="cv-snapshot-card cv-snapshot-compatible">
    <div class="cv-snapshot-title">Competenze compatibili col ruolo</div>

    ${renderList(
      matchedSkills,
      "Non emergono ancora elementi fortemente coerenti col ruolo target."
    )}
  </section>

  <section class="cv-snapshot-card cv-snapshot-risk">
    <div class="cv-snapshot-title">Gap o elementi poco leggibili</div>
    
    ${renderList(
      missingSkills,
      "Non emergono gap sintetizzati."
    )}
  </section>

  <section class="cv-snapshot-card cv-snapshot-potential">
    <div class="cv-snapshot-title">Potenziale di transizione</div>

    <div class="cv-potential-row">
      <div class="cv-potential-label">Vicinanza attuale al ruolo</div>
      <span class="transition-potential-badge level-${readiness}">
        ${escapeHtml(humanizePotentialLevel(readiness))}
      </span>
    </div>

    <div class="cv-potential-row">
      <div class="cv-potential-label">Recuperabilità dei gap</div>
      <span class="transition-potential-badge level-${recoverability}">
        ${escapeHtml(humanizePotentialLevel(recoverability))}
      </span>
    </div>
  </section>

</div>

${renderCvTransitionBalance({
  readiness,
  recoverability,
  missingSkillsCount: missingSkills.length,
  strengthsCount: transferableStrengths.length + matchedSkills.length
})}




    </section>
  `;
}

function renderCvTransitionBalance({
  readiness = "medium",
  recoverability = "medium",
  missingSkillsCount = 0,
  strengthsCount = 0
} = {}) {

  const positiveWeight =
    strengthsCount * 14 +
    (readiness === "high" ? 22 : readiness === "medium" ? 14 : 8) +
    (recoverability === "high" ? 14 : recoverability === "medium" ? 8 : 4);

  const negativeWeight =
    missingSkillsCount * 12;

  const total = Math.max(positiveWeight + negativeWeight, 1);

  const positivePercent = Math.max(
    18,
    Math.min(88, Math.round((positiveWeight / total) * 100))
  );

  const negativePercent = 100 - positivePercent;

  return `
    <section class="cv-transition-balance">

      <div class="cv-transition-balance-title">
        Solidità del passaggio verso il ruolo target
      </div>

      <div class="cv-transition-balance-bar">

        <div 
          class="cv-transition-balance-positive"
          style="width:${positivePercent}%;">
          ${positivePercent}%
        </div>

        <div 
          class="cv-transition-balance-negative"
          style="width:${negativePercent}%;">
          ${negativePercent}%
        </div>

      </div>

      <div class="cv-transition-balance-legend">

        <div class="cv-transition-legend-good">
          <span></span>
          basi già credibili per il ruolo
        </div>

        <div class="cv-transition-legend-risk">
          <span></span>
          gap o aspetti ancora da rafforzare
        </div>

      </div>

    </section>
  `;
}


function humanizePotentialLevel(level) {
  const clean = String(level || "").toLowerCase();

  if (clean === "high") return "Alta";
  if (clean === "medium") return "Media";
  if (clean === "low") return "Bassa";

  return "Da chiarire";
}

function renderCvTargetWeaknessBox(cvSlim = {}) {
  const weakOrMissing = ensureArray(cvSlim?.weakOrMissing).slice(0, 4);
  const transitionFragilities = ensureArray(
    cvSlim?.alternativePositioning?.transitionFragilities
  ).slice(0, 4);

  if (!weakOrMissing.length && !transitionFragilities.length) {
    return "";
  }

  return `
    <section class="cv-target-weakness-box">

      <div class="cv-target-weakness-title">
        Punti da rafforzare per il ruolo target
      </div>

      <div class="cv-target-weakness-grid">

        <div class="cv-target-weakness-column">
          <div class="cv-target-weakness-subtitle">
            Cosa va spiegato meglio
          </div>

          ${renderCvSignalCards(
            weakOrMissing,
            "Non emergono ancora gap sintetizzati."
          )}
        </div>

        <div class="cv-target-weakness-column">
          <div class="cv-target-weakness-subtitle">
            Cosa indebolisce il passaggio
          </div>

          <div class="alternative-fragility-pills">
            ${transitionFragilities.map((item) => `
              <span class="alternative-fragility-pill">
                ${escapeHtml(item)}
              </span>
            `).join("")}
          </div>
        </div>

      </div>

    </section>
  `;
}

function renderCvSlimModule(module) {
  const cvSlim = module?.data || {};

  return `
    <div class="overview-pro-block cv-pro-block">

      <div class="fringe-section-title fringe-title-blue">
    CV mirato al ruolo
    </div>

      ${renderCvDocumentReadBox(cvSlim?.cvDocumentRead)}
      ${renderCvParsedProfileBox(cvSlim)}

      ${renderCvDeepDiveMenu(cvSlim)}

    </div>
  `;
}

function renderCvDeepDiveMenu(cvSlim = {}) {
  return `
    <section class="cv-deep-dive-menu">

      <div class="cv-deep-dive-title">
        Approfondisci la lettura del CV
      </div>

      <div class="cv-deep-dive-subtitle">
        Apri solo i filoni che vuoi esplorare: gap, mitigazioni, potenziale, ruoli alternativi e uso del CV nel colloquio.
      </div>

      <details class="cv-deep-dive-item">
        <summary>Gap e rischi del passaggio verso il ruolo target</summary>
        <div class="cv-deep-dive-content">
          ${renderCvTargetWeaknessBox(cvSlim)}
        </div>
      </details>

      <details class="cv-deep-dive-item">
        <summary>Come mitigare i gap del CV</summary>
        <div class="cv-deep-dive-content">
          ${renderCvMitigationDeepDive(cvSlim)}
        </div>
      </details>

      <details class="cv-deep-dive-item">
        <summary>Ruoli alternativi o vicini</summary>
        <div class="cv-deep-dive-content">
          ${renderAlternativePositioningBox(cvSlim?.alternativePositioning)}
        </div>
      </details>

      <details class="cv-deep-dive-item">
        <summary>Uso del CV durante il colloquio</summary>
        <div class="cv-deep-dive-content">
          ${renderCvInterviewUseContent(cvSlim)}
        </div>
      </details>

      <details class="cv-deep-dive-item">
        <summary>CV originale caricato</summary>
        <div class="cv-deep-dive-content">
          ${renderOriginalCvContentOnly(cvSlim?.originalCv)}
        </div>
      </details>

    </section>
  `;
}

function renderCvInterviewUseContent(cvSlim = {}) {
  return `
    <p class="cv-pro-text">
      Questa sezione non valuta il CV come documento, ma suggerisce come usare le informazioni del CV per rendere più credibili apertura e risposte.
    </p>

    <div class="overview-card-grid overview-card-grid-2" style="margin-top:14px;">

      <section class="overview-card overview-card-neutral strong">
        <div style="width:calc(100% - 24px); min-height:42px; margin:0 auto 14px auto; padding:10px 14px; display:flex; align-items:center; justify-content:center; border-radius:10px; background:linear-gradient(180deg,#818cf8 0%,#4338ca 100%); border:1px solid rgba(255,255,255,0.24); color:#ffffff; font-size:16px; font-weight:900; line-height:1.2; text-align:center; box-shadow:inset 0 1px 0 rgba(255,255,255,0.18),0 2px 8px rgba(15,23,42,0.12);">
  Cosa usare nell’apertura
</div>

        <p class="cv-pro-text">
          ${escapeHtml(
            text(
              cvSlim?.openingUseNarrative,
              "Porta subito le esperienze più trasferibili e collegale al ruolo target."
            )
          )}
        </p>
      </section>

      <section class="overview-card overview-card-neutral strong">
        <div style="width:calc(100% - 24px); min-height:42px; margin:0 auto 14px auto; padding:10px 14px; display:flex; align-items:center; justify-content:center; border-radius:10px; background:linear-gradient(180deg,#818cf8 0%,#4338ca 100%); border:1px solid rgba(255,255,255,0.24); color:#ffffff; font-size:16px; font-weight:900; line-height:1.2; text-align:center; box-shadow:inset 0 1px 0 rgba(255,255,255,0.18),0 2px 8px rgba(15,23,42,0.12);">
     Cosa usare nelle risposte
    </div>

        ${renderList(
          ensureArray(cvSlim?.answerUseSuggestions).slice(0, 4),
          "Usa esempi concreti del CV per sostenere le risposte più deboli."
        )}
      </section>

    </div>
  `;
}


function renderCvMitigationDeepDive(cvSlim = {}) {
  return `
    <section class="overview-coach-box strong">
      <div class="overview-card-title">Come mitigare i punti deboli del CV</div>

      <p class="cv-pro-text" style="color:#ffffff; font-weight:700;">
        Questa parte non serve solo a “coprire” i gap: serve a costruire una strada credibile per ridurne il peso nella lettura del profilo.
      </p>

      ${renderList(
        ensureArray(cvSlim?.mitigationSuggestions).slice(0, 4),
        "Non emergono ancora strategie di mitigazione sintetizzate."
      )}

      <div class="overview-card-title" style="margin-top:16px;">
        Strade laterali per ridurre il peso dei gap
      </div>

      ${renderList(
        ensureArray(cvSlim?.lateralMitigationSuggestions).slice(0, 4),
        "Non emergono ancora strade laterali sintetizzate."
      )}

      <div class="premium-soft-note">
        <strong>PREMIUM</strong>
        Questa parte può evolvere in una 
        <span class="premium-emphasis">riscrittura guidata del CV</span>,
        con <span class="premium-emphasis">alternative di posizionamento</span>,
        strategie di mitigazione dei gap e suggerimenti più specifici sulle
        <span class="premium-emphasis">competenze da rafforzare</span>.
      </div>
    </section>
  `;
}

function renderOriginalCvContentOnly(originalCv) {
  const cvText = text(originalCv?.text, "");

  if (!cvText) {
    return `<p class="muted">CV originale non disponibile.</p>`;
  }

  return `
    <div class="cv-original-content">
      ${escapeHtml(cvText)}
    </div>
  `;
}

function renderTransitionFragilityStrip(items = []) {
  const transitionFragilities = ensureArray(items).slice(0, 4);

  if (!transitionFragilities.length) {
    return "";
  }

  return `
    <div class="alternative-fragility-strip" style="margin-top:14px;">
      <div class="alternative-fragility-strip-title">
        Punti che oggi indeboliscono il passaggio verso il ruolo target
      </div>

      <div class="alternative-fragility-pills">
        ${transitionFragilities.map((item) => `
          <span class="alternative-fragility-pill">
            ${escapeHtml(item)}
          </span>
        `).join("")}
      </div>
    </div>
  `;
}


function renderAlternativePositioningBox(alternativePositioning = {}) {
  const items = ensureArray(alternativePositioning?.items).slice(0, 4);
    const transitionFragilities = ensureArray(
    alternativePositioning?.transitionFragilities
  ).slice(0, 4);
  const headline = text(alternativePositioning?.headline, "");
  const roleTargetNote = text(alternativePositioning?.roleTargetNote, "");

  if (!headline && !roleTargetNote && items.length === 0) {
    return "";
  }

  return `
    <section class="alternative-positioning-box">
      <div class="alternative-positioning-kicker">Lettura laterale del profilo</div>
      <div class="alternative-positioning-title">
        Ruoli alternativi o vicini dove il profilo può risultare credibile
      </div>

      ${headline ? `
        <p class="alternative-positioning-headline">
          ${escapeHtml(headline)}
        </p>
      ` : ""}

      

      ${items.length > 0 ? `
        <div class="alternative-positioning-grid">
          ${items.map((item) => `
            <article class="alternative-positioning-card">
              <div class="alternative-positioning-card-top">
                <div class="alternative-positioning-card-title">
                  ${escapeHtml(text(item?.title, "Ruolo alternativo"))}
                </div>
                <span class="alternative-fit-badge">
                  ${escapeHtml(text(item?.fitLevel, "fit"))}
                </span>
              </div>

              <div class="alternative-positioning-card-label">
                Perché può funzionare
              </div>
              <p class="alternative-positioning-card-text">
                ${escapeHtml(text(item?.why, "Non disponibile."))}
              </p>

              <div class="alternative-positioning-card-label">
                Da rafforzare
              </div>
              <p class="alternative-positioning-card-text">
                ${escapeHtml(text(item?.toStrengthen, "Non disponibile."))}
              </p>
            </article>
          `).join("")}
        </div>
      ` : ""}

      <div class="premium-soft-note">
        <strong>PREMIUM</strong>
        Questa lettura può evolvere in una 
        <span class="premium-emphasis">mappa di riposizionamento professionale</span>,
        con ruoli target alternativi, gap recuperabili e priorità formative.
      </div>
    </section>
  `;
}


function renderCvInterviewUseBox(cvSlim = {}) {
  return `
    <details class="cv-parsed-profile-box" style="margin-top:16px;">
      <summary>
        Uso del CV durante il colloquio
      </summary>

      <div class="cv-parsed-content">

        <p class="cv-pro-text">
          Questa sezione non valuta il CV come documento, ma suggerisce come usare le informazioni del CV per rendere più credibili apertura e risposte.
        </p>

        <div class="overview-card-grid overview-card-grid-2" style="margin-top:14px;">

          <section class="overview-card overview-card-neutral strong">
            <div class="overview-card-title">Cosa usare nell’apertura</div>

            <p class="cv-pro-text">
              ${escapeHtml(
                text(
                  cvSlim?.openingUseNarrative,
                  "Porta subito le esperienze più trasferibili e collegale al ruolo target."
                )
              )}
            </p>
          </section>

          <section class="overview-card overview-card-neutral strong">
            <div class="overview-card-title">Cosa usare nelle risposte</div>

            ${renderList(
              ensureArray(cvSlim?.answerUseSuggestions).slice(0, 4),
              "Usa esempi concreti del CV per sostenere le risposte più deboli."
            )}
          </section>

        </div>

      </div>
    </details>
  `;
}




function renderOriginalCvBox(originalCv) {
  const cvText = text(originalCv?.text, "");

  if (!cvText) {
    return "";
  }

  return `
    <details class="cv-original-box">
      <summary>
        <span>CV originale caricato</span>
      </summary>

      <div class="cv-original-content">${escapeHtml(cvText)}</div>
    </details>
  `;
}

function renderTransitionPotentialBox(data = {}) {
  if (!data || typeof data !== "object") {
    return "";
  }

  const readiness = String(data?.readinessLevel || "medium");
  const recoverability = String(data?.recoverabilityLevel || "medium");

  return `
    <section class="transition-potential-box">

      <div class="transition-potential-title">
        Potenziale di transizione verso il ruolo
      </div>

      <p class="transition-potential-text">
        ${escapeHtml(text(data?.narrative, ""))}
      </p>

      <div class="transition-potential-grid">

        <div class="transition-potential-card">
          <div class="transition-potential-label">
            Vicinanza attuale al ruolo
          </div>

          <div class="transition-potential-badge level-${readiness}">
            ${escapeHtml(readiness)}
          </div>
        </div>

        <div class="transition-potential-card">
          <div class="transition-potential-label">
            Recuperabilità dei gap
          </div>

          <div class="transition-potential-badge level-${recoverability}">
            ${escapeHtml(recoverability)}
          </div>
        </div>

      </div>

      ${ensureArray(data?.structuralGaps).length > 0 ? `
        <div class="transition-potential-subtitle">
          Gap più strutturali
        </div>

        ${renderList(
          ensureArray(data?.structuralGaps).slice(0, 4),
          ""
        )}
      ` : ""}

      ${ensureArray(data?.recoverableGaps).length > 0 ? `
        <div class="transition-potential-subtitle">
          Gap probabilmente recuperabili
        </div>

        ${renderList(
          ensureArray(data?.recoverableGaps).slice(0, 4),
          ""
        )}
      ` : ""}

      <div class="premium-soft-note">
        <strong>PREMIUM</strong>
        Questa lettura può evolvere in una vera mappa di transizione professionale, con priorità formative, tempi di recupero e traiettorie alternative.
      </div>

    </section>
  `;
}


function renderFinalChecklistModule(module) {
  const finalChecklist = module?.data || {};
 

  return `
    
  
     
  `;
}

function renderOverviewSituationSection(modules = [], proReportV2 = {}) {

  const proReportNarratives =
  loadProReportNarrativeData({
    roleFamily:
      proReportV2?.roleFamily ||
      proReportV2?.professionalPerception?.roleFamily ||
      "care_helping_professions",
    locale:
      proReportV2?.locale ||
      proReportV2?.rawInput?.locale ||
      "it"
  }) || {};

const context = {
  proReportNarratives
};
  const safeModules = ensureArray(modules);

  const operational = safeModules.find((m) => m?.key === "operationalPriorities");
  const actionPlan = safeModules.find((m) => m?.key === "operationalActionPlan");
  const blocking = safeModules.find((m) => m?.key === "blockingPriorities");
  const opening = safeModules.find((m) => m?.key === "openingPositioning");
  const featured = safeModules.find((m) => m?.key === "featuredAnswers");
  const cvSlim = proReportV2?.overview?.cvSlim || {};

  const cvSummary = text(
    cvSlim?.candidateSummary,
    "Il CV contiene elementi utili, ma deve essere letto meglio rispetto al ruolo target."
  );

  const openingData = opening?.data || {};
  const openingAssessment = text(
    openingData?.openingAssessment || openingData?.message,
    "L’apertura è il primo punto in cui costruisci credibilità: deve rendere chiaro percorso, contesto, responsabilità e collegamento al ruolo target."
  );

  const featuredItems = ensureArray(featured?.data?.items);
  const scores = featuredItems
    .map((item) => Number(item?.score))
    .filter((value) => Number.isFinite(value));

  const avgScore =
    scores.length > 0
      ? Math.round(scores.reduce((sum, value) => sum + value, 0) / scores.length)
      : null;

  const weakAnswers = featuredItems.filter((item) => Number(item?.score || 0) < 50).length;

  const answerNarrative =
    avgScore !== null
      ? weakAnswers > 0
        ? `Le risposte mostrano passaggi da rafforzare: ${weakAnswers} risultano deboli o poco centrati. La media dei passaggi evidenziati è ${avgScore}/100.`
        : `Le risposte hanno una base leggibile, con una media dei passaggi evidenziati di ${avgScore}/100.`
      : "Le risposte vanno lette per qualità, aderenza alla domanda e capacità di costruire credibilità.";

  return `
    <div class="situation-shell">

      <section style="padding:18px; border-radius:18px; background:linear-gradient(180deg,#111827 0%,#1e1b4b 100%); border:2px solid #818cf8; box-shadow:0 10px 22px rgba(15,23,42,0.18);">

        <div style="width:calc(100% - 28px); margin:0 auto 14px auto; padding:10px 16px; border-radius:10px; background:linear-gradient(180deg,#818cf8 0%,#4338ca 100%); color:#ffffff; font-size:20px; font-weight:900; text-align:center;">
          Situazione attuale
        </div>

        <p style="margin:0; color:#e0e7ff; font-size:15px; line-height:1.55; font-weight:800; text-align:center;">
          Questa pagina riassume come FRINGE legge la candidatura: CV, apertura, risposte e tenuta complessiva verso il ruolo target.
        </p>
      </section>

      <section class="situation-snapshot-grid">

        <article style="padding:16px; border-radius:18px; background:#ecfdf5; border:2px solid #22c55e;">
          <div style="margin:0 auto 12px auto; padding:10px 14px; border-radius:10px; background:linear-gradient(180deg,#22c55e 0%,#15803d 100%); color:#fff; font-size:16px; font-weight:900; text-align:center;">
            Il tuo CV
          </div>
          <p style="font-size:14px; line-height:1.5; font-weight:700; color:#064e3b;">
            ${escapeHtml(cvSummary)}
          </p>
          <button
  data-report-nav="cv"
  type="button"
  style="
    width:100%;
    min-height:44px;
    margin-top:14px;
    border:0;
    border-radius:999px;
    background:linear-gradient(180deg,#4f46e5 0%,#312e81 100%);
    color:#ffffff;
    font-size:13px;
    font-weight:900;
    letter-spacing:0.01em;
    cursor:pointer;
    box-shadow:
      0 8px 16px rgba(49,46,129,0.28),
      inset 0 1px 0 rgba(255,255,255,0.18);
    "
    >
     Vai alla pagina CV ›
    </button>
        </article>



        
        </article>

        <article style="padding:16px; border-radius:18px; background:#fff7ed; border:2px solid #f59e0b;">
          <div style="margin:0 auto 12px auto; padding:10px 14px; border-radius:10px; background:linear-gradient(180deg,#f59e0b 0%,#b45309 100%); color:#fff; font-size:16px; font-weight:900; text-align:center;">
            Le tue risposte
          </div>
          <p style="font-size:14px; line-height:1.5; font-weight:700; color:#7c2d12;">
            ${escapeHtml(answerNarrative)}
          </p>

          <button
  data-report-nav="answers"
  type="button"
  style="
    width:100%;
    min-height:44px;
    margin-top:14px;
    border:0;
    border-radius:999px;
    background:linear-gradient(180deg,#4f46e5 0%,#312e81 100%);
    color:#ffffff;
    font-size:13px;
    font-weight:900;
    letter-spacing:0.01em;
    cursor:pointer;
    box-shadow:
      0 8px 16px rgba(49,46,129,0.28),
      inset 0 1px 0 rgba(255,255,255,0.18);
     "
    >
    Vai alle risposte ›
    </button>


        </article>





        <article style="padding:16px; border-radius:18px; background:#f5f3ff; border:2px solid #8b5cf6;">
          <div style="margin:0 auto 12px auto; padding:10px 14px; border-radius:10px; background:linear-gradient(180deg,#8b5cf6 0%,#6d28d9 100%); color:#fff; font-size:16px; font-weight:900; text-align:center;">
            Tenuta complessiva
          </div>
          <p style="font-size:14px; line-height:1.5; font-weight:700; color:#3b0764;">
            CV, apertura e risposte devono raccontare la stessa traiettoria. Se uno di questi elementi resta generico, anche una risposta formalmente buona perde forza.
          </p>
        </article>

      <article style="padding:16px; border-radius:18px; background:#eef2ff; border:2px solid #818cf8;">
          <div style="margin:0 auto 12px auto; padding:10px 14px; border-radius:10px; background:linear-gradient(180deg,#818cf8 0%,#4338ca 100%); color:#fff; font-size:16px; font-weight:900; text-align:center;">
            La tua apertura
          </div>
          <p style="font-size:14px; line-height:1.5; font-weight:700; color:#1e1b4b;">
            ${escapeHtml(openingAssessment)}
          </p>


          <div style="margin-top:12px;">
       
         
    <button 
  type="button"

  onclick="var p=document.querySelector('[data-situation-panel=&quot;opening&quot;]'); if(p){var isClosed=(p.style.display==='none'||p.style.display===''); p.style.display=isClosed?'block':'none'; if(isClosed){setTimeout(function(){p.scrollIntoView({behavior:'smooth', block:'start'});},80);}}"

  style="
    width:100%;
    min-height:44px;
    margin-top:14px;
    border:0;
    border-radius:999px;
    background:linear-gradient(180deg,#4f46e5 0%,#312e81 100%);
    color:#ffffff;
    font-size:13px;
    font-weight:900;
    letter-spacing:0.01em;
    cursor:pointer;
    box-shadow:
      0 8px 16px rgba(49,46,129,0.28),
      inset 0 1px 0 rgba(255,255,255,0.18);
  "
>
  Analizza apertura ›
</button>

        </div>





      </section>

     
<section style="display:grid; gap:18px;">

  ${opening ? `
    <div
      class="situation-expanded-panel"
      data-situation-panel="opening"
      style="display:none; margin-top:14px;"
    >






      ${renderOverviewModule(opening, context)}
    </div>
  ` : ""}

</section>


<section style="
  margin-top:18px;
  padding:18px;
  border-radius:18px;
  background:#f8fafc;
  border:2px solid #cbd5e1;
  box-shadow:0 8px 18px rgba(15,23,42,0.06);
">
  <div style="
    width:calc(100% - 28px);
    margin:0 auto 12px auto;
    padding:10px 16px;
    border-radius:10px;
    background:linear-gradient(180deg,#818cf8 0%,#4338ca 100%);
    color:#ffffff;
    font-size:18px;
    font-weight:900;
    text-align:center;
  ">
    Cosa approfondire adesso
  </div>

  <p style="
    margin:0 0 14px 0;
    color:#334155;
    font-size:15px;
    line-height:1.55;
    font-weight:800;
    text-align:center;
  ">
    Apri le aree operative per capire dove intervenire prima: priorità, criticità e punti che oggi riducono la forza del colloquio.
  </p>

   

  ${operational ? renderSituationExpandableBlock({

  title: "Interventi prioritari per migliorare subito",
  intro: "Qui trovi le azioni più urgenti: sono i punti che conviene correggere prima perché hanno più impatto sulla qualità percepita del colloquio.",
  html: renderOverviewModule(operational, context)
}) : ""}

${blocking ? renderSituationExpandableBlock({
  title: "Pattern ricorrenti che possono penalizzarti",
  intro: "Questi elementi rendono meno forte la candidatura o riducono la credibilità delle risposte. Non vanno solo letti: vanno trasformati in interventi concreti.",
  html: renderOverviewModule(blocking, context)
}) : ""}

 ${actionPlan ? renderSituationExpandableBlock({

  title: "Priorità operative",
  html: renderOverviewModule(actionPlan, context)

}) : ""}


</section>


    </div>
  `;
}

function renderSituationExpandableBlock({ title, intro, html }) {
  const cleanIntro = text(intro, "");

  return `
    <details
      class="fr-situation-details"
      ontoggle="
        var label=this.querySelector('[data-open-label]');
        if(label){label.textContent=this.open ? 'Chiudi' : 'Apri';}

        if(this.open){
          var currentDetail = this;
          document.querySelectorAll('.fr-situation-details').forEach(function(d){
            if(d !== currentDetail){
              d.open = false;
            }
          });
          setTimeout(function(){
            currentDetail.scrollIntoView({behavior:'smooth', block:'start'});
          }, 80);
        }
      "
    >
      <summary class="fr-situation-summary">
        <span>${escapeHtml(title)}</span>
        <strong data-open-label class="fr-situation-summary-button">Apri</strong>
      </summary>

      <div class="fr-situation-details-body">
        ${cleanIntro ? `
          <p class="fr-note fr-situation-intro">
            ${escapeHtml(cleanIntro)}
          </p>
        ` : ""}

        ${html || ""}
      </div>
    </details>
  `;
}

function renderOverviewModule(
  module,
  context = {}
) {
  if (!module || typeof module !== "object") {
    return "";
  }

  switch (module.key) {
    case "openingPositioning":
      return renderOpeningPositioningModule(module);
      case "operationalPriorities":
  return renderOperationalPrioritiesModule(module);
    case "operationalActionPlan":
     
  return renderOperationalActionPlanModule(module);


    case "blockingPriorities":
     return renderBlockingPrioritiesModule(module);
    case "featuredAnswers":
      return renderFeaturedAnswersModule(module, context);
    case "sensitiveQuestionsDashboard":
      return renderSensitiveQuestionsModule(module);
    case "cvSlim":
      return renderCvSlimModule(module);
    case "finalChecklist":
      return renderFinalChecklistModule(module);
    default:
      return "";
  }
}

function renderOperationalActionPlanModule(module) {
  const plan = module?.data || {};
  return renderOperationalActionPlanContent(plan);
}

function renderOperationalActionPlanContent(plan = {}) {
  const priorities = ensureArray(plan?.globalPriorities);

  if (!priorities.length) {
    return "";
  }

  return `
    <div class="fr-action-plan-content-wrap">
      <div class="fr-action-plan-intro">
        ${escapeHtml(plan?.summary || "Le azioni più importanti da affrontare per prime.")}
      </div>

      <div class="fr-action-plan-list">
        ${priorities.map((item, index) => {
          const level = item?.level || (index === 0 ? "high" : "medium");
          const seenIn = ensureArray(item?.seenIn);

          return `
            <div class="fr-action-plan-item fr-action-plan-${escapeHtml(level)}">

              <div class="fr-action-plan-head">
                <div class="fr-action-plan-rank">${index + 1}</div>

                <div class="fr-action-plan-badges">
                  <span class="fr-action-plan-weight">${escapeHtml(String(item?.weight || ""))}</span>
                  <span class="fr-action-plan-level">${humanizeActionPlanLevel(level)}</span>
                </div>
              </div>

              <div class="fr-action-plan-title">
                ${escapeHtml(item?.title || "Priorità operativa")}
              </div>

              <div class="fr-action-plan-why">
                <strong>Perché conta:</strong> ${escapeHtml(item?.why || "")}
              </div>

              <div class="fr-action-plan-action">
                <strong>Cosa fare:</strong> ${escapeHtml(item?.action || "")}
              </div>

              ${seenIn.length > 0 ? `
                <div class="fr-action-plan-seen">
                  ${seenIn.map((label) => `
                    <span>${escapeHtml(label)}</span>
                  `).join("")}
                </div>
              ` : ""}

            </div>
          `;
        }).join("")}
      </div>
    </div>
  `;
}


function humanizeActionPlanLevel(level = "") {
  const clean = String(level || "").toLowerCase();

  if (clean === "high") return "Priorità alta";
  if (clean === "medium") return "Priorità media";
  if (clean === "low") return "Da tenere presente";

  return "Priorità";
}

function renderOperationalPrioritiesModule(module) {
  const priorities = ensureArray(module?.data?.items || module?.data);

  if (priorities.length === 0) {
    return "";
  }

  return `
    <div class="fr-card fr-operational-priority-block">
      <div class="fr-title-primary">
        Interventi prioritari per migliorare subito
      </div>

      <div class="fr-operational-priority-list">
        ${priorities
          .map((p, i) => {
            const level = i === 0 ? "high" : i === 1 ? "mid" : "low";

            return `
              <div class="weighted-item">
                <span class="weighted-priority-dot ${level}"></span>
                <span class="weighted-text">${escapeHtml(p)}</span>
              </div>
            `;
          })
          .join("")}
      </div>
    </div>
  `;
}

function renderAnswersWorkspaceModule(module, context = {}) {
  const answersWorkspace = module?.data || {};
  const workspaceItems = ensureArray(answersWorkspace?.items);
  const activeWorkspaceIndex =
    workspaceItems.length > 0 ? workspaceItems[0].answerIndex : 1;

  return `
    <div class="section-shell">

      <div class="answer-tabs-shell">
        <div class="answer-tabs-title">Analisi delle risposte</div>

        <div class="tabs-row">

        ${workspaceItems.length > 0
          ? workspaceItems.map((item) => `
           
          <button class="tab-button tab-score-${Number(item?.score ?? 0) >= 75 ? "good" : Number(item?.score ?? 0) >= 50 ? "mid" : "weak"} ${item.answerIndex === activeWorkspaceIndex ? "is-active" : ""}" data-answer-tab="${escapeHtml(String(item.answerIndex))}" type="button">
            ${escapeHtml(`Risposta ${item.answerIndex}`)}
            </button>


          `).join("\n")
          : `<span class="muted">Nessuna risposta disponibile.</span>`
        }
        </div>
        </div>
      ${workspaceItems.length > 0
        ? workspaceItems.map((item) =>
    renderWorkspaceAnswerPanel(
      item,
      item.answerIndex === activeWorkspaceIndex,
      context
        )
       ).join("\n")
        : `<p class="muted">Non emergono ancora risposte operative.</p>`
      }
    </div>
  `;
}

function renderAnswersModule(module, context = {}) {
  if (!module || typeof module !== "object") {
    return "";
  }

  switch (module.key) {
    case "answersWorkspace":
      return renderAnswersWorkspaceModule(module, context);
    default:
      return "";
  }
}

function buildReportDataFromProReport(proReportV2) {
  return {
    productMode: proReportV2?.productMode || "pro",
    productCapabilities: proReportV2?.productCapabilities || {},
    overview: proReportV2?.overview || {},
    professionalPerception: proReportV2?.professionalPerception || {},
    answersWorkspace: proReportV2?.answersWorkspace || {}
  };
}

function renderProfessionalPerceptionSection(proReportV2) {
  const perception = proReportV2?.professionalPerception || {};
  const v2 = perception?.perceptionV2 || {};
  const fallbackNarrative = perception?.narrativeRead || {};
  const fallbackEmerging = perception?.emergingImage || {};

  const whoEmerges = v2?.whoEmerges || {};
  const credibilityAssets = v2?.credibilityAssets || {};
  const cvInterviewPerceptionGap = v2?.cvInterviewPerceptionGap || {};
  const targetDistance = v2?.targetDistance || {};
  const recruiterMemory = v2?.recruiterMemory || {};
  const blindSpots = v2?.blindSpots || {};
  const attitudeShift = v2?.attitudeShift || {};

  return `
    <div class="section-shell">
      <div class="overview-card">
        <div class="overview-card-title">Come vieni percepito</div>

        <p><strong>${escapeHtml(
          whoEmerges?.title ||
            fallbackNarrative?.headline ||
            fallbackEmerging?.title ||
            "Percezione professionale emergente"
        )}</strong></p>

        <p>${escapeHtml(
          whoEmerges?.narrative ||
            fallbackNarrative?.mainNarrative ||
            fallbackEmerging?.narrative ||
            ""
        )}</p>

        <div class="answer-subcard">
          <div class="answer-subcard-title">${escapeHtml(
            credibilityAssets?.title || "Il tuo bagaglio di credibilità"
          )}</div>
          
          
          



          <p>${escapeHtml(
            credibilityAssets?.narrative ||
              "Nel percorso sono presenti elementi utili che possono sostenere la candidatura, ma devono essere resi più visibili durante il colloquio."
          )}</p>
        </div>

          <div class="answer-subcard">
          <div class="answer-subcard-title">${escapeHtml(
            cvInterviewPerceptionGap?.title ||
              "CV e colloquio raccontano la stessa storia?"
          )}</div>

          <p><strong>Cosa suggerisce il CV</strong></p>
          <p>${escapeHtml(cvInterviewPerceptionGap?.cvImage || "")}</p>

          <p><strong>Cosa emerge nel colloquio</strong></p>
          <p>${escapeHtml(cvInterviewPerceptionGap?.interviewImage || "")}</p>

          <p><strong>Possibile lettura</strong></p>
          <p>${escapeHtml(cvInterviewPerceptionGap?.narrative || "")}</p>
        </div>


        <div class="answer-subcard">
          <div class="answer-subcard-title">${escapeHtml(
            targetDistance?.title || "Dove nasce la distanza dal ruolo target"
          )}</div>

          <p><strong>Ciò che emerge oggi</strong></p>
          <p>${escapeHtml(targetDistance?.currentSignals || "")}</p>

          <p><strong>Ciò che cerca il ruolo</strong></p>
          <p>${escapeHtml(targetDistance?.targetSignals || "")}</p>

          <p><strong>Il ponte che manca</strong></p>
          <p>${escapeHtml(targetDistance?.bridgeNarrative || "")}</p>
        </div>

        <div class="answer-subcard">
          <div class="answer-subcard-title">${escapeHtml(
            recruiterMemory?.title || "Cosa potrebbe restare in mente a un recruiter"
          )}</div>
          <p>${escapeHtml(
            recruiterMemory?.narrative ||
              fallbackNarrative?.interviewerPerception ||
              ""
          )}</p>
        </div>

        <div class="answer-subcard">
          <div class="answer-subcard-title">${escapeHtml(
            blindSpots?.title || "Cosa probabilmente non stai vedendo"
          )}</div>
          <p>${escapeHtml(blindSpots?.narrative || "")}</p>
        </div>

        <div class="answer-subcard">
          <div class="answer-subcard-title">${escapeHtml(
            attitudeShift?.title || "Cambio di atteggiamento consigliato"
          )}</div>
          <p>${escapeHtml(
            attitudeShift?.narrative ||
              fallbackNarrative?.attitudeShift ||
              ""
          )}</p>
        </div>
      </div>
    </div>
  `;
}

export function renderProReportHtml({ proReportV2, activeSection = "overview" }) {

  if (!proReportV2 || typeof proReportV2 !== "object") {
    throw new Error("renderProReportHtml: proReportV2 is required.");
  }
const proReportNarratives =
  loadProReportNarrativeData({
    roleFamily:
      proReportV2?.roleFamily ||
      proReportV2?.professionalPerception?.roleFamily ||
      "care_helping_professions",
    locale:
      proReportV2?.locale ||
      proReportV2?.rawInput?.locale ||
      "it"
  }) || {};


  const reportData = buildReportDataFromProReport(proReportV2);

  const overviewLayout = assembleReportSectionData({
    planKey: "pro",
    sectionKey: "overview",
    reportData
  });

  // 🔥 inject Operational Priorities
if (
  proReportV2?.overview?.operationalPriorities &&
  proReportV2.overview.operationalPriorities.length > 0
) {
  overviewLayout.enabled.splice(1, 0, {
    key: "operationalPriorities",
    data: proReportV2.overview.operationalPriorities
  });
}

  if (
  proReportV2?.overview?.operationalActionPlan?.globalPriorities?.length > 0
) {
  overviewLayout.enabled.splice(2, 0, {
    key: "operationalActionPlan",
    data: proReportV2.overview.operationalActionPlan
  });
}

  const answersLayout = assembleReportSectionData({
    planKey: "pro",
    sectionKey: "answers",
    reportData
  });

  const sections = [
  { key: "overview", label: "Situazione" },
  { key: "perception", label: "Percezione" },
  { key: "answers", label: "Risposte" },
  { key: "criticalPoints", label: "Punti delicati" },
  { key: "cv", label: "CV" },
  { key: "final", label: "Checklist" }
];

   const answersModules = ensureArray(answersLayout.enabled);

    const overviewModuleKeys = new Set([
  "openingPositioning",
  "operationalPriorities",
  "operationalActionPlan",
  "blockingPriorities",
  "featuredAnswers"
    ]);


  const criticalModuleKeys = new Set(["sensitiveQuestionsDashboard"]);
  const cvModuleKeys = new Set(["cvSlim"]);
  const finalModuleKeys = new Set(["finalChecklist"]);

  const overviewModules = overviewLayout.enabled.filter((module) =>
    overviewModuleKeys.has(module.key)
  );

  





  const criticalModules = overviewLayout.enabled.filter((module) =>
    criticalModuleKeys.has(module.key)
  );

  const cvModules = overviewLayout.enabled.filter((module) =>
    cvModuleKeys.has(module.key)
  );

  const finalModules = overviewLayout.enabled.filter((module) =>
    finalModuleKeys.has(module.key)
  );
 
  return `
<!doctype html>
<html lang="it">
<head>
  <meta charset="utf-8" />
  <title>FRINGE Interview - PRO Report</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>
  
  /* ===== FRINGE UI STANDARD v1.0 ===== */

:root {
  /* LEGACY */
  --bg: #f5f7fb;
  --card: #ffffff;
  --text: #1f2937;
  --muted: #4b5563;
  --line: #dbe3f0;

  /* COLORS */
  --fr-bg: #eef2ff;
  --fr-ink: #0f172a;
  --fr-muted: #334155;

  --fr-primary-1: #818cf8;
  --fr-primary-2: #4338ca;

  --fr-dark-1: #1e1b4b;
  --fr-dark-2: #0f172a;

  --fr-positive-1: #22c55e;
  --fr-positive-2: #166534;

  --fr-risk-1: #ef4444;
  --fr-risk-2: #991b1b;

  --fr-warning-1: #facc15;
  --fr-warning-2: #eab308;

  --fr-soft-border: #c7d2fe;

  /* TYPOGRAPHY */
  --fr-title-main: 24px;
  --fr-title-section: 20px;
  --fr-title-card: 18px;
  --fr-pill: 14px;
  --fr-body: 15px;
  --fr-dense: 14px;
  --fr-caption: 13px;

  /* SPACING */
  --fr-xs: 6px;
  --fr-sm: 10px;
  --fr-md: 14px;
  --fr-lg: 18px;
  --fr-xl: 24px;

  /* RADIUS */
  --fr-radius-sm: 10px;
  --fr-radius-md: 16px;
  --fr-radius-lg: 22px;
  --fr-pill-radius: 999px;

  /* SHADOWS */
  --fr-shadow-sm: 0 4px 10px rgba(15,23,42,0.08);
  --fr-shadow-md: 0 8px 18px rgba(15,23,42,0.12);
}

@media (max-width: 640px) {
  :root {
    --fr-title-main: 18px;
    --fr-title-section: 16px;
    --fr-title-card: 15px;
    --fr-pill: 12px;
    --fr-body: 13px;
    --fr-dense: 12px;
    --fr-caption: 11px;
  }
}

/* ===== BASE COMPONENTS ===== */

.fr-title-primary {
  padding: var(--fr-sm) var(--fr-md);
  border-radius: var(--fr-radius-sm);
  background: linear-gradient(180deg, var(--fr-primary-1) 0%, var(--fr-primary-2) 100%);
  color: #ffffff;
  font-size: var(--fr-title-section);
  line-height: 1.2;
  font-weight: 900;
  text-align: center;
}

.fr-card {
  padding: var(--fr-md);
  border-radius: var(--fr-radius-md);
  background: #ffffff;
  border: 2px solid var(--fr-soft-border);
  box-shadow: var(--fr-shadow-sm);
}

.fr-card-dark {
  padding: var(--fr-md);
  border-radius: var(--fr-radius-md);
  background: linear-gradient(180deg, var(--fr-dark-1) 0%, var(--fr-dark-2) 100%);
  border: 2px solid var(--fr-primary-1);
  color: #ffffff;
}

.fr-note {
  padding: var(--fr-md);
  border-radius: var(--fr-radius-md);
  background: #eef2ff;
  border: 1px solid var(--fr-soft-border);
  color: var(--fr-ink);
  font-size: var(--fr-body);
  line-height: 1.5;
  font-weight: 700;
}

.fr-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 32px;
  padding: 7px 13px;
  border-radius: var(--fr-pill-radius);
  font-size: var(--fr-pill);
  line-height: 1.15;
  font-weight: 900;
  color: #ffffff;
}

.fr-pill-positive {
  background: linear-gradient(180deg, var(--fr-positive-1) 0%, var(--fr-positive-2) 100%);
}

.fr-pill-risk {
  background: linear-gradient(180deg, var(--fr-risk-1) 0%, var(--fr-risk-2) 100%);
}

.fr-text {
  font-size: var(--fr-body);
  line-height: 1.5;
  font-weight: 650;
  color: var(--fr-ink);
}

.fr-section-stack {
  display: grid;
  gap: var(--fr-md);
}

.fr-close-button {
  border: 0;
  border-radius: var(--fr-pill-radius);
  padding: 8px 12px;
  background: var(--fr-dark-2);
  color: #ffffff;
  font-size: var(--fr-caption);
  font-weight: 900;
  cursor: pointer;
  white-space: nowrap;
}

/* ===== SITUATION DETAILS STANDARD ===== */

.fr-situation-details {
  margin-top: 12px;
  border-radius: var(--fr-radius-md);
  border: 1px solid #cbd5e1;
  background: #ffffff;
  overflow: hidden;
  box-shadow: var(--fr-shadow-sm);
}

.fr-situation-summary {
  min-height: 54px;
  padding: 0 var(--fr-md);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--fr-sm);
  cursor: pointer;
  background: linear-gradient(180deg, var(--fr-warning-1) 0%, var(--fr-warning-2) 100%);
  color: #111827;
  font-size: var(--fr-title-card);
  line-height: 1.2;
  font-weight: 900;
}

.fr-situation-summary-button {
  padding: 8px 14px;
  border-radius: var(--fr-pill-radius);
  background: var(--fr-dark-2);
  color: #ffffff;
  font-size: var(--fr-caption);
  font-weight: 900;
  min-width: 68px;
  text-align: center;
}

.fr-situation-details-body {
  padding: var(--fr-md);
}

.fr-situation-intro {
  margin: 0 0 var(--fr-md) 0;
}

.fr-operational-priority-block {
  border-color: var(--fr-risk-1);
  box-shadow: 0 8px 18px rgba(239,68,68,0.16);
}

.fr-operational-priority-list {
  margin-top: var(--fr-md);
}

@media (max-width: 640px) {
  .fr-situation-summary {
    min-height: 48px;
    padding: 8px 12px;
    font-size: var(--fr-title-card);
  }

  .fr-situation-summary-button {
    padding: 7px 12px;
    min-width: 60px;
  }

  .fr-situation-details-body {
    padding: 12px;
  }

  .fr-operational-priority-block {
    padding: 12px !important;
  }
}


/* ===== OPENING MODULE v1 ===== */

.opening-main-title-v09 {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  gap: var(--fr-sm);
}

.opening-main-title-v09 span {
  font-size: var(--fr-title-section);
}

.opening-assessment-v09 {
  margin-top: var(--fr-md);
}

.opening-reading-grid-v09 {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--fr-md);
  margin-top: var(--fr-md);
}

.opening-reading-item-v09 {
  background: #eef2ff !important;
  border-color: #c7d2fe !important;
}

.opening-reading-label-v09 {
  margin-bottom: var(--fr-xs);
  color: var(--fr-primary-2) !important;
  font-size: var(--fr-caption);
  line-height: 1.2;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.opening-reading-item-v09 .fr-text {
  color: var(--fr-ink) !important;
  font-size: var(--fr-body) !important;
  line-height: 1.5 !important;
  font-weight: 700 !important;
}

.opening-subsection-v09 {
  margin-top: 18px !important;
}

.opening-cv-section-v09 .fr-title-primary + .opening-subsection-v09 {
  margin-top: 22px !important;
}

.opening-cv-section-v09 .fr-pill {
  margin-bottom: 12px !important;
}

.opening-pitch-v09 {
  margin-top: var(--fr-md);
}

/* ===== FRINGE SECTION NAVIGATOR v1 ===== */

.fr-section-nav {
  position: sticky;
  top: 72px;
  z-index: 40;
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding: 8px 0;
  background: rgba(15,23,42,0.94);
  border-top: 1px solid rgba(255,255,255,0.12);
  border-bottom: 1px solid rgba(255,255,255,0.12);
  -webkit-overflow-scrolling: touch;
}

.fr-section-chip {
  flex: 0 0 auto;
  min-height: 36px;
  padding: 8px 14px;
  border-radius: 999px;
  border: 1px solid #818cf8;
  background: linear-gradient(180deg, #ffffff 0%, #c7d2fe 100%);
  color: #1e1b4b;
  font-size: var(--fr-caption);
  font-weight: 900;
  cursor: pointer;
  white-space: nowrap;
  box-shadow: 0 3px 8px rgba(15,23,42,0.12);
}

.fr-section-chip.is-active {
  background: linear-gradient(180deg, var(--fr-warning-1) 0%, var(--fr-warning-2) 100%);
  color: #111827;
  border-color: #b45309;
}

.fr-section-chip:hover {
  transform: translateY(-1px);
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,0.75),
    0 6px 14px rgba(15,23,42,0.14);
}

.fr-nav-panel {
  padding: 0 !important;
  overflow: hidden;
}

.fr-panel-title {
  width: 100%;
  min-height: 44px;
  border: 0;
  padding: 10px 14px;
  background: linear-gradient(180deg, var(--fr-primary-1) 0%, var(--fr-primary-2) 100%);
  color: #ffffff;
  font-size: var(--fr-title-section);
  font-weight: 900;
  line-height: 1.2;
  text-align: center;
  cursor: pointer;
}

.fr-panel-body {
  display: none;
  padding: var(--fr-md);
}

.fr-nav-panel.is-open .fr-panel-body {
  display: block;
}



/* ===== WEIGHTED PRIORITY LIST ===== */

.weighted-item {
  display: grid !important;
  grid-template-columns: 24px minmax(0, 1fr) !important;
  gap: 8px !important;
  align-items: start !important;
  margin-top: 12px !important;
}

.weighted-priority-dot {
  display: inline-block;
  border-radius: 999px;
  margin-top: 4px;
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.45);
}

.weighted-priority-dot.high {
  width: 18px;
  height: 18px;
  background: #ef4444;
}

.weighted-priority-dot.mid {
  width: 15px;
  height: 15px;
  background: #f59e0b;
  margin-left: 1px;
}

.weighted-priority-dot.low {
  width: 11px;
  height: 11px;
  background: #94a3b8;
  margin-left: 3px;
}

.weighted-text {
  font-size: var(--fr-body) !important;
  line-height: 1.45 !important;
  font-weight: 700 !important;
  color: var(--fr-ink) !important;
}

/* ===== MOBILE STANDARD ===== */

@media (max-width: 640px) {
  .fr-card {
    padding: 12px !important;
    border-radius: 14px !important;
  }

  .fr-note {
    padding: 12px !important;
    font-size: var(--fr-body) !important;
    line-height: 1.42 !important;
  }

  .fr-title-primary {
    padding: 8px 12px !important;
    min-height: auto !important;
  }

  .opening-main-title-v09 {
    grid-template-columns: 1fr auto;
  }

  .opening-main-title-v09 span {
    font-size: var(--fr-title-card);
  }

  .opening-reading-grid-v09 {
    grid-template-columns: 1fr;
    gap: 12px !important;
  }

  .opening-subsection-v09 {
    margin-top: 14px !important;
  }

  .opening-cv-section-v09 .fr-title-primary + .opening-subsection-v09 {
    margin-top: 20px !important;
  }

  .opening-cv-section-v09 > .fr-title-primary {
    padding-top: 10px !important;
    padding-bottom: 10px !important;
    font-size: 15px !important;
    line-height: 1.2 !important;
  }

  .opening-pitch-v09 .overview-pitch-text {
    font-size: 13px !important;
    line-height: 1.42 !important;
    font-weight: 650 !important;
  }

  .opening-pitch-v09 .overview-pitch-note {
    font-size: 12px !important;
    line-height: 1.38 !important;
  }

  .fr-section-nav {
    top: 68px;
    margin-top: 0 !important;
    padding-top: 4px !important;
    padding-bottom: 4px !important;
  }

  .fr-section-chip {
    min-height: 32px !important;
    padding: 6px 12px !important;
  }

  .fr-nav-panel {
    margin-top: 8px !important;
  }

  .fr-panel-title {
    font-size: var(--fr-title-card);
    min-height: 40px;
    padding: 9px 12px;
  }

  .fr-panel-body {
    padding: 12px;
  }


  /* ===== ANSWER PANEL STANDARD PASS v1 ===== */

.fr-answer-qa-details,
.fr-answer-reading-box,
.fr-answer-analysis-details {
  margin-top: var(--fr-md);
}

.fr-answer-qa-summary {
  min-height: 48px;
  padding: 0 var(--fr-md);
}

.fr-answer-qa-content {
  display: grid;
  gap: var(--fr-md);
}

.fr-answer-question-box,
.fr-answer-original-box {
  background: #f8fafc;
}

.fr-answer-reading-box {
  background: #eef2ff;
  border-color: var(--fr-soft-border);
}

.fr-answer-summary-text {
  margin: var(--fr-md) 0 0 0;
}

.fr-answer-first-correction {
  margin-top: var(--fr-md);
  padding: var(--fr-md);
  border-radius: var(--fr-radius-md);
  background: linear-gradient(180deg, #991b1b 0%, #7f1d1d 100%);
  color: #ffffff;
  border: 2px solid var(--fr-risk-1);
  box-shadow: 0 8px 18px rgba(127,29,29,0.18);
}

.fr-answer-first-correction .fr-pill {
  background: #fee2e2;
  color: #991b1b;
  margin-bottom: var(--fr-sm);
}

.fr-answer-first-correction-text {
  color: #ffffff;
  font-size: var(--fr-body);
  line-height: 1.42;
  font-weight: 900;
}

.fr-answer-context-note {
  margin-top: var(--fr-md);
}

.fr-answer-mini-title {
  margin-bottom: var(--fr-xs);
  color: var(--fr-primary-2);
  font-size: var(--fr-caption);
  line-height: 1.2;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.fr-answer-detail-grid {
  margin-top: var(--fr-md);
  grid-template-columns: 1fr 1fr;
}

.fr-answer-analysis-details .improved-answer-highlight {
  margin-top: var(--fr-md) !important;
}

@media (max-width: 640px) {
  .fr-answer-qa-content {
    gap: 10px;
  }

  .fr-answer-reading-box {
    padding-left: 10px !important;
    padding-right: 10px !important;
  }

  .fr-answer-first-correction {
    padding: 12px;
  }

  .fr-answer-first-correction-text {
    font-size: var(--fr-body);
    line-height: 1.38;
  }

  .fr-answer-detail-grid {
    grid-template-columns: 1fr !important;
  }
}

/* ===== ANSWERS MOBILE COMPACT PASS ===== */

@media (max-width: 640px) {

  .qa-question-text.compact,
  .qa-answer-text.compact-scroll,
  .fr-answer-summary-text,
  .fr-answer-first-correction-text,
  .workspace-context-link-text,
  .weighted-text,
  .answer-subcard p {
    font-size: 14px !important;
    line-height: 1.42 !important;
    font-weight: 650 !important;
  }

  .qa-question-label,
  .qa-answer-label,
  .fr-answer-mini-title,
  .answer-subcard-title,
  .workspace-column-main-title {
    font-size: 11px !important;
    letter-spacing: 0.05em;
  }

  .workspace-summary-score {
    font-size: 14px !important;
    min-width: 74px;
    padding: 8px 10px !important;
  }

  .fr-title-primary {
    font-size: 15px !important;
    line-height: 1.18 !important;
  }

  .fr-card {
    padding: 12px !important;
  }
}


  .weighted-item {
    grid-template-columns: 24px minmax(0, 1fr) !important;
    gap: 8px !important;
  }

  .weighted-priority-dot.high {
    width: 17px;
    height: 17px;
  }

  .weighted-priority-dot.mid {
    width: 14px;
    height: 14px;
  }

  .weighted-priority-dot.low {
    width: 10px;
    height: 10px;
  }
}

@media (max-width: 640px) {
  .overview-opening-block {
    padding-left: 8px !important;
    padding-right: 8px !important;
  }

  .fr-panel-body {
    padding-left: 8px !important;
    padding-right: 8px !important;
  }

  .fr-card {
    padding-left: 10px !important;
    padding-right: 10px !important;
  }

  .opening-pitch-v09 {
    margin-left: 0 !important;
    margin-right: 0 !important;
  }
}


/* ===== BLOCKING PATTERNS COMPACT STANDARD ===== */

.overview-priority-block .priority-item,
.compact-priority-list .priority-item {
  padding: 12px 14px !important;
  border-radius: 14px !important;
}

.overview-priority-block .priority-text,
.compact-priority-list .priority-text {
  font-size: var(--fr-body) !important;
  line-height: 1.42 !important;
  font-weight: 650 !important;
  color: var(--fr-ink) !important;
}

.overview-priority-block .priority-index,
.compact-priority-list .priority-index {
  width: 26px !important;
  height: 26px !important;
  min-width: 26px !important;
  font-size: 13px !important;
  font-weight: 900 !important;
}

@media (max-width: 640px) {
  .overview-priority-block .priority-text,
  .compact-priority-list .priority-text {
    font-size: 13px !important;
    line-height: 1.36 !important;
    font-weight: 650 !important;
  }

  .overview-priority-block .priority-item,
  .compact-priority-list .priority-item {
    padding: 10px 12px !important;
  }
}





    :root {
      --bg: #f5f7fb;
      --card: #ffffff;
      --text: #1f2937;
      --muted: #4b5563;
      --line: #dbe3f0;
    }

    * { box-sizing: border-box; }

    body {
      font-family: Arial, Helvetica, sans-serif;
      background: var(--bg);
      color: var(--text);
      margin: 0;
      padding: 20px;
      line-height: 1.55;
    }

    .page {
      max-width: 1180px;
      margin: 0 auto;
    }

    .hero-shell {
      border-radius: 22px;
      padding: 12px 16px;
      margin-bottom: 12px;
      background: linear-gradient(180deg, #111827 0%, #1f2937 100%);
      color: white;
      box-shadow: 0 14px 30px rgba(15, 23, 42, 0.24);
    }

    .hero-kicker {
      display: inline-flex;
      align-items: center;
      font-size: 12px;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #c4b5fd;
      margin-bottom: 10px;
    }

    .hero-title {
      font-size: 24px;
      line-height: 1.2;
      font-weight: 900;
      margin-bottom: 10px;
    }

    .hero-text {
      font-size: 14px;
      line-height: 1.45;
      color: #e5e7eb;
      max-width: 980px;
    }

     


   .top-nav-item {
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  padding: 11px 17px;
  background: rgba(255,255,255,0.20);
  color: #f8fafc;
  font-size: 15px;
  font-weight: 900;
  white-space: nowrap;
  border: 1px solid rgba(255,255,255,0.35);
  cursor: pointer;
  font-family: inherit;
  line-height: 1;
}


  .top-nav-item.active {
  background: linear-gradient(180deg, #e0f2fe 0%, #bae6fd 100%);
  color: #0f172a;
  border-color: #bae6fd;
  box-shadow: 0 0 0 3px rgba(186,230,253,0.30);
}

        .report-section {
      display: none;
    }

    .report-section.is-active {
      display: block;
    }

    

    .section-shell {
      background: white;
      border-radius: 18px;
      padding: 18px;
      margin-bottom: 18px;
      box-shadow: 0 6px 18px rgba(0,0,0,0.07);
    }

    .section-shell-title {
      font-size: 26px;
      font-weight: 900;
      color: #0f172a;
      margin-bottom: 4px;
    }

    .section-shell-subtitle {
      color: #475467;
      font-size: 15px;
      line-height: 1.5;
      margin-bottom: 14px;
    }

    .card {
      background: white;
      border-radius: 16px;
      padding: 18px;
      border: 2px solid #dbe3f0;
      box-shadow: 0 6px 18px rgba(0,0,0,0.07);
    }

    .card h3 {
      margin-top: 0;
      margin-bottom: 8px;
      font-size: 20px;
    }

    .grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 18px;
      margin-top: 18px;
    }

    .positive-card {
      background: #f0fdf4;
      border-color: #86efac;
    }

    .warm-card {
      background: #fff7ed;
      border-color: #fdba74;
    }

    .risk-card {
      background: #fef2f2;
      border-color: #fca5a5;
    }

    .overview-pro-block {
  background: linear-gradient(180deg, #172554 0%, #0f172a 55%, #020617 100%);
  border-radius: 22px;
  padding: 18px;
  margin-bottom: 18px;
  border: 3px solid #1e40af;
  box-shadow: 0 14px 28px rgba(15,23,42,0.22);
  color: #f8fafc;
}

.overview-pro-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 14px;
  margin-bottom: 10px;
}

.overview-pro-kicker {
  font-size: 12px;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #bfdbfe;
  margin-bottom: 4px;
}

.overview-pro-title {
  font-size: 24px;
  line-height: 1.25;
  font-weight: 900;
  color: #ffffff;
}

.overview-pro-badge {
  flex: 0 0 auto;
  border-radius: 999px;
  padding: 7px 11px;
  background: #e0f2fe;
  color: #0f172a;
  border: 2px solid #7dd3fc;
  font-size: 12px;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.overview-pro-badge-warm {
  background: #fef3c7;
  border-color: #facc15;
}

.overview-pro-note {
  border-radius: 14px;
  padding: 10px 12px;
  background: rgba(255,255,255,0.10);
  border: 2px solid rgba(255,255,255,0.20);
  color: #e5e7eb;
  font-size: 15px;
  line-height: 1.55;
  font-weight: 800;
  margin-bottom: 16px;
}

.overview-card-full {
  margin-bottom: 14px;
}

.overview-card-grid-2 {
  margin-top: 0;
}


.overview-card-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

.overview-card {
  border-radius: 14px;
  padding: 14px;
  background: linear-gradient(180deg, #f8fafc 0%, #eef2f7 100%);
  border: 2px solid #dbe3f0;
  box-shadow: 0 6px 14px rgba(15,23,42,0.05);
}

.overview-card-good {
  background: linear-gradient(180deg, #ecfdf3 0%, #d1fae5 100%);
  border: 2px solid #22c55e;
  box-shadow: 0 8px 16px rgba(34,197,94,0.15);
}

.overview-card-risk {
  background: linear-gradient(180deg, #fef2f2 0%, #fee2e2 100%);
  border: 2px solid #ef4444;
  box-shadow: 0 8px 16px rgba(239,68,68,0.18);
}

.overview-card-neutral {
  background: linear-gradient(180deg, #eef2ff 0%, #e0e7ff 100%);
  border: 2px solid #6366f1;
}


.overview-card p,
.overview-coach-box p {
  margin-top: 0;
  margin-bottom: 0;
}

.overview-coach-box {
  margin-top: 14px;
  padding: 16px;
  border-radius: 16px;

  background: linear-gradient(180deg, #ede9fe 0%, #ddd6fe 100%);
  border: 2px solid #7c3aed;

  box-shadow: 0 10px 22px rgba(124,58,237,0.18);
}

.overview-coach-box .overview-card-title {
  font-size: 16px;
}


.overview-priority-block {
  border-color: #fed7aa;
}

.overview-priority-item {
  box-shadow: 0 6px 14px rgba(15,23,42,0.07);
}

.overview-answer-stack {
  gap: 14px;
}


    .pill-row {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin-top: 8px;
      margin-bottom: 12px;
    }

    .pill {
      display: inline-flex;
      align-items: center;
      border-radius: 999px;
      padding: 6px 10px;
      font-size: 12px;
      font-weight: 900;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      border: 1px solid transparent;
      background: #e5e7eb;
      color: #111827;
    }

    .pill-good {
      background: #dcfce7;
      color: #166534;
      border-color: #86efac;
    }

    .pill-warm {
      background: #ffedd5;
      color: #9a3412;
      border-color: #fdba74;
    }

    .pill-risk {
      background: #fee2e2;
      color: #991b1b;
      border-color: #fca5a5;
    }

    .pill-neutral {
      background: #e2e8f0;
      color: #334155;
      border-color: #cbd5e1;
    }

    .priority-list, .action-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .priority-item {
      display: grid;
      grid-template-columns: 56px 1fr;
      gap: 14px;
      align-items: stretch;
      border-radius: 16px;
      background: #fff;
      border: 2px solid #fed7aa;
      padding: 14px;
    }

    .priority-index {
  width: 28px;
  height: 28px;
  font-size: 13px;
  font-weight: 900;
  border-radius: 8px;

  background: linear-gradient(180deg, #f59e0b 0%, #d97706 100%);
  color: white;

  display: flex;
  align-items: center;
  justify-content: center;
    }

    .priority-text, .action-text {
      font-size: 18px;
      line-height: 1.6;
      font-weight: 700;
      color: #111827;
    }


  .qa-block {
  display: grid;
  grid-template-columns: 1fr 96px;
  gap: 14px;
  border-radius: 20px;
  padding: 16px;
  border: 3px solid #1e3a5f;
  background: linear-gradient(180deg, #071426 0%, #102542 55%, #19385f 100%) !important;
  color: #ffffff !important;
  box-shadow: 0 14px 28px rgba(15,23,42,0.24);
}

.qa-main {
  min-width: 0;
}

.qa-header {
  font-size: 19px;
  font-weight: 900;
  margin-bottom: 12px;
  color: #ffffff;
}

.qa-content {
  background: linear-gradient(180deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.06) 100%);
  border-radius: 16px;
  padding: 16px 18px;
  border: 2px solid rgba(147,197,253,0.28);
}

.qa-question-label {
  display: none;
}

.qa-question-text {
  font-size: 18px;
  font-weight: 900;
  line-height: 1.55;
  color: #ffffff;
  padding-left: 12px;
  border-left: 5px solid #60a5fa;
}

.qa-answer-label {
  font-size: 12px;
  font-weight: 900;
  text-transform: uppercase;
  margin-top: 16px;
  margin-bottom: 7px;
  letter-spacing: 0.06em;
  color: #fdba74;
}

.qa-answer-text {
  font-size: 16px;
  font-weight: 750;
  line-height: 1.65;
  color: #ffedd5;
  padding-left: 12px;
  border-left: 5px solid #fb923c;
}

.qa-score {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  border-radius: 18px;
  color: #ffffff;
  font-weight: 900;
  min-height: 100%;
  border: 2px solid rgba(255,255,255,0.22);
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.18);
}

.qa-score-good {
  background: linear-gradient(180deg, #16a34a 0%, #15803d 100%);
}

.qa-score-mid {
  background: linear-gradient(180deg, #f59e0b 0%, #d97706 100%);
}

.qa-score-weak {
  background: linear-gradient(180deg, #ef4444 0%, #dc2626 100%);
}

.qa-score-value {
  font-size: 34px;
  line-height: 1;
}

.qa-score-total {
  font-size: 15px;
  opacity: 0.85;
  padding-top: 10px;
}



    .question-dark-box {
  margin-top: 10px;
  padding: 14px 16px;
  border-radius: 16px;
  background: #111827;
  color: #f9fafb;
  border: 1px solid rgba(255,255,255,0.16);
}

.question-dark-label {
  font-size: 12px;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #c4b5fd;
  margin-bottom: 6px;
}

.question-dark-text {
  font-size: 18px;
  line-height: 1.55;
  font-weight: 800;
}

    .answer-stack {
      display: flex;
      flex-direction: column;
      gap: 18px;
    }

    .answer-card {
      border-radius: 18px;
      padding: 18px;
      border: 3px solid #dbe3f0;
      background: white;
      box-shadow: 0 10px 22px rgba(15,23,42,0.10);
    }


    .original-answer-box {
  margin-top: 8px;
  padding: 14px;
  border-radius: 14px;
  background: #f8fafc;
  border: 2px solid #dbe3f0;
  color: #111827;
  font-size: 16px;
  line-height: 1.7;
  font-weight: 700;
  white-space: pre-wrap;
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

    .answer-card-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
      margin-bottom: 10px;
      flex-wrap: wrap;
    }

    .answer-card-kicker {
      font-size: 12px;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: #475467;
    }

    .answer-card-score {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
      font-weight: 900;
    }

    .inspiration-answer-box {
  margin-top: 14px;
  padding: 14px 16px;
  border-radius: 14px;
  background: #ffffff;
  border: 2px solid #7c3aed;
  box-shadow: inset 0 0 0 1px rgba(124,58,237,0.12);
}

.inspiration-answer-label {
  font-size: 12px;
  font-weight: 900;
  color: #5b21b6;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 7px;
}

.inspiration-answer-text {
  font-size: 16px;
  line-height: 1.65;
  font-weight: 850;
  color: #111827;
}


    .score-dot {
      width: 16px;
      height: 16px;
      border-radius: 999px;
      display: inline-block;
      flex: 0 0 auto;
    }

    .dot-ok { background: #16a34a; }
    .dot-mid { background: #facc15; }
    .dot-weak { background: #dc2626; }
    .dot-neutral { background: #94a3b8; }

    .status-ok { color: #065f46; }
    .status-mid { color: #a16207; }
    .status-weak { color: #991b1b; }
    .status-neutral { color: #334155; }

    .answer-card-question {
      font-size: 20px;
      font-weight: 900;
      color: #0f172a;
      margin-bottom: 10px;
      line-height: 1.4;
    }

    
    .answer-card-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 14px;
    }

    .answer-subcard {
      border-radius: 14px;
      padding: 14px;
      border: 2px solid #dbe3f0;
      background: white;
    }

    .answer-subcard-risk {
      background: #fef2f2;
      border-color: #fca5a5;
    }

    .answer-subcard-warm {
      background: #fff7ed;
      border-color: #fdba74;
    }

    .answer-subcard.answer-subcard-warm {
    background: #f8fafc;
    border-color: #cbd5e1;
    }

    .answer-subcard-title {
    font-size: 13px;
     font-weight: 900;
    margin-bottom: 4px;
     letter-spacing: 0.02em;
     color: #1e293b;
    }


 .answer-tabs-shell {
  margin-bottom: 12px;
  padding: 5px 8px 8px 8px;
  border-radius: 16px;

  background: linear-gradient(
    180deg,
    #3a241d 0%,
    #2a1914 70%,
    #1a0f0c 100%
  );

  border: 3px solid #6a3f2e;

  box-shadow:
    0 8px 16px rgba(20,10,8,0.35),
    inset 0 1px 0 rgba(255,255,255,0.08);

  position: sticky;
  top: 82px;
  z-index: 25;
}

.answer-tabs-title {
  text-align: center;
  color: #fef3c7;
  font-size: 12px;
  line-height: 1.1;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin: 0 0 5px 0;
}

.tabs-row {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding: 2px;
  margin-bottom: 0;
  background: linear-gradient(
    180deg,
    rgba(20,10,8,0.34) 0%,
    rgba(255,255,255,0.08) 100%
  );
  border-radius: 12px;
  box-shadow:
    inset 0 1px 0 rgba(0,0,0,0.22),
    inset 0 -1px 0 rgba(255,255,255,0.10);
}


.answer-card-score {
  padding: 7px 10px;
  border-radius: 999px;
  background: #ffffff;
  border: 2px solid currentColor;
  font-size: 14px;
  font-weight: 900;
  box-shadow: 0 4px 10px rgba(15,23,42,0.10);
}
    
.tab-button {
  border: 2px solid rgba(255,255,255,0.28);
  background: rgba(255,255,255,0.14);
  color: #f8fafc;
  border-radius: 999px;
  padding: 10px 13px;
  font-weight: 900;
  font-size: 14px;
  cursor: pointer;
  white-space: nowrap;
}

.tab-button.is-active {
  border-color: #facc15;
  background: #facc15;
  color: #111827;
  box-shadow: 0 0 0 3px rgba(250,204,21,0.22);
}

    .answer-tab-panel {
      display: none;
    }

    .answer-tab-panel.is-active {
      display: block;
    }

        .workspace-card {
      border-radius: 20px;
      padding: 18px;
      border: 3px solid #dbe3f0;
      background: #ffffff;
      box-shadow: 0 12px 26px rgba(15,23,42,0.12);
    }

    .workspace-header {
      display: grid;
      grid-template-columns: minmax(0, 1fr) 150px;
      gap: 16px;
      align-items: stretch;
      margin-bottom: 14px;
    }

    .workspace-header-main {
      min-width: 0;
    }

    .workspace-kicker {
      font-size: 12px;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: #475467;
      margin-bottom: 8px;
    }

    .workspace-question-box {
      padding: 16px 18px;
      border-radius: 18px;
      background: linear-gradient(180deg, #111827 0%, #1f2937 100%);
      color: #f9fafb;
      border: 1px solid rgba(255,255,255,0.16);
    }

    .workspace-question-label {
      font-size: 12px;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #c4b5fd;
      margin-bottom: 7px;
    }

    .workspace-question-text {
      font-size: 19px;
      line-height: 1.55;
      font-weight: 900;
    }

    .workspace-score-box {
      border-radius: 18px;
      padding: 14px;
      background: rgba(255,255,255,0.78);
      border: 2px solid rgba(15,23,42,0.10);
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      min-height: 118px;
      text-align: center;
    }

    .workspace-score {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      font-size: 20px;
      font-weight: 900;
      margin-bottom: 6px;
    }

    .workspace-score-label {
      font-size: 13px;
      font-weight: 900;
      text-transform: uppercase;
      color: #475467;
      letter-spacing: 0.04em;
    }

    .workspace-reading-strip {
      display: grid;
      grid-template-columns: 1.2fr 1fr 0.8fr;
      gap: 12px;
      margin-bottom: 16px;
    }

    .workspace-reading-item {
      border-radius: 16px;
      padding: 13px 14px;
      background: #f8fafc;
      border: 2px solid #dbe3f0;
    }

    .workspace-reading-label {
      font-size: 12px;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #64748b;
      margin-bottom: 6px;
    }

    .workspace-reading-text {
      font-size: 15px;
      line-height: 1.55;
      font-weight: 800;
      color: #111827;
    }

    .workspace-grid {
      display: grid;
      grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
      gap: 16px;
      align-items: start;
    }

    .workspace-column {
      border-radius: 16px;
      padding: 12px;
      border: 3px solid #cbd5e1;
      background: #ffffff;
      min-width: 0;
      box-shadow: 0 8px 18px rgba(15,23,42,0.08);
    }

    .workspace-column-current {
      background: #f8fafc;
      border-color: #94a3b8;
    }

    .workspace-column-training {
    background: #f8fafc;
     border-color: #cbd5e1;
     box-shadow: 0 8px 18px rgba(15,23,42,0.08);
    }
    .workspace-column-title {
      font-size: 18px;
      font-weight: 900;
      color: #111827;
      margin-bottom: 4px;
    }

    .workspace-column-main-title {
  display:flex;
  align-items:center;
  justify-content:center;

  min-height:52px;

  padding:10px 16px;
  margin:
    -14px -14px 16px -14px;

  border-radius:14px 14px 0 0;

  background:
    linear-gradient(
      180deg,
      #818cf8 0%,
      #4338ca 100%
    );

  border-bottom:
    2px solid rgba(255,255,255,0.18);

  color:#ffffff;

  text-align:center;

  font-size:18px;
  line-height:1.2;
  font-weight:900;

  box-shadow:
    inset 0 1px 0 rgba(255,255,255,0.14),
    0 6px 14px rgba(15,23,42,0.12);
}

    .workspace-column-subtitle {
      font-size: 14px;
      line-height: 1.5;
      color: #475467;
      font-weight: 700;
      margin-bottom: 12px;
    }

   .workspace-block {
    display: flex;
    flex-direction: column;
     gap: 10px;
    padding: 12px 14px;
    }

    .workspace-improved-answer {
      margin-top: 14px;
      padding: 14px;
      border-radius: 14px;
      background: #ffffff;
      border: 2px solid #dbe3f0;
      color: #111827;
      font-size: 15px;
      line-height: 1.65;
      font-weight: 700;
    }

    .workspace-qa-details,
.workspace-analysis-details {
  border-radius: 16px;
  border: 2px solid #4f46e5;
  background: #eef2ff;
  overflow: hidden;
}

.workspace-qa-details summary,
.workspace-analysis-details summary {
  min-height: 54px;
  padding: 0 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  cursor: pointer;
  font-size: 15px;
  font-weight: 900;
  color: #111827;
}

.workspace-analysis-details {
  background: #f8fafc;
  border-color: #cbd5e1;
}

.workspace-summary-score {
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 900;
  color: #111827;
  white-space: nowrap;
}

.workspace-summary-score-good {
  background: #bbf7d0;
  border: 1px solid #22c55e;
}

.workspace-summary-score-mid {
  background: #fef3c7;
  border: 1px solid #f59e0b;
}

.workspace-summary-score-weak {
  background: #fecaca;
  border: 1px solid #ef4444;
}

.details-label-open {
  display: none;
}

details[open] .details-label-closed {
  display: none;
}

details[open] .details-label-open {
  display: inline;
}

.workspace-qa-content {
  padding: 16px;
  border-top: 1px solid #c7d2fe;
  background: #1f3550;
}

.workspace-question-box,
.workspace-answer-box {
  padding: 14px;
  border-radius: 14px;
  background: rgba(15, 23, 42, 0.22);
  border: 1px solid rgba(255,255,255,0.14);
}

.workspace-answer-box {
  margin-top: 14px;
}

.qa-question-text.compact,
.qa-answer-text.compact-scroll {
  margin-top: 8px;
  padding: 12px 14px;
  border-left: 4px solid #60a5fa;
  color: #ffffff;
  line-height: 1.55;
  font-weight: 700;
}

.qa-answer-text.compact-scroll {
  max-height: 220px;
  overflow: auto;
  border-left-color: #fb923c;
}

.risk-title-strong {
  font-size: 16px !important;
  font-weight: 900 !important;
}


    .action-item {
      display: grid;
      grid-template-columns: 44px 1fr;
      gap: 12px;
      align-items: stretch;
      border-radius: 14px;
      background: #fff;
      border: 2px solid #dbe3f0;
      padding: 12px;
    }

    .reading-highlight-box {
  background: linear-gradient(180deg, #eaf2ff 0%, #dbeafe 100%);
  border: 2px solid #93c5fd;
  box-shadow: 0 8px 18px rgba(30,64,175,0.10);
  padding: 10px 12px;
}

.reading-highlight-box p {
  margin: 4px 0;
  
}

.reading-highlight-box p:first-of-type {
  font-size: 15px;
  line-height: 1.45;
  font-weight: 900;
  color: #0f172a;
}

        .cv-signal-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-top: 8px;
    }

    .cv-signal-card {
      border-radius: 14px;
      border: 2px solid #dbe3f0;
      background: rgba(255,255,255,0.9);
      padding: 12px;
    }

    .cv-signal-top {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 12px;
      margin-bottom: 8px;
      flex-wrap: wrap;
    }

    .cv-signal-label {
      font-size: 17px;
      font-weight: 900;
      color: #111827;
      line-height: 1.4;
    }

    .cv-signal-impact {
      font-size: 15px;
      line-height: 1.65;
      color: #334155;
      font-weight: 700;
    }

        .cv-simple-list {
      margin-top: 8px;
      margin-bottom: 8px;
      padding-left: 20px;
    }

    .cv-simple-list li {
      font-size: 16px;
      line-height: 1.7;
      font-weight: 700;
      color: #111827;
    }

    .cv-simple-label {
      color: #111827;
    }

    .cv-simple-sep {
      color: #94a3b8;
      padding: 0 6px;
      font-weight: 900;
    }

    .cv-simple-weight {
      color: #475467;
      font-weight: 800;
    }

  .cv-original-box {
  margin-top: 14px;
  border-radius: 14px;
  background: #eef2ff;
  border: 1px solid #c7d2fe;
  overflow: hidden;
}

.cv-original-box summary {
  min-height: 54px;
  padding: 0 18px;
  display: flex;
  align-items: center;
  cursor: pointer;
  font-size: 15px;
  font-weight: 900;
  color: #111827;
}

.cv-original-box summary span {
  display: inline-flex;
  align-items: center;
}

.cv-original-content {
  max-height: 360px;
  overflow: auto;
  padding: 14px 18px;
  border-top: 1px solid #c7d2fe;
  background: #f8fafc;
  white-space: pre-wrap;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 12px;
  line-height: 1.5;
  color: #1f2937;
}

    .premium-soft-note {
  margin-top: 16px;
  padding: 16px 18px;
  border-radius: 16px;
  border: 2px solid #a855f7;
  background: linear-gradient(135deg, rgba(88,28,135,0.92), rgba(49,46,129,0.86));
  color: #f8fafc;
  font-size: 14px;
  line-height: 1.55;
  font-weight: 700;
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.12);
}

.premium-soft-note strong {
  display: inline-block;
  margin-right: 8px;
  padding: 5px 10px;
  border-radius: 9px;
  background: #facc15;
  color: #1e1b4b;
  font-size: 12px;
  font-weight: 900;
  letter-spacing: 0.06em;
}

.premium-soft-note .premium-emphasis {
  color: #facc15;
  font-weight: 900;
}



  .improved-answer-highlight {
  margin-top: 12px;
  padding: 12px 14px;
  border-radius: 16px;
  background: linear-gradient(180deg, #eef2ff 0%, #ddd6fe 100%);
  border: 3px solid #8b5cf6;
  box-shadow: 0 10px 22px rgba(91,33,182,0.16);
}

.improved-answer-title {
  font-size: 16px;
  font-weight: 900;
  color: #4c1d95;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.improved-answer-text {
  font-size: 17px;
  line-height: 1.7;
  font-weight: 800;
  color: #111827;
}

  .answer-segment-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.answer-segment {
  border-radius: 12px;
  padding: 8px 10px;
  border: 2px solid #dbe3f0;
  background: #ffffff;
  box-shadow: 0 4px 10px rgba(15,23,42,0.06);
  border-left-width: 6px;
}

.segment-good {
  background: linear-gradient(180deg, #ecfdf3 0%, #dcfce7 100%);
  border-color: #22c55e;
  border-left-color: #16a34a;
}

.segment-risk {
  background: linear-gradient(180deg, #fef2f2 0%, #fee2e2 100%);
  border-color: #ef4444;
  border-left-color: #dc2626;
}

.segment-warm {
  background: linear-gradient(180deg, #fef9c3 0%, #fde68a 100%);
  border-color: #eab308;
  border-left-color: #ca8a04;
}



.segment-neutral {
  background: linear-gradient(180deg, #f8fafc 0%, #e2e8f0 100%);
  border-color: #cbd5e1;
}

.segment-head {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  align-items: flex-start;
  margin-bottom: 5px;
}

.segment-impact {
  font-size: 12px;
  line-height: 1.2;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #111827;
}

.segment-meta {
  font-size: 11px;
  line-height: 1.3;
  font-weight: 800;
  color: #475467;
  margin-top: 2px;
}

.segment-excerpt {
  font-size: 15px;
  line-height: 1.45;
  font-weight: 900;
  color: #111827;
  margin-bottom: 5px;
}

.segment-reason {
  font-size: 13px;
  line-height: 1.45;
  font-weight: 700;
  color: #334155;
}

.segment-empty {
  border-radius: 14px;
  padding: 10px 12px;
  background: #f8fafc;
  border: 2px dashed #cbd5e1;
  color: #475467;
  font-size: 13px;
  line-height: 1.45;
  font-weight: 700;
}




    .action-index {
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 12px;
      background: linear-gradient(180deg, #7c3aed 0%, #5b21b6 100%);
      color: white;
      font-size: 18px;
      font-weight: 900;
      min-height: 48px;
    }

    ul {
      padding-left: 20px;
      margin-top: 8px;
      margin-bottom: 0;
    }

    li {
      font-size: 15px;
      line-height: 1.6;
    }

    li + li {
      margin-top: 6px;
    }

    .muted {
      color: #6b7280;
      font-size: 15px;
      line-height: 1.5;
    }

  
.workspace-column li + li,
.workspace-block li + li,
.answer-subcard li + li {
  margin-top: 6px;
}

.workspace-column li::marker,
.workspace-block li::marker,
.answer-subcard li::marker {
  font-size: 0.9em;
}

.training-main-title {
  display: block;
  font-size: 20px !important;
  line-height: 1.25;
  font-weight: 900;
  color: #111827;
  background: linear-gradient(180deg, #facc15 0%, #f59e0b 100%);
  border: 3px solid #92400e;
  border-radius: 12px;
  padding: 10px 12px;
  margin-bottom: 12px;
  text-align: center;
}

.tab-score-good {
  border-color: #22c55e;
  box-shadow: inset 0 -4px 0 #22c55e;
}

.tab-score-mid {
  border-color: #facc15;
  box-shadow: inset 0 -4px 0 #facc15;
}

.tab-score-weak {
  border-color: #ef4444;
  box-shadow: inset 0 -4px 0 #ef4444;
}

.tab-button.is-active.tab-score-good {
  background: #dcfce7;
  color: #14532d;
  border-color: #22c55e;
}

.tab-button.is-active.tab-score-mid {
  background: #facc15;
  color: #111827;
  border-color: #facc15;
}

.tab-button.is-active.tab-score-weak {
  background: #fee2e2;
  color: #7f1d1d;
  border-color: #ef4444;
}
   
  .pro-mini-hero {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 22px;
  margin: 10px 0 14px 0;
}

.pro-mini-brand {
  font-size: 15px;
  font-weight: 900;
  letter-spacing: 0.01em;
}

.pro-mini-payoff {
  font-size: 14px;
  font-weight: 800;
  color: #475467;
}
  
  .top-nav-outer {
  margin-bottom: 14px;
  padding: 6px;
  border-radius: 26px;
  background: #020617;
  box-shadow: 0 14px 28px rgba(15,23,42,0.30);
  position: sticky;
  top: 0;
  z-index: 40;
}

.top-nav {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  padding: 9px 12px;
  align-items: center;
  border-radius: 20px;
  background: linear-gradient(180deg, #1d4ed8 0%, #172554 48%, #020617 100%);
  border: 4px solid rgba(255,255,255,0.88);
  box-shadow:
    inset 0 2px 0 rgba(255,255,255,0.35),
    inset 0 -2px 0 rgba(0,0,0,0.35);
}

   /* Layout */
.overview-card-full {
  grid-column: 1 / -1;
}

.overview-card-grid-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

/* Lettura */
.overview-reading-grid {
  display: flex;
  gap: 18px;
  margin-top: 8px;
}

.overview-reading-item {
  flex: 1;
}

.overview-reading-label {
  font-size: 14px;
  font-weight: 900;
  color: #1e3a8a;
  margin-bottom: 4px;
}

.overview-reading-text,
.weighted-text {
  font-size: 15px;
  line-height: 1.55;
  font-weight: 650;
  color: #0f172a;
}

/* Card più forti */
.overview-card.strong {
  border: 2px solid #e2e8f0;
}

.overview-card-good.strong {
  border-color: #22c55e;
  background: linear-gradient(180deg, #f0fdf4 0%, #ffffff 100%);
}

.overview-card-risk.strong {
  border-color: #ef4444;
  background: linear-gradient(180deg, #fef2f2 0%, #ffffff 100%);
}

/* Weighted list */
.weighted-item {
  display: grid;
  grid-template-columns: 22px 1fr;
  gap: 12px;
  margin-bottom: 10px;
  font-size: 15px;
  align-items: start;
}

.weighted-dot {
  width: 8px;
  height: 8px;
  min-width: 8px;
  min-height: 8px;
  border-radius: 999px;
  margin-top: 6px;
  display: block;
}

.weighted-item.high .weighted-dot { background: #ef4444; }
.weighted-item.mid .weighted-dot { background: #f59e0b; }
.weighted-item.low .weighted-dot { background: #94a3b8; }

.weighted-text {
  line-height: 1.4;
}

/* Coach box */
.overview-coach-box.strong {
  margin-top: 14px;
  padding: 16px;
  border-radius: 16px;
  background: linear-gradient(180deg, #312e81 0%, #1e1b4b 100%);
  border: 3px solid #a78bfa;
  box-shadow: 0 10px 22px rgba(124,58,237,0.22);
  color: #ffffff;
}

.overview-coach-box .weighted-text {
  color: #ffffff;
  font-size: 15px;
  font-weight: 750;
}

.overview-coach-box .weighted-dot {
  background: #facc15;
}



/* Pitch highlight */
.overview-pitch-box {
  margin-top: 16px;
  padding: 14px 16px;
  border-radius: 14px;

  background: linear-gradient(180deg, #0f172a 0%, #020617 100%);
  border: 2px solid #facc15;

  box-shadow: 0 10px 22px rgba(0,0,0,0.25);
}

.overview-pitch-label {
  font-size: 16px;
  font-weight: 900;
  color: #facc15;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.overview-pitch-text {
  font-size: 17px;
  line-height: 1.65;
  font-weight: 850;
  color: #f8fafc;
}

.overview-card,
.overview-card p,
.overview-card li,
.overview-card .weighted-text,
.overview-card .overview-reading-text {
  color: #0f172a;
}



.overview-reading-label {
  color: #334155;
  font-size: 13px;
  font-weight: 900;
}

.overview-reading-text {
  font-size: 15px;
  line-height: 1.5;
  font-weight: 650;
}

.overview-card {
  position: relative;
  padding-top: 42px;
}

  .overview-card {
  position: relative;
  padding-top: 44px;
}




/* BASE */
.overview-card > .overview-card-title {
  position: absolute;
  top: 0;
  left: 14px;
  right: 14px;
  text-align: center;
  padding: 8px 10px;
  border-radius: 0 0 12px 12px;
  border-top: 0;
  font-size: 16px;
  font-weight: 900;
  color: #0f172a;
}

/* BLU - LETTURA */
.overview-card-neutral > .overview-card-title {
  background: linear-gradient(180deg, #60a5fa 0%, #2563eb 100%);
  color: #ffffff;
  border: 2px solid #1d4ed8;
}

/* VERDE - POSITIVO */
.overview-card-good > .overview-card-title {
  background: linear-gradient(180deg, #4ade80 0%, #16a34a 100%);
  color: #052e16;
  border: 2px solid #15803d;
}

/* ROSSO - CRITICO */
.overview-card-risk > .overview-card-title {
  background: linear-gradient(180deg, #f87171 0%, #dc2626 100%);
  color: #ffffff;
  border: 2px solid #b91c1c;
}




.overview-coach-box .overview-card-title {
  color: #facc15;
  font-size: 20px;
  font-weight: 900;
  margin-bottom: 10px;
}

.overview-coach-box .weighted-text {
  color: #f8fafc;
  font-size: 15px;
  font-weight: 750;
}

    .overview-card-good .overview-card-title {
  background: linear-gradient(180deg, #bbf7d0 0%, #86efac 100%);
  border-color: #22c55e;
}

.overview-card-risk .overview-card-title {
  background: linear-gradient(180deg, #fecaca 0%, #fca5a5 100%);
  border-color: #ef4444;
}

.overview-coach-box .overview-card-title {
  background: linear-gradient(180deg, #ddd6fe 0%, #c4b5fd 100%);
  border-color: #8b5cf6;
}

   .answer-card-question-highlight {
  margin: 12px 0 14px 0;
  padding: 12px 14px;
  border-radius: 14px;
  background: #111827;
  color: #f8fafc;
  border: 2px solid rgba(255,255,255,0.14);
  font-size: 17px;
  line-height: 1.45;
}

   .answer-card-question-small {
  margin: 10px 0;
  font-size: 14px;
  line-height: 1.45;
  font-weight: 700;
  color: #334155;
}

.answer-card-action-highlight {
  margin: 10px 0 14px 0;
  padding: 12px 14px;
  border-radius: 14px;
  background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%);
  color: #f8fafc;
  border: 2px solid rgba(255,255,255,0.18);
  font-size: 16px;
  line-height: 1.55;
  font-weight: 850;
}

.answer-card,
.answer-subcard,
.answer-subcard-risk,
.answer-subcard-warm {
  background: #ffffff;
  color: #0f172a;
}

.answer-subcard li,
.answer-subcard p {
  color: #0f172a;
}


  .overview-card > .overview-card-title {
  background: linear-gradient(180deg, #1e3a8a 0%, #172554 100%);
  color: #ffffff;
  border-color: #93c5fd;
}

.overview-coach-box .overview-card-title {
  color: #facc15;
  background: transparent;
  border: 0;
  font-size: 20px;
  font-weight: 900;
}

.overview-pitch-note {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid rgba(250,204,21,0.35);
  color: #fde68a;
  font-size: 14px;
  line-height: 1.55;
  font-weight: 800;
}



    .featured-answer-qa-box {
  margin: 10px 0 12px 0;
  border-radius: 16px;
  overflow: hidden;
  border: 2px solid #334155;
  box-shadow: 0 8px 18px rgba(15,23,42,0.10);
}

.featured-answer-question,
.featured-answer-response {
  padding: 12px 14px;
  font-size: 15px;
  line-height: 1.55;
  font-weight: 750;
}

.featured-answer-question {
  font-size: 16px;
  font-weight: 800;
}



.featured-answer-response {
  font-size: 16px;
  font-weight: 750;
}



.featured-answer-question span,
.featured-answer-response span {
  color: #facc15;
  font-size: 12px;
  font-weight: 900;
}

.answer-card-summary {
  margin-top: 10px;
  padding: 10px 12px;
  border-radius: 12px;

  background: #f1f5f9;
  border-left: 5px solid #f59e0b;

  font-size: 15px;
  font-weight: 800;
  line-height: 1.55;
}


    .workspace-analysis-column {
  background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%);
  border: 3px solid #60a5fa;
  color: #f8fafc;
  box-shadow: 0 10px 22px rgba(15,23,42,0.18);
}

.workspace-advice-column {
  background: linear-gradient(180deg, #3a2a08 0%, #1f1604 100%);
  border: 3px solid #facc15;
  color: #fefce8;
  box-shadow: 0 10px 22px rgba(120,53,15,0.24);
}

.workspace-analysis-column .workspace-column-main-title {
  background: linear-gradient(180deg, #818cf8 0%, #4338ca 100%);
  color: #ffffff;
  border: 2px solid #a5b4fc;
  border-radius: 0 0 12px 12px;
  padding: 11px 12px;
  margin: -12px 0 16px 0;
  font-size: 19px;
  line-height: 1.25;
  font-weight: 900;
  text-align: center;
  box-shadow: 0 6px 14px rgba(67,56,202,0.20);
}

.workspace-analysis-column .answer-segment,
.workspace-analysis-column .answer-segment p,
.workspace-analysis-column .answer-segment div {
  font-size: 15px;
  line-height: 1.55;
}

.workspace-analysis-column .answer-segment-title,
.workspace-analysis-column .answer-segment-label {
  font-size: 13px;
  font-weight: 900;
  letter-spacing: 0.04em;
}


.workspace-advice-column .answer-subcard-title {
  background: linear-gradient(180deg, #facc15 0%, #f59e0b 100%);
  color: #111827;
  border: 2px solid #fde68a;
  border-radius: 0 0 12px 12px;
  padding: 9px 12px;
  margin: -14px 0 14px 0;
  font-size: 18px;
  font-weight: 900;
  text-align: center;
}

.workspace-analysis-column,
.workspace-advice-column,
.workspace-analysis-column li,
.workspace-advice-column li,
.workspace-analysis-column p,
.workspace-advice-column p {
  font-size: 15px;
  line-height: 1.6;
  font-weight: 750;
}

.workspace-analysis-column li,
.workspace-analysis-column p {
  color: #f8fafc;
}

.workspace-advice-column li,
.workspace-advice-column p {
  color: #fefce8;
}

.workspace-analysis-column .workspace-block {
  background: rgba(255,255,255,0.08);
  border: 2px solid rgba(255,255,255,0.14);
  border-radius: 14px;
  margin-bottom: 12px;
}

.workspace-advice-column > ul {
  background: rgba(250,204,21,0.14);
  border: 2px solid rgba(250,204,21,0.32);
  border-radius: 14px;
  padding: 12px 16px 12px 28px !important;
}
  
   .overview-card-neutral > .overview-card-title {
  background: linear-gradient(180deg, #818cf8 0%, #4338ca 100%);
  color: #ffffff;
  border: 2px solid #a5b4fc;
}

.overview-card-good > .overview-card-title {
  background: linear-gradient(180deg, #22c55e 0%, #14532d 100%);
  color: #ffffff;
  border: 2px solid #86efac;
}

.overview-card-risk > .overview-card-title {
  background: linear-gradient(180deg, #ef4444 0%, #7f1d1d 100%);
  color: #ffffff;
  border: 2px solid #fca5a5;
}

.overview-pro-note {
  color: #facc15;
  background: rgba(250,204,21,0.10);
  border-color: rgba(250,204,21,0.35);
}

.weighted-dot {
  width: 18px;
  height: 18px;
  min-width: 18px;
  min-height: 18px;
  margin-top: 3px;
  border: 2px solid rgba(255,255,255,0.75);
}

  .weighted-legend {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin: 10px 0 14px 0;
  color: #e5e7eb;
  font-size: 13px;
  font-weight: 800;
}

.weighted-legend span {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}


.reading-highlight-box .answer-subcard-title {
  font-size: 18px;
  font-weight: 900;
  color: #0f172a;
  margin-bottom: 8px;
}

.legend-dot {
  width: 12px;
  height: 12px;
  border-radius: 999px;
  display: inline-block;
}


.answer-card-score.status-ok {
  background: #16a34a;
  color: #ffffff;
  border-color: #bbf7d0;
}

.answer-card-score.status-mid {
  background: #facc15;
  color: #111827;
  border-color: #fef3c7;
}

.answer-card-score.status-weak {
  background: #dc2626;
  color: #ffffff;
  border-color: #fecaca;
}

.workspace-analysis-column .workspace-column-main-title {
  display: block;
  width: 100%;
  box-sizing: border-box;
  margin: 0 0 14px 0 !important;
}

.workspace-block-after-title {
  margin-top: 0;
}


.featured-answer-card {
  border-radius: 18px;
  padding: 18px;
  border: 3px solid #334155;
  box-shadow: 0 12px 24px rgba(15,23,42,0.18);
  color: #f8fafc;
}

.featured-answer-critical {
  background: linear-gradient(180deg, #3b0d0d 0%, #1f0707 100%);
  border-color: #ef4444;
}

.featured-answer-strong {
  background: linear-gradient(180deg, #064e3b 0%, #022c22 100%);
  border-color: #22c55e;
}

.featured-answer-neutral {
  background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%);
  border-color: #64748b;
}

.featured-answer-card .answer-card-kicker {
  font-size: 18px;
  line-height: 1.25;
  font-weight: 900;
  color: #ffffff;
}

.featured-answer-card .answer-card-score {
  padding: 7px 11px;
  border-radius: 999px;
  font-size: 14px;
  font-weight: 900;
  border: 2px solid rgba(255,255,255,0.75);
}

.featured-answer-card .answer-card-score.status-weak {
  background: #dc2626;
  color: #ffffff;
}

.featured-answer-card .answer-card-score.status-mid {
  background: #facc15;
  color: #111827;
}

.featured-answer-card .answer-card-score.status-ok {
  background: #16a34a;
  color: #ffffff;
}

.featured-answer-qa-box {
  margin: 12px 0;
  border-radius: 16px;
  overflow: hidden;
  border: 2px solid rgba(255,255,255,0.22);
  box-shadow: 0 8px 18px rgba(0,0,0,0.22);
}

.featured-answer-question,
.featured-answer-response {
  padding: 13px 15px;
  font-size: 16px;
  line-height: 1.55;
  font-weight: 800;
}

.featured-answer-question {
  background: linear-gradient(180deg, #111827 0%, #1e293b 100%);
  color: #f8fafc;
}

.featured-answer-response {
  background: linear-gradient(180deg, #fef3c7 0%, #fde68a 100%);
  color: #111827;
  border-top: 2px solid rgba(0,0,0,0.25);
}

.featured-answer-question span,
.featured-answer-response span {
  display: block;
  margin-bottom: 5px;
  font-size: 13px;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.featured-answer-question span {
  color: #facc15;
}

.featured-answer-response span {
  color: #7c2d12;
}

.featured-answer-summary-box {
  margin: 12px 0;
  padding: 12px 14px;
  border-radius: 14px;
  background: rgba(255,255,255,0.12);
  border-left: 6px solid #facc15;
  color: #ffffff;
  font-size: 16px;
  line-height: 1.55;
  font-weight: 850;
}


.featured-answer-summary-inside {
  margin-top: 12px;
  padding: 12px 14px;
  border-radius: 12px;
  background: linear-gradient(180deg, #4a0f1f 0%, #2a0710 100%);
  color: #fff7ed;
  border: 3px solid #f97316;
  font-size: 16px;
  line-height: 1.58;
  font-weight: 900;
  box-shadow: 0 8px 18px rgba(74,15,31,0.26);
}

.featured-analysis-grid {
  background: transparent;
  border: 0;
  border-radius: 0;
  padding: 0;
  gap: 14px;
}

.featured-subcard-risk {
  border-left: 8px solid #ef4444;
  border-top: 2px solid rgba(248,113,113,0.6);
  border-right: 2px solid rgba(248,113,113,0.6);
  border-bottom: 2px solid rgba(248,113,113,0.6);

  background: linear-gradient(180deg, #3b0d0d 0%, #1a0606 100%);
  box-shadow: inset 0 0 0 1px rgba(248,113,113,0.15);
}

.featured-subcard-advice {
  border-left: 8px solid #22c55e;
  border-top: 2px solid rgba(74,222,128,0.6);
  border-right: 2px solid rgba(74,222,128,0.6);
  border-bottom: 2px solid rgba(74,222,128,0.6);

  background: linear-gradient(180deg, #064e3b 0%, #022c22 100%);
  box-shadow: inset 0 0 0 1px rgba(74,222,128,0.15);
}

.impact-item {
  display: grid;
  grid-template-columns: 74px 1fr;
  gap: 10px;
  align-items: start;
  margin-bottom: 10px;
}

.impact-dots {
  display: flex;
  gap: 4px;
  padding: 6px;
  border-radius: 999px;
  background: rgba(0,0,0,0.28);
  border: 1px solid rgba(255,255,255,0.22);
}

.impact-dot {
  width: 11px;
  height: 11px;
  border-radius: 999px;
  border: 2px solid rgba(255,255,255,0.75);
  background: transparent;
}

.impact-risk .impact-dot.is-filled {
  background: #f87171;
  border-color: #fecaca;
}

.impact-advice .impact-dot.is-filled {
  background: #4ade80;
  border-color: #bbf7d0;
}

.impact-text {
  color: #f8fafc;
  font-size: 15px;
  line-height: 1.55;
  font-weight: 800;
}

.featured-answer-action-box {
  margin: 12px 0 14px 0;
  padding: 13px 15px;
  border-radius: 14px;
  background: linear-gradient(180deg, #facc15 0%, #f59e0b 100%);
  color: #111827;
  border: 3px solid #fde68a;
  font-size: 16px;
  line-height: 1.55;
  font-weight: 900;
}

.featured-answer-action-label {
  font-size: 12px;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 5px;
  color: #78350f;
}

.featured-subcard {
  background: rgba(255,255,255,0.10);
  border: 2px solid rgba(255,255,255,0.20);
  color: #f8fafc;
}

.featured-subcard .answer-subcard-title {
  font-size: 15px;
  line-height: 1.25;
  font-weight: 900;
  color: #facc15;
  margin-bottom: 8px;
}

.featured-subcard li,
.featured-subcard p {
  color: #f8fafc;
  font-size: 15px;
  line-height: 1.55;
  font-weight: 750;
}



.impact-item {
  display: grid;
  grid-template-columns: 82px 1fr;
  gap: 12px;
  align-items: start;
  margin-bottom: 10px;
}

.impact-priority {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 7px;
  border-radius: 999px;
  background: rgba(0,0,0,0.32);
  border: 1px solid rgba(255,255,255,0.24);
  color: #f8fafc;
  font-size: 11px;
  font-weight: 900;
  text-transform: uppercase;
}

.impact-priority-dot {
  width: 12px;
  height: 12px;
  border-radius: 999px;
  display: inline-block;
  border: 2px solid rgba(255,255,255,0.72);
}

.impact-priority-high .impact-priority-dot {
  background: #ef4444;
}

.impact-priority-mid .impact-priority-dot {
  background: #f59e0b;
}

.impact-priority-low .impact-priority-dot {
  background: #94a3b8;
}


.legend-dot.high { background: #ef4444; }
.legend-dot.mid { background: #f59e0b; }
.legend-dot.low { background: #94a3b8; }

.workspace-analysis-column .workspace-column-main-title {
  display: block !important;
  width: 100% !important;
  box-sizing: border-box !important;
  background: linear-gradient(180deg, #818cf8 0%, #4338ca 100%) !important;
  color: #ffffff !important;
  border: 2px solid #a5b4fc !important;
  border-radius: 0 0 12px 12px !important;
  padding: 11px 12px !important;
  margin: -12px 0 16px 0 !important;
  font-size: 19px !important;
  line-height: 1.25 !important;
  font-weight: 900 !important;
  text-align: center !important;
}

.featured-context-link-note {
  margin-top: 12px;
  padding: 12px 14px;
  border-radius: 12px;
  background: linear-gradient(180deg, #312e81 0%, #1e1b4b 100%);
  color: #f8fafc;
  border: 2px solid #a78bfa;
  font-size: 15px;
  line-height: 1.55;
  font-weight: 850;
}

.featured-context-link-title {
  color: #facc15;
  font-size: 12px;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 5px;
}


/* === SCROLL SOLO SU TESTO RISPOSTE === */

.featured-answer-response-text {
  max-height: 190px;
  overflow-y: auto;
  overflow-x: hidden;
  padding-right: 6px;
  width: 100%;
  box-sizing: border-box;

  white-space: pre-wrap;
  overflow-wrap: break-word;
  word-break: break-word;
}

/* Pagina RISPOSTE */
.qa-question-text,
.qa-answer-text {
  max-height: 220px;
  overflow-y: auto;
  overflow-x: hidden;
  width: 100%;
  box-sizing: border-box;

  white-space: pre-wrap;
  overflow-wrap: break-word;
  word-break: break-word;
}

/* === SCROLLBAR === */

.featured-answer-response-text::-webkit-scrollbar,
.qa-question-text::-webkit-scrollbar,
.qa-answer-text::-webkit-scrollbar {
  width: 8px;
}

.featured-answer-response-text::-webkit-scrollbar-thumb,
.qa-question-text::-webkit-scrollbar-thumb,
.qa-answer-text::-webkit-scrollbar-thumb {
  background: rgba(255,255,255,0.35);
  border-radius: 999px;
}


.first-correction-alert {
  margin-top: 10px;
  padding: 12px 14px;
  border-radius: 14px;
  border: 3px solid #cbd5e1;
  background: #f8fafc;
}

.first-correction-alert.is-severe {
  background: linear-gradient(180deg, #7f1d1d 0%, #450a0a 100%);
  border-color: #f87171;
  color: #ffffff;
  box-shadow: 0 8px 18px rgba(127,29,29,0.22);
}

.first-correction-alert.is-warning {
  background: linear-gradient(180deg, #facc15 0%, #f59e0b 100%);
  border-color: #fde68a;
  color: #111827;
}

.first-correction-alert.is-neutral {
  background: linear-gradient(180deg, #e0f2fe 0%, #bae6fd 100%);
  border-color: #38bdf8;
  color: #0f172a;
}

.first-correction-label {
  font-size: 12px;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 5px;
}

.first-correction-text {
  font-size: 16px;
  line-height: 1.5;
  font-weight: 900;
}

  .workspace-context-link-note {
  margin-top: 12px;
  padding: 12px 14px;
  border-radius: 14px;
  background: linear-gradient(180deg, #312e81 0%, #1e1b4b 100%);
  border: 3px solid #a78bfa;
  color: #f8fafc;
  box-shadow: 0 8px 18px rgba(49,46,129,0.22);
}

.workspace-context-link-title {
  color: #facc15;
  font-size: 12px;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 6px;
}

.workspace-context-link-text {
  font-size: 15px;
  line-height: 1.55;
  font-weight: 850;
}

/* === BLOCCO RISCHI (ROSSO) === */
.workspace-block-risk {
  background: linear-gradient(180deg, #3b0d0d 0%, #1a0606 100%);
  border-left: 6px solid #ef4444;
  border-radius: 12px;
  padding: 12px;
}

.workspace-block-risk .answer-subcard-title {
  color: #f87171;
}

/* === BLOCCO POSITIVO (VERDE) === */
.workspace-block-positive {
  background: linear-gradient(180deg, #064e3b 0%, #022c22 100%);
  border-left: 6px solid #22c55e;
  border-radius: 12px;
  padding: 12px;
}

.workspace-block-positive .answer-subcard-title {
  color: #4ade80;
}

/* testo interno leggibile */
.workspace-block-risk li,
.workspace-block-risk p,
.workspace-block-positive li,
.workspace-block-positive p {
  color: #f8fafc;
  font-size: 15px;
  line-height: 1.55;
  font-weight: 750;
}

.opening-assessment-box {
  margin: 6px 0 14px 0;
  padding: 13px 15px;
  border-radius: 14px;
  background: linear-gradient(180deg, #4a0f1f 0%, #2a0710 100%);
  color: #fff7ed;
  border: 3px solid #f97316;
  font-size: 16px;
  line-height: 1.58;
  font-weight: 900;
  box-shadow: 0 8px 18px rgba(74,15,31,0.22);
}

.duplicate-answer-warning {
  margin-top: 12px;
  padding: 13px 15px;
  border-radius: 14px;
  background: linear-gradient(180deg, #7f1d1d 0%, #450a0a 100%);
  border: 3px solid #f87171;
  color: #ffffff;
  box-shadow: 0 8px 18px rgba(127,29,29,0.24);
}

.duplicate-answer-warning-title {
  color: #facc15;
  font-size: 13px;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 6px;
}

.duplicate-answer-warning-text {
  font-size: 16px;
  line-height: 1.55;
  font-weight: 850;
}

  .opening-credit-box {
  margin: 10px 0 14px 0;
  padding: 13px 15px;
  border-radius: 14px;
  border: 3px solid #cbd5e1;
  box-shadow: 0 8px 18px rgba(15,23,42,0.14);
}

.opening-credit-risk {
  background: linear-gradient(180deg, #4a0f1f 0%, #2a0710 100%);
  border-color: #f87171;
  color: #fff7ed;
}

.opening-credit-warm {
  background: linear-gradient(180deg, #78350f 0%, #451a03 100%);
  border-color: #facc15;
  color: #fff7ed;
}

.opening-credit-good {
  background: linear-gradient(180deg, #064e3b 0%, #022c22 100%);
  border-color: #4ade80;
  color: #ecfdf5;
}

.opening-credit-label {
  color: #facc15;
  font-size: 12px;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 5px;
}

.opening-credit-value {
  font-size: 18px;
  font-weight: 900;
  margin-bottom: 5px;
}

.opening-credit-text {
  font-size: 15px;
  line-height: 1.55;
  font-weight: 800;
} 

.overview-priority-box {
  background: linear-gradient(180deg, #1e293b 0%, #020617 100%);
  border: 3px solid #facc15;
  padding: 18px;
}

.priority-item {
  display: flex;
  align-items: center;
  gap: 14px;
  font-size: 18px;
  font-weight: 900;
  color: #f8fafc;
  margin-bottom: 12px;
}

.priority-index {
  background: #ef4444;
  color: #fff;
  font-size: 16px;
  font-weight: 900;
  border-radius: 999px;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.priority-text {
  flex: 1;
}


.overview-priorities-block {
  padding: 14px 16px;
}

.overview-standard-title {
  text-align: center;
  font-size: 20px;
  line-height: 1.25;
  font-weight: 900;
  color: #ffffff;
  background: linear-gradient(180deg, #818cf8 0%, #4338ca 100%);
  border: 2px solid #a5b4fc;
  border-radius: 0 0 14px 14px;
  padding: 10px 14px;
  margin: -14px 8px 14px 8px;
}

.overview-priority-box.compact {
  background: linear-gradient(180deg, #1e293b 0%, #020617 100%);
  border: 3px solid #facc15;
  padding: 12px 14px;
}

.priority-item.compact {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 16px;
  font-weight: 900;
  color: #f8fafc;
  margin-bottom: 8px;
}

.priority-item.compact:last-child {
  margin-bottom: 0;
}

.priority-index {
  background: #ef4444;
  color: #fff;
  font-size: 14px;
  font-weight: 900;
  border-radius: 999px;
  width: 26px;
  height: 26px;
  min-width: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.compact-priority-list {
  margin-top: 10px;
}

.overview-priority-item.compact {
  margin-bottom: 8px;
  font-size: 16px;
}

.overview-priority-item.compact:last-child {
  margin-bottom: 0;
}

.priority-hot-block {
  border: 4px solid #ef4444 !important;
  background: linear-gradient(180deg, #4a0f1f 0%, #220711 100%) !important;
  box-shadow: 0 14px 28px rgba(127,29,29,0.28);
}

.priority-hot-block .overview-standard-title {
  background: linear-gradient(180deg, #ef4444 0%, #7f1d1d 100%) !important;
  border: 3px solid #fca5a5 !important;
  color: #ffffff !important;
}

.priority-hot-block .overview-priority-box.compact {
  background: linear-gradient(180deg, #7f1d1d 0%, #3f0a0a 100%) !important;
  border: 3px solid #f87171 !important;
  padding: 12px 14px;
}

.priority-hot-block .priority-index {
  background: #facc15 !important;
  color: #111827 !important;
  border: 2px solid #fde68a;
}

.priority-hot-block .priority-text {
  color: #fff7ed !important;
  font-size: 16px;
  line-height: 1.45;
}

/* 🔥 FIX VISIBILITÀ TESTI PRIORITÀ */
.priority-hot-block .priority-text {
  color: #ffffff !important;
}

.priority-hot-block .priority-item {
  color: #ffffff !important;
}

.priority-hot-block .overview-priority-box {
  color: #ffffff !important;
}

/* 🔥 FORCE VISIBILITY PRIORITIES (ULTIMO BLOCCO CSS) */
.priority-hot-block * {
  color: #ffffff !important;
}

.priority-hot-block .priority-text {
  font-size: 18px !important;
  font-weight: 900 !important;
  line-height: 1.5 !important;
}

.priority-hot-block .priority-index {
  font-size: 16px !important;
  font-weight: 900 !important;
}

.priority-hot-block .priority-item,
.priority-hot-block .priority-text,
.priority-hot-block .priority-text * {
  color: #ffffff !important;
  -webkit-text-fill-color: #ffffff !important;
  opacity: 1 !important;
  visibility: visible !important;
  mix-blend-mode: normal !important;
  text-shadow: 0 1px 2px rgba(0,0,0,0.45);
}

.priority-hot-block .priority-text {
  position: relative !important;
  z-index: 5 !important;
  display: block !important;
  font-size: 18px !important;
  font-weight: 900 !important;
  line-height: 1.45 !important;
}

.priority-hot-block .priority-item {
  position: relative !important;
  z-index: 4 !important;
}

.priority-hot-block .overview-priority-box.compact,
.priority-hot-block .priority-item {
  position: relative !important;
  z-index: 2 !important;
}

.hot-priority-box {
  background: linear-gradient(180deg, #7f1d1d 0%, #3f0a0a 100%) !important;
  border: 4px solid #f87171 !important;
  border-radius: 16px !important;
  padding: 14px 16px !important;
}

.hot-priority-row {
  display: flex !important;
  align-items: center !important;
  gap: 14px !important;
  margin-bottom: 10px !important;
}

.hot-priority-row:last-child {
  margin-bottom: 0 !important;
}

.hot-priority-index {
  width: 30px !important;
  height: 30px !important;
  min-width: 30px !important;
  border-radius: 999px !important;
  background: #facc15 !important;
  color: #111827 !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  font-size: 16px !important;
  font-weight: 900 !important;
}

.hot-priority-text {
  color: #ffffff !important;
  -webkit-text-fill-color: #ffffff !important;
  font-size: 18px !important;
  line-height: 1.45 !important;
  font-weight: 900 !important;
}


.qa-standard-title {
  text-align: center;
  font-size: 20px;
  line-height: 1.25;
  font-weight: 900;
  color: #ffffff;
  background: linear-gradient(180deg, #818cf8 0%, #4338ca 100%);
  border: 2px solid #a5b4fc;
  border-radius: 0 0 14px 14px;
  padding: 10px 14px;
  margin: -14px 8px 14px 8px;
}

.cv-pro-block {
  margin-top: 0;
}

.cv-pro-text {
  font-size: 15px;
  line-height: 1.6;
  font-weight: 750;
  color: #0f172a;
}

.cv-pro-block .overview-card li,
.cv-pro-block .overview-card p {
  font-size: 15px;
  line-height: 1.58;
  font-weight: 750;
}

.cv-document-read-box {
  margin: 14px 0 16px 0;
  padding: 16px;
  border-radius: 18px;
  background: linear-gradient(180deg, #111827 0%, #020617 100%);
  border: 3px solid #facc15;
  color: #f8fafc;
  box-shadow: 0 12px 24px rgba(15,23,42,0.22);
}

.cv-document-title {
  text-align: center;
  font-size: 19px;
  line-height: 1.25;
  font-weight: 900;
  color: #111827;
  background: linear-gradient(180deg, #facc15 0%, #f59e0b 100%);
  border: 2px solid #fde68a;
  border-radius: 0 0 14px 14px;
  padding: 9px 12px;
  margin: -16px 10px 14px 10px;
}

.cv-document-headline {
  font-size: 17px;
  line-height: 1.55;
  font-weight: 900;
  color: #ffffff;
  margin-bottom: 14px;
}

.cv-document-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.cv-document-item {
  padding: 12px 14px;
  border-radius: 14px;
  background: rgba(255,255,255,0.10);
  border: 2px solid rgba(255,255,255,0.18);
}

.cv-document-label {
  color: #facc15;
  font-size: 12px;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 6px;
}

.cv-document-text {
  color: #f8fafc;
  font-size: 15px;
  line-height: 1.55;
  font-weight: 800;
}

.cv-support-title {
  margin-top: 16px;
  margin-bottom: 14px;
}

.cv-parsed-profile-box {
  margin: 12px 0 16px 0;
  border-radius: 14px;
  background: #f8fafc;
  border: 2px solid #cbd5e1;
  overflow: hidden;
}

.cv-parsed-profile-box summary {
  cursor: pointer;
  padding: 12px 14px;
  font-size: 15px;
  font-weight: 900;
  color: #0f172a;
  background: linear-gradient(180deg, #e2e8f0 0%, #cbd5e1 100%);
}

.cv-parsed-content {
  max-height: 260px;
  overflow-y: auto;
  padding: 14px 16px;
  font-size: 15px;
  line-height: 1.55;
  color: #0f172a;
}

.cv-reading-headline {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.cv-reading-main {
  padding: 14px;
  border-radius: 14px;
  background: #f8fafc;
  border: 1px solid #dbe4ee;
}

.cv-reading-main-label {
  font-size: 11px;
  font-weight: 900;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #64748b;
  margin-bottom: 6px;
}

.cv-reading-main-role {
  font-size: 20px;
  font-weight: 900;
  color: #111827;
  line-height: 1.1;
}

.cv-reading-main-seniority {
  margin-top: 8px;
  font-size: 13px;
  color: #475569;
  line-height: 1.4;
}

.cv-reading-summary {
  font-size: 14px;
  line-height: 1.6;
  color: #334155;
  padding: 14px;
  border-radius: 14px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
}

.workspace-summary-score {
  min-width: 86px;
  padding: 7px 12px;
  border-radius: 999px;
  font-size: 15px;
  font-weight: 900;
  color: #ffffff;
  white-space: nowrap;
  text-align: center;
  box-shadow: 0 4px 10px rgba(15,23,42,0.18);
}

.workspace-summary-score-good {
  background: #16a34a;
  border: 2px solid #bbf7d0;
}

.workspace-summary-score-mid {
  background: #d97706;
  border: 2px solid #fde68a;
}

.workspace-summary-score-weak {
  background: #dc2626;
  border: 2px solid #fecaca;
}

.workspace-summary-score::first-letter {
  font-size: 19px;
}

.workspace-qa-content.compact {
  padding: 12px;
  border-top: 1px solid #c7d2fe;
  background: #1f3550;
}

.workspace-question-box.compact,
.workspace-answer-box.compact {
  padding: 10px 12px;
  border-radius: 12px;
  background: rgba(15, 23, 42, 0.18);
  border: 1px solid rgba(255,255,255,0.12);
}

.workspace-answer-box.compact {
  margin-top: 10px;
}

.qa-question-text.compact,
.qa-answer-text.compact-scroll {
  margin-top: 6px;
  padding: 8px 10px;
  border-left: 3px solid #60a5fa;
  color: #ffffff;
  line-height: 1.42;
  font-weight: 700;
  text-indent: 0 !important;
  margin-left: 0 !important;
}

.qa-answer-text.compact-scroll {
  max-height: 150px;
  overflow: auto;
  border-left-color: #fb923c;
}

.workspace-analysis-details .cv-parsed-content {
  max-height: none !important;
  overflow: visible !important;
}

.workspace-qa-details .qa-question-text,
.workspace-qa-details .qa-answer-text {
  text-align: left !important;
  text-indent: 0 !important;
  padding-left: 10px !important;
  margin-left: 0 !important;
  transform: none !important;
}

.workspace-qa-details .qa-question-text.compact,
.workspace-qa-details .qa-answer-text.compact-scroll {
  white-space: normal !important;
  text-align: left !important;
  text-indent: 0 !important;
  padding: 8px 10px !important;
  margin: 6px 0 0 0 !important;
  transform: none !important;
  display: block !important;
  line-height: 1.4 !important;
}

.workspace-qa-details .workspace-qa-content.compact {
  padding: 10px 12px !important;
}

.workspace-qa-details .workspace-question-box.compact,
.workspace-qa-details .workspace-answer-box.compact {
  padding: 9px 11px !important;
}

.workspace-qa-details .workspace-answer-box.compact {
  margin-top: 8px !important;
}

.compact-label {
  display: block !important;
  color: #facc15 !important;
  font-size: 12px !important;
  font-weight: 900 !important;
  letter-spacing: 0.05em !important;
  text-transform: uppercase !important;
  margin-bottom: 4px !important;
}

.workspace-summary-score {
  min-width: 98px !important;
  padding: 8px 14px !important;
  border-radius: 999px !important;
  color: #ffffff !important;
  font-size: 18px !important;
  font-weight: 900 !important;
  text-align: center !important;
}

.workspace-summary-score-good {
  background: #15803d !important;
  border: 2px solid #86efac !important;
}

.workspace-summary-score-mid {
  background: #d97706 !important;
  border: 2px solid #fde68a !important;
}

.workspace-summary-score-weak {
  background: #dc2626 !important;
  border: 2px solid #fecaca !important;
}

.cv-support-read-box {
  margin-top: 14px;
  padding: 14px;
  border-radius: 16px;
  border: 2px solid #1d4ed8;
  background: linear-gradient(180deg, #eff6ff 0%, #dbeafe 100%);
}

.cv-support-title {
  font-size: 15px;
  font-weight: 900;
  color: #1e3a8a;
  margin-bottom: 8px;
}

.cv-support-bridge {
  font-size: 14px;
  line-height: 1.5;
  color: #1e3a8a;
  font-weight: 700;
  margin: 0 0 12px 0;
}

.cv-support-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-top: 10px;
}

.cv-support-column {
  border-radius: 14px;
  padding: 12px;
  background: #ffffff;
  border: 1px solid #bfdbfe;
}

.cv-support-column-title {
  display:flex;
  align-items:center;
  justify-content:center;

  min-height:48px;

  padding:10px 14px;
  margin-bottom:12px;

  border-radius:12px;

  color:#ffffff;

  font-size:17px;
  line-height:1.2;
  font-weight:900;

  text-align:center;
}

.cv-support-good .cv-support-column-title {
  color: #166534;
}

.cv-support-risk .cv-support-column-title {
  color: #991b1b;
}

.cv-support-positioning {
  margin-top: 14px;
  padding: 16px 18px;
  border-radius: 14px;
  background: linear-gradient(180deg, #1e40af 0%, #1e3a8a 100%);
  color: #ffffff;
  font-size: 15px;
  line-height: 1.5;
  font-weight: 900;
  box-shadow: 0 8px 18px rgba(30,64,175,0.18);
}

@media (max-width: 760px) {
  .cv-support-grid {
    grid-template-columns: 1fr;
  }
}

.alternative-positioning-box {
  margin-top: 16px;
  padding: 18px;
  border-radius: 18px;
  border: 2px solid #0f766e;
  background: linear-gradient(180deg, #ecfdf5 0%, #ccfbf1 100%);
}

.alternative-positioning-kicker {
  font-size: 11px;
  font-weight: 900;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #0f766e;
  margin-bottom: 6px;
}

.alternative-positioning-title {
  font-size: 20px;
  font-weight: 900;
  color: #134e4a;
  line-height: 1.15;
}

.alternative-positioning-headline {
  margin: 10px 0 0 0;
  font-size: 14px;
  line-height: 1.5;
  font-weight: 700;
  color: #134e4a;
}

.alternative-positioning-target-note {
  margin-top: 12px;
  padding: 12px 14px;
  border-radius: 14px;
  background: #0f766e;
  color: #ffffff;
  font-size: 14px;
  line-height: 1.5;
  font-weight: 800;
}

.alternative-positioning-grid {
  margin-top: 14px;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.alternative-positioning-card {
  background: #ffffff;
  border: 1px solid #99f6e4;
  border-radius: 16px;
  padding: 14px;
}

.alternative-positioning-card-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 10px;
}

.alternative-positioning-card-title {
  font-size: 16px;
  font-weight: 900;
  color: #111827;
  line-height: 1.2;
}

.alternative-fit-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
  padding: 5px 9px;
  border-radius: 999px;
  background: #ccfbf1;
  color: #115e59;
  border: 1px solid #5eead4;
  font-size: 11px;
  font-weight: 900;
  text-transform: uppercase;
}

.alternative-positioning-card-label {
  margin-top: 10px;
  font-size: 11px;
  font-weight: 900;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: #0f766e;
}

.alternative-positioning-card-text {
  margin: 5px 0 0 0;
  font-size: 13px;
  line-height: 1.45;
  color: #334155;
  font-weight: 700;
}

@media (max-width: 760px) {
  .alternative-positioning-grid {
    grid-template-columns: 1fr;
  }
}

.alternative-fragility-strip {
  margin-top: 14px;
  padding: 12px 14px;
  border-radius: 16px;
  background: linear-gradient(
    180deg,
    rgba(239, 68, 68, 0.10) 0%,
    rgba(239, 68, 68, 0.04) 100%
  );
  border: 1px solid rgba(239, 68, 68, 0.20);
}

.alternative-fragility-strip-title {
  font-size: 13px;
  font-weight: 900;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #fecaca;
  margin-bottom: 12px;
  line-height: 1.3;
}



.alternative-fragility-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.alternative-fragility-pill {
  display: inline-flex;
  align-items: center;

  padding: 11px 15px;
  border-radius: 999px;

  background: #7f1d1d;

  border: 1px solid rgba(254, 202, 202, 0.32);

  box-shadow:
    0 3px 10px rgba(0,0,0,0.22),
    inset 0 1px 0 rgba(255,255,255,0.08);

  color: #ffffff;

  font-size: 13px;
  font-weight: 800;
  line-height: 1.25;
}

.cv-reading-summary,
.cv-reading-main-seniority,
.cv-parsed-content,
.cv-parsed-content p,
.cv-parsed-content li {
  font-size: 14px !important;
  line-height: 1.55 !important;
}

.cv-reading-main-role {
  font-size: 20px !important;
  line-height: 1.2 !important;
}

.cv-reading-summary {
  font-weight: 700 !important;
  color: #1f2937 !important;
}

.transition-potential-box {
  margin-top: 14px;
  padding: 18px;
  border-radius: 18px;
  background: linear-gradient(
    180deg,
    rgba(15, 23, 42, 0.96) 0%,
    rgba(30, 41, 59, 0.92) 100%
  );
  border: 1px solid rgba(148, 163, 184, 0.18);
}

.transition-potential-title {
  font-size: 16px;
  font-weight: 900;
  color: #ffffff;
  margin-bottom: 10px;
}

.transition-potential-text {
  font-size: 14px;
  line-height: 1.6;
  color: #dbeafe;
}

.transition-potential-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-top: 16px;
}

.transition-potential-card {
  padding: 14px;
  border-radius: 14px;
  background: rgba(255,255,255,0.04);
}

.transition-potential-label {
  font-size: 12px;
  font-weight: 700;
  color: #cbd5e1;
  margin-bottom: 8px;
}

.transition-potential-badge {
  display: inline-flex;
  padding: 8px 12px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 900;
  text-transform: uppercase;
}

.transition-potential-badge.level-high {
  background: rgba(34,197,94,0.18);
  color: #bbf7d0;
}

.transition-potential-badge.level-medium {
  background: rgba(250,204,21,0.18);
  color: #fde68a;
}

.transition-potential-badge.level-low {
  background: rgba(239,68,68,0.18);
  color: #fecaca;
}

.transition-potential-subtitle {
  margin-top: 18px;
  margin-bottom: 8px;
  font-size: 13px;
  font-weight: 800;
  color: #ffffff;
}


.cv-target-weakness-box {
  margin-top: 14px;
  padding: 16px;
  border-radius: 18px;
  border: 2px solid #991b1b;
  background: linear-gradient(180deg, #fff7f7 0%, #fee2e2 100%);
}

.cv-target-weakness-title {
  font-size: 17px;
  font-weight: 900;
  color: #7f1d1d;
  margin-bottom: 12px;
}

.cv-target-weakness-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

.cv-target-weakness-column {
  border-radius: 16px;
  background: #ffffff;
  border: 1px solid #fecaca;
  padding: 14px;
}

.cv-target-weakness-subtitle {
  font-size: 13px;
  font-weight: 900;
  color: #991b1b;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin-bottom: 10px;
}

.transition-potential-badge.level-high {
  background: #15803d !important;
  color: #ffffff !important;
  border: 2px solid #86efac !important;
}

.transition-potential-badge.level-medium {
  background: #d97706 !important;
  color: #ffffff !important;
  border: 2px solid #fde68a !important;
}

.transition-potential-badge.level-low {
  background: #dc2626 !important;
  color: #ffffff !important;
  border: 2px solid #fecaca !important;
}

@media (max-width: 760px) {
  .cv-target-weakness-grid {
    grid-template-columns: 1fr;
  }
}

.cv-deep-dive-menu {
  margin-top: 16px;
  padding: 18px;
  border-radius: 18px;
  background: #f8fafc;
  border: 2px solid #cbd5e1;
}

.cv-deep-dive-title {
  font-size: 20px;
  font-weight: 900;
  color: #111827;
  margin-bottom: 6px;
}

.cv-deep-dive-subtitle {
  font-size: 14px;
  line-height: 1.45;
  color: #475569;
  font-weight: 700;
  margin-bottom: 14px;
}

.cv-deep-dive-item {
  border-radius: 14px;
  border: 1px solid #cbd5e1;
  background: #ffffff;
  overflow: hidden;
  margin-top: 10px;
}

.cv-deep-dive-item summary {
  min-height: 54px;
  padding: 0 18px;
  display: flex;
  align-items: center;
  cursor: pointer;

  font-size: 15px;
  font-weight: 900;
  color: #111827;

  background: linear-gradient(180deg, #facc15 0%, #eab308 100%);
  border-bottom: 1px solid rgba(120, 53, 15, 0.18);
}

.cv-deep-dive-item[open] summary {
  background: linear-gradient(180deg, #fde047 0%, #facc15 100%);
  border-bottom: 2px solid #92400e;
}

.cv-deep-dive-content {
  padding: 14px;
}


.overview-card .overview-card-title {
  font-size: 15px;
}

.overview-card:nth-child(4) .overview-card-title {
  background: linear-gradient(180deg, #7e22ce 0%, #581c87 100%) !important;
  color: #ffffff !important;
}


.cv-pro-block .overview-card {
  overflow: visible !important;
}

.cv-pro-block .overview-card-title {
  position: relative !important;
  display: block !important;
  margin: -2px -2px 12px -2px !important;
  padding: 10px 12px !important;
  min-height: auto !important;
  line-height: 1.25 !important;
  white-space: normal !important;
  text-align: center !important;
  border-radius: 10px !important;
  z-index: 1 !important;
}

.cv-potential-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-top: 10px;
}

.cv-potential-label {
  font-size: 13px;
  font-weight: 900;
  color: #334155;
  line-height: 1.25;
}

.cv-reading-main-seniority,
.cv-deep-dive-subtitle {
  font-size: 15px !important;
  line-height: 1.5 !important;
  font-weight: 800 !important;
}

@media (max-width: 760px) {
  .cv-reading-main .overview-card-grid,
  .cv-pro-block .overview-card-grid {
    grid-template-columns: 1fr !important;
  }
}

.cv-deep-dive-item summary {
  font-size: 17px !important;
  font-weight: 900 !important;
  letter-spacing: -0.01em;
}

.cv-profile-snapshot-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
  margin-top: 16px;
}

.cv-snapshot-card {
  padding: 14px;
  border-radius: 16px;
  background: #ffffff;
  border: 2px solid #cbd5e1;
  min-height: 170px;
  overflow: visible;
}

.cv-snapshot-title {
  min-height: 44px;
  padding: 10px 12px;
  margin: -6px -6px 12px -6px;
  border-radius: 12px;
  color: #ffffff;
  font-size: 15px;
  font-weight: 900;
  line-height: 1.2;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cv-snapshot-good {
  border-color: #22c55e;
  background: #dcfce7;
}

.cv-snapshot-good .cv-snapshot-title {
  background: linear-gradient(180deg, #22c55e 0%, #15803d 100%);
}

.cv-snapshot-compatible {
  border-color: #6366f1;
  background: #eef2ff;
}

.cv-snapshot-compatible .cv-snapshot-title {
  background: linear-gradient(180deg, #6366f1 0%, #4338ca 100%);
}

.cv-snapshot-risk {
  border-color: #ef4444;
  background: #fee2e2;
}

.cv-snapshot-risk .cv-snapshot-title {
  background: linear-gradient(180deg, #ef4444 0%, #991b1b 100%);
}

.cv-snapshot-potential {
  border-color: #8b5cf6;
  background: #f3e8ff;
}

.cv-snapshot-potential .cv-snapshot-title {
  background: linear-gradient(180deg, #8b5cf6 0%, #6d28d9 100%);
}

.cv-strength-meter {
  height: 8px;
  border-radius: 999px;
  overflow: hidden;
  background: rgba(15, 23, 42, 0.12);
  margin-bottom: 12px;
}

.cv-strength-meter span {
  display: block;
  height: 100%;
  border-radius: 999px;
}

.cv-strength-meter-good span {
  background: #16a34a;
}

.cv-strength-meter-compatible span {
  background: #4f46e5;
}

.cv-strength-meter-risk span {
  background: #dc2626;
}

.cv-strength-meter-potential span {
  background: #7c3aed;
}

.cv-snapshot-card ul {
  margin-top: 8px;
  padding-left: 18px;
}

.cv-snapshot-card li {
  font-size: 13px;
  line-height: 1.45;
  font-weight: 800;
}

@media (max-width: 980px) {
  .cv-profile-snapshot-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .cv-profile-snapshot-grid {
    grid-template-columns: 1fr;
  }
}

.cv-transition-balance {
  margin-top: 18px;
  padding: 18px;
  border-radius: 18px;

  background:
    linear-gradient(135deg,
      rgba(15,23,42,0.96) 0%,
      rgba(30,41,59,0.98) 100%);

  border: 2px solid rgba(255,255,255,0.08);
}

.cv-transition-balance-title {
  font-size: 18px;
  font-weight: 900;
  color: #ffffff;
  margin-bottom: 14px;
}

.cv-transition-balance-bar {
  height: 28px;
  border-radius: 999px;
  overflow: hidden;
  display: flex;

  background: rgba(255,255,255,0.08);

  border: 1px solid rgba(255,255,255,0.12);
}

.cv-transition-balance-positive {
  display: flex;
  align-items: center;
  justify-content: center;

  background:
    linear-gradient(180deg,
      #22c55e 0%,
      #15803d 100%);

  color: #ffffff;
  font-size: 13px;
  font-weight: 900;
}

.cv-transition-balance-negative {
  display: flex;
  align-items: center;
  justify-content: center;

  background:
    linear-gradient(180deg,
      #ef4444 0%,
      #991b1b 100%);

  color: #ffffff;
  font-size: 13px;
  font-weight: 900;
}

.cv-transition-balance-legend {
  display: flex;
  gap: 22px;
  flex-wrap: wrap;
  margin-top: 14px;
}

.cv-transition-balance-legend > div {
  display: flex;
  align-items: center;
  gap: 8px;

  font-size: 13px;
  font-weight: 800;
  color: #e2e8f0;
}

.cv-transition-legend-good span,
.cv-transition-legend-risk span {
  width: 14px;
  height: 14px;
  border-radius: 999px;
}

.cv-transition-legend-good span {
  background: #22c55e;
}

.cv-transition-legend-risk span {
  background: #ef4444;
}

/* ===== FRINGE TITLE ALIGNMENT FIX ===== */

.cv-pro-block .overview-card-title,
.cv-pro-block .qa-standard-title,
.cv-pro-block .cv-snapshot-title {
  box-sizing: border-box !important;
  width: 100% !important;
  margin: 0 0 14px 0 !important;
  padding: 11px 14px !important;
  border-radius: 14px !important;

  display: flex !important;
  align-items: center !important;
  justify-content: center !important;

  text-align: center !important;
  line-height: 1.22 !important;
  font-weight: 900 !important;
  white-space: normal !important;
}

.cv-pro-block .qa-standard-title {
  background: linear-gradient(180deg, #818cf8 0%, #4338ca 100%) !important;
  border: 2px solid #a5b4fc !important;
  color: #ffffff !important;
}

.cv-pro-block .overview-card-title {
  font-size: 16px !important;
}

.cv-pro-block .cv-snapshot-title {
  min-height: 52px !important;
  font-size: 15px !important;
}

/* Evita che i titoli escano o coprano testo nelle card CV */
.cv-pro-block .overview-card,
.cv-pro-block .cv-snapshot-card {
  overflow: visible !important;
  padding-top: 14px !important;
}

/* ===== FRINGE STANDARD SECTION TITLES ===== */

.cv-pro-block .overview-standard-title,
.cv-pro-block .overview-card-title,
.cv-pro-block .qa-standard-title,
.cv-pro-block .cv-snapshot-title {
  box-sizing: border-box !important;

  width: calc(100% - 28px) !important;
  min-height: 42px !important;

  margin: 0 auto 16px auto !important;
  padding: 10px 16px !important;

  display: flex !important;
  align-items: center !important;
  justify-content: center !important;

  border-radius: 10px !important;
  text-align: center !important;

  font-size: 17px !important;
  line-height: 1.2 !important;
  font-weight: 900 !important;

  color: #ffffff !important;
  border: 1px solid rgba(255,255,255,0.26) !important;

  box-shadow:
    inset 0 1px 0 rgba(255,255,255,0.22),
    0 2px 8px rgba(15,23,42,0.14) !important;
}

/* Titolo principale sezione CV */
.cv-pro-block > .overview-standard-title {
  background: linear-gradient(180deg, #818cf8 0%, #4338ca 100%) !important;
  border-color: #a5b4fc !important;
}

/* Titoli neutri / compatibilità */
.cv-pro-block .overview-card-neutral .overview-card-title,
.cv-pro-block .cv-snapshot-compatible .cv-snapshot-title {
  background: linear-gradient(180deg, #818cf8 0%, #4338ca 100%) !important;
}

/* Titoli positivi */
.cv-pro-block .overview-card-good .overview-card-title,
.cv-pro-block .cv-snapshot-good .cv-snapshot-title {
  background: linear-gradient(180deg, #22c55e 0%, #15803d 100%) !important;
}

/* Titoli rischio / gap */
.cv-pro-block .overview-card-risk .overview-card-title,
.cv-pro-block .cv-snapshot-risk .cv-snapshot-title {
  background: linear-gradient(180deg, #ef4444 0%, #991b1b 100%) !important;
}

/* Titolo potenziale */
.cv-pro-block .cv-snapshot-potential .cv-snapshot-title {
  background: linear-gradient(180deg, #8b5cf6 0%, #6d28d9 100%) !important;
}

/* Reset padding interno per evitare sovrapposizioni */
.cv-pro-block .overview-card,
.cv-pro-block .cv-snapshot-card {
  padding-top: 14px !important;
  overflow: visible !important;
}

.fringe-section-title,
.fringe-mini-title {
  box-sizing: border-box;
  width: calc(100% - 28px);
  margin: 0 auto 16px auto;
  padding: 10px 16px;
  min-height: 42px;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 10px;
  color: #ffffff;
  font-weight: 900;
  text-align: center;
  line-height: 1.2;

  border: 1px solid rgba(255,255,255,0.28);
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,0.22),
    0 2px 8px rgba(15,23,42,0.14);
}

.fringe-section-title {
  font-size: 18px;
}

.fringe-mini-title {
  font-size: 15px;
}

.fringe-title-blue {
  background: linear-gradient(180deg, #818cf8 0%, #4338ca 100%);
}

.fringe-title-green {
  background: linear-gradient(180deg, #22c55e 0%, #15803d 100%);
}

.fringe-title-red {
  background: linear-gradient(180deg, #ef4444 0%, #991b1b 100%);
}

.fringe-title-purple {
  background: linear-gradient(180deg, #8b5cf6 0%, #6d28d9 100%);
}

.cv-reading-main-seniority {
  display: flex !important;
  align-items: center !important;
  gap: 10px !important;
  flex-wrap: wrap !important;
  font-size: 15px !important;
  font-weight: 800 !important;
}

.cv-seniority-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 6px 12px;
  border-radius: 999px;
  background: #111827;
  color: #ffffff;
  font-size: 13px;
  font-weight: 900;
  text-transform: uppercase;
}


/* === FORCE DIFFERENZIAZIONE RIQADRI OVERVIEW === */

.answer-subcard.featured-subcard-risk {
  border-left: 10px solid #ef4444 !important;
  border-top: 2px solid rgba(248,113,113,0.7) !important;
  border-right: 2px solid rgba(248,113,113,0.7) !important;
  border-bottom: 2px solid rgba(248,113,113,0.7) !important;

  background: linear-gradient(180deg, #3b0d0d 0%, #1a0606 100%) !important;
}

.answer-subcard.featured-subcard-advice {
  border-left: 10px solid #22c55e !important;
  border-top: 2px solid rgba(74,222,128,0.7) !important;
  border-right: 2px solid rgba(74,222,128,0.7) !important;
  border-bottom: 2px solid rgba(74,222,128,0.7) !important;

  background: linear-gradient(180deg, #064e3b 0%, #022c22 100%) !important;
}


    @media (max-width: 980px) {
     .grid-2,
    .answer-card-grid,
    .workspace-header,
     .workspace-reading-strip,
    .workspace-grid {
    grid-template-columns: 1fr;
    .overview-card-grid {
  grid-template-columns: 1fr;
    }
    }

      .hero-title {
        font-size: 28px;
      }

    .cv-pro-block .fringe-section-title,
.cv-pro-block .fringe-mini-title {
  box-sizing: border-box !important;
  width: calc(100% - 28px) !important;
  margin: 0 auto 16px auto !important;
  padding: 10px 16px !important;
  min-height: 42px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  border-radius: 10px !important;
  color: #ffffff !important;
  font-weight: 900 !important;
  text-align: center !important;
  line-height: 1.2 !important;
  border: 1px solid rgba(255,255,255,0.28) !important;
}

.cv-pro-block .fringe-title-blue {
  background: linear-gradient(180deg, #818cf8 0%, #4338ca 100%) !important;
}

.cv-pro-block .fringe-title-green {
  background: linear-gradient(180deg, #22c55e 0%, #15803d 100%) !important;
}

.cv-pro-block .fringe-title-red {
  background: linear-gradient(180deg, #ef4444 0%, #991b1b 100%) !important;
}

.cv-pro-block .fringe-title-purple {
  background: linear-gradient(180deg, #8b5cf6 0%, #6d28d9 100%) !important;
}

.situation-shell {
  display: grid;
  gap: 16px;
}

.situation-main-title {
  margin-top: 0;
}

.situation-deep-dive {
  margin-top: 4px;
}


/* ===== FORCE TEST TITLES ===== */

.cv-profile-snapshot-grid .fringe-mini-title {
  all: unset !important;

  display: flex !important;
  align-items: center !important;
  justify-content: center !important;

  width: calc(100% - 24px) !important;
  min-height: 46px !important;

  margin: 0 auto 16px auto !important;
  padding: 10px 14px !important;

  border-radius: 12px !important;

  color: #ffffff !important;
  font-size: 16px !important;
  font-weight: 900 !important;
  line-height: 1.2 !important;
  text-align: center !important;

  box-sizing: border-box !important;
}

/* COLORI */

.cv-profile-snapshot-grid .fringe-title-green {
  background: #15803d !important;
}

.cv-profile-snapshot-grid .fringe-title-blue {
  background: #4338ca !important;
}

.cv-profile-snapshot-grid .fringe-title-red {
  background: #b91c1c !important;
}

.cv-profile-snapshot-grid .fringe-title-purple {
  background: #6d28d9 !important;
}


.situation-snapshot-card {
  padding: 14px;
  border-radius: 18px;
  background: #ffffff;
  border: 2px solid #cbd5e1;
  box-shadow: 0 6px 14px rgba(15,23,42,0.05);
}

.situation-snapshot-title {
  font-size: 16px;
  font-weight: 900;
  color: #111827;
  margin-bottom: 10px;
}

.situation-snapshot-card p {
  font-size: 14px;
  line-height: 1.5;
  font-weight: 700;
  color: #334155;
}

.situation-snapshot-card-strong {
  border-color: #8b5cf6;
  background: #f5f3ff;
}





.situation-hero-card {
  padding: 18px;
  border-radius: 18px;
  background: linear-gradient(180deg, #1e1b4b 0%, #312e81 100%);
  border: 2px solid #818cf8;
  box-shadow: 0 10px 22px rgba(15,23,42,0.14);
}

.situation-hero-title {
  width: calc(100% - 28px);
  margin: 0 auto 12px auto;
  padding: 10px 16px;
  border-radius: 10px;
  background: linear-gradient(180deg, #818cf8 0%, #4338ca 100%);
  color: #ffffff;
  font-size: 20px;
  font-weight: 900;
  text-align: center;
}

.situation-hero-text {
  color: #e0e7ff;
  font-size: 15px;
  line-height: 1.55;
  font-weight: 800;
  text-align: center;
}

.situation-snapshot-card {
  min-height: 190px;
}

.situation-snapshot-title {
  width: calc(100% - 20px);
  margin: 0 auto 14px auto;
  padding: 10px 14px;
  border-radius: 10px;
  color: #ffffff;
  text-align: center;
  font-size: 16px;
  font-weight: 900;
  line-height: 1.2;
}

.situation-card-cv .situation-snapshot-title {
  background: linear-gradient(180deg, #22c55e 0%, #15803d 100%);
}

.situation-card-opening .situation-snapshot-title {
  background: linear-gradient(180deg, #818cf8 0%, #4338ca 100%);
}

.situation-card-answers .situation-snapshot-title {
  background: linear-gradient(180deg, #f59e0b 0%, #b45309 100%);
}

.situation-card-overall .situation-snapshot-title {
  background: linear-gradient(180deg, #8b5cf6 0%, #6d28d9 100%);
}

.situation-inline-details {
  margin-top: 12px;
  border-radius: 12px;
  border: 1px solid #cbd5e1;
  background: #f8fafc;
  overflow: hidden;
}

.situation-inline-details summary {
  padding: 10px 12px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 900;
  color: #111827;
  background: #e0e7ff;
}

.situation-inline-content {
  padding: 12px;
}

.situation-mini-label {
  font-size: 12px;
  font-weight: 900;
  color: #4338ca;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin: 8px 0 6px 0;
}

.situation-expanded-panel {
  padding: 18px;
  border-radius: 20px;
  background: #ffffff;
  border: 2px solid #cbd5e1;
  box-shadow: 0 8px 18px rgba(15,23,42,0.08);
}

.situation-expanded-text {
  margin: 10px 0 18px 0;
  font-size: 15px;
  line-height: 1.6;
  font-weight: 700;
  color: #334155;
}



.situation-link-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;

  min-height: 38px;
  padding: 8px 14px;

  border: 0;
  border-radius: 999px;

  background: linear-gradient(180deg, #4f46e5 0%, #312e81 100%);
  color: #ffffff;

  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.01em;

  cursor: pointer;

  box-shadow:
    0 5px 10px rgba(49,46,129,0.20),
    inset 0 1px 0 rgba(255,255,255,0.14);

  transition:
    transform 0.14s ease,
    box-shadow 0.14s ease;
}

.situation-link-button:hover {
  transform: translateY(-1px);

  box-shadow:
    0 8px 14px rgba(49,46,129,0.24),
    inset 0 1px 0 rgba(255,255,255,0.18);
}

.situation-link-button::after {
  content: "›";
  font-size: 15px;
  font-weight: 900;
  line-height: 1;
}

.situation-snapshot-card .situation-link-button {
  margin-top: 10px;
  width: 100%;
}

.situation-link-button:hover {
  transform: translateY(-1px);
  box-shadow:
    0 10px 20px rgba(49, 46, 129, 0.34),
    inset 0 1px 0 rgba(255,255,255,0.22);
}

.situation-link-button::after {
  content: "›";
  font-size: 18px;
  font-weight: 900;
  line-height: 1;
}

.situation-snapshot-card .situation-link-button {
  margin-top: 12px;
  width: 100%;
}

.situation-expandable-block {
  margin-top: 16px;
  border-radius: 18px;
  border: 2px solid #cbd5e1;
  background: #ffffff;
  overflow: hidden;
  box-shadow: 0 8px 18px rgba(15,23,42,0.07);
}

.situation-expandable-block summary {
  min-height: 54px;
  padding: 0 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  cursor: pointer;

  background: linear-gradient(180deg, #facc15 0%, #eab308 100%);
  color: #111827;

  font-size: 16px;
  font-weight: 900;
  border-radius: 14px;
}

.situation-expandable-block {
  margin-top: 12px;
  border-radius: 16px;
  border: 1px solid #cbd5e1;
  background: #ffffff;
  overflow: hidden;
}

.situation-expandable-intro {
  margin: 0 0 14px 0;
  padding: 12px 14px;
  border-radius: 12px;
  background: #eef2ff;
  border: 1px solid #c7d2fe;
  color: #1e1b4b;
  font-size: 15px;
  line-height: 1.55;
  font-weight: 800;
}

.situation-expandable-block summary strong {
  padding: 6px 10px;
  border-radius: 999px;
  background: rgba(17,24,39,0.14);
  font-size: 12px;
  font-weight: 900;
}

.situation-expandable-block[open] summary strong {
  background: rgba(17,24,39,0.22);
}

.situation-expandable-block[open] summary strong::before {
  content: "Chiudi";
}

.situation-expandable-block[open] summary strong {
  font-size: 0;
}

.situation-expandable-block[open] summary strong::before {
  font-size: 12px;
}

.situation-expandable-content {
  padding: 16px;
}

.situation-expandable-intro {
  margin: 0 0 14px 0;
  font-size: 15px;
  line-height: 1.55;
  font-weight: 700;
  color: #334155;
}

.question-alignment-alert {
  margin-top: 14px;
  padding: 13px 15px;
  border-radius: 14px;
  border: 2px solid transparent;
}

.question-alignment-label {
  font-size: 12px;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 5px;
}

.question-alignment-text {
  font-size: 14px;
  line-height: 1.45;
  font-weight: 800;
}

.question-alignment-risk {
  background: #fee2e2;
  border-color: #ef4444;
  color: #7f1d1d;
}

.question-alignment-warn {
  background: #fff7ed;
  border-color: #f59e0b;
  color: #7c2d12;
}

.question-alignment-ok {
  background: #ecfdf5;
  border-color: #22c55e;
  color: #064e3b;
}

.cv-support-narrative-list {
  display: grid;
  gap: 8px;
  margin-top: 10px;
}

.cv-support-narrative-item {
  padding: 9px 11px;
  border-radius: 11px;
  background: rgba(255,255,255,0.72);
  border: 1px solid rgba(148,163,184,0.35);
  color: #1f2937;
  font-size: 13px;
  line-height: 1.38;
  font-weight: 800;
}


.cv-support-bullet-list {
  display: grid;
  gap: 0;
  margin-top: 12px;
}

.cv-support-bullet-item {
  display: grid;
  grid-template-columns: 14px minmax(0, 1fr);
  gap: 12px;
  align-items: start;
  padding: 13px 4px;
  border-bottom: 1px dashed rgba(148,163,184,0.55);
}

.cv-support-bullet-item:last-child {
  border-bottom: 0;
}

.cv-support-bullet-dot {
  width: 10px;
  height: 10px;
  border-radius: 999px;
  background: #4338ca;
  margin-top: 7px;
}

.cv-support-risk .cv-support-bullet-dot {
  background: #dc2626;
}

.cv-support-good .cv-support-bullet-dot {
  background: #15803d;
}

.cv-support-bullet-label {
  font-size: 15px;
  line-height: 1.25;
  font-weight: 900;
  color: #111827;
}

.cv-support-bullet-hint {
  margin-top: 5px;
  font-size: 14px;
  line-height: 1.42;
  font-weight: 700;
  color: #374151;
}


.fringe-subsection-title {
  width: calc(100% - 24px);
  min-height: 42px;

  margin: 0 auto 14px auto;
  padding: 10px 14px;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 10px;

  background:
    linear-gradient(180deg,
      #818cf8 0%,
      #4338ca 100%);

  border: 1px solid rgba(255,255,255,0.24);

  color: #ffffff;
  font-size: 16px;
  font-weight: 900;
  line-height: 1.2;
  text-align: center;

  box-shadow:
    inset 0 1px 0 rgba(255,255,255,0.18),
    0 2px 8px rgba(15,23,42,0.12);
}

/* ===== FORCE CV SUPPORT BULLETS ===== */

.cv-support-read-box .cv-support-bullet-list {
  display: grid !important;
  gap: 0 !important;
  margin-top: 12px !important;
}

.cv-support-read-box .cv-support-bullet-item {
  display: grid !important;
  grid-template-columns: 14px minmax(0, 1fr) !important;
  gap: 12px !important;
  align-items: start !important;

  padding: 13px 4px !important;

  border-bottom: 1px dashed rgba(148,163,184,0.55) !important;

  background: transparent !important;
}

.cv-support-read-box .cv-support-bullet-item:last-child {
  border-bottom: 0 !important;
}

.cv-support-read-box .cv-support-bullet-dot {
  width: 10px !important;
  height: 10px !important;
  border-radius: 999px !important;

  margin-top: 7px !important;

  background: #4338ca !important;
}

.cv-support-good .cv-support-bullet-dot {
  background: #15803d !important;
}

.cv-support-risk .cv-support-bullet-dot {
  background: #dc2626 !important;
}

.cv-support-read-box .cv-support-bullet-label {
  display: block !important;

  font-size: 15px !important;
  line-height: 1.22 !important;
  font-weight: 900 !important;

  color: #111827 !important;
}

.cv-support-read-box .cv-support-bullet-hint {
  display: block !important;

  margin-top: 5px !important;

  font-size: 14px !important;
  line-height: 1.42 !important;
  font-weight: 700 !important;

  color: #374151 !important;
}

.workspace-analysis-column {
  background: #263244 !important;
}

/* ===== ANSWER DETAIL COLUMNS — FINAL ALIGNMENT ===== */

.workspace-analysis-column,
.workspace-advice-column {
  position: relative !important;
  padding: 14px !important;
  padding-top: 14px !important;
  border-radius: 18px !important;
  overflow: hidden !important;
  background: #263244 !important;
  border: 2px solid #2563eb !important;
}

.workspace-analysis-column .workspace-column-main-title,
.workspace-advice-column .workspace-column-main-title {
  position: relative !important;
  top: -14px !important;
}



.workspace-advice-column {
  background: #263244 !important;
  border-color: #2563eb !important;
}

.workspace-analysis-column .workspace-column-main-title,
.workspace-advice-column .workspace-column-main-title {
  width: calc(100% + 28px) !important;
  min-height: 52px !important;

  margin: 0 -14px 16px -14px !important;
  padding: 10px 16px !important;

  display: flex !important;
  align-items: center !important;
  justify-content: center !important;

  border-radius: 16px 16px 0 0 !important;

  background: linear-gradient(180deg, #818cf8 0%, #4338ca 100%) !important;
  color: #ffffff !important;

  font-size: 18px !important;
  line-height: 1.2 !important;
  font-weight: 900 !important;
  text-align: center !important;

  border-bottom: 2px solid rgba(255,255,255,0.18) !important;
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,0.18),
    0 6px 14px rgba(15,23,42,0.12) !important;
}

.workspace-advice-column > .workspace-column-main-title {
  border-radius: 16px 16px 0 0 !important;
}

.workspace-advice-column .improved-answer-highlight {
  background: #f8fafc !important;
  border: 2px solid #8b5cf6 !important;
  border-radius: 16px !important;
  padding: 16px !important;
}

.workspace-advice-column .improved-answer-title {
  font-size: 16px !important;
  font-weight: 900 !important;
  color: #4c1d95 !important;
  margin-bottom: 10px !important;
}

.workspace-advice-column .improved-answer-text {
  font-size: 15px !important;
  line-height: 1.5 !important;
  font-weight: 800 !important;
  color: #111827 !important;
}

.workspace-advice-column .inspiration-answer-box {
  margin-top: 14px !important;
  background: #ffffff !important;
  border: 2px solid #8b5cf6 !important;
  border-radius: 14px !important;
  padding: 14px !important;
}

.workspace-advice-column .inspiration-answer-label {
  font-size: 13px !important;
  font-weight: 900 !important;
  color: #4c1d95 !important;
  text-transform: uppercase !important;
  letter-spacing: 0.04em !important;
  margin-bottom: 8px !important;
}

.workspace-advice-column .inspiration-answer-text {
  font-size: 15px !important;
  line-height: 1.5 !important;
  font-weight: 800 !important;
  color: #111827 !important;
}

/* ===== MOBILE SITUATION FIX ===== */





@media (max-width: 640px) {
  .page {
    padding-left: 10px !important;
    padding-right: 10px !important;
  }

 

  .situation-hero-title {
    font-size: 19px !important;
  }

  .situation-hero-text {
    font-size: 15px !important;
  }

  .top-nav {
    overflow-x: auto !important;
    flex-wrap: nowrap !important;
    justify-content: flex-start !important;
    -webkit-overflow-scrolling: touch;
  }

  .top-nav-item {
    flex: 0 0 auto !important;
    white-space: nowrap !important;
  }
}

/* ===== SITUATION GRID FINAL RESPONSIVE OVERRIDE ===== */





@media (max-width: 640px) {
  .top-nav-outer {
    position: relative !important;
  }

  .top-nav-outer::after {
    content: "›";
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
    width: 26px;
    height: 34px;
    border-radius: 999px;
    background: rgba(15,23,42,0.72);
    color: #ffffff;
    font-size: 24px;
    font-weight: 900;
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: none;
  }
}


    }

/* ===== SITUATION SNAPSHOT GRID — SINGLE SOURCE OF TRUTH ===== */

.situation-snapshot-grid {
  display: grid !important;
  grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
  gap: 14px !important;
  margin-top: 16px !important;
  align-items: stretch !important;
}

.situation-snapshot-grid > article {
  width: auto !important;
  max-width: none !important;
  min-width: 0 !important;
}

@media (max-width: 980px) {
  .situation-snapshot-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
  }
}

@media (max-width: 640px) {
  .situation-snapshot-grid {
    grid-template-columns: 1fr !important;
  }
}

@media (max-width: 640px) {
  .situation-snapshot-grid {
    grid-template-columns: 1fr !important;
  }

  .situation-snapshot-grid article {
    min-height: auto !important;
  }

  .situation-snapshot-grid p {
    font-size: 15px !important;
    line-height: 1.5 !important;
  }

  .situation-snapshot-grid button {
    width: 100% !important;
    min-height: 44px !important;
  }
}

/* ===== FRINGE HEADER BRAND ===== */

.fringe-brand-block {
  min-width: 150px;
}

.fringe-brand-main {
  font-size: 28px;
  line-height: 1;
  font-weight: 1000;
  letter-spacing: 0.04em;
  color: #111827;
}

.fringe-brand-sub {
  margin-top: 2px;
  font-size: 14px;
  line-height: 1.1;
  font-weight: 900;
  color: #111827;
}





  

  
}

.pro-mini-hero {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 22px;
  margin: 10px 0 14px 0;
}

.fringe-brand-block {
  min-width: 150px;
}

.fringe-brand-main {
  font-size: 28px;
  line-height: 1;
  font-weight: 1000;
  letter-spacing: 0.04em;
  color: #111827;
}

.fringe-brand-sub {
  margin-top: 2px;
  font-size: 14px;
  line-height: 1.1;
  font-weight: 900;
  color: #111827;
}

.fringe-tagline {
  font-size: 18px;
  line-height: 1.25;
  font-weight: 900;
  color: #374151;
  padding-top: 2px;
}

@media (max-width: 640px) {
  .pro-mini-hero {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 14px;
    align-items: start;
  }

  .fringe-brand-block {
    min-width: 0;
  }

  .fringe-brand-main {
    font-size: 24px;
  }

  .fringe-brand-sub {
    font-size: 13px;
  }

  .fringe-tagline {
    justify-self: end;
    text-align: right;
    font-size: 15px;
    line-height: 1.35;
  }
}

/* ===== MOBILE TYPOGRAPHY PASS ===== */

@media (max-width: 640px) {

  .situation-hero-title,
  .qa-standard-title,
  .workspace-column-main-title,
  .overview-standard-title {
    font-size: 16px !important;
    min-height: 44px !important;
    padding: 8px 14px !important;
  }

  .situation-hero-text,
  .situation-expanded-text,
  .situation-expandable-intro,
  .situation-snapshot-card p {
    font-size: 14px !important;
    line-height: 1.42 !important;
    font-weight: 700 !important;
  }

  .situation-snapshot-title {
    font-size: 15px !important;
    padding: 8px 12px !important;
  }

  .situation-link-button {
    min-height: 34px !important;
    padding: 7px 12px !important;
    font-size: 11px !important;
  }

  .situation-expandable-block summary {
    min-height: 48px !important;
    font-size: 14px !important;
    padding: 0 14px !important;
  }

  .fringe-tagline {
    font-size: 14px !important;
    line-height: 1.25 !important;
  }

  .fringe-brand-main {
    font-size: 22px !important;
  }

  .fringe-brand-sub {
    font-size: 12px !important;
  }
}

/* ===== MOBILE GLOBAL OVERRIDE ===== */

@media (max-width: 640px) {

  body .cv-pro-block p,
  body .cv-pro-block li,
  body .cv-pro-block div,
  body .cv-pro-block span {
    font-size: 14px !important;
    line-height: 1.4 !important;
  }

  body .cv-pro-block .situation-hero-text,
  body .cv-pro-block .situation-expanded-text,
  body .cv-pro-block .situation-expandable-intro {
    font-size: 14px !important;
    line-height: 1.42 !important;
    font-weight: 700 !important;
  }

  body .cv-pro-block .situation-snapshot-title,
  body .cv-pro-block .qa-standard-title,
  body .cv-pro-block .workspace-column-main-title,
  body .cv-pro-block .overview-standard-title {
    font-size: 15px !important;
  }

  body .cv-pro-block .situation-link-button {
    min-height: 34px !important;
    padding: 6px 12px !important;
    font-size: 11px !important;
  }
}

/* ===== MOBILE SITUATION COMPACT PASS ===== */

@media (max-width: 640px) {

  body .situation-shell {
    font-size: 14px !important;
  }

  body .situation-shell p,
  body .situation-shell div,
  body .situation-shell span {
    line-height: 1.38 !important;
  }

  body .situation-hero-card {
    padding: 14px !important;
    border-radius: 16px !important;
  }

  body .situation-hero-title {
    font-size: 18px !important;
    padding: 8px 12px !important;
    margin-bottom: 10px !important;
  }

  body .situation-hero-text {
    font-size: 14px !important;
    line-height: 1.38 !important;
    font-weight: 700 !important;
  }

  body .situation-snapshot-grid article {
    padding: 13px !important;
    border-radius: 16px !important;
  }

  body .situation-snapshot-grid article > div:first-child {
    font-size: 15px !important;
    padding: 8px 12px !important;
    margin-bottom: 10px !important;
  }

  body .situation-snapshot-grid article p {
    font-size: 14px !important;
    line-height: 1.38 !important;
    font-weight: 700 !important;
  }

  body .situation-snapshot-grid button {
    min-height: 36px !important;
    padding: 7px 12px !important;
    font-size: 11px !important;
  }

  body .situation-expandable-block summary {
    min-height: 46px !important;
    font-size: 14px !important;
    padding: 0 12px !important;
  }
}

/* ===== MOBILE SITUATION SPACING TIGHTEN ===== */

@media (max-width: 640px) {
  body .situation-snapshot-grid {
    gap: 10px !important;
    margin-top: 12px !important;
  }

  body .situation-snapshot-grid article {
    margin-bottom: 0 !important;
    padding: 11px !important;
  }

  body .situation-snapshot-grid article p {
    margin-top: 8px !important;
    margin-bottom: 8px !important;
  }

  body .situation-snapshot-grid article > div:first-child {
    margin-bottom: 8px !important;
  }

  body .situation-link-button {
    margin-top: 8px !important;
  }

  body .situation-deep-dive,
  body .situation-expanded-panel {
    margin-top: 12px !important;
  }

  body .situation-deep-dive {
    padding: 14px !important;
  }
}

/* ===== MOBILE SITUATION DEEP DIVE GAP FIX ===== */

@media (max-width: 640px) {
  body .situation-snapshot-grid + section {
    margin-top: 6px !important;
  }

  body .situation-snapshot-grid + .situation-deep-dive {
    margin-top: 6px !important;
  }

  body section[style*="margin-top:18px"] {
    margin-top: 6px !important;
  }
}

/* ===== MOBILE OPENING PANEL FIX ===== */

@media (max-width: 640px) {
  body .situation-expanded-panel {
    box-sizing: border-box !important;
    width: 100% !important;
    max-width: 100% !important;
    overflow-x: hidden !important;
    padding: 12px !important;
  }

  body .situation-expanded-panel * {
    box-sizing: border-box !important;
    max-width: 100% !important;
  }
}

/* ===== MOBILE OPENING READABILITY PASS ===== */

@media (max-width: 640px) {
  .overview-opening-block {
    font-size: 14px !important;
  }

  .overview-opening-block .overview-pro-note {
    font-size: 14px !important;
    line-height: 1.42 !important;
    font-weight: 800 !important;
  }

  .overview-opening-block .opening-assessment-box {
    font-size: 15px !important;
    line-height: 1.45 !important;
    font-weight: 800 !important;
  }

  .overview-opening-block .overview-reading-grid {
    grid-template-columns: 1fr !important;
    gap: 10px !important;
  }

  .overview-opening-block .overview-reading-label {
    font-size: 13px !important;
    line-height: 1.25 !important;
    font-weight: 900 !important;
  }

  .overview-opening-block .overview-reading-text {
    font-size: 14px !important;
    line-height: 1.42 !important;
    font-weight: 700 !important;
  }

  .overview-opening-block .weighted-item {
    font-size: 14px !important;
    line-height: 1.42 !important;
    font-weight: 700 !important;
  }

  .overview-opening-block .overview-pitch-text {
    font-size: 15px !important;
    line-height: 1.45 !important;
    font-weight: 800 !important;
  }
}

@media (max-width: 640px) {
  .overview-opening-block .cv-support-title {
    color: #ffffff !important;
    font-size: 15px !important;
    line-height: 1.25 !important;
    font-weight: 900 !important;
  }
}

@media (max-width: 640px) {
  .overview-opening-block .overview-pitch-text {
    font-size: 14px !important;
    line-height: 1.42 !important;
    font-weight: 700 !important;
  }

  .overview-opening-block .overview-pitch-label {
    font-size: 15px !important;
    line-height: 1.25 !important;
  }
}

/* ===== MOBILE SITUATION EXTRA COMPACT PASS ===== */

@media (max-width: 640px) {
  .overview-opening-block .opening-assessment-box,
  .overview-opening-block .overview-pro-note,
  .overview-opening-block .overview-pitch-text,
  .overview-opening-block .overview-pitch-note {
    font-size: 13px !important;
    line-height: 1.36 !important;
    font-weight: 700 !important;
  }

  .overview-opening-block .overview-pitch-label,
  .overview-opening-block .overview-card-title,
  .overview-opening-block .overview-standard-title {
    font-size: 14px !important;
    line-height: 1.22 !important;
    min-height: auto !important;
    padding: 8px 12px !important;
  }

  .overview-opening-block .weighted-item {
    font-size: 13px !important;
    line-height: 1.34 !important;
    font-weight: 700 !important;
    padding-top: 6px !important;
    padding-bottom: 6px !important;
  }

  .overview-opening-block .overview-card,
  .overview-opening-block .overview-coach-box,
  .overview-opening-block .overview-pitch-box {
    padding: 12px !important;
    border-radius: 14px !important;
  }

  .priority-hot-block,
  .hot-priority-box {
    padding: 12px !important;
  }

  .hot-priority-row,
  .alternative-fragility-pill {
    font-size: 13px !important;
    line-height: 1.34 !important;
  }

  .hot-priority-index {
    width: 22px !important;
    height: 22px !important;
    min-width: 22px !important;
    font-size: 12px !important;
  }
}

/* ===== MOBILE SITUATION EXPANDED CONTENT COMPACT ===== */

@media (max-width: 640px) {

  .priority-hot-block .overview-standard-title {
    display: none !important;
  }

  .priority-hot-block,
  .hot-priority-box {
    padding: 10px !important;
    border-radius: 14px !important;
  }

  .hot-priority-row {
    display: grid !important;
    grid-template-columns: 28px minmax(0, 1fr) !important;
    gap: 8px !important;
    align-items: start !important;

    font-size: 14px !important;
    line-height: 1.38 !important;
    font-weight: 800 !important;
  }

  .hot-priority-text {
    font-size: 14px !important;
    line-height: 1.38 !important;
    font-weight: 800 !important;
  }

  .hot-priority-index {
    width: 24px !important;
    height: 24px !important;
    min-width: 24px !important;
    font-size: 12px !important;
  }

  .situation-expandable-content,
  .situation-expandable-intro {
    font-size: 14px !important;
    line-height: 1.38 !important;
    font-weight: 700 !important;
  }

  .situation-expandable-block summary {
    font-size: 14px !important;
    line-height: 1.25 !important;
  }
}

@media (max-width: 640px) {
  .overview-opening-block .overview-reading-grid {
    grid-template-columns: 1fr !important;
    gap: 12px !important;
  }

  .overview-opening-block .overview-reading-item {
    padding: 12px !important;
    border-radius: 14px !important;
    background: #eef2ff !important;
    border: 1px solid #c7d2fe !important;
  }

  .overview-opening-block .overview-reading-label {
    display: inline-flex !important;
    padding: 5px 9px !important;
    border-radius: 999px !important;
    background: #4338ca !important;
    color: #ffffff !important;
    font-size: 12px !important;
    font-weight: 900 !important;
    margin-bottom: 6px !important;
  }
}

@media (max-width: 640px) {
  .overview-opening-block .overview-card-full {
    padding-top: 18px !important;
  }

  .overview-opening-block .opening-assessment-box {
    margin-top: 8px !important;
  }
}

@media (max-width: 640px) {
  .overview-opening-block .overview-card-good .weighted-item:first-of-type,
  .overview-opening-block .overview-card-risk .weighted-item:first-of-type {
    margin-top: 18px !important;
  }
}

/* ===== OPENING MOBILE + TITLE FIX CLEAN ===== */

@media (max-width: 640px) {
  .overview-opening-block .overview-reading-grid {
    display: block !important;
  }

  .overview-opening-block .overview-reading-item {
    display: block !important;
    margin-bottom: 12px !important;
    padding: 12px !important;
    border-radius: 14px !important;
    background: #eef2ff !important;
    border: 1px solid #c7d2fe !important;
  }

  .overview-opening-block .overview-reading-label {
    display: block !important;
    padding: 0 !important;
    margin: 0 0 6px 0 !important;
    background: transparent !important;
    color: #1e1b4b !important;
    font-size: 13px !important;
    font-weight: 900 !important;
    line-height: 1.25 !important;
  }

  .overview-opening-block .overview-reading-text {
    font-size: 14px !important;
    line-height: 1.42 !important;
    font-weight: 700 !important;
    color: #111827 !important;
  }
}

/* Titolo CV leggibile anche desktop */
.overview-opening-block .cv-support-title {
  color: #ffffff !important;
  background: linear-gradient(180deg, #818cf8 0%, #4338ca 100%) !important;
}

/* Evita che il primo pallino finisca sotto il titolo */
.overview-opening-block .overview-card-good,
.overview-opening-block .overview-card-risk {
  padding-top: 22px !important;
}

.overview-opening-block .overview-card-good .weighted-item:first-of-type,
.overview-opening-block .overview-card-risk .weighted-item:first-of-type {
  margin-top: 8px !important;
}

.opening-strength-list {
  display: grid;
  gap: 12px;
  margin-top: 12px;
}

.opening-strength-item {
  display: grid;
  grid-template-columns: 18px minmax(0, 1fr);
  gap: 10px;
  align-items: start;
  font-size: 14px;
  line-height: 1.45;
  font-weight: 800;
  color: #111827;
}

.opening-strength-dot {
  width: 10px;
  height: 10px;
  margin-top: 6px;
  border-radius: 999px;
  background: #15803d;
}

.opening-weighted-legend {
  grid-column: 1 / -1;
  margin: 8px 0 0 0;
}

.overview-opening-block .overview-card-good,
.overview-opening-block .overview-card-risk {
  padding-top: 34px !important;
}

@media (max-width: 640px) {
  .opening-strength-item {
    font-size: 14px !important;
    line-height: 1.42 !important;
    font-weight: 700 !important;
  }

  .overview-opening-block .overview-card-good,
  .overview-opening-block .overview-card-risk {
    padding-top: 42px !important;
  }

  .opening-weighted-legend {
    margin: 12px 0 4px 0 !important;
  }
}

/* ===== MOBILE PRIORITY CARDS COMPACT ===== */

@media (max-width: 640px) {

  .overview-priority-item.compact {
    padding: 12px !important;
    border-radius: 16px !important;
  }

  .overview-priority-item.compact .priority-text {
    font-size: 14px !important;
    line-height: 1.38 !important;
    font-weight: 700 !important;
  }

  .overview-priority-item.compact .priority-index {
    width: 26px !important;
    height: 26px !important;
    min-width: 26px !important;

    font-size: 13px !important;
    font-weight: 900 !important;
  }

  .overview-priority-block .overview-pro-note {
    font-size: 13px !important;
    line-height: 1.34 !important;
    font-weight: 700 !important;
  }
}

.opening-cv-section {
  margin-top: 16px;
  padding: 14px;
  border-radius: 18px;
  background: rgba(238, 242, 255, 0.10);
  border: 1px solid rgba(129, 140, 248, 0.42);
}

.opening-cv-section .cv-support-title {
  margin-bottom: 14px !important;
}

@media (max-width: 640px) {
  .opening-cv-section {
    margin-top: 14px !important;
    padding: 12px !important;
    border-radius: 16px !important;
  }
}

@media (max-width: 640px) {
  .overview-opening-block .overview-card-full .overview-card-title {
    margin-bottom: 12px !important;
  }

  .overview-opening-block .opening-assessment-box {
    margin-top: 12px !important;
  }
}

.opening-cv-section {
  margin-top: 16px !important;
  padding-top: 16px !important;
}

.opening-cv-section .overview-card-title {
  margin-bottom: 14px !important;
}

.opening-mini-label {
  display: inline-flex;
  align-items: center;
  justify-content: center;

  min-height: 34px;
  padding: 8px 14px;
  margin: 10px 0 10px 0;

  border-radius: 999px;

  color: #ffffff;
  font-size: 14px;
  line-height: 1.2;
  font-weight: 900;

  box-shadow:
    inset 0 1px 0 rgba(255,255,255,0.18),
    0 4px 10px rgba(15,23,42,0.10);
}

.opening-mini-label-good {
  background: linear-gradient(180deg, #22c55e 0%, #15803d 100%);
}

.opening-mini-label-risk {
  background: linear-gradient(180deg, #ef4444 0%, #991b1b 100%);
  margin-top: 18px;
}

.opening-cv-section .opening-weighted-legend {
  margin: 16px 0 4px 0 !important;
}

.opening-cv-section .weighted-item:first-of-type {
  margin-top: 0 !important;
}

@media (max-width: 640px) {
  .opening-cv-section {
    padding: 12px !important;
    padding-top: 14px !important;
  }

  .opening-mini-label {
    width: 100%;
    min-height: 32px;
    font-size: 13px !important;
    margin: 8px 0 10px 0;
  }

  .opening-mini-label-risk {
    margin-top: 14px;
  }
}

.opening-main-title {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 14px;
  background: linear-gradient(180deg,#818cf8 0%,#4338ca 100%);
  color: #ffffff;
  margin-bottom: 14px;
  font-size: 18px;
  font-weight: 900;
  text-align: center;
}

.opening-close-button {
  border: 0;
  border-radius: 999px;
  padding: 8px 12px;
  background: #111827;
  color: #ffffff;
  font-size: 12px;
  font-weight: 900;
  cursor: pointer;
  white-space: nowrap;
}

.opening-story-section,
.opening-cv-section,
.opening-coach-section {
  margin-top: 14px !important;
}

.opening-cv-section {
  padding-top: 16px !important;
}

.opening-cv-section .overview-card-title {
  margin-bottom: 16px !important;
  color: #ffffff !important;
  background: linear-gradient(180deg,#818cf8 0%,#4338ca 100%) !important;
}

.opening-mini-label {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 34px;
  padding: 8px 14px;
  margin: 10px 0 12px 0;
  border-radius: 999px;
  color: #ffffff;
  font-size: 14px;
  font-weight: 900;
}

.opening-mini-label-good {
  background: linear-gradient(180deg,#22c55e 0%,#15803d 100%);
}

.opening-mini-label-risk {
  background: linear-gradient(180deg,#ef4444 0%,#991b1b 100%);
  margin-top: 18px;
}

.opening-cv-section .opening-strength-list,
.opening-cv-section .weighted-list {
  margin-top: 8px !important;
}

.opening-cv-section .weighted-item:first-of-type {
  margin-top: 0 !important;
}

@media (max-width: 640px) {
  .opening-main-title {
    font-size: 16px !important;
  }

  .opening-story-section .overview-card-title {
    margin-bottom: 14px !important;
  }

  .opening-story-section .opening-assessment-box {
    margin-top: 12px !important;
  }

  .overview-opening-block .overview-reading-grid {
    display: block !important;
  }

  .overview-opening-block .overview-reading-item {
    margin-bottom: 12px !important;
  }

  .opening-mini-label {
    width: 100%;
    font-size: 13px !important;
  }

  .opening-cv-section {
    padding: 12px !important;
    padding-top: 14px !important;
  }

  .opening-cv-section .overview-card-title {
    font-size: 15px !important;
    line-height: 1.25 !important;
  }

  .overview-opening-block .overview-pitch-text {
    font-size: 14px !important;
    line-height: 1.42 !important;
    font-weight: 700 !important;
  }
}

/* ===== OPENING CV SECTION VISIBILITY FIX ===== */

.opening-cv-section {
  background: #eef2ff !important;
  color: #111827 !important;
  padding: 16px !important;
  padding-top: 18px !important;
  overflow: visible !important;
}

.opening-cv-section * {
  color: inherit;
}

.opening-cv-section .overview-card-title {
  position: static !important;
  width: 100% !important;
  margin: 0 0 16px 0 !important;
  padding: 10px 14px !important;
  color: #ffffff !important;
  background: linear-gradient(180deg,#818cf8 0%,#4338ca 100%) !important;
  border-radius: 12px !important;
}

.opening-cv-section .opening-mini-label {
  position: static !important;
  margin: 10px 0 12px 0 !important;
}

.opening-cv-section .opening-strength-list,
.opening-cv-section .weighted-list,
.opening-cv-section .weighted-item,
.opening-cv-section .opening-strength-item {
  color: #111827 !important;
}

.opening-cv-section .weighted-legend,
.opening-cv-section .weighted-legend span {
  color: #111827 !important;
}

/* ===== OPENING STORY TITLE OVERLAP FIX ===== */

.opening-story-section {
  padding-top: 18px !important;
  overflow: visible !important;
}

.opening-story-section .overview-card-title {
  position: static !important;
  width: 100% !important;
  margin: 0 0 14px 0 !important;
  padding: 10px 14px !important;
}

.opening-story-section .opening-assessment-box {
  margin-top: 0 !important;
}

@media (max-width: 640px) {
  .opening-story-section {
    padding-top: 14px !important;
  }

  .opening-story-section .overview-card-title {
    font-size: 15px !important;
    line-height: 1.25 !important;
    margin-bottom: 12px !important;
  }
}

/* ===== OPENING MINI LABEL CONTRAST FIX ===== */

.opening-mini-label {
  color: #ffffff !important;
  font-size: 15px !important;
  font-weight: 900 !important;
  letter-spacing: 0.01em !important;
  text-shadow: 0 1px 1px rgba(0,0,0,0.22);
}

.opening-mini-label.green {
  background: linear-gradient(180deg,#16a34a 0%,#166534 100%) !important;
}

.opening-mini-label.red {
  background: linear-gradient(180deg,#ef4444 0%,#991b1b 100%) !important;
}

.weighted-item {
  display: grid !important;
  grid-template-columns: 46px minmax(0, 1fr) !important;
  gap: 10px !important;
  align-items: start !important;
  margin-top: 12px !important;
}

.weighted-priority-icon {
  font-size: 14px !important;
  line-height: 1.3 !important;
  white-space: nowrap !important;
}

.weighted-text {
  font-size: var(--fr-body) !important;
  line-height: 1.45 !important;
  font-weight: 700 !important;
  color: var(--fr-ink) !important;
}

@media (max-width: 640px) {
  .weighted-item {
    grid-template-columns: 42px minmax(0, 1fr) !important;
    gap: 8px !important;
    margin-top: 12px !important;
  }

  .weighted-priority-icon {
    font-size: 13px !important;
  }
}

.weighted-item {
  display: grid !important;
  grid-template-columns: 24px minmax(0, 1fr) !important;
  gap: 8px !important;
  align-items: start !important;
  margin-top: 12px !important;
}

.weighted-priority-dot {
  display: inline-block;
  border-radius: 999px;
  margin-top: 4px;
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.45);
}

.weighted-priority-dot.high {
  width: 18px;
  height: 18px;
  background: #ef4444;
}

.weighted-priority-dot.mid {
  width: 15px;
  height: 15px;
  background: #f59e0b;
  margin-left: 1px;
}

.weighted-priority-dot.low {
  width: 11px;
  height: 11px;
  background: #94a3b8;
  margin-left: 3px;
}

.weighted-text {
  font-size: var(--fr-body) !important;
  line-height: 1.45 !important;
  font-weight: 700 !important;
  color: var(--fr-ink) !important;
}

@media (max-width: 640px) {
  .weighted-item {
    grid-template-columns: 20px minmax(0, 1fr) !important;
    gap: 7px !important;
  }
}

@media (max-width: 640px) {

  .weighted-item {
    grid-template-columns: 24px minmax(0, 1fr) !important;
    gap: 8px !important;
  }

  .weighted-priority-dot.high {
    width: 17px;
    height: 17px;
  }

  .weighted-priority-dot.mid {
    width: 14px;
    height: 14px;
  }

  .weighted-priority-dot.low {
    width: 10px;
    height: 10px;
  }
}

/* ===== ANSWERS MOBILE COMPACT PASS ===== */

@media (max-width: 640px) {
  .qa-question-text.compact,
  .qa-answer-text.compact-scroll,
  .fr-answer-summary-text,
  .fr-answer-first-correction-text,
  .workspace-context-link-text,
  .weighted-text,
  .answer-subcard p {
    font-size: 14px !important;
    line-height: 1.42 !important;
    font-weight: 650 !important;
  }

  .qa-question-label,
  .qa-answer-label,
  .fr-answer-mini-title,
  .answer-subcard-title,
  .workspace-column-main-title {
    font-size: 11px !important;
    letter-spacing: 0.05em;
  }

  .workspace-summary-score {
    font-size: 14px !important;
    min-width: 74px;
    padding: 8px 10px !important;
  }

  .fr-title-primary {
    font-size: 15px !important;
    line-height: 1.18 !important;
  }

  .fr-card {
    padding: 12px !important;
  }
}

/* ===== STICKY YELLOW EXPANDABLE HEADERS ===== */

.fr-situation-details {
  overflow: visible !important;
}

.fr-situation-summary {
  position: sticky;
  top: 76px;
  z-index: 35;
}

@media (max-width: 640px) {
  .fr-situation-summary {
    top: 0;
    z-index: 45;
  }
}

.answer-tabs-shell {
  position: sticky;
  top: 76px;
  z-index: 60;
}

.fr-situation-summary {
  z-index: 45;
}

@media (max-width: 640px) {
  .answer-tabs-shell {
    top: 0;
    z-index: 60;
  }

  .fr-situation-summary {
    top: 58px;
    z-index: 45;
  }
}

@media (max-width: 640px) {
  .workspace-analysis-column,
  .workspace-advice-column {
    padding: 10px !important;
  }

  .workspace-column-main-title {
    font-size: 17px !important;
    line-height: 1.18 !important;
    padding: 9px 10px !important;
  }

  .answer-segment,
  .workspace-block,
  .improved-answer-highlight,
  .inspiration-answer-box {
    padding: 10px !important;
    border-radius: 12px !important;
  }

  .segment-impact,
  .answer-subcard-title,
  .improved-answer-title,
  .inspiration-answer-label {
    font-size: 12px !important;
    line-height: 1.25 !important;
  }

  .segment-excerpt,
  .segment-reason,
  .weakness-narrative-item,
  .improvement-narrative-item,
  .improved-answer-text,
  .inspiration-answer-text {
    font-size: 13px !important;
    line-height: 1.38 !important;
    font-weight: 650 !important;
  }
}
  /* ===== ANSWER CONTENT MOBILE STANDARD v1 ===== */

@media (max-width: 640px) {
  .answer-tab-panel {
    padding-left: 6px !important;
    padding-right: 6px !important;
  }

  .answer-subcard,
  .reading-highlight-box,
  .workspace-context-link-note,
  .question-alignment-alert,
  .cv-support-details,
  .cv-support-panel,
  .workspace-analysis-column,
  .workspace-advice-column {
    padding-left: 10px !important;
    padding-right: 10px !important;
    border-radius: 14px !important;
  }

  .answer-subcard p,
  .reading-highlight-box p,
  .workspace-context-link-text,
  .question-alignment-alert,
  .cv-support-details,
  .cv-support-panel,
  .segment-excerpt,
  .segment-reason,
  .weakness-narrative-item,
  .improvement-narrative-item,
  .improved-answer-text,
  .inspiration-answer-text {
    font-size: 13px !important;
    line-height: 1.38 !important;
    font-weight: 650 !important;
  }

  .qa-standard-title,
  .workspace-column-main-title,
  .answer-subcard-title,
  .improved-answer-title,
  .inspiration-answer-label {
    font-size: 15px !important;
    line-height: 1.18 !important;
  }

  .fr-pill,
  .workspace-context-link-title,
  .compact-label {
    font-size: 11px !important;
    line-height: 1.2 !important;
  }
}

.fr-answer-first-correction {
  margin-top: 14px !important;
  padding: 14px 16px !important;
}

.fr-answer-first-correction .fr-pill {
  display: inline-flex;
  align-items: center;
  margin-bottom: 12px !important;
}

.fr-answer-first-correction-text {
  color: #ffffff;
  font-size: 15px;
  line-height: 1.42;
  font-weight: 900;
}

.fr-answer-mini-title {
  display: inline-block;
  margin-bottom: 10px !important;
  padding: 4px 10px;
  border-radius: 999px;
  background: #e0e7ff;
  color: #312e81 !important;
  font-size: 11px !important;
  font-weight: 900 !important;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}


/* ===== ANSWER PANEL COLOR FIX ===== */

.fr-answer-first-correction {
  background: #fee2e2 !important;
  border: 2px solid #ef4444 !important;
  color: #7f1d1d !important;
  box-shadow: none !important;
  border-radius: var(--fr-radius-md) !important;
  padding: var(--fr-md) !important;
}



.fr-answer-first-correction .fr-pill {
  background: linear-gradient(180deg,#ef4444 0%,#991b1b 100%) !important;
  color: #ffffff !important;
  margin-bottom: 10px !important;
   border-radius: var(--fr-pill-radius) !important;
}



.fr-answer-first-correction-text {
  color: #7f1d1d !important;
  font-size: var(--fr-body) !important;
  line-height: 1.42 !important;
  font-weight: 800 !important;
}

.fr-answer-mini-title {
  background: #c7d2fe !important;
  color: #312e81 !important;
  border: 1px solid #818cf8 !important;
}

.workspace-analysis-column .answer-subcard-title,
.workspace-analysis-column .segment-impact {
  color: #e0e7ff !important;
}

.workspace-block .answer-subcard-title {
  opacity: 1 !important;
}

/* ===== ANSWER SEGMENTS TITLE CONTRAST FIX ===== */

.answer-segment .segment-impact,
.answer-segment .segment-head,
.answer-segment .segment-head * {
  color: #0f172a !important;
  opacity: 1 !important;
}

.answer-segment.positive .segment-impact,
.answer-segment.good .segment-impact {
  color: #065f46 !important;
}

.answer-segment.negative .segment-impact,
.answer-segment.risk .segment-impact,
.answer-segment.weak .segment-impact {
  color: #991b1b !important;
}

.answer-segment.warning .segment-impact,
.answer-segment.mid .segment-impact {
  color: #92400e !important;
}

/* ===== ANSWER DETAILS MOBILE WIDTH + TYPOGRAPHY FIX ===== */

@media (max-width: 640px) {
  .answer-card-grid,
  .fr-answer-detail-grid {
    width: 100% !important;
    max-width: 100% !important;
    grid-template-columns: 1fr !important;
  }

  .workspace-analysis-column,
  .workspace-advice-column {
    width: 100% !important;
    max-width: 100% !important;
    padding: 10px !important;
    box-sizing: border-box !important;
  }

  .workspace-block,
  .answer-segment,
  .improved-answer-highlight,
  .inspiration-answer-box {
    padding: 10px !important;
    border-radius: 12px !important;
  }

  .answer-segment .segment-impact,
  .answer-subcard-title,
  .workspace-block-risk .answer-subcard-title {
    font-size: 12px !important;
    line-height: 1.25 !important;
    font-weight: 900 !important;
  }

  .segment-excerpt,
  .segment-reason,
  .workspace-block,
  .weakness-narrative-item,
  .improvement-narrative-item,
  .improved-answer-text,
  .inspiration-answer-text {
    font-size: 13px !important;
    line-height: 1.38 !important;
    font-weight: 650 !important;
  }

  .workspace-column-main-title {
    font-size: 16px !important;
    line-height: 1.18 !important;
    padding: 9px 10px !important;
  }
}

/* =========================================================
   FRINGE ANSWERS — MOBILE STANDARD v1
========================================================= */

@media (max-width: 640px) {

  /* ---------- SCORE BADGE ---------- */

  .answer-score-badge,
  .answer-score,
  .answer-grade,
  .score-badge {
    font-size: 30px !important;
    line-height: 1 !important;
    font-weight: 900 !important;
  }

  .answer-score-badge small,
  .answer-score small,
  .answer-grade small,
  .score-badge small {
    font-size: 13px !important;
    opacity: 0.9 !important;
  }

  /* ---------- MAIN EXPAND BLOCK ---------- */

  .workspace-panel,
  .answer-workspace-panel,
  .workspace-expanded-panel {
    padding-left: 6px !important;
    padding-right: 6px !important;
  }

  /* ---------- GRID ---------- */

  .answer-card-grid,
  .fr-answer-detail-grid,
  .workspace-detail-grid {
    display: grid !important;
    grid-template-columns: 1fr !important;
    gap: 12px !important;
    width: 100% !important;
    max-width: 100% !important;
  }

  /* ---------- COLUMNS ---------- */

  .workspace-analysis-column,
  .workspace-advice-column,
  .answer-analysis-column,
  .answer-coach-column {
    width: 100% !important;
    max-width: 100% !important;

    padding: 6px !important;
    margin: 0 !important;

    box-sizing: border-box !important;
  }

  /* ---------- MAIN TITLES ---------- */

  .workspace-column-main-title,
  .answer-main-title {
    font-size: 15px !important;
    line-height: 1.14 !important;
    padding: 10px 12px !important;
    font-weight: 900 !important;
  }

  /* ---------- INTERNAL BLOCKS ---------- */

  .workspace-block,
  .answer-segment,
  .answer-subcard,
  .improved-answer-highlight,
  .inspiration-answer-box {
    padding: 10px !important;
    border-radius: 12px !important;
  }

  /* ---------- INTERNAL SECTION TITLES ---------- */

  .answer-subcard-title,
  .segment-impact,
  .workspace-block-risk .answer-subcard-title {
    font-size: 11px !important;
    line-height: 1.22 !important;
    font-weight: 900 !important;
    letter-spacing: 0.02em !important;
  }

  /* ---------- BODY TEXT ---------- */

  .segment-excerpt,
  .segment-reason,
  .workspace-block p,
  .workspace-block li,
  .weakness-narrative-item,
  .improvement-narrative-item,
  .improved-answer-text,
  .inspiration-answer-text,
  .answer-coach-text,
  .answer-analysis-text {
    font-size: 13px !important;
    line-height: 1.42 !important;
    font-weight: 650 !important;
  }

  /* ---------- REDUCE SIDE WASTE ---------- */

  .workspace-analysis-column .workspace-block,
  .workspace-advice-column .workspace-block,
  .answer-segment {
    margin-left: 0 !important;
    margin-right: 0 !important;
  }

  /* ---------- BIG DARK CONTAINER ---------- */

  .workspace-analysis-column,
  .answer-analysis-column {
    border-radius: 14px !important;
  }

}


/* ===== ANSWER DETAILS — REAL STANDARDIZED BLOCKS ===== */

.fr-answer-weakness-list {
  display: grid;
  gap: 8px;
  margin-top: 10px;
}

.fr-answer-weakness-item {
  display: grid;
  grid-template-columns: 18px minmax(0, 1fr);
  gap: 8px;
  align-items: start;
  padding: 8px 0;
  border-bottom: 1px dashed rgba(255,255,255,0.18);
}

.fr-answer-weakness-dot {
  width: 17px;
  height: 17px;
  border-radius: 999px;
  background: #ef4444;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 900;
  margin-top: 3px;
}

.fr-answer-weakness-text {
  font-size: var(--fr-body);
  line-height: 1.42;
  font-weight: 700;
  color: #f8fafc;
}

.fr-answer-cv-support-details {
  margin-top: var(--fr-md);
}

.fr-answer-cv-support-body {
  padding: var(--fr-md);
}

@media (max-width: 640px) {
  .fr-answer-weakness-item {
    grid-template-columns: 17px minmax(0, 1fr);
    gap: 7px;
    padding: 7px 0;
  }

  .fr-answer-weakness-text {
    font-size: 13px;
    line-height: 1.36;
    font-weight: 650;
  }

  .fr-answer-cv-support-body {
    padding: 10px;
  }

  .fr-answer-cv-support-summary {
    font-size: 14px !important;
    line-height: 1.18 !important;
  }
}

/* ===== ANSWER MISSING SIGNALS STANDARD ===== */

.fr-answer-missing-box {
  margin-top: var(--fr-md) !important;
}

.fr-answer-missing-list {
  display: grid;
  gap: 8px;
  margin-top: 10px;
}

.fr-answer-missing-item {
  display: grid;
  grid-template-columns: 18px minmax(0, 1fr);
  gap: 8px;
  align-items: start;
  padding: 8px 0;
  border-bottom: 1px dashed rgba(255,255,255,0.18);
}

.fr-answer-missing-content {
  display: grid;
  gap: 3px;
}

.fr-answer-missing-label {
  font-size: var(--fr-body);
  line-height: 1.28;
  font-weight: 800;
  color: #ffffff;
}

.fr-answer-missing-hint {
  font-size: var(--fr-dense);
  line-height: 1.36;
  font-weight: 650;
  color: #e0e7ff;
}

@media (max-width: 640px) {
  .fr-answer-missing-item {
    grid-template-columns: 17px minmax(0, 1fr);
    gap: 7px;
    padding: 7px 0;
  }

  .fr-answer-missing-label {
    font-size: 13px;
    line-height: 1.25;
  }

  .fr-answer-missing-hint {
    font-size: 12px;
    line-height: 1.34;
  }
}

/* ===== ANSWER IMPROVEMENT LIST STANDARD ===== */

.fr-answer-improvement-list {
  display: grid;
  gap: 8px;
  margin-top: 10px;
}

.fr-answer-improvement-item {
  display: grid;
  grid-template-columns: 18px minmax(0, 1fr);
  gap: 8px;
  align-items: start;
  padding: 8px 0;
  border-bottom: 1px dashed rgba(255,255,255,0.18);
}

.fr-answer-improvement-dot {
  width: 17px;
  height: 17px;
  border-radius: 999px;
  background: #facc15;
  color: #111827;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 900;
  margin-top: 3px;
}

.fr-answer-improvement-text {
  font-size: var(--fr-body);
  line-height: 1.42;
  font-weight: 700;
  color: #f8fafc;
}

@media (max-width: 640px) {
  .fr-answer-improvement-item {
    grid-template-columns: 17px minmax(0, 1fr);
    gap: 7px;
    padding: 7px 0;
  }

  .fr-answer-improvement-text {
    font-size: 13px;
    line-height: 1.36;
    font-weight: 650;
  }
}

.fr-situation-summary span {
  font-size: 15px !important;
  line-height: 1.18 !important;
  font-weight: 900 !important;
}

.workspace-summary-score {
  font-size: 16px !important;
  line-height: 1 !important;
  font-weight: 900 !important;
  white-space: nowrap !important;
}

.workspace-summary-score::first-letter {
  font-size: inherit !important;
}

@media (max-width: 640px) {
  .improved-answer-highlight {
    padding: 10px !important;
    border-radius: 12px !important;
  }

  .improved-answer-title {
    font-size: 13px !important;
    line-height: 1.2 !important;
    letter-spacing: 0.03em !important;
  }

  .improved-answer-text {
    font-size: 13px !important;
    line-height: 1.38 !important;
    font-weight: 650 !important;
  }
}

@media (max-width: 640px) {
  .cv-support-title,
  .cv-support-heading,
  .cv-support-panel-title,
  .cv-signal-title {
    font-size: 16px !important;
    line-height: 1.18 !important;
    font-weight: 900 !important;
  }

  .cv-support-details,
  .cv-support-panel,
  .cv-support-card {
    padding: 10px !important;
  }

  .cv-support-details p,
  .cv-support-panel p,
  .cv-support-card p,
  .cv-support-details li,
  .cv-support-panel li,
  .cv-support-card li {
    font-size: 13px !important;
    line-height: 1.36 !important;
    font-weight: 650 !important;
  }

  .improved-answer-highlight,
  .opening-pitch-v09 {
    padding: 10px !important;
  }

  .improved-answer-title,
  .overview-pitch-label {
    font-size: 13px !important;
    line-height: 1.2 !important;
    font-weight: 900 !important;
  }

  .improved-answer-text,
  .inspiration-answer-text {
    font-size: 13px !important;
    line-height: 1.36 !important;
    font-weight: 650 !important;
  }
}

/* ===== CV SUPPORT READ BOX STANDARD ===== */

.fr-cv-support-read-box {
  display: grid;
  gap: var(--fr-md);
}

.fr-cv-support-bridge {
  padding: var(--fr-md);
  border-radius: var(--fr-radius-md);
  background: linear-gradient(180deg, #1e40af 0%, #1e3a8a 100%);
  color: #ffffff;
  font-size: var(--fr-body);
  line-height: 1.42;
  font-weight: 750;
}

.fr-cv-support-positioning {
  margin-top: var(--fr-sm);
}

.fr-cv-support-intro {
  font-size: var(--fr-body);
  line-height: 1.42;
  font-weight: 700;
  color: var(--fr-ink);
}

.fr-cv-support-grid {
  grid-template-columns: 1fr !important;
}

.fr-cv-support-column {
  padding: var(--fr-md) !important;
}

@media (max-width: 640px) {
  .fr-cv-support-read-box {
    gap: 10px;
  }

  .fr-cv-support-bridge {
    padding: 10px;
    font-size: 13px;
    line-height: 1.36;
    font-weight: 650;
  }

  .fr-cv-support-intro {
    font-size: 13px;
    line-height: 1.36;
    font-weight: 650;
  }

  .fr-cv-support-column {
    padding: 10px !important;
  }
}

@media (max-width: 640px) {
  .improved-answer-highlight {
    padding: 10px !important;
    margin-top: 10px !important;
    border-radius: 14px !important;
  }

  .improved-answer-title {
    font-size: 14px !important;
    line-height: 1.15 !important;
    letter-spacing: 0.04em !important;
  }

  .improved-answer-text {
    font-size: 13px !important;
    line-height: 1.34 !important;
    font-weight: 650 !important;
  }

  .inspiration-answer-box {
    padding: 10px !important;
    border-radius: 12px !important;
  }

  .inspiration-answer-label {
    font-size: 12px !important;
    line-height: 1.15 !important;
  }

  .inspiration-answer-text {
    font-size: 13px !important;
    line-height: 1.34 !important;
    font-weight: 650 !important;
  }
}

@media (max-width: 640px) {
  .fr-answer-cv-support-summary span {
    font-size: 14px !important;
    line-height: 1.15 !important;
  }

  .fr-cv-support-bridge,
  .fr-cv-support-intro {
    font-size: 13px !important;
    line-height: 1.34 !important;
    font-weight: 650 !important;
  }

  .cv-support-column-title {
    font-size: 15px !important;
    line-height: 1.15 !important;
  }

  .cv-support-narrative-item,
  .cv-support-narrative-text,
  .cv-support-narrative-item * {
    font-size: 13px !important;
    line-height: 1.34 !important;
    font-weight: 650 !important;
  }
}

@media (max-width: 640px) {
  .question-alignment-alert {
    padding: 12px !important;
  }

  .question-alignment-alert .alert-title,
  .question-alignment-alert-title,
  .question-alignment-alert strong {
    font-size: 12px !important;
    line-height: 1.18 !important;
    letter-spacing: 0.04em !important;
  }

  .question-alignment-alert p,
  .question-alignment-alert-text {
    font-size: 13px !important;
    line-height: 1.36 !important;
    font-weight: 700 !important;
  }
}

@media (max-width: 640px) {
  .cv-support-column,
  .cv-support-good,
  .fr-cv-support-column {
    padding: 10px !important;
  }

  .cv-support-column-title {
    font-size: 14px !important;
    line-height: 1.15 !important;
    margin-bottom: 10px !important;
  }

  .cv-support-narrative-item strong,
  .cv-support-narrative-item b {
    font-size: 13px !important;
    line-height: 1.3 !important;
  }

  .cv-support-narrative-item,
  .cv-support-narrative-item span,
  .cv-support-narrative-item div {
    font-size: 13px !important;
    line-height: 1.34 !important;
    font-weight: 650 !important;
  }
}

@media (max-width: 640px) {
  .improved-answer-highlight {
    padding: 10px !important;
  }

  .improved-answer-title {
    font-size: 13px !important;
    line-height: 1.15 !important;
    margin-bottom: 8px !important;
  }

  .improved-answer-text {
    font-size: 13px !important;
    line-height: 1.34 !important;
    font-weight: 650 !important;
  }

  .inspiration-answer-box {
    margin-top: 10px !important;
    padding: 10px !important;
  }

  .inspiration-answer-label {
    font-size: 11px !important;
    line-height: 1.15 !important;
    letter-spacing: 0.04em !important;
  }

  .inspiration-answer-text {
    font-size: 13px !important;
    line-height: 1.34 !important;
    font-weight: 650 !important;
  }
}

/* ===== QUESTION ALIGNMENT STANDARD ===== */

.fr-question-alignment-alert {
  margin-top: var(--fr-md);
  padding: var(--fr-md);
  border-radius: var(--fr-radius-md);
  box-shadow: var(--fr-shadow-sm);
}

.fr-question-alignment-risk {
  background: #fee2e2;
  border: 2px solid #ef4444;
  color: #7f1d1d;
}

.fr-question-alignment-warn {
  background: #fff7ed;
  border: 2px solid #f59e0b;
  color: #7c2d12;
}

.fr-question-alignment-good {
  background: #ecfdf5;
  border: 2px solid #22c55e;
  color: #064e3b;
}

.fr-question-alignment-label {
  display: inline-flex;
  align-items: center;
  padding: 5px 10px;
  border-radius: var(--fr-pill-radius);
  background: #ffffff;
  font-size: var(--fr-caption);
  line-height: 1.15;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin-bottom: var(--fr-sm);
}

.fr-question-alignment-risk .fr-question-alignment-label {
  color: #dc2626;
  border: 1px solid #ef4444;
}

.fr-question-alignment-warn .fr-question-alignment-label {
  color: #d97706;
  border: 1px solid #f59e0b;
}

.fr-question-alignment-good .fr-question-alignment-label {
  color: #16a34a;
  border: 1px solid #22c55e;
}

.fr-question-alignment-text {
  font-size: var(--fr-body);
  line-height: 1.42;
  font-weight: 800;
}

/* ===== CV SUPPORT NARRATIVE LIST STANDARD ===== */

.fr-cv-support-list {
  display: grid;
  gap: 0;
  margin-top: var(--fr-sm);
}

.fr-cv-support-item {
  display: grid;
  grid-template-columns: 22px minmax(0, 1fr);
  gap: 10px;
  align-items: start;
  padding: 10px 2px;
  border-bottom: 1px dashed rgba(148,163,184,0.55);
}

.fr-cv-support-dot {
  width: 18px;
  height: 18px;
  border-radius: var(--fr-pill-radius);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 900;
  margin-top: 3px;
}

.fr-cv-support-list-useful .fr-cv-support-dot {
  background: #15803d;
}

.fr-cv-support-list-missing .fr-cv-support-dot {
  background: #dc2626;
}

.fr-cv-support-text {
  font-size: var(--fr-body);
  line-height: 1.42;
  color: var(--fr-ink);
}

.fr-cv-support-text strong {
  font-weight: 900;
}

.fr-cv-support-text span {
  font-weight: 650;
  color: var(--fr-muted);
}

@media (max-width: 640px) {
  .fr-question-alignment-alert {
    padding: 12px;
    border-radius: 14px;
  }

  .fr-question-alignment-label {
    font-size: 11px;
    line-height: 1.15;
    padding: 4px 9px;
  }

  .fr-question-alignment-text {
    font-size: 13px;
    line-height: 1.36;
    font-weight: 700;
  }

  .fr-cv-support-item {
    grid-template-columns: 20px minmax(0, 1fr);
    gap: 8px;
    padding: 8px 0;
  }

  .fr-cv-support-dot {
    width: 16px;
    height: 16px;
    font-size: 11px;
  }

  .fr-cv-support-text {
    font-size: 13px;
    line-height: 1.34;
  }
}

/* ===== IMPROVED ANSWER BOX STANDARD ===== */

.improved-answer-highlight {
  padding: 14px !important;
  border-radius: 16px !important;
  background: #f8fafc !important;
  border: 2px solid #8b5cf6 !important;
}

.improved-answer-title {
  color: #4c1d95 !important;
  font-size: 16px !important;
  line-height: 1.18 !important;
  font-weight: 900 !important;
  letter-spacing: 0.04em !important;
  text-transform: uppercase !important;
  margin-bottom: 10px !important;
}

.improved-answer-text {
  color: var(--fr-ink) !important;
  font-size: var(--fr-body) !important;
  line-height: 1.42 !important;
  font-weight: 700 !important;
}

.inspiration-answer-box {
  margin-top: 12px !important;
  padding: 12px !important;
  border-radius: 14px !important;
  background: #ffffff !important;
  border: 2px solid #a855f7 !important;
}

.inspiration-answer-label {
  color: #4c1d95 !important;
  font-size: var(--fr-caption) !important;
  line-height: 1.18 !important;
  font-weight: 900 !important;
  letter-spacing: 0.04em !important;
  text-transform: uppercase !important;
  margin-bottom: 8px !important;
}

.inspiration-answer-text {
  color: var(--fr-ink) !important;
  font-size: var(--fr-body) !important;
  line-height: 1.42 !important;
  font-weight: 700 !important;
}

@media (max-width: 640px) {
  .improved-answer-highlight {
    padding: 10px !important;
    border-radius: 14px !important;
  }

  .improved-answer-title {
    font-size: 13px !important;
    line-height: 1.15 !important;
    margin-bottom: 8px !important;
  }

  .improved-answer-text {
    font-size: 13px !important;
    line-height: 1.34 !important;
    font-weight: 650 !important;
  }

  .inspiration-answer-box {
    padding: 10px !important;
    border-radius: 12px !important;
  }

  .inspiration-answer-label {
    font-size: 11px !important;
    line-height: 1.15 !important;
  }

  .inspiration-answer-text {
    font-size: 13px !important;
    line-height: 1.34 !important;
    font-weight: 650 !important;
  }
}

/* ===== FINAL OVERRIDE — ANSWERS MOBILE COACH BOX ===== */

@media (max-width: 640px) {

  .fr-answer-analysis-details .workspace-advice-column {
    padding-left: 6px !important;
    padding-right: 6px !important;
  }

  .fr-answer-analysis-details .improved-answer-highlight {
    width: 100% !important;
    max-width: 100% !important;
    box-sizing: border-box !important;

    margin-left: 0 !important;
    margin-right: 0 !important;
    margin-top: 10px !important;

    padding: 10px !important;
    border-radius: 13px !important;
  }

  .fr-answer-analysis-details .improved-answer-title {
    font-size: 12px !important;
    line-height: 1.16 !important;
    font-weight: 900 !important;
    letter-spacing: 0.035em !important;
    margin-bottom: 8px !important;
  }

  .fr-answer-analysis-details .improved-answer-text {
    font-size: 12.5px !important;
    line-height: 1.34 !important;
    font-weight: 650 !important;
  }

  .fr-answer-analysis-details .inspiration-answer-box {
    width: 100% !important;
    max-width: 100% !important;
    box-sizing: border-box !important;

    margin-top: 10px !important;
    padding: 10px !important;
    border-radius: 12px !important;
  }

  .fr-answer-analysis-details .inspiration-answer-label {
    font-size: 11px !important;
    line-height: 1.14 !important;
    font-weight: 900 !important;
    letter-spacing: 0.035em !important;
    margin-bottom: 7px !important;
  }

  .fr-answer-analysis-details .inspiration-answer-text {
    font-size: 12.5px !important;
    line-height: 1.34 !important;
    font-weight: 650 !important;
  }
}

/* ===== MOBILE WIDTH OPTIMIZATION ===== */

@media (max-width: 640px) {

  .fr-answer-analysis-details .workspace-analysis-grid,
  .fr-answer-analysis-details .workspace-improvement-grid,
  .fr-answer-analysis-details .workspace-two-columns {
    gap: 10px !important;
  }

  .fr-answer-analysis-details .workspace-analysis-column,
  .fr-answer-analysis-details .workspace-advice-column,
  .fr-answer-analysis-details .workspace-block,
  .fr-answer-analysis-details .workspace-card {
    padding-left: 8px !important;
    padding-right: 8px !important;
  }

  .fr-answer-analysis-details .workspace-analysis-column,
  .fr-answer-analysis-details .workspace-advice-column {
    width: 100% !important;
    max-width: 100% !important;
    min-width: 0 !important;
  }

  .fr-answer-analysis-details .workspace-block {
    border-radius: 14px !important;
  }

  .fr-answer-analysis-details .workspace-block-risk,
  .fr-answer-analysis-details .workspace-block-dark {
    padding: 10px !important;
  }

  .fr-answer-analysis-details .cv-support-read-box {
    padding-left: 6px !important;
    padding-right: 6px !important;
  }

  .fr-answer-analysis-details .cv-support-column {
    padding: 10px !important;
  }
}

/* ===== FINAL FIX — ANSWER DETAIL MOBILE WIDTH ===== */

@media (max-width: 640px) {
  .fr-answer-analysis-details .cv-parsed-content {
    max-height: none !important;
    overflow-y: visible !important;

    width: 100% !important;
    max-width: 100% !important;

    padding-left: 6px !important;
    padding-right: 6px !important;

    box-sizing: border-box !important;
  }

  .fr-answer-analysis-details .answer-card-grid,
  .fr-answer-analysis-details .fr-answer-detail-grid {
    width: 100% !important;
    max-width: 100% !important;
    margin-left: 0 !important;
    margin-right: 0 !important;
    box-sizing: border-box !important;
  }

  .fr-answer-analysis-details .workspace-analysis-column,
  .fr-answer-analysis-details .workspace-advice-column {
    width: 100% !important;
    max-width: 100% !important;
    min-width: 0 !important;

    margin-left: 0 !important;
    margin-right: 0 !important;

    padding-left: 8px !important;
    padding-right: 8px !important;

    box-sizing: border-box !important;
  }

  .fr-answer-analysis-details .answer-subcard {
    width: 100% !important;
    max-width: 100% !important;
    box-sizing: border-box !important;
  }
}

/* ===== MOBILE — ANSWER DETAIL OUTER CONTAINER LIGHTENING ===== */

@media (max-width: 640px) {
  .fr-answer-analysis-details .workspace-analysis-column,
  .fr-answer-analysis-details .workspace-advice-column {
    border-width: 1px !important;
    padding-left: 6px !important;
    padding-right: 6px !important;
    background: #182235 !important;
  }

  .fr-answer-analysis-details .answer-subcard {
    padding-left: 8px !important;
    padding-right: 8px !important;
  }

  .fr-answer-analysis-details .workspace-block {
    padding-left: 8px !important;
    padding-right: 8px !important;
  }
}

/* ===== MOBILE — ANSWERS PAGE WIDTH RECOVERY ===== */

@media (max-width: 640px) {
  [data-report-section="answers"] .section-shell {
    padding-left: 4px !important;
    padding-right: 4px !important;
    border-radius: 14px !important;
  }

  [data-report-section="answers"] .fr-situation-details-body {
    padding-left: 8px !important;
    padding-right: 8px !important;
  }

  [data-report-section="answers"] .answer-tab-panel {
    padding-left: 0 !important;
    padding-right: 0 !important;
  }
}

@media (max-width: 640px) {
  [data-report-section="answers"] .inspiration-answer-box {
    padding-left: 8px !important;
    padding-right: 8px !important;
  }

  [data-report-section="answers"] .improved-answer-highlight {
    padding-left: 8px !important;
    padding-right: 8px !important;
  }
}

/* =========================================================
   FINAL FIX — ANSWERS MOBILE WIDTH / CV SUPPORT ALIGNMENT
   Da tenere in fondo al CSS
========================================================= */

@media (max-width: 640px) {

  [data-report-section="answers"] .section-shell {
    padding-left: 4px !important;
    padding-right: 4px !important;
  }

  [data-report-section="answers"] .answer-tabs-shell,
  [data-report-section="answers"] .answer-tab-panel,
  [data-report-section="answers"] .fr-answer-qa-details,
  [data-report-section="answers"] .fr-answer-reading-box,
  [data-report-section="answers"] .fr-answer-cv-support-details,
  [data-report-section="answers"] .fr-answer-analysis-details {
    width: 100% !important;
    max-width: 100% !important;
    box-sizing: border-box !important;
    margin-left: 0 !important;
    margin-right: 0 !important;
  }

  [data-report-section="answers"] .fr-answer-reading-box {
    padding-left: 8px !important;
    padding-right: 8px !important;
  }

  [data-report-section="answers"] .fr-answer-cv-support-body {
    padding-left: 6px !important;
    padding-right: 6px !important;
  }

  [data-report-section="answers"] .fr-cv-support-read-box {
    width: 100% !important;
    max-width: 100% !important;
    box-sizing: border-box !important;
    gap: 10px !important;
  }

  [data-report-section="answers"] .fr-cv-support-column,
  [data-report-section="answers"] .cv-support-column,
  [data-report-section="answers"] .cv-support-good {
    width: 100% !important;
    max-width: 100% !important;
    box-sizing: border-box !important;
    padding-left: 8px !important;
    padding-right: 8px !important;
  }

  [data-report-section="answers"] .fr-cv-support-list {
    width: 100% !important;
    max-width: 100% !important;
  }

  [data-report-section="answers"] .fr-cv-support-item {
    grid-template-columns: 20px minmax(0, 1fr) !important;
    gap: 8px !important;
    padding-left: 0 !important;
    padding-right: 0 !important;
  }

  [data-report-section="answers"] .fr-cv-support-text {
    min-width: 0 !important;
    overflow-wrap: anywhere !important;
  }

  [data-report-section="answers"] .fr-situation-details-body {
    padding-left: 6px !important;
    padding-right: 6px !important;
  }

  [data-report-section="answers"] .cv-parsed-content {
    padding-left: 4px !important;
    padding-right: 4px !important;
  }

  [data-report-section="answers"] .answer-card-grid,
  [data-report-section="answers"] .fr-answer-detail-grid {
    width: 100% !important;
    max-width: 100% !important;
    gap: 10px !important;
  }

  [data-report-section="answers"] .answer-subcard,
  [data-report-section="answers"] .workspace-analysis-column,
  [data-report-section="answers"] .workspace-advice-column {
    width: 100% !important;
    max-width: 100% !important;
    min-width: 0 !important;
    box-sizing: border-box !important;
    padding-left: 6px !important;
    padding-right: 6px !important;
  }

  [data-report-section="answers"] .workspace-block {
    padding-left: 8px !important;
    padding-right: 8px !important;
  }
}

/* ===== CV SUPPORT — COACH READABILITY UPGRADE ===== */

.fr-cv-support-coach-box {
  padding: var(--fr-md);
  border-radius: var(--fr-radius-md);
  background: linear-gradient(180deg, #1e40af 0%, #1e3a8a 100%);
  color: #ffffff;
  border: 2px solid #60a5fa;
  box-shadow: var(--fr-shadow-sm);
}

.fr-cv-support-coach-title {
  margin-bottom: 8px;
  color: #fde68a;
  font-size: var(--fr-caption);
  line-height: 1.2;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.fr-cv-support-coach-text {
  font-size: var(--fr-body);
  line-height: 1.45;
  font-weight: 750;
}

.fr-cv-support-coach-text-secondary {
  margin-top: 10px;
  color: #dbeafe;
}

.fr-cv-support-signals-box {
  padding: var(--fr-md);
  border-radius: var(--fr-radius-md);
  background: #ffffff;
  border: 2px solid var(--fr-soft-border);
}

.fr-cv-support-signals-title {
  color: var(--fr-primary-2);
  font-size: var(--fr-caption);
  line-height: 1.2;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 8px;
}

.fr-cv-support-signals-intro {
  color: var(--fr-muted);
  font-size: var(--fr-dense);
  line-height: 1.38;
  font-weight: 700;
  margin-bottom: 8px;
}

@media (max-width: 640px) {
  .fr-cv-support-coach-box,
  .fr-cv-support-signals-box {
    padding: 10px !important;
    border-radius: 13px !important;
  }

  .fr-cv-support-coach-title,
  .fr-cv-support-signals-title {
    font-size: 11px !important;
    line-height: 1.15 !important;
  }

  .fr-cv-support-coach-text {
    font-size: 13px !important;
    line-height: 1.36 !important;
    font-weight: 650 !important;
  }

  .fr-cv-support-signals-intro {
    font-size: 12px !important;
    line-height: 1.34 !important;
  }
}

/* ===== OPERATIONAL ACTION PLAN ===== */

.fr-action-plan-details {
  border: 2px solid #facc15;
  box-shadow: 0 10px 22px rgba(250,204,21,0.18);
}

.fr-action-plan-intro {
  padding: var(--fr-md);
  border-radius: var(--fr-radius-md);
  background: #eef2ff;
  border: 1px solid var(--fr-soft-border);
  color: var(--fr-ink);
  font-size: var(--fr-body);
  line-height: 1.45;
  font-weight: 700;
}

.fr-action-plan-list {
  display: grid;
  gap: var(--fr-md);
  margin-top: var(--fr-md);
}

.fr-action-plan-item {
  display: grid;
  grid-template-columns: 42px minmax(0, 1fr);
  gap: var(--fr-md);
  padding: var(--fr-md);
  border-radius: var(--fr-radius-md);
  background: #ffffff;
  border: 2px solid #cbd5e1;
  box-shadow: var(--fr-shadow-sm);
}

.fr-action-plan-high {
  border-color: #ef4444;
}

.fr-action-plan-medium {
  border-color: #f59e0b;
}

.fr-action-plan-low {
  border-color: #94a3b8;
}

.fr-action-plan-rank {
  width: 38px;
  height: 38px;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #111827;
  color: #ffffff;
  font-size: 18px;
  font-weight: 900;
}

.fr-action-plan-content {
  min-width: 0;
}

.fr-action-plan-topline {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
  margin-bottom: 8px;
}

.fr-action-plan-weight,
.fr-action-plan-level {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  padding: 4px 9px;
  font-size: var(--fr-caption);
  line-height: 1.15;
  font-weight: 900;
}

.fr-action-plan-weight {
  background: #111827;
  color: #ffffff;
}

.fr-action-plan-level {
  background: #fef3c7;
  color: #92400e;
}

.fr-action-plan-title {
  color: var(--fr-ink);
  font-size: var(--fr-title-card);
  line-height: 1.22;
  font-weight: 900;
  margin-bottom: 10px;
}

.fr-action-plan-why,
.fr-action-plan-action {
  color: var(--fr-ink);
  font-size: var(--fr-body);
  line-height: 1.42;
  font-weight: 650;
  margin-top: 8px;
}

.fr-action-plan-why strong,
.fr-action-plan-action strong {
  font-weight: 900;
}

.fr-action-plan-seen {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-top: 12px;
}

.fr-action-plan-seen span {
  display: inline-flex;
  border-radius: 999px;
  padding: 5px 9px;
  background: #e0e7ff;
  color: #3730a3;
  font-size: var(--fr-caption);
  line-height: 1.15;
  font-weight: 900;
}

@media (max-width: 640px) {
  .fr-action-plan-intro {
    padding: 10px !important;
    font-size: 13px !important;
    line-height: 1.36 !important;
  }

  .fr-action-plan-list {
    gap: 10px !important;
  }

  .fr-action-plan-item {
    grid-template-columns: 32px minmax(0, 1fr);
    gap: 8px;
    padding: 10px !important;
    border-radius: 14px !important;
  }

  .fr-action-plan-rank {
    width: 30px;
    height: 30px;
    font-size: 14px;
  }

  .fr-action-plan-title {
    font-size: 14px !important;
    line-height: 1.22 !important;
  }

  .fr-action-plan-why,
  .fr-action-plan-action {
    font-size: 13px !important;
    line-height: 1.34 !important;
  }

  .fr-action-plan-weight,
  .fr-action-plan-level,
  .fr-action-plan-seen span {
    font-size: 11px !important;
  }
}

/* ===== ACTION PLAN MOBILE POLISH ===== */

.fr-action-plan-content-wrap {
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

.fr-action-plan-rank {
  background: linear-gradient(180deg, #ef4444 0%, #b91c1c 100%) !important;
  color: #ffffff !important;
  box-shadow: 0 6px 14px rgba(239,68,68,0.22);
}

@media (max-width: 640px) {
  .fr-action-plan-item {
    grid-template-columns: 34px minmax(0, 1fr) !important;
    gap: 8px !important;
    padding: 10px !important;
  }

  .fr-action-plan-rank {
    width: 32px !important;
    height: 32px !important;
    font-size: 15px !important;
    margin-top: 2px !important;
  }

  .fr-action-plan-content {
    min-width: 0 !important;
  }

  .fr-action-plan-title {
    font-size: 14px !important;
    line-height: 1.22 !important;
    margin-top: 4px !important;
    margin-bottom: 10px !important;
  }

  .fr-action-plan-why,
  .fr-action-plan-action {
    font-size: 13px !important;
    line-height: 1.35 !important;
  }

  .fr-action-plan-topline {
    margin-bottom: 6px !important;
  }
}

/* ===== ACTION PLAN TEXT WIDTH ===== */

.fr-action-plan-item {
  align-items: start;
}

.fr-action-plan-content {
  padding-top: 2px;
}

.fr-action-plan-title,
.fr-action-plan-why,
.fr-action-plan-action {
  margin-left: 0 !important;
  padding-left: 0 !important;
}

@media (max-width: 640px) {

  .fr-action-plan-item {
    grid-template-columns: 30px minmax(0,1fr) !important;
    gap: 10px !important;
  }

  .fr-action-plan-rank {
    margin-top: 0 !important;
  }

  .fr-action-plan-content {
    width: 100% !important;
  }

  .fr-action-plan-title {
    display: block;
    width: 100%;
    margin-top: 2px !important;
  }

  .fr-action-plan-why,
  .fr-action-plan-action {
    display: block;
    width: 100%;
  }
}

/* ===== ACTION PLAN LAYOUT REBUILD ===== */

.fr-action-plan-item {
  display: block !important;
}

.fr-action-plan-head {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.fr-action-plan-badges {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.fr-action-plan-title,
.fr-action-plan-why,
.fr-action-plan-action,
.fr-action-plan-seen {
  width: 100%;
  margin-left: 0 !important;
}

.fr-action-plan-title {
  margin-top: 4px !important;
}

@media (max-width: 640px) {
  .fr-action-plan-item {
    padding: 12px !important;
  }

  .fr-action-plan-head {
    gap: 8px !important;
    margin-bottom: 10px !important;
  }

  .fr-action-plan-title {
    font-size: 15px !important;
    line-height: 1.22 !important;
  }

  .fr-action-plan-why,
  .fr-action-plan-action {
    font-size: 13px !important;
    line-height: 1.35 !important;
  }
}

/* ===== RECRUITER RECOVERY PROMPT ===== */

.fr-recruiter-recovery {
  margin-top: 12px;
  padding: var(--fr-md);
  border-radius: var(--fr-radius-md);
  background: #fff7ed;
  border: 2px solid #fb923c;
  box-shadow: var(--fr-shadow-sm);
}

.fr-recruiter-recovery-high {
  background: #fef2f2;
  border-color: #ef4444;
}

.fr-recruiter-recovery-label {
  color: #9a3412;
  font-size: var(--fr-caption);
  line-height: 1.2;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 8px;
}

.fr-recruiter-recovery-high .fr-recruiter-recovery-label {
  color: #991b1b;
}

.fr-recruiter-recovery-prompt {
  color: var(--fr-ink);
  font-size: var(--fr-body);
  line-height: 1.45;
  font-weight: 800;
  margin-bottom: 10px;
}

.fr-recruiter-recovery-expected {
  color: var(--fr-muted);
  font-size: var(--fr-dense);
  line-height: 1.38;
  font-weight: 700;
}

.fr-recruiter-recovery-expected strong {
  color: var(--fr-ink);
  font-weight: 900;
}

@media (max-width: 640px) {
  .fr-recruiter-recovery {
    padding: 10px !important;
    border-radius: 13px !important;
  }

  .fr-recruiter-recovery-label {
    font-size: 11px !important;
  }

  .fr-recruiter-recovery-prompt {
    font-size: 13px !important;
    line-height: 1.36 !important;
  }

  .fr-recruiter-recovery-expected {
    font-size: 12px !important;
    line-height: 1.34 !important;
  }
}

/* ===== FEATURED RECRUITER RECOVERY ===== */

.featured-recruiter-recovery {
  margin-top: 10px;
  padding: 10px 12px;
  border-radius: 14px;
  background: #fff7ed;
  border: 1.5px solid #fb923c;
}

.featured-recruiter-recovery-kicker {
  color: #9a3412;
  font-size: var(--fr-caption);
  line-height: 1.15;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.045em;
  margin-bottom: 6px;
}

.featured-recruiter-recovery-text {
  color: var(--fr-ink);
  font-size: var(--fr-dense);
  line-height: 1.35;
  font-weight: 750;
}

@media (max-width: 640px) {
  .featured-recruiter-recovery {
    padding: 9px 10px !important;
    border-radius: 12px !important;
  }

  .featured-recruiter-recovery-kicker {
    font-size: 10.5px !important;
    line-height: 1.12 !important;
    margin-bottom: 5px !important;
  }

  .featured-recruiter-recovery-text {
    font-size: 12.5px !important;
    line-height: 1.32 !important;
  }
}

.fr-recruiter-panel {
  margin-top: 12px;
  padding: 14px;
  border: 2px solid #0b2a6f;
  border-radius: 16px;
  background: #ffffff;
}

.fr-recruiter-panel-title {
  font-size: var(--fr-title-section);
  line-height: 1.2;
  font-weight: 900;
  color: var(--fr-primary-1);
  margin-bottom: 4px;
}

.fr-recruiter-panel-subtitle {
  font-size: var(--fr-dense);
  line-height: 1.4;
  font-weight: 650;
  color: var(--fr-muted);
  margin-bottom: var(--fr-md);
  padding-bottom: var(--fr-sm);
  border-bottom: 1px solid var(--fr-soft-border);
}


.fr-recruiter-panel .fr-recruiter-recovery-box,
.fr-recruiter-panel .fr-answer-pattern-note {
  margin-top: 10px;
}

.fr-recruiter-pattern-note {
  border-color: #c4b5fd !important;
  background: #f5f3ff !important;
}

@media (max-width: 640px) {
  .fr-recruiter-panel {
    padding: var(--fr-md) !important;
  }

  .fr-recruiter-panel-title {
    font-size: var(--fr-title-section) !important;
  }

  .fr-recruiter-panel-subtitle {
    font-size: var(--fr-dense) !important;
  }
}

/* ===== FRINGE STANDARD ALIGNMENT — ANSWER WORKSPACE TITLES ===== */

.workspace-column-main-title {
  min-height: auto !important;
  margin: 0 0 var(--fr-md) 0 !important;
  padding: var(--fr-sm) var(--fr-md) !important;

  border-radius: var(--fr-radius-md) !important;
  border: 1px solid var(--fr-soft-border) !important;

  background: linear-gradient(
    180deg,
    var(--fr-primary-2) 0%,
    var(--fr-primary-1) 100%
  ) !important;

  color: #ffffff !important;
  text-align: center !important;

  font-size: var(--fr-title-card) !important;
  line-height: 1.25 !important;
  font-weight: 900 !important;

  box-shadow: var(--fr-shadow-sm) !important;
}

.workspace-analysis-column,
.workspace-advice-column {
  background: #263244 !important;
  border: 2px solid var(--fr-primary-2) !important;
  border-radius: var(--fr-radius-lg) !important;
  box-shadow: var(--fr-shadow-sm) !important;
}

@media (max-width: 640px) {
  .workspace-column-main-title {
    font-size: var(--fr-title-card) !important;
    padding: var(--fr-sm) var(--fr-md) !important;
  }
}

/* ===== FINAL FIX — WORKSPACE COLUMN TITLES CONSISTENCY ===== */

.workspace-analysis-column > .workspace-column-main-title,
.workspace-advice-column > .workspace-column-main-title {
  min-height: auto !important;
  margin: 0 0 var(--fr-md) 0 !important;
  padding: var(--fr-sm) var(--fr-md) !important;

  border-radius: var(--fr-radius-md) !important;
  border: 1px solid rgba(255,255,255,0.22) !important;

  background: linear-gradient(
    180deg,
    var(--fr-primary-2) 0%,
    var(--fr-primary-1) 100%
  ) !important;

  color: #ffffff !important;
  text-align: center !important;

  font-size: var(--fr-title-card) !important;
  line-height: 1.25 !important;
  font-weight: 900 !important;

  box-shadow: var(--fr-shadow-sm) !important;
}

/* ===== FRINGE STANDARD — RECRUITER PANEL REFINEMENT ===== */

.fr-recruiter-panel {
  margin-top: var(--fr-md) !important;
  padding: var(--fr-md) !important;

  border: 2px solid var(--fr-primary-1) !important;
  border-radius: var(--fr-radius-lg) !important;

  background: #263244 !important;
  color: #ffffff !important;

  box-shadow: var(--fr-shadow-sm) !important;
}

.fr-recruiter-panel-title {
  margin: 0 0 var(--fr-sm) 0 !important;
  padding: var(--fr-sm) var(--fr-md) !important;

  border-radius: var(--fr-radius-md) !important;
  border: 1px solid rgba(255,255,255,0.22) !important;

  background: linear-gradient(
    180deg,
    var(--fr-primary-2) 0%,
    var(--fr-primary-1) 100%
  ) !important;

  color: #ffffff !important;
  text-align: center !important;

  font-size: var(--fr-title-card) !important;
  line-height: 1.25 !important;
  font-weight: 900 !important;

  box-shadow: var(--fr-shadow-sm) !important;
}

.fr-recruiter-panel-subtitle {
  margin: 0 0 var(--fr-md) 0 !important;
  padding: var(--fr-sm) var(--fr-md) !important;

  border-radius: var(--fr-radius-sm) !important;
  border: 1px solid rgba(255,255,255,0.28) !important;

  background: rgba(255,255,255,0.12) !important;
  color: #ffffff !important;

  font-size: var(--fr-dense) !important;
  line-height: 1.45 !important;
  font-weight: 800 !important;
}

.fr-recruiter-panel .fr-recruiter-recovery-box {
  background: #fee2e2 !important;
  border: 2px solid #ef4444 !important;
  border-radius: var(--fr-radius-md) !important;
  color: #7f1d1d !important;
}

.fr-recruiter-panel .fr-recruiter-pattern-note {
  background: #e0e7ff !important;
  border: 2px solid var(--fr-primary-2) !important;
  border-radius: var(--fr-radius-md) !important;
  color: var(--fr-ink) !important;
}

@media (max-width: 640px) {
  .fr-recruiter-panel {
    padding: var(--fr-md) !important;
  }

  .fr-recruiter-panel-title {
    font-size: var(--fr-title-card) !important;
    padding: var(--fr-sm) var(--fr-md) !important;
  }
}

.fr-recruiter-panel-title {
  background: linear-gradient(
    180deg,
    var(--fr-primary-1) 0%,
    var(--fr-primary-2) 100%
  ) !important;
}

@media (max-width: 640px) {
  .workspace-analysis-column > .workspace-column-main-title,
  .workspace-advice-column > .workspace-column-main-title {
    width: 100% !important;
    display: flex !important;
    justify-content: center !important;
    align-items: center !important;
    text-align: center !important;
    margin-left: 0 !important;
    margin-right: 0 !important;
    box-sizing: border-box !important;
  }
}

/* ===== FRINGE STANDARD — YELLOW TOGGLE BARS ===== */

/* ===== FRINGE FIX — DETAILS SUMMARY WITHOUT OVERLAP ===== */

.fr-answer-analysis-details {
  border-radius: var(--fr-radius-lg) !important;
  overflow: visible !important;
}

.fr-answer-analysis-details > summary {
  border-radius: var(--fr-radius-md) !important;
  margin-bottom: var(--fr-md) !important;
}

.fr-answer-analysis-details .fr-situation-details-body {
  padding-top: var(--fr-md) !important;
}

@media (max-width: 640px) {
  .workspace-analysis-column,
  .workspace-advice-column {
    padding-top: var(--fr-md) !important;
  }

  .workspace-column-main-title,
  .fr-recruiter-panel-title {
    margin-top: 0 !important;
    margin-bottom: var(--fr-md) !important;
  }
}

@media (max-width: 640px) {
  .workspace-column-main-title,
  .fr-recruiter-panel-title {
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    text-align: center !important;
  }
}

.fr-answer-analysis-details > summary {
  margin-bottom: var(--fr-sm) !important;
}

.fr-answer-analysis-details .fr-situation-details-body {
  padding-top: var(--fr-sm) !important;
}

@media (max-width: 640px) {
  .workspace-analysis-column,
  .workspace-advice-column {
    padding-top: var(--fr-lg) !important;
  }

  .workspace-column-main-title {
    margin-top: 0 !important;
    margin-bottom: var(--fr-md) !important;
  }
}

.fr-situation-summary,
.fr-cv-support-summary,
.fr-answer-analysis-details > summary,
details > summary[class*="summary"] {
  border-radius: var(--fr-radius-md) !important;
}





  </style>
</head>
<body>
  <div class="page">



    <section class="pro-mini-hero">

  <div class="fringe-brand-block">
    <div class="fringe-brand-main">FRINGE</div>
    <div class="fringe-brand-sub">Interview · PRO</div>
  </div>

  <div class="fringe-tagline">
  Preparare il colloquio,<br>
  sul serio.
</div>

  </section>

     <div class="top-nav-outer">
  

  <div class="top-nav">

      <button class="top-nav-item active" data-report-nav="overview" type="button">Situazione</button>

      <button class="top-nav-item" data-report-nav="perception" type="button">Percezione</button>

      <button class="top-nav-item" data-report-nav="answers" type="button">Risposte</button>
      <button class="top-nav-item" data-report-nav="criticalPoints" type="button">Domande delicate</button>
      <button class="top-nav-item" data-report-nav="cv" type="button">CV</button>
      <button class="top-nav-item" data-report-nav="final" type="button">Checklist</button>
    </div>
    </div>


        <div class="report-section is-active" data-report-section="overview">
     ${renderOverviewSituationSection(overviewModules, proReportV2)}
    </div>

    <div class="report-section" data-report-section="perception">
  ${renderProfessionalPerceptionSection(proReportV2)}
  </div>
    

    <div class="report-section" data-report-section="answers">


      ${answersModules.map((module) =>
  renderAnswersModule(module, {
    productMode: proReportV2?.productMode || "pro",
    productCapabilities: proReportV2?.productCapabilities || {},
    proReportNarratives
  })
  ).join("\n")}




    </div>

    <div class="report-section" data-report-section="criticalPoints">
      ${criticalModules.map(renderOverviewModule).join("\n")}
    </div>

    <div class="report-section" data-report-section="cv">
      ${cvModules.map(renderOverviewModule).join("\n")}
    </div>

    <div class="report-section" data-report-section="final">
      ${finalModules.map(renderOverviewModule).join("\n")}
    </div>

  </div>

      <script>
  (function () {

    function switchReportSection(sectionKey) {
      document.querySelectorAll("[data-report-nav]").forEach(function (button) {
        button.classList.toggle(
          "active",
          String(button.getAttribute("data-report-nav")) === String(sectionKey)
        );
      });

      document.querySelectorAll("[data-report-section]").forEach(function (section) {
        section.classList.toggle(
          "is-active",
          String(section.getAttribute("data-report-section")) === String(sectionKey)
        );
      });
    }

    document.querySelectorAll("[data-report-nav]").forEach(function (button) {
      button.addEventListener("click", function () {
        switchReportSection(button.getAttribute("data-report-nav"));
      });
    });

    function switchAnswerTab(index) {

        document.querySelectorAll("[data-situation-open]").forEach(function (button) {

  button.addEventListener("click", function () {

    const key = button.getAttribute("data-situation-open");

    document.querySelectorAll("[data-situation-panel]").forEach(function (panel) {

      panel.style.display =
        panel.getAttribute("data-situation-panel") === key
          ? "block"
          : "none";
    });

    window.scrollTo({
      top:
        document.querySelector('[data-situation-panel="' + key + '"]')
          ?.offsetTop - 80 || 0,
      behavior: "smooth"
    });
  });
});


        document.querySelectorAll("[data-answer-tab]").forEach(function (button) {
          button.classList.toggle("is-active", String(button.getAttribute("data-answer-tab")) === String(index));
        });

        document.querySelectorAll("[data-answer-panel]").forEach(function (panel) {
          panel.classList.toggle("is-active", String(panel.getAttribute("data-answer-panel")) === String(index));
        });
      }

      document.querySelectorAll("[data-answer-tab]").forEach(function (button) {
        button.addEventListener("click", function () {
          switchAnswerTab(button.getAttribute("data-answer-tab"));
        });
      });

     
      

    function openFringePanel(sectionRoot, panelKey, allowClose) {
  if (!sectionRoot || !panelKey) return;

  var target = sectionRoot.querySelector('[data-fr-panel="' + panelKey + '"]');
  var alreadyOpen = target && target.classList.contains("is-open");

  sectionRoot.querySelectorAll("[data-fr-panel]").forEach(function (panel) {
    panel.classList.remove("is-open");
  });

  sectionRoot.querySelectorAll("[data-fr-open-panel]").forEach(function (chip) {
    chip.classList.remove("is-active");
  });


  if (allowClose && alreadyOpen) {
  var title = sectionRoot.querySelector(".opening-main-title-v09");
  if (title) {
    var yTitle = title.getBoundingClientRect().top + window.scrollY - 82;
    window.scrollTo({ top: yTitle, behavior: "smooth" });
  }
  return;
}



  if (target) {
    target.classList.add("is-open");
  }

  sectionRoot.querySelectorAll("[data-fr-open-panel]").forEach(function (chip) {
    chip.classList.toggle(
      "is-active",
      String(chip.getAttribute("data-fr-open-panel")) === String(panelKey)
    );
  });


  var nav = sectionRoot.querySelector(".fr-section-nav");

if (nav) {
  var isMobile = window.matchMedia("(max-width: 640px)").matches;
  var offset = isMobile ? 36 : 150;

  var y = nav.getBoundingClientRect().top + window.scrollY - offset;
  requestAnimationFrame(function () {
  window.scrollTo({
    top: y,
    behavior: "smooth"
  });
});
}



}





  document.querySelectorAll("[data-fr-section]").forEach(function (sectionRoot) {
  sectionRoot.querySelectorAll("[data-fr-open-panel]").forEach(function (button) {
    button.addEventListener("click", function () {
      openFringePanel(
        sectionRoot,
        button.getAttribute("data-fr-open-panel"),
        false
      );
    });
  });

  sectionRoot.querySelectorAll("[data-fr-toggle-panel]").forEach(function (button) {
    button.addEventListener("click", function () {
      openFringePanel(
        sectionRoot,
        button.getAttribute("data-fr-toggle-panel"),
        true
      );
    });
  });
});

      
    })();
  </script>
</body>
</html>
  `.trim();
}

export default renderProReportHtml;