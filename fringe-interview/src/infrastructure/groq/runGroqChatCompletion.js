import { setTimeout as delay } from "timers/promises";
import { GROQ_CHAT_COMPLETIONS_URL, buildGroqRequestBody, resolveGroqModel } from "./groqModelCompatibility.js";

function requiredApiKey() {
  const value = process.env.GROQ_API_KEY?.trim();
  if (!value) throw new Error("Groq provider: missing GROQ_API_KEY environment variable.");
  return value;
}
function retryable(status) { return [429, 500, 502, 503, 504].includes(status); }

function coarseFailureKind(status, providerMessage = "") {
  const message = providerMessage.toLowerCase();
  if (status === 429) return "rate_limit";
  if (status >= 500) return "provider_unavailable";
  if (status === 400 && /json|schema|structured/.test(message)) return "structured_output_rejected";
  if (status === 400) return "invalid_request";
  if (status === 401 || status === 403) return "provider_auth_or_permission";
  return "provider_request_failed";
}

function safeProviderMessage(status, message = "") {
  const normalized = typeof message === "string" ? message.replace(/\s+/g, " ").trim() : "";
  if (!normalized) return null;
  if (/generated json does not match|json.*schema|structured output/i.test(normalized)) return "Provider rejected generated structured output.";
  if (/rate limit|too many requests/i.test(normalized)) return "Provider rate limit reached.";
  if (/model.*(not found|decommissioned|blocked|permission)/i.test(normalized)) return "Provider rejected the configured model or model permission.";
  if (/invalid.*(request|parameter)|unsupported.*parameter/i.test(normalized)) return "Provider rejected request parameters.";
  return status === 400 ? "Provider rejected the request." : "Provider request failed.";
}

export function parseSafeGroqErrorDiagnostic({ rawText = "", status, task, model, retryAfter = null } = {}) {
  let envelope = null;
  try { envelope = JSON.parse(rawText); } catch { /* deliberately discard unstructured body */ }
  const providerError = envelope && typeof envelope.error === "object" ? envelope.error : {};
  const code = typeof providerError.code === "string" || typeof providerError.code === "number" ? String(providerError.code).slice(0, 80) : null;
  const type = typeof providerError.type === "string" ? providerError.type.slice(0, 80) : null;
  const rawMessage = typeof providerError.message === "string" ? providerError.message : "";
  return Object.freeze({
    task,
    model,
    status,
    providerCode: code,
    providerType: type,
    providerMessage: safeProviderMessage(status, rawMessage),
    retryAfter: retryAfter ? String(retryAfter).slice(0, 40) : null,
    failureKind: coarseFailureKind(status, rawMessage)
  });
}

export async function runGroqChatCompletion({ task = "unknown", systemText, userText, temperature = 0.2, maxTokens, maxRetries = 2, retryDelayMs = 1200, jsonSchema = null, strictSchemaCompatible = false } = {}) {
  if (!systemText?.trim() || !userText?.trim()) throw new Error("Groq provider: systemText and userText are required.");
  const apiKey = requiredApiKey();
  const model = resolveGroqModel();
  const { body, contract } = buildGroqRequestBody({ task, model, systemText: systemText.trim(), userText: userText.trim(), temperature, maxTokens, jsonSchema, strictSchemaCompatible });
  for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
    const response = await fetch(GROQ_CHAT_COMPLETIONS_URL, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` }, body: JSON.stringify(body) });
    const rawText = await response.text().catch(() => "");
    if (!response.ok) {
      const diagnostic = parseSafeGroqErrorDiagnostic({ rawText, status: response.status, task, model, retryAfter: response.headers?.get?.("retry-after") || null });
      const error = new Error(`Groq provider request failed for ${task} with status ${response.status}.`);
      error.status = response.status; error.model = model; error.task = task; error.providerDiagnostic = diagnostic;
      if (retryable(response.status) && attempt < maxRetries) {
        const retryAfterSeconds = Number(diagnostic.retryAfter);
        const waitMs = Number.isFinite(retryAfterSeconds) && retryAfterSeconds >= 0 ? retryAfterSeconds * 1000 : retryDelayMs * (attempt + 1);
        await delay(waitMs); continue;
      }
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
