import { setTimeout as delay } from "timers/promises";
import { GROQ_CHAT_COMPLETIONS_URL, buildGroqRequestBody, resolveGroqModel } from "./groqModelCompatibility.js";

function requiredApiKey() {
  const value = process.env.GROQ_API_KEY?.trim();
  if (!value) throw new Error("Groq provider: missing GROQ_API_KEY environment variable.");
  return value;
}
function retryable(status) { return [429, 500, 502, 503, 504].includes(status); }

export async function runGroqChatCompletion({ task = "unknown", systemText, userText, temperature = 0.2, maxTokens, maxRetries = 2, retryDelayMs = 1200, jsonSchema = null, strictSchemaCompatible = false } = {}) {
  if (!systemText?.trim() || !userText?.trim()) throw new Error("Groq provider: systemText and userText are required.");
  const apiKey = requiredApiKey();
  const model = resolveGroqModel();
  const { body, contract } = buildGroqRequestBody({ task, model, systemText: systemText.trim(), userText: userText.trim(), temperature, maxTokens, jsonSchema, strictSchemaCompatible });
  for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
    const response = await fetch(GROQ_CHAT_COMPLETIONS_URL, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` }, body: JSON.stringify(body) });
    const rawText = await response.text().catch(() => "");
    if (!response.ok) {
      const error = new Error(`Groq provider request failed for ${task} with status ${response.status}.`);
      error.status = response.status; error.model = model; error.task = task;
      if (retryable(response.status) && attempt < maxRetries) { await delay(retryDelayMs * (attempt + 1)); continue; }
      throw error;
    }
    let data;
    try { data = JSON.parse(rawText); } catch { throw new Error(`Groq provider returned an invalid response envelope for ${task}.`); }
    const content = data?.choices?.[0]?.message?.content;
    if (typeof content !== "string" || !content.trim()) throw new Error(`Groq provider returned empty model content for ${task}.`);
    return { content: content.trim(), model, task, outputMode: contract.mode, attemptsUsed: attempt + 1 };
  }
  throw new Error(`Groq provider request failed for ${task}.`);
}
