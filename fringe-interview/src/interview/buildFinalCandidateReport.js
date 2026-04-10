import { getInterviewLocale } from "../i18n/getInterviewLocale.js";

function ensureArray(value) {
  return Array.isArray(value) ? value : [];
}

function normalizeString(value) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

function topLabels(items, limit = 5) {
  return ensureArray(items)
    .map((item) => {
      if (typeof item === "string") {
        return item.trim();
      }

      if (item && typeof item.label === "string") {
        return item.label.trim();
      }

      return "";
    })
    .filter(Boolean)
    .slice(0, limit);
}

function detectLocaleKey(locale) {
  if (locale?.report?.narrativeWeak?.startsWith("La sessione")) {
    return "it";
  }

  return "en";
}

function buildLocaleCopy(localeKey) {
  if (localeKey === "it") {
    return {
      titles: {
        overall: "Sintesi generale",
        scoreLayer: "Valutazione sintetica",
        roleFit: "Aderenza al ruolo",
        answerQuality: "Qualità delle risposte",
        questionQuality: "Aderenza alla domanda",
        runtimeRead: "Lettura del colloquio",
        strengths: "Punti forti",
        risks: "Aree critiche",
        improvements: "Suggerimenti di miglioramento",
        recruiterRecommendation: "Raccomandazione finale",
        cvAdvice: "Suggerimenti per il CV",
        finalTakeaway: "Messaggio finale",
        executiveRead: "Lettura esecutiva",
        pressureMoments: "Momenti di pressione",
        coachSnapshot: "Coach snapshot",
        recruiterSnapshot: "Recruiter snapshot"
      },
      labels: {
        targetRole: "Ruolo target",
        recommendationBand: "Valutazione complessiva",
        fitScore: "Score di aderenza",
        answerScore: "Score qualità risposte",
        candidateSeniority: "Seniority percepita candidato",
        roleSeniority: "Seniority attesa dal ruolo",
        decision: "Decisione",
        synthesis: "Sintesi",
        conflict: "Attrito",
        positioning: "Posizionamento",
        overallBand: "Banda finale",
        insertionRisk: "Rischio inserimento",
        bestContext: "Contesto ideale",
        alignmentScore: "Aderenza media",
        offTopicLow: "Fuori tema basso",
        offTopicMedium: "Fuori tema medio",
        offTopicHigh: "Fuori tema alto",
        motivationForChange: "Motivazione al cambiamento"
      },
      recommendation: {
        lowRisk: "basso",
        mediumRisk: "medio",
        highRisk: "alto",
        contextFast: "contesti con onboarding graduale e spazio di crescita",
        contextBalanced: "contesti operativi con aspettative chiare e buona autonomia",
        contextStructured: "contesti strutturati dove la solidità attuale è già spendibile"
      },
      takeaway: {
        strong:
          "Il profilo appare complessivamente convincente: il lavoro principale ora è consolidare i punti forti con esempi ancora più nitidi.",
        medium:
          "Il profilo è credibile, ma per risultare più forte servono risposte più concrete, meglio strutturate e con ownership più chiara.",
        weak:
          "Il potenziale c’è, ma al momento il candidato rischia di apparire meno forte di quanto potrebbe a causa di risposte troppo generiche o poco supportate."
      }
    };
  }

  return {
    titles: {
      overall: "Overall Summary",
      scoreLayer: "Score Layer",
      roleFit: "Role Fit",
      answerQuality: "Answer Quality",
      questionQuality: "Question Alignment",
      runtimeRead: "Interview Reading",
      strengths: "Strengths",
      risks: "Risk Areas",
      improvements: "Improvement Suggestions",
      recruiterRecommendation: "Final Recommendation",
      cvAdvice: "CV Suggestions",
      finalTakeaway: "Final Takeaway",
      executiveRead: "Executive Read",
      pressureMoments: "Pressure Moments",
      coachSnapshot: "Coach Snapshot",
      recruiterSnapshot: "Recruiter Snapshot"
    },
    labels: {
      targetRole: "Target role",
      recommendationBand: "Overall recommendation",
      fitScore: "Fit score",
      answerScore: "Answer quality score",
      candidateSeniority: "Candidate seniority",
      roleSeniority: "Role seniority",
      decision: "Decision",
      synthesis: "Synthesis",
      conflict: "Conflict",
      positioning: "Positioning",
      overallBand: "Final band",
      insertionRisk: "Insertion risk",
      bestContext: "Best-fit context",
      alignmentScore: "Average alignment",
      offTopicLow: "Low off-topic",
      offTopicMedium: "Medium off-topic",
      offTopicHigh: "High off-topic",
      motivationForChange: "Motivation for change"
    },
    recommendation: {
      lowRisk: "low",
      mediumRisk: "medium",
      highRisk: "high",
      contextFast: "contexts with gradual onboarding and room for growth",
      contextBalanced: "operational contexts with clear expectations and good autonomy",
      contextStructured: "structured contexts where current strength is already spendable"
    },
    takeaway: {
      strong:
        "The profile appears convincing overall: the main task now is to reinforce strengths with even sharper examples.",
      medium:
        "The profile is credible, but stronger answers need more concreteness, structure, and clearer ownership.",
      weak:
        "The potential is there, but the candidate currently risks appearing weaker than they really are because responses remain too generic or under-supported."
    }
  };
}

