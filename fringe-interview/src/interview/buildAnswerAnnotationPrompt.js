import { loadAnswerAnnotationSchema } from "./loadAnswerAnnotationSchema.js";
import { getAppLocaleConfig } from "../i18n/getAppLocale.js";
import { deriveAnswerAnnotationProviderSchema } from "./deriveAnswerAnnotationProviderSchema.js";

function normalizeString(value) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

function safeJsonStringify(value) {
  return JSON.stringify(value, null, 2);
}

function getActiveLocale() {
  const config = getAppLocaleConfig();

  if (typeof config?.defaultLocale === "string" && config.defaultLocale.trim()) {
    return config.defaultLocale.trim();
  }

  return "en";
}

function buildLanguageInstruction(locale) {
  if (locale === "it") {
    return [
      "Scrivi tutti i campi testuali dell'output in italiano.",
      "Mantieni i nomi delle chiavi JSON invariati."
    ].join(" ");
  }

  return [
    "Write all textual output fields in English.",
    "Keep JSON key names unchanged."
  ].join(" ");
}

export async function buildAnswerAnnotationPrompt({
  answerId,
  questionLabel,
  questionPrompt,
  answerText,
  reviewMode = "interview",
  nativeSchemaEnforced = false
}) {
  const cleanAnswerId = normalizeString(answerId);
  const cleanQuestionLabel = normalizeString(questionLabel);
  const cleanQuestionPrompt = normalizeString(questionPrompt);
  const cleanAnswerText = normalizeString(answerText);
  const cleanReviewMode = normalizeString(reviewMode) || "interview";

  if (!cleanAnswerId) {
    throw new Error("buildAnswerAnnotationPrompt: answerId is required.");
  }

  if (!cleanQuestionLabel) {
    throw new Error("buildAnswerAnnotationPrompt: questionLabel is required.");
  }

  if (!cleanQuestionPrompt) {
    throw new Error("buildAnswerAnnotationPrompt: questionPrompt is required.");
  }

  if (!cleanAnswerText) {
    throw new Error("buildAnswerAnnotationPrompt: answerText is required.");
  }

  const schema = nativeSchemaEnforced ? null : deriveAnswerAnnotationProviderSchema(await loadAnswerAnnotationSchema());
  const locale = getActiveLocale();

  const systemPrompt = [
    "You are an expert interview-coaching annotation engine.",
    nativeSchemaEnforced
      ? "Analyze exactly one candidate answer and populate the provider-enforced structured Answer Annotation output."
      : "Analyze exactly one candidate answer and return one JSON object matching the supplied provider schema.",
    "Evaluate the answer relative to the actual questionPrompt.",
    "Stay faithful to answerText. Do not invent facts, metrics, outcomes, impacts, causes, leadership, ownership, achievements, or consequences that are not explicitly supported.",
    "Classify meaningful passages as strength, evidence, weakness, or opportunity according to the existing coaching semantics.",
    "Every excerpt must match the original answerText exactly and be copied verbatim; do not calculate character offsets or return start/end because application code resolves them deterministically.",
    "Prefer 3 to 6 annotations when the answer contains enough meaningful material, focusing on the passages that matter most for coaching.",
    "Avoid overlapping annotations and avoid ambiguous very-short excerpts when a more distinctive exact passage is available.",
    "Always populate every required Answer Annotation section before completing the response: summary, tags, annotations, strengths, weaknesses, coachTip, upgradeSuggestion, and improvedAnswerDraft.",
    "tags, strengths, and weaknesses may be empty arrays when no meaningful supported content exists, but the properties must still be returned.",
    "coachTip and upgradeSuggestion must always be returned as concise, evidence-faithful objects.",
    "improvedAnswerDraft must always be returned; if no safe improved draft can be provided, set isProvided to false and text to an empty string.",
    "Strengths and weaknesses must summarize the most useful coaching signals in practical interview terms when supported.",
    "coachTip must be actionable for the next attempt, and upgradeSuggestion must describe a concrete improvement objective and instruction.",
    "If improvedAnswerDraft is provided, only reorganize, clarify, compress, or strengthen content already supported by answerText.",
    buildLanguageInstruction(locale)
  ].join(" ");

  const structuralInstructions = nativeSchemaEnforced
    ? []
    : ["Return one JSON object matching this provider schema:", safeJsonStringify(schema)];

  const userPrompt = [
    ...structuralInstructions,
    ...(structuralInstructions.length ? [""] : []),
    "Analyze this candidate answer:",
    safeJsonStringify({
      answerAnnotationInput: {
        answerId: cleanAnswerId,
        questionLabel: cleanQuestionLabel,
        questionPrompt: cleanQuestionPrompt,
        answerText: cleanAnswerText,
        reviewMode: cleanReviewMode
      }
    }),
    "",
    "Semantic requirements:",
    "- Keep the review aligned to questionPrompt and answerText.",
    "- Use strength for passages that materially improve credibility or answer quality.",
    "- Use evidence for passages that provide concrete support, facts, examples, or outcomes.",
    "- Use weakness for passages that materially reduce clarity, specificity, evidence, ownership, structure, or relevance.",
    "- Use opportunity for passages that contain something useful but need strengthening or a clearer link to the question.",
    "- Copy every annotation excerpt verbatim from answerText; never calculate start/end.",
    "- Prefer a small set of meaningful non-overlapping annotations; 3 to 6 is preferred when the answer supports it.",
    "- Do not invent unsupported information.",
    "- Preserve useful strengths, weaknesses, coachTip, upgradeSuggestion, and an evidence-faithful improvedAnswerDraft when safe."
  ].join("\n");

  return {
    answerAnnotationPrompt: {
      task: "answerAnnotation",
      locale,
      systemPrompt,
      userPrompt
    }
  };
}