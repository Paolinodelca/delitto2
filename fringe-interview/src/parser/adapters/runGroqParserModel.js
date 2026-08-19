import { runGroqChatCompletion } from "../../infrastructure/groq/runGroqChatCompletion.js";

export async function runGroqParserModel({ task = "unknown", system, user, temperature = 0.2, maxTokens, maxRetries = 2, retryDelayMs = 1200 }) {
  const result = await runGroqChatCompletion({ task, systemText: system, userText: user, temperature, maxTokens, maxRetries, retryDelayMs });
  return { outputText: result.content, meta: { provider: "groq", model: result.model, task, outputMode: result.outputMode, attemptsUsed: result.attemptsUsed } };
}
