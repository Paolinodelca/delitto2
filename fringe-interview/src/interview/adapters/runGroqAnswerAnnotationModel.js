import { runGroqChatCompletion } from "../../infrastructure/groq/runGroqChatCompletion.js";
import { loadAnswerAnnotationSchema } from "../loadAnswerAnnotationSchema.js";
import { resolveGroqModel, resolveGroqOutputContract } from "../../infrastructure/groq/groqModelCompatibility.js";

export async function resolveGroqAnswerAnnotationPromptOptions() {
  const jsonSchema = await loadAnswerAnnotationSchema();
  const contract = resolveGroqOutputContract({
    task: "answerAnnotation",
    model: resolveGroqModel(),
    jsonSchema,
    strictSchemaCompatible: true
  });
  return Object.freeze({ nativeSchemaEnforced: contract.mode === "json_schema" });
}

export async function runGroqAnswerAnnotationModel({ systemPrompt, userPrompt, task = "answerAnnotation" }) {
  const jsonSchema = await loadAnswerAnnotationSchema();
  const result = await runGroqChatCompletion({
    task,
    systemText: systemPrompt,
    userText: userPrompt,
    temperature: 0.2,
    maxRetries: 3,
    retryDelayMs: 2500,
    jsonSchema,
    strictSchemaCompatible: true
  });
  return { task, model: result.model, rawContent: result.content, outputMode: result.outputMode };
}
