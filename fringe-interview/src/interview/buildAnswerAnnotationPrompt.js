import { loadAnswerAnnotationSchema } from "./loadAnswerAnnotationSchema.js";
import { getAppLocaleConfig } from "../i18n/getAppLocale.js";

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
  reviewMode = "interview"
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

  const schema = await loadAnswerAnnotationSchema();
  const locale = getActiveLocale();

  const systemPrompt = [
    "You are an expert answer-review annotation engine.",
    "Your task is to analyze one candidate answer and produce exactly one JSON object matching the provided schema.",
    "Do not include markdown fences.",
    "Do not include explanations outside JSON.",
    "Annotations should be selective, useful, and suitable for a coaching UI.",
    "Prefer meaningful text spans instead of isolated single words when possible.",
    "Every annotation excerpt must match the original answerText exactly.",
    "The start and end positions must be consistent with the excerpt inside answerText.",
    "Do not invent facts, metrics, outcomes, impacts, or consequences that are not supported by answerText.",
    "If you provide improvedAnswerDraft, it must only reorganize, clarify, compress, or strengthen what is already supported by answerText.",
    "Do not add unsupported business effects, numerical improvements, or inferred achievements.",
    "If no safe improvedAnswerDraft can be provided without adding new facts, set improvedAnswerDraft.isProvided to false and improvedAnswerDraft.text to an empty string.",
    "Keep strengths and weaknesses practical and concise.",
    "Keep coachTip and upgradeSuggestion directly usable.",
    buildLanguageInstruction(locale)
  ].join(" ");

  const userPrompt = [
    "Return one JSON object matching this schema:",
    safeJsonStringify(schema),
    "",
    "Analyze this answer:",
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
    "Important rules:",
    "- Fill all required fields.",
    "- Keep answerId, questionLabel, questionPrompt, answerText, and reviewMode aligned with input.",
    "- Use annotation spans with start/end positions consistent with answerText.",
    "- Keep annotations selective and useful.",
    "- Use strengths, weaknesses, coachTip, and upgradeSuggestion for practical coaching.",
    "- Do not invent facts not present in answerText.",
    "- improvedAnswerDraft must stay faithful to the original evidence."
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