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

function buildLocaleCopy(localeKey) {
  if (localeKey === "it") {
    return {
      titles: {
        overall: "Sintesi generale",
        roleFit: "Aderenza al ruolo",
        answerQuality: "Qualità delle risposte",
        strengths: "Punti forti",
        risks: "Aree critiche",
        improvements: "Suggerimenti di miglioramento",
        cvAdvice: "Suggerimenti per il CV",
        finalTakeaway: "Messaggio finale"
      },
      labels: {
        targetRole: "Ruolo target",
        recommendationBand: "Valutazione complessiva",
        fitScore: "Score di aderenza",
        answerScore: "Score qualità risposte",
        candidateSeniority: "Seniority percepita candidato",
        roleSeniority: "Seniority attesa dal ruolo"
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
      roleFit: "Role Fit",
      answerQuality: "Answer Quality",
      strengths: "Strengths",
      risks: "Risk Areas",
      improvements: "Improvement Suggestions",
      cvAdvice: "CV Suggestions",
      finalTakeaway: "Final Takeaway"
    },
    labels: {
      targetRole: "Target role",
      recommendationBand: "Overall recommendation",
      fitScore: "Fit score",
      answerScore: "Answer quality score",
      candidateSeniority: "Candidate seniority",
      roleSeniority: "Role seniority"
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

function detectLocaleKey(locale) {
  if (locale?.report?.narrativeWeak?.startsWith("La sessione")) {
    return "it";
  }

  return "en";
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

function buildRoleFitSection({ fit, copy }) {
  return {
    title: copy.titles.roleFit,
    recommendationBand: fit?.fitSummary?.recommendationBand || "",
    confidence: fit?.fitSummary?.confidence || "",
    strengths: ensureArray(fit?.reportHighlights?.strengths),
    risks: ensureArray(fit?.reportHighlights?.risks),
    clarificationsNeeded: ensureArray(fit?.reportHighlights?.clarificationsNeeded),
    transferableStrengths: ensureArray(fit?.transferableStrengths),
    matchedSkills: ensureArray(fit?.matchedSkills),
    missingSkills: ensureArray(fit?.missingSkills)
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

function buildStrengthsSection({ fit, report, copy }) {
  return {
    title: copy.titles.strengths,
    roleStrengths: ensureArray(fit?.reportHighlights?.strengths),
    answerStrengths: topLabels(report?.recurringStrengths, 5),
    combinedHighlights: [
      ...ensureArray(fit?.reportHighlights?.strengths),
      ...topLabels(report?.recurringStrengths, 5)
    ].filter(Boolean).slice(0, 8)
  };
}

function buildRisksSection({ fit, report, copy }) {
  return {
    title: copy.titles.risks,
    roleRisks: ensureArray(fit?.reportHighlights?.risks),
    answerWeaknesses: topLabels(report?.recurringWeaknesses, 5),
    clarificationsNeeded: ensureArray(fit?.reportHighlights?.clarificationsNeeded)
  };
}

function buildImprovementsSection({ report, copy }) {
  return {
    title: copy.titles.improvements,
    finalAdvice: ensureArray(report?.finalAdvice),
    recurringImprovementHints: topLabels(report?.recurringImprovementHints, 8)
  };
}

function buildCvAdviceSection({ fit, copy }) {
  return {
    title: copy.titles.cvAdvice,
    cvImprovementHints: ensureArray(fit?.cvImprovementHints),
    positioningHints: ensureArray(fit?.reportHighlights?.positioningHints)
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
        "role_fit",
        "answer_quality",
        "strengths",
        "risks",
        "improvements",
        "cv_advice",
        "final_takeaway"
      ],
      overall: buildOverallSection({ candidate, role, fit, report, copy }),
      roleFit: buildRoleFitSection({ fit, copy }),
      answerQuality: buildAnswerQualitySection({ report, copy }),
      strengths: buildStrengthsSection({ fit, report, copy }),
      risks: buildRisksSection({ fit, report, copy }),
      improvements: buildImprovementsSection({ report, copy }),
      cvAdvice: buildCvAdviceSection({ fit, copy }),
      finalTakeaway: buildFinalTakeaway({ report, copy })
    }
  };
}