function safeBand(value, fallback = "medium") {
  const clean = normalizeString(value);
  return clean || fallback;
}

function humanizeFitText(text, localeKey) {
  const clean = normalizeString(text);

  if (!clean || localeKey !== "it") {
    return clean;
  }

  const exactMap = {
    "Strong SQL skills": "Solide competenze SQL",
    "Tableau experience": "Esperienza con Tableau",
    "Reporting experience": "Esperienza nel reporting",
    "Client exposure": "Esposizione diretta al cliente",
    "Power BI": "Power BI",
    "Workflow design": "Progettazione di workflow",
    "Data analysis": "Analisi dati",
    "Reporting": "Reporting",
    "Highlight SaaS or B2B software environments experience":
      "Metti in evidenza l’eventuale esperienza in contesti SaaS o software B2B.",
    "Emphasize strong SQL skills and Tableau experience":
      "Metti maggiormente in evidenza le competenze SQL e l’esperienza con Tableau.",
    "Highlight transferable strengths in data analysis and reporting":
      "Metti meglio in evidenza la trasferibilità delle competenze in analisi dati e reporting."
  };

  if (exactMap[clean]) {
    return exactMap[clean];
  }

  if (clean === "Lack of direct experience in SaaS or B2B software environments") {
    return "Manca ancora esperienza diretta in contesti SaaS o software B2B.";
  }

  if (
    clean ===
    "Candidate's experience in digital services and e-commerce environments, along with strong SQL skills and experience with Tableau, aligns with the role's requirements."
  ) {
    return "L’esperienza del candidato in servizi digitali ed e-commerce, insieme alle solide competenze SQL e all’esperienza con Tableau, è coerente con i requisiti del ruolo.";
  }

  return clean;
}

function humanizeFitList(items, localeKey) {
  return ensureArray(items)
    .map((item) => humanizeFitText(item, localeKey))
    .filter(Boolean);
}

function bandToItalianLabel(value) {
  const clean = normalizeString(value).toLowerCase();

  if (clean === "strong") return "forte";
  if (clean === "weak") return "debole";
  if (clean === "medium") return "intermedio";

  return clean || "intermedio";
}

function recommendationToItalianLabel(value) {
  const clean = normalizeString(value).toLowerCase();

  const map = {
    strong_fit: "aderenza forte",
    solid_fit: "buona aderenza",
    plausible_fit: "aderenza plausibile",
    stretch_fit: "aderenza con gap rilevanti",
    borderline_fit: "aderenza borderline",
    partial_fit: "aderenza parziale",
    weak_fit: "aderenza debole",
    low_fit: "aderenza molto debole"
  };

  return map[clean] || clean || "aderenza plausibile";
}

function deriveMainConstraint({ report, fit, localeKey }) {
  const weaknesses = topLabels(report?.recurringWeaknesses, 6);
  const deviationFlags = topLabels(report?.runtimeSignals?.deviationFlags, 6);
  const risks = humanizeFitList(fit?.reportHighlights?.risks, localeKey);

  const pool = [...weaknesses, ...deviationFlags, ...risks].filter(Boolean);

  return (
    pool[0] ||
    (localeKey === "it"
      ? "Le risposte non hanno ancora sostenuto in modo abbastanza netto il posizionamento."
      : "The answers did not yet support the positioning strongly enough.")
  );
}

