import { loadProductInterviewModes } from "./loadProductInterviewModes.js";
import { resolveProductCapabilities } from "./resolveProductCapabilities.js";



function ensureArray(value) {
  return Array.isArray(value) ? value : [];
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

const PHASE_SEQUENCE = [
  "OPENING",
  "WALKTHROUGH",
  "ROLE_CONTEXT",
  "CASE_1",
  "DECISION_PROBE",
  "PRESSURE_PROBE",
  "DEPTH_CHECK",
  "CLOSING"
];

const PHASE_CONFIG = {
  OPENING: {
  label: "Racconto del percorso",
  pressureLevel: 0,
  frictionType: "career_walkthrough",
  maxAttempts: 1,
  targetSignals: [
    "timeline",
    "ownership",
    "responsibility",
    "role_relevance",
    "specificity",
    "evidence"
  ]
},


  WALKTHROUGH: {
    label: "Walkthrough",
    pressureLevel: 1,
    frictionType: "narrative_clarity",
    maxAttempts: 2,
    targetSignals: ["ownership", "timeline", "specificity"]
  },
  ROLE_CONTEXT: {
    label: "Role Context",
    pressureLevel: 1,
    frictionType: "role_alignment",
    maxAttempts: 2,
    targetSignals: ["role_understanding", "context_awareness"]
  },
  CASE_1: {
    label: "Case 1",
    pressureLevel: 2,
    frictionType: "evidence_request",
    maxAttempts: 2,
    targetSignals: ["concrete_example", "evidence"]
  },
  DECISION_PROBE: {
    label: "Decision Probe",
    pressureLevel: 3,
    frictionType: "tradeoff_pressure",
    maxAttempts: 2,
    targetSignals: ["decision", "tradeoff", "consequences"]
  },
  PRESSURE_PROBE: {
    label: "Pressure Probe",
    pressureLevel: 4,
    frictionType: "conflict_resistance",
    maxAttempts: 2,
    targetSignals: ["conflict", "assertiveness", "stakeholder_management"]
  },
  DEPTH_CHECK: {
    label: "Depth Check",
    pressureLevel: 4,
    frictionType: "consistency_stress",
    maxAttempts: 2,
    targetSignals: ["consistency", "repeatability", "authenticity"]
  },
  CLOSING: {
    label: "Closing",
    pressureLevel: 1,
    frictionType: "final_positioning",
    maxAttempts: 1,
    targetSignals: ["final_signal"]
  }
};

function normalizeString(value) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

function containsAny(text, keywords) {
  const lowerText = normalizeString(text).toLowerCase();

  if (!lowerText) {
    return false;
  }

  return keywords.some((keyword) => lowerText.includes(keyword));
}

function resolveInterviewLengthMode(interviewSession) {
  const summary = interviewSession?.summary || {};

  const candidates = [
    summary?.contextualInterviewLengthMode,
    summary?.interviewLengthMode
  ]
    .map(normalizeString)
    .filter(Boolean);

  return candidates[0] || "standard";
}


function getAdaptiveFollowupBudgetForMode(mode) {
  const cleanMode = normalizeString(mode).toLowerCase();

  if (cleanMode === "quick" || cleanMode === "short") {
    return 1;
  }

  if (cleanMode === "deep") {
    return 6;
  }

  if (cleanMode === "standard") {
    return 3;
  }

  return 3;
}

function mapNarrativeRoleToPhase(narrativeRole) {
  const clean = normalizeString(narrativeRole).toUpperCase();

  if (!clean) {
    return "";
  }

  if (PHASE_SEQUENCE.includes(clean)) {
    return clean;
  }

  if (clean === "ROLE_CONTEXT") {
    return "ROLE_CONTEXT";
  }

  if (clean === "CASE_1") {
    return "CASE_1";
  }

  if (clean === "DECISION_PROBE") {
    return "DECISION_PROBE";
  }

  if (clean === "PRESSURE_PROBE") {
    return "PRESSURE_PROBE";
  }

  if (clean === "DEPTH_CHECK") {
    return "DEPTH_CHECK";
  }

  if (clean === "WALKTHROUGH") {
    return "WALKTHROUGH";
  }

  return "";
}

function inferPhaseFromFamily(block) {
  const familyKey = normalizeString(block?.familyKey).toLowerCase();
  const familyLabel = normalizeString(block?.familyLabel).toLowerCase();
  const objective = normalizeString(block?.objective).toLowerCase();
  const question = normalizeString(block?.question).toLowerCase();
  const interviewerIntent = normalizeString(block?.interviewerIntent).toLowerCase();
  const displayLabel = normalizeString(block?.displayLabel).toLowerCase();

  const combined = `${familyKey} ${familyLabel} ${objective} ${question} ${interviewerIntent} ${displayLabel}`.trim();

  if (
    containsAny(combined, [
      "walkthrough",
      "career journey",
      "background",
      "cv",
      "experience overview",
      "percorso"
    ])
  ) {
    return "WALKTHROUGH";
  }

  if (
    containsAny(combined, [
      "transferability",
      "target role",
      "transition",
      "role fit",
      "motivation",
      "context",
      "aderenza al ruolo",
      "role_context"
    ])
  ) {
    return "ROLE_CONTEXT";
  }

  if (
    containsAny(combined, [
      "project",
      "example",
      "achievement",
      "analytical depth",
      "analysis task",
      "reporting",
      "caso concreto",
      "case_probe"
    ])
  ) {
    return "CASE_1";
  }

  if (
    containsAny(combined, [
      "decide",
      "decision",
      "trade-off",
      "tradeoff",
      "prioritize",
      "which metrics really matter",
      "decisione",
      "decision_probe"
    ])
  ) {
    return "DECISION_PROBE";
  }

  if (
    containsAny(combined, [
      "conflict",
      "stakeholder",
      "pushback",
      "pressure",
      "attrito",
      "pressione",
      "pressure_probe"
    ])
  ) {
    return "PRESSURE_PROBE";
  }

  if (
    containsAny(combined, [
      "second example",
      "another example",
      "consistency",
      "depth check",
      "verification",
      "verifica profondità",
      "depth_check"
    ])
  ) {
    return "DEPTH_CHECK";
  }

  return "";
}

function inferPhaseBySequence(block, index, totalCoreQuestions) {
  const narrativeRolePhase = mapNarrativeRoleToPhase(block?.narrativeRole);

  if (narrativeRolePhase) {
    return narrativeRolePhase;
  }

  const familyPhase = inferPhaseFromFamily(block);

  if (familyPhase) {
    return familyPhase;
  }

  if (totalCoreQuestions <= 0) {
    return "CASE_1";
  }

  if (totalCoreQuestions === 1) {
    return "CASE_1";
  }

  if (totalCoreQuestions === 2) {
    return index === 0 ? "ROLE_CONTEXT" : "CASE_1";
  }

  if (totalCoreQuestions === 3) {
    if (index === 0) {
      return "ROLE_CONTEXT";
    }

    if (index === 1) {
      return "CASE_1";
    }

    return "DECISION_PROBE";
  }

  if (totalCoreQuestions === 4) {
    if (index === 0) {
      return "ROLE_CONTEXT";
    }

    if (index === 1) {
      return "CASE_1";
    }

    if (index === 2) {
      return "DECISION_PROBE";
    }

    return "DEPTH_CHECK";
  }

  const ratio = (index + 1) / totalCoreQuestions;

  if (ratio <= 0.2) {
    return "WALKTHROUGH";
  }

  if (ratio <= 0.35) {
    return "ROLE_CONTEXT";
  }

  if (ratio <= 0.58) {
    return "CASE_1";
  }

  if (ratio <= 0.76) {
    return "DECISION_PROBE";
  }

  if (ratio <= 0.9) {
    return "PRESSURE_PROBE";
  }

  return "DEPTH_CHECK";
}

function buildTimeline(interviewSession) {
  const timeline = [];

  timeline.push({
    stepType: "opening",
    blockIndex: 0,
    label: "Opening",
    phaseName: "OPENING"
  });

  const coreQuestionBlocks = ensureArray(interviewSession?.coreQuestionBlocks);
  const totalCoreQuestions = coreQuestionBlocks.length;

  coreQuestionBlocks.forEach((block, index) => {
    timeline.push({
      stepType: "core_question",
      blockIndex: index,
      label:
        block?.displayLabel ||
        block?.familyLabel ||
        block?.label ||
        `Core Question ${index + 1}`,
      phaseName: inferPhaseBySequence(block, index, totalCoreQuestions)
    });
  });

  timeline.push({
    stepType: "closing",
    blockIndex: 0,
    label: "Closing",
    phaseName: "CLOSING"
  });

  return timeline;
}

function buildPhaseLedger() {
  return PHASE_SEQUENCE.reduce((accumulator, phaseName) => {
    accumulator[phaseName] = {
      status: phaseName === "OPENING" ? "active" : "pending",
      attempts: 0,
      completedBy: null,
      lastStepLabel: "",
      notes: []
    };

    return accumulator;
  }, {});
}

function buildCoverage() {
  return {
    walkthrough: false,
    roleContext: false,
    case1: false,
    decision: false,
    pressure: false,
    depth: false,
    closing: false
  };
}

function buildEvaluationFocus() {
  return {
    decision: false,
    synthesis: false,
    conflict: false
  };
}

function buildInitialState({
  interviewSession,
  scenarioType = "interview",
  inputMode = "text",
  uiLocale = "it",
  sessionLocale = "it",
  interviewStyle = "structured_corporate",
  interviewDepth = "standard",
  interviewIntent = "simulation",
  productCapabilities = {}
}) {


  const timeline = buildTimeline(interviewSession);
  const firstPhaseName = timeline[0]?.phaseName || "OPENING";
  
  
  const resolvedInterviewLengthMode = resolveInterviewLengthMode(interviewSession);

const resolvedInterviewDepth =
  normalizeString(interviewDepth) ||
  resolvedInterviewLengthMode ||
  "standard";

const adaptiveFollowupBudget = getAdaptiveFollowupBudgetForMode(
  resolvedInterviewDepth
);

  return {
    currentStepIndex: 0,
    timeline,
    answers: [],
    usedAdaptiveTriggerTypes: [],
    adaptiveFollowupBudget,
    injectedAdaptiveFollowupCount: 0,
    resolvedInterviewLengthMode,
    resolvedInterviewDepth,
    isCompleted: timeline.length === 0,
    interviewState: {
      context: {
        scenarioType,
        inputMode,
        uiLocale,
        sessionLocale,
        interviewStyle,
        interviewDepth,
        productCapabilities: clone(productCapabilities),
        interviewIntent
      },
      phaseName: firstPhaseName,
      phaseIndex: 0,
      pressureLevel: PHASE_CONFIG[firstPhaseName]?.pressureLevel || 0,
      frictionType: PHASE_CONFIG[firstPhaseName]?.frictionType || "",
      targetSignals: clone(PHASE_CONFIG[firstPhaseName]?.targetSignals || []),
      observedSignals: [],
      deviationFlags: [],
      coverage: buildCoverage(),
      evaluationFocus: buildEvaluationFocus(),
      phaseLedger: buildPhaseLedger()
    }
  };
}

function buildAdaptiveFollowupPayload(block, currentStep) {
  const safeBlock = clone(block || {});
  const followups = ensureArray(safeBlock?.followups)
    .map((item) => normalizeString(item))
    .filter(Boolean);

  const questionText =
    followups[0] ||
    normalizeString(safeBlock?.goal) ||
    normalizeString(currentStep?.label);

  return {
    ...safeBlock,
    question: questionText,
    prompt: questionText,
    questionKey:
      normalizeString(safeBlock?.triggerType) ||
      normalizeString(currentStep?.triggerType) ||
      "adaptive_followup",
    familyKey:
      normalizeString(safeBlock?.triggerType) ||
      normalizeString(currentStep?.triggerType) ||
      "adaptive_followup",
    familyLabel:
      normalizeString(safeBlock?.label) ||
      normalizeString(currentStep?.label) ||
      "Adaptive Follow-up",
    expectedSignals: ensureArray(safeBlock?.expectedSignals)
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
        phaseName: currentStep.phaseName,
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
        phaseName: currentStep.phaseName,
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
        phaseName:
          currentStep.phaseName ||
          runtimeState?.interviewState?.phaseName ||
          "CASE_1",
        payload: buildAdaptiveFollowupPayload(block, currentStep)
      }
    };
  }

  if (currentStep.stepType === "closing") {
    return {
      currentStep: {
        stepType: "closing",
        label: currentStep.label,
        phaseName: currentStep.phaseName,
        payload: clone(interviewSession?.closingBlock || {})
      }
    };
  }

  return {
    currentStep: null
  };
}

