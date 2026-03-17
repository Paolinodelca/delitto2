function ensureArray(value) {
  return Array.isArray(value) ? value : [];
}

function normalizeString(value) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

function buildQuestionLookup(structuredQuestionBank) {
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

function resolvePromptFromQuestion(question, requestedTone) {
  const variants = question?.variants && typeof question.variants === "object"
    ? question.variants
    : {};

  const requestedToneKey = normalizeString(requestedTone);
  const requestedVariant = variants[requestedToneKey];

  if (requestedVariant && normalizeString(requestedVariant.prompt)) {
    return {
      prompt: normalizeString(requestedVariant.prompt),
      toneUsed: requestedToneKey,
      resolutionSource: "tone_variant"
    };
  }

  const standardVariant = variants.standard;

  if (standardVariant && normalizeString(standardVariant.prompt)) {
    return {
      prompt: normalizeString(standardVariant.prompt),
      toneUsed: requestedToneKey || "standard",
      resolutionSource: "standard_variant"
    };
  }

  if (normalizeString(question?.prompt)) {
    return {
      prompt: normalizeString(question.prompt),
      toneUsed: requestedToneKey || "standard",
      resolutionSource: "base_prompt"
    };
  }

  return null;
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

  const requestedTone = normalizeString(questionSelectionStrategy?.toneMode) || "standard";
  const selectedQuestionKeys = ensureArray(
    questionSelectionStrategy?.selectedQuestionKeys
  )
    .map((item) => normalizeString(item))
    .filter(Boolean);

  const questionLookup = buildQuestionLookup(structuredQuestionBank);

  const resolvedQuestions = [];
  const missingKeys = [];

  for (const key of selectedQuestionKeys) {
    const question = questionLookup.get(key);

    if (!question) {
      missingKeys.push(key);
      continue;
    }

    const resolved = resolvePromptFromQuestion(question, requestedTone);

    if (!resolved) {
      missingKeys.push(key);
      continue;
    }

    resolvedQuestions.push({
      key: normalizeString(question?.key),
      category: normalizeString(question?.category),
      prompt: resolved.prompt,
      toneUsed: resolved.toneUsed,
      resolutionSource: resolved.resolutionSource
    });
  }

  return {
    resolvedStructuredQuestions: {
      resolvedQuestions,
      metadata: {
        requestedTone,
        resolvedCount: resolvedQuestions.length,
        missingKeys
      }
    }
  };
}