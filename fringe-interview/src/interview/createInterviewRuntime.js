function ensureArray(value) {
  return Array.isArray(value) ? value : [];
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function buildTimeline(interviewSession) {
  const timeline = [];

  timeline.push({
    stepType: "opening",
    blockIndex: 0,
    label: "Opening"
  });

  const coreQuestionBlocks = ensureArray(interviewSession?.coreQuestionBlocks);

  coreQuestionBlocks.forEach((block, index) => {
    timeline.push({
      stepType: "core_question",
      blockIndex: index,
      label: block.familyLabel || `Core Question ${index + 1}`
    });
  });

  const followupBlocks = ensureArray(interviewSession?.followupBlocks);

  followupBlocks.forEach((block, index) => {
    timeline.push({
      stepType: "followup_pack",
      blockIndex: index,
      label: block.label || `Follow-up Pack ${index + 1}`
    });
  });

  timeline.push({
    stepType: "closing",
    blockIndex: 0,
    label: "Closing"
  });

  return timeline;
}

function buildInitialState(interviewSession) {
  const timeline = buildTimeline(interviewSession);

  return {
    currentStepIndex: 0,
    timeline,
    answers: [],
    usedAdaptiveTriggerTypes: [],
    isCompleted: timeline.length === 0
  };
}

function buildCurrentStepPayload(interviewSession, runtimeState, adaptiveFollowupBlocks = []) {
  const timeline = ensureArray(runtimeState?.timeline);
  const currentStepIndex = runtimeState?.currentStepIndex ?? 0;
  const currentStep = timeline[currentStepIndex];

  if (!currentStep) {
    return {
      currentStep: null
    };
  }

  if (currentStep.stepType === "opening") {
    return {
      currentStep: {
        stepType: "opening",
        label: currentStep.label,
        payload: clone(interviewSession?.openingBlock || {})
      }
    };
  }

  if (currentStep.stepType === "core_question") {
    const block = ensureArray(interviewSession?.coreQuestionBlocks)[currentStep.blockIndex];

    return {
      currentStep: {
        stepType: "core_question",
        label: currentStep.label,
        payload: clone(block || {})
      }
    };
  }

  if (currentStep.stepType === "followup_pack") {
    const block = ensureArray(interviewSession?.followupBlocks)[currentStep.blockIndex];

    return {
      currentStep: {
        stepType: "followup_pack",
        label: currentStep.label,
        payload: clone(block || {})
      }
    };
  }

  if (currentStep.stepType === "adaptive_followup_pack") {
    const block = ensureArray(adaptiveFollowupBlocks)[currentStep.blockIndex];

    return {
      currentStep: {
        stepType: "adaptive_followup_pack",
        label: currentStep.label,
        payload: clone(block || {})
      }
    };
  }

  if (currentStep.stepType === "closing") {
    return {
      currentStep: {
        stepType: "closing",
        label: currentStep.label,
        payload: clone(interviewSession?.closingBlock || {})
      }
    };
  }

  return {
    currentStep: null
  };
}

export function createInterviewRuntime({ interviewSession }) {
  if (!interviewSession || typeof interviewSession !== "object") {
    throw new Error("createInterviewRuntime: interviewSession is required.");
  }

  const runtimeState = buildInitialState(interviewSession);
  const adaptiveFollowupBlocks = [];
  const currentStepData = buildCurrentStepPayload(
    interviewSession,
    runtimeState,
    adaptiveFollowupBlocks
  );

  return {
    interviewRuntime: {
      sessionSummary: clone(interviewSession?.summary || {}),
      runtimeState,
      adaptiveFollowupBlocks,
      ...currentStepData
    }
  };
}