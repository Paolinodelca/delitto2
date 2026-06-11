import { getInterviewLocale } from "../i18n/getInterviewLocale.js";
import { INTERVIEW_LOCALES } from "../i18n/interviewLocaleRegistry.js";

function ensureArray(value) {
  return Array.isArray(value) ? value : [];
}

function normalizeString(value) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

function normalizeLookupKey(value) {
  return normalizeString(value).toLowerCase();
}

function clampScore(value) {
  if (value < 0) return 0;
  if (value > 100) return 100;
  return Math.round(value);
}

function bandFromScore(score) {
  if (score >= 75) return "strong";
  if (score >= 50) return "medium";
  return "weak";
}

function average(values) {
  const valid = values.filter(
    (value) => typeof value === "number" && Number.isFinite(value)
  );

  if (valid.length === 0) {
    return 0;
  }

  return clampScore(valid.reduce((sum, value) => sum + value, 0) / valid.length);
}

function countOccurrences(strings) {
  const counts = new Map();

  for (const value of strings) {
    const clean = normalizeString(value);

    if (!clean) {
      continue;
    }

    counts.set(clean, (counts.get(clean) || 0) + 1);
  }

  return counts;
}

function topItemsFromMap(map, minCount = 1, limit = 5) {
  return [...map.entries()]
    .filter(([, count]) => count >= minCount)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([label, count]) => ({
      label,
      count
    }));
}

function buildDimensionAverages(answerRecords) {
  const dimensionKeys = [
    "concreteness",
    "specificity",
    "evidence",
    "ownership",
    "structure",
    "clarity",
    "reflection",
    "questionAlignment"
  ];

  const result = {};

  for (const key of dimensionKeys) {
    result[key] = average(
      answerRecords.map(
        (item) => item?.answerAnalysis?.answerShapeAnalysis?.dimensionScores?.[key]
      )
    );
  }

  const motivationForChangeAverage = average(
    answerRecords
      .map(
        (item) => item?.answerAnalysis?.answerShapeAnalysis?.dimensionScores?.motivationForChange
      )
      .filter((value) => typeof value === "number" && Number.isFinite(value))
  );

  result.motivationForChange = motivationForChangeAverage;

  return result;
}

function buildAnswerBandCounts(answerRecords) {
  const bands = answerRecords.map(
    (item) => item?.answerAnalysis?.answerShapeAnalysis?.overallBand || "unknown"
  );

  const counts = countOccurrences(bands);

  return {
    strong: counts.get("strong") || 0,
    medium: counts.get("medium") || 0,
    weak: counts.get("weak") || 0
  };
}

function buildTopicCoverage(answerRecords) {
  const labels = answerRecords.map((item) => item?.label || "");
  const counts = countOccurrences(labels);

  return topItemsFromMap(counts, 1, 10);
}

function buildLocalizationMap(activeLocale) {
  const map = new Map();

  const localeEntries = Object.values(INTERVIEW_LOCALES || {});

  for (const sourceLocale of localeEntries) {
    const sourceAnswerShape = sourceLocale?.answerShape || {};
    const targetAnswerShape = activeLocale?.answerShape || {};

    const sourceStrengths = sourceAnswerShape.strengths || {};
    const targetStrengths = targetAnswerShape.strengths || {};

    for (const key of Object.keys(sourceStrengths)) {
      const sourceText = sourceStrengths[key];
      const targetText = targetStrengths[key];

      if (sourceText && targetText) {
        map.set(normalizeLookupKey(sourceText), targetText);
      }
    }

    const sourceWeaknesses = sourceAnswerShape.weaknesses || {};
    const targetWeaknesses = targetAnswerShape.weaknesses || {};

    for (const key of Object.keys(sourceWeaknesses)) {
      const sourceText = sourceWeaknesses[key];
      const targetText = targetWeaknesses[key];

      if (sourceText && targetText) {
        map.set(normalizeLookupKey(sourceText), targetText);
      }
    }

    const sourceHints = sourceAnswerShape.hints || {};
    const targetHints = targetAnswerShape.hints || {};

    for (const key of Object.keys(sourceHints)) {
      const sourceText = sourceHints[key];
      const targetText = targetHints[key];

      if (sourceText && targetText) {
        map.set(normalizeLookupKey(sourceText), targetText);
      }
    }
  }

  return map;
}

