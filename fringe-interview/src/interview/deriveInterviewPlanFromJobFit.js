function ensureArray(value) {
  return Array.isArray(value) ? value : [];
}

function normalizePriority(priority) {
  if (priority === "high" || priority === "medium" || priority === "low") {
    return priority;
  }

  return "medium";
}

function priorityScore(priority) {
  if (priority === "high") return 3;
  if (priority === "medium") return 2;
  return 1;
}

function uniqueStrings(values) {
  const seen = new Set();
  const result = [];

  for (const value of values) {
    if (typeof value !== "string") {
      continue;
    }

    const clean = value.trim();

    if (!clean) {
      continue;
    }

    const key = clean.toLowerCase();

    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    result.push(clean);
  }

  return result;
}

function mapFocusTypeToIntent(focusType) {
  switch (focusType) {
    case "verify_strength":
      return "validate_strength";
    case "probe_gap":
      return "probe_gap";
    case "clarify_ambiguity":
      return "clarify";
    case "assess_transferability":
      return "assess_transferability";
    case "validate_seniority":
      return "validate_seniority";
    case "test_depth":
      return "test_depth";
    default:
      return "clarify";
  }
}

function mapFocusTypeToQuestionMode(focusType) {
  switch (focusType) {
    case "verify_strength":
      return "evidence_check";
    case "probe_gap":
      return "gap_probe";
    case "clarify_ambiguity":
      return "clarification";
    case "assess_transferability":
      return "transferability_probe";
    case "validate_seniority":
      return "seniority_probe";
    case "test_depth":
      return "depth_probe";
    default:
      return "clarification";
  }
}

function inferQuestionFamily(topic, focusType) {
  const value = `${topic} ${focusType}`.toLowerCase();

  if (value.includes("ownership") || value.includes("accountability")) {
    return "ownership_scope";
  }

  if (value.includes("stakeholder")) {
    return "stakeholder_management";
  }

  if (value.includes("saa") || value.includes("transfer")) {
    return "transferability";
  }

  if (value.includes("dashboard") || value.includes("reporting") || value.includes("sql")) {
    return "analytical_depth";
  }

  if (value.includes("seniority")) {
    return "seniority_calibration";
  }

  if (value.includes("communication")) {
    return "communication_clarity";
  }

  if (value.includes("leadership")) {
    return "leadership_scope";
  }

  return "general_fit";
}

function buildFocusBlocks(interviewFocus) {
  return ensureArray(interviewFocus)
    .map((item) => {
      const priority = normalizePriority(item?.priority);
      const topic = typeof item?.topic === "string" ? item.topic.trim() : "";
      const reason = typeof item?.reason === "string" ? item.reason.trim() : "";
      const focusType = typeof item?.focusType === "string" ? item.focusType.trim() : "clarify_ambiguity";

      if (!topic) {
        return null;
      }

      return {
        priority,
        intent: mapFocusTypeToIntent(focusType),
        questionMode: mapFocusTypeToQuestionMode(focusType),
        suggestedQuestionFamily: inferQuestionFamily(topic, focusType),
        topic,
        reason
      };
    })
    .filter(Boolean)
    .sort((a, b) => priorityScore(b.priority) - priorityScore(a.priority));
}

function buildFollowupPlan(followupTriggers) {
  return ensureArray(followupTriggers)
    .map((item) => {
      const triggerType = typeof item?.triggerType === "string" ? item.triggerType.trim() : "";
      const reason = typeof item?.reason === "string" ? item.reason.trim() : "";

      if (!triggerType) {
        return null;
      }

      return {
        triggerType,
        reason
      };
    })
    .filter(Boolean);
}

function buildOpeningFocus(jobFitAnalysis) {
  const strengths = ensureArray(jobFitAnalysis?.reportHighlights?.strengths);
  const clarifications = ensureArray(jobFitAnalysis?.reportHighlights?.clarificationsNeeded);
  const risks = ensureArray(jobFitAnalysis?.reportHighlights?.risks);

  return {
    validateFirst: strengths.slice(0, 2),
    clarifyEarly: clarifications.slice(0, 2),
    monitorRisks: risks.slice(0, 2)
  };
}

function buildReportEmphasis(jobFitAnalysis) {
  const reportHighlights = jobFitAnalysis?.reportHighlights || {};

  return {
    strengthsToValidate: ensureArray(reportHighlights.strengths),
    risksToTest: ensureArray(reportHighlights.risks),
    clarificationsToCollect: ensureArray(reportHighlights.clarificationsNeeded),
    positioningHints: ensureArray(reportHighlights.positioningHints),
    cvImprovementHints: ensureArray(jobFitAnalysis?.cvImprovementHints)
  };
}

