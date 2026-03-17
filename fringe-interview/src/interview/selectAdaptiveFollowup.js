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
    default:
      return "";
  }
}

function preferredTriggerByDimensions(answerRecord) {
  const ownership = getDimensionScore(answerRecord, "ownership");
  const evidence = getDimensionScore(answerRecord, "evidence");
  const specificity = getDimensionScore(answerRecord, "specificity");
  const structure = getDimensionScore(answerRecord, "structure");
  const reflection = getDimensionScore(answerRecord, "reflection");
  const overallBand = getOverallBand(answerRecord);

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

  const familyPreferred = preferredTriggerByFamily(currentFamilyKey);
  const dimensionPreferred = preferredTriggerByDimensions(answerRecord);

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

  return findFirstUnusedPack(sessionFollowupBlocks, usedAdaptiveTriggerTypes);
}