function looksItalianLocale(activeLocale) {
  const samples = [
    activeLocale?.report?.narrativeStrong,
    activeLocale?.report?.narrativeMedium,
    activeLocale?.report?.narrativeWeak
  ]
    .map(normalizeLookupKey)
    .filter(Boolean)
    .join(" ");

  return (
    samples.includes("la sessione") ||
    samples.includes("il profilo") ||
    samples.includes("risposte") ||
    samples.includes("evidenze")
  );
}

function relocalizeGeneratedText(text, activeLocale) {
  const clean = normalizeString(text);
  const lowered = normalizeLookupKey(clean);

  if (!clean) {
    return "";
  }

  const italianMode = looksItalianLocale(activeLocale);

  if (!italianMode) {
    return clean;
  }

  const directRules = [
    {
      keys: [
        "the answer provides evidence or outcome-oriented support.",
        "the answer provides evidence or outcome oriented support.",
        "the answer includes evidence or outcome-oriented support.",
        "the answer includes evidence or outcome oriented support."
      ],
      replace:
        "La risposta porta evidenze o risultati concreti a supporto di ciò che afferma."
    },
    {
      keys: [
        "the answer provides clear ownership.",
        "the answer shows clear ownership."
      ],
      replace:
        "La risposta rende chiaro il ruolo personale e la responsabilità diretta del candidato."
    },
    {
      keys: [
        "the answer includes a specific example.",
        "the answer provides a specific example."
      ],
      replace: "La risposta include un esempio concreto e specifico."
    },
    {
      keys: [
        "the answer is well structured.",
        "the answer has a clear structure."
      ],
      replace: "La risposta ha una struttura chiara e leggibile."
    },
    {
      keys: [
        "the answer is too generic.",
        "the answer remains too generic."
      ],
      replace: "La risposta resta troppo generica e poco concreta."
    }
  ];

  for (const rule of directRules) {
    if (rule.keys.includes(lowered)) {
      return rule.replace;
    }
  }

  if (
    lowered.includes("evidence") &&
    (lowered.includes("outcome") || lowered.includes("result")) &&
    lowered.includes("support")
  ) {
    return "La risposta porta evidenze o risultati concreti a supporto di ciò che afferma.";
  }

  if (
    lowered.includes("ownership") &&
    (lowered.includes("clear") || lowered.includes("shows") || lowered.includes("provides"))
  ) {
    return "La risposta rende chiaro il ruolo personale e la responsabilità diretta del candidato.";
  }

  if (lowered.includes("specific") && lowered.includes("example")) {
    return "La risposta include un esempio concreto e specifico.";
  }

  if (lowered.includes("structured") && lowered.includes("answer")) {
    return "La risposta ha una struttura chiara e leggibile.";
  }

  if (lowered.includes("generic") && lowered.includes("answer")) {
    return "La risposta resta troppo generica e poco concreta.";
  }

  return clean;
}

function relocalizeTextList(items, activeLocale) {
  const localizationMap = buildLocalizationMap(activeLocale);

  return ensureArray(items).map((item) => {
    const clean = normalizeString(item);

    if (!clean) {
      return "";
    }

    const exactLocalized = localizationMap.get(normalizeLookupKey(clean));

    if (exactLocalized) {
      return exactLocalized;
    }

    return relocalizeGeneratedText(clean, activeLocale);
  });
}

function getQuestionFlags(item) {
  return item?.answerAnalysis?.answerShapeAnalysis?.questionContext?.questionTypeFlags || {};
}