function deriveMainStrength({ report, fit, localeKey }) {
  const strengths = [
    ...humanizeFitList(fit?.reportHighlights?.strengths, localeKey),
    ...topLabels(report?.recurringStrengths, 6)
  ].filter(Boolean);

  return (
    strengths[0] ||
    (localeKey === "it"
      ? "Il profilo mostra una base potenzialmente spendibile, ma ancora da sostenere meglio in risposta."
      : "The profile shows potentially usable strengths, but they need to be supported better in answers.")
  );
}

function deriveWhySystemInsisted({ report, localeKey }) {
  const alignmentNarrative = normalizeString(report?.questionQuality?.alignment?.narrative);
  const runtimeNarrative = normalizeString(report?.runtimeNarrative);
  const deviationFlags = topLabels(report?.runtimeSignals?.deviationFlags, 8);
  const recurringWeaknesses = topLabels(report?.recurringWeaknesses, 8);

  const reasons = [
    alignmentNarrative,
    runtimeNarrative,
    deviationFlags[0],
    recurringWeaknesses[0]
  ].filter(Boolean);

  if (reasons.length > 0) {
    return reasons[0];
  }

  return localeKey === "it"
    ? "Il sistema ha cercato conferme più chiare nei passaggi in cui ownership, concretezza o aderenza alla domanda non risultavano ancora abbastanza visibili."
    : "The system pushed for clearer confirmation in moments where ownership, concreteness, or alignment were not yet visible enough.";
}

function buildExecutiveHeadline({ fit, report, localeKey }) {
  const recommendationBand = normalizeString(fit?.fitSummary?.recommendationBand).toLowerCase();
  const answerBand = normalizeString(report?.sessionStats?.overallBand).toLowerCase();

  if (localeKey !== "it") {
    if (
      (recommendationBand === "solid_fit" || recommendationBand === "strong_fit") &&
      answerBand === "strong"
    ) {
      return "Strong profile fit supported by convincing interview answers.";
    }

    if (
      (recommendationBand === "solid_fit" || recommendationBand === "plausible_fit") &&
      answerBand === "medium"
    ) {
      return "The profile is credible for the role, but the answers do not yet support it strongly enough.";
    }

    if (answerBand === "weak") {
      return "The profile may contain usable potential, but the interview performance currently weakens that perception.";
    }

    return "The role fit is plausible, but stronger signals are needed to make the candidacy feel solid.";
  }

  if (
    (recommendationBand === "solid_fit" || recommendationBand === "strong_fit") &&
    answerBand === "strong"
  ) {
    return "Profilo coerente con il ruolo e risposte capaci di sostenerlo bene anche sotto domanda.";
  }

  if (
    (recommendationBand === "solid_fit" || recommendationBand === "plausible_fit") &&
    answerBand === "medium"
  ) {
    return "Il profilo è credibile per il ruolo, ma le risposte non lo sostengono ancora con abbastanza forza.";
  }

  if (answerBand === "weak") {
    return "Il profilo può contenere potenziale utile, ma oggi la qualità delle risposte tende a indebolirne la percezione.";
  }

  return "L’aderenza al ruolo è plausibile, ma servono segnali più forti per far percepire il candidato come davvero solido.";
}

function buildExecutiveSubheadline({ fit, report, localeKey }) {
  const mainStrength = deriveMainStrength({ report, fit, localeKey });
  const mainConstraint = deriveMainConstraint({ report, fit, localeKey });

  if (localeKey !== "it") {
    return `Main strength: ${mainStrength} Main constraint: ${mainConstraint}`;
  }

  return `Punto che sostiene il profilo: ${mainStrength} Punto che oggi lo limita di più: ${mainConstraint}`;
}

function buildOverallSection({
  candidate,
  role,
  fit,
  report,
  copy
}) {
  return {
    title: copy.titles.overall,
    candidateSummary: candidate?.summary || "",
    roleTitle: role?.title || "",
    shortRationale: fit?.fitSummary?.shortRationale || "",
    narrativeSummary: report?.narrativeSummary || "",
    runtimeNarrative: report?.runtimeNarrative || "",
    metrics: {
      [copy.labels.targetRole]: role?.title || "",
      [copy.labels.recommendationBand]:
        fit?.fitSummary?.recommendationBand || "",
      [copy.labels.fitScore]:
        fit?.fitSummary?.overallScore ?? null,
      [copy.labels.answerScore]:
        report?.sessionStats?.overallScore ?? null,
      [copy.labels.candidateSeniority]:
        candidate?.senioritySignal || "",
      [copy.labels.roleSeniority]:
        role?.seniorityDetected || ""
    }
  };
}

