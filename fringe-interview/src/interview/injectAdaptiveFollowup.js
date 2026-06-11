function ensureArray(value) {
  return Array.isArray(value) ? value : [];
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function normalizeString(value) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

function buildAdaptiveStepFromFollowupPack(pack, adaptiveIndex, phaseName) {
  return {
    stepType: "adaptive_followup_pack",
    blockIndex: adaptiveIndex,
    label: pack?.label || `Adaptive Follow-up ${adaptiveIndex + 1}`,
    triggerType: pack?.triggerType || "",
    phaseName: normalizeString(phaseName) || "CASE_1",
    injected: true
  };
}

function hasAdjacentInjectedStep(timeline, insertionIndex, triggerType, phaseName) {
  const nextStep = ensureArray(timeline)[insertionIndex];

  if (!nextStep || nextStep.stepType !== "adaptive_followup_pack") {
    return false;
  }

  const sameTrigger =
    normalizeString(nextStep?.triggerType) &&
    normalizeString(nextStep?.triggerType) === normalizeString(triggerType);

  const samePhase =
    normalizeString(nextStep?.phaseName) === normalizeString(phaseName);

  return Boolean(sameTrigger || samePhase);
}

function resolveInterviewLengthMode(interviewRuntime) {
  const candidates = [
    interviewRuntime?.sessionSummary?.contextualInterviewLengthMode,
    interviewRuntime?.summary?.contextualInterviewLengthMode,
    interviewRuntime?.runtimeState?.sessionSummary?.contextualInterviewLengthMode,
    interviewRuntime?.meta?.interviewLengthMode,
    interviewRuntime?.interviewLengthMode
  ]
    .map(normalizeString)
    .filter(Boolean);

  return candidates[0] || "standard";
}

function getAdaptiveFollowupBudgetForMode(mode) {
  const cleanMode = normalizeString(mode).toLowerCase();

  if (cleanMode === "short") {
    return 1;
  }

  if (cleanMode === "deep") {
    return 3;
  }

  return 2;
}

function countInjectedAdaptiveSteps(runtime) {
  return ensureArray(runtime?.runtimeState?.timeline).filter(
    (step) => step?.stepType === "adaptive_followup_pack"
  ).length;
}

export function injectAdaptiveFollowup({
  interviewRuntime,
  followupPack
}) {
  if (!interviewRuntime || typeof interviewRuntime !== "object") {
    throw new Error("injectAdaptiveFollowup: interviewRuntime is required.");
  }

  if (!followupPack || typeof followupPack !== "object") {
    throw new Error("injectAdaptiveFollowup: followupPack is required.");
  }

  const runtime = clone(interviewRuntime);

  if (!runtime.runtimeState || typeof runtime.runtimeState !== "object") {
    throw new Error("injectAdaptiveFollowup: runtimeState is missing.");
  }

  if (!ensureArray(runtime.adaptiveFollowupBlocks).length) {
    runtime.adaptiveFollowupBlocks = [];
  }

  if (!ensureArray(runtime.runtimeState.usedAdaptiveTriggerTypes).length) {
    runtime.runtimeState.usedAdaptiveTriggerTypes = [];
  }

  const interviewLengthMode = resolveInterviewLengthMode(runtime);
  const adaptiveFollowupBudget = getAdaptiveFollowupBudgetForMode(interviewLengthMode);
  const alreadyInjectedAdaptiveCount = countInjectedAdaptiveSteps(runtime);

  if (alreadyInjectedAdaptiveCount >= adaptiveFollowupBudget) {
    return runtime;
  }

  const triggerType = normalizeString(followupPack?.triggerType);
  const currentStepIndex = runtime.runtimeState.currentStepIndex ?? 0;
  const currentTimelineStep =
    ensureArray(runtime.runtimeState.timeline)[currentStepIndex] || null;
  const currentPhaseName =
    normalizeString(currentTimelineStep?.phaseName) ||
    normalizeString(runtime.runtimeState?.interviewState?.phaseName) ||
    "CASE_1";

  if (
    triggerType &&
    runtime.runtimeState.usedAdaptiveTriggerTypes.includes(triggerType)
  ) {
    return runtime;
  }

  const insertionIndex = currentStepIndex + 1;

  if (
    hasAdjacentInjectedStep(
      runtime.runtimeState.timeline,
      insertionIndex,
      triggerType,
      currentPhaseName
    )
  ) {
    return runtime;
  }

  const adaptiveIndex = runtime.adaptiveFollowupBlocks.length;

  runtime.adaptiveFollowupBlocks.push(clone(followupPack));

  const adaptiveStep = buildAdaptiveStepFromFollowupPack(
    followupPack,
    adaptiveIndex,
    currentPhaseName
  );

  runtime.runtimeState.timeline.splice(insertionIndex, 0, adaptiveStep);

  if (triggerType) {
    runtime.runtimeState.usedAdaptiveTriggerTypes.push(triggerType);
  }

  runtime.runtimeState.adaptiveFollowupBudget = adaptiveFollowupBudget;
  runtime.runtimeState.injectedAdaptiveFollowupCount = alreadyInjectedAdaptiveCount + 1;
  runtime.runtimeState.resolvedInterviewLengthMode = interviewLengthMode;

  return runtime;
}