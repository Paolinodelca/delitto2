import { getInterviewLocale } from "../i18n/getInterviewLocale.js";

function ensureArray(value) {
  return Array.isArray(value) ? value : [];
}

function normalizeString(value) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

function uniqueStrings(values) {
  const seen = new Set();
  const result = [];

  for (const value of values) {
    const clean = normalizeString(value);

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

function buildOpeningBlock(interviewPlan, interviewQuestionSet, locale) {
  const openingMove = interviewQuestionSet?.conversationFlow?.openingMove || {};
  const priorityTopics = ensureArray(interviewQuestionSet?.priorityTopics);

  return {
    blockType: "opening",
    objective: locale.interview.openingObjective,
    validateFirst: ensureArray(openingMove.validateFirst),
    clarifyEarly: ensureArray(openingMove.clarifyEarly),
    monitorRisks: ensureArray(openingMove.monitorRisks),
    priorityTopics: priorityTopics.slice(0, 3),
    openingPrompt: locale.interview.openingPrompt
  };
}

function buildLegacyCoreQuestionBlocks(interviewQuestionSet, locale) {
  const primaryQuestions = ensureArray(interviewQuestionSet?.primaryQuestions);

  return primaryQuestions.map((item, index) => ({
    blockType: "core_question",
    sequence: index + 1,
    familyKey: item.familyKey,
    familyLabel: item.familyLabel,
    priority: item.priority,
    question: item.question,
    source: "legacy_primary_questions",
    objective: `${locale.interview.coreObjectivePrefix} ${item.familyLabel} ${locale.interview.coreObjectiveSuffix} ${item.priority} ${locale.interview.coreObjectiveEnding}`
  }));
}

function extractResolvedQuestionItems(interviewQuestionSet) {
  const resolvedStructuredQuestions =
    interviewQuestionSet?.contextualSelection?.resolvedStructuredQuestions;

  if (!resolvedStructuredQuestions || typeof resolvedStructuredQuestions !== "object") {
    return [];
  }

  const directQuestions = ensureArray(resolvedStructuredQuestions.questions);
  if (directQuestions.length > 0) {
    return directQuestions;
  }

  const resolvedQuestions = ensureArray(resolvedStructuredQuestions.resolvedQuestions);
  if (resolvedQuestions.length > 0) {
    return resolvedQuestions;
  }

  return [];
}

function humanizeStageLabel(stage) {
  const clean = normalizeString(stage);

  if (!clean) {
    return "Contextual";
  }

  if (clean === "mandatory") return "Role Fit";
  if (clean === "seniority") return "Seniority Calibration";
  if (clean === "secondary") return "Deepening";
  if (clean === "person_perception") return "Person Perception";
  if (clean === "closing") return "Closing";

  return clean
    .split("_")
    .map((item) => item.charAt(0).toUpperCase() + item.slice(1))
    .join(" ");
}

function buildContextualCoreQuestionBlocks(interviewQuestionSet, locale) {
  const resolvedItems = extractResolvedQuestionItems(interviewQuestionSet);

  if (resolvedItems.length === 0) {
    return [];
  }

  const filteredItems = resolvedItems.filter((item) => {
    const stage = normalizeString(item?.stage).toLowerCase();
    return stage !== "closing";
  });

  return filteredItems.map((item, index) => {
    const stage = normalizeString(item?.stage) || "contextual";
    const familyLabel =
      normalizeString(item?.familyLabel) ||
      normalizeString(item?.categoryLabel) ||
      humanizeStageLabel(stage);

    const prompt =
      normalizeString(item?.prompt) ||
      normalizeString(item?.question);

    return {
      blockType: "core_question",
      sequence: index + 1,
      familyKey:
        normalizeString(item?.key) ||
        `contextual_${index + 1}`,
      familyLabel,
      priority: stage,
      question: prompt,
      source: "contextual_structured_selection",
      contextualStage: stage,
      toneUsed: normalizeString(item?.toneUsed) || "",
      toneSource: normalizeString(item?.source) || "",
      objective: `${locale.interview.coreObjectivePrefix} ${familyLabel} ${locale.interview.coreObjectiveSuffix} ${stage} ${locale.interview.coreObjectiveEnding}`
    };
  });
}

function buildCoreQuestionBlocks(interviewQuestionSet, locale) {
  const contextualBlocks = buildContextualCoreQuestionBlocks(
    interviewQuestionSet,
    locale
  );

  if (contextualBlocks.length > 0) {
    return contextualBlocks;
  }

  return buildLegacyCoreQuestionBlocks(interviewQuestionSet, locale);
}

function buildFollowupBlocks() {
  return [];
}

function buildClosingBlock(interviewPlan, interviewQuestionSet, locale) {
  const reportEmphasis = interviewQuestionSet?.reportEmphasis || {};
  const strengthsToValidate = ensureArray(reportEmphasis.strengthsToValidate);
  const risksToTest = ensureArray(reportEmphasis.risksToTest);
  const clarificationsToCollect = ensureArray(
    reportEmphasis.clarificationsToCollect
  );
  const cvImprovementHints = ensureArray(reportEmphasis.cvImprovementHints);

  const contextualResolvedItems = extractResolvedQuestionItems(interviewQuestionSet);
  const contextualClosingItem = contextualResolvedItems.find(
    (item) => normalizeString(item?.stage).toLowerCase() === "closing"
  );

  return {
    blockType: "closing",
    objective: locale.interview.closingObjective,
    confirmStrengths: strengthsToValidate.slice(0, 3),
    unresolvedRisks: risksToTest.slice(0, 3),
    finalClarificationsNeeded: clarificationsToCollect.slice(0, 3),
    reportUsefulHints: cvImprovementHints.slice(0, 3),
    closingPrompt:
      normalizeString(contextualClosingItem?.prompt) ||
      locale.interview.closingPrompt,
    source: contextualClosingItem ? "contextual_structured_selection" : "legacy_closing"
  };
}

function buildSessionSummary(interviewPlan, interviewQuestionSet) {
  const fitSnapshot = interviewPlan?.fitSnapshot || {};
  const sessionStrategy = interviewQuestionSet?.sessionStrategy || {};
  const selectedFamilies = ensureArray(
    interviewQuestionSet?.selectedQuestionFamilies
  ).map((item) => item.familyKey);

  const selectedFollowupPacks = ensureArray(
    interviewQuestionSet?.selectedFollowupPacks
  ).map((item) => item.triggerType);

  return {
    recommendationBand: fitSnapshot.recommendationBand || "plausible_fit",
    overallScore: fitSnapshot.overallScore ?? null,
    confidence: fitSnapshot.confidence || "medium",
    interviewStyle: sessionStrategy.interviewStyle || "balanced",
    selectedFamilies,
    selectedFollowupPacks,
    contextualIntegrationStatus:
      interviewQuestionSet?.contextualSelection?.integrationStatus || "not_available",
    contextualInterviewLengthMode:
      interviewQuestionSet?.contextualSelection?.questionSelectionStrategy?.interviewLengthMode ||
      "",
    contextualToneMode:
      interviewQuestionSet?.contextualSelection?.questionSelectionStrategy?.toneMode ||
      ""
  };
}

export function composeInterviewSession({
  interviewPlan,
  interviewQuestionSet
}) {
  if (!interviewPlan || typeof interviewPlan !== "object") {
    throw new Error("composeInterviewSession: interviewPlan is required.");
  }

  if (!interviewQuestionSet || typeof interviewQuestionSet !== "object") {
    throw new Error("composeInterviewSession: interviewQuestionSet is required.");
  }

  const locale = getInterviewLocale();

  const openingBlock = buildOpeningBlock(interviewPlan, interviewQuestionSet, locale);
  const coreQuestionBlocks = buildCoreQuestionBlocks(interviewQuestionSet, locale);
  const followupBlocks = buildFollowupBlocks();
  const closingBlock = buildClosingBlock(interviewPlan, interviewQuestionSet, locale);

  return {
    interviewSession: {
      summary: buildSessionSummary(interviewPlan, interviewQuestionSet),
      openingBlock,
      coreQuestionBlocks,
      followupBlocks,
      closingBlock,
      allTopicsCovered: uniqueStrings([
        ...ensureArray(interviewQuestionSet?.priorityTopics),
        ...ensureArray(interviewQuestionSet?.selectedQuestionFamilies).flatMap(
          (item) => ensureArray(item.relatedTopics)
        )
      ])
    }
  };
}