function buildRecurringStrengths(answerRecords, activeLocale) {
  const explicitStrengths = answerRecords.flatMap((item) =>
    ensureArray(item?.answerAnalysis?.answerShapeAnalysis?.strengths)
  );

  const inferredStrengths = [];

  for (const item of answerRecords) {
    const dimensionScores =
      item?.answerAnalysis?.answerShapeAnalysis?.dimensionScores || {};
    const questionContext =
      item?.answerAnalysis?.answerShapeAnalysis?.questionContext || {};
    const detectedSignals =
      item?.answerAnalysis?.answerShapeAnalysis?.detectedSignals || {};
    const flags = getQuestionFlags(item);

    const evidence = dimensionScores?.evidence;
    const ownership = dimensionScores?.ownership;
    const specificity = dimensionScores?.specificity;
    const structure = dimensionScores?.structure;
    const clarity = dimensionScores?.clarity;
    const reflection = dimensionScores?.reflection;
    const concreteness = dimensionScores?.concreteness;
    const questionAlignment = dimensionScores?.questionAlignment;
    const motivationForChange = dimensionScores?.motivationForChange;

    if (typeof questionAlignment === "number" && questionAlignment >= 60) {
      inferredStrengths.push(
        "La risposta resta abbastanza centrata sulla domanda e non deraglia fuori asse."
      );
    }

    if (
      questionContext?.isMotivationForChange &&
      typeof motivationForChange === "number" &&
      motivationForChange >= 60
    ) {
      inferredStrengths.push(
        "La motivazione al cambiamento appare leggibile, orientata e non soltanto reattiva."
      );
    }

    if (flags.isDecision && detectedSignals.tradeoffMarkers > 0) {
      inferredStrengths.push(
        "Quando viene chiesto di decidere, emerge almeno in parte una priorità o un trade-off reale."
      );
    }

    if ((flags.isExample || flags.isWalkthrough) && detectedSignals.exampleMarkers > 0) {
      inferredStrengths.push(
        "Quando serve, la risposta sa appoggiarsi a un caso concreto invece di restare del tutto astratta."
      );
    }

    if ((flags.isOpening || flags.isRoleFit) && detectedSignals.roleFitMarkers > 0) {
      inferredStrengths.push(
        "Nelle domande di posizionamento, la risposta prova a collegare il profilo al ruolo."
      );
    }

    if (typeof ownership === "number" && ownership >= 55) {
      inferredStrengths.push(
        "La risposta rende chiaro il ruolo personale e la responsabilità diretta del candidato."
      );
    }

    if (typeof evidence === "number" && evidence >= 55) {
      inferredStrengths.push(
        "La risposta porta evidenze o risultati concreti a supporto di ciò che afferma."
      );
    }

    if (typeof specificity === "number" && specificity >= 55) {
      inferredStrengths.push(
        "La risposta è sufficientemente specifica su contesto, scope e azioni."
      );
    }

    if (typeof structure === "number" && structure >= 55) {
      inferredStrengths.push(
        "La risposta ha una struttura chiara e facile da seguire."
      );
    }

    if (typeof clarity === "number" && clarity >= 60) {
      inferredStrengths.push(
        "La risposta arriva al punto con una buona chiarezza espositiva."
      );
    }

    if (typeof reflection === "number" && reflection >= 50) {
      inferredStrengths.push(
        "La risposta mostra riflessione, apprendimento o capacità di adattamento."
      );
    }

    if (typeof concreteness === "number" && concreteness >= 55) {
      inferredStrengths.push(
        "La risposta è abbastanza concreta da sembrare ancorata a un’esperienza reale."
      );
    }
  }

  const localizedStrengths = relocalizeTextList(
    [...explicitStrengths, ...inferredStrengths],
    activeLocale
  );

  const counts = countOccurrences(localizedStrengths);

  return topItemsFromMap(counts, 1, 8);
}

function buildRecurringWeaknesses(answerRecords, activeLocale) {
  const weaknesses = answerRecords.flatMap((item) =>
    ensureArray(item?.answerAnalysis?.answerShapeAnalysis?.weaknesses)
  );

  const inferredWeaknesses = [];

  for (const item of answerRecords) {
    const dimensionScores =
      item?.answerAnalysis?.answerShapeAnalysis?.dimensionScores || {};
    const questionContext =
      item?.answerAnalysis?.answerShapeAnalysis?.questionContext || {};
    const detectedSignals =
      item?.answerAnalysis?.answerShapeAnalysis?.detectedSignals || {};
    const flags = getQuestionFlags(item);

    if (
      (flags.isOpening || flags.isRoleFit) &&
      detectedSignals.placeholderIntroMarkers > 0 &&
      detectedSignals.roleFitMarkers === 0 &&
      detectedSignals.fitBodyMarkers === 0
    ) {
      inferredWeaknesses.push(
        "In alcuni passaggi la risposta suona come introduzione, ma non entra davvero nel merito."
      );
    }

    if (
      (flags.isExample || flags.isWalkthrough) &&
      detectedSignals.exampleMarkers === 0 &&
      detectedSignals.exampleBodyMarkers === 0
    ) {
      inferredWeaknesses.push(
        "Quando servirebbe un caso preciso, la risposta tende ancora a restare troppo generale."
      );
    }

    if (flags.isDecision && detectedSignals.tradeoffMarkers === 0) {
      inferredWeaknesses.push(
        "Nelle domande decisionali non emerge ancora con sufficiente chiarezza il trade-off."
      );
    }

    if (flags.isPressure && detectedSignals.pressureMarkers === 0) {
      inferredWeaknesses.push(
        "Nei passaggi di pressione o attrito, il livello di tensione gestita non emerge ancora in modo nitido."
      );
    }

    if (
      questionContext?.offTopicRisk === "high" &&
      typeof dimensionScores?.questionAlignment === "number" &&
      dimensionScores.questionAlignment < 50
    ) {
      inferredWeaknesses.push(
        "In più punti la risposta si allontana dal punto preciso che la domanda cercava di verificare."
      );
    }
  }

  const localizedWeaknesses = relocalizeTextList(
    [...weaknesses, ...inferredWeaknesses],
    activeLocale
  );
  const counts = countOccurrences(localizedWeaknesses);

  return topItemsFromMap(counts, 1, 8);
}

