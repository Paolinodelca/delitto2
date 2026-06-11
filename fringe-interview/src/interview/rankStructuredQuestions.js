import loadQuestionRelevanceMatrix from "./loadQuestionRelevanceMatrix.js";
import evaluateQuestionFamilyRelevance from "./evaluateQuestionFamilyRelevance.js";

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

function inferQuestionFamilyKey(question) {
  const category = normalizeString(question?.category).toLowerCase();
  const key = normalizeString(question?.key).toLowerCase();
  const tags = normalizeStringArray(question?.tags).map((item) => item.toLowerCase());

  // 1. Casi specifici prima del fallback per categoria

  if (key === "motivation_for_change") {
    return "motivation_for_change";
  }

  if (
    key === "pressure_handling" ||
    key === "clarity_under_challenge" ||
    key === "priority_conflict_management" ||
    tags.includes("pressure") ||
    tags.includes("pressure_relevant")
  ) {
    return "conflict_pressure";
  }

  if (
    key === "decision_tradeoffs" ||
    tags.includes("decision") ||
    tags.includes("tradeoff")
  ) {
    return "decision_tradeoff";
  }

  if (
    key === "accountability_examples" ||
    key === "leadership_scope" ||
    tags.includes("ownership")
  ) {
    return "ownership_scope";
  }

  if (
    key === "learning_orientation" ||
    key === "feedback_application" ||
    key === "closing_reflection" ||
    tags.includes("reflection") ||
    tags.includes("learning")
  ) {
    return "learning_reflection";
  }

  if (
    key === "motivation_for_role" ||
    tags.includes("role_interest")
  ) {
    return "opening_positioning";
  }

  if (
    key === "change_trajectory_logic" ||
    key === "transferability_examples" ||
    key === "stakeholder_interaction" ||
    key === "team_contribution_examples" ||
    key === "client_pushback_handling" ||
    key === "expectation_reset"
  ) {
    return "role_fit";
  }

  // 2. Fallback per categoria

  if (category === "role_fit") {
    return "role_fit";
  }

  if (category === "seniority_calibration") {
    return "career_walkthrough";
  }

  if (category === "person_perception") {
    return "ownership_scope";
  }

  if (category === "closing") {
    return "learning_reflection";
  }

  // 3. Default finale
  return "example_concreteness";
}



function buildRoleTraits(interviewContextProfile) {
  const companyContext = normalizeString(interviewContextProfile?.companyContext).toLowerCase();
  const seniorityContext = normalizeString(interviewContextProfile?.seniorityContext).toLowerCase();
  const defaultTone = normalizeString(interviewContextProfile?.defaultTone).toLowerCase();

  return {
    leadership: ["senior", "lead", "executive"].includes(seniorityContext),
    stakeholder_exposure:
      companyContext === "consultancy_client_facing" ||
      companyContext === "client_facing" ||
      companyContext === "cross_functional",
    execution_intensity:
      seniorityContext === "junior" ||
      seniorityContext === "entry" ||
      defaultTone === "pressure"
  };
}

function relevanceBandToScoreAdjustment(band) {
  const clean = normalizeString(band).toLowerCase();

  if (clean === "high") return 3;
  if (clean === "medium") return 1;
  if (clean === "low") return -2;
  if (clean === "off") return -5;

  return 0;
}

