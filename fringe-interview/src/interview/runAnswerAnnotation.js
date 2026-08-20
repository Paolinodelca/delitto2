import { buildAnswerAnnotationPrompt } from "./buildAnswerAnnotationPrompt.js";
import { resolveGroqAnswerAnnotationPromptOptions, runGroqAnswerAnnotationModel } from "./adapters/runGroqAnswerAnnotationModel.js";
import { extractJsonObject } from "../parser/extractJsonObject.js";
import { normalizeAnswerAnnotation } from "./normalizeAnswerAnnotation.js";

const COACHING_FIELDS = ["summary", "tags", "strengths", "weaknesses", "coachTip", "upgradeSuggestion", "improvedAnswerDraft"];

export async function runAnswerAnnotation({
  answerId,
  questionLabel,
  questionPrompt,
  answerText,
  reviewMode = "interview"
}) {
  const promptOptions = await resolveGroqAnswerAnnotationPromptOptions();
  const prompts = await buildAnswerAnnotationPrompt({
    answerId, questionLabel, questionPrompt, answerText, reviewMode, ...promptOptions
  });

  const modelResult = await runGroqAnswerAnnotationModel({
    coachingPrompt: prompts.coachingPrompt,
    annotationPrompt: prompts.annotationPrompt
  });

  const coachingParsed = extractJsonObject(modelResult.coaching.rawContent);
  const annotationParsed = extractJsonObject(modelResult.annotations.rawContent);
  const coaching = coachingParsed?.answerAnnotation;
  const annotations = annotationParsed?.answerAnnotation;
  if (!coaching || !annotations) {
    throw new Error("runAnswerAnnotation: composed provider output did not contain valid answerAnnotation objects.");
  }

  const composed = {
    answerAnnotation: {
      answerId,
      questionLabel,
      questionPrompt,
      answerText,
      reviewMode,
      ...Object.fromEntries(COACHING_FIELDS.map((field) => [field, coaching[field]])),
      annotations: annotations.annotations
    }
  };
  const normalized = normalizeAnswerAnnotation(composed);
  return {
    answerAnnotation: normalized.answerAnnotation,
    meta: { task: "answerAnnotation", locale: prompts.answerAnnotationPrompt.locale, model: modelResult.model, providerCallCount: 2 }
  };
}
