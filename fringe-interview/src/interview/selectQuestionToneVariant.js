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

function buildQuestionMap(structuredQuestionBank) {
  const questions = ensureArray(structuredQuestionBank?.questions);
  const map = new Map();

  for (const question of questions) {
    const key = normalizeString(question?.key);

    if (!key) {
      continue;
    }

    map.set(key, question);
  }

  return map;
}

function resolveVariantForTone(question, requestedTone) {
  const variants = question?.variants || {};
  const normalizedRequestedTone = normalizeString(requestedTone);

  if (
    normalizedRequestedTone &&
    variants[normalizedRequestedTone] &&
    normalizeString(variants[normalizedRequestedTone]?.prompt)
  ) {
    return {
      toneUsed: normalizedRequestedTone,
      source: "tone_variant",
      prompt: normalizeString(variants[normalizedRequestedTone]?.prompt)
    };
  }

  if (variants.standard && normalizeString(variants.standard?.prompt)) {
    return {
      toneUsed: "standard",
      source: "standard_variant",
      prompt: normalizeString(variants.standard?.prompt)
    };
  }

  const firstVariantEntry = Object.entries(variants).find(([, value]) =>
    normalizeString(value?.prompt)
  );

  if (firstVariantEntry) {
    return {
      toneUsed: normalizeString(firstVariantEntry[0]),
      source: "fallback_variant",
      prompt: normalizeString(firstVariantEntry[1]?.prompt)
    };
  }

  return {
    toneUsed: "",
    source: "missing_variant",
    prompt: ""
  };
}

function buildStageEntries(questionSelectionStrategy) {
  const entries = [];

  const stageDefinitions = [
    {
      stage: "mandatory",
      keys: ensureArray(questionSelectionStrategy?.mandatoryQuestionKeys)
    },
    {
      stage: "seniority",
      keys: ensureArray(questionSelectionStrategy?.seniorityQuestionKeys)
    },
    {
      stage: "secondary",
      keys: ensureArray(questionSelectionStrategy?.secondaryQuestionKeys)
    },
    {
      stage: "person_perception",
      keys: ensureArray(questionSelectionStrategy?.personPerceptionQuestionKeys)
    },
    {
      stage: "closing",
      keys: ensureArray(questionSelectionStrategy?.closingQuestionKeys)
    }
  ];

  let order = 1;

  for (const definition of stageDefinitions) {
    for (const key of uniqueStrings(definition.keys)) {
      entries.push({
        key,
        stage: definition.stage,
        stageOrder: order
      });
      order += 1;
    }
  }

  return entries;
}

function humanizeCategory(category) {
  const clean = normalizeString(category);

  if (!clean) {
    return "";
  }

  return clean
    .split("_")
    .map((item) => item.charAt(0).toUpperCase() + item.slice(1))
    .join(" ");
}

export function selectQuestionToneVariant({
  structuredQuestionBank,
  questionSelectionStrategy
}) {
  if (!structuredQuestionBank || typeof structuredQuestionBank !== "object") {
    throw new Error(
      "selectQuestionToneVariant: structuredQuestionBank is required."
    );
  }

  if (!questionSelectionStrategy || typeof questionSelectionStrategy !== "object") {
    throw new Error(
      "selectQuestionToneVariant: questionSelectionStrategy is required."
    );
  }

  const toneMode = normalizeString(questionSelectionStrategy?.toneMode) || "standard";
  const questionMap = buildQuestionMap(structuredQuestionBank);
  const stageEntries = buildStageEntries(questionSelectionStrategy);

  const resolvedQuestions = stageEntries
    .map((entry) => {
      const question = questionMap.get(entry.key);

      if (!question) {
        return null;
      }

      const resolvedVariant = resolveVariantForTone(question, toneMode);
      const prompt = normalizeString(resolvedVariant.prompt);

      if (!prompt) {
        return null;
      }

      return {
        key: normalizeString(question?.key),
        category: normalizeString(question?.category),
        categoryLabel: humanizeCategory(question?.category),
        stage: entry.stage,
        stageOrder: entry.stageOrder,
        prompt,
        question: prompt,
        toneUsed: normalizeString(resolvedVariant.toneUsed),
        source: normalizeString(resolvedVariant.source),
        selectionWeight: normalizeString(question?.selectionWeight),
        signals: ensureArray(question?.signals),
        tags: ensureArray(question?.tags)
      };
    })
    .filter(Boolean);

  return {
    resolvedStructuredQuestions: {
      toneMode,
      questions: resolvedQuestions,
      resolvedQuestions
    }
  };
}