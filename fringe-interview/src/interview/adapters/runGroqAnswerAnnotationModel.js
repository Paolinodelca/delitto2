import { runGroqChatCompletion } from "../../infrastructure/groq/runGroqChatCompletion.js";
export async function runGroqAnswerAnnotationModel({ systemPrompt, userPrompt, task = "answerAnnotation" }) {
  const result = await runGroqChatCompletion({ task, systemText: systemPrompt, userText: userPrompt, temperature: 0.2, maxRetries: 3, retryDelayMs: 2500 });
  return { task, model: result.model, rawContent: result.content, outputMode: result.outputMode };
}