function uniqueStrings(items) {
  const seen = new Set();
  const result = [];

  for (const item of ensureArray(items)) {
    const clean = normalizeString(item);

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

function normalizeRecentQuestionHistory(recentQuestionHistory) {
  return ensureArray(recentQuestionHistory)
    .map((item) => {
      if (typeof item === "string") {
        const key = normalizeString(item);
        if (!key) {
          return null;
        }

        return {
          key,
          category: "",
          signals: []
        };
      }

      if (!item || typeof item !== "object") {
        return null;
      }

      const key = normalizeString(item?.key);
      const category = normalizeString(item?.category);
      const signals = normalizeStringArray(item?.signals);

      if (!key && !category && signals.length === 0) {
        return null;
      }

      return {
        key,
        category,
        signals
      };
    })
    .filter(Boolean);
}

function buildRecentHistoryContext({ recentQuestionKeys, recentQuestionHistory }) {
  const normalizedHistory = normalizeRecentQuestionHistory(recentQuestionHistory);

  const keyMap = new Map();
  const categoryMap = new Map();
  const signalMap = new Map();

  for (const key of uniqueStrings(recentQuestionKeys)) {
    const cleanKey = normalizeString(key).toLowerCase();
    if (!cleanKey) {
      continue;
    }

    keyMap.set(cleanKey, (keyMap.get(cleanKey) || 0) + 1);
  }

  for (const item of normalizedHistory) {
    const cleanKey = normalizeString(item?.key).toLowerCase();
    const cleanCategory = normalizeString(item?.category).toLowerCase();
    const cleanSignals = normalizeStringArray(item?.signals).map((signal) =>
      signal.toLowerCase()
    );

    if (cleanKey) {
      keyMap.set(cleanKey, (keyMap.get(cleanKey) || 0) + 1);
    }

    if (cleanCategory) {
      categoryMap.set(cleanCategory, (categoryMap.get(cleanCategory) || 0) + 1);
    }

    for (const signal of cleanSignals) {
      signalMap.set(signal, (signalMap.get(signal) || 0) + 1);
    }
  }

  return {
    normalizedHistory,
    recentKeyCounts: keyMap,
    recentCategoryCounts: categoryMap,
    recentSignalCounts: signalMap
  };
}

function applyRecentUsagePenalty({
  question,
  recentHistoryContext,
  reasons
}) {
  const key = normalizeString(question?.key).toLowerCase();
  const category = normalizeString(question?.category).toLowerCase();
  const signals = normalizeStringArray(question?.signals).map((item) =>
    item.toLowerCase()
  );

  if (!recentHistoryContext) {
    return 0;
  }

  let penalty = 0;

  const sameKeyCount = recentHistoryContext.recentKeyCounts.get(key) || 0;
  if (sameKeyCount > 0) {
    const keyPenalty = Math.min(8, sameKeyCount * 6);
    penalty += keyPenalty;
    reasons.push(`recentKeyPenalty:${sameKeyCount}`);
  }

  const sameCategoryCount = recentHistoryContext.recentCategoryCounts.get(category) || 0;
  if (sameCategoryCount > 0) {
    const categoryPenalty = Math.min(3, sameCategoryCount);
    penalty += categoryPenalty;
    reasons.push(`recentCategoryPenalty:${sameCategoryCount}`);
  }

  let overlappingSignalCount = 0;
  for (const signal of signals) {
    if ((recentHistoryContext.recentSignalCounts.get(signal) || 0) > 0) {
      overlappingSignalCount += 1;
    }
  }

  if (overlappingSignalCount > 0) {
    const signalPenalty = Math.min(3, overlappingSignalCount);
    penalty += signalPenalty;
    reasons.push(`recentSignalPenalty:${overlappingSignalCount}`);
  }

  return penalty;
}

function buildQuestionScore({
  interviewContextProfile,
  question,
  recentHistoryContext,
  questionRelevanceMatrix
}) {

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

    const familyKey = inferQuestionFamilyKey(question);
   const relevanceResult = evaluateQuestionFamilyRelevance({
    matrix: questionRelevanceMatrix,
    familyKey,
    seniority: seniorityContext,
    roleTraits: buildRoleTraits(interviewContextProfile)
    });

  const relevanceAdjustment = relevanceBandToScoreAdjustment(relevanceResult?.band);
  score += relevanceAdjustment;
  reasons.push(`relevanceFamily:${familyKey}`);
  reasons.push(`relevanceBand:${relevanceResult?.band || "unknown"}`);


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

  const recentUsagePenalty = applyRecentUsagePenalty({
    question,
    recentHistoryContext,
    reasons
  });

  score -= recentUsagePenalty;

  return {
    key: normalizeString(question?.key),
    category: normalizeString(question?.category),
    score,
    reasons
  };
}

export function rankStructuredQuestions({
  interviewContextProfile,
  structuredQuestionBank,
  recentQuestionKeys = [],
  recentQuestionHistory = []
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
  const recentHistoryContext = buildRecentHistoryContext({
    recentQuestionKeys,
    recentQuestionHistory
  });
  const questionRelevanceMatrix = loadQuestionRelevanceMatrix();

  const rankedQuestions = questions
    .map((question) => {
        const result = buildQuestionScore({
        interviewContextProfile,
        question,
        recentHistoryContext,
        questionRelevanceMatrix
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
      recentQuestionKeys: uniqueStrings(recentQuestionKeys),
      recentQuestionHistory: recentHistoryContext.normalizedHistory,
      rankedQuestions
    }
  };
}