function buildRecurringHints(answerRecords, activeLocale) {
  const hints = answerRecords.flatMap((item) =>
    ensureArray(item?.answerAnalysis?.answerShapeAnalysis?.improvementHints)
  );

  const localizedHints = relocalizeTextList(hints, activeLocale);
  const counts = countOccurrences(localizedHints);

  return topItemsFromMap(counts, 1, 8);
}

function buildQuestionAlignmentSummary(answerRecords, locale) {
  const scores = answerRecords
    .map((item) => item?.answerAnalysis?.answerShapeAnalysis?.dimensionScores?.questionAlignment)
    .filter((value) => typeof value === "number" && Number.isFinite(value));

  const averageScore = average(scores);

  const offTopicRisks = answerRecords.map(
    (item) => item?.answerAnalysis?.answerShapeAnalysis?.questionContext?.offTopicRisk || "low"
  );

  const offTopicCounts = countOccurrences(offTopicRisks);

  const high = offTopicCounts.get("high") || 0;
  const medium = offTopicCounts.get("medium") || 0;
  const low = offTopicCounts.get("low") || 0;

  let narrative = "The candidate generally stays aligned with the intent of the question.";

  if (looksItalianLocale(locale)) {
    if (averageScore >= 75 && high === 0 && medium <= 1) {
      narrative =
        "Le risposte restano in media ben aderenti al punto chiesto, con poco rischio di uscire fuori asse.";
    } else if (averageScore >= 50) {
      narrative =
        "L’aderenza alla domanda è complessivamente discreta, ma in alcuni passaggi la risposta tende ad allargarsi o a perdere un po’ di fuoco.";
    } else {
      narrative =
        "L’aderenza alla domanda è fragile: il candidato tende più spesso del dovuto a restare generico, introduttivo o a spostarsi fuori asse.";
    }
  }

  return {
    averageScore,
    band: bandFromScore(averageScore),
    offTopicRiskCounts: {
      low,
      medium,
      high
    },
    narrative
  };
}

function buildMotivationForChangeSummary(answerRecords, locale) {
  const relevantRecords = answerRecords.filter(
    (item) => item?.answerAnalysis?.answerShapeAnalysis?.questionContext?.isMotivationForChange
  );

  if (relevantRecords.length === 0) {
    return {
      detected: false,
      averageScore: 0,
      band: "weak",
      narrative: looksItalianLocale(locale)
        ? "Nella sessione non è emersa una domanda esplicita sulla motivazione al cambiamento."
        : "No explicit motivation-for-change question emerged in the session."
    };
  }

  const scores = relevantRecords
    .map(
      (item) => item?.answerAnalysis?.answerShapeAnalysis?.dimensionScores?.motivationForChange
    )
    .filter((value) => typeof value === "number" && Number.isFinite(value));

  const averageScore = average(scores);

  let narrative = "The motivation for change appears reasonably credible.";

  if (looksItalianLocale(locale)) {
    if (averageScore >= 75) {
      narrative =
        "La motivazione al cambiamento appare credibile, leggibile e orientata verso una direzione professionale concreta.";
    } else if (averageScore >= 50) {
      narrative =
        "La motivazione al cambiamento emerge, ma va ancora resa più nitida e meglio collegata alla direzione cercata.";
    } else {
      narrative =
        "La motivazione al cambiamento resta fragile: il razionale appare poco chiaro, troppo reattivo o poco coerente.";
    }
  }

  return {
    detected: true,
    averageScore,
    band: bandFromScore(averageScore),
    answeredCount: relevantRecords.length,
    narrative
  };
}