function buildScoreLayerSection({ fit, report, copy }) {
  const behavioralAxes = report?.behavioralAxes || {};

  return {
    title: copy.titles.scoreLayer,
    overallBand: report?.sessionStats?.overallBand || "",
    fitScore: fit?.fitSummary?.overallScore ?? null,
    answerScore: report?.sessionStats?.overallScore ?? null,
    behavioralAxes: {
      [copy.labels.decision]: behavioralAxes?.decision || {},
      [copy.labels.synthesis]: behavioralAxes?.synthesis || {},
      [copy.labels.conflict]: behavioralAxes?.conflict || {},
      [copy.labels.positioning]: behavioralAxes?.positioning || {}
    }
  };
}

function buildRoleFitSection({ fit, copy, localeKey }) {
  return {
    title: copy.titles.roleFit,
    recommendationBand: fit?.fitSummary?.recommendationBand || "",
    confidence: fit?.fitSummary?.confidence || "",
    strengths: humanizeFitList(fit?.reportHighlights?.strengths, localeKey),
    risks: humanizeFitList(fit?.reportHighlights?.risks, localeKey),
    clarificationsNeeded: humanizeFitList(
      fit?.reportHighlights?.clarificationsNeeded,
      localeKey
    ),
    transferableStrengths: humanizeFitList(fit?.transferableStrengths, localeKey),
    matchedSkills: humanizeFitList(fit?.matchedSkills, localeKey),
    missingSkills: humanizeFitList(fit?.missingSkills, localeKey)
  };
}

function buildAnswerQualitySection({ report, copy }) {
  return {
    title: copy.titles.answerQuality,
    overallBand: report?.sessionStats?.overallBand || "",
    overallScore: report?.sessionStats?.overallScore ?? null,
    totalAnswers: report?.sessionStats?.totalAnswers ?? 0,
    dimensionAverages: report?.dimensionAverages || {},
    recurringStrengths: topLabels(report?.recurringStrengths, 5),
    recurringWeaknesses: topLabels(report?.recurringWeaknesses, 5)
  };
}

function buildQuestionQualitySection({ report, copy }) {
  const alignment = report?.questionQuality?.alignment || {};
  const motivationForChange = report?.questionQuality?.motivationForChange || {};

  return {
    title: copy.titles.questionQuality,
    alignment: {
      averageScore: alignment?.averageScore ?? 0,
      band: alignment?.band || "",
      narrative: alignment?.narrative || "",
      offTopicRiskCounts: {
        [copy.labels.offTopicLow]: alignment?.offTopicRiskCounts?.low ?? 0,
        [copy.labels.offTopicMedium]: alignment?.offTopicRiskCounts?.medium ?? 0,
        [copy.labels.offTopicHigh]: alignment?.offTopicRiskCounts?.high ?? 0
      }
    },
    motivationForChange: {
      detected: Boolean(motivationForChange?.detected),
      averageScore: motivationForChange?.averageScore ?? 0,
      band: motivationForChange?.band || "",
      answeredCount: motivationForChange?.answeredCount ?? 0,
      narrative: motivationForChange?.narrative || ""
    }
  };
}

function buildRuntimeReadSection({ report, copy }) {
  return {
    title: copy.titles.runtimeRead,
    runtimeNarrative: report?.runtimeNarrative || "",
    coverage: report?.runtimeSignals?.coverage || {},
    evaluationFocus: report?.runtimeSignals?.evaluationFocus || {},
    observedSignals: topLabels(report?.runtimeSignals?.observedSignals, 8),
    deviationFlags: topLabels(report?.runtimeSignals?.deviationFlags, 8),
    phaseCompletionStats: report?.runtimeSignals?.phaseCompletionStats || {},
    phaseLedgerSummary: ensureArray(report?.runtimeSignals?.phaseLedgerSummary)
  };
}

function buildStrengthsSection({ fit, report, copy, localeKey }) {
  return {
    title: copy.titles.strengths,
    roleStrengths: humanizeFitList(fit?.reportHighlights?.strengths, localeKey),
    answerStrengths: topLabels(report?.recurringStrengths, 5),
    combinedHighlights: [
      ...humanizeFitList(fit?.reportHighlights?.strengths, localeKey),
      ...topLabels(report?.recurringStrengths, 5)
    ]
      .filter(Boolean)
      .slice(0, 8)
  };
}

