function ensureArray(value) {
  return Array.isArray(value) ? value : [];
}

function normalizeString(value) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

function asNumberOrNull(value) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
}

function uniqueNonEmpty(values) {
  return [...new Set(ensureArray(values).map((item) => normalizeString(item)).filter(Boolean))];
}

function pickTopBlockingIssues(finalCandidateReport) {
  const answerQuality = finalCandidateReport?.answerQuality || {};
  const improvements = finalCandidateReport?.improvements || {};
  const runtimeRead = finalCandidateReport?.runtimeRead || {};
  const roleFit = finalCandidateReport?.roleFit || {};

  const rawItems = [
    ...ensureArray(answerQuality?.recurringWeaknesses),
    ...ensureArray(improvements?.finalAdvice),
    ...ensureArray(runtimeRead?.deviationFlags),
    ...ensureArray(roleFit?.clarificationsNeeded)
  ];

  const normalized = uniqueNonEmpty(
    rawItems.map((item) => {
      const clean = normalizeString(item)
        .replace(/^Dalle risposte emerge che /i, "")
        .replace(/^Dalle risposte si osserva che /i, "")
        .replace(/^La risposta /i, "")
        .replace(/^Serve /i, "")
        .replace(/^Occorre /i, "")
        .trim()
        .toLowerCase();

      if (
        clean.includes("riflessione") ||
        clean.includes("apprendimento") ||
        clean.includes("adattamento")
      ) {
        return "Non emerge ancora abbastanza bene come il candidato apprende, corregge il tiro o adatta il proprio modo di lavorare.";
      }

      if (
        clean.includes("contributo personale") ||
        clean.includes("team")
      ) {
        return "Non sempre si capisce con precisione che cosa dipendeva davvero dal candidato e che cosa invece apparteneva al team o al contesto.";
      }

      if (
        clean.includes("impatto") ||
        clean.includes("risultato") ||
        clean.includes("outcome") ||
        clean.includes("metrica")
      ) {
        return "Le risposte restano spesso plausibili, ma portano ancora poche prove visibili di risultato, impatto o valore generato.";
      }

      return normalizeString(item);
    })
  );

  const top = normalized.slice(0, 3);

  if (top.length > 0) {
    return top;
  }

  return [
    "Non emerge ancora abbastanza bene come il candidato apprende, corregge il tiro o adatta il proprio modo di lavorare.",
    "Non sempre si capisce con precisione che cosa dipendeva davvero dal candidato e che cosa invece apparteneva al team o al contesto.",
    "Le risposte restano spesso plausibili, ma portano ancora poche prove visibili di risultato, impatto o valore generato."
  ];
}

function normalizeBehavioralAxes(scoreLayer = {}) {
  const rawAxes = scoreLayer?.behavioralAxes || {};

  return {
    decision: {
      label: "Decisione",
      score: asNumberOrNull(rawAxes?.Decisione?.score),
      band: normalizeString(rawAxes?.Decisione?.band)
    },
    synthesis: {
      label: "Sintesi",
      score: asNumberOrNull(rawAxes?.Sintesi?.score),
      band: normalizeString(rawAxes?.Sintesi?.band)
    },
    conflict: {
      label: "Attrito",
      score: asNumberOrNull(rawAxes?.Attrito?.score),
      band: normalizeString(rawAxes?.Attrito?.band)
    },
    positioning: {
      label: "Posizionamento",
      score: asNumberOrNull(rawAxes?.Posizionamento?.score),
      band: normalizeString(rawAxes?.Posizionamento?.band)
    }
  };
}

function buildSummary(finalCandidateReport) {
  const overall = finalCandidateReport?.overall || {};
  const roleFit = finalCandidateReport?.roleFit || {};
  const answerQuality = finalCandidateReport?.answerQuality || {};
  const questionQuality = finalCandidateReport?.questionQuality || {};
  const executiveRead = finalCandidateReport?.executiveRead || {};
  const finalTakeaway = finalCandidateReport?.finalTakeaway || {};

  return {
    targetRole: normalizeString(overall?.roleTitle),
    candidateSummary: normalizeString(overall?.candidateSummary),
    fitBand: normalizeString(roleFit?.recommendationBand),
    fitScore:
      asNumberOrNull(overall?.metrics?.["Score di aderenza"]) ??
      asNumberOrNull(overall?.metrics?.["Compatibilità con il ruolo"]),
    answerBand: normalizeString(answerQuality?.overallBand),
    answerScore:
      asNumberOrNull(overall?.metrics?.["Score qualità risposte"]) ??
      asNumberOrNull(overall?.metrics?.["Qualità delle risposte"]),
    alignmentBand: normalizeString(questionQuality?.alignment?.band),
    executiveHeadline:
      normalizeString(executiveRead?.headline) ||
      normalizeString(finalTakeaway?.message),
    executiveSubheadline: normalizeString(executiveRead?.subheadline),
    shortRationale: normalizeString(overall?.shortRationale)
  };
}

function buildFitAnalysis(finalCandidateReport) {
  const roleFit = finalCandidateReport?.roleFit || {};

  return {
    recommendationBand: normalizeString(roleFit?.recommendationBand),
    confidence: normalizeString(roleFit?.confidence),
    strengths: uniqueNonEmpty(roleFit?.strengths),
    risks: uniqueNonEmpty(roleFit?.risks),
    clarificationsNeeded: uniqueNonEmpty(roleFit?.clarificationsNeeded),
    transferableStrengths: uniqueNonEmpty(roleFit?.transferableStrengths),
    matchedSkills: uniqueNonEmpty(roleFit?.matchedSkills),
    missingSkills: uniqueNonEmpty(roleFit?.missingSkills)
  };
}