export function createInterviewRuntime({
  interviewSession,
  scenarioType = "interview",
  inputMode = "text",
  uiLocale = "it",
  sessionLocale = "it",
  jobFitAnalysis = null,
  locale = { code: "it" },
  productMode = "pro",
  interviewStyle = "",
  interviewDepth = "",
  interviewIntent = ""
}) {
  if (!interviewSession || typeof interviewSession !== "object") {
    throw new Error("createInterviewRuntime: interviewSession is required.");
  }

  const productModes = loadProductInterviewModes();

  const resolvedProductMode =
    normalizeString(productMode).toLowerCase() || "pro";

  const productConfig =
    productModes?.[resolvedProductMode] || productModes?.pro || {};

  const resolvedProductPolicy =
    resolveProductCapabilities(resolvedProductMode);

  const productCapabilities =
    resolvedProductPolicy?.capabilities || {};

  const resolvedInterviewStyle =
    normalizeString(interviewStyle) ||
    normalizeString(productConfig?.defaultInterviewStyle) ||
    "structured_corporate";

  const resolvedInterviewDepth =
    normalizeString(interviewDepth) ||
    normalizeString(productConfig?.interviewDepth) ||
    "standard";

  const resolvedInterviewIntent =
    normalizeString(interviewIntent) ||
    normalizeString(productConfig?.interviewIntent) ||
    "simulation";

  const runtimeState = buildInitialState({
    interviewSession,
    scenarioType,
    inputMode,
    uiLocale,
    sessionLocale,
    interviewStyle: resolvedInterviewStyle,
    interviewDepth: resolvedInterviewDepth,
    interviewIntent: resolvedInterviewIntent,
    productCapabilities
  });

  const adaptiveFollowupBlocks = [];

  const currentStepData = buildCurrentStepPayload(
    interviewSession,
    runtimeState,
    adaptiveFollowupBlocks
  );

  return {
    interviewRuntime: {
      sessionSummary: {
        ...clone(interviewSession?.summary || {}),
        productMode: resolvedProductMode,
        interviewStyle: resolvedInterviewStyle,
        interviewDepth: resolvedInterviewDepth,
        interviewIntent: resolvedInterviewIntent,
        productCapabilities: clone(productCapabilities)
      },

      sessionFollowupBlocks: clone(interviewSession?.followupBlocks || []),
      runtimeState,
      adaptiveFollowupBlocks,

      meta: {
        inputMode,
        productMode: resolvedProductMode,
        interviewStyle: resolvedInterviewStyle,
        interviewDepth: resolvedInterviewDepth,
        interviewIntent: resolvedInterviewIntent,
        productCapabilities: clone(productCapabilities),
        locale: clone(locale || { code: sessionLocale || "it" }),
        jobFitAnalysis: clone(jobFitAnalysis || null)
      },

      ...currentStepData
    }
  };
}