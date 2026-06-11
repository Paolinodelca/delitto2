import { loadInterviewLengthModes } from "./loadInterviewLengthModes.js";
import loadQuestionRelevanceMatrix from "./loadQuestionRelevanceMatrix.js";
import evaluateQuestionFamilyRelevance from "./evaluateQuestionFamilyRelevance.js";

function ensureArray(value) {
  return Array.isArray(value) ? value : [];
}

function normalizeString(value) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

function uniqueStrings(items) {
  const seen = new Set();
  const result = [];

  for (const item of ensureArray(items)) {
    const clean = normalizeString(item);
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

function buildLowercaseSet(items) {
  return new Set(uniqueStrings(items).map((item) => item.toLowerCase()));
}

function buildRoleTraits(interviewContextProfile) {
  const companyContext = normalizeString(interviewContextProfile?.companyContext).toLowerCase();
  const seniorityContext = normalizeString(interviewContextProfile?.seniorityContext).toLowerCase();
  const defaultTone = normalizeString(interviewContextProfile?.defaultTone).toLowerCase();

  return {
    leadership: ["senior", "lead", "executive"].includes(seniorityContext),
    stakeholder_exposure:
      companyContext === "consultancy_client_facing" ||
      companyContext === "client_facing" ||
      companyContext === "cross_functional",
    execution_intensity:
      seniorityContext === "junior" ||
      seniorityContext === "entry" ||
      defaultTone === "pressure"
  };
}

function getFamilyRelevanceBand({
  matrix,
  familyKey,
  interviewContextProfile
}) {
  const result = evaluateQuestionFamilyRelevance({
    matrix,
    familyKey,
    seniority: normalizeString(interviewContextProfile?.seniorityContext),
    roleTraits: buildRoleTraits(interviewContextProfile)
  });

  return normalizeString(result?.band).toLowerCase() || "medium";
}


function pickTopByCategory(
  rankedQuestions,
  category,
  limit = 1,
  excludedKeys = [],
  recentQuestionKeys = []
) {
  const excluded = buildLowercaseSet(excludedKeys);
  const recent = buildLowercaseSet(recentQuestionKeys);

  const matching = ensureArray(rankedQuestions).filter((item) => {
    const key = normalizeString(item?.key).toLowerCase();

    return (
      normalizeString(item?.category) === category &&
      key &&
      !excluded.has(key)
    );
  });

  const preferred = matching.filter((item) => {
    const key = normalizeString(item?.key).toLowerCase();
    return !recent.has(key);
  });

  if (preferred.length >= limit) {
    return preferred.slice(0, limit);
  }

  return matching.slice(0, limit);
}

function pickFirstAvailableByCategory(
  rankedQuestions,
  category,
  excludedKeys = [],
  recentQuestionKeys = []
) {
  const picks = pickTopByCategory(
    rankedQuestions,
    category,
    1,
    excludedKeys,
    recentQuestionKeys
  );

  return picks[0] || null;
}

function extractReasonValue(reasons, prefix) {
  for (const reason of ensureArray(reasons)) {
    const clean = normalizeString(reason);
    if (clean.startsWith(prefix)) {
      return clean.slice(prefix.length);
    }
  }

  return "";
}

function getQuestionRelevanceBand(question) {
  return normalizeString(
    extractReasonValue(question?.reasons, "relevanceBand:")
  ).toLowerCase();
}

function preferNonLowRelevanceQuestions(items, limit = 1) {
  const questions = ensureArray(items);
  const preferred = questions.filter((item) => {
    const band = getQuestionRelevanceBand(item);
    return band !== "low" && band !== "off";
  });

  if (preferred.length >= limit) {
    return preferred.slice(0, limit);
  }

  return questions.slice(0, limit);
}



function pickTopExcludingKeys(
  rankedQuestions,
  excludedKeys,
  limit = 1,
  recentQuestionKeys = []
) {
  const excluded = buildLowercaseSet(excludedKeys);
  const recent = buildLowercaseSet(recentQuestionKeys);

  const matching = ensureArray(rankedQuestions).filter((item) => {
    const key = normalizeString(item?.key).toLowerCase();
    return key && !excluded.has(key);
  });

  const preferred = matching.filter((item) => {
    const key = normalizeString(item?.key).toLowerCase();
    return !recent.has(key);
  });

  if (preferred.length >= limit) {
    return preferNonLowRelevanceQuestions(preferred, limit);
  }

  return preferNonLowRelevanceQuestions(matching, limit);
}


function pickTopExcludingKeysByCategory(
  rankedQuestions,
  excludedKeys,
  category,
  limit = 1,
  recentQuestionKeys = []
) {
  const excluded = buildLowercaseSet(excludedKeys);
  const recent = buildLowercaseSet(recentQuestionKeys);

  const matching = ensureArray(rankedQuestions).filter((item) => {
    const key = normalizeString(item?.key).toLowerCase();
    return (
      normalizeString(item?.category) === category &&
      key &&
      !excluded.has(key)
    );
  });

  const preferred = matching.filter((item) => {
    const key = normalizeString(item?.key).toLowerCase();
    return !recent.has(key);
  });

  if (preferred.length >= limit) {
    return preferNonLowRelevanceQuestions(preferred, limit);
  }

  return preferNonLowRelevanceQuestions(matching, limit);
}

function shouldForceSeniorityCalibration(interviewContextProfile) {
  const seniorityContext = normalizeString(
    interviewContextProfile?.seniorityContext
  );

  return ["senior", "lead", "executive"].includes(seniorityContext);
}

function shouldForcePressureSignal(interviewContextProfile, pressureRelevanceBand) {
  const companyContext = normalizeString(interviewContextProfile?.companyContext);
  const toneMode = normalizeString(interviewContextProfile?.defaultTone);
  const relevanceBand = normalizeString(pressureRelevanceBand).toLowerCase();

  if (relevanceBand === "low" || relevanceBand === "off") {
    return false;
  }

  return (
    companyContext === "consultancy_client_facing" ||
    toneMode === "pressure" ||
    relevanceBand === "high"
  );
}

function isJuniorLike(interviewContextProfile) {
  const seniorityContext = normalizeString(
    interviewContextProfile?.seniorityContext
  );

  return ["entry", "junior"].includes(seniorityContext);
}

function resolveInterviewLengthMode(requestedMode) {
  const { interviewLengthModes } = loadInterviewLengthModes();

  const normalizedRequestedMode = normalizeString(requestedMode);
  const supportedModes = ensureArray(interviewLengthModes?.supportedModes);

  const modeKey = supportedModes.includes(normalizedRequestedMode)
    ? normalizedRequestedMode
    : interviewLengthModes.defaultMode;

  return {
    modeKey,
    modeConfig: interviewLengthModes.modes[modeKey],
    defaultMode: interviewLengthModes.defaultMode
  };
}

function buildSelectionRationale({
  contextProfile,
  interviewLengthMode,
  mandatoryQuestions,
  seniorityQuestions,
  secondaryQuestions,
  personPerceptionQuestions,
  closingQuestions,
  recentQuestionKeys
}) {
  const rationale = [];

  const seniorityContext = normalizeString(contextProfile?.seniorityContext);
  const companyContext = normalizeString(contextProfile?.companyContext);
  const defaultTone = normalizeString(contextProfile?.defaultTone);

  if (seniorityContext) {
    rationale.push(`seniority_context:${seniorityContext}`);
  }

  if (companyContext) {
    rationale.push(`company_context:${companyContext}`);
  }

  if (defaultTone) {
    rationale.push(`tone_mode:${defaultTone}`);
  }

  if (interviewLengthMode) {
    rationale.push(`interview_length_mode:${interviewLengthMode}`);
  }

  if (ensureArray(recentQuestionKeys).length > 0) {
    rationale.push(`recent_key_avoidance:${uniqueStrings(recentQuestionKeys).join(",")}`);
  }

  if (mandatoryQuestions.length > 0) {
    rationale.push(
      `mandatory_role_fit:${mandatoryQuestions.map((item) => item.key).join(",")}`
    );
  }

  if (seniorityQuestions.length > 0) {
    rationale.push(
      `seniority_calibration:${seniorityQuestions.map((item) => item.key).join(",")}`
    );
  }

  if (secondaryQuestions.length > 0) {
    rationale.push(
      `secondary_selection:${secondaryQuestions.map((item) => item.key).join(",")}`
    );
  }

  if (personPerceptionQuestions.length > 0) {
    rationale.push(
      `person_perception:${personPerceptionQuestions.map((item) => item.key).join(",")}`
    );
  }

  if (closingQuestions.length > 0) {
    rationale.push(
      `closing_selection:${closingQuestions.map((item) => item.key).join(",")}`
    );
  }

  return rationale;
}

export function deriveQuestionSelectionStrategy({
  interviewContextProfile,
  rankedStructuredQuestions,
  interviewLengthMode,
  recentQuestionKeys = []
}) {
  if (!interviewContextProfile || typeof interviewContextProfile !== "object") {
    throw new Error(
      "deriveQuestionSelectionStrategy: interviewContextProfile is required."
    );
  }

  if (!rankedStructuredQuestions || typeof rankedStructuredQuestions !== "object") {
    throw new Error(
      "deriveQuestionSelectionStrategy: rankedStructuredQuestions is required."
    );
  }



    const rankedQuestions = ensureArray(rankedStructuredQuestions?.rankedQuestions);
  const juniorMode = isJuniorLike(interviewContextProfile);
  const normalizedRecentQuestionKeys = uniqueStrings(recentQuestionKeys);
  const questionRelevanceMatrix = loadQuestionRelevanceMatrix();

  const roleFitRelevanceBand = getFamilyRelevanceBand({
    matrix: questionRelevanceMatrix,
    familyKey: "role_fit",
    interviewContextProfile
  });

  const motivationRelevanceBand = getFamilyRelevanceBand({
    matrix: questionRelevanceMatrix,
    familyKey: "motivation_for_change",
    interviewContextProfile
  });

  const pressureRelevanceBand = getFamilyRelevanceBand({
    matrix: questionRelevanceMatrix,
    familyKey: "conflict_pressure",
    interviewContextProfile
  });

  const decisionRelevanceBand = getFamilyRelevanceBand({
    matrix: questionRelevanceMatrix,
    familyKey: "decision_tradeoff",
    interviewContextProfile
  });


  const {
    modeKey,
    modeConfig,
    defaultMode
  } = resolveInterviewLengthMode(interviewLengthMode);

  const mandatoryRoleFitCount = juniorMode
    ? modeConfig.mandatoryRoleFitCountJunior
    : modeConfig.mandatoryRoleFitCountDefault;

  const mandatoryQuestions = pickTopByCategory(
    rankedQuestions,
    "role_fit",
    mandatoryRoleFitCount,
    [],
    normalizedRecentQuestionKeys
  );
  const mandatoryQuestionKeys = mandatoryQuestions.map((item) => item.key);

  const closingQuestions = pickTopByCategory(
    rankedQuestions,
    "closing",
    modeConfig.closingQuestionCount,
    [],
    normalizedRecentQuestionKeys
  );
  const closingQuestionKeys = closingQuestions.map((item) => item.key);

  const personPerceptionQuestions = pickTopByCategory(
    rankedQuestions,
    "person_perception",
    modeConfig.personPerceptionQuestionCount,
    [],
    normalizedRecentQuestionKeys
  );
  const personPerceptionQuestionKeys = personPerceptionQuestions.map(
    (item) => item.key
  );

  const baseExcludedKeys = [
    ...mandatoryQuestionKeys,
    ...closingQuestionKeys,
    ...personPerceptionQuestionKeys
  ];

  const seniorityQuestions = [];

  if (
    modeConfig.includeForcedSeniorityQuestion &&
    shouldForceSeniorityCalibration(interviewContextProfile)
  ) {
    const seniorityPick = pickFirstAvailableByCategory(
      rankedQuestions,
      "seniority_calibration",
      baseExcludedKeys,
      normalizedRecentQuestionKeys
    );

    if (seniorityPick) {
      seniorityQuestions.push(seniorityPick);
    }
  }

  const seniorityQuestionKeys = seniorityQuestions.map((item) => item.key);

  let excludedKeys = [
    ...baseExcludedKeys,
    ...seniorityQuestionKeys
  ];

  const secondaryQuestions = [];
  const secondaryQuestionCount = juniorMode
    ? modeConfig.secondaryQuestionCountJunior
    : modeConfig.secondaryQuestionCountDefault;

  if (secondaryQuestionCount > 0) {
    if (juniorMode) {
      const juniorSecondary = [];

      juniorSecondary.push(
        ...pickTopExcludingKeysByCategory(
          rankedQuestions,
          excludedKeys,
          "seniority_calibration",
          1,
          normalizedRecentQuestionKeys
        )
      );

      excludedKeys = [
        ...excludedKeys,
        ...juniorSecondary.map((item) => item.key)
      ];

      if (juniorSecondary.length < secondaryQuestionCount) {
        const remaining = secondaryQuestionCount - juniorSecondary.length;

        const extraRoleFit = pickTopExcludingKeysByCategory(
          rankedQuestions,
          excludedKeys,
          "role_fit",
          remaining,
          normalizedRecentQuestionKeys
        );

        juniorSecondary.push(...extraRoleFit);
        excludedKeys = [
          ...excludedKeys,
          ...extraRoleFit.map((item) => item.key)
        ];
      }

      secondaryQuestions.push(...juniorSecondary);
    } else if (shouldForcePressureSignal(interviewContextProfile, pressureRelevanceBand)) {
      const pressureSecondary = pickTopExcludingKeys(
        rankedQuestions,
        excludedKeys,
        secondaryQuestionCount,
        normalizedRecentQuestionKeys
      );

      secondaryQuestions.push(...pressureSecondary);
      excludedKeys = [
        ...excludedKeys,
        ...pressureSecondary.map((item) => item.key)
      ];
    } else {
      const genericSecondary = pickTopExcludingKeys(
        rankedQuestions,
        excludedKeys,
        secondaryQuestionCount,
        normalizedRecentQuestionKeys
      );

      secondaryQuestions.push(...genericSecondary);
      excludedKeys = [
        ...excludedKeys,
        ...genericSecondary.map((item) => item.key)
      ];
    }
  }

  const secondaryQuestionKeys = secondaryQuestions.map((item) => item.key);

  return {
    questionSelectionStrategy: {
      toneMode: normalizeString(interviewContextProfile?.defaultTone) || "standard",
      interviewLengthMode: modeKey,
      recentQuestionKeys: normalizedRecentQuestionKeys,
      mandatoryQuestionKeys,
      seniorityQuestionKeys,
      secondaryQuestionKeys,
      personPerceptionQuestionKeys,
      closingQuestionKeys,
      selectedQuestionKeys: uniqueStrings([
        ...mandatoryQuestionKeys,
        ...seniorityQuestionKeys,
        ...secondaryQuestionKeys,
        ...personPerceptionQuestionKeys,
        ...closingQuestionKeys
      ]),
      selectionRationale: buildSelectionRationale({
        contextProfile: interviewContextProfile,
        interviewLengthMode: modeKey,
        mandatoryQuestions,
        seniorityQuestions,
        secondaryQuestions,
        personPerceptionQuestions,
        closingQuestions,
        recentQuestionKeys: normalizedRecentQuestionKeys
      }),
      metadata: {
        totalRankedCandidates: rankedQuestions.length,
        forcedSeniorityCalibration: shouldForceSeniorityCalibration(
          interviewContextProfile
        ),
        forcedPressureSignal: shouldForcePressureSignal(interviewContextProfile, pressureRelevanceBand),
        juniorMode,
        roleFitRelevanceBand,
        motivationRelevanceBand,
        pressureRelevanceBand,
        decisionRelevanceBand,
        requestedInterviewLengthMode: normalizeString(interviewLengthMode) || "",
        resolvedInterviewLengthMode: modeKey,
        defaultInterviewLengthMode: defaultMode,
        recentQuestionKeyCount: normalizedRecentQuestionKeys.length
      }
    }
  };
}