function buildRisksSection({ fit, report, copy, localeKey }) {
  return {
    title: copy.titles.risks,
    roleRisks: humanizeFitList(fit?.reportHighlights?.risks, localeKey),
    answerWeaknesses: topLabels(report?.recurringWeaknesses, 5),
    deviationFlags: topLabels(report?.runtimeSignals?.deviationFlags, 8),
    clarificationsNeeded: humanizeFitList(
      fit?.reportHighlights?.clarificationsNeeded,
      localeKey
    )
  };
}

function buildImprovementsSection({ report, copy }) {
  return {
    title: copy.titles.improvements,
    finalAdvice: ensureArray(report?.finalAdvice),
    recurringImprovementHints: topLabels(report?.recurringImprovementHints, 8)
  };
}

function deriveInsertionRisk(fit, report) {
  const recommendationBand = normalizeString(
    fit?.fitSummary?.recommendationBand
  ).toLowerCase();

  const overallBand = safeBand(report?.sessionStats?.overallBand);
  const coverage = report?.runtimeSignals?.coverage || {};
  const phaseStats = report?.runtimeSignals?.phaseCompletionStats || {};
  const deviationFlags = topLabels(report?.runtimeSignals?.deviationFlags, 10);

  const hasDecisionCoverage = Boolean(coverage?.decision);
  const hasPressureCoverage = Boolean(coverage?.pressure);
  const forcedExitCount = phaseStats?.completedByForcedExit ?? 0;

  if (
    (recommendationBand === "solid_fit" || recommendationBand === "strong_fit") &&
    overallBand === "strong" &&
    hasDecisionCoverage &&
    forcedExitCount <= 1 &&
    deviationFlags.length <= 2
  ) {
    return "low";
  }

  if (
    recommendationBand === "solid_fit" &&
    overallBand !== "strong"
  ) {
    return "medium";
  }

  if (
    overallBand === "weak" &&
    !hasDecisionCoverage &&
    forcedExitCount >= 2 &&
    deviationFlags.length >= 4
  ) {
    return "high";
  }

  if (
    recommendationBand === "borderline_fit" ||
    recommendationBand === "partial_fit"
  ) {
    return "medium";
  }

  if (
    recommendationBand === "weak_fit" ||
    recommendationBand === "low_fit"
  ) {
    return "high";
  }

  if (hasPressureCoverage && hasDecisionCoverage && forcedExitCount <= 1) {
    return "medium";
  }

  return "medium";
}

function deriveBestContext(fit, report, copy) {
  const recommendationBand = normalizeString(
    fit?.fitSummary?.recommendationBand
  ).toLowerCase();

  const conflictBand = report?.behavioralAxes?.conflict?.band || "weak";
  const decisionBand = report?.behavioralAxes?.decision?.band || "weak";
  const synthesisBand = report?.behavioralAxes?.synthesis?.band || "weak";
  const positioningBand = report?.behavioralAxes?.positioning?.band || "weak";
  const coverage = report?.runtimeSignals?.coverage || {};

  if (
    (recommendationBand === "solid_fit" || recommendationBand === "strong_fit") &&
    decisionBand === "strong" &&
    synthesisBand === "strong" &&
    conflictBand !== "weak" &&
    positioningBand !== "weak"
  ) {
    return copy.recommendation.contextStructured;
  }

  if (
    coverage?.decision &&
    (decisionBand === "medium" || synthesisBand === "medium" || positioningBand === "medium")
  ) {
    return copy.recommendation.contextBalanced;
  }

  if (
    recommendationBand === "solid_fit" &&
    !coverage?.pressure
  ) {
    return copy.recommendation.contextBalanced;
  }

  return copy.recommendation.contextFast;
}