function buildAnswerSignals(finalCandidateReport) {
  const answerQuality = finalCandidateReport?.answerQuality || {};
  const questionQuality = finalCandidateReport?.questionQuality || {};
  const runtimeRead = finalCandidateReport?.runtimeRead || {};
  const scoreLayer = finalCandidateReport?.scoreLayer || {};

  return {
    overallBand: normalizeString(answerQuality?.overallBand),
    overallScore: asNumberOrNull(answerQuality?.overallScore),
    totalAnswers: asNumberOrNull(answerQuality?.totalAnswers) ?? 0,
    dimensionAverages: answerQuality?.dimensionAverages || {},
    behavioralAxes: normalizeBehavioralAxes(scoreLayer),
    recurringStrengths: uniqueNonEmpty(answerQuality?.recurringStrengths),
    recurringWeaknesses: uniqueNonEmpty(answerQuality?.recurringWeaknesses),
    alignment: {
      averageScore: asNumberOrNull(questionQuality?.alignment?.averageScore),
      band: normalizeString(questionQuality?.alignment?.band),
      narrative: normalizeString(questionQuality?.alignment?.narrative),
      offTopicRiskCounts: questionQuality?.alignment?.offTopicRiskCounts || {}
    },
    motivationForChange: {
      detected: Boolean(questionQuality?.motivationForChange?.detected),
      averageScore: asNumberOrNull(questionQuality?.motivationForChange?.averageScore),
      band: normalizeString(questionQuality?.motivationForChange?.band),
      answeredCount: asNumberOrNull(questionQuality?.motivationForChange?.answeredCount) ?? 0,
      narrative: normalizeString(questionQuality?.motivationForChange?.narrative)
    },
    runtimeNarrative: normalizeString(runtimeRead?.runtimeNarrative),
    deviationFlags: uniqueNonEmpty(runtimeRead?.deviationFlags),
    observedSignals: uniqueNonEmpty(runtimeRead?.observedSignals),
    coverage: runtimeRead?.coverage || {},
    evaluationFocus: runtimeRead?.evaluationFocus || {},
    phaseCompletionStats: runtimeRead?.phaseCompletionStats || {}
  };
}

function buildRecruiterRead(finalCandidateReport) {
  const recruiterSnapshot = finalCandidateReport?.recruiterSnapshot || {};
  const recruiterRecommendation = finalCandidateReport?.recruiterRecommendation || {};

  return {
    recommendationBand:
      normalizeString(recruiterSnapshot?.recommendationBand) ||
      normalizeString(recruiterRecommendation?.recommendationBand),
    insertionRisk:
      normalizeString(recruiterSnapshot?.insertionRisk) ||
      normalizeString(recruiterRecommendation?.insertionRisk),
    bestContext:
      normalizeString(recruiterSnapshot?.bestContext) ||
      normalizeString(recruiterRecommendation?.bestContext),
    strengths: uniqueNonEmpty(recruiterSnapshot?.strengths),
    risks: uniqueNonEmpty(recruiterSnapshot?.risks),
    notes: uniqueNonEmpty(recruiterSnapshot?.notes)
  };
}

function buildCoachRead(finalCandidateReport) {
  const coachSnapshot = finalCandidateReport?.coachSnapshot || {};
  const improvements = finalCandidateReport?.improvements || {};

  return {
    whatWorked: uniqueNonEmpty(coachSnapshot?.whatWorked),
    whatToImprove: uniqueNonEmpty(coachSnapshot?.whatToImprove),
    nextMoves: uniqueNonEmpty(coachSnapshot?.nextMoves),
    finalAdvice: uniqueNonEmpty(improvements?.finalAdvice),
    recurringImprovementHints: uniqueNonEmpty(improvements?.recurringImprovementHints)
  };
}

function buildPriorities(finalCandidateReport) {
  const improvements = finalCandidateReport?.improvements || {};
  const pressureMoments = finalCandidateReport?.pressureMoments || {};

  return {
    topBlockingIssues: pickTopBlockingIssues(finalCandidateReport),
    finalAdvice: uniqueNonEmpty(improvements?.finalAdvice).slice(0, 5),
    recurringImprovementHints: uniqueNonEmpty(improvements?.recurringImprovementHints).slice(0, 5),
    pressureMoments: uniqueNonEmpty(pressureMoments?.items).slice(0, 6)
  };
}

function extractFinalCandidateReport(input) {
  if (!input || typeof input !== "object") {
    throw new Error("buildProReportModel: input object is required.");
  }

  if (input?.finalCandidateReport && typeof input.finalCandidateReport === "object") {
    return input.finalCandidateReport;
  }

  return input;
}

export function buildProReportModel(input) {
  const finalCandidateReport = extractFinalCandidateReport(input);

  return {
    proReportModel: {
      version: "1.0",
      source: "finalCandidateReport",
      summary: buildSummary(finalCandidateReport),
      fitAnalysis: buildFitAnalysis(finalCandidateReport),
      answerSignals: buildAnswerSignals(finalCandidateReport),
      recruiterRead: buildRecruiterRead(finalCandidateReport),
      coachRead: buildCoachRead(finalCandidateReport),
      priorities: buildPriorities(finalCandidateReport)
    }
  };
}

export default buildProReportModel;