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
  const valid = values.filter((value) => typeof value === "number" && Number.isFinite(value));

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
    "reflection"
  ];

  const result = {};

  for (const key of dimensionKeys) {
    result[key] = average(
      answerRecords.map(
        (item) => item?.answerAnalysis?.answerShapeAnalysis?.dimensionScores?.[key]
      )
    );
  }

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
      replace: "La risposta porta evidenze o risultati concreti a supporto di ciò che afferma."
    },
    {
      keys: [
        "the answer provides clear ownership.",
        "the answer shows clear ownership."
      ],
      replace: "La risposta rende chiaro il ruolo personale e la responsabilità diretta del candidato."
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

  if (
    lowered.includes("specific") &&
    lowered.includes("example")
  ) {
    return "La risposta include un esempio concreto e specifico.";
  }

  if (
    lowered.includes("structured") &&
    lowered.includes("answer")
  ) {
    return "La risposta ha una struttura chiara e leggibile.";
  }

  if (
    lowered.includes("generic") &&
    lowered.includes("answer")
  ) {
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

function buildRecurringStrengths(answerRecords, activeLocale) {
  const strengths = answerRecords.flatMap(
    (item) => ensureArray(item?.answerAnalysis?.answerShapeAnalysis?.strengths)
  );

  const localizedStrengths = relocalizeTextList(strengths, activeLocale);
  const counts = countOccurrences(localizedStrengths);

  return topItemsFromMap(counts, 1, 6);
}

function buildRecurringWeaknesses(answerRecords, activeLocale) {
  const weaknesses = answerRecords.flatMap(
    (item) => ensureArray(item?.answerAnalysis?.answerShapeAnalysis?.weaknesses)
  );

  const localizedWeaknesses = relocalizeTextList(weaknesses, activeLocale);
  const counts = countOccurrences(localizedWeaknesses);

  return topItemsFromMap(counts, 1, 6);
}

function buildRecurringHints(answerRecords, activeLocale) {
  const hints = answerRecords.flatMap(
    (item) => ensureArray(item?.answerAnalysis?.answerShapeAnalysis?.improvementHints)
  );

  const localizedHints = relocalizeTextList(hints, activeLocale);
  const counts = countOccurrences(localizedHints);

  return topItemsFromMap(counts, 1, 8);
}

function buildOverallNarrative(overallScore, dimensionAverages, locale) {
  if (overallScore >= 75) {
    return locale.report.narrativeStrong;
  }

  if (overallScore >= 50) {
    if (dimensionAverages.evidence < 60 || dimensionAverages.ownership < 60) {
      return locale.report.narrativeMediumEvidence;
    }

    return locale.report.narrativeMedium;
  }

  return locale.report.narrativeWeak;
}

function buildFinalAdvice(dimensionAverages, recurringHints, locale) {
  const advice = [];
  const copy = locale.report.finalAdvice;

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

  if (advice.length === 0 && recurringHints.length > 0) {
    advice.push(recurringHints[0].label);
  }

  if (advice.length === 0) {
    advice.push(copy.fallback);
  }

  return advice;
}

export function collectInterviewReport({ interviewRuntime }) {
  if (!interviewRuntime || typeof interviewRuntime !== "object") {
    throw new Error("collectInterviewReport: interviewRuntime is required.");
  }

  const locale = getInterviewLocale();
  const answerRecords = ensureArray(interviewRuntime?.runtimeState?.answers);
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

  return {
    interviewReport: {
      sessionStats: {
        totalAnswers: answerRecords.length,
        overallScore,
        overallBand: bandFromScore(overallScore),
        answerBandCounts: bandCounts
      },
      narrativeSummary: buildOverallNarrative(overallScore, dimensionAverages, locale),
      dimensionAverages,
      recurringStrengths,
      recurringWeaknesses,
      recurringImprovementHints: recurringHints,
      topicCoverage,
      finalAdvice: buildFinalAdvice(dimensionAverages, recurringHints, locale)
    }
  };
}