function buildOverallNarrative(overallScore, dimensionAverages, locale) {
  if (overallScore >= 75) {
    return locale.report.narrativeStrong;
  }

  if (overallScore >= 50) {
    if (
      dimensionAverages.evidence < 60 ||
      dimensionAverages.ownership < 60 ||
      dimensionAverages.questionAlignment < 60
    ) {
      return locale.report.narrativeMediumEvidence;
    }

    return locale.report.narrativeMedium;
  }

  return locale.report.narrativeWeak;
}

function buildFinalAdvice(
  dimensionAverages,
  recurringHints,
  questionAlignmentSummary,
  motivationForChangeSummary,
  locale
) {
  const advice = [];
  const copy = locale.report.finalAdvice;

  if (dimensionAverages.questionAlignment < 60) {
    advice.push(
      "Resta più aderente alla domanda: chiarisci prima il punto centrale, poi aggiungi contesto ed esempio."
    );
  }

  if (
    motivationForChangeSummary?.detected &&
    motivationForChangeSummary.averageScore < 60
  ) {
    advice.push(
      "Quando spieghi il cambiamento, collega meglio situazione attuale, ragione del passaggio e direzione professionale cercata."
    );
  }

  if (dimensionAverages.concreteness < 60 || dimensionAverages.specificity < 60) {
    advice.push(copy.concreteness);
  }

  if (dimensionAverages.evidence < 60) {
    advice.push(copy.evidence);
  }

  if (dimensionAverages.ownership < 60) {
    advice.push(copy.ownership);
  }

  if (dimensionAverages.structure < 60) {
    advice.push(copy.structure);
  }

  if (dimensionAverages.reflection < 60) {
    advice.push(copy.reflection);
  }

  if (
    advice.length === 0 &&
    questionAlignmentSummary?.offTopicRiskCounts?.high > 0
  ) {
    advice.push(
      "Evita di allargarti troppo: una risposta più centrata aumenta subito credibilità e leggibilità."
    );
  }

  if (advice.length === 0 && recurringHints.length > 0) {
    advice.push(recurringHints[0].label);
  }

  if (advice.length === 0) {
    advice.push(copy.fallback);
  }

  return advice;
}

function buildRuntimeCoverage(interviewState) {
  return {
    walkthrough: Boolean(interviewState?.coverage?.walkthrough),
    roleContext: Boolean(interviewState?.coverage?.roleContext),
    case1: Boolean(interviewState?.coverage?.case1),
    decision: Boolean(interviewState?.coverage?.decision),
    pressure: Boolean(interviewState?.coverage?.pressure),
    depth: Boolean(interviewState?.coverage?.depth),
    closing: Boolean(interviewState?.coverage?.closing)
  };
}

function buildPhaseLedgerSummary(interviewState) {
  const phaseLedger = interviewState?.phaseLedger || {};
  const orderedPhases = [
    "OPENING",
    "WALKTHROUGH",
    "ROLE_CONTEXT",
    "CASE_1",
    "DECISION_PROBE",
    "PRESSURE_PROBE",
    "DEPTH_CHECK",
    "CLOSING"
  ];

  return orderedPhases
    .filter((phaseName) => phaseLedger[phaseName])
    .map((phaseName) => ({
      phaseName,
      status: normalizeString(phaseLedger[phaseName]?.status) || "pending",
      attempts: phaseLedger[phaseName]?.attempts ?? 0,
      completedBy: normalizeString(phaseLedger[phaseName]?.completedBy) || "",
      lastStepLabel: normalizeString(phaseLedger[phaseName]?.lastStepLabel) || ""
    }));
}

function buildPhaseCompletionStats(phaseLedgerSummary) {
  const completedBySignal = phaseLedgerSummary.filter(
    (item) => item.completedBy === "signal"
  ).length;

  const completedByForcedExit = phaseLedgerSummary.filter(
    (item) => item.completedBy === "forced_exit"
  ).length;

  const touchedPhases = phaseLedgerSummary.filter(
    (item) => item.attempts > 0 || item.status === "completed"
  ).length;

  return {
    touchedPhases,
    completedBySignal,
    completedByForcedExit
  };
}