function buildSessionStrategy(jobFitAnalysis, focusBlocks) {
  const recommendationBand =
    jobFitAnalysis?.fitSummary?.recommendationBand || "plausible_fit";

  const confidence = jobFitAnalysis?.fitSummary?.confidence || "medium";

  const highPriorityGaps = focusBlocks.filter(
    (item) => item.priority === "high" && item.intent === "probe_gap"
  ).length;

  const highPriorityClarifications = focusBlocks.filter(
    (item) => item.priority === "high" && item.intent === "clarify"
  ).length;

  const highPriorityTransferability = focusBlocks.filter(
    (item) => item.priority === "high" && item.intent === "assess_transferability"
  ).length;

  let interviewStyle = "balanced";

  if (recommendationBand === "strong_fit") {
    interviewStyle = "validate_strengths";
  } else if (recommendationBand === "solid_fit") {
    interviewStyle = "validate_then_probe";
  } else if (recommendationBand === "plausible_fit") {
    interviewStyle = "balanced";
  } else if (recommendationBand === "stretch_fit") {
    interviewStyle = "probe_risk_first";
  } else if (recommendationBand === "weak_fit") {
    interviewStyle = "probe_risk_first";
  }

  if (
    (recommendationBand === "stretch_fit" || recommendationBand === "weak_fit") &&
    highPriorityGaps > 0
  ) {
    interviewStyle = "probe_risk_first";
  }

  if (
    recommendationBand === "solid_fit" &&
    highPriorityGaps === 0 &&
    highPriorityClarifications === 0 &&
    highPriorityTransferability === 0
  ) {
    interviewStyle = "validate_strengths";
  }

  return {
    recommendationBand,
    confidence,
    interviewStyle,
    shouldProbeRisksEarly: highPriorityGaps > 0,
    shouldClarifyEarly: highPriorityClarifications > 0 || highPriorityTransferability > 0
  };
}

export function deriveInterviewPlanFromJobFit({
  candidateProfile,
  roleProfile,
  jobFitAnalysis
}) {
  const candidate = candidateProfile?.candidateProfile || candidateProfile;
  const role = roleProfile?.roleProfile || roleProfile;
  const fit = jobFitAnalysis?.jobFitAnalysis || jobFitAnalysis;

  if (!candidate || typeof candidate !== "object") {
    throw new Error("deriveInterviewPlanFromJobFit: candidateProfile is required.");
  }

  if (!role || typeof role !== "object") {
    throw new Error("deriveInterviewPlanFromJobFit: roleProfile is required.");
  }

  if (!fit || typeof fit !== "object") {
    throw new Error("deriveInterviewPlanFromJobFit: jobFitAnalysis is required.");
  }

  const focusBlocks = buildFocusBlocks(fit.interviewFocus);
  const followupPlan = buildFollowupPlan(fit.followupTriggers);

  const suggestedQuestionFamilies = uniqueStrings(
    focusBlocks.map((item) => item.suggestedQuestionFamily)
  );

  const priorityTopics = uniqueStrings(
    focusBlocks
      .filter((item) => item.priority === "high")
      .map((item) => item.topic)
  );

  return {
    interviewPlan: {
      candidateSnapshot: {
        summary: candidate.summary || "",
        senioritySignal: candidate.senioritySignal || "unclear",
        strengthAreas: ensureArray(candidate.strengthAreas),
        riskAreas: ensureArray(candidate.riskAreas)
      },
      roleSnapshot: {
        title: role.title || "",
        seniorityDetected: role.seniorityDetected || "unclear",
        mustHaveRequirements: ensureArray(role.requirements?.mustHave),
        responsibilities: ensureArray(role.responsibilities)
      },
      fitSnapshot: {
        overallScore: fit.fitSummary?.overallScore ?? null,
        fitLevel: fit.fitSummary?.fitLevel || "medium",
        recommendationBand: fit.fitSummary?.recommendationBand || "plausible_fit",
        confidence: fit.fitSummary?.confidence || "medium",
        shortRationale: fit.fitSummary?.shortRationale || ""
      },
      sessionStrategy: buildSessionStrategy(fit, focusBlocks),
      openingFocus: buildOpeningFocus(fit),
      priorityTopics,
      focusBlocks,
      suggestedQuestionFamilies,
      followupPlan,
      reportEmphasis: buildReportEmphasis(fit)
    }
  };
}