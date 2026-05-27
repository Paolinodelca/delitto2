import { analyzeAnswerShape } from "./analyzeAnswerShape.js";
import { injectAdaptiveFollowup } from "./injectAdaptiveFollowup.js";
import { selectAdaptiveFollowup } from "./selectAdaptiveFollowup.js";
import { generateAdaptiveFollowupQuestion } from "./generateAdaptiveFollowupQuestion.js";
import { detectProblematicAnswerType } from "./detectProblematicAnswerType.js";



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
    pressureLevel: 1,
    frictionType: "narrative_clarity",
    maxAttempts: 2,
    targetSignals: ["ownership", "timeline", "specificity"]
  },
  ROLE_CONTEXT: {
    pressureLevel: 1,
    frictionType: "role_alignment",
    maxAttempts: 2,
    targetSignals: ["role_understanding", "context_awareness"]
  },
  CASE_1: {
    pressureLevel: 2,
    frictionType: "evidence_request",
    maxAttempts: 2,
    targetSignals: ["concrete_example", "evidence"]
  },
  DECISION_PROBE: {
    pressureLevel: 3,
    frictionType: "tradeoff_pressure",
    maxAttempts: 2,
    targetSignals: ["decision", "tradeoff", "consequences"]
  },
  PRESSURE_PROBE: {
    pressureLevel: 4,
    frictionType: "conflict_resistance",
    maxAttempts: 2,
    targetSignals: ["conflict", "assertiveness", "stakeholder_management"]
  },
  DEPTH_CHECK: {
    pressureLevel: 4,
    frictionType: "consistency_stress",
    maxAttempts: 2,
    targetSignals: ["consistency", "repeatability", "authenticity"]
  },
  CLOSING: {
    pressureLevel: 1,
    frictionType: "final_positioning",
    maxAttempts: 1,
    targetSignals: ["final_signal"]
  }
};

function containsAny(text, keywords) {
  const lowerText = normalizeString(text).toLowerCase();

  if (!lowerText) {
    return false;
  }

  return keywords.some((keyword) => lowerText.includes(keyword));
}


function isDuplicateAnswer(newText, previousAnswers) {
  const normalize = (value) =>
    String(value || "")
      .toLowerCase()
      .replace(/\s+/g, " ")
      .trim();

  const newNorm = normalize(newText);

  if (!newNorm) {
    return false;
  }

  const exactMatches = (Array.isArray(previousAnswers) ? previousAnswers : []).filter((item) => {
    const prevNorm = normalize(item?.answerText);
    return prevNorm && prevNorm === newNorm;
  });

  return exactMatches.length >= 1;
}


