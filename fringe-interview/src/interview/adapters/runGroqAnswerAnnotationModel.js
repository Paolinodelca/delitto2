import { runGroqChatCompletion } from "../../infrastructure/groq/runGroqChatCompletion.js";
import { loadAnswerAnnotationSchema } from "../loadAnswerAnnotationSchema.js";

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
