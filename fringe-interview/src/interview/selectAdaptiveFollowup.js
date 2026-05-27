import { loadInterviewStyles } from "./loadInterviewStyles.js";

function ensureArray(value) {
  return Array.isArray(value) ? value : [];
}

function normalizeString(value) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

function getDimensionScore(answerRecord, key) {
  const value =
    answerRecord?.answerAnalysis?.answerShapeAnalysis?.dimensionScores?.[key];

  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  return null;
}

function getOverallBand(answerRecord) {
  return (
    answerRecord?.answerAnalysis?.answerShapeAnalysis?.overallBand || "medium"
  );
}

function getQuestionAlignment(answerRecord) {
  return getDimensionScore(answerRecord, "questionAlignment");
}

function getOffTopicRisk(answerRecord) {
  return normalizeString(
    answerRecord?.answerAnalysis?.answerShapeAnalysis?.questionContext?.offTopicRisk
  ).toLowerCase();
}

function getProblematicAnswerType(answerRecord) {
  return normalizeString(
    answerRecord?.answerAnalysis?.answerShapeAnalysis?.problematicAnswerType
  ).toLowerCase();
}

function preferredTriggerByMisalignment(answerRecord, phaseName = "") {
  const questionAlignment = getQuestionAlignment(answerRecord);
  const offTopicRisk = getOffTopicRisk(answerRecord);
  const problematicType = getProblematicAnswerType(answerRecord);

  const cleanPhase = normalizeString(phaseName).toUpperCase();

if (
  cleanPhase === "DECISION_PROBE" &&
  problematicType !== "off_topic" &&
  problematicType !== "evasive" &&
  offTopicRisk !== "high"
) {
  return "";
}

  if (
    problematicType === "off_topic" ||
    problematicType === "evasive" ||
    offTopicRisk === "high" ||
    (questionAlignment !== null && questionAlignment < 45)
  ) {
    return "consistency_probe";
  }

  return "";
}

function preferredTriggerByPhase(phaseName) {
  switch (phaseName) {
    case "WALKTHROUGH":
      return "responsibility_probe";
    case "ROLE_CONTEXT":
      return "transferability_probe";
    case "CASE_1":
      return "achievement_quantification";
    case "DECISION_PROBE":
      return "decision_tradeoff_probe";
    case "PRESSURE_PROBE":
      return "stakeholder_examples";
    case "DEPTH_CHECK":
      return "consistency_probe";
    default:
      return "";
  }
}

function preferredTriggerByFamily(currentFamilyKey) {
  switch (currentFamilyKey) {
    case "stakeholder_management":
      return "stakeholder_examples";
    case "transferability":
      return "transferability_probe";
    case "ownership_scope":
      return "responsibility_probe";
    case "analytical_depth":
      return "achievement_quantification";
    case "decision_making":
      return "decision_tradeoff_probe";
    case "conflict_management":
      return "stakeholder_examples";
    default:
      return "";
  }
}

function preferredTriggerByDimensions(answerRecord, phaseName) {
  const ownership = getDimensionScore(answerRecord, "ownership");
  const evidence = getDimensionScore(answerRecord, "evidence");
  const specificity = getDimensionScore(answerRecord, "specificity");
  const structure = getDimensionScore(answerRecord, "structure");
  const reflection = getDimensionScore(answerRecord, "reflection");
  const overallBand = getOverallBand(answerRecord);




  if (phaseName === "DECISION_PROBE") {
    return "decision_tradeoff_probe";
  }

  if (phaseName === "PRESSURE_PROBE") {
    return "stakeholder_examples";
  }

  if (ownership !== null && ownership < 45) {
    return "responsibility_probe";
  }

  if (evidence !== null && evidence < 45) {
    return "achievement_quantification";
  }

  if (specificity !== null && specificity < 45) {
    return "stakeholder_examples";
  }

  if (structure !== null && structure < 45) {
    return "achievement_quantification";
  }

  if (reflection !== null && reflection < 35) {
    return "transferability_probe";
  }

  if (overallBand === "weak") {
    return "achievement_quantification";
  }

  return "";
}

function findAvailablePackByTrigger(sessionFollowupBlocks, usedAdaptiveTriggerTypes, triggerType) {
  if (!triggerType) {
    return null;
  }

  return (
    ensureArray(sessionFollowupBlocks).find((pack) => {
      const currentTrigger = normalizeString(pack?.triggerType);

      if (!currentTrigger) {
        return false;
      }

      if (usedAdaptiveTriggerTypes.includes(currentTrigger)) {
        return false;
      }

      return currentTrigger === triggerType;
    }) || null
  );
}

