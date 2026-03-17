function ensureArray(value) {
  return Array.isArray(value) ? value : [];
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function buildAdaptiveStepFromFollowupPack(pack, adaptiveIndex) {
  return {
    stepType: "adaptive_followup_pack",
    blockIndex: adaptiveIndex,
    label: pack?.label || `Adaptive Follow-up ${adaptiveIndex + 1}`,
    triggerType: pack?.triggerType || "",
    injected: true
  };
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

  const triggerType = followupPack?.triggerType || "";

  if (
    triggerType &&
    runtime.runtimeState.usedAdaptiveTriggerTypes.includes(triggerType)
  ) {
    return runtime;
  }

  const adaptiveIndex = runtime.adaptiveFollowupBlocks.length;

  runtime.adaptiveFollowupBlocks.push(clone(followupPack));

  const adaptiveStep = buildAdaptiveStepFromFollowupPack(
    followupPack,
    adaptiveIndex
  );

  const insertionIndex = (runtime.runtimeState.currentStepIndex ?? 0) + 1;
  runtime.runtimeState.timeline.splice(insertionIndex, 0, adaptiveStep);

  if (triggerType) {
    runtime.runtimeState.usedAdaptiveTriggerTypes.push(triggerType);
  }

  return runtime;
}