import { runGroqChatCompletion } from "../../infrastructure/groq/runGroqChatCompletion.js";
import { loadAnswerAnnotationSchema } from "../loadAnswerAnnotationSchema.js";
import { resolveGroqModel, resolveGroqOutputContract } from "../../infrastructure/groq/groqModelCompatibility.js";
import {
  deriveAnswerAnnotationCoachingProviderSchema,
  deriveAnswerAnnotationAnnotationsProviderSchema
} from "../deriveAnswerAnnotationProviderSchema.js";

export async function resolveGroqAnswerAnnotationPromptOptions() {
  const canonicalSchema = await loadAnswerAnnotationSchema();
  const jsonSchema = deriveAnswerAnnotationCoachingProviderSchema(canonicalSchema);
  const contract = resolveGroqOutputContract({
    task: "answerAnnotation",
    model: resolveGroqModel(),
    jsonSchema,
    strictSchemaCompatible: true
  });
  return Object.freeze({ nativeSchemaEnforced: contract.mode === "json_schema" });
}

async function runProjection({ systemPrompt, userPrompt, projection }) {
  const canonicalSchema = await loadAnswerAnnotationSchema();
  const jsonSchema = projection === "coaching"
    ? deriveAnswerAnnotationCoachingProviderSchema(canonicalSchema)
    : deriveAnswerAnnotationAnnotationsProviderSchema(canonicalSchema);
  const result = await runGroqChatCompletion({
    task: "answerAnnotation",
    systemText: systemPrompt,
    userText: userPrompt,
    temperature: 0.2,
    maxRetries: 3,
    retryDelayMs: 2500,
    jsonSchema,
    strictSchemaCompatible: true
  });
  return { model: result.model, rawContent: result.content, outputMode: result.outputMode };
}

export async function runGroqAnswerAnnotationModel({ coachingPrompt, annotationPrompt }) {
  const coaching = await runProjection({ ...coachingPrompt, projection: "coaching" });
  const annotations = await runProjection({ ...annotationPrompt, projection: "annotations" });
  return { task: "answerAnnotation", model: coaching.model, coaching, annotations };
}