function humanizeDeviationFlag(flag, locale) {
  const clean = normalizeString(flag);

  if (!clean) {
    return "";
  }

  const italianMode = looksItalianLocale(locale);

  if (!italianMode) {
    return clean;
  }

  const map = {
    generic_examples:
      "Gli esempi restano ancora troppo generici e poco dimostrativi.",
    no_clear_ownership:
      "Il contributo personale non emerge ancora con sufficiente chiarezza.",
    no_tradeoff:
      "I trade-off non vengono ancora esplicitati in modo convincente.",
    no_real_conflict:
      "Non emerge ancora una vera gestione di attrito o conflitto.",
    low_specificity:
      "Le risposte restano poco specifiche su contesto, scope e azioni.",
    weak_timeline:
      "La sequenza delle azioni non è ancora abbastanza chiara e leggibile.",
    avoids_positioning:
      "Il candidato tende a non prendere posizione in modo abbastanza netto.",
    excessive_we:
      "Il racconto resta troppo sul “noi” e troppo poco sull’apporto personale."
  };

  return map[clean] || clean;
}

function buildDeviationFlagSummary(interviewState, locale) {
  const flags = ensureArray(interviewState?.deviationFlags).map((flag) =>
    humanizeDeviationFlag(flag, locale)
  );

  const counts = countOccurrences(flags);

  return topItemsFromMap(counts, 1, 10);
}

function humanizeObservedSignal(signal, locale) {
  const clean = normalizeString(signal);

  if (!clean) {
    return "";
  }

  const italianMode = looksItalianLocale(locale);

  if (!italianMode) {
    return clean;
  }

  const map = {
    decision: "Presa di decisione",
    tradeoff: "Trade-off esplicitato",
    consequences: "Conseguenze considerate",
    conflict: "Gestione del conflitto",
    stakeholder_management: "Gestione stakeholder",
    assertiveness: "Capacità di prendere posizione",
    ownership: "Ownership personale",
    evidence: "Presenza di evidenze",
    concrete_example: "Esempio concreto",
    specificity: "Specificità del racconto",
    timeline: "Sequenza chiara delle azioni",
    consistency: "Coerenza del racconto",
    repeatability: "Pattern ripetibile",
    engagement: "Coinvolgimento nella risposta",
    context_awareness: "Lettura del contesto",
    role_understanding: "Comprensione del ruolo",
    question_alignment: "Aderenza alla domanda",
    change_motivation: "Motivazione al cambiamento"
  };

  return map[clean] || clean;
}

function buildObservedSignalSummary(interviewState, locale) {
  const signals = ensureArray(interviewState?.observedSignals).map((signal) =>
    humanizeObservedSignal(signal, locale)
  );

  const counts = countOccurrences(signals);

  return topItemsFromMap(counts, 1, 10);
}

function buildEvaluationFocus(interviewState) {
  return {
    decision: Boolean(interviewState?.evaluationFocus?.decision),
    synthesis: Boolean(interviewState?.evaluationFocus?.synthesis),
    conflict: Boolean(interviewState?.evaluationFocus?.conflict)
  };
}