function buildAdaptiveFollowupPayload(
  block,
  currentStep,
  interviewStyle = "structured_corporate"
) {
  const safeBlock = clone(block || {});

  const followups = ensureArray(safeBlock?.followups)
    .map((item) => normalizeString(item))
    .filter(Boolean);

  const triggerType = normalizeString(
    safeBlock?.triggerType || currentStep?.triggerType || ""
  );

  const cleanInterviewStyle = normalizeString(interviewStyle).toLowerCase();

  const sourceQuestionText = normalizeString(
    safeBlock?.sourceQuestionText
  );

  const sourceAnswerText = normalizeString(
    safeBlock?.sourceAnswerText
  );

  let questionText =
    followups[0] ||
    normalizeString(safeBlock?.goal) ||
    normalizeString(currentStep?.label);

  if (triggerType === "consistency_probe" && sourceQuestionText) {
    if (cleanInterviewStyle === "pressure_interviewer") {
      questionText =
        `Ti fermo un attimo perché la risposta sta andando su temi laterali. ` +
        `La domanda iniziale era: “${sourceQuestionText}” ` +
        `Vorrei una risposta più diretta e focalizzata esattamente su quel punto.`;
    } else if (cleanInterviewStyle === "supportive_coach") {
      questionText =
        `Provo a riformulare meglio quello che vorrei capire. ` +
        `Prima ti avevo chiesto: “${sourceQuestionText}” ` +
        `Credo che nella risposta precedente ci fossero elementi utili, ` +
        `ma il punto centrale della domanda non è ancora emerso del tutto. ` +
        `Mi interessa soprattutto chiarire proprio questo aspetto.`;
    } else {
      questionText =
        `Provo a riformulare meglio quello che vorrei capire. ` +
        `Prima ti avevo chiesto: “${sourceQuestionText}” ` +
        `La risposta precedente toccava temi vicini, ma non ancora il punto centrale della domanda. ` +
        `Quello che mi interessa capire adesso è proprio questo aspetto specifico.`;
    }
  }

  if (triggerType === "decision_tradeoff_probe" && sourceQuestionText) {

  if (cleanInterviewStyle === "pressure_interviewer") {
    questionText =
      `La situazione generale è chiara. ` +
      `Quello che ancora non vedo è la tua decisione concreta. ` +
      `Ripartiamo dalla domanda: “${sourceQuestionText}” ` +
      `Quali erano le due opzioni reali e quale hai scelto davvero?`;
  }

  else if (cleanInterviewStyle === "supportive_coach") {
    questionText =
      `Vorrei tornare un attimo sulla situazione che hai descritto. ` +
      `Prima ti avevo chiesto: “${sourceQuestionText}” ` +
      `Ho capito il contesto generale, ma credo che ci sia ancora spazio ` +
      `per chiarire meglio quale scelta concreta hai dovuto fare ` +
      `e quali criteri ti hanno guidato nella decisione finale.`;
  }

  else if (cleanInterviewStyle === "technical_analytical") {
    questionText =
      `Vorrei analizzare meglio il processo decisionale dietro questa situazione. ` +
      `Prima ti avevo chiesto: “${sourceQuestionText}” ` +
      `Mi interessa capire quali alternative hai valutato, ` +
      `quale trade-off hai identificato e con quale criterio hai preso la decisione finale.`;
  }

  else {
    questionText =
      `Ripartiamo un attimo dalla domanda iniziale: “${sourceQuestionText}” ` +
      `Fin qui ho capito il contesto generale, ma non ancora quale scelta concreta hai dovuto fare ` +
      `tra due opzioni possibili. ` +
      `Vorrei capire soprattutto che cosa hai scelto, che cosa hai lasciato indietro ` +
      `e con quale criterio hai preso quella decisione.`;
  }
}

  return {
    ...safeBlock,
    question: questionText,
    prompt: questionText,
    sourceQuestionText,
    sourceAnswerText,

    questionKey:
      triggerType ||
      normalizeString(currentStep?.triggerType) ||
      "adaptive_followup",

    familyKey:
      triggerType ||
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


        payload: buildAdaptiveFollowupPayload(
         block,
          currentStep,
          runtimeState?.interviewState?.context?.interviewStyle ||
         "structured_corporate"
        )




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

function getDimensionScore(answerRecord, key) {
  const value =
    answerRecord?.answerAnalysis?.answerShapeAnalysis?.dimensionScores?.[key];

  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  return null;
}


function buildQuestionContextForAnswer({
  currentStep,
  interviewRuntime
}) {
  const payload = currentStep?.payload || {};
  const runtimeState = interviewRuntime?.runtimeState || {};
  const interviewState = runtimeState?.interviewState || {};
  const stepType = normalizeString(currentStep?.stepType);

  const questionText = normalizeString(
    payload?.question ||
    payload?.prompt ||
    payload?.questionText ||
    payload?.resolvedQuestionText ||
    payload?.renderedQuestion ||
    payload?.openingPrompt ||
    payload?.closingPrompt ||
    payload?.text ||
    payload?.leadIn ||
    payload?.openingScript ||
    payload?.closingLeadIn ||
    currentStep?.question ||
    currentStep?.prompt ||
    currentStep?.label ||
    ""
  );

  const questionKey = normalizeString(
    payload?.questionKey ||
    payload?.key ||
    payload?.resolvedQuestionKey ||
    payload?.structuredQuestionKey ||
    payload?.familyKey ||
    payload?.blockType ||
    stepType ||
    ""
  );

  const narrativeRole = normalizeString(
    payload?.narrativeRole ||
    currentStep?.phaseName ||
    ""
  );

  const expectedSignals = ensureArray(
    payload?.expectedSignals?.length
      ? payload.expectedSignals
      : interviewState?.targetSignals
  )
    .map((item) => normalizeString(item))
    .filter(Boolean);

  return {
    questionText,
    questionKey,
    narrativeRole,
    expectedSignals
  };
}

function buildContextCarryoverCreditFromOpening(answerAnalysis) {
  const analysis = answerAnalysis?.answerShapeAnalysis || {};
  const scores = analysis?.dimensionScores || {};

  const ownership = Number(scores?.ownership ?? 0);
  const evidence = Number(scores?.evidence ?? 0);
  const specificity = Number(scores?.specificity ?? 0);
  const structure = Number(scores?.structure ?? 0);
  const questionAlignment = Number(scores?.questionAlignment ?? 0);

  const hasConcreteEvidence = evidence >= 55 && specificity >= 55;
  const hasOwnership = ownership >= 55;
  const hasNarrativeStructure = structure >= 50;
  const hasOpeningAlignment = questionAlignment >= 55;

  let credibilityLevel = "weak";

  if (hasConcreteEvidence && hasOwnership && hasOpeningAlignment) {
    credibilityLevel = "strong";
  } else if (
    hasNarrativeStructure &&
    (hasOpeningAlignment || evidence >= 45 || specificity >= 45)
  ) {
    credibilityLevel = "partial";
  }

  return {
    source: "opening_answer",
    credibilityLevel,
    hasNarrativeStructure,
    hasOpeningAlignment,
    hasConcreteEvidence,
    hasOwnership,
    shouldRequireConcreteEvidenceLater: credibilityLevel !== "strong"
  };
}

function updateContextCarryoverCredit(interviewState, answerRecord) {
  if (!interviewState || !answerRecord) {
    return;
  }

  const credit = answerRecord?.contextCarryoverCredit;

  if (!credit) {
    return;
  }

  interviewState.contextCarryoverCredit = {
    ...credit,
    openingAnswerLabel: answerRecord?.label || "",
    openingPhaseName: answerRecord?.phaseName || "OPENING",
    updatedAt: new Date().toISOString()
  };
}

function buildAnswerRecord({ currentStep, answerText, interviewRuntime }) {
  const questionContext = buildQuestionContextForAnswer({
    currentStep,
    interviewRuntime
  });

  const answerAnalysis = analyzeAnswerShape({
    answerText,
    questionText: questionContext.questionText,
    questionKey: questionContext.questionKey,
    narrativeRole: questionContext.narrativeRole,
    expectedSignals: questionContext.expectedSignals
  });

  const answerShapeAnalysis =
    answerAnalysis &&
    answerAnalysis.answerShapeAnalysis &&
    typeof answerAnalysis.answerShapeAnalysis === "object"
      ? answerAnalysis.answerShapeAnalysis
      : {};

  const problematicAnswerType =
    typeof answerShapeAnalysis.problematicAnswerType === "string" &&
    answerShapeAnalysis.problematicAnswerType.trim() !== ""
      ? answerShapeAnalysis.problematicAnswerType
      : "none";

  const problematicAnswerConfidence =
    typeof answerShapeAnalysis.problematicAnswerConfidence === "number"
      ? answerShapeAnalysis.problematicAnswerConfidence
      : 0;


  const problematicAnswerReasons = Array.isArray(
    answerShapeAnalysis.problematicAnswerReasons
  )
    ? answerShapeAnalysis.problematicAnswerReasons
    : [];
  const isOpeningAnswer =
  normalizeString(currentStep?.stepType) === "opening" ||
  normalizeString(currentStep?.phaseName).toUpperCase() === "OPENING";

const contextCarryoverCredit = isOpeningAnswer
  ? buildContextCarryoverCreditFromOpening(answerAnalysis)
  : null;

  return {
    stepType: currentStep?.stepType || "unknown",
    phaseName: currentStep?.phaseName || "CASE_1",
    label: currentStep?.label || "",
    answerText,
    inputSource: interviewRuntime?.meta?.inputMode || "text",
    questionContext,
    answerAnalysis,
    contextCarryoverCredit,
    problematicAnswerType,
    problematicAnswerConfidence,
    problematicAnswerReasons,
    timestamp: new Date().toISOString()
  };
}




function extractSignalsFromAnswer(answerRecord) {
  const answerText = normalizeString(answerRecord?.answerText).toLowerCase();
  const signals = [];

  const ownership = getDimensionScore(answerRecord, "ownership");
  const evidence = getDimensionScore(answerRecord, "evidence");
  const specificity = getDimensionScore(answerRecord, "specificity");
  const structure = getDimensionScore(answerRecord, "structure");
  const reflection = getDimensionScore(answerRecord, "reflection");
  const questionAlignment = getDimensionScore(answerRecord, "questionAlignment");
  const motivationForChange = getDimensionScore(answerRecord, "motivationForChange");

  const offTopicRisk =
    answerRecord?.answerAnalysis?.answerShapeAnalysis?.questionContext?.offTopicRisk || "low";

  if (typeof ownership === "number" && ownership >= 55) {
    signals.push("ownership");
  }

  if (typeof evidence === "number" && evidence >= 55) {
    signals.push("evidence");
    signals.push("concrete_example");
  }

  if (typeof specificity === "number" && specificity >= 55) {
    signals.push("specificity");
  }

  if (typeof structure === "number" && structure >= 55) {
    signals.push("timeline");
    signals.push("consistency");
  }

  if (typeof reflection === "number" && reflection >= 50) {
    signals.push("context_awareness");
    signals.push("role_understanding");
  }

  if (typeof questionAlignment === "number" && questionAlignment >= 60) {
    signals.push("question_alignment");
  }

  if (typeof motivationForChange === "number" && motivationForChange >= 60) {
    signals.push("change_motivation");
    signals.push("role_understanding");
    signals.push("context_awareness");
  }

  if (offTopicRisk === "high") {
    signals.push("off_topic_risk");
  }

  if (
    containsAny(answerText, [
      "i decided",
      "i chose",
      "ho deciso",
      "ho scelto",
      "scelsi",
      "decisi"
    ])
  ) {
    signals.push("decision");
  }

  if (
    containsAny(answerText, [
      "trade-off",
      "tradeoff",
      "compromise",
      "rinunc",
      "sacrific",
      "priorit",
      "ho privilegiato",
      "abbiamo privilegiato"
    ])
  ) {
    signals.push("tradeoff");
  }

  if (
    containsAny(answerText, [
      "consequence",
      "impact",
      "result",
      "outcome",
      "ha comportato",
      "conseguenza",
      "risultato",
      "impatto"
    ])
  ) {
    signals.push("consequences");
  }

  if (
    containsAny(answerText, [
      "conflict",
      "pushback",
      "disagree",
      "tension",
      "attrito",
      "conflitto",
      "disaccord",
      "resistenza"
    ])
  ) {
    signals.push("conflict");
    signals.push("stakeholder_management");
  }

  if (
    containsAny(answerText, [
      "pressure",
      "deadline",
      "urgent",
      "urgenza",
      "pressione",
      "scadenza"
    ])
  ) {
    signals.push("assertiveness");
  }

  if (
    containsAny(answerText, [
      "another example",
      "similarly",
      "un altro esempio",
      "in un altro caso"
    ])
  ) {
    signals.push("repeatability");
  }

  if (answerText.length >= 40) {
    signals.push("engagement");
  }

  return Array.from(new Set(signals));
}

function extractDeviationFlags(answerRecord, phaseName) {
  const flags = [];
  const answerText = normalizeString(answerRecord?.answerText).toLowerCase();

  const ownership = getDimensionScore(answerRecord, "ownership");
  const evidence = getDimensionScore(answerRecord, "evidence");
  const specificity = getDimensionScore(answerRecord, "specificity");
  const structure = getDimensionScore(answerRecord, "structure");

  if (
    ["WALKTHROUGH", "CASE_1", "DECISION_PROBE", "PRESSURE_PROBE", "DEPTH_CHECK"].includes(
      phaseName
    )
  ) {
    if (typeof ownership === "number" && ownership < 45) {
      flags.push("no_clear_ownership");
    }

    if (typeof evidence === "number" && evidence < 45) {
      flags.push("generic_examples");
    }

    if (typeof specificity === "number" && specificity < 45) {
      flags.push("low_specificity");
    }
  }

  if (
    ["WALKTHROUGH", "CASE_1", "DEPTH_CHECK"].includes(phaseName) &&
    typeof structure === "number" &&
    structure < 40
  ) {
    flags.push("weak_timeline");
  }

  const noiCount =
    (answerText.match(/\bnoi\b/g) || []).length +
    (answerText.match(/\babbiamo\b/g) || []).length +
    (answerText.match(/\bwe\b/g) || []).length;

  const ioCount =
    (answerText.match(/\bio\b/g) || []).length +
    (answerText.match(/\bho\b/g) || []).length +
    (answerText.match(/\bi\b/g) || []).length;

  if (
    ["WALKTHROUGH", "CASE_1", "DECISION_PROBE", "PRESSURE_PROBE", "DEPTH_CHECK"].includes(
      phaseName
    ) &&
    noiCount >= 3 &&
    ioCount === 0
  ) {
    flags.push("excessive_we");
  }

  if (
    phaseName === "PRESSURE_PROBE" &&
    !containsAny(answerText, [
      "conflict",
      "pushback",
      "disagree",
      "attrito",
      "conflitto",
      "disaccord",
      "resistenza"
    ])
  ) {
    flags.push("no_real_conflict");
  }

  if (
    phaseName === "DECISION_PROBE" &&
    !containsAny(answerText, [
      "trade-off",
      "tradeoff",
      "compromise",
      "rinunc",
      "sacrific",
      "priorit",
      "ho scelto",
      "ho deciso",
      "i chose",
      "i decided"
    ])
  ) {
    flags.push("no_tradeoff");
  }

  if (
    ["DECISION_PROBE", "PRESSURE_PROBE", "DEPTH_CHECK"].includes(phaseName) &&
    answerText.length > 0 &&
    answerText.length < 30
  ) {
    flags.push("avoids_positioning");
  }

  return Array.from(new Set(flags));
}

function updateCoverage(interviewState, phaseName, answerRecord) {
  const answerText = normalizeString(answerRecord?.answerText);

  if (!answerText) {
    return;
  }

  if (phaseName === "WALKTHROUGH") {
    interviewState.coverage.walkthrough = true;
  }

  if (phaseName === "ROLE_CONTEXT") {
    interviewState.coverage.roleContext = true;
  }

  if (phaseName === "CASE_1") {
    interviewState.coverage.case1 = true;
  }

  if (phaseName === "DECISION_PROBE") {
    interviewState.coverage.decision = true;
    interviewState.evaluationFocus.decision = true;
  }

  if (phaseName === "PRESSURE_PROBE") {
    interviewState.coverage.pressure = true;
    interviewState.evaluationFocus.conflict = true;
  }

  if (phaseName === "DEPTH_CHECK") {
    interviewState.coverage.depth = true;
    interviewState.evaluationFocus.synthesis = true;
  }

  if (phaseName === "CLOSING") {
    interviewState.coverage.closing = true;
  }
}

function backfillPhaseCoverageFromSignals(interviewState, currentStep, answerRecord) {
  if (!interviewState || !currentStep || !answerRecord) {
    return;
  }

  const observedSignals = extractSignalsFromAnswer(answerRecord);
  const currentPhaseName = currentStep?.phaseName || interviewState?.phaseName || "CASE_1";
  const currentPhaseIndex = getPhaseIndex(currentPhaseName);

  const decisionSignals = ["decision", "tradeoff", "consequences"];
  const pressureSignals = ["conflict", "assertiveness", "stakeholder_management"];
  const depthSignals = ["consistency", "repeatability", "authenticity"];

  const hasDecisionSignals = decisionSignals.some((signal) =>
    observedSignals.includes(signal)
  );

  const hasPressureSignals = pressureSignals.some((signal) =>
    observedSignals.includes(signal)
  );

  const hasDepthSignals = depthSignals.some((signal) =>
    observedSignals.includes(signal)
  );

  if (hasDecisionSignals) {
    interviewState.coverage.decision = true;
    interviewState.evaluationFocus.decision = true;

    const decisionLedger = interviewState.phaseLedger?.DECISION_PROBE;
    if (
      decisionLedger &&
      decisionLedger.status !== "completed" &&
      currentPhaseIndex >= getPhaseIndex("DECISION_PROBE")
    ) {
      decisionLedger.status = "completed";
      decisionLedger.completedBy = decisionLedger.completedBy || "signal";
      decisionLedger.attempts = Math.max(decisionLedger.attempts || 0, 1);
      decisionLedger.lastStepLabel = decisionLedger.lastStepLabel || currentStep?.label || "";
    }
  }

  if (hasPressureSignals) {
    interviewState.coverage.pressure = true;
    interviewState.evaluationFocus.conflict = true;

    const pressureLedger = interviewState.phaseLedger?.PRESSURE_PROBE;
    if (
      pressureLedger &&
      pressureLedger.status !== "completed" &&
      currentPhaseIndex >= getPhaseIndex("PRESSURE_PROBE")
    ) {
      pressureLedger.status = "completed";
      pressureLedger.completedBy = pressureLedger.completedBy || "signal";
      pressureLedger.attempts = Math.max(pressureLedger.attempts || 0, 1);
      pressureLedger.lastStepLabel = pressureLedger.lastStepLabel || currentStep?.label || "";
    }
  }

  if (hasDepthSignals) {
    interviewState.coverage.depth = true;
    interviewState.evaluationFocus.synthesis = true;

    const depthLedger = interviewState.phaseLedger?.DEPTH_CHECK;
    if (
      depthLedger &&
      depthLedger.status !== "completed" &&
      currentPhaseIndex >= getPhaseIndex("DEPTH_CHECK")
    ) {
      depthLedger.status = "completed";
      depthLedger.completedBy = depthLedger.completedBy || "signal";
      depthLedger.attempts = Math.max(depthLedger.attempts || 0, 1);
      depthLedger.lastStepLabel = depthLedger.lastStepLabel || currentStep?.label || "";
    }
  }
}

function hasAdaptiveBudgetLeft(runtime) {
  const runtimeState = runtime?.runtimeState || {};
  const budget = Number(runtimeState?.adaptiveFollowupBudget ?? 0);
  const used = Number(runtimeState?.injectedAdaptiveFollowupCount ?? 0);

  if (!Number.isFinite(budget) || budget <= 0) {
    return false;
  }

  return used < budget;
}

function phaseAllowsAdaptiveFollowup(phaseName) {
  const cleanPhase = normalizeString(phaseName).toUpperCase();

  if (!cleanPhase) {
    return false;
  }

  if (cleanPhase === "OPENING") {
    return false;
  }

  if (cleanPhase === "CLOSING") {
    return false;
  }

  return true;
}

function hasUsedAdaptiveFocus(runtime, focus) {
  const cleanFocus = normalizeString(focus).toLowerCase();

  if (!cleanFocus) {
    return false;
  }

  const used = ensureArray(runtime?.runtimeState?.usedAdaptiveFollowupFocuses)
    .map((item) => normalizeString(item).toLowerCase())
    .filter(Boolean);

  return used.includes(cleanFocus);
}

function rememberAdaptiveFocus(runtime, focus) {
  const cleanFocus = normalizeString(focus);

  if (!cleanFocus) {
    return;
  }

  const used = ensureArray(runtime?.runtimeState?.usedAdaptiveFollowupFocuses);
  const alreadyUsed = used.some(
    (item) => normalizeString(item).toLowerCase() === cleanFocus.toLowerCase()
  );

  if (!alreadyUsed) {
    used.push(cleanFocus);
    runtime.runtimeState.usedAdaptiveFollowupFocuses = used;
  }
}

function shouldInjectAdaptiveFollowup(currentStep, answerRecord, interviewState, runtime) {
  if (
    currentStep?.stepType !== "core_question" &&
    currentStep?.stepType !== "adaptive_followup_pack"
  ) {
    return false;
  }

  const phaseName = currentStep?.phaseName || interviewState?.phaseName || "CASE_1";

  if (!phaseAllowsAdaptiveFollowup(phaseName)) {
    return false;
  }

  if (!hasAdaptiveBudgetLeft(runtime)) {
    return false;
  }

  const overallBand =
    answerRecord?.answerAnalysis?.answerShapeAnalysis?.overallBand || "medium";

  const ownership = getDimensionScore(answerRecord, "ownership");
  const evidence = getDimensionScore(answerRecord, "evidence");
  const specificity = getDimensionScore(answerRecord, "specificity");
  const structure = getDimensionScore(answerRecord, "structure");

  const phaseLedger = interviewState?.phaseLedger?.[phaseName] || {};
  const phaseConfig = PHASE_CONFIG[phaseName] || { maxAttempts: 2 };
  const attempts = phaseLedger?.attempts || 0;

  if (attempts >= (phaseConfig.maxAttempts || 2)) {
    return false;
  }

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

async function enrichAnswerRecordWithGeneratedFollowup({
  answerRecord,
  currentStep,
  runtime,
  modelAdapter = null
}) {
  const phaseName = currentStep?.phaseName || answerRecord?.phaseName || "CASE_1";

  if (!phaseAllowsAdaptiveFollowup(phaseName)) {
    answerRecord.generatedAdaptiveFollowup = {
      shouldTrigger: false,
      followupQuestion: "",
      source: "blocked_by_phase",
      focus: "",
      usedFallback: false
    };
    return answerRecord;
  }

  if (!hasAdaptiveBudgetLeft(runtime)) {
    answerRecord.generatedAdaptiveFollowup = {
      shouldTrigger: false,
      followupQuestion: "",
      source: "blocked_by_budget",
      focus: "",
      usedFallback: false
    };
    return answerRecord;
  }

  const interviewState = runtime?.runtimeState?.interviewState || null;

  if (!shouldInjectAdaptiveFollowup(currentStep, answerRecord, interviewState, runtime)) {
    answerRecord.generatedAdaptiveFollowup = {
      shouldTrigger: false,
      followupQuestion: "",
      source: "not_needed",
      focus: "",
      usedFallback: false
    };
    return answerRecord;
  }

  const locale = runtime?.meta?.locale || { code: "it" };
  const jobFitAnalysis = runtime?.meta?.jobFitAnalysis || null;

  const generatedFollowup = await generateAdaptiveFollowupQuestion({
    originalQuestion: answerRecord?.questionContext?.questionText || currentStep?.payload?.question || "",
    answerText: answerRecord?.answerText || "",
    answerAnalysis: answerRecord?.answerAnalysis || null,
    jobFitAnalysis,
    locale,
    modelAdapter
  });

  const safeGeneratedFollowup = generatedFollowup || {
    shouldTrigger: false,
    followupQuestion: "",
    source: "generation_returned_empty",
    focus: "",
    usedFallback: false
  };

  if (
    safeGeneratedFollowup?.shouldTrigger &&
    hasUsedAdaptiveFocus(runtime, safeGeneratedFollowup?.focus)
  ) {
    answerRecord.generatedAdaptiveFollowup = {
      shouldTrigger: false,
      followupQuestion: "",
      source: "blocked_by_repeated_focus",
      focus: normalizeString(safeGeneratedFollowup?.focus),
      usedFallback: false
    };
    return answerRecord;
  }

  answerRecord.generatedAdaptiveFollowup = safeGeneratedFollowup;


  
  return answerRecord;
}

function maybeInjectAdaptiveFollowup({
  runtime,
  currentStep,
  answerRecord
}) {
  const interviewState = runtime?.runtimeState?.interviewState || null;

  if (!shouldInjectAdaptiveFollowup(currentStep, answerRecord, interviewState, runtime)) {
    return runtime;
  }

  const generatedFocus = normalizeString(
    answerRecord?.generatedAdaptiveFollowup?.focus
  );

  if (
    answerRecord?.generatedAdaptiveFollowup?.shouldTrigger &&
    generatedFocus &&
    hasUsedAdaptiveFocus(runtime, generatedFocus)
  ) {
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

  const payload = currentStep?.payload || {};

  const sourceQuestionText = normalizeString(
    answerRecord?.questionText ||
    payload?.question ||
    payload?.prompt ||
    payload?.questionText ||
    payload?.resolvedQuestionText ||
    payload?.renderedQuestion ||
    currentStep?.question ||
    currentStep?.prompt ||
    currentStep?.label ||
    ""
  );

  const sourceAnswerText = normalizeString(
    answerRecord?.answerText || ""
  );

  const contextualFollowupPack = {
    ...followupPack,
    sourceQuestionText,
    sourceAnswerText,
    sourceQuestionKey:
      answerRecord?.questionKey ||
      payload?.questionKey ||
      payload?.familyKey ||
      ""
  };



  const updatedRuntime = injectAdaptiveFollowup({
  interviewRuntime: runtime,
  followupPack: contextualFollowupPack
});

if (
  answerRecord?.generatedAdaptiveFollowup?.shouldTrigger &&
  generatedFocus
  ) {
  rememberAdaptiveFocus(updatedRuntime, generatedFocus);
  }

  return updatedRuntime;


  }

function completePhaseIfNeeded(interviewState, currentStep, answerRecord) {
  const phaseName = currentStep?.phaseName || interviewState?.phaseName || "CASE_1";
  const phaseLedger = interviewState?.phaseLedger?.[phaseName];

  if (!phaseLedger) {
    return;
  }

  const phaseConfig = PHASE_CONFIG[phaseName] || { maxAttempts: 2, targetSignals: [] };
  const phaseSignals = phaseConfig.targetSignals || [];
  const observedSignals = extractSignalsFromAnswer(answerRecord);
  const matchedSignals = phaseSignals.filter((signal) => observedSignals.includes(signal));

  phaseLedger.attempts += 1;
  phaseLedger.lastStepLabel = currentStep?.label || "";
  phaseLedger.notes.push({
    timestamp: new Date().toISOString(),
    observedSignals,
    matchedSignals
  });

  interviewState.observedSignals = Array.from(
    new Set([...(interviewState.observedSignals || []), ...observedSignals])
  );

  interviewState.targetSignals = phaseSignals.slice();
  interviewState.pressureLevel = phaseConfig.pressureLevel || 0;

  const hitEnoughSignals =
    phaseSignals.length === 0
      ? true
      : matchedSignals.length >= Math.min(2, phaseSignals.length);

  const reachedAttemptCap = phaseLedger.attempts >= (phaseConfig.maxAttempts || 2);

  if (hitEnoughSignals) {
    phaseLedger.status = "completed";
    phaseLedger.completedBy = "signal";
    return;
  }

  if (reachedAttemptCap) {
    phaseLedger.status = "completed";
    phaseLedger.completedBy = "forced_exit";
    return;
  }

  phaseLedger.status = "active";
}

function getPhaseIndex(phaseName) {
  const index = PHASE_SEQUENCE.indexOf(phaseName);
  return index >= 0 ? index : 0;
}

function updateInterviewStateForNextStep(runtime) {
  const runtimeState = runtime?.runtimeState;
  const interviewState = runtimeState?.interviewState;
  const timeline = ensureArray(runtimeState?.timeline);
  const currentStepIndex = runtimeState?.currentStepIndex ?? 0;
  const nextStep = timeline[currentStepIndex];

  if (!interviewState) {
    return;
  }

  const currentPhaseName = interviewState.phaseName;
  const currentPhaseLedger = interviewState.phaseLedger?.[currentPhaseName];

  if (currentPhaseLedger && currentPhaseLedger.status !== "completed") {
    currentPhaseLedger.status = "completed";
  }

  if (!nextStep) {
    interviewState.phaseName = "CLOSING";
    interviewState.phaseIndex = getPhaseIndex("CLOSING");
    interviewState.pressureLevel = PHASE_CONFIG.CLOSING.pressureLevel;
    interviewState.targetSignals = clone(PHASE_CONFIG.CLOSING.targetSignals || []);

    const closingLedger = interviewState.phaseLedger?.["CLOSING"];
    if (closingLedger && closingLedger.status === "pending") {
      closingLedger.status = "active";
    }

    return;
  }

  const nextPhaseName = nextStep.phaseName || "CASE_1";
  const nextPhaseLedger = interviewState.phaseLedger?.[nextPhaseName];

  interviewState.phaseName = nextPhaseName;
  interviewState.phaseIndex = getPhaseIndex(nextPhaseName);
  interviewState.pressureLevel = PHASE_CONFIG[nextPhaseName]?.pressureLevel || 0;
  interviewState.targetSignals = clone(PHASE_CONFIG[nextPhaseName]?.targetSignals || []);

  if (nextPhaseLedger && nextPhaseLedger.status === "pending") {
    nextPhaseLedger.status = "active";
  }
}

export async function advanceInterviewRuntime({
  interviewSession,
  interviewRuntime,
  answerText = "",
  modelAdapter = null
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

  if (!Array.isArray(runtimeState.usedAdaptiveFollowupFocuses)) {
    runtimeState.usedAdaptiveFollowupFocuses = [];
  }

  if (runtimeState.isCompleted) {
    return {
      interviewRuntime: runtime
    };
  }

  const currentStep = runtime?.currentStep || null;
  const cleanAnswerText = normalizeString(answerText);

  let answerRecord = buildAnswerRecord({
    currentStep,
    answerText: cleanAnswerText,
    interviewRuntime: runtime
  });

  answerRecord = await enrichAnswerRecordWithGeneratedFollowup({
    answerRecord,
    currentStep,
    runtime,
    modelAdapter
  });

  const previousAnswers = Array.isArray(runtimeState.answers) ? runtimeState.answers : [];

const normalizedCurrentAnswer = String(cleanAnswerText || "")
  .toLowerCase()
  .replace(/\s+/g, " ")
  .trim();

const exactDuplicateCount = previousAnswers.filter((item) => {
  const previousText = String(item?.answerText || "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();

  return previousText && previousText === normalizedCurrentAnswer;
}).length;



    const problematicAnswer = detectProblematicAnswerType({
    answerText: cleanAnswerText,
    previousAnswers: runtimeState.answers || [],
    questionText:
      currentStep?.question ||
      currentStep?.prompt ||
      currentStep?.text ||
      currentStep?.payload?.question ||
      (Array.isArray(currentStep?.payload?.followups)
        ? currentStep.payload.followups[0]
        : "") ||
      ""
  });



  if (answerRecord?.answerAnalysis?.answerShapeAnalysis) {
    const analysis = answerRecord.answerAnalysis.answerShapeAnalysis;

    analysis.problematicAnswerType = problematicAnswer.type || "none";
    analysis.problematicAnswerConfidence = problematicAnswer.confidence || 0;
    analysis.problematicAnswerReasons = Array.isArray(problematicAnswer.reasons)
      ? problematicAnswer.reasons
      : [];

    if (problematicAnswer.type === "duplicate") {
      analysis.overallScore = Math.max(0, (analysis.overallScore || 0) - 40);
      analysis.overallBand = analysis.overallScore >= 50 ? "medium" : "weak";
    }

    if (problematicAnswer.type === "evasive") {
      analysis.overallScore = Math.max(0, Math.min(12, analysis.overallScore || 0));
      analysis.overallBand = "weak";
    }

    if (problematicAnswer.type === "non_answer") {
      analysis.overallScore = Math.max(0, Math.min(8, analysis.overallScore || 0));
      analysis.overallBand = "weak";
    }

    if (problematicAnswer.type === "hostile") {
      analysis.overallScore = Math.max(0, Math.min(5, analysis.overallScore || 0));
      analysis.overallBand = "weak";
    }

        if (problematicAnswer.type === "off_topic") {
      analysis.overallScore = Math.max(0, Math.min(18, analysis.overallScore || 0));
      analysis.overallBand = "weak";
    }

    if (problematicAnswer.type === "nonsense") {
      analysis.overallScore = Math.max(0, Math.min(14, analysis.overallScore || 0));
      analysis.overallBand = "weak";
    }

  }

  answerRecord.problematicAnswerType = problematicAnswer.type || "none";



  runtimeState.answers.push(answerRecord);

  if (runtimeState?.interviewState) {
    const phaseName =
      currentStep?.phaseName ||
      runtimeState.interviewState.phaseName ||
      "CASE_1";

    const deviationFlags = extractDeviationFlags(answerRecord, phaseName);

    runtimeState.interviewState.deviationFlags = Array.from(
      new Set([
        ...(runtimeState.interviewState.deviationFlags || []),
        ...deviationFlags
      ])
    );

    updateCoverage(runtimeState.interviewState, phaseName, answerRecord);
updateContextCarryoverCredit(runtimeState.interviewState, answerRecord);
completePhaseIfNeeded(runtimeState.interviewState, currentStep, answerRecord);
backfillPhaseCoverageFromSignals(
  runtimeState.interviewState,
  currentStep,
  answerRecord
);

  }

  runtime = maybeInjectAdaptiveFollowup({
    runtime,
    currentStep,
    answerRecord
  });

  runtime.runtimeState.currentStepIndex += 1;

  if (
    runtime.runtimeState.currentStepIndex >=
    ensureArray(runtime.runtimeState.timeline).length
  ) {
    runtime.runtimeState.isCompleted = true;
    runtime.currentStep = null;
    updateInterviewStateForNextStep(runtime);

    return {
      interviewRuntime: runtime
    };
  }

  updateInterviewStateForNextStep(runtime);

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