function buildRecruiterRecommendationSection({ fit, report, copy, localeKey }) {
  const insertionRisk = deriveInsertionRisk(fit, report);
  const bestContext = deriveBestContext(fit, report, copy);

  const recommendationBand =
    fit?.fitSummary?.recommendationBand || report?.sessionStats?.overallBand || "";

  const localizedShortRationale = humanizeFitText(
    fit?.fitSummary?.shortRationale || "",
    localeKey
  );

  const alignmentNarrative = report?.questionQuality?.alignment?.narrative || "";
  const motivationNarrative = report?.questionQuality?.motivationForChange?.narrative || "";

  return {
    title: copy.titles.recruiterRecommendation,
    recommendationBand,
    insertionRisk:
      insertionRisk === "low"
        ? copy.recommendation.lowRisk
        : insertionRisk === "high"
          ? copy.recommendation.highRisk
          : copy.recommendation.mediumRisk,
    bestContext,
    recruiterRead: {
      strengths: topLabels(report?.recurringStrengths, 4),
      risks: [
        ...humanizeFitList(fit?.reportHighlights?.risks, localeKey).slice(0, 3),
        ...topLabels(report?.runtimeSignals?.deviationFlags, 3)
      ].slice(0, 5),
      notes: [
        report?.runtimeNarrative || "",
        alignmentNarrative,
        motivationNarrative,
        localizedShortRationale
      ].filter(Boolean)
    }
  };
}

function buildCvAdviceSection({ fit, copy, localeKey }) {
  return {
    title: copy.titles.cvAdvice,
    cvImprovementHints: humanizeFitList(fit?.cvImprovementHints, localeKey),
    positioningHints: humanizeFitList(
      fit?.reportHighlights?.positioningHints,
      localeKey
    )
  };
}

function buildFinalTakeaway({ report, copy }) {
  const band = report?.sessionStats?.overallBand || "medium";

  let message = copy.takeaway.medium;

  if (band === "strong") {
    message = copy.takeaway.strong;
  } else if (band === "weak") {
    message = copy.takeaway.weak;
  }

  return {
    title: copy.titles.finalTakeaway,
    message
  };
}

function buildExecutiveReadSection({ candidate, role, fit, report, copy, localeKey }) {
  const fitScore = fit?.fitSummary?.overallScore ?? null;
  const answerScore = report?.sessionStats?.overallScore ?? null;
  const recommendationBand = fit?.fitSummary?.recommendationBand || "";
  const answerBand = report?.sessionStats?.overallBand || "";
  const alignment = report?.questionQuality?.alignment || {};

  return {
    title: copy.titles.executiveRead,
    headline: buildExecutiveHeadline({ fit, report, localeKey }),
    subheadline: buildExecutiveSubheadline({ fit, report, localeKey }),
    whySystemInsisted: deriveWhySystemInsisted({ report, localeKey }),
    mainStrength: deriveMainStrength({ report, fit, localeKey }),
    mainConstraint: deriveMainConstraint({ report, fit, localeKey }),
    summaryMetrics: {
      roleTitle: role?.title || "",
      candidateSummary: candidate?.summary || "",
      recommendationBand:
        localeKey === "it"
          ? recommendationToItalianLabel(recommendationBand)
          : recommendationBand,
      fitScore,
      answerScore,
      answerBand:
        localeKey === "it"
          ? bandToItalianLabel(answerBand)
          : answerBand,
      alignmentBand:
        localeKey === "it"
          ? bandToItalianLabel(alignment?.band || "")
          : alignment?.band || ""
    }
  };
}

function buildPressureMomentsSection({ report, copy, localeKey }) {
  const deviationFlags = topLabels(report?.runtimeSignals?.deviationFlags, 6);
  const recurringWeaknesses = topLabels(report?.recurringWeaknesses, 6);
  const observedSignals = topLabels(report?.runtimeSignals?.observedSignals, 6);
  const alignmentNarrative = normalizeString(report?.questionQuality?.alignment?.narrative);
  const motivationNarrative = normalizeString(report?.questionQuality?.motivationForChange?.narrative);

  const moments = [
    alignmentNarrative,
    motivationNarrative,
    ...deviationFlags,
    ...recurringWeaknesses,
    ...observedSignals
  ]
    .filter(Boolean)
    .slice(0, 6);

  return {
    title: copy.titles.pressureMoments,
    items:
      moments.length > 0
        ? moments
        : [
            localeKey === "it"
              ? "Non emergono ancora momenti di pressione descritti in modo esplicito, ma il sistema ha comunque segnalato aree da rafforzare."
              : "No explicit pressure moments were surfaced yet, but the system still detected areas to strengthen."
          ]
  };
}

