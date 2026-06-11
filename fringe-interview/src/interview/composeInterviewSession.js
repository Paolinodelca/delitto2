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

function firstMeaningful(items) {
  for (const item of ensureArray(items)) {
    const clean = normalizeString(item);
    if (clean) {
      return clean;
    }
  }

  return "";
}

function humanizeStageLabel(stage) {
  const clean = normalizeString(stage);

  if (!clean) {
    return "Approfondimento";
  }

  if (clean === "mandatory") return "Aderenza al ruolo";
  if (clean === "seniority") return "Livello di responsabilità";
  if (clean === "secondary") return "Approfondimento";
  if (clean === "person_perception") return "Modo di lavorare";
  if (clean === "closing") return "Chiusura";

  return clean
    .split("_")
    .map((item) => item.charAt(0).toUpperCase() + item.slice(1))
    .join(" ");
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

function lowerFirst(text) {
  const clean = normalizeString(text);
  if (!clean) {
    return "";
  }

  return clean.charAt(0).toLowerCase() + clean.slice(1);
}

function humanizeReferencePhrase(text) {
  let clean = normalizeString(text);

  if (!clean) {
    return "";
  }

  clean = clean.replace(/\s+/g, " ").trim();

  const replacements = [
    {
      pattern: /^limitata esperienza di\s+/i,
      replacement: "l’esperienza maturata fin qui su "
    },
    {
      pattern: /^mancanza di esperienza diretta (nel|nella|nei|nelle)\s+/i,
      replacement: "l’esperienza diretta "
    },
    {
      pattern: /^mancanza di esperienza\s+/i,
      replacement: "l’esperienza "
    },
    {
      pattern: /^livello di\s+/i,
      replacement: ""
    },
    {
      pattern: /^esperienza di lavoro a stretto contatto con\s+/i,
      replacement: "quanto hai lavorato davvero a stretto contatto con "
    },
    {
      pattern: /^esperienza nella gestione dei clienti$/i,
      replacement: "la gestione del rapporto con clienti e stakeholder"
    },
    {
      pattern: /^esperienza di leadership$/i,
      replacement: "la leadership esercitata fin qui"
    },
    {
      pattern: /^competenze tecniche in\s+/i,
      replacement: "la tua solidità su "
    },
    {
      pattern: /^competenze tecniche$/i,
      replacement: "la tua base tecnica"
    }
  ];

  for (const rule of replacements) {
    if (rule.pattern.test(clean)) {
      clean = clean.replace(rule.pattern, rule.replacement);
      break;
    }
  }

  clean = clean.replace(/\s+/g, " ").trim();

  if (!clean) {
    return "";
  }

  return lowerFirst(clean);
}

/**
 * Opening realistico:
 * - introduce il colloquio
 * - non anticipa 3 verifiche insieme
 * - non suona come una domanda multipla mascherata
 */
function buildOpeningScript({
  priorityTopic,
  validationTopic
}) {
  const mainTopic = humanizeReferencePhrase(priorityTopic || validationTopic);

  if (mainTopic) {
    return `Partirei dal tuo percorso per capire come si avvicina a questo ruolo, soprattutto rispetto a ${mainTopic}.`;
  }

  return "Partirei dal tuo percorso per capire come si avvicina a questo ruolo e quali sono i punti di maggiore aderenza.";
}


function buildOpeningBlock(interviewPlan, interviewQuestionSet, locale) {
  const openingMove = interviewQuestionSet?.conversationFlow?.openingMove || {};
  const priorityTopics = ensureArray(interviewQuestionSet?.priorityTopics);

  const validateFirst = ensureArray(openingMove.validateFirst);
  const clarifyEarly = ensureArray(openingMove.clarifyEarly);
  const monitorRisks = ensureArray(openingMove.monitorRisks);

  const priorityTopic = firstMeaningful(priorityTopics);
  const validationTopic = firstMeaningful(validateFirst);

  const openingPrompt =
    "Puoi raccontarmi il tuo percorso professionale, concentrandoti sulle esperienze più rilevanti per questo ruolo? Mi interessa capire ruoli ricoperti, contesti, responsabilità, durata indicativa e risultati principali.";

  return {
    blockType: "opening",
    objective:
      "Far emergere il racconto iniziale del percorso professionale, così da capire quali esperienze, responsabilità e segnali di credibilità possono sostenere le risposte successive.",
    displayLabel: "Racconto del percorso",
    validateFirst,
    clarifyEarly,
    monitorRisks,
    priorityTopics: priorityTopics.slice(0, 3),

    openingPrompt,
    question: openingPrompt,
    prompt: openingPrompt,
    questionText: openingPrompt,
    questionKey: "opening_career_walkthrough",
    familyKey: "opening_positioning",
    familyLabel: "Racconto iniziale del percorso",
    narrativeRole: "opening",
    expectedSignals: [
      "timeline",
      "ownership",
      "responsibility",
      "role_relevance",
      "specificity",
      "evidence"
    ],

    openingScript: buildOpeningScript({
      priorityTopic,
      validationTopic
    })
  };
}


function buildMandatoryReference(strength) {
  const clean = humanizeReferencePhrase(strength);
  if (!clean) {
    return "";
  }

  if (clean.startsWith("la tua")) {
    return `In questo ruolo quella parte conta davvero, quindi voglio capire ${clean}.`;
  }

  return `In questo ruolo quella parte conta davvero, quindi voglio capire quanto sei solido su ${clean}.`;
}

function buildSeniorityReference(clarification) {
  const clean = humanizeReferencePhrase(clarification);
  if (!clean) {
    return "";
  }

  if (clean.startsWith("quanto")) {
    return `Qui mi interessa capire ${clean}.`;
  }

  return `Qui mi interessa capire quanta autonomia avevi davvero, soprattutto su ${clean}.`;
}

function buildSecondaryReference(strength) {
  const clean = humanizeReferencePhrase(strength);
  if (!clean) {
    return "";
  }

  return `Per questo ruolo non basta una familiarità generale: voglio capire quanto hai lavorato davvero in profondità su ${clean}.`;
}

function buildPersonPerceptionReference(risk) {
  const clean = humanizeReferencePhrase(risk);
  if (!clean) {
    return "";
  }

  if (clean.startsWith("l’esperienza")) {
    return `In un contesto come questo conta anche come reagisci quando senti di avere meno basi o meno sicurezza, per esempio su ${clean}.`;
  }

  return `In un contesto come questo conta anche come reagisci quando emerge un punto di pressione, per esempio su ${clean}.`;
}

function buildJdReferenceLine(stage, interviewQuestionSet, index) {
  const reportEmphasis = interviewQuestionSet?.reportEmphasis || {};
  const strengthsToValidate = ensureArray(reportEmphasis.strengthsToValidate);
  const risksToTest = ensureArray(reportEmphasis.risksToTest);
  const clarificationsToCollect = ensureArray(
    reportEmphasis.clarificationsToCollect
  );

  const strength = firstMeaningful(strengthsToValidate);
  const risk = firstMeaningful(risksToTest);
  const clarification = firstMeaningful(clarificationsToCollect);

  if (stage === "mandatory") {
    return buildMandatoryReference(strength);
  }

  if (stage === "seniority") {
    return buildSeniorityReference(clarification);
  }

  if (stage === "secondary" && index === 0) {
    return buildSecondaryReference(strength);
  }

  if (stage === "person_perception") {
    return buildPersonPerceptionReference(risk);
  }

  return "";
}

function mapNarrativeRoleToDisplayLabel(narrativeRole, familyLabel, index) {
  if (narrativeRole === "WALKTHROUGH") {
    return "Percorso";
  }

  if (narrativeRole === "ROLE_CONTEXT") {
    return "Aderenza al ruolo";
  }

  if (narrativeRole === "CASE_1") {
    return "Caso concreto";
  }

  if (narrativeRole === "DECISION_PROBE") {
    return "Decisione";
  }

  if (narrativeRole === "PRESSURE_PROBE") {
    return "Pressione / Attrito";
  }

  if (narrativeRole === "DEPTH_CHECK") {
    return "Verifica profondità";
  }

  return normalizeString(familyLabel) || `Domanda ${index + 1}`;
}

/**
 * Lead-in più sobri.
 * Devono accompagnare la progressione, non rubare il focus alla domanda vera.
 */
function mapNarrativeRoleToLeadIn(narrativeRole, index) {
  if (narrativeRole === "WALKTHROUGH") {
    return index === 0
      ? "Parto dal tuo percorso."
      : "Resto ancora un attimo sul tuo percorso.";
  }

  if (narrativeRole === "ROLE_CONTEXT") {
    return "Voglio capire quanto questo percorso si trasferisce davvero nel ruolo.";
  }

  if (narrativeRole === "CASE_1") {
    return "Andiamo su un caso concreto.";
  }

  if (narrativeRole === "DECISION_PROBE") {
    return "Qui mi interessa la tua logica di scelta.";
  }

  if (narrativeRole === "PRESSURE_PROBE") {
    return "Adesso voglio capire come gestisci pressione e attrito.";
  }

  if (narrativeRole === "DEPTH_CHECK") {
    return "Ti porto su un secondo esempio per verificare se il pattern regge.";
  }

  return index === 0
    ? "Parto da un punto importante per il ruolo."
    : "Su questo voglio approfondire meglio.";
}

function mapNarrativeRoleToIntent(narrativeRole) {
  if (narrativeRole === "WALKTHROUGH") return "walkthrough";
  if (narrativeRole === "ROLE_CONTEXT") return "role_context";
  if (narrativeRole === "CASE_1") return "case_probe";
  if (narrativeRole === "DECISION_PROBE") return "decision_probe";
  if (narrativeRole === "PRESSURE_PROBE") return "pressure_probe";
  if (narrativeRole === "DEPTH_CHECK") return "depth_check";
  return "core_question";
}

function buildPrimaryQuestionObjective(item, locale) {
  const familyLabel = normalizeString(item?.familyLabel) || "tema rilevante";
  const narrativeRole = normalizeString(item?.narrativeRole);

  if (narrativeRole === "ROLE_CONTEXT") {
    return `Esplorare l’aderenza reale tra esperienza del candidato e ruolo target, partendo da ${familyLabel}.`;
  }

  if (narrativeRole === "CASE_1") {
    return `Portare il candidato su un episodio concreto per testare profondità, dettaglio e ownership su ${familyLabel}.`;
  }

  if (narrativeRole === "DECISION_PROBE") {
    return `Testare capacità di scelta, giudizio e trade-off a partire da ${familyLabel}.`;
  }

  if (narrativeRole === "PRESSURE_PROBE") {
    return `Esplorare gestione di pressione, attrito e stakeholder su ${familyLabel}.`;
  }

  if (narrativeRole === "DEPTH_CHECK") {
    return `Verificare consistenza e autenticità del pattern emerso, approfondendo ${familyLabel}.`;
  }

  if (narrativeRole === "WALKTHROUGH") {
    return "Ricostruire il percorso del candidato e il filo logico delle sue esperienze rilevanti.";
  }

  return `${locale.interview.coreObjectivePrefix} ${familyLabel}.`;
}

function buildPrimaryCoreQuestionBlocks(interviewQuestionSet, locale) {
  const primaryQuestions = ensureArray(interviewQuestionSet?.primaryQuestions);

  return primaryQuestions
    .filter((item) => normalizeString(item?.question))
    .map((item, index) => ({
      blockType: "core_question",
      sequence: index + 1,
      familyKey: normalizeString(item?.familyKey) || `primary_${index + 1}`,
      familyLabel: normalizeString(item?.familyLabel) || `Tema ${index + 1}`,
      displayLabel: mapNarrativeRoleToDisplayLabel(
        item?.narrativeRole,
        item?.familyLabel,
        index
      ),
      priority: normalizeString(item?.priority) || "medium",
      question: normalizeString(item?.question),
      leadIn: mapNarrativeRoleToLeadIn(item?.narrativeRole, index),
      jdReferenceLine: "",
      source: normalizeString(item?.source) || "primary_questions",
      interviewerIntent: mapNarrativeRoleToIntent(item?.narrativeRole),
      narrativeRole: normalizeString(item?.narrativeRole),
      objective: buildPrimaryQuestionObjective(item, locale)
    }));
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

  return filteredItems
    .map((item, index) => {
      const stage = normalizeString(item?.stage).toLowerCase() || "contextual";
      const familyLabel =
        normalizeString(item?.familyLabel) ||
        normalizeString(item?.categoryLabel) ||
        humanizeStageLabel(stage);

      const prompt =
        normalizeString(item?.prompt) ||
        normalizeString(item?.question);

      if (!prompt) {
        return null;
      }

      return {
        blockType: "core_question",
        sequence: index + 1,
        familyKey: normalizeString(item?.key) || `contextual_${index + 1}`,
        familyLabel,
        displayLabel: humanizeStageLabel(stage),
        priority: stage,
        question: prompt,
        leadIn: mapNarrativeRoleToLeadIn("", index),
        jdReferenceLine: buildJdReferenceLine(stage, interviewQuestionSet, index),
        source: "contextual_structured_selection",
        contextualStage: stage,
        toneUsed: normalizeString(item?.toneUsed) || "",
        toneSource: normalizeString(item?.source) || "",
        interviewerIntent: stage,
        narrativeRole: "",
        objective: `${locale.interview.coreObjectivePrefix} ${familyLabel} ${locale.interview.coreObjectiveSuffix} ${stage} ${locale.interview.coreObjectiveEnding}`
      };
    })
    .filter(Boolean);
}

function buildLegacyCoreQuestionBlocks(interviewQuestionSet, locale) {
  const primaryQuestions = ensureArray(interviewQuestionSet?.primaryQuestions);

  return primaryQuestions
    .filter((item) => normalizeString(item?.question))
    .map((item, index) => ({
      blockType: "core_question",
      sequence: index + 1,
      familyKey: item.familyKey,
      familyLabel: item.familyLabel,
      displayLabel: normalizeString(item.familyLabel) || `Domanda ${index + 1}`,
      priority: item.priority,
      question: item.question,
      leadIn:
        index === 0
          ? "Parto da un punto importante per il ruolo."
          : "Su questo voglio approfondire meglio.",
      jdReferenceLine: "",
      source: "legacy_primary_questions",
      interviewerIntent: "legacy_question",
      narrativeRole: normalizeString(item?.narrativeRole),
      objective: `${locale.interview.coreObjectivePrefix} ${item.familyLabel} ${locale.interview.coreObjectiveSuffix} ${item.priority} ${locale.interview.coreObjectiveEnding}`
    }));
}

function buildCoreQuestionBlocks(interviewQuestionSet, locale) {
  const primaryBlocks = buildPrimaryCoreQuestionBlocks(interviewQuestionSet, locale);

  if (primaryBlocks.length > 0) {
    return primaryBlocks;
  }

  const contextualBlocks = buildContextualCoreQuestionBlocks(
    interviewQuestionSet,
    locale
  );

  if (contextualBlocks.length > 0) {
    return contextualBlocks;
  }

  return buildLegacyCoreQuestionBlocks(interviewQuestionSet, locale);
}

function buildFollowupBlocks(interviewQuestionSet) {
  const selectedFollowupPacks = ensureArray(interviewQuestionSet?.selectedFollowupPacks);

  return selectedFollowupPacks
    .filter((item) => normalizeString(item?.triggerType))
    .map((item, index) => ({
      blockType: "followup_pack",
      sequence: index + 1,
      triggerType: normalizeString(item?.triggerType),
      label: normalizeString(item?.label) || `Follow-up ${index + 1}`,
      goal: normalizeString(item?.goal),
      activationReason:
        normalizeString(item?.activationReason) ||
        "Follow-up pack selected to deepen weak or ambiguous signals.",
      followups: ensureArray(item?.followups).filter((followup) =>
        Boolean(normalizeString(followup))
      )
    }));
}

function buildClosingLeadIn(reportEmphasis) {
  const strengthsToValidate = ensureArray(reportEmphasis?.strengthsToValidate);
  const risksToTest = ensureArray(reportEmphasis?.risksToTest);

  const strength = firstMeaningful(strengthsToValidate);
  const risk = firstMeaningful(risksToTest);

  if (strength && risk) {
    return "Ti faccio un’ultima domanda per chiudere con un messaggio chiaro su punti forti e possibili dubbi.";
  }

  if (strength) {
    return "Ti faccio un’ultima domanda per capire quale messaggio vuoi lasciare sui tuoi punti forti rispetto al ruolo.";
  }

  return "Ti faccio un’ultima domanda prima di chiudere.";
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
    displayLabel: "Chiusura",
    confirmStrengths: strengthsToValidate.slice(0, 3),
    unresolvedRisks: risksToTest.slice(0, 3),
    finalClarificationsNeeded: clarificationsToCollect.slice(0, 3),
    reportUsefulHints: cvImprovementHints.slice(0, 3),
    closingLeadIn: buildClosingLeadIn(reportEmphasis),
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
  const followupBlocks = buildFollowupBlocks(interviewQuestionSet);
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

export default composeInterviewSession;