function buildBehavioralAxes({
  dimensionAverages,
  coverage,
  evaluationFocus,
  deviationFlagSummary,
  questionAlignmentSummary,
  motivationForChangeSummary
}) {
  const deviationLabels = deviationFlagSummary.map((item) => item.label);

  let decisionScore = Math.round(
    dimensionAverages.evidence * 0.22 +
      dimensionAverages.ownership * 0.22 +
      dimensionAverages.structure * 0.18 +
      dimensionAverages.reflection * 0.12 +
      dimensionAverages.questionAlignment * 0.16 +
      (coverage.decision ? 15 : 0)
  );

  if (evaluationFocus.decision) {
    decisionScore += 5;
  }

  if (deviationLabels.includes("I trade-off non vengono ancora esplicitati in modo convincente.")) {
    decisionScore -= 12;
  }

  if (deviationLabels.includes("Il candidato tende a non prendere posizione in modo abbastanza netto.")) {
    decisionScore -= 10;
  }

  let synthesisScore = Math.round(
    dimensionAverages.clarity * 0.28 +
      dimensionAverages.structure * 0.28 +
      dimensionAverages.specificity * 0.16 +
      dimensionAverages.concreteness * 0.08 +
      dimensionAverages.questionAlignment * 0.2
  );

  if (evaluationFocus.synthesis) {
    synthesisScore += 5;
  }

  if (deviationLabels.includes("La sequenza delle azioni non è ancora abbastanza chiara e leggibile.")) {
    synthesisScore -= 10;
  }

  if (deviationLabels.includes("Le risposte restano poco specifiche su contesto, scope e azioni.")) {
    synthesisScore -= 8;
  }

  if (questionAlignmentSummary?.offTopicRiskCounts?.high > 0) {
    synthesisScore -= 8;
  }

  let conflictScore = Math.round(
    dimensionAverages.ownership * 0.18 +
      dimensionAverages.reflection * 0.18 +
      dimensionAverages.evidence * 0.16 +
      dimensionAverages.questionAlignment * 0.13 +
      (coverage.pressure ? 25 : 0)
  );

  if (evaluationFocus.conflict) {
    conflictScore += 5;
  }

  if (deviationLabels.includes("Non emerge ancora una vera gestione di attrito o conflitto.")) {
    conflictScore -= 15;
  }

  if (deviationLabels.includes("Il racconto resta troppo sul “noi” e troppo poco sull’apporto personale.")) {
    conflictScore -= 10;
  }

  let positioningScore = Math.round(
    dimensionAverages.ownership * 0.2 +
      dimensionAverages.clarity * 0.2 +
      dimensionAverages.questionAlignment * 0.25 +
      dimensionAverages.specificity * 0.15 +
      (typeof motivationForChangeSummary?.averageScore === "number"
        ? motivationForChangeSummary.averageScore * 0.2
        : 0)
  );

  if (deviationLabels.includes("Il candidato tende a non prendere posizione in modo abbastanza netto.")) {
    positioningScore -= 12;
  }

  decisionScore = clampScore(decisionScore);
  synthesisScore = clampScore(synthesisScore);
  conflictScore = clampScore(conflictScore);
  positioningScore = clampScore(positioningScore);

  return {
    decision: {
      score: decisionScore,
      band: bandFromScore(decisionScore)
    },
    synthesis: {
      score: synthesisScore,
      band: bandFromScore(synthesisScore)
    },
    conflict: {
      score: conflictScore,
      band: bandFromScore(conflictScore)
    },
    positioning: {
      score: positioningScore,
      band: bandFromScore(positioningScore)
    }
  };
}

function buildRuntimeNarrative({
  coverage,
  phaseCompletionStats,
  evaluationFocus,
  deviationFlagSummary,
  questionAlignmentSummary,
  motivationForChangeSummary
}) {
  const parts = [];

  if (coverage.walkthrough && coverage.roleContext && coverage.case1) {
    parts.push(
      "La sessione ha coperto bene il percorso, l’aderenza al ruolo e almeno un caso concreto."
    );
  } else if (coverage.roleContext && coverage.case1) {
    parts.push(
      "La sessione ha coperto in modo abbastanza utile aderenza al ruolo e caso concreto, anche se non tutte le fasi sono passate da un walkthrough pieno."
    );
  } else {
    parts.push(
      "La sessione ha raccolto segnali utili ma con una copertura ancora parziale delle fasi chiave."
    );
  }

  if (coverage.decision) {
    parts.push("È stato esplorato anche il livello decisionale.");
  } else {
    parts.push("Il livello decisionale resta ancora poco esplorato.");
  }

  if (coverage.pressure) {
    parts.push("È stata toccata anche la gestione della pressione o dell’attrito.");
  } else {
    parts.push("Pressione e gestione del conflitto non sono ancora state testate davvero.");
  }

  if (questionAlignmentSummary?.averageScore >= 75) {
    parts.push("Le risposte sono rimaste in media ben aderenti al punto chiesto.");
  } else if (questionAlignmentSummary?.averageScore >= 50) {
    parts.push("Le risposte restano mediamente abbastanza aderenti, ma con qualche allargamento o perdita di fuoco.");
  } else {
    parts.push("L’aderenza alla domanda è una fragilità reale della sessione: in più punti la risposta non entra abbastanza nel merito di ciò che viene chiesto.");
  }

  if (motivationForChangeSummary?.detected) {
    parts.push(motivationForChangeSummary.narrative);
  }

  if (phaseCompletionStats.completedByForcedExit > 0) {
    parts.push(
      `Alcune fasi sono state chiuse per avanzamento forzato (${phaseCompletionStats.completedByForcedExit}), segnale che non sempre il candidato ha portato evidenze sufficienti entro il budget disponibile.`
    );
  }

  if (
    evaluationFocus.decision ||
    evaluationFocus.conflict ||
    evaluationFocus.synthesis
  ) {
    const activeAxes = [
      evaluationFocus.decision ? "decisione" : "",
      evaluationFocus.synthesis ? "sintesi" : "",
      evaluationFocus.conflict ? "gestione dell’attrito" : ""
    ].filter(Boolean);

    if (activeAxes.length > 0) {
      parts.push(
        `Nel runtime sono emersi segnali osservabili soprattutto sull’asse ${activeAxes.join(", ")}.`
      );
    }
  }

  const topDeviation = deviationFlagSummary[0]?.label || "";
  if (topDeviation) {
    parts.push(`La fragilità più ricorrente emersa nel colloquio è questa: ${topDeviation}`);
  }

  return parts.join(" ");
}

