import { loadInterviewLengthModes } from "./loadInterviewLengthModes.js";

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

function pickTopByCategory(rankedQuestions, category, limit = 1) {
  return ensureArray(rankedQuestions)
    .filter((item) => normalizeString(item?.category) === category)
    .slice(0, limit);
}

function pickFirstAvailableByCategory(rankedQuestions, category, excludedKeys = []) {
  const excluded = new Set(
    uniqueStrings(excludedKeys).map((item) => item.toLowerCase())
  );

  return (
    ensureArray(rankedQuestions).find((item) => {
      const key = normalizeString(item?.key).toLowerCase();
      return (
        normalizeString(item?.category) === category &&
        key &&
        !excluded.has(key)
      );
    }) || null
  );
}

function pickTopExcludingKeys(rankedQuestions, excludedKeys, limit = 1) {
  const excluded = new Set(
    uniqueStrings(excludedKeys).map((item) => item.toLowerCase())
  );

  return ensureArray(rankedQuestions)
    .filter((item) => !excluded.has(normalizeString(item?.key).toLowerCase()))
    .slice(0, limit);
}

function pickTopExcludingKeysByCategory(
  rankedQuestions,
  excludedKeys,
  category,
  limit = 1
) {
  const excluded = new Set(
    uniqueStrings(excludedKeys).map((item) => item.toLowerCase())
  );

  return ensureArray(rankedQuestions)
    .filter((item) => {
      const key = normalizeString(item?.key).toLowerCase();
      return (
        normalizeString(item?.category) === category &&
        key &&
        !excluded.has(key)
      );
    })
    .slice(0, limit);
}

function shouldForceSeniorityCalibration(interviewContextProfile) {
  const seniorityContext = normalizeString(
    interviewContextProfile?.seniorityContext
  );

  return ["senior", "lead", "executive"].includes(seniorityContext);
}

function shouldForcePressureSignal(interviewContextProfile) {
  const companyContext = normalizeString(interviewContextProfile?.companyContext);
  const toneMode = normalizeString(interviewContextProfile?.defaultTone);

  return (
    companyContext === "consultancy_client_facing" ||
    toneMode === "pressure"
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
  closingQuestions
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
  interviewLengthMode
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
    mandatoryRoleFitCount
  );
  const mandatoryQuestionKeys = mandatoryQuestions.map((item) => item.key);

  const closingQuestions = pickTopByCategory(
    rankedQuestions,
    "closing",
    modeConfig.closingQuestionCount
  );
  const closingQuestionKeys = closingQuestions.map((item) => item.key);

  const personPerceptionQuestions = pickTopByCategory(
    rankedQuestions,
    "person_perception",
    modeConfig.personPerceptionQuestionCount
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
      baseExcludedKeys
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
          1
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
          remaining
        );

        juniorSecondary.push(...extraRoleFit);
        excludedKeys = [
          ...excludedKeys,
          ...extraRoleFit.map((item) => item.key)
        ];
      }

      secondaryQuestions.push(...juniorSecondary);
    } else if (shouldForcePressureSignal(interviewContextProfile)) {
      const pressureSecondary = pickTopExcludingKeys(
        rankedQuestions,
        excludedKeys,
        secondaryQuestionCount
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
        secondaryQuestionCount
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
        closingQuestions
      }),
      metadata: {
        totalRankedCandidates: rankedQuestions.length,
        forcedSeniorityCalibration: shouldForceSeniorityCalibration(
          interviewContextProfile
        ),
        forcedPressureSignal: shouldForcePressureSignal(
          interviewContextProfile
        ),
        juniorMode,
        requestedInterviewLengthMode: normalizeString(interviewLengthMode) || "",
        resolvedInterviewLengthMode: modeKey,
        defaultInterviewLengthMode: defaultMode
      }
    }
  };
}