function findAvailablePackByKeyword(sessionFollowupBlocks, usedAdaptiveTriggerTypes, keywords) {
  if (!ensureArray(keywords).length) {
    return null;
  }

  return (
    ensureArray(sessionFollowupBlocks).find((pack) => {
      const triggerType = normalizeString(pack?.triggerType).toLowerCase();
      const label = normalizeString(pack?.label).toLowerCase();

      if (!triggerType) {
        return false;
      }

      if (usedAdaptiveTriggerTypes.includes(pack?.triggerType)) {
        return false;
      }

      return keywords.some((keyword) => {
        const normalizedKeyword = normalizeString(keyword).toLowerCase();

        return (
          triggerType.includes(normalizedKeyword) || label.includes(normalizedKeyword)
        );
      });
    }) || null
  );
}

function findFirstUnusedPack(sessionFollowupBlocks, usedAdaptiveTriggerTypes) {
  return (
    ensureArray(sessionFollowupBlocks).find((pack) => {
      const triggerType = normalizeString(pack?.triggerType);

      if (!triggerType) {
        return false;
      }

      return !usedAdaptiveTriggerTypes.includes(triggerType);
    }) || null
  );
}

function getStylePreferredTriggers(interviewRuntime) {
  const interviewStyle = normalizeString(
    interviewRuntime?.meta?.interviewStyle
  );

  if (!interviewStyle) {
    return [];
  }

  const styles = loadInterviewStyles();

  const styleConfig = styles?.[interviewStyle];

  return ensureArray(styleConfig?.preferredFollowupTypes);
}

export function selectAdaptiveFollowup({
  interviewRuntime,
  currentStep,
  answerRecord
}) {
  if (!interviewRuntime || typeof interviewRuntime !== "object") {
    throw new Error("selectAdaptiveFollowup: interviewRuntime is required.");
  }

  if (!currentStep || typeof currentStep !== "object") {
    throw new Error("selectAdaptiveFollowup: currentStep is required.");
  }

  if (!answerRecord || typeof answerRecord !== "object") {
    throw new Error("selectAdaptiveFollowup: answerRecord is required.");
  }

  const sessionFollowupBlocks = ensureArray(interviewRuntime?.sessionFollowupBlocks);
  const usedAdaptiveTriggerTypes = ensureArray(
    interviewRuntime?.runtimeState?.usedAdaptiveTriggerTypes
  );

  if (sessionFollowupBlocks.length === 0) {
    return null;
  }

  const currentFamilyKey = normalizeString(currentStep?.payload?.familyKey);
  const phaseName =
    normalizeString(currentStep?.phaseName) ||
    normalizeString(interviewRuntime?.runtimeState?.interviewState?.phaseName) ||
    "CASE_1";


  const stylePreferredTriggers =
  getStylePreferredTriggers(interviewRuntime);

  const phasePreferred = preferredTriggerByPhase(phaseName);
  const familyPreferred = preferredTriggerByFamily(currentFamilyKey);
  const dimensionPreferred = preferredTriggerByDimensions(answerRecord, phaseName);

  const misalignmentPreferred =
  preferredTriggerByMisalignment(answerRecord, phaseName);

const misalignmentPack = findAvailablePackByTrigger(
  sessionFollowupBlocks,
  usedAdaptiveTriggerTypes,
  misalignmentPreferred
);

if (misalignmentPack) {
  return misalignmentPack;
}

  for (const triggerType of stylePreferredTriggers) {
  const stylePack = findAvailablePackByTrigger(
    sessionFollowupBlocks,
    usedAdaptiveTriggerTypes,
    triggerType
  );

  if (stylePack) {
    return stylePack;
  }
}

  const phasePack = findAvailablePackByTrigger(
    sessionFollowupBlocks,
    usedAdaptiveTriggerTypes,
    phasePreferred
  );

  if (phasePack) {
    return phasePack;
  }

  const familyPack = findAvailablePackByTrigger(
    sessionFollowupBlocks,
    usedAdaptiveTriggerTypes,
    familyPreferred
  );

  if (familyPack) {
    return familyPack;
  }

  const dimensionPack = findAvailablePackByTrigger(
    sessionFollowupBlocks,
    usedAdaptiveTriggerTypes,
    dimensionPreferred
  );

  if (dimensionPack) {
    return dimensionPack;
  }

  const keywordFallbackMap = {
    WALKTHROUGH: ["responsibility", "ownership"],
    ROLE_CONTEXT: ["transfer", "role", "fit"],
    CASE_1: ["achievement", "example", "evidence"],
    DECISION_PROBE: ["decision", "tradeoff", "priorit"],
    PRESSURE_PROBE: ["stakeholder", "conflict", "pushback"],
    DEPTH_CHECK: ["consistency", "second", "another"]
  };

  const keywordPack = findAvailablePackByKeyword(
    sessionFollowupBlocks,
    usedAdaptiveTriggerTypes,
    keywordFallbackMap[phaseName] || []
  );

  if (keywordPack) {
    return keywordPack;
  }

  return findFirstUnusedPack(sessionFollowupBlocks, usedAdaptiveTriggerTypes);
}