function buildQuestionTypeDistribution(answerRecords) {
  const labels = [];

  for (const item of answerRecords) {
    const flags = getQuestionFlags(item);

    if (flags.isOpening) labels.push("opening");
    if (flags.isRoleFit) labels.push("role_fit");
    if (flags.isExample) labels.push("example");
    if (flags.isWalkthrough) labels.push("walkthrough");
    if (flags.isDecision) labels.push("decision");
    if (flags.isPressure) labels.push("pressure");
  }

  const counts = countOccurrences(labels);

  return {
    opening: counts.get("opening") || 0,
    roleFit: counts.get("role_fit") || 0,
    example: counts.get("example") || 0,
    walkthrough: counts.get("walkthrough") || 0,
    decision: counts.get("decision") || 0,
    pressure: counts.get("pressure") || 0
  };
}

export function collectInterviewReport({ interviewRuntime }) {
  if (!interviewRuntime || typeof interviewRuntime !== "object") {
    throw new Error("collectInterviewReport: interviewRuntime is required.");
  }

  const locale = getInterviewLocale();
  const answerRecords = ensureArray(interviewRuntime?.runtimeState?.answers);
  const interviewState = interviewRuntime?.runtimeState?.interviewState || {};

  const answerScores = answerRecords.map(
    (item) => item?.answerAnalysis?.answerShapeAnalysis?.overallScore
  );

  const overallScore = average(answerScores);
  const dimensionAverages = buildDimensionAverages(answerRecords);
  const recurringStrengths = buildRecurringStrengths(answerRecords, locale);
  const recurringWeaknesses = buildRecurringWeaknesses(answerRecords, locale);
  const recurringHints = buildRecurringHints(answerRecords, locale);
  const topicCoverage = buildTopicCoverage(answerRecords);
  const bandCounts = buildAnswerBandCounts(answerRecords);

  const questionAlignmentSummary = buildQuestionAlignmentSummary(
    answerRecords,
    locale
  );

  const motivationForChangeSummary = buildMotivationForChangeSummary(
    answerRecords,
    locale
  );

  const coverage = buildRuntimeCoverage(interviewState);
  const phaseLedgerSummary = buildPhaseLedgerSummary(interviewState);
  const phaseCompletionStats = buildPhaseCompletionStats(phaseLedgerSummary);

  const deviationFlagSummary = buildDeviationFlagSummary(interviewState, locale);
  const observedSignalSummary = buildObservedSignalSummary(interviewState, locale);

  const evaluationFocus = buildEvaluationFocus(interviewState);
  const behavioralAxes = buildBehavioralAxes({
    dimensionAverages,
    coverage,
    evaluationFocus,
    deviationFlagSummary,
    questionAlignmentSummary,
    motivationForChangeSummary
  });

  return {
    interviewReport: {
      sessionStats: {
        totalAnswers: answerRecords.length,
        overallScore,
        overallBand: bandFromScore(overallScore),
        answerBandCounts: bandCounts
      },
      narrativeSummary: buildOverallNarrative(overallScore, dimensionAverages, locale),
      runtimeNarrative: buildRuntimeNarrative({
        coverage,
        phaseCompletionStats,
        evaluationFocus,
        deviationFlagSummary,
        questionAlignmentSummary,
        motivationForChangeSummary
      }),
      dimensionAverages,
      behavioralAxes,
      questionQuality: {
        alignment: questionAlignmentSummary,
        motivationForChange: motivationForChangeSummary,
        questionTypeDistribution: buildQuestionTypeDistribution(answerRecords)
      },
      recurringStrengths,
      recurringWeaknesses,
      recurringImprovementHints: recurringHints,
      topicCoverage,
      runtimeSignals: {
        coverage,
        evaluationFocus,
        observedSignals: observedSignalSummary,
        deviationFlags: deviationFlagSummary,
        phaseCompletionStats,
        phaseLedgerSummary
      },
      finalAdvice: buildFinalAdvice(
        dimensionAverages,
        recurringHints,
        questionAlignmentSummary,
        motivationForChangeSummary,
        locale
      )
    }
  };
}