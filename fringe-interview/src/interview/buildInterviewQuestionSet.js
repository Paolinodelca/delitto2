import { loadInterviewConfig } from "./readInterviewConfig.js";
import { getInterviewLocale } from "../i18n/getInterviewLocale.js";
import { deriveInterviewContextProfile } from "./deriveInterviewContextProfile.js";
import { loadStructuredQuestionBank } from "./loadStructuredQuestionBank.js";
import { rankStructuredQuestions } from "./rankStructuredQuestions.js";
import { deriveQuestionSelectionStrategy } from "./deriveQuestionSelectionStrategy.js";
import { selectQuestionToneVariant } from "./selectQuestionToneVariant.js";
import { generateGapDrivenInterviewQuestion } from "./generateGapDrivenInterviewQuestion.js";

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

  for (const value of ensureArray(values)) {
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

function normalizeRecentQuestionHistory(recentQuestionHistory) {
  return ensureArray(recentQuestionHistory)
    .map((item) => {
      if (typeof item === "string") {
        const key = normalizeString(item);

        if (!key) {
          return null;
        }

        return {
          key,
          category: "",
          signals: []
        };
      }

      if (!item || typeof item !== "object") {
        return null;
      }

      const key = normalizeString(item?.key);
      const category = normalizeString(item?.category);
      const signals = ensureArray(item?.signals)
        .map((signal) => normalizeString(signal))
        .filter(Boolean);

      if (!key && !category && signals.length === 0) {
        return null;
      }

      return {
        key,
        category,
        signals
      };
    })
    .filter(Boolean);
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

function extractResolvedQuestionItems(resolvedStructuredQuestions) {
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

function buildContextualSelection({
  candidateProfile,
  roleProfile,
  jobFitAnalysis,
  interviewLengthMode,
  recentQuestionKeys = [],
  recentQuestionHistory = []
}) {
  try {
    const { interviewContextProfile } = deriveInterviewContextProfile({
      candidateProfile,
      roleProfile,
      jobFitAnalysis
    });

    const { structuredQuestionBank } = loadStructuredQuestionBank();

    const { rankedStructuredQuestions } = rankStructuredQuestions({
      interviewContextProfile,
      structuredQuestionBank,
      recentQuestionKeys,
      recentQuestionHistory
    });

    const { questionSelectionStrategy } = deriveQuestionSelectionStrategy({
      interviewContextProfile,
      rankedStructuredQuestions,
      interviewLengthMode,
      recentQuestionKeys
    });

    const resolvedSelectionResult = selectQuestionToneVariant({
      structuredQuestionBank,
      questionSelectionStrategy
    });

    const resolvedStructuredQuestions =
      resolvedSelectionResult?.resolvedStructuredQuestions || null;

    return {
      contextualSelection: {
        integrationStatus: "contextual_selection_ready",
        interviewContextProfile,
        rankedStructuredQuestions,
        questionSelectionStrategy,
        resolvedStructuredQuestions,
        resolvedQuestionCount: extractResolvedQuestionItems(resolvedStructuredQuestions).length
      }
    };
  } catch (error) {
    return {
      contextualSelection: {
        interviewContextProfile: null,
        rankedStructuredQuestions: null,
        questionSelectionStrategy: null,
        resolvedStructuredQuestions: null,
        resolvedQuestionCount: 0,
        integrationStatus: "contextual_selection_failed",
        integrationError: normalizeString(error?.message) || "unknown_error"
      }
    };
  }
}

function inferNarrativeRoleFromText(text) {
  const combined = normalizeString(text).toLowerCase();

  if (!combined) {
    return "";
  }

  if (
    combined.includes("perché vuoi cambiare") ||
    combined.includes("perche vuoi cambiare") ||
    combined.includes("cambiare azienda") ||
    combined.includes("cambiare ruolo") ||
    combined.includes("vuoi lasciare") ||
    combined.includes("lasciare la tua azienda") ||
    combined.includes("change company") ||
    combined.includes("change role") ||
    combined.includes("why do you want to change") ||
    combined.includes("why are you considering leaving") ||
    combined.includes("why are you looking to leave") ||
    combined.includes("why now") ||
    combined.includes("what is pushing you to change") ||
    combined.includes("next step in your path") ||
    combined.includes("passo del tuo percorso") ||
    combined.includes("transferability") ||
    combined.includes("transition") ||
    combined.includes("fit") ||
    combined.includes("background close to this role") ||
    combined.includes("previous experience transfer") ||
    combined.includes("quali parti della tua esperienza") ||
    combined.includes("quale parte della tua esperienza") ||
    combined.includes("quanto si trasferiscono") ||
    combined.includes("aderenza al ruolo") ||
    combined.includes("vicino a questo ruolo")
  ) {
    return "ROLE_CONTEXT";
  }

  if (
    combined.includes("walkthrough") ||
    combined.includes("career journey") ||
    combined.includes("raccontami il tuo percorso") ||
    combined.includes("ripercorri il tuo percorso") ||
    combined.includes("walk me through your background") ||
    combined.includes("walk me through your career") ||
    combined.includes("cv walkthrough")
  ) {
    return "WALKTHROUGH";
  }

  if (
    combined.includes("tell me about") ||
    combined.includes("project") ||
    combined.includes("example") ||
    combined.includes("analysis task") ||
    combined.includes("reporting") ||
    combined.includes("became more complex") ||
    combined.includes("parlami di") ||
    combined.includes("raccontami un caso") ||
    combined.includes("attività di reporting") ||
    combined.includes("analisi che si è rivelata") ||
    combined.includes("caso concreto")
  ) {
    return "CASE_1";
  }

  if (
    combined.includes("how do you decide") ||
    combined.includes("decide") ||
    combined.includes("trade-off") ||
    combined.includes("tradeoff") ||
    combined.includes("prioritize") ||
    combined.includes("which metrics really matter") ||
    combined.includes("come decidi") ||
    combined.includes("quali metriche contano") ||
    combined.includes("quali metriche contano davvero") ||
    combined.includes("quale sarebbe per te la curva di apprendimento più ripida") ||
    combined.includes("curva di apprendimento più ripida") ||
    combined.includes("come sceglieresti") ||
    combined.includes("come stabilisci le priorità") ||
    combined.includes("come prioritizzi")
  ) {
    return "DECISION_PROBE";
  }

  if (
    combined.includes("conflict") ||
    combined.includes("pushback") ||
    combined.includes("stakeholder") ||
    combined.includes("pressure") ||
    combined.includes("deadline") ||
    combined.includes("conflitto") ||
    combined.includes("attrito") ||
    combined.includes("pressione") ||
    combined.includes("resistenza") ||
    combined.includes("disaccordo")
  ) {
    return "PRESSURE_PROBE";
  }

  if (
    combined.includes("another example") ||
    combined.includes("second example") ||
    combined.includes("what did you learn") ||
    combined.includes("what would you do differently") ||
    combined.includes("un altro esempio") ||
    combined.includes("cosa hai imparato") ||
    combined.includes("cosa faresti diversamente") ||
    combined.includes("verifica profondità")
  ) {
    return "DEPTH_CHECK";
  }

  return "";
}

function inferNarrativeRoleFromFamily(familyKey) {
  const key = normalizeString(familyKey).toLowerCase();

  if (!key) {
    return "";
  }

  if (
    key === "transferability" ||
    key === "motivation" ||
    key === "motivation_change" ||
    key === "change_logic" ||
    key === "general_fit"
  ) {
    return "ROLE_CONTEXT";
  }

  if (key === "analytical_depth" || key === "ownership_scope" || key === "achievement") {
    return "CASE_1";
  }

  if (key === "decision_making" || key === "prioritization" || key === "ambiguity") {
    return "DECISION_PROBE";
  }

  if (key === "stakeholder_management" || key === "conflict_management") {
    return "PRESSURE_PROBE";
  }

  return "";
}

function pickCandidateForRole({
  familyCandidates,
  contextualCandidates,
  selected,
  narrativeRole
}) {
  const cleanRole = normalizeString(narrativeRole);

  const orderedPools =
    cleanRole === "WALKTHROUGH"
      ? [familyCandidates, contextualCandidates]
      : [contextualCandidates, familyCandidates];

  for (const pool of orderedPools) {
    const candidate = findCandidateForRole(pool, selected, narrativeRole);
    if (candidate) {
      return candidate;
    }
  }

  return null;
}

function normalizeResolvedQuestionItem(item, index) {
  if (typeof item === "string") {
    const question = normalizeString(item);

    if (!question) {
      return null;
    }

    return {
      familyKey: "",
      familyLabel: "Structured Question",
      priority: "medium",
      orderHint: index + 1,
      question,
      narrativeRole: inferNarrativeRoleFromText(question),
      source: "contextual_selection"
    };
  }

  if (!item || typeof item !== "object") {
    return null;
  }

  const question = normalizeString(
    item.question ||
      item.prompt ||
      item.text ||
      item.selectedQuestion ||
      item.questionText
  );

  if (!question) {
    return null;
  }

  const familyKey = normalizeString(item.familyKey || item.dimensionKey || item.categoryKey);
  const familyLabel = normalizeString(item.familyLabel || item.dimensionLabel || item.categoryLabel);
  const priority = normalizeString(item.priority) || "medium";

  const narrativeRole =
    inferNarrativeRoleFromText(question) ||
    inferNarrativeRoleFromFamily(familyKey);

  return {
    familyKey,
    familyLabel: familyLabel || familyKey || "Structured Question",
    priority,
    orderHint: index + 1,
    question,
    narrativeRole,
    source: "contextual_selection"
  };
}

function getTargetQuestionCount(interviewLengthMode) {
  const mode = normalizeString(interviewLengthMode).toLowerCase();

  if (mode === "extended" || mode === "long") {
    return 6;
  }

  if (mode === "compact" || mode === "short") {
    return 4;
  }

  return 4;
}

function getNarrativeTargets(targetCount, focusMode = "balanced") {
  if (targetCount >= 6) {
    return [
      "WALKTHROUGH",
      "ROLE_CONTEXT",
      "CASE_1",
      "DECISION_PROBE",
      "PRESSURE_PROBE",
      "DEPTH_CHECK"
    ];
  }

  if (targetCount === 5) {
    return [
      "ROLE_CONTEXT",
      "CASE_1",
      "DECISION_PROBE",
      "PRESSURE_PROBE",
      "DEPTH_CHECK"
    ];
  }

  if (targetCount <= 4) {
    if (focusMode === "pressure") {
      return [
        "ROLE_CONTEXT",
        "CASE_1",
        "DECISION_PROBE",
        "PRESSURE_PROBE"
      ];
    }

    if (focusMode === "depth") {
      return [
        "ROLE_CONTEXT",
        "CASE_1",
        "DECISION_PROBE",
        "DEPTH_CHECK"
      ];
    }

    return [
      "ROLE_CONTEXT",
      "CASE_1",
      "DECISION_PROBE",
      "PRESSURE_PROBE"
    ];
  }

  return [
    "ROLE_CONTEXT",
    "CASE_1",
    "DECISION_PROBE",
    "PRESSURE_PROBE"
  ];
}

function addQuestionIfUseful(collection, candidate) {
  if (!candidate || !normalizeString(candidate.question)) {
    return false;
  }

  if (isTooSimilarQuestion(candidate.question, collection)) {
    return false;
  }

  collection.push({
    ...candidate,
    orderHint: collection.length + 1
  });

  return true;
}

function buildCandidatesFromFamilySelections(questionFamilySelections) {
  const orderedFamilies = [...questionFamilySelections].sort(
    (a, b) => priorityScore(b.priority) - priorityScore(a.priority)
  );

  const result = [];

  for (const family of orderedFamilies) {
    const questions = ensureArray(family?.questions);

    for (const question of questions) {
      const cleanQuestion = normalizeString(question);

      if (!cleanQuestion) {
        continue;
      }

      result.push({
        familyKey: family.familyKey,
        familyLabel: family.label,
        priority: family.priority,
        question: cleanQuestion,
        narrativeRole:
          inferNarrativeRoleFromText(cleanQuestion) ||
          inferNarrativeRoleFromFamily(family.familyKey),
        source: "family_selection"
      });
    }
  }

  return result;
}

function buildContextualQuestionCandidates(contextualSelectionResult) {
  const contextualSelection = contextualSelectionResult?.contextualSelection || {};
  const resolvedItems = extractResolvedQuestionItems(
    contextualSelection?.resolvedStructuredQuestions
  );

  return resolvedItems
    .map((item, index) => normalizeResolvedQuestionItem(item, index))
    .filter((item) => Boolean(normalizeString(item?.narrativeRole)));
}

function narrativeRoleOrder(role) {
  const clean = normalizeString(role);

  if (clean === "WALKTHROUGH") return 1;
  if (clean === "ROLE_CONTEXT") return 2;
  if (clean === "CASE_1") return 3;
  if (clean === "DECISION_PROBE") return 4;
  if (clean === "PRESSURE_PROBE") return 5;
  if (clean === "DEPTH_CHECK") return 6;
  return 99;
}

function orderPrimaryQuestions(selected) {
  return [...selected]
    .sort((a, b) => {
      const roleDiff =
        narrativeRoleOrder(a?.narrativeRole) - narrativeRoleOrder(b?.narrativeRole);

      if (roleDiff !== 0) {
        return roleDiff;
      }

      const priorityDiff = priorityScore(b?.priority) - priorityScore(a?.priority);

      if (priorityDiff !== 0) {
        return priorityDiff;
      }

      return 0;
    })
    .map((item, index) => ({
      ...item,
      orderHint: index + 1
    }));
}

function findCandidateForRole(candidates, selected, narrativeRole) {
  return candidates.find((item) => {
    return (
      item?.narrativeRole === narrativeRole &&
      !isTooSimilarQuestion(item?.question || "", selected)
    );
  });
}

function hasRole(selected, narrativeRole) {
  return selected.some(
    (item) => normalizeString(item?.narrativeRole) === normalizeString(narrativeRole)
  );
}

function findBestOptionalProbe({
  familyCandidates,
  contextualCandidates,
  selected
}) {
  const orderedOptionalRoles = ["PRESSURE_PROBE", "DEPTH_CHECK"];

  for (const narrativeRole of orderedOptionalRoles) {
    const contextualCandidate = findCandidateForRole(
      contextualCandidates,
      selected,
      narrativeRole
    );

    if (contextualCandidate) {
      return contextualCandidate;
    }

    const familyCandidate = findCandidateForRole(
      familyCandidates,
      selected,
      narrativeRole
    );

    if (familyCandidate) {
      return familyCandidate;
    }
  }

  return null;
}

function familyAlreadyUsed(selected, familyKey) {
  const cleanFamilyKey = normalizeString(familyKey).toLowerCase();

  if (!cleanFamilyKey) {
    return false;
  }

  return selected.some(
    (item) => normalizeString(item?.familyKey).toLowerCase() === cleanFamilyKey
  );
}

function buildPrimaryQuestions({
  questionFamilySelections,
  contextualSelectionResult,
  interviewLengthMode,
  interviewFocusMode = "balanced"
}) {
  const targetCount = getTargetQuestionCount(interviewLengthMode);
  const narrativeTargets = getNarrativeTargets(targetCount, interviewFocusMode);

  const familyCandidates = buildCandidatesFromFamilySelections(questionFamilySelections);
  const contextualCandidates = buildContextualQuestionCandidates(contextualSelectionResult);

  const selected = [];

  for (const narrativeRole of narrativeTargets) {
    const picked = pickCandidateForRole({
      familyCandidates,
      contextualCandidates,
      selected,
      narrativeRole
    });

    if (picked) {
      addQuestionIfUseful(selected, picked);
    }
  }

  if (targetCount <= 4 && interviewFocusMode === "balanced") {
    const optionalProbe = findBestOptionalProbe({
      familyCandidates,
      contextualCandidates,
      selected
    });

    if (optionalProbe) {
      addQuestionIfUseful(selected, optionalProbe);
    }
  }

  const firstFallbackPool = [...contextualCandidates, ...familyCandidates].filter(
    (candidate) => {
      return !familyAlreadyUsed(selected, candidate?.familyKey);
    }
  );

  for (const candidate of firstFallbackPool) {
    if (selected.length >= targetCount) {
      break;
    }

    addQuestionIfUseful(selected, candidate);
  }

  const secondFallbackPool = [...contextualCandidates, ...familyCandidates];

  for (const candidate of secondFallbackPool) {
    if (selected.length >= targetCount) {
      break;
    }

    addQuestionIfUseful(selected, candidate);
  }

  if (targetCount <= 4) {
    const wantsPressure = interviewFocusMode === "pressure";
    const wantsDepth = interviewFocusMode === "depth";
    const wantsBalanced = interviewFocusMode === "balanced";

    let fallbackProbe = null;

    if (wantsPressure && !hasRole(selected, "PRESSURE_PROBE")) {
      fallbackProbe = findBestOptionalProbe({
        familyCandidates,
        contextualCandidates,
        selected: []
      });

      if (!fallbackProbe || fallbackProbe.narrativeRole !== "PRESSURE_PROBE") {
        fallbackProbe = {
          familyKey: "pressure_probe_fallback",
          familyLabel: "Gestione Attrito",
          priority: "medium",
          question:
            "Raccontami una situazione in cui hai ricevuto resistenza, obiezioni o disaccordo su una tua analisi o proposta. Come hai gestito la situazione e che posizione hai preso?",
          narrativeRole: "PRESSURE_PROBE",
          source: "hardcoded_fallback"
        };
      }
    }

    if (!fallbackProbe && wantsDepth && !hasRole(selected, "DEPTH_CHECK")) {
      fallbackProbe = {
        familyKey: "depth_check_fallback",
        familyLabel: "Verifica Profondità",
        priority: "medium",
        question:
          "Fammi un secondo esempio simile, così capisco se il tuo modo di ragionare resta coerente anche in un altro contesto. Che cosa hai imparato e cosa rifaresti diversamente?",
        narrativeRole: "DEPTH_CHECK",
        source: "hardcoded_fallback"
      };
    }

    if (
      !fallbackProbe &&
      wantsBalanced &&
      !hasRole(selected, "PRESSURE_PROBE") &&
      !hasRole(selected, "DEPTH_CHECK")
    ) {
      fallbackProbe = findBestOptionalProbe({
        familyCandidates,
        contextualCandidates,
        selected: []
      });

      if (!fallbackProbe) {
        fallbackProbe = {
          familyKey: "pressure_probe_fallback",
          familyLabel: "Gestione Attrito",
          priority: "medium",
          question:
            "Raccontami una situazione in cui hai ricevuto resistenza, obiezioni o disaccordo su una tua analisi o proposta. Come hai gestito la situazione e che posizione hai preso?",
          narrativeRole: "PRESSURE_PROBE",
          source: "hardcoded_fallback"
        };
      }
    }

    if (fallbackProbe) {
      let replaceIndex = [...selected]
        .map((item, index) => ({ item, index }))
        .reverse()
        .find(({ item }) => {
          const role = normalizeString(item?.narrativeRole);
          return role === "WALKTHROUGH";
        });

      if (!replaceIndex) {
        replaceIndex = [...selected]
          .map((item, index) => ({ item, index }))
          .reverse()
          .find(({ item }) => {
            const role = normalizeString(item?.narrativeRole);
            return role === "ROLE_CONTEXT";
          });
      }

      if (replaceIndex && !isTooSimilarQuestion(fallbackProbe.question, selected)) {
        selected[replaceIndex.index] = {
          ...fallbackProbe,
          orderHint: replaceIndex.index + 1
        };
      }
    }
  }

  return orderPrimaryQuestions(selected.slice(0, targetCount));
}

function buildFallbackFollowupSelections({
  existingSelections,
  followupPacksConfig,
  primaryQuestions
}) {
  if (ensureArray(existingSelections).length > 0) {
    return existingSelections;
  }

  const packMap = followupPacksConfig?.packs || {};
  const availableTriggers = Object.keys(packMap);
  const fallbackOrder = [];

  const narrativeRoles = ensureArray(primaryQuestions).map((item) => item?.narrativeRole);

  if (narrativeRoles.includes("ROLE_CONTEXT")) {
    fallbackOrder.push("transferability_probe");
  }

  if (narrativeRoles.includes("CASE_1")) {
    fallbackOrder.push("achievement_quantification");
    fallbackOrder.push("responsibility_probe");
  }

  if (narrativeRoles.includes("DECISION_PROBE")) {
    fallbackOrder.push("decision_tradeoff_probe");
  }

  if (narrativeRoles.includes("PRESSURE_PROBE")) {
    fallbackOrder.push("stakeholder_examples");
  }

  if (narrativeRoles.includes("DEPTH_CHECK")) {
    fallbackOrder.push("consistency_probe");
  }

  fallbackOrder.push("responsibility_probe");

  const uniqueFallbackOrder = uniqueStrings(
    fallbackOrder.filter((triggerType) => availableTriggers.includes(triggerType))
  );

  return uniqueFallbackOrder.slice(0, 2).map((triggerType) => {
    const packConfig = packMap[triggerType];

    return {
      triggerType,
      label: packConfig?.label || triggerType,
      goal: packConfig?.goal || "",
      activationReason: "Fallback pack added to preserve probing depth in short interview mode.",
      followups: ensureArray(packConfig?.followups)
    };
  });
}

function buildConversationFlow(
  interviewPlan,
  questionFamilySelections,
  followupSelections,
  primaryQuestions
) {
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
    narrativePlan: ensureArray(primaryQuestions).map((item, index) => ({
      order: index + 1,
      familyKey: item.familyKey,
      familyLabel: item.familyLabel,
      narrativeRole: item.narrativeRole || "",
      source: item.source || "unknown"
    })),
    followupActivationOrder: followupSelections.map((item) => ({
      triggerType: item.triggerType,
      label: item.label
    }))
  };
}

function findReplaceableRoleContextIndex(primaryQuestions) {
  return [...primaryQuestions]
    .map((item, index) => ({ item, index }))
    .find(({ item }) => {
      const role = normalizeString(item?.narrativeRole);
      const source = normalizeString(item?.source);
      return role === "ROLE_CONTEXT" && source === "family_selection";
    })?.index;
}

async function applyGapDrivenQuestionGeneration({
  primaryQuestions,
  candidateProfile,
  roleProfile,
  jobFitAnalysis,
  interviewPlan,
  locale,
  modelAdapter
}) {
  if (typeof modelAdapter !== "function") {
    return {
      primaryQuestions,
      generatedQuestion: null
    };
  }

  const replaceIndex = findReplaceableRoleContextIndex(primaryQuestions);

  if (!Number.isInteger(replaceIndex)) {
    return {
      primaryQuestions,
      generatedQuestion: null
    };
  }

  try {
    const generatedQuestion = await generateGapDrivenInterviewQuestion({
      candidateProfile,
      roleProfile,
      jobFitAnalysis,
      interviewPlan,
      locale,
      modelAdapter
    });

    if (!generatedQuestion?.question) {
      return {
        primaryQuestions,
        generatedQuestion: null
      };
    }

    const otherQuestions = primaryQuestions.filter((_, index) => index !== replaceIndex);

    if (isTooSimilarQuestion(generatedQuestion.question, otherQuestions)) {
      return {
        primaryQuestions,
        generatedQuestion: null
      };
    }

    const updatedQuestions = [...primaryQuestions];
    updatedQuestions[replaceIndex] = {
      ...updatedQuestions[replaceIndex],
      ...generatedQuestion,
      orderHint: updatedQuestions[replaceIndex]?.orderHint || replaceIndex + 1
    };

    return {
      primaryQuestions: orderPrimaryQuestions(updatedQuestions),
      generatedQuestion
    };
  } catch (error) {
    return {
      primaryQuestions,
      generatedQuestion: null,
      generationError: normalizeString(error?.message) || "gap_question_generation_failed"
    };
  }
}

export async function buildInterviewQuestionSet({
  interviewPlan,
  candidateProfile,
  roleProfile,
  jobFitAnalysis,
  interviewLengthMode,
  interviewFocusMode = "balanced",
  recentQuestionKeys = [],
  recentQuestionHistory = [],
  modelAdapter = null
}) {
  if (!interviewPlan || typeof interviewPlan !== "object") {
    throw new Error("buildInterviewQuestionSet: interviewPlan is required.");
  }

  const normalizedRecentQuestionKeys = uniqueStrings(recentQuestionKeys);
  const normalizedRecentQuestionHistory = normalizeRecentQuestionHistory(
    recentQuestionHistory
  );

  const locale = getInterviewLocale();
  const { questionFamilies, followupPacks } = await loadInterviewConfig();

  const questionFamilySelections = buildQuestionFamilySelections({
    interviewPlan,
    questionFamiliesConfig: questionFamilies,
    locale
  });

  const contextualSelectionResult = buildContextualSelection({
    candidateProfile,
    roleProfile,
    jobFitAnalysis,
    interviewLengthMode,
    recentQuestionKeys: normalizedRecentQuestionKeys,
    recentQuestionHistory: normalizedRecentQuestionHistory
  });

  const baselinePrimaryQuestions = buildPrimaryQuestions({
    questionFamilySelections,
    contextualSelectionResult,
    interviewLengthMode,
    interviewFocusMode
  });

  const gapQuestionGenerationResult = await applyGapDrivenQuestionGeneration({
    primaryQuestions: baselinePrimaryQuestions,
    candidateProfile,
    roleProfile,
    jobFitAnalysis,
    interviewPlan,
    locale,
    modelAdapter
  });

  const primaryQuestions = gapQuestionGenerationResult.primaryQuestions;

  const planBasedFollowups = buildFollowupSelections({
    interviewPlan,
    followupPacksConfig: followupPacks
  });

  const followupSelections = buildFallbackFollowupSelections({
    existingSelections: planBasedFollowups,
    followupPacksConfig: followupPacks,
    primaryQuestions
  });

  const conversationFlow = buildConversationFlow(
    interviewPlan,
    questionFamilySelections,
    followupSelections,
    primaryQuestions
  );

  return {
    interviewQuestionSet: {
      sessionStrategy: interviewPlan.sessionStrategy || {},
      priorityTopics: ensureArray(interviewPlan.priorityTopics),
      selectedQuestionFamilies: questionFamilySelections,
      primaryQuestions,
      selectedFollowupPacks: followupSelections,
      conversationFlow,
      reportEmphasis: interviewPlan.reportEmphasis || {},
      recentQuestionKeys: normalizedRecentQuestionKeys,
      recentQuestionHistory: normalizedRecentQuestionHistory,
      llmGapQuestion: gapQuestionGenerationResult.generatedQuestion || null,
      llmGapQuestionGenerationError:
        gapQuestionGenerationResult.generationError || "",
      ...contextualSelectionResult
    }
  };
}