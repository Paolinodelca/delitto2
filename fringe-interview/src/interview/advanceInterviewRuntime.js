import { analyzeAnswerShape } from "./analyzeAnswerShape.js";
import { injectAdaptiveFollowup } from "./injectAdaptiveFollowup.js";
import { selectAdaptiveFollowup } from "./selectAdaptiveFollowup.js";

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

function buildAnswerRecord({ currentStep, answerText }) {
  const answerAnalysis = analyzeAnswerShape({ answerText });

  return {
    stepType: currentStep?.stepType || "unknown",
    label: currentStep?.label || "",
    answerText,
    answerAnalysis,
    timestamp: new Date().toISOString()
  };
}

function shouldInjectAdaptiveFollowup(currentStep, answerRecord) {
  if (currentStep?.stepType !== "core_question") {
    return false;
  }

  const overallBand =
    answerRecord?.answerAnalysis?.answerShapeAnalysis?.overallBand || "medium";

  const ownership =
    answerRecord?.answerAnalysis?.answerShapeAnalysis?.dimensionScores?.ownership;

  const evidence =
    answerRecord?.answerAnalysis?.answerShapeAnalysis?.dimensionScores?.evidence;

  const specificity =
    answerRecord?.answerAnalysis?.answerShapeAnalysis?.dimensionScores?.specificity;

  const structure =
    answerRecord?.answerAnalysis?.answerShapeAnalysis?.dimensionScores?.structure;

  if (overallBand === "weak") {
    return true;
  }

  if (typeof ownership === "number" && ownership < 45) {
    return true;
  }

  if (typeof evidence === "number" && evidence < 45) {
    return true;
  }

  if (typeof specificity === "number" && specificity < 40) {
    return true;
  }

  if (typeof structure === "number" && structure < 40) {
    return true;
  }

  return false;
}

function maybeInjectAdaptiveFollowup({
  runtime,
  currentStep,
  answerRecord
}) {
  if (!shouldInjectAdaptiveFollowup(currentStep, answerRecord)) {
    return runtime;
  }

  const followupPack = selectAdaptiveFollowup({
    interviewRuntime: runtime,
    currentStep,
    answerRecord
  });

  if (!followupPack) {
    return runtime;
  }

  return injectAdaptiveFollowup({
    interviewRuntime: runtime,
    followupPack
  });
}

export function advanceInterviewRuntime({
  interviewSession,
  interviewRuntime,
  answerText = ""
}) {
  if (!interviewSession || typeof interviewSession !== "object") {
    throw new Error("advanceInterviewRuntime: interviewSession is required.");
  }

  if (!interviewRuntime || typeof interviewRuntime !== "object") {
    throw new Error("advanceInterviewRuntime: interviewRuntime is required.");
  }

  let runtime = clone(interviewRuntime);
  const runtimeState = runtime?.runtimeState;

  if (!runtimeState || typeof runtimeState !== "object") {
    throw new Error("advanceInterviewRuntime: runtimeState is missing.");
  }

  if (runtimeState.isCompleted) {
    return {
      interviewRuntime: runtime
    };
  }

  const currentStep = runtime?.currentStep || null;
  const cleanAnswerText = normalizeString(answerText);

  if (currentStep && cleanAnswerText) {
    const answerRecord = buildAnswerRecord({
      currentStep,
      answerText: cleanAnswerText
    });

    runtimeState.answers.push(answerRecord);

    runtime = maybeInjectAdaptiveFollowup({
      runtime,
      currentStep,
      answerRecord
    });
  }

  runtime.runtimeState.currentStepIndex += 1;

  if (runtime.runtimeState.currentStepIndex >= ensureArray(runtime.runtimeState.timeline).length) {
    runtime.runtimeState.isCompleted = true;
    runtime.currentStep = null;
    return {
      interviewRuntime: runtime
    };
  }

  const nextStepData = buildCurrentStepPayload(
    interviewSession,
    runtime.runtimeState,
    runtime.adaptiveFollowupBlocks
  );

  runtime.currentStep = nextStepData.currentStep || null;

  return {
    interviewRuntime: runtime
  };
}