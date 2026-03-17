import { buildAnswerAnnotationPrompt } from "./buildAnswerAnnotationPrompt.js";
import { runGroqAnswerAnnotationModel } from "./adapters/runGroqAnswerAnnotationModel.js";
import { extractJsonObject } from "../parser/extractJsonObject.js";
import { normalizeAnswerAnnotation } from "./normalizeAnswerAnnotation.js";

export async function runAnswerAnnotation({
  answerId,
  questionLabel,
  questionPrompt,
  answerText,
  reviewMode = "interview"
}) {
  const { answerAnnotationPrompt } = await buildAnswerAnnotationPrompt({
    answerId,
    questionLabel,
    questionPrompt,
    answerText,
    reviewMode
  });

  const modelResult = await runGroqAnswerAnnotationModel({
    task: "answerAnnotation",
    systemPrompt: answerAnnotationPrompt.systemPrompt,
    userPrompt: answerAnnotationPrompt.userPrompt
  });

  const parsed = extractJsonObject(modelResult.rawContent);

  if (!parsed || typeof parsed !== "object" || !parsed.answerAnnotation) {
    throw new Error(
      "runAnswerAnnotation: model output did not contain a valid answerAnnotation object."
    );
  }

  const normalized = normalizeAnswerAnnotation(parsed);

  return {
    answerAnnotation: normalized.answerAnnotation,
    meta: {
      task: "answerAnnotation",
      locale: answerAnnotationPrompt.locale,
      model: modelResult.model
    }
  };
}