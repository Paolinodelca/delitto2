import { readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

import { getActiveLocale, getFallbackLocale } from "../i18n/getAppLocale.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function resolveProjectPath(...segments) {
  return path.resolve(__dirname, "..", "..", ...segments);
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function ensureStringArray(value, fieldName, questionKey) {
  if (!Array.isArray(value)) {
    throw new Error(
      `loadStructuredQuestionBank: question "${questionKey}" has invalid "${fieldName}" (expected array).`
    );
  }

  return value
    .filter((item) => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeQuestionVariants(value, questionKey) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(
      `loadStructuredQuestionBank: question "${questionKey}" has invalid "variants" (expected object).`
    );
  }

  const normalizedEntries = Object.entries(value)
    .filter(([variantKey, variantValue]) => {
      return (
        isNonEmptyString(variantKey) &&
        variantValue &&
        typeof variantValue === "object" &&
        !Array.isArray(variantValue) &&
        isNonEmptyString(variantValue.prompt)
      );
    })
    .map(([variantKey, variantValue]) => {
      return [
        variantKey.trim(),
        {
          prompt: variantValue.prompt.trim()
        }
      ];
    });

  const variantObject = Object.fromEntries(normalizedEntries);

  if (!variantObject.standard || !isNonEmptyString(variantObject.standard.prompt)) {
    throw new Error(
      `loadStructuredQuestionBank: question "${questionKey}" must include a valid "standard" variant.`
    );
  }

  return variantObject;
}

function normalizeStructuredQuestion(rawQuestion) {
  if (!rawQuestion || typeof rawQuestion !== "object" || Array.isArray(rawQuestion)) {
    throw new Error(
      "loadStructuredQuestionBank: invalid question object (expected object)."
    );
  }

  const questionKey = isNonEmptyString(rawQuestion.key)
    ? rawQuestion.key.trim()
    : "unknown_question";

  if (!isNonEmptyString(rawQuestion.key)) {
    throw new Error(
      'loadStructuredQuestionBank: question is missing valid "key".'
    );
  }

  if (!isNonEmptyString(rawQuestion.category)) {
    throw new Error(
      `loadStructuredQuestionBank: question "${questionKey}" is missing valid "category".`
    );
  }

  if (!isNonEmptyString(rawQuestion.intent)) {
    throw new Error(
      `loadStructuredQuestionBank: question "${questionKey}" is missing valid "intent".`
    );
  }

  if (!isNonEmptyString(rawQuestion.selectionWeight)) {
    throw new Error(
      `loadStructuredQuestionBank: question "${questionKey}" is missing valid "selectionWeight".`
    );
  }

  return {
    key: rawQuestion.key.trim(),
    category: rawQuestion.category.trim(),
    intent: rawQuestion.intent.trim(),
    signals: ensureStringArray(rawQuestion.signals, "signals", questionKey),
    senioritySuitability: ensureStringArray(
      rawQuestion.senioritySuitability,
      "senioritySuitability",
      questionKey
    ),
    companyContextSuitability: ensureStringArray(
      rawQuestion.companyContextSuitability,
      "companyContextSuitability",
      questionKey
    ),
    toneSuitability: ensureStringArray(
      rawQuestion.toneSuitability,
      "toneSuitability",
      questionKey
    ),
    selectionWeight: rawQuestion.selectionWeight.trim(),
    variants: normalizeQuestionVariants(rawQuestion.variants, questionKey),
    tags: Array.isArray(rawQuestion.tags)
      ? rawQuestion.tags
          .filter((item) => typeof item === "string")
          .map((item) => item.trim())
          .filter(Boolean)
      : [],
    metadata:
      rawQuestion.metadata &&
      typeof rawQuestion.metadata === "object" &&
      !Array.isArray(rawQuestion.metadata)
        ? rawQuestion.metadata
        : {},
    extensions:
      rawQuestion.extensions &&
      typeof rawQuestion.extensions === "object" &&
      !Array.isArray(rawQuestion.extensions)
        ? rawQuestion.extensions
        : {}
  };
}

function readAndParseJson(filePath) {
  try {
    const raw = readFileSync(filePath, "utf8");
    return JSON.parse(raw);
  } catch (error) {
    throw new Error(
      `loadStructuredQuestionBank: failed to read or parse "${filePath}" (${error.message}).`
    );
  }
}

function resolveCandidatePaths() {
  const activeLocale = getActiveLocale();
  const fallbackLocale = getFallbackLocale();

  const candidates = [];

  if (activeLocale && activeLocale !== "en") {
    candidates.push({
      locale: activeLocale,
      path: resolveProjectPath("config", `question_bank_v2.${activeLocale}.json`)
    });
  }

  if (
    fallbackLocale &&
    fallbackLocale !== "en" &&
    fallbackLocale !== activeLocale
  ) {
    candidates.push({
      locale: fallbackLocale,
      path: resolveProjectPath("config", `question_bank_v2.${fallbackLocale}.json`)
    });
  }

  candidates.push({
    locale: "en",
    path: resolveProjectPath("config", "question_bank_v2.json")
  });

  return candidates;
}

function loadRawStructuredQuestionBank() {
  const candidates = resolveCandidatePaths();
  const errors = [];

  for (const candidate of candidates) {
    try {
      const parsed = readAndParseJson(candidate.path);
      return {
        parsed,
        resolvedLocale: candidate.locale,
        sourcePath: candidate.path
      };
    } catch (error) {
      errors.push(error.message);
    }
  }

  throw new Error(
    `loadStructuredQuestionBank: failed to load any structured question bank. ${errors.join(" | ")}`
  );
}

export function loadStructuredQuestionBank() {
  const { parsed, resolvedLocale, sourcePath } = loadRawStructuredQuestionBank();

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error(
      "loadStructuredQuestionBank: invalid top-level structure (expected object)."
    );
  }

  if (typeof parsed.version !== "number" || !Number.isFinite(parsed.version)) {
    throw new Error(
      'loadStructuredQuestionBank: missing or invalid top-level "version".'
    );
  }

  if (!Array.isArray(parsed.questions)) {
    throw new Error(
      'loadStructuredQuestionBank: missing or invalid top-level "questions" array.'
    );
  }

  const normalizedQuestions = parsed.questions.map((question) =>
    normalizeStructuredQuestion(question)
  );

  const seenKeys = new Set();

  for (const question of normalizedQuestions) {
    if (seenKeys.has(question.key)) {
      throw new Error(
        `loadStructuredQuestionBank: duplicate question key "${question.key}".`
      );
    }

    seenKeys.add(question.key);
  }

  return {
    structuredQuestionBank: {
      version: parsed.version,
      locale: resolvedLocale,
      sourcePath,
      questions: normalizedQuestions
    }
  };
}