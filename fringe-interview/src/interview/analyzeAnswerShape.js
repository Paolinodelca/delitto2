import { getActiveLocale, getFallbackLocale } from "../i18n/getAppLocale.js";
import { INTERVIEW_LOCALES } from "../i18n/interviewLocaleRegistry.js";

function normalizeText(value) {
  if (typeof value !== "string") {
    return "";
  }

  return value.replace(/\s+/g, " ").trim();
}

function tokenize(text) {
  return normalizeText(text)
    .split(" ")
    .map((item) => item.trim())
    .filter(Boolean);
}

function countMatches(text, patterns) {
  const lower = text.toLowerCase();

  return patterns.reduce((count, pattern) => {
    if (pattern instanceof RegExp) {
      const regex = new RegExp(pattern.source, pattern.flags);
      return count + (regex.test(lower) ? 1 : 0);
    }

    return count + (lower.includes(String(pattern).toLowerCase()) ? 1 : 0);
  }, 0);
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

function resolveAnswerShapeLocale() {
  const activeLocale = normalizeText(getActiveLocale());
  const fallbackLocale = normalizeText(getFallbackLocale());

  const active = INTERVIEW_LOCALES[activeLocale];
  if (active?.answerShape) {
    return active;
  }

  const fallback = INTERVIEW_LOCALES[fallbackLocale];
  if (fallback?.answerShape) {
    return fallback;
  }

  return INTERVIEW_LOCALES.it || INTERVIEW_LOCALES.en;
}

function buildDetectedSignals(text) {
  const quantifierPatterns = [
    /\b\d+\b/,
    /\b\d+%\b/,
    "percent",
    "weekly",
    "monthly",
    "daily",
    "quarterly",
    "yearly",
    "years",
    "months",
    "days"
  ];

  const ownershipPatterns = [
    "i led",
    "i owned",
    "i decided",
    "i created",
    "i built",
    "i managed",
    "i improved",
    "i coordinated",
    "i designed",
    "i drove",
    "i defined",
    "i proposed",
    "i implemented"
  ];

  const evidencePatterns = [
    "result",
    "outcome",
    "impact",
    "improved",
    "reduced",
    "increased",
    "decreased",
    "saved",
    "grew",
    "delivered",
    "measured",
    "kpi",
    "metric",
    "dashboard"
  ];

  const structurePatterns = [
    "first",
    "then",
    "after that",
    "because",
    "therefore",
    "so that",
    "as a result",
    "in order to",
    "the challenge",
    "the situation",
    "the result"
  ];

  const reflectionPatterns = [
    "i learned",
    "i realized",
    "next time",
    "i would",
    "i adapted",
    "i changed",
    "i improved",
    "what mattered",
    "what worked",
    "what did not work"
  ];

  const vaguePatterns = [
    "many things",
    "a lot",
    "various",
    "several tasks",
    "different things",
    "in general",
    "basically",
    "kind of",
    "sort of",
    "something like",
    "more or less"
  ];

  return {
    quantifiers: countMatches(text, quantifierPatterns),
    ownershipMarkers: countMatches(text, ownershipPatterns),
    evidenceMarkers: countMatches(text, evidencePatterns),
    structureMarkers: countMatches(text, structurePatterns),
    reflectionMarkers: countMatches(text, reflectionPatterns),
    vagueMarkers: countMatches(text, vaguePatterns)
  };
}

function scoreConcreteness(wordCount, signals) {
  let score = 30;

  if (wordCount >= 20) score += 15;
  if (wordCount >= 40) score += 10;
  if (signals.quantifiers > 0) score += 20;
  if (signals.evidenceMarkers > 0) score += 15;
  score -= signals.vagueMarkers * 10;

  return clampScore(score);
}

function scoreSpecificity(wordCount, signals) {
  let score = 35;

  if (wordCount >= 18) score += 10;
  if (wordCount >= 35) score += 10;
  if (signals.quantifiers > 0) score += 15;
  if (signals.ownershipMarkers > 0) score += 10;
  score -= signals.vagueMarkers * 8;

  return clampScore(score);
}

function scoreEvidence(signals) {
  let score = 25;

  score += signals.evidenceMarkers * 18;
  score += signals.quantifiers * 12;
  score -= signals.vagueMarkers * 8;

  return clampScore(score);
}

function scoreOwnership(signals) {
  let score = 20;

  score += signals.ownershipMarkers * 22;
  score += signals.evidenceMarkers > 0 ? 8 : 0;
  score -= signals.vagueMarkers * 5;

  return clampScore(score);
}

function scoreStructure(wordCount, signals) {
  let score = 30;

  if (wordCount >= 20) score += 10;
  score += signals.structureMarkers * 15;
  score -= signals.vagueMarkers * 5;

  return clampScore(score);
}

function scoreClarity(wordCount, signals) {
  let score = 55;

  if (wordCount < 8) score -= 20;
  if (wordCount > 120) score -= 10;
  if (signals.vagueMarkers > 0) score -= signals.vagueMarkers * 8;
  if (signals.structureMarkers > 0) score += 10;

  return clampScore(score);
}

function scoreReflection(signals) {
  let score = 20;
  score += signals.reflectionMarkers * 25;
  return clampScore(score);
}

function buildStrengths(scores, answerShapeCopy) {
  const strengths = [];
  const copy = answerShapeCopy.strengths || {};

  if (scores.concreteness >= 75) strengths.push(copy.concreteness);
  if (scores.evidence >= 75) strengths.push(copy.evidence);
  if (scores.ownership >= 75) strengths.push(copy.ownership);
  if (scores.structure >= 75) strengths.push(copy.structure);
  if (scores.clarity >= 75) strengths.push(copy.clarity);
  if (scores.reflection >= 75) strengths.push(copy.reflection);

  return strengths.filter(Boolean);
}

function buildWeaknesses(scores, answerShapeCopy) {
  const weaknesses = [];
  const copy = answerShapeCopy.weaknesses || {};

  if (scores.concreteness < 50) weaknesses.push(copy.concreteness);
  if (scores.specificity < 50) weaknesses.push(copy.specificity);
  if (scores.evidence < 50) weaknesses.push(copy.evidence);
  if (scores.ownership < 50) weaknesses.push(copy.ownership);
  if (scores.structure < 50) weaknesses.push(copy.structure);
  if (scores.clarity < 50) weaknesses.push(copy.clarity);
  if (scores.reflection < 50) weaknesses.push(copy.reflection);

  return weaknesses.filter(Boolean);
}

function buildImprovementHints(scores, signals, answerShapeCopy) {
  const hints = [];
  const copy = answerShapeCopy.hints || {};

  if (scores.concreteness < 60 || scores.specificity < 60) {
    hints.push(copy.concreteness);
  }

  if (scores.evidence < 60) {
    hints.push(copy.evidence);
  }

  if (scores.ownership < 60) {
    hints.push(copy.ownership);
  }

  if (scores.structure < 60) {
    hints.push(copy.structure);
  }

  if (scores.reflection < 60) {
    hints.push(copy.reflection);
  }

  if (signals.vagueMarkers > 0) {
    hints.push(copy.vague);
  }

  return hints.filter(Boolean);
}

export function analyzeAnswerShape({ answerText }) {
  const locale = resolveAnswerShapeLocale();
  const answerShapeCopy = locale.answerShape || {};
  const text = normalizeText(answerText);

  if (!text) {
    return {
      answerShapeAnalysis: {
        summary: answerShapeCopy.noAnswerSummary || "Non è stato fornito alcun testo di risposta.",
        overallScore: 0,
        overallBand: "weak",
        dimensionScores: {
          concreteness: 0,
          specificity: 0,
          evidence: 0,
          ownership: 0,
          structure: 0,
          clarity: 0,
          reflection: 0
        },
        detectedSignals: {
          wordCount: 0,
          quantifiers: 0,
          ownershipMarkers: 0,
          evidenceMarkers: 0,
          structureMarkers: 0,
          reflectionMarkers: 0,
          vagueMarkers: 0
        },
        strengths: [],
        weaknesses: [
          answerShapeCopy.noAnswerWeakness || "Non è stata fornita una risposta utilizzabile."
        ],
        improvementHints: [
          answerShapeCopy.noAnswerHint || "Fornisci una risposta reale prima di tentare l’analisi."
        ]
      }
    };
  }

  const words = tokenize(text);
  const wordCount = words.length;
  const signals = buildDetectedSignals(text);

  const scores = {
    concreteness: scoreConcreteness(wordCount, signals),
    specificity: scoreSpecificity(wordCount, signals),
    evidence: scoreEvidence(signals),
    ownership: scoreOwnership(signals),
    structure: scoreStructure(wordCount, signals),
    clarity: scoreClarity(wordCount, signals),
    reflection: scoreReflection(signals)
  };

  const overallScore = clampScore(
    (
      scores.concreteness +
      scores.specificity +
      scores.evidence +
      scores.ownership +
      scores.structure +
      scores.clarity +
      scores.reflection
    ) / 7
  );

  const strengths = buildStrengths(scores, answerShapeCopy);
  const weaknesses = buildWeaknesses(scores, answerShapeCopy);
  const improvementHints = buildImprovementHints(scores, signals, answerShapeCopy);

  let summary = answerShapeCopy.summaryWeak || "La risposta mostra un profilo formale debole.";

  if (overallScore >= 75) {
    summary = answerShapeCopy.summaryStrong || summary;
  } else if (overallScore >= 50) {
    summary = answerShapeCopy.summaryMedium || summary;
  }

  return {
    answerShapeAnalysis: {
      summary,
      overallScore,
      overallBand: bandFromScore(overallScore),
      dimensionScores: scores,
      detectedSignals: {
        wordCount,
        ...signals
      },
      strengths,
      weaknesses,
      improvementHints
    }
  };
}