function buildCoachSnapshotSection({ report, copy, localeKey }) {
  const strengths = topLabels(report?.recurringStrengths, 4);
  const weaknesses = topLabels(report?.recurringWeaknesses, 4);
  const hints = topLabels(report?.recurringImprovementHints, 4);
  const finalAdvice = ensureArray(report?.finalAdvice).slice(0, 4);

  return {
    title: copy.titles.coachSnapshot,
    whatWorked:
      strengths.length > 0
        ? strengths
        : [
            localeKey === "it"
              ? "Non emergono ancora punti forti abbastanza stabili da usare come leva principale."
              : "No stable strengths emerged strongly enough to become the main positioning lever yet."
          ],
    whatToImprove:
      weaknesses.length > 0
        ? weaknesses
        : [
            localeKey === "it"
              ? "Serve ancora più concretezza, struttura e ownership nelle risposte."
              : "The answers still need more concreteness, structure, and ownership."
          ],
    nextMoves: [...hints, ...finalAdvice].filter(Boolean).slice(0, 5)
  };
}

function buildRecruiterSnapshotSection({ fit, report, copy, localeKey }) {
  const recruiterRecommendation = buildRecruiterRecommendationSection({
    fit,
    report,
    copy,
    localeKey
  });

  return {
    title: copy.titles.recruiterSnapshot,
    recommendationBand: recruiterRecommendation?.recommendationBand || "",
    insertionRisk: recruiterRecommendation?.insertionRisk || "",
    bestContext: recruiterRecommendation?.bestContext || "",
    strengths: recruiterRecommendation?.recruiterRead?.strengths || [],
    risks: recruiterRecommendation?.recruiterRead?.risks || [],
    notes: recruiterRecommendation?.recruiterRead?.notes || []
  };
}

export function buildFinalCandidateReport({
  candidateProfile,
  roleProfile,
  jobFitAnalysis,
  interviewReport
}) {
  if (!candidateProfile || typeof candidateProfile !== "object") {
    throw new Error("buildFinalCandidateReport: candidateProfile is required.");
  }

  if (!roleProfile || typeof roleProfile !== "object") {
    throw new Error("buildFinalCandidateReport: roleProfile is required.");
  }

  if (!jobFitAnalysis || typeof jobFitAnalysis !== "object") {
    throw new Error("buildFinalCandidateReport: jobFitAnalysis is required.");
  }

  if (!interviewReport || typeof interviewReport !== "object") {
    throw new Error("buildFinalCandidateReport: interviewReport is required.");
  }

  const locale = getInterviewLocale();
  const localeKey = detectLocaleKey(locale);
  const copy = buildLocaleCopy(localeKey);

  const candidate = candidateProfile?.candidateProfile || candidateProfile;
  const role = roleProfile?.roleProfile || roleProfile;
  const fit = jobFitAnalysis?.jobFitAnalysis || jobFitAnalysis;
  const report = interviewReport?.interviewReport || interviewReport;

  return {
    finalCandidateReport: {
      locale: localeKey,
      generatedSections: [
        "overall",
        "score_layer",
        "role_fit",
        "answer_quality",
        "question_quality",
        "runtime_read",
        "strengths",
        "risks",
        "improvements",
        "recruiter_recommendation",
        "cv_advice",
        "final_takeaway",
        "executive_read",
        "pressure_moments",
        "coach_snapshot",
        "recruiter_snapshot"
      ],
      overall: buildOverallSection({ candidate, role, fit, report, copy }),
      scoreLayer: buildScoreLayerSection({ fit, report, copy }),
      roleFit: buildRoleFitSection({ fit, copy, localeKey }),
      answerQuality: buildAnswerQualitySection({ report, copy }),
      questionQuality: buildQuestionQualitySection({ report, copy }),
      runtimeRead: buildRuntimeReadSection({ report, copy }),
      strengths: buildStrengthsSection({ fit, report, copy, localeKey }),
      risks: buildRisksSection({ fit, report, copy, localeKey }),
      improvements: buildImprovementsSection({ report, copy }),
      recruiterRecommendation: buildRecruiterRecommendationSection({
        fit,
        report,
        copy,
        localeKey
      }),
      cvAdvice: buildCvAdviceSection({ fit, copy, localeKey }),
      finalTakeaway: buildFinalTakeaway({ report, copy }),
      executiveRead: buildExecutiveReadSection({
        candidate,
        role,
        fit,
        report,
        copy,
        localeKey
      }),
      pressureMoments: buildPressureMomentsSection({
        report,
        copy,
        localeKey
      }),
      coachSnapshot: buildCoachSnapshotSection({
        report,
        copy,
        localeKey
      }),
      recruiterSnapshot: buildRecruiterSnapshotSection({
        fit,
        report,
        copy,
        localeKey
      })
    }
  };
}