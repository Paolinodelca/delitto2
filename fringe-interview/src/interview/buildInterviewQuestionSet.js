import { loadInterviewConfig } from "./readInterviewConfig.js";
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

function priorityScore(priority) {
  if (priority === "high") return 3;
  if (priority === "medium") return 2;
  return 1;
}

function tokenizeForSimilarity(text) {
  return normalizeString(text)
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .map((item) => item.trim())
    .filter((item) => item.length > 2);
}

function similarityRatio(a, b) {
  const aTokens = new Set(tokenizeForSimilarity(a));
  const bTokens = new Set(tokenizeForSimilarity(b));

  if (aTokens.size === 0 || bTokens.size === 0) {
    return 0;
  }

  let overlap = 0;

  for (const token of aTokens) {
    if (bTokens.has(token)) {
      overlap += 1;
    }
  }

  return overlap / Math.min(aTokens.size, bTokens.size);
}

function isTooSimilarQuestion(question, selectedQuestions) {
  return selectedQuestions.some((item) => {
    const other = item?.question || "";
    return similarityRatio(question, other) >= 0.65;
  });
}

function buildQuestionFamilySelections({ interviewPlan, questionFamiliesConfig, locale }) {
  const familyMap = questionFamiliesConfig?.families || {};
  const suggestedFamilies = ensureArray(interviewPlan?.suggestedQuestionFamilies);
  const focusBlocks = ensureArray(interviewPlan?.focusBlocks);

  const requestedFamilies = uniqueStrings([
    ...suggestedFamilies,
    ...focusBlocks.map((item) => item?.suggestedQuestionFamily)
  ]);

  const selections = requestedFamilies
    .map((familyKey) => {
      const familyConfig = familyMap[familyKey];

      if (!familyConfig) {
        return null;
      }

      const relatedFocusBlocks = focusBlocks
        .filter((item) => item?.suggestedQuestionFamily === familyKey)
        .sort((a, b) => priorityScore(b.priority) - priorityScore(a.priority));

      const topPriority =
        relatedFocusBlocks.length > 0 ? relatedFocusBlocks[0].priority : "medium";

      const relatedTopics = uniqueStrings(
        relatedFocusBlocks.map((item) => item?.topic)
      );

      const relatedReasons = uniqueStrings(
        relatedFocusBlocks.map((item) => item?.reason)
      );

      return {
        familyKey,
        label: familyConfig.label || familyKey,
        intent: familyConfig.intent || "",
        priority: topPriority,
        relatedTopics,
        relatedReasons,
        questions: ensureArray(familyConfig.questions)
      };
    })
    .filter(Boolean)
    .sort((a, b) => priorityScore(b.priority) - priorityScore(a.priority));

  if (selections.length > 0) {
    return selections;
  }

  const fallbackConfig = familyMap.general_fit;

  if (!fallbackConfig) {
    return [];
  }

  return [
    {
      familyKey: "general_fit",
      label: fallbackConfig.label || "General Fit",
      intent: fallbackConfig.intent || "",
      priority: "medium",
      relatedTopics: [],
      relatedReasons: [locale.interview.fallbackReason],
      questions: ensureArray(fallbackConfig.questions)
    }
  ];
}

function buildFollowupSelections({ interviewPlan, followupPacksConfig }) {
  const packMap = followupPacksConfig?.packs || {};
  const followupPlan = ensureArray(interviewPlan?.followupPlan);

  return followupPlan
    .map((item) => {
      const triggerType = normalizeString(item?.triggerType);
      const reason = normalizeString(item?.reason);

      if (!triggerType) {
        return null;
      }

      const packConfig = packMap[triggerType];

      if (!packConfig) {
        return {
          triggerType,
          label: triggerType,
          goal: "",
          activationReason: reason,
          followups: []
        };
      }

      return {
        triggerType,
        label: packConfig.label || triggerType,
        goal: packConfig.goal || "",
        activationReason: reason,
        followups: ensureArray(packConfig.followups)
      };
    })
    .filter(Boolean);
}

function pickBestQuestionForFamily(family, alreadySelected) {
  const questions = ensureArray(family?.questions);

  for (const question of questions) {
    if (!normalizeString(question)) {
      continue;
    }

    if (!isTooSimilarQuestion(question, alreadySelected)) {
      return question;
    }
  }

  return normalizeString(questions[0]) || "";
}

function buildPrimaryQuestions(questionFamilySelections) {
  const selected = [];
  const orderedFamilies = [...questionFamilySelections].sort(
    (a, b) => priorityScore(b.priority) - priorityScore(a.priority)
  );

  for (const family of orderedFamilies) {
    const chosenQuestion = pickBestQuestionForFamily(family, selected);

    if (!chosenQuestion) {
      continue;
    }

    selected.push({
      familyKey: family.familyKey,
      familyLabel: family.label,
      priority: family.priority,
      orderHint: selected.length + 1,
      question: chosenQuestion
    });
  }

  return selected.slice(0, 3);
}

function buildConversationFlow(interviewPlan, questionFamilySelections, followupSelections) {
  const openingFocus = interviewPlan?.openingFocus || {};
  const strategy = interviewPlan?.sessionStrategy || {};

  return {
    interviewStyle: strategy.interviewStyle || "balanced",
    openingMove: {
      validateFirst: ensureArray(openingFocus.validateFirst),
      clarifyEarly: ensureArray(openingFocus.clarifyEarly),
      monitorRisks: ensureArray(openingFocus.monitorRisks)
    },
    questionFamilyOrder: questionFamilySelections.map((item) => ({
      familyKey: item.familyKey,
      priority: item.priority,
      relatedTopics: item.relatedTopics
    })),
    followupActivationOrder: followupSelections.map((item) => ({
      triggerType: item.triggerType,
      label: item.label
    }))
  };
}

export async function buildInterviewQuestionSet({ interviewPlan }) {
  if (!interviewPlan || typeof interviewPlan !== "object") {
    throw new Error("buildInterviewQuestionSet: interviewPlan is required.");
  }

  const locale = getInterviewLocale();
  const { questionFamilies, followupPacks } = await loadInterviewConfig();

  const questionFamilySelections = buildQuestionFamilySelections({
    interviewPlan,
    questionFamiliesConfig: questionFamilies,
    locale
  });

  const followupSelections = buildFollowupSelections({
    interviewPlan,
    followupPacksConfig: followupPacks
  });

  const primaryQuestions = buildPrimaryQuestions(questionFamilySelections);
  const conversationFlow = buildConversationFlow(
    interviewPlan,
    questionFamilySelections,
    followupSelections
  );

  return {
    interviewQuestionSet: {
      sessionStrategy: interviewPlan.sessionStrategy || {},
      priorityTopics: ensureArray(interviewPlan.priorityTopics),
      selectedQuestionFamilies: questionFamilySelections,
      primaryQuestions,
      selectedFollowupPacks: followupSelections,
      conversationFlow,
      reportEmphasis: interviewPlan.reportEmphasis || {}
    }
  };
}