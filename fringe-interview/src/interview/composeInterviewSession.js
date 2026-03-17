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

function buildCoreQuestionBlocks(interviewQuestionSet, locale) {
  const primaryQuestions = ensureArray(interviewQuestionSet?.primaryQuestions);

  return primaryQuestions.map((item, index) => ({
    blockType: "core_question",
    sequence: index + 1,
    familyKey: item.familyKey,
    familyLabel: item.familyLabel,
    priority: item.priority,
    question: item.question,
    objective: `${locale.interview.coreObjectivePrefix} ${item.familyLabel} ${locale.interview.coreObjectiveSuffix} ${item.priority} ${locale.interview.coreObjectiveEnding}`
  }));
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

  return {
    blockType: "closing",
    objective: locale.interview.closingObjective,
    confirmStrengths: strengthsToValidate.slice(0, 3),
    unresolvedRisks: risksToTest.slice(0, 3),
    finalClarificationsNeeded: clarificationsToCollect.slice(0, 3),
    reportUsefulHints: cvImprovementHints.slice(0, 3),
    closingPrompt: locale.interview.closingPrompt
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
    selectedFollowupPacks
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