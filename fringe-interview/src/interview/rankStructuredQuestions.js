function ensureArray(value) {
  return Array.isArray(value) ? value : [];
}

function normalizeString(value) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

function normalizeStringArray(value) {
  return ensureArray(value)
    .map((item) => normalizeString(item))
    .filter(Boolean);
}

function weightToBaseScore(selectionWeight) {
  const normalized = normalizeString(selectionWeight);

  if (normalized === "high") {
    return 6;
  }

  if (normalized === "medium") {
    return 4;
  }

  if (normalized === "low") {
    return 2;
  }

  return 1;
}

function includesNormalized(items, target) {
  const normalizedTarget = normalizeString(target);

  if (!normalizedTarget) {
    return false;
  }

  return normalizeStringArray(items).includes(normalizedTarget);
}

function intersectionCount(a, b) {
  const aSet = new Set(normalizeStringArray(a));
  const bSet = new Set(normalizeStringArray(b));

  let count = 0;

  for (const item of aSet) {
    if (bSet.has(item)) {
      count += 1;
    }
  }

  return count;
}

function isConsultancySensitive(question) {
  const tags = normalizeStringArray(question?.tags);
  const key = normalizeString(question?.key);

  return (
    tags.includes("consultancy") ||
    tags.includes("client_handling") ||
    tags.includes("pressure_relevant") ||
    key === "client_pushback_handling" ||
    key === "expectation_reset"
  );
}

function isStrongConsultancySensitive(question) {
  const key = normalizeString(question?.key);

  return (
    key === "client_pushback_handling" ||
    key === "expectation_reset"
  );
}

function isPressureSensitive(question) {
  const tags = normalizeStringArray(question?.tags);
  const key = normalizeString(question?.key);

  return (
    tags.includes("pressure") ||
    tags.includes("pressure_relevant") ||
    key === "pressure_handling" ||
    key === "clarity_under_challenge" ||
    key === "priority_conflict_management"
  );
}

function buildQuestionScore({ interviewContextProfile, question }) {
  const reasons = [];
  let score = 0;

  const seniorityContext = normalizeString(interviewContextProfile?.seniorityContext);
  const companyContext = normalizeString(interviewContextProfile?.companyContext);
  const defaultTone = normalizeString(interviewContextProfile?.defaultTone);
  const personPerceptionFocus = normalizeStringArray(
    interviewContextProfile?.personPerceptionFocus
  );
  const questionStrategyBias = normalizeStringArray(
    interviewContextProfile?.questionStrategyBias
  );

  const selectionWeight = normalizeString(question?.selectionWeight);
  const baseScore = weightToBaseScore(selectionWeight);
  score += baseScore;
  reasons.push(`selectionWeight:${selectionWeight || "unknown"}`);

  if (includesNormalized(question?.senioritySuitability, seniorityContext)) {
    score += 3;
    reasons.push(`seniority:${seniorityContext}`);
  }

  if (includesNormalized(question?.companyContextSuitability, companyContext)) {
    score += 3;
    reasons.push(`companyContext:${companyContext}`);
  }

  if (includesNormalized(question?.toneSuitability, defaultTone)) {
    score += 2;
    reasons.push(`tone:${defaultTone}`);
  }

  const signalFocusMatches = intersectionCount(
    question?.signals,
    personPerceptionFocus
  );
  if (signalFocusMatches > 0) {
    score += signalFocusMatches * 2;
    reasons.push(
      `personPerception:${normalizeStringArray(question?.signals)
        .filter((item) => personPerceptionFocus.includes(item))
        .join(",")}`
    );
  }

  const biasMatches = intersectionCount(question?.signals, questionStrategyBias);
  if (biasMatches > 0) {
    score += biasMatches * 2;
    reasons.push(
      `biasSignals:${normalizeStringArray(question?.signals)
        .filter((item) => questionStrategyBias.includes(item))
        .join(",")}`
    );
  }

  const consultancySensitive = isConsultancySensitive(question);
  const strongConsultancySensitive = isStrongConsultancySensitive(question);
  const pressureSensitive = isPressureSensitive(question);

  if (consultancySensitive) {
    if (companyContext === "consultancy_client_facing") {
      score += strongConsultancySensitive ? 4 : 3;
      reasons.push(
        strongConsultancySensitive
          ? "strongConsultancyBoost"
          : "consultancyBoost"
      );
    } else {
      score -= strongConsultancySensitive ? 4 : 2;
      reasons.push(
        strongConsultancySensitive
          ? "strongConsultancyPenaltyOutsideContext"
          : "consultancyPenaltyOutsideContext"
      );
    }
  }

  if (pressureSensitive) {
    if (defaultTone === "pressure") {
      score += 3;
      reasons.push("pressureBoost");
    } else if (defaultTone === "incisive") {
      score += 1;
      reasons.push("pressureLightBoost");
    }
  }

  if (
    seniorityContext === "junior" ||
    seniorityContext === "entry"
  ) {
    const key = normalizeString(question?.key);

    if (
      key === "accountability_examples" ||
      key === "leadership_scope" ||
      key === "decision_tradeoffs" ||
      key === "client_pushback_handling"
    ) {
      score -= 2;
      reasons.push("juniorPenaltyHighDemand");
    }

    if (
      key === "learning_orientation" ||
      key === "motivation_for_role" ||
      key === "feedback_application" ||
      key === "team_contribution_examples" ||
      key === "adaptability_examples" ||
      key === "initiative_examples"
    ) {
      score += 2;
      reasons.push("juniorPotentialBoost");
    }
  }

  return {
    key: normalizeString(question?.key),
    category: normalizeString(question?.category),
    score,
    reasons
  };
}

export function rankStructuredQuestions({
  interviewContextProfile,
  structuredQuestionBank
}) {
  if (!interviewContextProfile || typeof interviewContextProfile !== "object") {
    throw new Error(
      "rankStructuredQuestions: interviewContextProfile is required."
    );
  }

  if (!structuredQuestionBank || typeof structuredQuestionBank !== "object") {
    throw new Error(
      "rankStructuredQuestions: structuredQuestionBank is required."
    );
  }

  const questions = ensureArray(structuredQuestionBank?.questions);

  const rankedQuestions = questions
    .map((question) => {
      const result = buildQuestionScore({
        interviewContextProfile,
        question
      });

      return {
        key: result.key,
        category: result.category,
        score: result.score,
        reasons: result.reasons
      };
    })
    .sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }

      return a.key.localeCompare(b.key);
    });

  return {
    rankedStructuredQuestions: {
      version: structuredQuestionBank?.version ?? 1,
      interviewContextProfile,
      rankedQuestions
    }
  };
}