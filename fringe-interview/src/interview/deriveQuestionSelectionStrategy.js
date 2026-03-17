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

function buildSelectionRationale({
  contextProfile,
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

export function deriveQuestionSelectionStrategy({
  interviewContextProfile,
  rankedStructuredQuestions
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

  const mandatoryRoleFitLimit = juniorMode ? 1 : 2;
  const mandatoryQuestions = pickTopByCategory(
    rankedQuestions,
    "role_fit",
    mandatoryRoleFitLimit
  );
  const mandatoryQuestionKeys = mandatoryQuestions.map((item) => item.key);

  const closingQuestions = pickTopByCategory(rankedQuestions, "closing", 1);
  const closingQuestionKeys = closingQuestions.map((item) => item.key);

  const personPerceptionQuestions = pickTopByCategory(
    rankedQuestions,
    "person_perception",
    1
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

  if (shouldForceSeniorityCalibration(interviewContextProfile)) {
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

  if (juniorMode) {
    const juniorCalibrationPick = pickFirstAvailableByCategory(
      rankedQuestions,
      "seniority_calibration",
      excludedKeys
    );

    if (juniorCalibrationPick) {
      secondaryQuestions.push(juniorCalibrationPick);
      excludedKeys = [...excludedKeys, juniorCalibrationPick.key];
    }

    const extraRoleFitPick = pickTopExcludingKeys(rankedQuestions, excludedKeys, 1)
      .filter((item) => normalizeString(item?.category) === "role_fit");

    if (extraRoleFitPick.length > 0) {
      secondaryQuestions.push(...extraRoleFitPick);
      excludedKeys = [
        ...excludedKeys,
        ...extraRoleFitPick.map((item) => item.key)
      ];
    }
  } else if (shouldForcePressureSignal(interviewContextProfile)) {
    const pressurePick = pickTopExcludingKeys(rankedQuestions, excludedKeys, 1);
    if (pressurePick.length > 0) {
      secondaryQuestions.push(...pressurePick);
      excludedKeys = [
        ...excludedKeys,
        ...pressurePick.map((item) => item.key)
      ];
    }
  } else {
    const genericSecondary = pickTopExcludingKeys(rankedQuestions, excludedKeys, 1);
    if (genericSecondary.length > 0) {
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
        juniorMode
      }
    }
  };
}