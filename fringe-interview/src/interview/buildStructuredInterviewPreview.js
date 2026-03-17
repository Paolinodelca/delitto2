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

function buildQuestionLookup(resolvedStructuredQuestions) {
  const map = new Map();

  for (const item of ensureArray(resolvedStructuredQuestions?.resolvedQuestions)) {
    const key = normalizeString(item?.key);

    if (!key) {
      continue;
    }

    map.set(key, item);
  }

  return map;
}

function buildPreviewTimeline(questionSelectionStrategy, resolvedStructuredQuestions) {
  const lookup = buildQuestionLookup(resolvedStructuredQuestions);

  const orderedKeys = uniqueStrings([
    ...ensureArray(questionSelectionStrategy?.mandatoryQuestionKeys),
    ...ensureArray(questionSelectionStrategy?.seniorityQuestionKeys),
    ...ensureArray(questionSelectionStrategy?.secondaryQuestionKeys),
    ...ensureArray(questionSelectionStrategy?.personPerceptionQuestionKeys),
    ...ensureArray(questionSelectionStrategy?.closingQuestionKeys)
  ]);

  return orderedKeys
    .map((key, index) => {
      const resolved = lookup.get(key);

      if (!resolved) {
        return null;
      }

      let stage = "core";

      if (ensureArray(questionSelectionStrategy?.mandatoryQuestionKeys).includes(key)) {
        stage = "mandatory";
      } else if (ensureArray(questionSelectionStrategy?.seniorityQuestionKeys).includes(key)) {
        stage = "seniority";
      } else if (ensureArray(questionSelectionStrategy?.secondaryQuestionKeys).includes(key)) {
        stage = "secondary";
      } else if (
        ensureArray(questionSelectionStrategy?.personPerceptionQuestionKeys).includes(key)
      ) {
        stage = "person_perception";
      } else if (ensureArray(questionSelectionStrategy?.closingQuestionKeys).includes(key)) {
        stage = "closing";
      }

      return {
        order: index + 1,
        key: resolved.key,
        category: resolved.category,
        stage,
        toneUsed: resolved.toneUsed,
        resolutionSource: resolved.resolutionSource,
        prompt: resolved.prompt
      };
    })
    .filter(Boolean);
}

function buildPreviewSummary({
  interviewContextProfile,
  questionSelectionStrategy,
  previewTimeline
}) {
  return {
    seniorityContext: normalizeString(interviewContextProfile?.seniorityContext),
    companyContext: normalizeString(interviewContextProfile?.companyContext),
    toneMode: normalizeString(questionSelectionStrategy?.toneMode),
    totalQuestions: previewTimeline.length,
    mandatoryCount: ensureArray(questionSelectionStrategy?.mandatoryQuestionKeys).length,
    seniorityCount: ensureArray(questionSelectionStrategy?.seniorityQuestionKeys).length,
    secondaryCount: ensureArray(questionSelectionStrategy?.secondaryQuestionKeys).length,
    personPerceptionCount: ensureArray(
      questionSelectionStrategy?.personPerceptionQuestionKeys
    ).length,
    closingCount: ensureArray(questionSelectionStrategy?.closingQuestionKeys).length
  };
}

export function buildStructuredInterviewPreview({
  interviewContextProfile,
  questionSelectionStrategy,
  resolvedStructuredQuestions
}) {
  if (!interviewContextProfile || typeof interviewContextProfile !== "object") {
    throw new Error(
      "buildStructuredInterviewPreview: interviewContextProfile is required."
    );
  }

  if (!questionSelectionStrategy || typeof questionSelectionStrategy !== "object") {
    throw new Error(
      "buildStructuredInterviewPreview: questionSelectionStrategy is required."
    );
  }

  if (!resolvedStructuredQuestions || typeof resolvedStructuredQuestions !== "object") {
    throw new Error(
      "buildStructuredInterviewPreview: resolvedStructuredQuestions is required."
    );
  }

  const previewTimeline = buildPreviewTimeline(
    questionSelectionStrategy,
    resolvedStructuredQuestions
  );

  return {
    structuredInterviewPreview: {
      summary: buildPreviewSummary({
        interviewContextProfile,
        questionSelectionStrategy,
        previewTimeline
      }),
      interviewContextProfile,
      questionSelectionStrategy,
      previewTimeline
    }
  };
}